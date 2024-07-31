export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TokenExpiredError extends CustomError {
  constructor(message = 'Token has expired') {
    super(message, 401);
  }
}

export class InvalidTokenError extends CustomError {
  constructor(message = 'Invalid token') {
    super(message, 401);
  }
}

export class EnvironmentVariableError extends CustomError {
  constructor(message = 'Environment variable is not defined') {
    super(message, 500);
  }
}