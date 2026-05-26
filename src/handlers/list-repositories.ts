import { Octokit } from '@octokit/rest';
import { ListRepositoriesSchema } from '../schemas/index.schemas';
import { mapReposToDTO, ListReposDTO } from '../dtos/list-repositories.dto';
import { mapGitHubError, ToolError } from '../errors/index.errors';

export type ListRepositoriesResult =
    | { isError: false; data: ListReposDTO[] }
    | ToolError;

export async function listRepositoriesHandler(
    input: unknown,
    octokit: Octokit
): Promise<ListRepositoriesResult> {
  // PASO 1: Validar el input con Zod
    const parsed = ListRepositoriesSchema.safeParse(input);

    if (!parsed.success) {
        return {
            isError: true,
            code: 'VALIDATION_ERROR',
            message: 'Input invalido para list_repositories',
            hint: 'username es obligatorio y no puede estar vacio',
        };
    }

  // PASO 2: Llamar a GitHub via Octokit
    try {
        const response = await octokit.rest.repos.listForUser({
            username: parsed.data.username,
            type: parsed.data.type,
            direction: parsed.data.direction,
            page: parsed.data.page,
            per_page: parsed.data.per_page,
        });

    // PASO 3: Mapear a DTO y devolver
        return {
            isError: false,
            data: mapReposToDTO(response.data),
        };
    } catch (err) {
    // PASO 4: Si algo falla, mapeamos el error
        return mapGitHubError(err);
    }
}
