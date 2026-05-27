import { Octokit } from '@octokit/rest';
import { CreateCommitSchema } from '../schemas/index.schemas';
import { createCommitWithFile } from '../github/create-commit.helper';
import { createFileToDTO, CreateFileDTO } from '../dtos/create-file.dto';
import { handleGitHubError, formatToolError, ToolErrorData } from '../errors/index.errors';
import { ValidationError } from '../utils/types';

export type CreateFileResult =
    | { isError: false; data: CreateFileDTO }
    | ToolErrorData;

export async function createFileHandler(
    input: unknown,
    octokit: Octokit
): Promise<CreateFileResult> {
    const parsed = CreateCommitSchema.safeParse(input);

    if (!parsed.success) {
        return formatToolError(
            new ValidationError('Input inválido para create_file', {
                issues: parsed.error.issues,
            })
        );
    }

    try {
        const result = await createCommitWithFile(octokit, parsed.data);

        return {
            isError: false,
            data: createFileToDTO(result),
        };
    } catch (err) {
        return handleGitHubError(err);
    }
}
