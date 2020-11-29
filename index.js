const http = require('http');
const createHandler = require('./src/requestHandler');
const services = require('./services');


const server = http.createServer(createHandler(services));

const port = 3000;
server.listen(port);
console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);