const { NotFoundError, RequestError } = require('./errors');


module.exports = {
    get,
    post,
    put,
    patch,
    delete: del
};


function validateRequest(context, tokens, query) {
    /*
    if (context.params.collection == undefined) {
        throw new RequestError('Please, specify collection name');
    }
    */
    if (tokens.length > 1) {
        throw new RequestError();
    }
}

function parseWhere(query) {
    const operators = {
        '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
        '<': (prop, value) => record => record[prop] < JSON.parse(value),
        '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
        '>': (prop, value) => record => record[prop] > JSON.parse(value),
        '=': (prop, value) => record => record[prop] == JSON.parse(value),
        ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
        ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
    };
    const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

    try {
        let clauses = [query.trim()];
        let check = (a, b) => b;
        let acc = true;
        if (query.match(/ and /gi)) {
            // inclusive
            clauses = query.split(/ and /gi);
            check = (a, b) => a && b;
            acc = true;
        } else if (query.match(/ or /gi)) {
            // optional
            clauses = query.split(/ or /gi);
            check = (a, b) => a || b;
            acc = false;
        }
        clauses = clauses.map(createChecker);

        return (record) => clauses
            .map(c => c(record))
            .reduce(check, acc);
    } catch (err) {
        throw new Error('Could not parse WHERE clause, check your syntax.');
    }

    function createChecker(clause) {
        let [match, prop, operator, value] = pattern.exec(clause);
        [prop, value] = [prop.trim(), value.trim()];

        return operators[operator.toLowerCase()](prop, value);
    }
}


function get(context, tokens, query, body) {
    validateRequest(context, tokens, query);

    let responseData;

    try {
        if (query.where) {
            responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
        } else if (context.params.collection) {
            responseData = context.storage.get(context.params.collection, tokens[0]);
        } else {
            // Get list of collections
            return context.storage.get();
        }

        if (query.sortBy) {
            const props = query.sortBy
                .split(',')
                .filter(p => p != '')
                .map(p => p.split(' ').filter(p => p != ''))
                .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

            // Sorting priority is from first to last, therefore we sort from last to first
            for (let i = props.length - 1; i >= 0; i--) {
                let { prop, desc } = props[i];
                responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                    if (typeof propA == 'number' && typeof propB == 'number') {
                        return (propA - propB) * (desc ? -1 : 1);
                    } else {
                        return propA.localeCompare(propB) * (desc ? -1 : 1);
                    }
                });
            }
        }

        if (query.offset) {
            responseData = responseData.slice(Number(query.offset) || 0);
        }
        const pageSize = Number(query.pageSize) || 10;
        if (query.pageSize) {
            responseData = responseData.slice(0, pageSize);
        }
		
		if (query.distinct) {
            const props = query.distinct.split(',').filter(p => p != '');
            responseData = Object.values(responseData.reduce((distinct, c) => {
                const key = props.map(p => c[p]).join('::');
                if (distinct.hasOwnProperty(key) == false) {
                    distinct[key] = c;
                }
                return distinct;
            }, {}));
        }

        if (query.count) {
            return responseData.length;
        }

        if (query.select) {
            const props = query.select.split(',').filter(p => p != '');
            responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

            function transform(r) {
                const result = {};
                props.forEach(p => result[p] = r[p]);
                return result;
            }
        }

        if (query.load) {
            const props = query.load.split(',').filter(p => p != '');
            props.map(prop => {
                const [propName, relationTokens] = prop.split('=');
                const [idSource, collection] = relationTokens.split(':');
                console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const seekId = r[idSource];
                    const related = storageSource.get(collection, seekId);
                    delete related.hashedPassword;
                    r[propName] = related;
                    return r;
                }
            });
        }

    } catch (err) {
        console.error(err);
        if (err.message.includes('does not exist')) {
            throw new NotFoundError();
        } else {
            throw new RequestError(err.message);
        }
    }

    context.canAccess(responseData);

    return responseData;
}

function post(context, tokens, query, body) {
    console.log('Request body:\n', body);

    validateRequest(context, tokens, query);
    if (tokens.length > 0) {
        throw new RequestError('Use PUT to update records');
    }
    context.canAccess(undefined, body);

    body._ownerId = context.user._id;
    let responseData;

    try {
        responseData = context.storage.add(context.params.collection, body);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}

function put(context, tokens, query, body) {
    console.log('Request body:\n', body);

    validateRequest(context, tokens, query);
    if (tokens.length != 1) {
        throw new RequestError('Missing entry ID');
    }

    let responseData;
    let existing;

    try {
        existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
        throw new NotFoundError();
    }

    context.canAccess(existing, body);

    try {
        responseData = context.storage.set(context.params.collection, tokens[0], body);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}

function patch(context, tokens, query, body) {
    console.log('Request body:\n', body);

    validateRequest(context, tokens, query);
    if (tokens.length != 1) {
        throw new RequestError('Missing entry ID');
    }

    let responseData;
    let existing;

    try {
        existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
        throw new NotFoundError();
    }

    context.canAccess(existing, body);

    try {
        responseData = context.storage.merge(context.params.collection, tokens[0], body);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}

function del(context, tokens, query, body) {
    validateRequest(context, tokens, query);
    if (tokens.length != 1) {
        throw new RequestError('Missing entry ID');
    }

    let responseData;
    let existing;

    try {
        existing = context.storage.get(context.params.collection, tokens[0]);
    } catch (err) {
        throw new NotFoundError();
    }

    context.canAccess(existing);

    try {
        responseData = context.storage.delete(context.params.collection, tokens[0]);
    } catch (err) {
        throw new RequestError();
    }

    return responseData;
}