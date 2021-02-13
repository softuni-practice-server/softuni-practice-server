/*
 * This service requires storage and auth plugins
 */

const Service = require('./Service');


const userService = new Service();

userService.post('register', onRegister);
userService.post('login', onLogin);
userService.get('logout', onLogout);
// TODO: get user details

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