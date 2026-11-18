/**
 * Application-level error with an HTTP status and machine-readable code.
 * Thrown by services/middleware and converted to a JSON response by the
 * centralised error handler in app.ts.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = "Invalid request", details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required", details?: unknown) {
    return new ApiError(401, "AUTH_REQUIRED", message, details);
  }

  static forbidden(message = "You do not have permission to perform this action", details?: unknown) {
    return new ApiError(403, "FORBIDDEN", message, details);
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new ApiError(404, "NOT_FOUND", message, details);
  }

  static conflict(message = "Resource conflict", details?: unknown) {
    return new ApiError(409, "CONFLICT", message, details);
  }
}
