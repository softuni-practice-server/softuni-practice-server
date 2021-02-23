const fs = require('fs');
const Service = require('./Service');


const data = fs.readdirSync('./data').reduce((p, c) => {
    const content = JSON.parse(fs.readFileSync('./data/' + c));
    const collection = c.slice(0, -5);
    p[collection] = {};
    for (let endpoint in content) {
        p[collection][endpoint] = content[endpoint];
    }
    return p;
}, {});

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
dataService.delete(':collection', actions.delete);

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = dataService.parseRequest;