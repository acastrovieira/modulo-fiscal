export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}
