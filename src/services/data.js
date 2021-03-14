/*
 * This service requires storage and auth plugins
 */
const { AuthorizationError } = require('../common/errors');
const Service = require('./Service');
const crud = require('../common/crud');


const dataService = new Service();
dataService.get(':collection', crud.get);
dataService.post(':collection', crud.post);
dataService.put(':collection', crud.put);
dataService.delete(':collection', crud.delete);

module.exports = dataService.parseRequest;