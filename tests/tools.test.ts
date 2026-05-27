import { describe, it, expect } from 'vitest';
import {
  ListRepositoriesSchema,
  ListIssuesSchema,
  CreateIssueSchema,
  CreateRepositorySchema,
  CreateBranchSchema,
} from '../src/schemas/index.schemas';

describe('ListRepositoriesSchema', () => {
  it('acepta un input válido', () => {
    const result = ListRepositoriesSchema.safeParse({ username: 'octocat' });
    expect(result.success).toBe(true);
  });

  it('rechaza username vacío', () => {
    const result = ListRepositoriesSchema.safeParse({ username: '' });
    expect(result.success).toBe(false);
  });
});

describe('CreateIssueSchema', () => {
  it('acepta input con campos mínimos requeridos', () => {
    const result = CreateIssueSchema.safeParse({
      owner: 'octocat',
      repo: 'Hello-World',
      title: 'Bug encontrado',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza cuando falta el title', () => {
    const result = CreateIssueSchema.safeParse({
      owner: 'octocat',
      repo: 'Hello-World',
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateRepositorySchema', () => {
  it('aplica el valor default de private = false', () => {
    const result = CreateRepositorySchema.safeParse({
      name: 'mi-repo',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.private).toBe(false);
    }
  });

  it('rechaza name vacío', () => {
    const result = CreateRepositorySchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateBranchSchema', () => {
  it('aplica el default de from_branch = main', () => {
    const result = CreateBranchSchema.safeParse({
      owner: 'octocat',
      repo: 'Hello-World',
      branch: 'feature/nueva',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.from_branch).toBe('main');
    }
  });
});

describe('ListIssuesSchema', () => {
  it('aplica defaults de paginación correctamente', () => {
    const result = ListIssuesSchema.safeParse({
      owner: 'octocat',
      repo: 'Hello-World',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(5);
      expect(result.data.state).toBe('all');
    }
  });
});