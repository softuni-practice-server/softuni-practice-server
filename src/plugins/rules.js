/*
 * This plugin requires auth and storage plugins
 */
const { RequestError, ConflictError, CredentialError, AuthorizationError } = require('../common/errors');

function initPlugin(settings) {
    const actions = {
        'GET': '.read',
        'POST': '.create',
        'PUT': '.update',
        'PATCH': '.update',
        'DELETE': '.delete'
    };
    const rules = Object.assign({
        '*': {
            '.create': ['User'],
            '.update': ['Owner'],
            '.delete': ['Owner']
        }
    }, settings.rules);

    return function decorateContext(context, request) {
        // special rules (evaluated at run-time)
        const get = (collectionName, id) => {
            return context.storage.get(collectionName, id);
        };
        const isOwner = (user, object) => {
            return user._id == object._ownerId;
        };
        context.rules = {
            get,
            isOwner
        };
        const isAdmin = request.headers.hasOwnProperty('x-admin');

        context.canAccess = canAccess;

        function canAccess(data, newData) {
            const user = context.user;
            const action = actions[request.method];
            let { rule, propRules } = getRule(action, context.params.collection, data);

            if (Array.isArray(rule)) {
                rule = checkRoles(rule, data, newData);
            } else if (typeof rule == 'string') {
                rule = !!(eval(rule));
            }
            if (!rule && !isAdmin) {
                throw new CredentialError();
            }
            propRules.map(r => applyPropRule(action, r, user, data, newData));
        }

        function applyPropRule(action, [prop, rule], user, data, newData) {
            // NOTE: user needs to be in scope for eval to work on certain rules
            if (typeof rule == 'string') {
                rule = !!eval(rule);
            }

            if (rule == false) {
                if (action == '.create' || action == '.update') {
                    delete newData[prop];
                } else if (action == '.read') {
                    delete data[prop];
                }
            }
        }

        function checkRoles(roles, data, newData) {
            if (roles.includes('Guest')) {
                return true;
            } else if (!context.user && !isAdmin) {
                throw new AuthorizationError();
            } else if (roles.includes('User')) {
                return true;
            } else if (context.user && roles.includes('Owner')) {
                return context.user._id == data._ownerId;
            } else {
                return false;
            }
        }
    };



    function getRule(action, collection, data = {}) {
        let currentRule = ruleOrDefault(true, rules['*'][action]);
        let propRules = [];

        // Top-level rules for the collection
        const collectionRules = rules[collection];
        if (collectionRules !== undefined) {
            // Top-level rule for the specific action for the collection
            currentRule = ruleOrDefault(currentRule, collectionRules[action]);

            // Prop rules
            const allPropRules = collectionRules['*'];
            if (allPropRules !== undefined) {
                propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
            }

            // Rules by record id 
            const recordRules = collectionRules[data._id];
            if (recordRules !== undefined) {
                currentRule = ruleOrDefault(currentRule, recordRules[action]);
                propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
            }
        }

        return {
            rule: currentRule,
            propRules
        };
    }

    function ruleOrDefault(current, rule) {
        return (rule === undefined || rule.length === 0) ? current : rule;
    }

    function getPropRule(record, action) {
        const props = Object
            .entries(record)
            .filter(([k]) => k[0] != '.')
            .filter(([k, v]) => v.hasOwnProperty(action))
            .map(([k, v]) => [k, v[action]]);

        return props;
    }
}

module.exports = initPlugin;


/* example rules */

/* grant or deny for all requests */
const r_grant = true;
const r_deny = false;

/* limit to role */
const r_role = ["Guest", "User", "Owner", "Admin"];

/* execute code (user and data will be available in scope, as well as soem special predicates)*/
const r_replace = 'data.status = \'pending\'';
const r_code = 'user.id == parent(\'teams\', data.teamId)';


/* example ACLs */

/* all records in a collection */
const r_collection = {
    'myCollection': {
        '.create': true,
        '.read': true,
        '.update': true,
        '.delete': true,
    }
};

/* specific record by id */
const r_byId = {
    'myCollection': {
        'objectId-1234-asdf': {
            '.read': true,
        }
    }
};

/* combined all records and more specific for single record */
const r_combinedById = {
    'myCollection': {
        '.read': true,
        'objectId-1234-asdf': {
            '.read': false,
        }
    }
};

/* rules for individual properties inside records (can also be combined with per-record rules) */
const r_byProp = {
    'myCollection': {
        '*': {
            'propName1': {
                '.update': false
            },
            'propName2': {
                '.create': false
            },
        }
    }
};