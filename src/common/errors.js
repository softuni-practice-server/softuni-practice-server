class ServiceError extends Error {
    constructor(message = 'Service Error') {
        super(message);
        this.name = 'ServiceError'; 
    }
}

module.exports = {
    ServiceError
};