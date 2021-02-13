const { ServiceError } = require('./common/errors');


function createHandler(plugins, services) {
    return async function handler(req, res) {
        const method = req.method;
        console.info(`<< ${req.method} ${req.url}`);

        let status = 200;
        let headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        };
        let result;

        if (method == 'OPTIONS') {
            Object.assign(headers, {
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Credentials': false,
                'Access-Control-Max-Age': '86400',
                'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization'
            });
        } else {           
            await handle();
        }

        res.writeHead(status, headers);
        res.end(result);

        async function handle() {
            const { serviceName, tokens, query, body } = await parseRequest(req);
            // TODO: handle dev console requests (via web interface)
            if (serviceName == 'admin') {
                return ({headers, result} = services['admin'](method, tokens, query, body));
            }

            const service = services[serviceName];

            if (service === undefined) {
                status = 400;
                result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
            } else {
                try {
                    const context = { params: {} };
                    plugins.forEach(decorate => decorate(context, req)); // Decorate context with plugin functionality

                    result = await service(context, { method, tokens, query, body });
                } catch (err) {
                    if (err instanceof ServiceError) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            // NOTE: currently there is no scenario where result is undefined - it will either be data, or an error object;
            // this may change with further extension of the services, so this check should stay in place
            if (result !== undefined) {
                result = JSON.stringify(result);
            }
        }
    };
}

function composeErrorObject(code, message) {
    return {
        code,
        message
    };
}

async function parseRequest(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tokens = url.pathname.split('/').filter(x => x.length > 0);
    const serviceName = tokens.shift();
    const queryString = url.search.split('?')[1] || '';
    const query = queryString
        .split('&')
        .filter(s => s != '')
        .map(x => x.split('='))
        .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }), {});
    const body = await parseBody(req);

    return {
        serviceName,
        tokens,
        query,
        body
    };
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                resolve(body);
            }
        });
    });
}

module.exports = createHandler;