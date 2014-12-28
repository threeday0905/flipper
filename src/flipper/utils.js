var util = {};

util.noop = function() {};
util.debug = function() {

};

util.format = function format(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

util.isPromise = function isPromise(obj) {
    return obj && typeof obj.then === 'function';
};

util.mixin = function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        Object.defineProperty(to, name, Object.getOwnPropertyDescriptor(from, name));
    });
};

util.log = function log() {
    var msg = util.format.apply(util, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};
