class ServiceError extends Error {
    constructor(message = 'Service Error') {
        super(message);
        this.name = 'ServiceError'; 
    }
}

class NotFoundError extends ServiceError {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError'; 
        this.status = 404;
    }
}

class RequestError extends ServiceError {
    constructor(message = 'Request error') {
        super(message);
        this.name = 'RequestError'; 
        this.status = 400;
    }
}

class ConflictError extends ServiceError {
    constructor(message = 'Resource conflict') {
        super(message);
        this.name = 'ConflictError'; 
        this.status = 409;
    }
}

class AuthorizationError extends ServiceError {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'AuthorizationError'; 
        this.status = 401;
    }
}

class CredentialError extends ServiceError {
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'CredentialError'; 
        this.status = 403;
    }
}

module.exports = {
    ServiceError,
    NotFoundError,
    RequestError,
    ConflictError,
    AuthorizationError,
    CredentialError
};