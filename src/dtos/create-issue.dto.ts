export type CreateIssueDTO = {
    number: number;
    title: string;
    description: string | null;
    state?: string;
    repository: string;
};

export function IssuesToDTO(issue: any): CreateIssueDTO {
    return {
        number: issue.number,
        title: issue.title,
        description: issue.body,
        state: issue.state,
        repository: issue.repository,
    };
}