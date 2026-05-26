import { z } from 'zod';

export const CreateBranchSchema = z.object({
  owner: z.string().min(1, 'owner es requerido'),
  repo: z.string().min(1, 'repo es requerido'),
  branch: z.string().min(1, 'branch es requerido'),
  from_branch: z.string().min(1, 'from_branch es requerido').default('main'),
});

export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;