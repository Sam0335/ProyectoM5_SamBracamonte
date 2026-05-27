import { describe, it, expect, vi } from 'vitest';
import { listRepositoriesHandler } from '../src/handlers/list-repositories.handler';
import { createIssueHandler } from '../src/handlers/create-issue.handler';
import { listIssuesHandler } from '../src/handlers/list-issues.handler';
import { createRepositoryHandler } from '../src/handlers/create-repository.handler';


describe('listRepositoriesHandler', () => {
  it('usa el octokit inyectado (mock) y devuelve los repos', async () => {
    // Cliente falso: solo mockeo el método que usa este handler
    const fakeOctokit = {
      rest: {
        repos: {
          listForUser: vi.fn().mockResolvedValue({
            data: [{ full_name: 'octocat/Hello-World',
                      description: null,
                      html_url: 'https://github.com/octocat/Hello-World',
                      stargazers_count: 0,
                      open_issues_count: 0,
                      language: null,
                      default_branch: 'main' }],
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
    if (result.isError) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.message).toBeTruthy();
      expect(result.hint).toBeTruthy();
    }
  });
});

describe('createIssueHandler', () => {
  it('usa el octokit inyectado (mock) y devuelve la issue creada', async () => {
    const fakeOctokit = {
      rest: {
        issues: {
          create: vi.fn().mockResolvedValue({
            data: { 
              number: 42, 
              title: 'Mi issue', 
              body: 'Descripción de prueba',
              state: 'open', 
              html_url: 'https://github.com/octocat/Hello-World/issues/42' 
            },
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
      expect(result.data.number).toBe(42);
      expect(result.data.title).toBe('Mi issue');
      expect(result.data.description).toBe('Descripción de prueba');
      expect(result.data.repository).toBe('https://github.com/octocat/Hello-World/issues/42');
    }
  });
});

describe('listIssuesHandler', () => {
  it('lista issues con octokit mockeado', async () => {
    const fakeOctokit = {
      rest: {
        issues: {
          listForRepo: vi.fn().mockResolvedValue({
            data: [{ 
              number: 1, 
              title: 'Bug', 
              body: 'Detalle del bug',
              state: 'open', 
              html_url: 'https://github.com/octocat/Hello-World/issues/1' 
            }],
          }),
        },
      },
    } as any;

    const result = await listIssuesHandler(
      { owner: 'octocat', repo: 'Hello-World' },
      fakeOctokit
    );

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].number).toBe(1);
      expect(result.data[0].title).toBe('Bug');
      expect(result.data[0].description).toBe('Detalle del bug');
      expect(result.data[0].repository).toBe('https://github.com/octocat/Hello-World/issues/1');
    }
  });
});

describe('createRepositoryHandler', () => {
  it('crea un repositorio correctamente en el primer intento', async () => {
    const fakeOctokit = {
      rest: {
        repos: {
          createForAuthenticatedUser: vi.fn().mockResolvedValue({
            data: {
              name: 'nuevo-repo',
              description: 'un repo genial',
              private: true,
              html_url: 'https://github.com/octocat/nuevo-repo',
            },
          }),
        },
      },
    } as any;

    const result = await createRepositoryHandler(
      { name: 'nuevo-repo', description: 'un repo genial', private: true },
      fakeOctokit
    );

    expect(result.isError).toBe(false);
    if (!result.isError) {
      expect(result.data.name).toBe('nuevo-repo');
      expect(result.data.private).toBe(true);
      expect(result.data.url).toBe('https://github.com/octocat/nuevo-repo');
    }
  });

  it('reintenta en caso de rate limit (403) y tiene éxito en el segundo intento', async () => {
    vi.useFakeTimers();
    try {
      const rateLimitError = {
        status: 403,
        response: {
          headers: {
            'x-ratelimit-remaining': '0',
          },
        },
      };

      const createMock = vi.fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          data: {
            name: 'repo-reintentado',
            description: 'reintentado',
            private: false,
            html_url: 'https://github.com/octocat/repo-reintentado',
          },
        });

      const fakeOctokit = {
        rest: {
          repos: {
            createForAuthenticatedUser: createMock,
          },
        },
      } as any;

      const resultPromise = createRepositoryHandler(
        { name: 'repo-reintentado', description: 'reintentado' },
        fakeOctokit
      );

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(createMock).toHaveBeenCalledTimes(2);
      expect(result.isError).toBe(false);
      if (!result.isError) {
        expect(result.data.name).toBe('repo-reintentado');
      }
    } finally {
      vi.useRealTimers();
    }
  });
});