// src/handlers/create-repository.handler.ts
import { Octokit } from '@octokit/rest';
import { CreateRepositorySchema } from '../schemas/index.schemas';
import { RepoToDTO, CreateRepositoryDTO } from '../dtos/create-repository.dto';
import { handleGitHubError, mapGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';
import { withExponentialBackoff, shouldRetryGitHub } from '../utils/retry';

export type CreateRepositoryResult =
    | { isError: false; data: CreateRepositoryDTO }
    | ToolErrorData;

export async function createRepositoryHandler(
    input: unknown,
    octokit: Octokit
): Promise<CreateRepositoryResult> {
    const parsed = CreateRepositorySchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para create_repository', {
                issues: parsed.error.issues,
            })
        );
    }

    try {
        const response = await withExponentialBackoff(
            async () => {
                try {
                    return await octokit.rest.repos.createForAuthenticatedUser({
                        name: parsed.data.name,
                        description: parsed.data.description,
                        private: parsed.data.private,
                    });
                } catch (err) {
                    mapGitHubError(err);
                }
            },
            {
                maxRetries: 3,
                baseDelayMs: 1000,
                maxDelayMs: 30000,
                shouldRetry: shouldRetryGitHub,
            }
        );

        return {
            isError: false,
            data: RepoToDTO(response.data),
        };
    } catch (err) {
        return handleGitHubError(err);
    }
}
