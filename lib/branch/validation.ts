import { z } from 'zod';
import prisma from '@/lib/db';

const userSchema = z
  .object({
    branch_code: z
      .string()
      .refine((val) => val.length > 0, { message: 'Branch code is required' }),

    branch_name: z.string(),
    status: z.string().optional(),
    created_by: z.number().optional(),
    updated_by: z.number().optional(),
    id: z.number().optional()
  })
  .superRefine(async (data, ctx) => {
    const branch = await prisma.branch.findUnique({
      where: {
        branch_code: data.branch_code,
        NOT: { id: data.id }
      }
    });
    if (branch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['branch_code'],
        message: `No duplicates allowed.`
      });
    }
  });
export { userSchema };
