/*
 * This service requires storage and auth plugins
 */

const Service = require('./Service');
const { NotFoundError, RequestError, CredentialError, AuthorizationError } = require('../common/errors');


const dataService = new Service();
dataService.get(':collection', get);
dataService.post(':collection', post);
dataService.put(':collection', put);
dataService.delete(':collection', del);

function validateRequest(context, tokens, query) {
    if (context.params.collection == undefined) {
        throw new RequestError('Please, specify collection name');
    }
    if (context.params.collection == 'users' || context.params.collection == 'sessions') {
        throw new CredentialError();
    }
    if (tokens.length > 1) {
        throw new RequestError();
    }
    // TODO validate query params, once implemented
}


function get(context, tokens, query, body) {
    validateRequest(context, tokens, query);

    let responseData;

    try {
        responseData = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
        throw new NotFoundError();
    }

    return responseData;
}

function post(context, tokens, query, body) {
    console.log('Request body:\n', body);

    validateRequest(context, tokens, query);
    if (tokens.length > 0) {
        throw new RequestError('Use PUT to update records');
    }

    let responseData;

    if (context.user) {
        body._ownerId = context.user._id;
    } else {
        throw new AuthorizationError();
    }

    try {
        responseData = context.storage.add(context.params.collection, body);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}

function put(context, tokens, query, body) {
    console.log('Request body:\n', body);

    validateRequest(context, tokens, query);
    if (tokens.length != 1) {
        throw new RequestError('Missing entry ID');
    }

    let responseData;

    if (!context.user) {
        throw new AuthorizationError();
    }

    let existing;

    try {
        existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
        throw new NotFoundError();
    }

    if (context.user._id !== existing._ownerId) {
        throw new CredentialError();
    }

    try {
        responseData = context.storage.set(context.params.collection, tokens[0], body);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}

function del(context, tokens, query, body) {
    validateRequest(context, tokens, query);
    if (tokens.length != 1) {
        throw new RequestError('Missing entry ID');
    }

    let responseData;

    if (!context.user) {
        throw new AuthorizationError();
    }

    let existing;

    try {
        existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
        throw new NotFoundError();
    }

    if (context.user._id !== existing._ownerId) {
        throw new CredentialError();
    }

    try {
        responseData = context.storage.delete(context.params.collection, tokens[0]);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}


module.exports = dataService.parseRequest;