import type { ApiError, ApiResponse, ApiSuccess } from '@kesbyar/shared';

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function apiError(
  message: string,
  code = 'ERROR',
  details?: Record<string, string[]>,
): ApiError {
  return {
    success: false,
    error: { code, message, details },
  };
}

export function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return Response.json(body, { status });
}

export function errorResponse(message: string, status = 400, code = 'ERROR') {
  return jsonResponse(apiError(message, code), status);
}

export function validationErrorResponse(
  message: string,
  details?: Record<string, string[]>,
) {
  return jsonResponse(apiError(message, 'VALIDATION_ERROR', details), 400);
}

export function zodErrorResponse(error: {
  errors: { path: (string | number)[]; message: string }[];
}): Response {
  const details: Record<string, string[]> = {};
  for (const issue of error.errors) {
    const key = issue.path.join('.') || '_';
    details[key] ??= [];
    details[key]!.push(issue.message);
  }
  const first = error.errors[0]?.message ?? 'داده نامعتبر';
  return validationErrorResponse(first, details);
}

export function fromAppError(error: {
  message: string;
  code?: string;
  status?: number;
}): Response {
  return errorResponse(
    error.message,
    error.status ?? 400,
    error.code ?? 'APP_ERROR',
  );
}
