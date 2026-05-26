import { Octokit } from '@octokit/rest';
import { CreateIssueSchema } from '../schemas/index.schemas';
import { IssuesToDTO, CreateIssueDTO } from '../dtos/create-issue.dto';
import { mapGitHubError, ToolError } from '../errors/index.errors';


export type CreateIssueResult =
    | { isError: false; data: CreateIssueDTO[] }
    | ToolError;

export async function createIssueHandler(
    input: unknown,
    octokit: Octokit
): Promise<CreateIssueResult> {

  // LOG DE DEBUGGING: ver qué llega del agente
  console.error('[DEBUG] create_issue recibió:', JSON.stringify(input));

  // PASO 1: Validar el input con Zod
    const parsed = CreateIssueSchema.safeParse(input);

    if (!parsed.success) {
        return {
            isError: true,
            code: 'VALIDATION_ERROR',
            message: 'Input invalido para create_issue',
            hint: 'owner, repo y title son obligatorios y no pueden estar vacios',
        };
    }

  // PASO 2: Llamar a GitHub via Octokit
    try {
        const response = await octokit.rest.issues.create({
            owner: parsed.data.owner,
            repo: parsed.data.repo,
            title: parsed.data.title,
            body: parsed.data.body,
            assignees: parsed.data.assignees,
            labels: parsed.data.labels,
        });

    // PASO 3: Mapear a DTO y devolver
        return {
            isError: false,
            data: [IssuesToDTO(response.data)],
        };
    } catch (err) {
    // PASO 4: Si algo falla, mapeamos el error
        return mapGitHubError(err);
    }
}
