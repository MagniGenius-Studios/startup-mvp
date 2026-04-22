import { z } from 'zod';

export const problemProgressQuerySchema = z.object({
  categoryId: z
    .string({ required_error: 'Category ID is required' })
    .uuid('Category ID must be a valid UUID'),
});
