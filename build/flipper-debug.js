(function(root) {

	// Use polyfill for setImmediate for performance gains
	var asap = Promise.immediateFn || (typeof setImmediate === 'function' && setImmediate) ||
		function(fn) { setTimeout(fn, 1); };

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function() {
			fn.apply(thisArg, arguments);
		}
	}

	var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };

	function Promise(fn) {
		if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
		if (typeof fn !== 'function') throw new TypeError('not a function');
		this._state = null;
		this._value = null;
		this._deferreds = []

		doResolve(fn, bind(resolve, this), bind(reject, this))
	}

	function handle(deferred) {
		var me = this;
		if (this._state === null) {
			this._deferreds.push(deferred);
			return
		}
		asap(function() {
			var cb = me._state ? deferred.onFulfilled : deferred.onRejected
			if (cb === null) {
				(me._state ? deferred.resolve : deferred.reject)(me._value);
				return;
			}
			var ret;
			try {
				ret = cb(me._value);
			}
			catch (e) {
				deferred.reject(e);
				return;
			}
			deferred.resolve(ret);
		})
	}

	function resolve(newValue) {
		try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
			if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
				var then = newValue.then;
				if (typeof then === 'function') {
					doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
					return;
				}
			}
			this._state = true;
			this._value = newValue;
			finale.call(this);
		} catch (e) { reject.call(this, e); }
	}

	function reject(newValue) {
		this._state = false;
		this._value = newValue;
		finale.call(this);
	}

	function finale() {
		for (var i = 0, len = this._deferreds.length; i < len; i++) {
			handle.call(this, this._deferreds[i]);
		}
		this._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, resolve, reject){
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.resolve = resolve;
		this.reject = reject;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, onFulfilled, onRejected) {
		var done = false;
		try {
			fn(function (value) {
				if (done) return;
				done = true;
				onFulfilled(value);
			}, function (reason) {
				if (done) return;
				done = true;
				onRejected(reason);
			})
		} catch (ex) {
			if (done) return;
			done = true;
			onRejected(ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function(onFulfilled, onRejected) {
		var me = this;
		return new Promise(function(resolve, reject) {
			handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
		})
	};

	Promise.all = function () {
		var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

		return new Promise(function (resolve, reject) {
			if (args.length === 0) return resolve([]);
			var remaining = args.length;
			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(val, function (val) { res(i, val) }, reject);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				} catch (ex) {
					reject(ex);
				}
			}
			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for(var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Promise;
	} else if (!root.Promise) {
		root.Promise = Promise;
	}

})(this);
(function() {
'use strict';

/* the _currentScript prop may be already polyfill from webcomponentsjs */
if (Object.defineProperty && !document._currentScript) {
    var currentScriptDescriptor = {
        get: function() {
            var script = document.currentScript ||
                // NOTE: only works when called in synchronously executing code.
                // readyState should check if `loading` but IE10 is
                // interactive when scripts run so we cheat.
                (document.readyState !== 'complete' ?
                    document.scripts[document.scripts.length - 1] : null);
            return script;
        },
        configurable: true
    };

    Object.defineProperty(document, '_currentScript', currentScriptDescriptor);
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof FNOP ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
}

var configs = {
    templateEngine: 'default',
    injectionMode:  'light-dom',
    declarationTag: 'web-component'
};

var Flipper = {
    version: '@@VERSION@@',
    configs: configs,
    useNative: !!document.registerElement
};

Flipper.config = function(key, value) {
    if (typeof key === 'object' && arguments.length === 1) {
        utils.mixin(configs, key);
    } else if (typeof key === 'string' && arguments.length === 2) {
        configs[key] = value;
    } else {
        throw new Error('unsupoorted config type. key: ' + key + ', value: ' + value);
    }
};

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


function requestjQuery(args) {
    if (!window.jQuery) {
        throw new Error('must include jQuery on IE browser');
    }
    return window.jQuery(args);
}

var supportCustomEvent = !!window.CustomEvent;

if (supportCustomEvent) {
    try {
        /* jshint nonew: false */
        new window.CustomEvent('xyz');
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
            requestjQuery(node).on(method, callback);
        }

    },
    trigger: function(node, method) {
        if (supportCustomEvent && !isIE) {
            var event = new CustomEvent(method);
            node.dispatchEvent( event );
        } else {
            requestjQuery(node).trigger(method);
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

utils.eachChildNodes = function eachChildNodes(ele, checkFn, callbackFn) {
    var child, i, len, isBreak,
        hasCheckFn = typeof checkFn === 'function';

    if (ele.childNodes) {
        for (i = 0, len = ele.childNodes.length; i < len; i += 1) {
            child = ele.childNodes[i];

            if (!hasCheckFn || checkFn(child)) {
                isBreak = callbackFn(child);
                if (isBreak === false) {
                    break;
                }
            }
        }
    }
};

utils.moveChildNodes = function moveChildNodes(target, src) {
    if (src.firstChild && target.appendChild) {
        while (src.firstChild) {
            target.appendChild(src.firstChild);
        }
    }
};

utils.replaceChildNodes = function replaceChildNodes(target, src) {
    var replaced = false,
        flagNode = target,
        targetNode;

    while (src.firstChild) {
        targetNode = src.firstChild;
        if (!replaced) {
            target.parentNode.replaceChild(targetNode, target);
            replaced = true;
        } else {
            flagNode.parentNode.insertBefore(targetNode, flagNode.nextSibling);
        }
        flagNode = targetNode;
    }
};

utils.matchSelector = (function() {
    var matchsMethod,
        _div = document.createElement('div'),
        matchSelector;

    if (_div.matches) {
        matchsMethod = 'matches';
    } else if (_div.matchesSelector) {
        matchsMethod = 'matchesSelector';
    } else if (_div.mozMatchesSelector) {
        matchsMethod = 'mozMatchesSelector';
    } else if (_div.oMatchesSelector) {
        matchsMethod = 'oMatchesSelector';
    } else if (_div.msMatchesSelector) {
        matchsMethod = 'msMatchesSelector';
    }

    if (matchsMethod) {
        matchSelector = function(ele, selector) {
            return ele[matchsMethod](selector);
        };
    } else if (_div.querySelectorAll) {
        matchSelector = function(ele, selector) {
            var matches = (ele.document || ele.ownerDocument).querySelectorAll(selector);

            var i = 0;
            while (matches[i] && matches[i] !== ele) {
              i += 1;
            }

            return !!matches[i];
        };
    } else {
        matchSelector = function(ele, selector) {
            return requestjQuery(ele).is(selector);
        };
    }

    return matchSelector;
}());

utils.handleNode = function handleNode(node, callback) {
    if (node === undefined || node === null) {
        return;
    }

    if (typeof node === 'string') {
        node = utils.query.all(node);
    }

    if (node.length !== undefined) {
        for ( var i = 0, len = node.length; i < len; i += 1) {
            callback(node[i]);
        }
    } else {
        callback(node);
    }
};

utils.cloneNode = function cloneNode(node) {
    var componentName = node.tagName.toLowerCase(),
        newNode, attrs;

    newNode = document.createElement(componentName);

    if (node.hasAttributes()) {
        attrs = node.attributes;
        for (var i = 0, len = attrs.length; i < len; i += 1) {
            newNode.setAttribute(attrs[i].name, attrs[i].value);
        }
    }

    if (node.innerHTML && node.innerHTML.length) {
        newNode.innerHTML = node.innerHTML;
    }

    return newNode;
};

utils.query = function query(node, selector) {
    if (arguments.length === 1) {
        selector = node;
        node = document;
    }

    if (node.querySelector) {
        return node.querySelector(selector);
    } else {
        return requestjQuery(node).find(selector)[0];
    }
};

utils.query.all = function queryAll(node, selector) {
    if (arguments.length === 1) {
        selector = node;
        node = document;
    }

    if (node.querySelectorAll) {
        return node.querySelectorAll(selector);
    } else {
        var result = [];
        utils.requestjQuery(node).find(selector).each(function() {
            result.push(this);
        });
        return result;
    }
};

var insertionPointUtil = {
    lookupContentNode: function lookupContentNode(target, callback) {
        if (!target || !target.childNodes) {
            return;
        }

        var currNode,
            nextNode = target.firstChild;
        while(nextNode) {
            currNode = nextNode;
            nextNode = currNode.nextSibling;

            if (currNode.nodeType === 1) {
                if (currNode.tagName === 'CONTENT') {
                    callback(currNode);
                } else if (currNode.childNodes && currNode.childNodes.length) {
                    lookupContentNode(currNode, callback);
                }
            }
        }
        utils.eachChildNodes(target, null, function(child) {
            if (child.nodeType !== 1) {
                return;
            }

            if (child.tagName === 'CONTENT') {
                callback(child);
            } else if (child.childNodes && child.childNodes.length) {
                insertionPointUtil.lookupContentNode(child, callback);
            }
        });
    },
    makeContentFragment: function(srcNode) {
        var fragment = document.createDocumentFragment();
        utils.moveChildNodes(fragment, srcNode);
        return fragment;
    },
    handleContentReflect: function handleContentReflect(contentNode, presentNode) {
        insertionPointUtil.lookupContentNode(presentNode, function(content) {
            var select = content.getAttribute('select'),
                defaultWrapper, matchedNode;

            if (select) {
                utils.eachChildNodes(contentNode, function(node) {
                    return node.nodeType === 1 && utils.matchSelector(node, select);
                }, function(node) {
                    matchedNode = node;
                    return false; /* break the iterate */
                });

                if (matchedNode) {
                    if (content.hasAttribute('inner')) {
                        utils.replaceChildNodes(content, matchedNode);
                    } else {
                        content.parentNode.replaceChild(matchedNode, content);
                    }
                } else {
                    if (content.hasAttribute('default')) {
                        defaultWrapper = document.createElement('div');
                        defaultWrapper.innerHTML = content.getAttribute('default');
                        utils.replaceChildNodes(content, defaultWrapper);
                    } else {
                        content.parentNode.removeChild(content);
                    }
                }
            } else {
                utils.replaceChildNodes(content, contentNode);
            }
        });
    }
};

var templateEngines = {};

function registerTemplateEngine(name, engine) {
    if (typeof name !== 'string' || !engine) {
        throw new Error('template engine arg have wrong format');
    }

    if (templateEngines[name]) {
        throw new Error('template engine [' + name + '] is already registered');
    }

    if (typeof engine.render !== 'function') {
        throw new Error('could not found render method for engine: ' + name);
    }


    var views = {};

    function throwIfViewIdError(viewId) {
        if (typeof viewId !== 'string' || !viewId) {
            throw new Error('view id has wrong format');
        }
    }

    templateEngines[name] = {
        hasView: function(viewId) {
            throwIfViewIdError(viewId);
            return !!views[viewId];
        },
        getView: function(viewId) {
            throwIfViewIdError(viewId);
            return views[viewId];
        },
        addView: function(viewId, viewContent) {
            throwIfViewIdError(viewId);

            if (typeof viewContent !== 'string') {
                throw new Error('view content must be string');
            }

            views[viewId] = viewContent;
        },
        renderView: function(viewId, model, options, component) {
            throwIfViewIdError(viewId);
            var view = views[viewId];

            if (!view) {
                throw new Error(
                    'could not found view "' + viewId + '" on engine ' + name);
            }

            options.viewId = viewId;
            return engine.render(view, model, options, component);
        }
    };
}

function getTemplateEngine(name) {
    if (!templateEngines[name]) {
        throw new Error('could not found the template engine: ' + name);
    }
    return templateEngines[name];
}

registerTemplateEngine('default', {
    render: function(viewContent) {
        return viewContent;
    }
});

Flipper.registerTemplateEngine = registerTemplateEngine;
Flipper.getTemplateEngine = getTemplateEngine;

Flipper.require = function() {
    window.require.apply(null, arguments);
};

Flipper.require.check = function() {
    return !!window.require;
};

var dataCenter = {},
    dataCenterUsage = {};

var uniqueId = 0;
function getUnqiueId() {
    uniqueId += 1;
    return uniqueId;
}

function requestModelSpace(model) {
    var spaceId = getUnqiueId();
    dataCenter[spaceId] = model;
    dataCenterUsage[spaceId] = 0;
    return spaceId;
}

function getModelSpace(spaceId) {
    return dataCenter[spaceId];
}

function removeModelSpace(spaceId) {
    if (spaceId && dataCenter[spaceId] !== undefined) {
        delete dataCenter[spaceId];
        delete dataCenterUsage[spaceId];
    }
}

function linkModelSpace(spaceId) {
    if (dataCenterUsage[spaceId] !== undefined) {
        dataCenterUsage[spaceId] += 1;
    }
}

function unlinkModelSpace(spaceId) {
    if (dataCenterUsage[spaceId] !== undefined) {
        dataCenterUsage[spaceId] -= 1;

        if (dataCenterUsage[spaceId] <= 0) {
            removeModelSpace(spaceId);
        }
    }
}

Flipper.dataCenter = {
    _warehouse:   dataCenter,
    requestSpace: requestModelSpace,
    removeSpace:  removeModelSpace,
    getSpace:     getModelSpace,
    linkSpace:    linkModelSpace,
    unlinkSpace:  unlinkModelSpace
};

Flipper.requestSpace = requestModelSpace;
Flipper.removeSpace  = removeModelSpace;

var addedStyle = {},
    styleNode;

var styleHost = {
    add: function(name, style) {
        if (addedStyle[name]) {
            return;
        }

        if (!styleNode) {
            styleNode = document.createElement('style');
            (document.head || document.body).appendChild(styleNode);
        }

        if (style && style.length) {
            styleNode.textContent += style;
        }

        addedStyle[name] = true;
    }
};




function createNonStrictPromise(name) {
    var temp = {}, promise;
    promise = new Promise(function(resolve, reject) {
        temp.name = name || 'none';
        temp.resolve = resolve;
        temp.reject = reject;
    });

    utils.mixin(promise, temp);

    return promise;
}


/**
 *  element prototype may come from two available dist:
 *      1. tag: <web-componen>....</web-component>
 *      2. script: Flipper.register( ... )
 */
var DEF_DIST_COUNT = 2;

function ComponentDefinition() {
    this.countOfProto = DEF_DIST_COUNT;
    this.proto = {};   /* the prototoype of element */

    this.countOfModules = DEF_DIST_COUNT;
    this.modules = {}; /* dependent modules */

    this.views = {};   /* external view files */

    this.promises = {
        proto: createNonStrictPromise('proto'),
        modules: createNonStrictPromise('modules'),
        views: createNonStrictPromise('views')
    };

    this.promiseAll = Promise.all([
        this.promises.proto,
        this.promises.modules,
        this.promises.views
    ]).then(function() {
        return this;
    });

    this.resolveViews();
}

function throwIfAlreadResolved(currentCount, name) {
    if (currentCount === 0) {
        throw new Error('component declaration [' + name + '] is already registered');
    }
}

function goThroughIfReady(currentCount, goThrough) {
    if (currentCount === 0) {
        goThrough();
    }
}

ComponentDefinition.prototype = {
    ready: function(onFulfillment, onRejection) {
        return this.promiseAll.then(onFulfillment)['catch'](onRejection);
    },
    mixinProto: function(newProto) {
        var self = this;
        function mixin(obj) {
            throwIfAlreadResolved(self.countOfProto, 'element prototype');
            utils.mixin(self.proto, obj);
            self.countOfProto -= 1;
            goThroughIfReady(self.countOfProto, self.resolveProto.bind(self));

        }

        if (typeof newProto === 'object') {
            mixin(newProto);
        } else if (typeof newProto === 'function') {
            self.promises.modules.then(function(modules) {
                var protoObj = newProto.apply(null, modules);
                mixin(protoObj);
            });
        } else {
            throw new Error('element prototype has wrong format');
        }
    },
    resolveProto: function() {
        this.promises.proto.resolve(this.proto);
    },
    mixinModules: function(modules) {
        var self = this;

        throwIfAlreadResolved(self.countOfModules, 'element dependencies');

        if (modules) {
            this.modules = modules;
        }
        this.countOfModules -= 1;
        goThroughIfReady(self.countOfModules, self.resolveModules.bind(self));

    },
    resolveModules: function() {
        this.promises.modules.resolve(this.modules);
    },
    rejectModules: function(reason) {
        this.promises.modules.reject(reason);
    },
    resolveViews: function() {
        this.promises.views.resolve(this.views);
    }
};

var COMPONENT_STATUS = {
    ERROR: 'ERROR', // -1,
    INITIALIZING: 'INITIALIZING', //0,
    INITIALIZED: 'INITIALIZED' //1
};

/* component helpers */
function throwIfAlreadyRegistered(component) {
    if (component.status === COMPONENT_STATUS.INITIALIZED) {
        throw new Error('component ' + component.name + ' is already registered');
    }
}

function hoistAttributes(component, options, keys) {
    utils.each(keys, function(key) {
        if (options[key]) {
            component[key] = options[key];
            options[key] = null;
        }
    });
}

function hoistWatchers(component, options) {
    var watchers = component.watchers;

    var suffix = 'Changed';

    function parseCamel(str) {
        var result = str.replace(/([A-Z])/g, function(mat) {
            return '-' + mat.toLowerCase();
        });

        return result.charAt(0) === '-' ? result.substr(1) : result;
    }

    function isWatcherMethod(key) {
        return key.length > suffix.length &&
            key.substr(key.length - suffix.length) === suffix;
    }

    utils.each(options, function(val, key) {
        if (isWatcherMethod(key) && typeof val === 'function') {
            var attrName = parseCamel( key.substr(0, key.length - suffix.length) );
            watchers[attrName] = key;
            //options[key] = null;
        }
    });
}

function handleViews(component, options) {
    if (typeof options.template === 'string') {
        component.addView(options.template, 'index');
    }

    if (typeof options.template === 'object') {
        utils.each(options.template, function(val, key) {
            component.addView(val, key);
        });
    }

    options.template = null;
}

function handleStyle(component, options) {
    if (options.style) {
        component.style = options.style;
    }

    options.style = null;
}

/* Element Prototype */
var LIFE_EVENTS = [
    'initialize',
    'fetch',
    'adapt',
    'render',
    'ready',
    'destroy',
    'fail'
];

var PUBLIC_LIFE_EVENTS = [
    'fetch', 'adapt', 'render'
];

function mixinElementProto(component, options) {
    var targetProto = component.elementProto;
    utils.each(options, function(val, key) {
        if (val === null) {
            return;
        }

        var descriptor = utils.getDescriptor(options, key);

        if (key === 'model') {
            targetProto.model = options.model;
        } else if (utils.contains(LIFE_EVENTS, key)) {
            utils.defineProperty(targetProto.__flipper_lifecycle__, key, descriptor);

            if (utils.contains(PUBLIC_LIFE_EVENTS, key)) {
                utils.defineProperty(targetProto, key, descriptor);
            }
        } else {
            utils.defineProperty(targetProto, key, descriptor);
        }
    });
}

function hasLifeCycleEvent(element, methodName) {
    return typeof element.__flipper_lifecycle__[methodName] === 'function';
}

function callLifeCycleEvent(element, methodName, args) {
    return element.__flipper_lifecycle__[methodName].apply(element, args || []);
}

function tryCallLifeCycleEvent(element, methodName, args) {
    if (hasLifeCycleEvent(element, methodName)) {
        return callLifeCycleEvent(element, methodName, args);
    }
}

function triggerExternalLifeEvent(element, methodName) {
    utils.event.trigger(element, methodName);

    var flipperEvents = element.__flipper_when__;

    if (flipperEvents && flipperEvents[methodName]) {
        utils.each(flipperEvents[methodName], function(callback) {
            if (typeof callback === 'function') {
                callback.call(element);
            }
        });
    }
}

function createElementProto(component) {
    var element = window.HTMLElement || window.Element, /* for fuck IE */
        elementProto = utils.createObject(element.prototype);

    elementProto.__flipper_lifecycle__ = {};

    function wrapCallback(key) {
        var callback = component[key];
        return function() {
            callback.call(component, this, arguments);
        };
    }
    utils.defineProperties(elementProto, {
        model: {
            value: undefined,
            writable: true
        },
        modelId: {
            value: '',
            writable: true
        },
        getView: {
            value: component.getView.bind(component)
        },
        renderView: {
            value: function(viewName, model, options) {
                if (typeof viewName === 'object') {
                    options = model;
                    model = viewName;
                    viewName = 'index';
                }

                options = options || {};
                options.element = this;

                return component.renderView(viewName, model, options);
            }
        },
        refresh: {
            value: function(refetchOrNewModel, callback) {
                /*jshint -W024 */

                var refetch = false, model;

                if (typeof refetchOrNewModel === 'function') {
                    callback = refetchOrNewModel;
                } else if (refetchOrNewModel === true) {
                    refetch = true;
                } else if (typeof refetchOrNewModel === 'object') {
                    model = refetchOrNewModel;
                }

                if (typeof callback !== 'function') {
                    callback = function() {};
                }

                var element = this;

                function handleRefresh() {
                    if (refetch) {
                        return component.handleElement(element);
                    } else  if (model) {
                        return component.fetchModel(element, model).then(function() {
                            return component.renderNode(element);
                        });
                    } else {
                        return component.renderNode(element);
                    }
                }

                var renderComplete = component.renderComplete.bind(component, element),
                    handleRefreshComplete = function() {
                        utils.event.trigger(element, 'refresh');
                    };

                return Promise.resolve()
                        .then(component.renderBegin.bind(component, element))
                        .then(handleRefresh)
                        .then(component.renderSuccess.bind(component, element))
                        .then(callback.bind(element))
                        ['catch'](component.renderFail.bind(component, element))
                        .then(renderComplete, renderComplete)
                        .then(handleRefreshComplete);
            }
        },
        createdCallback: {
            value: wrapCallback('createdCallback')
        },
        attachedCallback: {
            value: wrapCallback('attachedCallback')
        },
        detachedCallback: {
            value: wrapCallback('detachedCallback')
        },
        attributeChangedCallback: {
            value: wrapCallback('attributeChangedCallback')
        }
    });

    return elementProto;
}

/* Component Constructor */
function Component(name) {
    this.name = name;
    this.status = COMPONENT_STATUS.INITIALIZING;

    this.elementProto = createElementProto(this);
    this.definition = new ComponentDefinition();

    this.templateEngine = 'default';
    this.injectionMode  = 'light-dom';

    this.views = {};
    this.style = '';

    this.helpers = {};
    this.watchers = {};
    this.commands = null;

    this.definition.ready(
        this.initialize.bind(this),
        this.markFailed.bind(this)
    );
}


Component.prototype = {
    /* event */
    on: function(name, fn) {
        if (!this.__events__) {
            this.__events__ = {};
        }

        if (!this.__events__[name]) {
            this.__events__[name] = [];
        }

        this.__events__[name].push(fn);
    },
    fire: function(name, params) {
        var self = this;
        if (this.__events__ && this.__events__[name]) {
            utils.each(this.__events__[name], function(fn) {
                fn.apply(self, params || []);
            });
        }
    },

    /* initialize */
    isReady: function() {
        return this.status === COMPONENT_STATUS.INITIALIZED;
    },
    prepare: function(elementProto) {
        throwIfAlreadyRegistered(this);

        if (elementProto) {
            hoistAttributes(this, elementProto,
                [ 'templateEngine', 'injectionMode', 'definitionEle', 'helpers', 'commands' ]
            );

            hoistWatchers(this, elementProto);

            handleViews(this, elementProto);
            handleStyle(this, elementProto);

            mixinElementProto(this, elementProto);
        }
    },
    initialize: function() {
        throwIfAlreadyRegistered(this);
        this.prepare(this.definition.proto);

        if (Flipper.useNative) {
            document.registerElement(this.name, {
                prototype: this.elementProto
            });
        }

        /* register for IE8 and above */
        if (!Flipper.useNative) {
            document.createElement(this.name);
            //var abc = document.createElement(this.name);
        }

        this.status = COMPONENT_STATUS.INITIALIZED;
        this.definition = null;

        this.fire('initialized');
    },
    transform: function(node, needRebuild) {
        if (this.status === COMPONENT_STATUS.INITIALIZING) {
            this.on('initialized', function() {
                this.transform(node);
            });
        } else if (this.status === COMPONENT_STATUS.INITIALIZED) {
            /* transform it if the node is empty */

            if (!node.__flipper__) {
                if (true || needRebuild) {
                    var clonedNode = utils.cloneNode(node);
                    clonedNode.__flipper_when__ = node.__flipper_when__;
                    node.parentNode.replaceChild(clonedNode, node);
                    node = clonedNode;
                }

                utils.mixin(node, this.elementProto);
                node.createdCallback();
                node.attachedCallback();
            }
        }
    },
    markFailed: function(error) {
        this.status = COMPONENT_STATUS.ERROR;

        if (typeof error === 'string') {
            error = new Error(error);
        }

        this.fire('initialized', [ error ]);

        utils.error(error);
    },

    /* configuration methods */
    addView: function(viewTpl, viewName) {
        this.views[viewName || 'index'] = viewTpl + '';
    },
    getView: function(viewName) {
        viewName = viewName || 'index';

        var result;

        var setupTplIfIdMatched = function(ele, isFragment) {
            if ( (ele.id || 'index') === viewName) {
                result = ele.innerHTML;

                /* if template polyfill,
                    all content will be copied to content as a fragment */
                if (!result && ele.content && ele.content.cloneNode) {
                    var div = document.createElement('div');
                    div.appendChild(ele.content.cloneNode(true));
                    result = div.innerHTML;
                }

                if (isFragment) {
                    result = utils.revertEscapedHTML(result);
                }
            }

            if (result) {
                return false; /* return false to break the iterage */
            }
        };

        if (!this.views[viewName]) {
            if (this.definitionEle) {
                utils.eachChildNodes(this.definitionEle, function(ele) {
                    return ele.tagName && ele.tagName.toLowerCase() === 'template';
                }, function(ele) {
                    return setupTplIfIdMatched(ele, true);
                });

                if (!result) {
                    utils.eachChildNodes(this.definitionEle, function(ele) {
                        return ele.tagName && ele.tagName.toLowerCase() === 'script' &&
                                ele.getAttribute('type') === 'template';
                    }, function(ele) {
                        return setupTplIfIdMatched(ele, false);
                    });
                }

                if (result) {
                    this.views[viewName] = result;
                }

            }
        } else {
            result = this.views[viewName];
        }

        if (!result && viewName === 'index') {
            result = ' '; /* index view can ignore */
        }


        return result || '';
    },
    renderView: function(viewName, data, options) {
        viewName = viewName || 'index';

        var templateEngine = Flipper.getTemplateEngine(this.templateEngine),
            viewId = this.name + '-' + viewName,
            element, commands;

        if (!templateEngine.hasView(viewId)) {
            templateEngine.addView(viewId, this.getView(viewName));
        }

        element = options.element;
        commands = this.commands;

        if (typeof commands === 'function') {
            commands = commands.call(element);
        }

        if (typeof commands === 'object') {
            if (options.commands) {
                utils.mixin(options.commands, commands);
            } else {
                options.commands = commands;
            }
        }

        return templateEngine.renderView(viewId, data, options, this);
    },

    /* created / attached cycle methods */
    createdCallback: function(element) {
        utils.debug(element, 'is created');
        var renderComplete = this.renderComplete.bind(this, element);

        /*jshint -W024 */
        Promise.resolve()
            .then(this.addLightDomStyle.bind(this, element))
            .then(this.renderBegin.bind(this, element))
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(this.renderSuccess.bind(this, element))
            ['catch'](this.renderFail.bind(this, element))
            .then(renderComplete, renderComplete);

    },
    renderBegin: function(element) {
        utils.debug(element, 'render begin');
        element.setAttribute('unresolved', '');
        element.__flipper__ = true;

        if (element.resolved) {
            element.resolved = false;
        }

        utils.debug(element, 'has flipper flag', element.__flipper__);
    },
    initElement: function(element) {
        return tryCallLifeCycleEvent(element, 'initialize');
    },
    handleElement: function(element) {
        return Promise.resolve()
            .then(this.fetchModel.bind(this, element))
            .then(this.renderNode.bind(this, element));
    },
    fetchModel: function(element, model) {
        var result, modelId;

        if (element.hasAttribute('model-key')) {
            utils.log('"model-key" is a test feature, do not use');
            modelId = Flipper.dataCenter.requestSpace(
                window[element.getAttribute('model-key')]
            );

            if (element.hasAttribute('model-id')) {
                Flipper.dataCenter.unlinkSpace(element.getAttribute('model-id'));
                element.removeAttribute('model-id');
            }

            element.setAttribute('model-id', modelId);
            element.removeAttribute('model-key');
        }

        if (model) {
            modelId = '';
            result = model;
        } else if (hasLifeCycleEvent(element, 'fetch')) {
            modelId = '';
            result = callLifeCycleEvent(element, 'fetch');
        } else if (element.hasAttribute('model-id')) {
            modelId = element.getAttribute('model-id');
            result = Flipper.dataCenter.getSpace(modelId);
        }

        if (!modelId && element.hasAttribute('model-id')) {
            Flipper.dataCenter.unlinkSpace(element.getAttribute('model-id'));
        }

        return Promise.resolve(result).then(function(model) {
            if (model !== undefined) {
                element.model = model;

                /* if the model not registered then register it */
                if (!modelId) {
                    modelId = Flipper.dataCenter.requestSpace(model);
                }

                /* add one link */
                Flipper.dataCenter.linkSpace(modelId);
                element.modelId = modelId;
            }
        });
    },
    renderNode: function(element) {
        var model = this.formatModel(element),
            html;

        if (hasLifeCycleEvent(element, 'render')) {
            html = callLifeCycleEvent(element, 'render', [ model ]);
        } else {
            html = this.renderHTML(element, model);
        }

        /* if returing html, then use the html to make dom tree (createTree()) */
        if (html !== undefined) {
            return Promise.resolve(html).then(this.createTree.bind(this, element));

        /* otherwise skip createTree(), jump into next step */
        } else {
            return Promise.resolve();
        }
    },
    formatModel: function(element) {
        /* must return model, it will be dispatched to renderHTML method */
        if (hasLifeCycleEvent(element, 'adapt')) {
            return callLifeCycleEvent(element, 'adapt', [ element.model ]);
        } else {
            return element.model;
        }
    },
    renderHTML: function(element, model) {
        var viewName = 'index';

        return this.renderView(viewName, model, {
            element:  element
        });
    },
    isLightDom: function() {
        return this.injectionMode === 'light-dom' || 'ligth';
    },
    createTree: function(element, html) {
        /* if no specific value, then get from flipper global config */
        var isLightDom = this.isLightDom(),
            contentNode;

        if (isLightDom) {
            contentNode = insertionPointUtil.makeContentFragment(element);
            element.innerHTML = html;
            insertionPointUtil.handleContentReflect(contentNode, element);
        } else {
            element.createShadowRoot().innerHTML = html;
        }
    },
    addLightDomStyle: function() {
        if (!this.isLightDom()) {
            return;
        }

        styleHost.add(this.name, this.style);
    },
    addShadowDomStyle: function(element) {
        if (this.isLightDom()) {
            return;
        }

        if (!this.style || !this.style.length) {
            return;
        }

        if (element.shadowRoot && element.shadowRoot.innerHTML) {
            var styleNode = document.createElement('style');
            styleNode.textContent = this.style;
            element.shadowRoot.appendChild(styleNode);
        }

    },
    /* refersh flow */
    renderFail: function(element, err) {
        utils.debug(element, 'render fail');
        utils.error(err);

        var result = tryCallLifeCycleEvent(element, 'fail', [ err ] );

        if (!Flipper.useNative) {
            Flipper.parse(element);
        }

        return Promise.resolve(result).then(function() {
            element.__status__ = 'error';
            element.__error__ = err;
            triggerExternalLifeEvent(element, 'error');
        });
    },
    renderSuccess: function(element) {
        utils.debug(element, 'render success');

        if (!this.isLightDom()) {
            this.addShadowDomStyle(element);
        }

        if (!Flipper.useNative) {
            Flipper.parse(element);
        }

        triggerExternalLifeEvent(element, 'rendered');

        var result = tryCallLifeCycleEvent(element, 'ready');
        return Promise.resolve(result).then(function() {
            element.__status__ = 'success';
            element.removeAttribute('unresolved');
            triggerExternalLifeEvent(element, 'success');
        });
    },
    renderComplete: function(element) {
        utils.debug(element, 'render complete');
        element.resolved = true;

        triggerExternalLifeEvent(element, 'ready');

        if (element.__flipper_when___) {
            element.__flipper_when__ = null;
            delete element.__flipper_when__;
        }
    },

    /* detach cycle methods */
    detachedCallback: function(element) {
        this.destroy(element);
    },
    destroy: function(element) {
        tryCallLifeCycleEvent(element, 'destroy');

        if (element.modelId) {
            Flipper.dataCenter.unlinkSpace(element.modelId);
            element.modelId = undefined;
            element.model = undefined;
        }

        utils.event.trigger(element, 'destroy');
    },

    /* attribute changed callback */
    attachedCallback: function() {

    },
    attributeChangedCallback: function(element, args) {
        var watchers, attrName, changedCallback;
        if (typeof element.attributeChanged === 'function') {
            element.attributeChanged.apply(element, args);
        } else {
            watchers = this.watchers;
            attrName = args[0];

            if (watchers[attrName]) {
                changedCallback = element[watchers[attrName]];
                if (typeof changedCallback === 'function') {
                    changedCallback.apply(element,
                        Array.prototype.slice.call(args, 1)
                    );
                }
            }
        }
    },

    /* helpers */
    setHelpers: function(helpers) {
        this.helpers = helpers;
    },
    getHelpers: function() {
        return this.helpers;
    }
};

Flipper.Component = Component;

var components = {};

var waitings = {};

function waitingComponent(name, callback) {
    name = name.toLowerCase();
    var component = components[name];

    if (component && component.isReady()) {
        callback(component);
    } else {
        if (!waitings[name]) {
            waitings[name] = [];
        }

        waitings[name].push(callback);
    }
}

function createComponent(name) {
    var component = components[name];
    if (!component) {
        component = components[name] = new Flipper.Component(name);
        component.on('initialized', function() {
            if (!waitings[name]) {
                return;
            }

            utils.each(waitings[name], function(callback) {
                callback(component);
            });
            waitings[name] = null;
        });
    }

    if (component.isReady()) {
        throw new Error('component ' + component.name + ' is already registered');
    }

    return components[name];
}

/**
 *  dom related methods
 */

 function tryGetBaseUri() {
    // TODO: polyfill if baseURI is not exists
    return document.baseURI;
 }

function tryGetBaseUriFromNode(node) {
    var baseURI = node.ownerDocument ? node.ownerDocument.baseURI : '';
    return baseURI || tryGetBaseUri();
}

function tryGetCurrentScript() {
    /* the current script prop is polyfill from webcomponentsjs */
    return document._currentScript || document.currentScript;
}

function tryGetWrapperFromCurrentScript() {
    var script = tryGetCurrentScript();
    return script ? script.parentNode : undefined;
}

function tryGetBaseUriFromCurrentScript() {
    var script = tryGetCurrentScript(),
        wrapper = tryGetWrapperFromCurrentScript(),
        baseURI;


    /* ths script is inside <web-component> on independent html file */
    if (wrapper && wrapper.tagName &&
            wrapper.tagName.toLowerCase() === Flipper.configs.declarationTag) {
        baseURI = wrapper.baseURI;

    /* the script is loaded as independent js file*/
    } else if (script.src) {
        baseURI = script.src;

    /* otherwise get the base uri. */
    } else {
        baseURI = script.baseURI || script.ownerDocument.baseURI;
    }

    return baseURI || tryGetBaseUri();
}

function tryGetNameFromCurrentScript() {
    var wrapper = tryGetWrapperFromCurrentScript();
    return wrapper ? wrapper.getAttribute('name') : '';
}

/**
 * register helper
 */
function parseFactoryArgs(name, dependencies, elementProto) {
    /* Flipper.register( [ dep1, dep2], { ... } ); */
    if (utils.isArray(name)) {
        elementProto = dependencies;
        dependencies = name;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register( { ... } ); */
    } else if (typeof name === 'object' || name === undefined) {
        elementProto = name;
        dependencies = undefined;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register('xxx', { ... } ); */
    } else if (typeof name === 'string' && !utils.isArray(dependencies)) {
        elementProto = dependencies;
        dependencies = undefined;
    }
    /* else Flipper.register('xxx', [ dep1, dep2 ], { ... } ); */

    return {
        name: name,
        dependencies: dependencies,
        elementProto: elementProto
    };
}

function collectStyleFromNode(node) {
    var baseURI = tryGetBaseUriFromNode(node),
        style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var linkEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'link' &&
                ele.getAttribute('rel') === 'stylesheet';
        }, function(ele) {
            linkEles.push(ele);
        });

        utils.each(linkEles, function(ele) {
            var href = new URL(ele.getAttribute('href'), baseURI);
            style += '@import "' + href + '";';
            node.removeChild(ele);
        });
    }

    function extractStyleElement() {
        var styleEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'style';
        }, function(ele) {
            styleEles.push(ele);
        });

        utils.each(styleEles, function(ele) {
            var styleContent = ele.innerHTML;
            style += styleContent;
            node.removeChild(ele);
        });
    }

    extractStyleSheet();
    extractStyleElement();

    return style;
}


function wakeComponentUpIfTimeout(component) {
    if (component.isReady()) {
        return;
    }

    var timer = setTimeout(function() {
        if (component.isReady()) {
            return;
        }

        component.initialize();
        throw new Error('component ' + component.name + ' is initialized automatically' +
            ', forgot [noscript] attribute? ');
    }, 10000);

    component.on('initialized', function() {
        clearTimeout(timer);
    });
}

/**
 * register a component
 */
 function registerComponent(componentArgs, isStandalone) {
    var name = componentArgs.name,
        elementProto = componentArgs.elementProto,
        dependencies = componentArgs.dependencies;

    if (!name) {
        throw new Error('component name could not be inferred.');
    }


    /* it will create new component or return pending component */
    var component = createComponent(name),
        definition = component.definition;


    if (!elementProto) {
         component.markFailed(
            'component [' + name + '] prototype could not be inferred.');
         return;
    }

     function markRegistrationCompleted(modules) {
        /* if the elementProto is function,
           it will be executed after dependency module loaded,
           and the returing value will be assigned as element proto */
        definition.mixinProto(elementProto);

        /* we need to call mixin modules even there is no dependencies,
           since the ready method will be called after mixin twice */
        definition.mixinModules(modules);

        /* in normal case, the register method will be called from
                1. definition tag: <web-component>
                2. register method: Flipper.register()

           if the component only has one registration fn,
                then call resolve method directly */
        if (isStandalone) {
            definition.resolveProto();
            definition.resolveModules();
        } else {
            wakeComponentUpIfTimeout(component);
        }
     }

     if (dependencies) {
         var baseURI = tryGetBaseUriFromCurrentScript();
         utils.each(dependencies, function(id, index) {
            if (id.charAt(0) === '.') {
                id = utils.resolveUri(id, baseURI);
                dependencies[index] = id;
            }
         });

         if (Flipper.require.check()) {
            Flipper.require(dependencies, {
                success: function() {
                    markRegistrationCompleted(arguments);
                },
                error: function(moduleA) {
                    var error = 'error';
                    if (moduleA && moduleA.error && moduleA.error.exception) {
                        error = moduleA.error.exception;
                    }

                    component.markFailed(error);
                }
            });
         } else {
            component.markFailed('could not found the global module loader');
         }

     } else {
        markRegistrationCompleted();
     }
 }

 /**
  * register from script, e.g. Flipper.register( 'xxx', ... );
  */
function registerFromFactoryScript(name, dependencies, elementProto) {
    var componentArgs = parseFactoryArgs(name, dependencies, elementProto);


    var isStandalone = true,
        wrapperEle = tryGetWrapperFromCurrentScript(),
        wrapperTag = wrapperEle ? wrapperEle.tagName.toLowerCase() : '';

    if (wrapperTag === Flipper.configs.declarationTag) {
        isStandalone = false;
    }

    /* if call Flipper.register directly without <web-component> tag,
        then it is standalone,
        otherwise it should need <web-component> element parsed */

    /* in polyfill, <web-component> will be exeuted after script called */
    registerComponent(componentArgs, isStandalone);
}

/**
 * register from declaration tag, e.g <web-component name="xxx">...</web-component>
 */
function registerFromDeclarationTag(ele) {
    var elementProto, componentArgs;

    elementProto = {
        definitionEle: ele,
        style: collectStyleFromNode(ele),
        templateEngine: ele.getAttribute('template-engine'),
        injectionMode:  ele.getAttribute('injection-mode')
    };

    componentArgs = {
        name: ele.getAttribute('name'),
        dependencies: undefined,
        elementProto: elementProto
    };

    var isStandalone = false;

    if (ele.hasAttribute('noscript')) {
        isStandalone = true;
    }

    /* if the <web-component> has noscript attr,
        then it is standalone,
        otherwise it need to wait Flipper.register() called */
    registerComponent(componentArgs, isStandalone);
}


/**
 * exports APIs
 */
Flipper.define = Flipper.register = registerFromFactoryScript;

if (Flipper.useNative) {
    document.registerElement(Flipper.configs.declarationTag /* web-component */, {
        prototype: utils.createObject(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    registerFromDeclarationTag(this);
                }
            }
        })
    });
}

if (window.FlipperPolyfill) {
    window.FlipperPolyfill.flushDeclaration(Flipper.register.bind(Flipper));
}

Flipper.getComponent = function getComponent(name) {
    return components[name.toLowerCase()];
};

Flipper.hasComponent = function hasComponent(name) {
    return !!Flipper.getComponent(name);
};

Flipper.getComponentHelpers = function getComponentHelpers(name) {
    var component = Flipper.getComponent(name);

    return component ? component.getHelpers() : {};
};

Flipper.components = components;

function isCustomNode(node) {
    return node && node.tagName &&
        utils.isCustomTag( node.tagName );
}

Flipper.init = function flipperInit(nodes) {
    if (Flipper.useNative) {
        return false;
    }

    function handler(node) {
        if (!isCustomNode(node)) {
            return false;
        }

        if (node.initialized) {
            return false;
        }

        if (node.initialing) {
            return false;
        }

        var component = Flipper.getComponent(node.tagName);

        if (component && component.isReady()) {
            component.transform(node);
        } else {
            node.initialing = true;
            waitingComponent(node.tagName, function(component) {
                component.transform(node, true);
                delete node.initialing;
            });
        }
    }

    utils.handleNode(nodes, handler);

    return true;
};

Flipper.parse = function flipperParse(nodes) {
    if (Flipper.useNative) {
        return false;
    }

    utils.handleNode(nodes, function(node) {
        utils.eachChildNodes(node, undefined, function(childNode) {
            if (isCustomNode(childNode)) {
                Flipper.init(childNode);
            } else if (childNode.childNodes && childNode.childNodes.length) {
                Flipper.parse(childNode);
            }
        });
    });
};

if (!Flipper.useNative) {
    (function() {
        var isReady = false;

        function ready(event) {
            // readyState === 'complete' is good enough for us to call the dom ready in oldIE
            if ( document.addEventListener ||
                 ( event && event.type === 'load' ) ||
                 document.readyState === 'complete' ) {

                detach();
                isReady = true;
                Flipper.parse(document.body);
            }
        }

        function detach() {
            if ( document.addEventListener ) {
                document.removeEventListener( 'DOMContentLoaded', ready, false );
                window.removeEventListener( 'load', ready, false );

            } else {
                document.detachEvent( 'onreadystatechange', ready );
                window.detachEvent( 'onload', ready );
            }
        }

        if (document.readyState === 'complete') {
            setTimeout(ready, 1);
        } else if (document.addEventListener) {
            // Use the handy event callback
            document.addEventListener( 'DOMContentLoaded', ready, false );

            // A fallback to window.onload, that will always work
            window.addEventListener( 'load', ready, false );

        } else if (document.attachEvent) {
            // Ensure firing before onload, maybe late but safe also for iframes
            document.attachEvent( 'onreadystatechange', ready );

            // A fallback to window.onload, that will always work
            window.attachEvent( 'onload', ready );

            // If IE and not a frame
            // continually check to see if the document is ready
            var top = false;

            try {
                top = !window.frameElement && document.documentElement;
            } catch(e) {}

            if ( top && top.doScroll ) {
                (function doScrollCheck() {
                    if ( !isReady ) {
                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll('left');
                        } catch(e) {
                            return setTimeout( doScrollCheck, 50 );
                        }

                        // detach all dom ready events
                        detach();

                        // and execute any waiting functions
                        ready();
                    }
                })();
            }
        }
    }());
}

Flipper.findShadow = function(target, selector) {
    return utils.query.all(target.shadowRoot, selector);
};


function isCustomElement(node) {
    return utils.isElement(node) && utils.isCustomTag(node.tagName);
}

function isFlipperElement(node) {
    return Flipper.hasComponent(node.tagName);
}

function attachWhenEvent(method, nodes, callback) {
    if (nodes === undefined || nodes === null) {
        return;
    }

    if (typeof nodes === 'string' || !nodes.length) {
        nodes = [ nodes ];
    }

    if (typeof callback !== 'function') {
        return;
    }

    function handler(node) {
        utils.debug(node, 'has flag on bind', node.__flipper__);

        /* if it is not custom element, then call Callback directly */
        if (!isCustomElement(node) ) {
            callback.call(node);

        /* if the component is not registered, then wait it */
        } else if (!isFlipperElement(node)) {

            /* wait 1000ms to load the component */
            setTimeout(function() {
                if (isFlipperElement(node)) {
                    handler(node);
                } else {
                    /* if still not loaded, then exec callback */
                    callback.call(node);
                }
            }, 1000);

        /* if the node is a flipper-component, and it is resolved */
        } else if (node.resolved) {

            /* skip success callback, if status is not success */
            if (method === 'success' && node.__status__ !== 'success') {
                return;
            }

            /* skip error callback, if status is not error */
            if (method === 'error' && node.__status__ !== 'error') {
                return;
            }

            callback.call(node);

        /* if the node is a flipper-component, and during rendering */
        } else {

            /* add callback events on itsself, it will be exec once rendered */
            if (!node.__flipper_when__) {
                node.__flipper_when__ = {};
            }

            if (!node.__flipper_when__[method]) {
                node.__flipper_when__[method] = [];
            }

            node.__flipper_when__[method].push(callback);
        }
    }

    for (var i = 0, len1 = nodes.length; i < len1; i += 1) {
        utils.handleNode(nodes[i], handler);
    }
}

Flipper.whenError = function(doms, callback) {
    attachWhenEvent('error', doms, callback);
};

Flipper.whenSuccess = function(doms, callback) {
    attachWhenEvent('success', doms, callback);
};

Flipper.whenReady = function(doms, callback) {
    attachWhenEvent('ready', doms, callback);
};

Flipper.waitReady = function(nodes, callback) {
    if (nodes === undefined || nodes === null) {
        return;
    }

    if (typeof nodes === 'string' || !nodes.length) {
        nodes = [ nodes ];
    }

    return new Promise(function(resolve, reject) {
        var waitingCount = nodes.length;

        function done() {
            if (typeof callback === 'function') {
                callback();
            }
            resolve();
        }

        function resolveOne() {
            waitingCount -= 1;
            if (waitingCount === 0) {
                done();
            }
        }

        Flipper.whenSuccess(nodes, resolveOne);
        Flipper.whenError(nodes, reject);
    });
};

function definition() {
    return Flipper;
}

window.Flipper = definition();

}());
