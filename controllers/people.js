module.exports = {
    get: (req, res) => {
        setTimeout(() => {
            res.json({data: 'hello'});            
        }, 5000);
    },
    post: (req, res) => {
        console.log('Received data:');
        console.log(req.body.data);
        res.end();
    },
    getById: () => {},
    postById: () => {},
    deleteById: () => {}
};