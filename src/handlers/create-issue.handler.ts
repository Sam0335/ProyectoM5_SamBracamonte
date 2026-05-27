import { Octokit } from '@octokit/rest';
import { CreateIssueSchema } from '../schemas/index.schemas';
import { IssuesToDTO, CreateIssueDTO } from '../dtos/create-issue.dto';
import { handleGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

export type CreateIssueResult =
    | { isError: false; data: CreateIssueDTO }
    | ToolErrorData;

export async function createIssueHandler(
    input: unknown,
    octokit: Octokit
): Promise<CreateIssueResult> {

  // PASO 1: Validar el input con Zod
    const parsed = CreateIssueSchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para create_issue', {
                issues: parsed.error.issues,
            })
        );
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
            data: IssuesToDTO(response.data),
        };
    } catch (err) {
        return handleGitHubError(err);
    }
}
