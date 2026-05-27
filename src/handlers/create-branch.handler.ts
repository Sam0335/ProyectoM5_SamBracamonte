import { Octokit } from '@octokit/rest';
import { CreateBranchSchema } from '../schemas/index.schemas';
import { createBranch } from '../github/create-branch.helper';
import { createBranchToDTO, CreateBranchDTO } from '../dtos/create-branch.dto';
import { handleGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

export type CreateBranchResult =
    | { isError: false; data: CreateBranchDTO }
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

    try {
        const result = await createBranch(octokit, parsed.data);

        return {
            isError: false,
            data: createBranchToDTO(result),
        };
    } catch (err) {
        return handleGitHubError(err);
    }
}
