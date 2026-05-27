import { Octokit } from '@octokit/rest';
import { GetFileContentSchema } from '../schemas/index.schemas';
import { getFileContentToDTO, GetFileContentDTO } from '../dtos/get-file-content.dto';
import { handleGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

export type GetFileContentResult =
    | { isError: false; data: GetFileContentDTO }
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
                new ValidationError('El path no apunta a un archivo.', {
                    path: parsed.data.path,
                })
            );
        }

        const decoded = Buffer.from(res.data.content, 'base64').toString('utf8');

        return {
            isError: false,
            data: getFileContentToDTO({ content: decoded, sha: res.data.sha }),
        };
    } catch (err) {
        return handleGitHubError(err);
    }
}
