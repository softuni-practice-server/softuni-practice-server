const fs = require('fs');


const data = fs.readdirSync('./data').reduce((p, c) => {
    const content = JSON.parse(fs.readFileSync('./data/' + c));
    for (let endpoint in content) {
        p[endpoint] = content[endpoint];
    }
    return p;
}, {});

const controllers = {
    get: (req, res) => {
        let responseData = data;
        for (let token of req.tokens) {
            if (responseData !== undefined) {
                responseData = responseData[token];
            }
        }
        return responseData;
    },
    post: (req, res) => {
        const body = req.body;
        console.log('Request body:\n', body);

        // TODO handle collisions, replacement
        let responseData = data;
        for (let token of req.tokens) {
            if (responseData.hasOwnProperty(token) == false) {
                responseData[token] = {};
            }
            responseData = responseData[token];
        }

        const newId = uuid();
        responseData[newId] = Object.assign({}, body, { _id: newId });
        return responseData[newId];
    },
    put: (req, res) => {
        const body = req.body;
        console.log('Request body:\n', body);

        let responseData = data;
        for (let token of req.tokens) {
            if (responseData !== undefined) {
                responseData = responseData[token];
            }
        }
        if (responseData !== undefined) {
            Object.assign(responseData, body);
        }
        return responseData;
    },
    delete: (req, res) => {
        let responseData = data;

        for (let i = 0; i < req.tokens.length; i++) {
            const token = req.tokens[i];
            if (responseData.hasOwnProperty(token) == false) {
                return null;
            }
            if (i == req.tokens.length - 1) {
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