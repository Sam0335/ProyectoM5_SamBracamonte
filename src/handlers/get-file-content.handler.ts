import { Octokit } from '@octokit/rest';
import { GetFileContentSchema } from '../schemas/index.schemas';
import { mapGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError, AppError } from '../utils/types';

type FileContentData = { content: string; sha: string };

export type GetFileContentResult =
    | { isError: false; data: FileContentData }
    | ToolErrorData;

export async function getFileContentHandler(
    input: unknown,
    octokit: Octokit
): Promise<GetFileContentResult> {
    const parsed = GetFileContentSchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para get_file_content', {
                issues: parsed.error.issues,
            })
        );
    }

    try {
        const res = await octokit.repos.getContent(parsed.data);

        if (Array.isArray(res.data) || res.data.type !== 'file') {
            return formatToolError(
                new AppError({
                    code: 'VALIDATION_ERROR',
                    message: 'El path no apunta a un archivo.',
                    retryable: false,
                })
            );
        }

        const decoded = Buffer.from(res.data.content, 'base64').toString('utf8');

        return {
            isError: false,
            data: { content: decoded, sha: res.data.sha },
        };
    } catch (err) {
        mapGitHubError(err);
        return formatToolError(err);
    }
}