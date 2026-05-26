import { Octokit } from '@octokit/rest';
import { ListIssuesSchema } from '../schemas/index.schemas';
import { mapIssuesToDTO, ListIssuesDTO } from '../dtos/list-issues.dto';
import { mapGitHubError, ToolError } from '../errors/index.errors';

export type ListIssuesResult =
    | { isError: false; data: ListIssuesDTO[] }
    | ToolError;

export async function listIssuesHandler(
    input: unknown,
    octokit: Octokit
): Promise<ListIssuesResult> {
  // PASO 1: Validar el input con Zod
    const parsed = ListIssuesSchema.safeParse(input);

    if (!parsed.success) {
        return {
            isError: true,
            code: 'VALIDATION_ERROR',
            message: 'Input invalido para list_issues',
            hint: 'username y repo son obligatorios y no pueden estar vacios',
        };
    }

  // PASO 2: Llamar a GitHub via Octokit
    try {
        const response = await octokit.rest.issues.listForRepo({
            owner: parsed.data.owner,
            repo: parsed.data.repo,
            state: parsed.data.state,
            direction: parsed.data.direction,
            page: parsed.data.page,
            per_page: parsed.data.per_page,
        });

    // PASO 3: Mapear a DTO y devolver
        return {
            isError: false,
            data: mapIssuesToDTO(response.data),
        };
    } catch (err) {
    // PASO 4: Si algo falla, mapeamos el error
        return mapGitHubError(err);
    }
}
