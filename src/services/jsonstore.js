const fs = require('fs');
const Service = require('./Service');
const uuid = require('../common/util').uuid;


const data = fs.existsSync('./data') ? fs.readdirSync('./data').reduce((p, c) => {
    const content = JSON.parse(fs.readFileSync('./data/' + c));
    const collection = c.slice(0, -5);
    p[collection] = {};
    for (let endpoint in content) {
        p[collection][endpoint] = content[endpoint];
    }
    return p;
}, {}) : {};

const actions = {
    get: (context, tokens, query, body) => {
        tokens = [context.params.collection, ...tokens];
        let responseData = data;
        for (let token of tokens) {
            if (responseData !== undefined) {
                responseData = responseData[token];
            }
        }
        return responseData;
    },
    post: (context, tokens, query, body) => {
        tokens = [context.params.collection, ...tokens];
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
    },
    put: (context, tokens, query, body) => {
        tokens = [context.params.collection, ...tokens];
        console.log('Request body:\n', body);

        let responseData = data;
        for (let token of tokens.slice(0, -1)) {
            if (responseData !== undefined) {
                responseData = responseData[token];
            }
        }
        if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
            responseData[tokens.slice(-1)] = body;
        }
        return responseData[tokens.slice(-1)];
    },
    patch: (context, tokens, query, body) => {
        tokens = [context.params.collection, ...tokens];
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
    },
    delete: (context, tokens, query, body) => {
        tokens = [context.params.collection, ...tokens];
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
    }
};

const dataService = new Service();
dataService.get(':collection', actions.get);
dataService.post(':collection', actions.post);
dataService.put(':collection', actions.put);
dataService.patch(':collection', actions.patch);
dataService.delete(':collection', actions.delete);


module.exports = dataService.parseRequest;