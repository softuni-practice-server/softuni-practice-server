class ServiceError extends Error {
    constructor(message = 'Service Error') {
        super(message);
        this.name = 'ServiceError'; 
    }
}

class RequestError extends ServiceError {
    constructor(message = 'Service Error') {
        super(message);
        this.name = 'RequestError'; 
        this.status = 400;
    }
}

class ConflictError extends ServiceError {
    constructor(message = 'Service Error') {
        super(message);
        this.name = 'ConflictError'; 
        this.status = 409;
    }
}

class CredentialError extends ServiceError {
    constructor(message = 'Service Error') {
        super(message);
        this.name = 'CredentialError'; 
        this.status = 401;
    }
}

module.exports = {
    ServiceError,
    RequestError,
    ConflictError,
    CredentialError
};