export type CreateBranchDTO = {
    branch: string;
    sha: string;
    url: string;
};

export function createBranchToDTO(data: CreateBranchDTO): CreateBranchDTO {
    return {
        branch: data.branch,
        sha: data.sha,
        url: data.url,
    };
}
