const env = process.env.NODE_ENV || 'development';

const config = require('./config/config')[env];
require('./config/database')(config);
require('./util/serviceLocator').initialize(config);
const storage = require('./config/storage')();

const app = require('express')();
require('./config/express')(app, storage);
require('./config/routes')(app, config.endpoints);
app.listen(config.port);
console.log('Listening on port ' + config.port);