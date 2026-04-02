import { Context } from 'hono';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const googleLogin = async (c: Context) => {
  try {
    const { idToken } = await c.req.json();

    // Verify Google token
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${idToken}`
    );

    const { email, given_name, family_name } = response.data;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name,
          lastName: family_name,
          role: 'STUDENT',
        },
      });
    }

    // Generate JWT
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      expiresIn: 604800,
      tokenType: 'Bearer',
    });
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

export const refreshToken = async (c: Context) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return c.json({ accessToken, expiresIn: 604800 });
  } catch (error) {
    return c.json({ error: 'Token refresh failed' }, 401);
  }
};

export const logout = async (c: Context) => {
  return c.json({ message: 'Logged out successfully' });
};