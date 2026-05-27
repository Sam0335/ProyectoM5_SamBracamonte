export type GetFileContentDTO = {
    content: string;
    sha: string;
};

export function getFileContentToDTO(data: GetFileContentDTO): GetFileContentDTO {
    return {
        content: data.content,
        sha: data.sha,
    };
}
