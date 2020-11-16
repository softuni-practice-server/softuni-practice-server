const fs = require('fs');


const data = fs.readdirSync('./data').reduce((p, c) => {
    const content = JSON.parse(fs.readFileSync('./data/' + c));
    for (let endpoint in content) {
        p[endpoint] = content[endpoint];
    }
    return p;
}, {});

const controllers = {
    get: (tokens, query, body) => {
        let responseData = data;
        for (let token of tokens) {
            if (responseData !== undefined) {
                responseData = responseData[token];
            }
        }
        return responseData;
    },
    post: (tokens, query, body) => {
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
    put: (tokens, query, body) => {
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
    delete: (tokens, query, body) => {
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

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = controllers;