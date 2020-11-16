const controllers = require('./crud');


async function handler(req, res) {
    console.info(`Receiving ${req.method} request at ${req.url}`);

    let status = 200;
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };
    let result;

    if (req.method == 'OPTIONS') {
        Object.assign(headers, {
            'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Credentials': false,
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
        });
    } else {
        await decorateRequest(req);

        result = await controllers[req.method.toLocaleLowerCase()](req, res);

        if (result !== undefined) {
            result = JSON.stringify(result);
        } else {
            status = 404;
            headers['Content-Type'] = 'text/plain';
            result = 'Error 404: Data Not Found';
        }
    }

    res.writeHead(status, headers);
    res.end(result);
}

async function decorateRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    req.tokens = url.pathname.split('/').filter(x => x.length > 0);
    req.query = url.search
        .split('?')
        .slice(1)
        .filter(x => x.length > 0)
        .map(x => x.split('='))
        .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {});
    req.body = await parseBody(req);
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => body += chunk.toString());
        req.on('end', () => resolve(JSON.parse(body)));
    });
}

module.exports = handler;