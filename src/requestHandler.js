function createHandler(services) {
    return async function handler(req, res) {
        const method = req.method.toLocaleLowerCase();
        console.info(`<< ${req.method} ${req.url}`);
    
        let status = 200;
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        };
        let result;
    
        if (method == 'options') {
            Object.assign(headers, {
                'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Credentials': false,
                'Access-Control-Max-Age': '86400',
                'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
            });
        } else {
            // TODO handle dev console requests
    
            const { service, tokens, query, body } = await parseRequest(req);
    
            try {
                result = await services[service][method](tokens, query, body);
            } catch (err) {
                // TODO handle credential/authorization/conflict errors
                console.error(err);
                status = 400;
                headers['Content-Type'] = 'text/plain';
                result = 'Error 400: Bad Request';
            }
    
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
    };
}

async function parseRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tokens = url.pathname.split('/').filter(x => x.length > 0);
    const service = tokens.shift();
    const query = url.search
        .split('?')
        .slice(1)
        .filter(x => x.length > 0)
        .map(x => x.split('='))
        .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {});
    const body = await parseBody(req);

    return {
        service,
        tokens,
        query,
        body
    };
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => body += chunk.toString());
        req.on('end', () => resolve(JSON.parse(body)));
    });
}

module.exports = createHandler;