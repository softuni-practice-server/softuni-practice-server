module.exports = (method, tokens, query, body) => {
    return {
        headers:  {
            'Content-Type': 'text/html'
        },
        result: 'Hello there'
    };
};