var utils = {};

utils.noop = function() {};

utils.each = function(obj, fn) {
    if (utils.isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; i += 1) {
            fn(obj[i], i);
        }
    } else {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                fn(obj[prop], prop);
            }
        }
    }
};

var REGEX_TRIM = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

utils.trim = function trim(str) {
    if (typeof str === 'string') {
        return str.trim ? str.trim() : str.replace(REGEX_TRIM, '');
    } else {
        return str;
    }
};

utils.format = function format(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

utils.isArray = Array.isArray || function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

utils.contains = function contains(arr, target) {
    if (arr.lastIndexOf) {
        return arr.lastIndexOf(target) > -1;
    } else {
        for (var i = 0, len = arr.length; i < len; i += 1) {
            if (target === arr[i]) {
                return true;
            }
        }
        return false;
    }
};

utils.isPromise = function isPromise(obj) {
    return obj && typeof obj.then === 'function';
};

utils.isElement = function isElement(obj) {
    return !!(obj && obj.nodeType === 1);
};

var debugEnable = false;
utils.debug = function debug() {
    if (!debugEnable) {
        return;
    }
    var msg = utils.format.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};

utils.log = function log(msg) {
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};

utils.error = function(err) {
    if (typeof console.error === 'function') {
        console.error(err.stack || err);
    } else {
        utils.log(err.stack || err);
    }
};

utils.warn = function(err) {
    if (typeof console.warn) {
        console.warn(err.stack || err);
    } else {
        utils.log(err.stack || err);
    }
};

function doesGetOwnPropertyDescriptorWork(object) {
    try {
        object.sentinel = 0;
        return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
    } catch (exception) {
        return false;
    }
}

var supportES5Property =
    doesGetOwnPropertyDescriptorWork({}) &&
    doesGetOwnPropertyDescriptorWork(document.createElement('div'));

utils.mixin = function mixin(to, from) {
    if (!to) {
        return;
    }
    if (supportES5Property) {
        utils.each(Object.getOwnPropertyNames(from), function(name) {
            Object.defineProperty(to, name,
                Object.getOwnPropertyDescriptor(from, name)
            );
        });
    } else {
        for (var key in from) {
            if (from.hasOwnProperty(key)) {
                to[key] = from[key];
            }
        }
    }
};

utils.defineProperty = function(obj, name, descriptor) {
    if (supportES5Property) {
        Object.defineProperty(obj, name, descriptor);
    } else {
        obj[name] = descriptor.value;
    }
};

utils.getDescriptor = function(obj, name) {
    if (supportES5Property) {
        return Object.getOwnPropertyDescriptor(obj, name);
    } else {
        return {
            value: obj[name]
        };
    }
};

utils.defineProperties = function(obj, properties) {
    if (supportES5Property) {
        Object.defineProperties(obj, properties);
    } else {
        utils.each(properties, function(descriptor, key) {
            utils.defineProperty(obj, key, descriptor);
        });
    }
};

utils.createObject = Object.create && supportES5Property ?
    Object.create : (function() {
        var Temp = function() {};
        return function(prototype, propertiesObject) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }

            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;

            if (propertiesObject) {
                utils.defineProperties(result, propertiesObject);
            }

            return result;
        };
    }());

utils.resolveUri = function(target, baseUri) {
    //return new URL(target, baseUri).toString();
    var url = new URL(target, baseUri);
    return url.href;
};

utils.isCustomTag = function(tagName) {
    return tagName && tagName.lastIndexOf('-') >= 0;
};

utils.revertEscapedHTML = function(html) {
    if (!html || !html.replace) {
        return html;
    }
    return html.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
};
