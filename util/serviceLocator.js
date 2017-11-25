const services = {};

module.exports = {
    initialize: config => {
        switch (config.storage) {
            case 'memory':
                services.storage = require('../storage/memoryStorage');
                break;
        }
        return services;
    },
    services
}