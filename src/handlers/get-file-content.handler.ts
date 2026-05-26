import { Octokit } from '@octokit/rest';
import { GetFileContentSchema } from '../schemas/index.schemas';
import { mapGitHubError, ToolError } from '../errors/index.errors';
 
export type GetFileContentResult =
  | { isError: false; data: { content: string; sha: string } }
  | ToolError;
 
export async function getFileContentHandler(
  input: unknown,
  octokit: Octokit
): Promise<GetFileContentResult> {
  const parsed = GetFileContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isError: true,
      code: 'VALIDATION_ERROR',
      message: 'Input inválido para get_file_content',
      hint: 'Verificá owner, repo y path',
    };
  }
 
  try {
    const res = await octokit.repos.getContent(parsed.data);
 
    // getContent puede devolver un array (directorio) o un objeto (archivo)
    if (Array.isArray(res.data) || res.data.type !== 'file') {
      return {
        isError: true,
        code: 'NOT_A_FILE',
        message: 'El path no apunta a un archivo',
        hint: 'Verificá que el path sea un archivo, no un directorio',
      };
    }
 
    // El contenido viene en base64, lo decodificamos
    const decoded = Buffer.from(res.data.content, 'base64').toString('utf8');
 
    return {
      isError: false,
      data: { content: decoded, sha: res.data.sha },
    };
  } catch (err) {
    return mapGitHubError(err);
  }
}