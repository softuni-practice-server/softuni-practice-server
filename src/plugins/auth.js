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

        const userToken = request.headers['x-authorization'];
        if (userToken !== undefined) {
            let user;
            const session = findSessionByToken(userToken);
            if (session !== undefined) {
                const userData = context.protectedStorage.get('users', session.userId);
                if (userData !== undefined) {
                    console.log('Authorized as ' + userData[identity]);
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
            } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                throw new ConflictError(`A user with the same ${identity} already exists`);
            } else {
                const newUser = Object.assign({}, body, {
                    [identity]: body[identity],
                    hashedPassword: hash(body.password)
                });
                const result = context.protectedStorage.add('users', newUser);
                delete result.hashedPassword;

                const session = saveSession(result._id);
                result.accessToken = session.accessToken;

                return result;
            }
        }

        function login(body) {
            const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
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
                    context.protectedStorage.delete('sessions', session._id);
                }
            } else {
                throw new CredentialError('User session does not exist');
            }
        }

        function saveSession(userId) {
            let session = context.protectedStorage.add('sessions', { userId });
            const accessToken = hash(session._id);
            session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
            return session;
        }

        function findSessionByToken(userToken) {
            return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
        }

        function findSessionByUserId(userId) {
            return context.protectedStorage.query('sessions', { userId })[0];
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