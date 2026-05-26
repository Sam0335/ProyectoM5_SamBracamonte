export type ToolError = {
    isError: true;
    code: string;
    message: string;
    hint: string;
};

export function mapGitHubError(err: any): ToolError {
    const status = err?.status;

    if (status === 401) {
        return {
            isError: true,
            code: 'UNAUTHORIZED',
            message: 'Token inválido o ausente',
            hint: 'Verificá GITHUB_TOKEN en el archivo .env',
        };
    }

    if (status === 403) {
        return {
            isError: true,
            code: 'FORBIDDEN',
            message: 'Permisos insuficientes o rate limit excedido',
            hint: 'Revisá los scopes del token o esperá a que se resetee el rate limit',
        };
    }

    if (status === 404) {
        return {
            isError: true,
            code: 'NOT_FOUND',
            message: 'Recurso no encontrado o sin acceso',
            hint: 'Verificá owner/repo y que tu token tenga acceso',
        };
    }

    if (status === 422) {
        return {
            isError: true,
            code: 'VALIDATION_FAILED',
            message: 'GitHub rechazó la operación por datos inválidos',
            hint: 'Revisá los campos enviados',
        };
    }

    return {
        isError: true,
        code: 'UNKNOWN_ERROR',
        message: err?.message ?? 'Error desconocido',
        hint: 'Intentá de nuevo más tarde o revisá los logs',
    };
}