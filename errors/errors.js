"use strict";

class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ResourceNotFoundError extends DomainError {
  constructor(resource, query) {
    super(`Resource ${resource} was not found.`);
    this.data = { resource, query };
  }
}

class BadRequestError extends DomainError {
  constructor(error) {
    super(`${error}`);
    this.data = { error };
  }
}

class NotAuthorizedError extends DomainError {
  constructor(error) {
    super(`Access Forbidden: ${error}`);
    this.data = { error };
  }
}

class NotAuthenticatedError extends DomainError {
  constructor(error) {
    super(`Not Authenticated: ${error}`);
    this.data = { error };
  }
}

class InternalError extends DomainError {
  constructor(error) {
    super(error.message);
    this.data = { error };
  }
}

module.exports.Errors = {
  ResourceNotFoundError,
  InternalError,
  NotAuthorizedError,
  BadRequestError,
  NotAuthenticatedError,
};
