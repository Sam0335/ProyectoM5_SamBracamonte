import { Octokit } from '@octokit/rest';
import { CreateCommitSchema } from '../schemas/index.schemas';
import { createCommitWithFile } from '../github/create-commit.helper';
import { mapGitHubError, ToolError } from '../errors/index.errors';
 
export type CreateFileResult =
  | { isError: false; data: { commitSha: string; commitUrl: string } }
  | ToolError;
 
export async function createFileHandler(
  input: unknown,
  octokit: Octokit
): Promise<CreateFileResult> {
  // 1. Validar input
  const parsed = CreateCommitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isError: true,
      code: 'VALIDATION_ERROR',
      message: 'Input inválido para create_file',
      hint: 'Verificá owner, repo, branch, path, content y message',
    };
  }
 
  // 2. Ejecutar el helper (los 6 pasos)
  try {
    const result = await createCommitWithFile(octokit, parsed.data);
    return { isError: false, data: result };
  } catch (err) {
    return mapGitHubError(err);
  }
}