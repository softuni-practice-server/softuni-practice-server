const http = require('http');
const handler = require('./src/requestHandler');


const server = http.createServer(handler);

const port = 3000;
server.listen(port);
console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);