import { Octokit } from '@octokit/rest';
import { ListIssuesSchema } from '../schemas/index.schemas';
import { mapIssuesToDTO, ListIssuesDTO } from '../dtos/list-issues.dto';
import { mapGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

export type ListIssuesResult =
    | { isError: false; data: ListIssuesDTO[] }
    | ToolErrorData;

export async function listIssuesHandler(
    input: unknown,
    octokit: Octokit
): Promise<ListIssuesResult> {
    const parsed = ListIssuesSchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para list_issues', {
                issues: parsed.error.issues,
            })
        );
    }

    try {
        const response = await octokit.rest.issues.listForRepo({
            owner: parsed.data.owner,
            repo: parsed.data.repo,
            state: parsed.data.state,
            direction: parsed.data.direction,
            page: parsed.data.page,
            per_page: parsed.data.per_page,
        });

        return {
            isError: false,
            data: mapIssuesToDTO(response.data),
        };
    } catch (err) {
        mapGitHubError(err);
        return formatToolError(err);
    }
}