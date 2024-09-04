const { ServiceError } = require('./common/errors');


function createHandler(plugins, services) {
    return async function handler(req, res) {
        const method = req.method;
        console.info(`<< ${req.method} ${req.url}`);

        // Redirect fix for admin panel relative paths
        if (req.url.slice(-6) == '/admin') {
            res.writeHead(302, {
                'Location': `http://${req.headers.host}/admin/`
            });
            return res.end();
        }

        let status = 200;
        let headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        };
        let result = '';
        let context;

        // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
        if (method == 'OPTIONS') {
            Object.assign(headers, {
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Credentials': false,
                'Access-Control-Max-Age': '86400',
                'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
            });
        } else {
            try {
                context = processPlugins();
                await handle(context);
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

        res.writeHead(status, headers);
        if (context != undefined && context.util != undefined && context.util.throttle) {
            await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        }
        res.end(result);

        function processPlugins() {
            const context = { params: {} };
            plugins.forEach(decorate => decorate(context, req));
            return context;
        }

        async function handle(context) {
            const { serviceName, tokens, query, body } = await parseRequest(req);
            if (serviceName == 'admin') {
                return ({ headers, result } = services['admin'](method, tokens, query, body));
            } else if (serviceName == 'favicon.ico') {
                return ({ headers, result } = services['favicon'](method, tokens, query, body));
            }

            const service = services[serviceName];

            if (service === undefined) {
                status = 400;
                result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                console.error('Missing service ' + serviceName);
            } else {
                result = await service(context, { method, tokens, query, body });
            }

            // NOTE: logout does not return a result
            // in this case the content type header should be omitted, to allow checks on the client
            if (result !== undefined) {
                result = JSON.stringify(result);
            } else {
                status = 204;
                delete headers['Content-Type'];
            }
        }
    };
}



function composeErrorObject(code, message) {
    return JSON.stringify({
        code,
        message
    });
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
        .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v.replace(/\+/g, " ")) }), {});

    let body;
    // If req stream has ended body has been parsed
    if (req.readableEnded) {
        body = req.body;
    } else {
        body = await parseBody(req);
    }

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
