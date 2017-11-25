// TODO get seed data from config

const seed = require('./seed.json');

module.exports = () => {
    return require('../util/serviceLocator').services.storage(seed); 
};