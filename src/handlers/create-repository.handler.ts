import { Octokit } from '@octokit/rest';
import { CreateRepositorySchema } from '../schemas/index.schemas';
import { RepoToDTO, CreateRepositoryDTO } from '../dtos/create-repository.dto';
import { mapGitHubError, ToolError } from '../errors/index.errors';

export type CreateRepositoryResult =
    | { isError: false; data: CreateRepositoryDTO[] }
    | ToolError;

export async function createRepositoryHandler(
    input: unknown,
    octokit: Octokit
): Promise<CreateRepositoryResult> {
  // PASO 1: Validar el input con Zod
    const parsed = CreateRepositorySchema.safeParse(input);

    if (!parsed.success) {
        return {
            isError: true,
            code: 'VALIDATION_ERROR',
            message: 'Input invalido para create_repository',
            hint: 'owner, name y description son obligatorios y no pueden estar vacios',
        };
    }

  // PASO 2: Llamar a GitHub via Octokit
    try {
        const response = await octokit.rest.repos.createForAuthenticatedUser({
            name: parsed.data.name,
            description: parsed.data.description,
            private: parsed.data.private,
        });

    // PASO 3: Mapear a DTO y devolver
        return {
            isError: false,
            data: [RepoToDTO(response.data)],
        };
    } catch (err) {
    // PASO 4: Si algo falla, mapeamos el error
        return mapGitHubError(err);
    }
}
