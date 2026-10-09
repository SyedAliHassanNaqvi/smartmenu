/**
 * Error type used by server-side application code.
 *
 * Carries an HTTP status code so route handlers can turn it into a
 * consistent JSON error response without leaking internal details.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
