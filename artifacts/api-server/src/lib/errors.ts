/**
 * AppError — structured error with an HTTP status code.
 * Use this in route handlers so the global error middleware
 * returns the correct status code automatically.
 *
 * Example:
 *   throw new AppError(404, "Service request not found");
 *   throw new AppError(403, "Access denied");
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
