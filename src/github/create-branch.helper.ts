import { Octokit } from '@octokit/rest';
import { CreateBranchInput } from '../schemas/index.schemas';

export async function createBranch(
    octokit: Octokit,
    input: CreateBranchInput
) {
    const { owner, repo, branch, from_branch } = input;

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
        branch,
        sha,
        url: `https://github.com/${owner}/${repo}/tree/${branch}`,
    };
}
