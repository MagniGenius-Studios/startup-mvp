import { Request, Response } from 'express';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  // TODO: Implement authentication logic
  return res.status(501).json({ message: 'Auth not implemented yet.' });
};
