class AppError extends Error {
  constructor(message, statusCode, error) {
    super(message);
    this.statusCode = statusCode;
    this.error = error || this.getErrorName(statusCode);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  getErrorName(statusCode) {
    const errors = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return errors[statusCode] || 'ERROR';
  }
}

module.exports = AppError;
