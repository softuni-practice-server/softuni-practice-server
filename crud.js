const fs = require('fs');

const data = fs.readdirSync('./data').reduce((p, c) => {
    const content = JSON.parse(fs.readFileSync('./data/' + c));
    for (let endpoint in content) {
        p[endpoint] = content[endpoint];
    }
    return p;
}, {});

const controllers = {
    get: (req, res, tokens) => {
        let responseData = data;
        for (let token of tokens) {
            if (responseData.hasOwnProperty(token)) {
                responseData = responseData[token];
            } else {
                return null;
            }
        }
        return responseData;
    },
    post: async (req, res, tokens) => {
        const body = await parseBody(req);
        console.log('Request body:\n', body);

        let responseData = data;
        for (let token of tokens) {
            if (responseData.hasOwnProperty(token) == false) {
                responseData[token] = {};
            }
            responseData = responseData[token];
        }
        if (Object.keys(body).length == 1) {
            const firstKey = Object.keys(body)[0];
            responseData[firstKey] = body[firstKey];
            return body;
        } else {
            const newId = uuid();
            responseData[newId] = body;
            return {
                [newId]: body
            };
        }
    },
    put: async (req, res, tokens) => {
        const body = await parseBody(req);
        console.log('Request body:\n', body);

        let responseData = data;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (responseData.hasOwnProperty(token) == false) {
                return null;
            }
            if (i == tokens.length - 1) {
                responseData[token] = body;
                return body;
            } else {
                responseData = responseData[token];
            }
        }
    },
    delete: (req, res, tokens) => {
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
    },
    options: (req, res, tokens) => {
        const headers = {};

        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS';
        headers['Access-Control-Allow-Credentials'] = false;
        headers['Access-Control-Max-Age'] = '86400'; // 24 hours
        headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept';

        res.writeHead(200, headers);
        res.end();
    }
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => body += chunk.toString());
        req.on('end', () => resolve(JSON.parse(body)));
    });
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = controllers;