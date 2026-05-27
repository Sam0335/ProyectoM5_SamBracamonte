import { Octokit } from '@octokit/rest';
import { CreateBranchSchema } from '../schemas/index.schemas';
import { handleGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

type BranchData = { branch: string; sha: string; url: string };

export type CreateBranchResult =
    | { isError: false; data: BranchData }
    | ToolErrorData;

export async function createBranchHandler(
    input: unknown,
    octokit: Octokit
): Promise<CreateBranchResult> {
    const parsed = CreateBranchSchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para create_branch', {
                issues: parsed.error.issues,
            })
        );
    }

    const { owner, repo, branch, from_branch } = parsed.data;

    try {
        const refResp = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${from_branch}`,
        });
        const sha = refResp.data.object.sha;

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
        return handleGitHubError(err);
    }
}
