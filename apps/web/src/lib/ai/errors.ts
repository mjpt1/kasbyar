export class AiServiceError extends Error {
  constructor(
    message: string,
    readonly code: string = 'AI_SERVICE_ERROR',
    readonly status?: number,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiServiceError';
  }
}

export class AiUnavailableError extends AiServiceError {
  constructor(message = 'سرویس هوشمند در دسترس نیست') {
    super(message, 'AI_UNAVAILABLE');
    this.name = 'AiUnavailableError';
  }
}

export class AiTimeoutError extends AiServiceError {
  constructor(message = 'زمان پاسخ سرویس هوشمند به پایان رسید') {
    super(message, 'AI_TIMEOUT');
    this.name = 'AiTimeoutError';
  }
}
