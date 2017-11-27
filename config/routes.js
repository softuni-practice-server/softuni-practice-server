const controllers = require('../controllers');

module.exports = (app, endpoints) => {
    /*
    for (let controller in controllers.custom) {
        // TODO provide generic controller with validation from config
        app.get('/' + controller, controllers.custom[controller].get);
        app.post('/' + controller, controllers.custom[controller].post);
        app.get('/' + controller + '/:id', controllers.custom[controller].getById);
        app.post('/' + controller + '/:id', controllers.custom[controller].postById);
        app.delete('/' + controller + '/:id', controllers.custom[controller].deleteById);
    }
    */

    app.post('/user', controllers.auth.signup);
    app.post('/user/login', controllers.auth.login);

    // Handshake
    // TODO return version information and directions to request endpoint docs
    app.get('/', (req, res) => {
        res.json({ message: 'API service listening for request' });
    });

    // Collection access
    app.get('/data/:collection', controllers.collection.get);
    app.post('/data/:collection', controllers.collection.post);
    app.get('/data/:collection/:id', controllers.collection.getById);
    app.post('/data/:collection/:id', controllers.collection.postById);
    app.delete('/data/:collection/:id', controllers.collection.deleteById);

    // 404
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