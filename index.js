const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
require('./util/service-locator').initialize(config);

require('./config/database')(config);
const storage = require('./config/storage')(config);
const app = require('express')();
require('./config/express')(app, storage);
require('./config/routes')(app);
require('./config/passport')(app);

app.listen(config.port);
console.log('Listening on port ' + config.port);