const controllers = require('../controllers');

module.exports = app => {
    app.get('/data', controllers.data.get);
    app.post('/data', controllers.data.post);

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