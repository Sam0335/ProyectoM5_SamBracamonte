import { describe, it, expect } from 'vitest';
import { mapGitHubError, formatToolError } from '../src/errors/index.errors';
import { AppError } from '../src/utils/types';

describe('mapGitHubError', () => {
    it('lanza AuthenticationError en 401', () => {
        expect(() => mapGitHubError({ status: 401 })).toThrow('Token de GitHub');
    });

    it('lanza GitHubAPIError en 404', () => {
        expect(() => mapGitHubError({ status: 404 })).toThrow('no encontrado');
    });

    it('lanza GitHubAPIError retryable en 403 con rate limit', () => {
        const err = {
            status: 403,
            response: { headers: { 'x-ratelimit-remaining': '0' } },
        };
        expect(() => mapGitHubError(err)).toThrow('Rate limit');
    });
});

describe('formatToolError', () => {
    it('convierte AppError en objeto con message y hint', () => {
        const err = new AppError({ code: 'AUTH_ERROR', message: 'Token inválido', retryable: false });
        const result = formatToolError(err);

        expect(result.isError).toBe(true);
        expect(result.code).toBe('AUTH_ERROR');
        expect(result.message).toBe('Token inválido');
        expect(result.hint).toBeTruthy();
    });

    it('maneja errores inesperados sin romper', () => {
        const result = formatToolError(new Error('algo raro'));

        expect(result.isError).toBe(true);
        expect(result.message).toBeTruthy();
        expect(result.hint).toBeTruthy();
    });
});