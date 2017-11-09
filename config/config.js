module.exports = {
    development: {
        port: process.env.PORT || 8080,
        dbPath: 'mongodb://localhost:27017/demo-server-db',
        useDb: false
    },
    production: {}
};