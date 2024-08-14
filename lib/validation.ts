import { z } from 'zod';

const userSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export { userSchema };
