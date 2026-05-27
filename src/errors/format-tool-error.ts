import { AppError } from '../utils/types';
 
type ToolErrorPayload = {
  code: string;
  message: string;
  retryable: boolean;
  action: 'FIX_INPUT' | 'ADD_CREDENTIALS' | 'WAIT_AND_RETRY' | 'CHECK_RESOURCE' | 'CONTACT_SUPPORT';
  hint?: string;
  details?: Record<string, unknown>;
};
 
export function formatToolError(err: unknown): ToolErrorPayload {
  if (err instanceof AppError) {
    switch (err.code) {
      case 'VALIDATION_ERROR':
        return {
          code: err.code, message: err.message, retryable: false,
          action: 'FIX_INPUT',
          hint: 'Corregí los parámetros requeridos e intentá de nuevo.',
          details: err.details,
        };
        case 'AUTH_ERROR':
        return {
          code: err.code, message: err.message, retryable: false,
          action: 'ADD_CREDENTIALS',
          hint: 'Configurá GITHUB_TOKEN válido y con permisos.',
        };
      case 'NETWORK_ERROR':
        return {
          code: err.code, message: err.message, retryable: true,
          action: 'WAIT_AND_RETRY',
          hint: 'Error de red. Reintentá con backoff.',
          details: err.details,
        };
      case 'GITHUB_API_ERROR':
        return {
          code: err.code, message: err.message, retryable: err.retryable,
          action: err.retryable ? 'WAIT_AND_RETRY' : 'CHECK_RESOURCE',
          hint: err.retryable
            ? 'Rate limit o problema temporal. Esperá antes de reintentar.'
            : 'Verificá owner/repo o los parámetros.',
          details: err.details,
        };
      default:
        return {
          code: err.code, message: err.message, retryable: err.retryable,
          action: 'CONTACT_SUPPORT',
        };
    }
  }
  // Fallback para errores imprevistos
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Error inesperado. Consultá los logs.',
    retryable: false,
    action: 'CONTACT_SUPPORT',
  };
}