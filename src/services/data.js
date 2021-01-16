/*
 * This service requires storage and auth plugins
 */

const Service = require('./Service');
const { NotFoundError, RequestError, CredentialError } = require('../common/errors');


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
    /*
    console.log('Request body:\n', body);

    // TODO handle collisions, replacement
    let responseData = data;
    for (let token of tokens) {
        if (responseData.hasOwnProperty(token) == false) {
            responseData[token] = {};
        }
        responseData = responseData[token];
    }

    const newId = uuid();
    responseData[newId] = Object.assign({}, body, { _id: newId });
    return responseData[newId];
    */
}

function put(context, tokens, query, body) {
    /*
    console.log('Request body:\n', body);

    let responseData = data;
    for (let token of tokens) {
        if (responseData !== undefined) {
            responseData = responseData[token];
        }
    }
    if (responseData !== undefined) {
        Object.assign(responseData, body);
    }
    return responseData;
    */
}

function del(context, tokens, query, body) {
    /*
    let responseData = data;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (responseData.hasOwnProperty(token) == false) {
            return null;
        }
        if (i == tokens.length - 1) {
            const body = responseData[token];
            delete responseData[token];
            return body;
        } else {
            responseData = responseData[token];
        }
    }
    */
}


module.exports = dataService.parseRequest;