
/**
 * This method returns the first argument passed to it.
 *
 * @example
 *
 * var moe = { 'name': 'moe' };
 * moe === _.identity(moe);
 * // => true
 */
function identity(value) {
    return value;
}

/** Used to determine if values are of the language type Object */
var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
};

var utils = {

    keys: function(object) {
        var result = [];
        for (var key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                result.push(key);
            }
        }
        return result;
    },

    createCallback: function (func, thisArg, argCount) {
        if (func == null) {
            return identity;
        }
        var type = typeof func;
        if (type != 'function') {
            if (type != 'object') {
                return function(object) {
                    return object[func];
                };
            }
            // ignore object func
            return identity;
        }
        if (typeof thisArg == 'undefined') {
            return func;
        }
        if (argCount === 1) {
            return function(value) {
                return func.call(thisArg, value);
            };
        }
        if (argCount === 2) {
            return function(a, b) {
                return func.call(thisArg, a, b);
            };
        }
        if (argCount === 4) {
            return function(accumulator, value, index, collection) {
                return func.call(thisArg, accumulator, value, index, collection);
            };
        }
        return function(value, index, collection) {
            return func.call(thisArg, value, index, collection);
        };
    },

    /** Merges multiple objects into the target argument.
     *
     * For properties that are plain Objects, performs a deep-merge. For the
     * rest it just copies the value of the property.
     *
     * To extend prototypes use it as following:
     *   Pusher.Util.extend(Target.prototype, Base.prototype)
     *
     * You can also use it to merge objects without altering them:
     *   Pusher.Util.extend({}, object1, object2)
     *
     * @param  {Object} target
     * @return {Object} the target argument
     */
    extend: function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var extensions = arguments[i];
            utils.forEach(extensions, function (value, property) {
                if (value && value.constructor && value.constructor === Object) {
                    target[property] = utils.extend(target[property] || {}, value);
                } else {
                    target[property] = value;
                }
            })
        }
        return target;
    },

    forOwn: function (collection, callback, thisArg) {
        var index, iterable = collection, result = iterable;
        if (!iterable) return result;
        if (!objectTypes[typeof iterable]) return result;
        callback = callback && typeof thisArg == 'undefined' ? callback : utils.createCallback(callback, thisArg);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && utils.keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
            index = ownProps[ownIndex];
            if (callback(iterable[index], index, collection) === false) return result;
        }
        return result
    },

    forEach: function (collection, callback, thisArg) {
        var index = -1,
            length = collection ? collection.length : 0;

        callback = callback && typeof thisArg == 'undefined' ? callback : utils.createCallback(callback, thisArg);
        if (typeof length == 'number') {
            while (++index < length) {
                if (callback(collection[index], index, collection) === false) {
                    break;
                }
            }
        } else {
            utils.forOwn(collection, callback);
        }
        return collection;
    },

    sureSlash: function (path, last) {
        if (!path) path = '';
        var slash = path.charAt(last ? (path.length - 1) : 0) === '/' ? '' : '/';
        return last ? path + slash : slash + path;
    },

    toMessage: function (event, data) {
        return { __event__: event, __data__: data };
    }
};

module.exports = exports = utils;