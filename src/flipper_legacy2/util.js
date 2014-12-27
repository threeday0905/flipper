var utils = {};

utils.format = function(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

utils.isPromise = function(obj) {
    return obj && typeof obj.then === 'function';
};

utils.log = function() {
    var msg = utils.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};

utils.error = function() {
    var msg = utils.apply(utils, arguments);
    throw new Error(msg);
};
