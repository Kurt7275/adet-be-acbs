import { Context } from 'hono';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  if (err.message.includes('Unauthorized')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (err.message.includes('Forbidden')) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return c.json({ error: err.message || 'Internal server error' }, 500);
};