class Service {
    constructor() {
        this._actions = [];
        this.parseRequest = this.parseRequest.bind(this);
    }

    /**
     * Handle service request, after it has been processed by a request handler
     * @param {*} context Execution context, contains result of middleware processing
     * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
     */
    async parseRequest(context, request) {
        for (let { method, name, handler } of this._actions) {
            if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                return await handler(context, request.tokens.slice(1), request.query, request.body);
            }
        }
    }

    /**
     * Register service action
     * @param {string} method HTTP method
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    registerAction(method, name, handler) {
        this._actions.push({ method, name, handler });
    }

    /**
     * Register GET action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    get(name, handler) {
        this.registerAction('GET', name, handler);
    }

    /**
     * Register POST action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    post(name, handler) {
        this.registerAction('POST', name, handler);
    }

    /**
     * Register PUT action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    put(name, handler) {
        this.registerAction('PUT', name, handler);
    }

    /**
     * Register PATCH action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    patch(name, handler) {
        this.registerAction('PATCH', name, handler);
    }

    /**
     * Register DELETE action
     * @param {string} name Action name. Can be a glob pattern.
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    delete(name, handler) {
        this.registerAction('DELETE', name, handler);
    }
}

function matchAndAssignParams(context, name, pattern) {
    if (pattern == '*') {
        return true;
    } else if (pattern[0] == ':') {
        context.params[pattern.slice(1)] = name;
        return true;
    } else if (name == pattern) {
        return true;
    } else {
        return false;
    }
}

module.exports = Service;