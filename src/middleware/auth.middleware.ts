import { Context, Next } from 'hono';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define user type
export interface AuthUser extends JwtPayload {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

/**
 * Authentication middleware - validates JWT token
 * Extracts user from token and sets it in context
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    try {
      const payload = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'secret'
      ) as AuthUser;

      // Validate required fields
      if (!payload.id || !payload.email || !payload.role) {
        return c.json({ error: 'Invalid token payload' }, 401);
      }

      c.set('user', payload);
      await next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return c.json({ error: 'Token expired' }, 401);
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return c.json({ error: 'Invalid token' }, 401);
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

/**
 * Role-based access control middleware
 * Only allows users with specified roles to proceed
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const user = c.get('user') as AuthUser | undefined;

      if (!user) {
        return c.json({ error: 'User not found in context' }, 401);
      }

      if (!allowedRoles.includes(user.role)) {
        return c.json(
          { error: `Forbidden - Required roles: ${allowedRoles.join(', ')}` },
          403
        );
      }

      await next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return c.json({ error: 'Authorization check failed' }, 500);
    }
  };
};

/**
 * Optional middleware - validates token but doesn't reject if missing
 * Useful for endpoints that work both authenticated and unauthenticated
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();

      try {
        const payload = jwt.verify(
          token,
          process.env.JWT_SECRET || 'secret'
        ) as AuthUser;

        c.set('user', payload);
      } catch (jwtError) {
        // Token is invalid but we don't reject, just continue without user
        console.warn('Invalid token provided:', jwtError);
      }
    }

    await next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    await next(); // Continue without user on error
  }
};