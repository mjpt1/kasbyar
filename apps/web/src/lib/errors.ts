export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string = 'APP_ERROR',
    readonly status: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'لطفاً وارد شوید') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'دسترسی مجاز نیست') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'مورد یافت نشد') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/** Plan/subscription limit — distinct from role-based ForbiddenError */
export class PlanUpgradeRequiredError extends AppError {
  constructor(
    message: string,
    readonly reason: 'feature' | 'quota' | 'pack' | 'subscription_inactive',
    readonly detail?: string,
    readonly suggestedPlan?: string,
  ) {
    super(message, 'PLAN_UPGRADE_REQUIRED', 403);
    this.name = 'PlanUpgradeRequiredError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return 'خطای ناشناخته';
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
