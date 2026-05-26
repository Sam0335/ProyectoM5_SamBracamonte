import { Octokit } from '@octokit/rest';
import { CreateBranchSchema } from '../schemas/create-branch.schema';
import { mapGitHubError, ToolError } from '../errors/index.errors';

export type CreateBranchResult =
  | { isError: false; data: { branch: string; sha: string; url: string } }
  | ToolError;

export async function createBranchHandler(
  input: unknown,
  octokit: Octokit
): Promise<CreateBranchResult> {
  const parsed = CreateBranchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isError: true,
      code: 'VALIDATION_ERROR',
      message: 'Input inválido para create_branch',
      hint: 'Verificá owner, repo, branch y from_branch',
    };
  }

  const { owner, repo, branch, from_branch } = parsed.data;

  try {
    // PASO 1: Obtener el SHA del HEAD de la rama origen
    const refResp = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${from_branch}`,
    });
    const sha = refResp.data.object.sha;

    // PASO 2: Crear la nueva rama apuntando a ese SHA
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha,
    });

    return {
      isError: false,
      data: {
        branch,
        sha,
        url: `https://github.com/${owner}/${repo}/tree/${branch}`,
      },
    };
  } catch (err) {
    return mapGitHubError(err);
  }
}