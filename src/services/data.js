/*
 * This service requires storage and auth plugins
 */
const Service = require('./Service');
const crud = require('../common/crud');


const dataService = new Service();
dataService.get(':collection', crud.get);
dataService.post(':collection', crud.post);
dataService.put(':collection', crud.put);
dataService.patch(':collection', crud.patch);
dataService.delete(':collection', crud.delete);

module.exports = dataService.parseRequest;