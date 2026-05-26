export type CreateRepositoryDTO = {
    name: string;
    description: string | null;
    private: boolean;
    url: string;
};

export function RepoToDTO(repo: any): CreateRepositoryDTO {
    return {
        name: repo.name,
        description: repo.description,
        private: repo.private,
        url: repo.html_url,
    };
}
