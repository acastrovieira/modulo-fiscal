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

export class NotFoundError extends ApplicationError {
  constructor(message = "Not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION_ERROR", 422);
    this.name = "ValidationError";
  }
}

export class TenantScopeError extends ForbiddenError {
  constructor(message = "Record does not belong to the active tenant.") {
    super(message);
    this.name = "TenantScopeError";
  }
}

export class InvalidStateError extends ApplicationError {
  constructor(message = "Invalid state transition") {
    super(message, "INVALID_STATE", 409);
    this.name = "InvalidStateError";
  }
}