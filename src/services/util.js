/*
 * This service requires util plugin
 */

const Service = require('./Service');


const utilService = new Service();

utilService.post('*', onRequest);
utilService.get(':service', getStatus);

function getStatus(context, tokens, query, body) {
    return context.util[context.params.service];
}

function onRequest(context, tokens, query, body) {
    Object.entries(body).forEach(([k,v]) => {
        console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
        context.util[k] = v;
    });
    return '';
}

module.exports = utilService.parseRequest;