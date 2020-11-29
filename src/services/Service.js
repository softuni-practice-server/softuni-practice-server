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
    parseRequest(context, request) {
        for (let {method, name, handler} of this._actions) {
            if (method === request.method && name === request.tokens[0]) {
                return handler(context, request.tokens.slice(1), request.query, request.body);
            }
        }
    }

    /**
     * Register service action
     * @param {string} method HTTP method
     * @param {string} name Action name
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    registerAction(method, name, handler) {
        this._actions.push({method, name, handler});
    }

    /**
     * Register GET action
     * @param {string} name Action name
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    get(name, handler) {
        this.registerAction('GET', name, handler);
    }

    /**
     * Register POST action
     * @param {string} name Action name
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    post(name, handler) {
        this.registerAction('POST', name, handler);
    }

    /**
     * Register PUT action
     * @param {string} name Action name
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    put(name, handler) {
        this.registerAction('PUT', name, handler);
    }

    /**
     * Register DELETE action
     * @param {string} name Action name
     * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
     */
    delete(name, handler) {
        this.registerAction('DELETE', name, handler);
    }
}

module.exports = Service;