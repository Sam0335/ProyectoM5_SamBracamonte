// src/errors/github-errors.ts

import {
    AppError,
    AuthenticationError,
    GitHubAPIError,
    NetworkError,
    ValidationError,
} from '../utils/types';

// Error crudo de Octokit

export function mapGitHubError(err: any): never {
    const status = err?.status;

    if (status === 401) {
        throw new AuthenticationError(
            'Token de GitHub inválido o ausente. Verificá GITHUB_TOKEN en tu .env'
        );
    }

    if (status === 403) {
        const isRateLimit =
            err?.response?.headers?.['x-ratelimit-remaining'] === '0';
        throw new GitHubAPIError(
            isRateLimit
                ? 'Rate limit de GitHub excedido. Esperá unos minutos antes de reintentar.'
                : 'Permisos insuficientes. Revisá los scopes del token (repo, user).',
            { status: 403, retryable: isRateLimit }
        );
    }

    if (status === 404) {
        throw new GitHubAPIError(
            'Recurso no encontrado. Verificá owner, repo y que tu token tenga acceso.',
            { status: 404, retryable: false }
        );
    }

    if (status === 422) {
        throw new GitHubAPIError(
            'GitHub rechazó la operación. Revisá que los datos enviados sean válidos.',
            { status: 422, retryable: false }
        );
    }

    if (!status || status >= 500) {
        throw new NetworkError(
            'Error de red o del servidor de GitHub. Reintentá en unos momentos.',
            { originalStatus: status }
        );
    }

    throw new AppError({
        code: 'UNKNOWN_ERROR',
        message: err?.message ?? 'Error inesperado al conectar con GitHub.',
        retryable: false,
    });
}

// Respuesta legible para el LLM 

export type ToolResponse = {
    content: Array<{ type: 'text'; text: string }>;
    isError: true;
};

export function formatToolError(err: unknown): ToolResponse {
    let message: string;
    let hint: string;

    if (err instanceof AppError) {
        message = err.message;

        switch (err.code) {
            case 'VALIDATION_ERROR':
                hint = 'Corregí los parámetros e intentá de nuevo.';
                break;
            case 'AUTH_ERROR':
                hint = 'Configurá un GITHUB_TOKEN válido con los scopes necesarios (repo, user).';
                break;
            case 'GITHUB_API_ERROR':
                hint = err.retryable
                    ? 'Error temporal. Esperá unos segundos antes de reintentar.'
                    : 'Verificá los parámetros enviados (owner, repo, etc).';
                break;
            case 'NETWORK_ERROR':
                hint = 'Problema de red. Reintentá en unos momentos.';
                break;
            default:
                hint = 'Revisá los logs del servidor para más detalles.';
        }
    } else {
        message = 'Error inesperado. Consultá los logs del servidor.';
        hint = 'Si el problema persiste, verificá que el servidor esté corriendo correctamente.';
    }

    return {
        content: [{ type: 'text', text: JSON.stringify({ isError: true, message, hint }, null, 2) }],
        isError: true,
    };
}