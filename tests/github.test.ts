import { describe, it, expect, vi } from 'vitest';
import { listRepositoriesHandler } from '../src/handlers/list-repositories';
import { createIssueHandler } from '../src/handlers/create-issue';
import { listIssuesHandler } from '../src/handlers/list-issues';


describe('listRepositoriesHandler', () => {
  it('usa el octokit inyectado (mock) y devuelve los repos', async () => {
    // Cliente falso: solo mockeo el método que usa este handler
    const fakeOctokit = {
      rest: {
        repos: {
          listForUser: vi.fn().mockResolvedValue({
            data: [{ full_name: 'octocat/Hello-World', description: null,
                      html_url: 'https://github.com/octocat/Hello-World',
                      stargazers_count: 0, open_issues_count: 0,
                      language: null, default_branch: 'main' }],
          }),
        },
      },
    } as any;

    const result = await listRepositoriesHandler({ username: 'octocat' }, fakeOctokit);

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.data[0].full_name).toBe('octocat/Hello-World');
    }
  });

  it('devuelve VALIDATION_ERROR cuando username está vacío', async () => {
    const fakeOctokit = { rest: { repos: { listForUser: vi.fn() } } } as any;

    const result = await listRepositoriesHandler({ username: '' }, fakeOctokit);

    expect(result.isError).toBe(true);
    if (result.isError) expect(result.code).toBe('VALIDATION_ERROR');
  });
});

describe('createIssueHandler', () => {
  it('usa el octokit inyectado (mock) y devuelve la issue creada', async () => {
    const fakeOctokit = {
      rest: {
        issues: {
          create: vi.fn().mockResolvedValue({
            data: { number: 42, title: 'Mi issue', body: null,
                    state: 'open', repository: 'Hello-World' },
          }),
        },
      },
    } as any;

    const result = await createIssueHandler(
      { owner: 'octocat', repo: 'Hello-World', title: 'Mi issue' },
      fakeOctokit
    );

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.data[0].number).toBe(42);
      expect(result.data[0].title).toBe('Mi issue');
    }
  });
});

describe('listIssuesHandler', () => {
  it('lista issues con octokit mockeado', async () => {
    const fakeOctokit = {
      rest: {
        issues: {
          listForRepo: vi.fn().mockResolvedValue({
            data: [{ number: 1, title: 'Bug', description: null,
                     state: 'open', repository: 'Hello-World' }],
          }),
        },
      },
    } as any;

    const result = await listIssuesHandler(
      { owner: 'octocat', repo: 'Hello-World' },
      fakeOctokit
    );

    expect(result.isError).toBe(false);
    if (!result.isError) expect(result.data).toHaveLength(1);
  });
});