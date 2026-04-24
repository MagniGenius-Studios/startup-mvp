export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[] | undefined>;
  public readonly isOperational: boolean;

  // Standardized error shape used by error middleware responses.
  constructor(
    message: string,
    statusCode: number,
    errors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
