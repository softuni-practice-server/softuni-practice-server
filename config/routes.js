const controllers = require('../controllers');
const config = require('./config');

module.exports = (app, endpoints) => {
    for (let controller in controllers) {
        // TODO skip user controller
        // TODO provide generic controller with validation from config
        app.get('/' + controller, controllers[controller].get);
        app.post('/' + controller, controllers[controller].post);
        app.get('/' + controller + '/:id', controllers[controller].getById);
        app.post('/' + controller + '/:id', controllers[controller].postById);
        app.delete('/' + controller + '/:id', controllers[controller].deleteById);
    }

    // TODO add user controller

    // Handshake
    // TODO return version information and directions to request endpoint docs
    app.get('/', (req, res) => {
        res.json({message: 'API service listenning for request'});
    });
    
    app.all('*', (req, res) => {
        res.status(404);
        res.end('404 Not Found');
    });

    /*
    app.get('*', (req, res) => {
        res.end('./static/index.html');
    });
    */
};