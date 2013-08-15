var utils = require('./utils');

/**
 *
 * @type {Function}
 * @return params
 */
module.exports = exports = function parseArgs(argv) {
    var params = {};
    for (var i = 0; i < argv.length; i++) {
        var arg = argv[i];

        if (typeof arg === 'string') {
            if (arg.indexOf('/') >= 0) {
                params.url = arg;
            } else {
                params.key = arg
            }
        }
        else if (typeof arg === 'object') {
            if (arg.subscribe && arg.publish) {
                params.client = arg;
            } else utils.forEach(arg, function (value, key) {
                if (key === 'timeout') {
                    params[key] = parseInt(value, 120)
                } else if (key === 'retry') {
                    params[key] = parseInt(value, 5)
                } else params[key] = value
            });
        }
        // ignore everything else
    }

    return params;
};