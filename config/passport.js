const passport = require('passport');
const localSignupStrategy = require('../util/local-signup');
const localLoginStrategy = require('../util/local-login');

module.exports = (app) => {
    app.use(passport.initialize());

    passport.use('local-signup', localSignupStrategy);
    passport.use('local-login', localLoginStrategy);
}