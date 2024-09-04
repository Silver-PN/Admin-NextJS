import { z } from 'zod';
import prisma from '@/lib/db';

const userSchema = z
  .object({
    department_name: z.string().refine((val) => val.length > 0, {
      message: 'Department Name is required'
    }),
    status: z.string(),
    created_by: z.string().optional(),
    updated_by: z.string(),
    id: z.number().optional()
  })
  .superRefine(async (data, ctx) => {
    const department = await prisma.departments.findUnique({
      where: {
        department_name: data.department_name,
        NOT: { id: data.id }
      }
    });
    if (department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['department_name'],
        message: `No duplicates allowed.`
      });
    }
  });

export { userSchema };
