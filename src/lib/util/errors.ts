export class BadPayloadError extends Error {
  statusCode = 400;
  constructor(message: string = "Invalid payload") {
    super(message);
    this.name = "BadPayloadError";
  }
}

export class InvalidArgumentError extends Error {
  statusCode = 400;
  constructor(message: string = "Invalid argument") {
    super(message);
    this.name = "InvalidArgumentError";
  }
}

export class ResourceNotFoundError extends Error {
  statusCode = 404;
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

export class AlreadyExistsError extends Error {
  statusCode = 409;
  constructor(message: string = "Resource already exists") {
    super(message);
    this.name = "AlreadyExistsError";
  }
}

export class InvalidOperationError extends Error {
  statusCode = 400;
  constructor(message: string = "Invalid operation") {
    super(message);
    this.name = "InvalidOperationError";
  }
}
