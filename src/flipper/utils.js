var utils = {};

utils.noop = function() {};

utils.format = function format(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

utils.isPromise = function isPromise(obj) {
    return obj && typeof obj.then === 'function';
};

utils.mixin = function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        Object.defineProperty(to, name,
            Object.getOwnPropertyDescriptor(from, name)
        );
    });
};

utils.log = function log() {
    var msg = utils.format.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};


utils.resolveUri = function(target, baseUri) {
    return new URL(target, baseUri).toString();
};

utils.requireDebugger = function(type) {
    var DEBUG = typeof window.DEBUG === 'string' ? window.DEBUG : '';

    if (DEBUG === '*' || DEBUG.lastIndexOf(type) > -1 ) {
        return function() {
            var msg = utils.format.apply(utils, arguments);
            console.log('[' + type + ']' + msg);
        };
    } else {
        return utils.noop;
    }
};

Flipper.utils = utils;
