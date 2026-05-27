import { describe, it, expect, vi } from 'vitest';
import { mapGitHubError } from '../src/errors/index.errors';
import { createIssueHandler } from '../src/handlers/create-issue';

// ── Tests de transformación de errores ─────────────────────────────────────

describe('mapGitHubError', () => {
  it('convierte error 401 a mensaje UNAUTHORIZED claro', () => {
    const err = { status: 401 };
    const result = mapGitHubError(err);

    expect(result.isError).toBe(true);
    expect(result.code).toBe('UNAUTHORIZED');
    expect(result.message).toContain('Token');
    expect(result.hint).toBeTruthy();
  });

  it('convierte error 404 a NOT_FOUND con hint útil', () => {
    const err = { status: 404 };
    const result = mapGitHubError(err);

    expect(result.isError).toBe(true);
    expect(result.code).toBe('NOT_FOUND');
    // El mensaje NO debe ser un stack trace ni estar vacío
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.hint.length).toBeGreaterThan(0);
  });

  it('convierte error 403 a FORBIDDEN', () => {
    const err = { status: 403 };
    const result = mapGitHubError(err);

    expect(result.isError).toBe(true);
    expect(result.code).toBe('FORBIDDEN');
  });

  it('maneja errores desconocidos sin romper', () => {
    const err = { status: 999, message: 'Algo raro' };
    const result = mapGitHubError(err);

    expect(result.isError).toBe(true);
    expect(result.code).toBe('UNKNOWN_ERROR');
  });
});

// ── Test: handler propaga el error correctamente ────────────────────────────

describe('createIssueHandler con error de GitHub simulado', () => {
  it('devuelve UNAUTHORIZED cuando Octokit lanza 401', async () => {
    const mockOctokit = {
      rest: {
        issues: {
          create: vi.fn().mockRejectedValue({ status: 401 }),
        },
      },
    } as any;

    const result = await createIssueHandler(
      { owner: 'octocat', repo: 'Hello-World', title: 'Test' },
      mockOctokit
    );

    expect(result.isError).toBe(true);
    if (result.isError) {
      expect(result.code).toBe('UNAUTHORIZED');
    }
  });
});