import { z } from 'zod';
import prisma from './db';

const userSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long' })
      .refine(
        async (username) => {
          const user = await prisma.user.findUnique({ where: { username } });
          return !user;
        },
        { message: 'Username already exists' }
      ),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    employment_name: z.string(),
    method_login_id: z.string(),
    user_active: z.string(),
    branch_code: z.string(),
    department_id: z.number()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });
export { userSchema };
