/*
 * This service requires storage and auth plugins
 */

const { AuthorizationError } = require('../common/errors');
const Service = require('./Service');


const userService = new Service();

userService.get('me', getSelf);
userService.post('register', onRegister);
userService.post('login', onLogin);
userService.get('logout', onLogout);


function getSelf(context, tokens, query, body) {
    if (context.user) {
        const result = Object.assign({}, context.user);
        delete result.hashedPassword;
        return result;
    } else {
        throw new AuthorizationError();
    }
}

function onRegister(context, tokens, query, body) {
    return context.auth.register(body);
}

function onLogin(context, tokens, query, body) {
    return context.auth.login(body);
}

function onLogout(context, tokens, query, body) {
    return context.auth.logout();
}

module.exports = userService.parseRequest;