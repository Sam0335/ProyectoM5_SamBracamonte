// tests/errors.test.ts
import { describe, it, expect, vi } from 'vitest';
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
    it('convierte AppError en respuesta MCP con message y hint', () => {
        const err = new AppError({ code: 'AUTH_ERROR', message: 'Token inválido', retryable: false });
        const result = formatToolError(err);

        expect(result.isError).toBe(true);
        expect(result.content[0].type).toBe('text');

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.message).toBe('Token inválido');
        expect(parsed.hint).toBeTruthy();
    });

    it('maneja errores inesperados sin romper', () => {
        const result = formatToolError(new Error('algo raro'));
        expect(result.isError).toBe(true);
        
        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.message).toBeTruthy();
    });
});