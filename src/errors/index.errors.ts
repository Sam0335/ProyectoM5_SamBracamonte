import {
    AppError,
    AuthenticationError,
    GitHubAPIError,
    NetworkError,
} from '../utils/types';

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

export type ToolErrorData = {
    isError: true;
    code: string;
    message: string;
    hint: string;
    status?: number;
    retryable: boolean;
    details?: Record<string, unknown>;
};

export function formatToolError(err: unknown): ToolErrorData {
    let code = 'UNKNOWN_ERROR';
    let message = 'Error inesperado. Consultá los logs del servidor.';
    let hint =
        'Si el problema persiste, verificá que el servidor esté corriendo correctamente.';
    let status: number | undefined;
    let retryable = false;
    let details: Record<string, unknown> | undefined;

    if (err instanceof AppError) {
        code = err.code;
        message = err.message;
        status = err.status;
        retryable = err.retryable;
        details = err.details;

        switch (err.code) {
            case 'VALIDATION_ERROR':
                hint = 'Corregí los parámetros e intentá de nuevo.';
                break;
            case 'AUTH_ERROR':
                hint =
                    'Configurá un GITHUB_TOKEN válido con los scopes necesarios (repo, user).';
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
    }

    return {
        isError: true,
        code,
        message,
        hint,
        status,
        retryable,
        details,
    };
}

export function handleGitHubError(err: unknown): ToolErrorData {
    try {
        mapGitHubError(err);
    } catch (mappedErr) {
        return formatToolError(mappedErr);
    }

    return formatToolError(err);
}
