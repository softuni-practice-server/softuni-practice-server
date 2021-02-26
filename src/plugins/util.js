function initPlugin(settings) {
    const util = {
        throttle: false
    };

    return function decoreateContext(context, request) {
        context.util = util;
    };
}

module.exports = initPlugin;