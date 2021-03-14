/*
 * This service requires storage and auth plugins
 */
const Service = require('./Service');
const crud = require('../common/crud');
const { isAuthenticated, isOwner } = require('../common/acl');


const dataService = new Service();
dataService.get(':collection', crud.get);
dataService.post(':collection', isAuthenticated(crud.post));
dataService.put(':collection', isOwner(crud.put));
dataService.delete(':collection', isOwner(crud.delete));

module.exports = dataService.parseRequest;