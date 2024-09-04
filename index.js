const http = require('http');
const createHandler = require('./src/requestHandler');
const services = require('./src/services');
const createStorage = require('./src/plugins/storage');
const createAuth = require('./src/plugins/auth');
const createUtil = require('./src/plugins/util');
const createRules = require('./src/plugins/rules');

const settings = require('./settings.json');

const plugins = [
    createStorage(settings),
    createAuth(settings),
    createUtil(settings),
    createRules(settings)
];

const server = http.createServer(createHandler(plugins, services));

const port = 3030;

server.listen(port);

console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
console.log(`Admin panel located at http://localhost:${port}/admin`);

module.exports = server;
