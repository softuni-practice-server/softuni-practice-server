module.exports = {
    get: (req, res) => {
        setTimeout(() => {
            res.json({data: 'hello'});            
        }, 1000);
    },
    post: (req, res) => {
        console.log('Received data:');
        console.log(req.body.data);
        res.end();
    }
};