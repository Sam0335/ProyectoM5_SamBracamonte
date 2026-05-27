// src/handlers/list-repositories.ts
import { Octokit } from '@octokit/rest';
import { ListRepositoriesSchema } from '../schemas/index.schemas';
import { mapReposToDTO, ListReposDTO } from '../dtos/list-repositories.dto';
import { handleGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

export type ListRepositoriesResult =
    | { isError: false; data: ListReposDTO[] }
    | ToolErrorData;

export async function listRepositoriesHandler(
    input: unknown,
    octokit: Octokit
): Promise<ListRepositoriesResult> {
    const parsed = ListRepositoriesSchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para list_repositories', {
                issues: parsed.error.issues,
            })
        );
    }

    try {
        const response = await octokit.rest.repos.listForUser({
            username: parsed.data.username,
            type: parsed.data.type,
            direction: parsed.data.direction,
            page: parsed.data.page,
            per_page: parsed.data.per_page,
        });

        return {
            isError: false,
            data: mapReposToDTO(response.data),
        };
    } catch (err) {
        return handleGitHubError(err);
    }
}
