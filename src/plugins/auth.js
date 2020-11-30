const crypto = require('crypto');
const { ConflictError, CredentialError, RequestError } = require('../common/errors');

function initPlugin(settings) {
    const identity = settings.identity;

    return function decorateContext(context, request) {
        context.auth = {
            register,
            login,
            logout
        };

        const userToken = request.headers['user-token'];
        if (userToken !== undefined) {
            let user;
            const session = findSessionByToken(userToken);
            if (session !== undefined) {
                const userData = context.storage.get('users', session.userId);
                if (userData !== undefined) {
                    user = userData;
                }
            }
            if (user !== undefined) {
                context.user = user;
            } else {
                throw new CredentialError('Invalid access token');
            }
        }

        function register(body) {
            if (body.hasOwnProperty(identity) === false ||
                body.hasOwnProperty('password') === false ||
                body[identity].length == 0 ||
                body.password.length == 0) {
                throw new RequestError('Missing fields');
            } else if (context.storage.query('users', { [identity]: body[identity] }).length !== 0) {
                throw new ConflictError(`A user with the same ${identity} already exists`);
            } else {
                const newUser = {
                    [identity]: body[identity],
                    hashedPassword: hash(body.password)
                };
                const result = context.storage.add('users', newUser);
                delete result.hashedPassword;

                const session = saveSession(result._id);
                result.accessToken = session.accessToken;

                return result;
            }
        }

        function login(body) {
            const targetUser = context.storage.query('users', { [identity]: body[identity] });
            if (targetUser.length == 1) {
                if (hash(body.password) === targetUser[0].hashedPassword) {
                    const result = targetUser[0];
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                } else {
                    throw new CredentialError('Login or password don\'t match');
                }
            } else {
                throw new CredentialError('Login or password don\'t match');
            }
        }

        function logout() {
            if (context.user !== undefined) {
                const session = findSessionByUserId(context.user._id);
                if (session !== undefined) {
                    context.storage.delete('sessions', session._id);
                }
            } else {
                throw new CredentialError('User session does not exist');
            }
        }

        function saveSession(userId) {
            let session = context.storage.add('sessions', { userId });
            const accessToken = hash(session._id);
            session = context.storage.set('sessions', session._id, Object.assign({ accessToken }, session));
            return session;
        }

        function findSessionByToken(userToken) {
            return context.storage.query('sessions', { accessToken: userToken })[0];
        }

        function findSessionByUserId(userId) {
            return context.storage.query('sessions', { userId })[0];
        }
    };
}


const secret = 'This is not a production server';

function hash(string) {
    const hash = crypto.createHmac('sha256', secret);
    hash.update(string);
    return hash.digest('hex');
}

module.exports = initPlugin;