const crypto = require('crypto');
const registry = require('../storage')({ users: {}, sessions: {} });


// TODO: user properties defined in settings file

const methods = {
    get: (tokens, query, body) => {
        if (tokens.length > 1) {
            throw new Error('Invalid route');
        }
        const action = tokens[0] || 'query';
        return postControllers[action](tokens.slice(1), query, body);
    },
    post: (tokens, query, body) => {
        if (tokens.length > 1) {
            throw new Error('Invalid route');
        }
        const action = tokens[0] || 'register';
        return postControllers[action](tokens.slice(1), query, body);
    }
};

const postControllers = {
    register: (tokens, query, body) => {
        // TODO add body validation
        if (registry.query('users', { email: body.email }).length !== 0) {
            // email exists
            // TODO throw specific error type to allow downstack handling
            throw new Error('Email already registered');
        } else {
            const newUser = {
                email: body.email,
                hashedPassword: hash(body.password)
            };
            const result = registry.add('users', newUser);
            delete result.hashedPassword;
            return result;
        }
    },
    login: (tokens, query, body) => {
        const targetUser = registry.query('users', { email: body.email });
        if (targetUser.length == 1) {
            if (hash(body.password) === targetUser[0].hashedPassword) {
                const result = targetUser[0];
                delete result.hashedPassword;
                // TODO add expiration
                const session = registry.add('sessions', { userId: result._id });
                result.accessToken = hash(session._id);

                return result;
            } else {
                throw new Error('Email or password don\'t match');
            }
        } else {
            throw new Error('Email or password don\'t match');
        }
    }
};

const getControllers = {
    query: (tokens, query, body) => {

    },
    logout: (tokens, query, body) => {

    }
};


const secret = 'This is not a production server';

function hash(string) {
    const hash = crypto.createHmac('sha256', secret);
    hash.update(string);
    return hash.digest('hex');
}

module.exports = methods;