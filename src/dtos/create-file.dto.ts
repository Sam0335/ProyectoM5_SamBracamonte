export type CreateFileDTO = {
    commitSha: string;
    commitUrl: string;
};

export function createFileToDTO(data: CreateFileDTO): CreateFileDTO {
    return {
        commitSha: data.commitSha,
        commitUrl: data.commitUrl,
    };
}
