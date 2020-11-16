const http = require('http');
const controllers = require('./crud');

const server = http.createServer(async function (req, res) {
    console.info(`Receiving ${req.method} request at ${req.url}`);

    const tokens = req.url.split('/').filter(t => t.length > 0).map(t => t.replace('.json', ''));

    const responseData = await controllers[req.method.toLocaleLowerCase()](req, res, tokens);

    if (responseData !== null) {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(responseData));
    } else {
        res.writeHead(404, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
        });
        res.end('Error 404: Data not found\n');
    }
});

const port = 3000;
server.listen(port);
console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);