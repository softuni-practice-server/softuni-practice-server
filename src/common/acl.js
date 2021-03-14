const { CredentialError, AuthorizationError } = require('./errors');


module.exports = {
    isAuthenticated,
    isOwner
};

function isAuthenticated(handler) {
    return (context, tokens, query, body) => {
        if (context.user) {
            return handler(context, tokens, query, body);
        } else {
            throw new AuthorizationError();
        }
    };
}

function isOwner(handler) {
    return (context, tokens, query, body) => {
        if (context.user) {
            context.canAccess = canAccess;
            return handler(context, tokens, query, body);
        } else {
            throw new AuthorizationError();
        }

        function canAccess(record) {
            if (record._ownerId != context.user._id) {
                throw new CredentialError();
            }
        };
    };
}