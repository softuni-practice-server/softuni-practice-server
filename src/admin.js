const fs = require('fs');

const files = {
    index: fs.readFileSync('./client/index.html', 'utf-8')
};

module.exports = (method, tokens, query, body) => {
    const headers = {
        'Content-Type': 'text/html'
    };
    let result = '';

    const resource = tokens[0];
    if (resource && resource.split('.').pop() == 'js') {
        headers['Content-Type'] = 'application/javascript';

        files[resource] = files[resource] || fs.readFileSync('./client/' + resource, 'utf-8');
        result = files[resource];
    } else {
        result = files.index;
    }

    return {
        headers,
        result
    };
};