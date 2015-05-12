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

utils.log = function log() {
    var msg = utils.format.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};

utils.error = function(err) {
    console.error(err.stack || err);
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

utils.eachChildNodes = function(ele, checkFn, callbackFn) {
    var child, i, len,
        hasCheckFn = typeof checkFn === 'function';

    if (ele.childNodes) {
        for (i = 0, len = ele.childNodes.length; i < len; i += 1) {
            child = ele.childNodes[i];

            if (!hasCheckFn || checkFn(child)) {
                callbackFn(child);
            }
        }
    }
};

utils.isCustomTag = function(tagName) {
    return tagName && tagName.lastIndexOf('-') >= 0;
};

function request$(args) {
    if (!window.jQuery) {
        throw new Error('must include jQuery on IE browser');
    }
    return window.jQuery(args);
}

var supportCustomEvent = !!window.CustomEvent;

if (supportCustomEvent) {
    try {
        new CustomEvent('xyz');
    } catch (ex) {
        supportCustomEvent = false;
    }
}

var isIE = (function() {
    function detectIE() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
           // IE 12 => return version number
           return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }

    return detectIE();
}());

utils.event = {
    on: function(node, method, callback) {
        if (supportCustomEvent && !isIE) {
            node.addEventListener(method, callback, false);
        } else {
            request$(node).on(method, callback);
        }

    },
    trigger: function(node, method) {
        if (supportCustomEvent && !isIE) {
            var event = new CustomEvent(method);
            node.dispatchEvent( event );
        } else {
            request$(node).trigger(method);
        }

    },
    halt: function(ev) {
        ev = ev || window.event;
        if (ev) {
            if (ev.stopPropagation) {
                ev.stopPropagation();
            } else {
                ev.cancelBubble = true;
            }

            if (ev.preventDefault) {　　
                ev.preventDefault();
            } else {
                ev.returnValue = false;
            }
        }
    }
};

utils.query = function(node, selector) {
    if (arguments.length === 1) {
        selector = node;
        node = document;
    }

    if (node.querySelector) {
        return node.querySelector(selector);
    } else {
        return request$(node).find(selector)[0];
    }
};

utils.query.all = function(node, selector) {
    if (arguments.length === 1) {
        selector = node;
        node = document;
    }

    if (node.querySelectorAll) {
        return node.querySelectorAll(selector);
    } else {
        var result = [];
        request$(node).find(selector).each(function() {
            result.push(this);
        });
        return result;
    }
};
