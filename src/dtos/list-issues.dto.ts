export type ListIssuesDTO = {
    number: number;
    title: string;
    description: string | null;
    state: string;
    repository: string;
};

export function mapIssuesToDTO(list: any[]): ListIssuesDTO[] {
    return list.map(issue => ({
        number: issue.number,
        title: issue.title,
        description: issue.description,
        state: issue.state,
        repository: issue.repository,
    }));
}