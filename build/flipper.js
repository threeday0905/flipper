;(function(root) {
    'use strict';

/**
 * Most of following contents are copied from underscore
 */

 /* jshint unused: false, -W079 */
var tools = (function() {
    /* jshint maxstatements: 30 */

    var tools = {};

    var ObjProto = Object.prototype,
        toString = ObjProto.toString,
        hasOwn = ObjProto.hasOwnProperty;

    function addTypeCheck(typeName) {
        tools['is' + typeName] = function(obj) {
            return toString.call(obj) === '[object ' + typeName + ']';
        };
    }

    function getTypeName(fn) {
        if (tools.isNull(fn)) {
            return 'Null';
        } else if (fn.name) {
            return fn.name;
        } else {
            var mat = /function (.+)\(/.exec(String(fn));
            return mat ? mat[1] : '';
        }
    }

    function getIsMethod(name) {
        return tools['is' + name];
    }

    // Add some isType methods:
    //      isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    addTypeCheck('Arguments');
    addTypeCheck('Function');
    addTypeCheck('String');
    addTypeCheck('Number');
    addTypeCheck('Date');
    addTypeCheck('RegExp');

    // Define a fallback version of the method in browsers (ahem, IE), where
    // there isn't any inspectable "Arguments" type.
    if (!tools.isArguments(arguments)) {
        tools.isArguments = function(obj) {
            return !!(obj && hasOwn.call(obj, 'callee'));
        };
    }



    // Is a given value a DOM element?
    tools.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given variable an object?
    tools.isObject = function(obj) {
        return obj === Object(obj);
    };


    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    if (Array.isArray) {
        tools.isArray = Array.isArray;
    } else {
        addTypeCheck('Array');
    }

    // Optimize `isFunction` if appropriate.
    if (typeof(/./) !== 'function') {
        tools.isFunction = function(obj) {
            return typeof obj === 'function';
        };
    }

    // Is a given value a boolean?
    tools.isBoolean = function(obj) {
        return obj === true || obj === false ||
            toString.call(obj) === '[object Boolean]';
    };


    tools.isEmpty = function(obj) {
        if (tools.isNull(obj)) {
            return true;
        } else if (tools.isArray(obj) || tools.isString(obj)) {
            return obj.length === 0;
        } else {
            return false;
        }
    };

    // Is a given value equal to null o equal to undefined?
    tools.isNull = function(obj) {
        return obj === null || obj === void 0;
    };

    tools.notNull = function(obj) {
        return !tools.isNull(obj);
    };

    tools.notEmpty = function(obj) {
        return !tools.isEmpty(obj);
    };


    tools.is = function(obj) {
        var args = arguments;
        for (var i = 1, len = args.length; i < len; i += 1) {
            var type = args[i],
                method = getIsMethod( getTypeName(type) );

            if (method && method(obj)) {
                return true;
            }

            if (tools.isFunction(type) && obj instanceof type) {
                return true;
            }
        }
        return false;
    };

    tools.has = function(obj, prop) {
        var result = true,
            key, type;

        if (tools.isString(prop)) {
            return tools.notNull(obj[prop]);
        } else if (tools.isArray(prop)) {
            /* jshint plusplus: false */
            for (key = prop.length; key--; ) {
                if (tools.isString(prop[key]) && !obj[prop[key]] ) {
                    result = false;
                    break;
                }
            }
        } else if (tools.isObject(prop)) {
            for (key in prop) {
                /*jshint forin:false */
                type = prop[key];
                if (!obj[key] || !tools.is(obj[key], type)) {
                    result = false;
                    break;
                }
            }
        } else {
            result = false;
        }
        return result;
    };

    tools.equalTo = function(obj, value) {
        return obj === value;
    };

    return tools;
}());

/* jshint unused: false, -W079 */
var errorMessage = {
    prefix : 'Not Expected! ',
    defMsg : '{0} failed condition: {1} with \"{2}\"',
    msgs: {
        is: '{0} is not match expected type',
        has: '{0} does not have expected properties',
        equalTo: '{0} is not equal to {3}'
    },
    get: function(toolName, argName, obj, arg1) {
        var msg = this.msgs[toolName] || this.defMsg;
        msg = msg.replace(/\{0\}/, argName || 'arg') // argument name
                 .replace(/\{1\}/, toolName + '()')  // tool name
                 .replace(/\{2\}/, obj ? obj.toString() : '') // obj value
                 .replace(/\{3\}/, arg1 ? arg1 : ''); // compare value

        return this.prefix + msg;
    }
};

/* jshint unused: false, -W079 */
var rejectHandler = {
    methods: {
        'throw': function(msg) {
            var err =  new Error(msg);
            if (tools.isString(err.stack)) {
                err.stack =
                    err.stack.replace(/^ *at.+args-expect.js.+\n/gm, '');
            }
            throw err;
        },
        log: function(msg) {
            if (console && console.log) {
                console.log(msg);
            }
        },
        none: function() {

        }
    },
    generate: function(keyOrFn) {
        var rejectFn,
            methods = this.methods;

        if (tools.isString(keyOrFn)) {
            rejectFn = methods[keyOrFn];
            if (!rejectFn) {
                methods.log('failed to find the reject method: ' + keyOrFn);
                rejectFn = methods.none;
            }
        } else if (tools.isFunction(keyOrFn)) {
            rejectFn = keyOrFn;
        } else {
            rejectFn = methods['throw'];
        }

        return rejectFn;
    }
};

var slice = Array.prototype.slice;
function ExpectChain(onReject) {
    var self = this;

    function createCheckWrapper(fnName, checkIt) {
        function check(obj, name, args) {
            var items = [obj].concat(args);
            if (!checkIt.apply(null, items)) {
                self.reject(
                    errorMessage.get(fnName, name, obj, items[1])
                );
            }
        }

        return function() {
            var args = slice.call(arguments),
                obj = self.obj;

            if (ExpectChain.isEnable) {
                if (self.multiArg && obj.length) {
                    for (var i = 0, len = obj.length; i < len; i += 1) {
                        check(obj[i], '', args);
                    }
                } else {
                    check(obj, self.name, args);
                }
            }
            return self;
        };
    }


    for (var detectFnKey in tools) {
        /* jshint forin: false */
        this[detectFnKey] = createCheckWrapper(
            detectFnKey,
            tools[detectFnKey]
        );
    }


    this.reject = function(msg) {
        if (!this.rejected) {
            this.rejected = true;
            if (tools.isFunction(onReject)) {
                onReject(msg);
            }
        }
        return this;
    };

    this.start = function(obj, name) {
        this.multiArg = this.rejected = false;
        this.name = name ||'';
        this.obj = obj;
        return this;
    };

    this.all = function() {
        this.start(slice.call(arguments));
        this.multiArg = true;
        return this;
    };
}

ExpectChain.isEnable = true;
ExpectChain.enable = function() {
    ExpectChain.isEnable = true;
};
ExpectChain.disable = function() {
    ExpectChain.isEnable = false;
};

/* jshint unused: false, -W079 */

var createExpect = function(onReject) {
    var chain = new ExpectChain(onReject);

    var expectFn = function(obj, name) {
        return chain.start(obj, name);
    };

    expectFn.all = function() {
        var args = arguments;
        if (args.length === 1 && tools.isArguments(args[0])) {
            args = args[0];
        }
        return chain.all.apply(chain, args);
    };

    expectFn.mode = function(keyOrFn) {
        return createExpect(
            rejectHandler.generate(keyOrFn)
        );
    };

    expectFn.enable = function() {
        ExpectChain.enable();
        return this;
    };

    expectFn.disable = function() {
        ExpectChain.disable();
        return this;
    };

    return expectFn;
};

function definition() {
    return createExpect(
        rejectHandler.generate() // it will gen default throw handler
    );
}

if (typeof exports === 'object') {
    module.exports = definition();
} else if (root.KISSY && typeof root.KISSY.add === 'function') {
    KISSY.add(definition);
} else if (typeof root.define === 'function' && root.define.amd) {
    root.define(definition);
} else {
    root.expect = definition();
}

})(this);

(function() {
'use strict';

/*
    TODO Polyfills:
    - all es5 feature (Object.keys, Array.isArray, Object.create, etc.)
    - current script
    - new URL
    - Promise
    - web components
 */

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

var configs = {
    templateEngine: 'default',
    injectionMode:  'shadow-dom'
};

var Flipper = {
    version: '@@VERSION@@',
    configs: configs
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

var templateEngines = {};

function registerTemplateEngine(name, engine) {
    expect(name).isString();
    expect(engine).notNull();

    if (templateEngines[name]) {
        throw new Error('template engine [' + name + '] is already registered');
    }

    if (typeof engine.render !== 'function') {
        throw new Error('could not found render method for engine: ' + name);
    }


    var views = {};

    templateEngines[name] = {
        hasView: function(viewId) {
            expect(viewId).isString().notNull();
            return !!views[viewId];
        },
        getView: function(viewId) {
            expect(viewId).isString().notNull();
            return views[viewId];
        },
        addView: function(viewId, viewContent) {
            expect(viewId).isString().notNull();
            expect(viewContent).isString();
            views[viewId] = viewContent;
        },
        renderView: function(viewId, model, options) {
            expect(viewId).isString().notNull();
            var view = views[viewId];

            if (!view) {
                throw new Error(
                    'could not found view "' + viewId + '" on engine ' + name);
            }

            options.viewId = viewId;
            return engine.render(view, model, options);
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

var loaders = {};

function registerLoader(name, loader) {
    expect(name).isString();
    expect(loader).notNull();

    if (loaders[name]) {
        throw new Error('loaders [' + name + '] is already registered');
    }

    if (typeof loader !== 'function') {
        throw new Error('loader must be a function' + name);
    }

    loaders[name] = loader;
}

function getLoader(name) {
    if (!loaders[name]) {
        throw new Error('could not found the loader: ' + name);
    }

    return loaders[name];
}

if (window.require) {
    registerLoader('default', window.require);
    utils.requireDebugger('plugin-loader')
        ('register default loader with window.require');
}

Flipper.registerLoader = registerLoader;
Flipper.getLoader = getLoader;

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

var COMPONENT_STATUS = {
    // ERROR: -1,
    INITIALIZING: 0,
    INITIALIZED: 1
};

/* component helpers */
function throwIfAlreadyRegistered(component) {
    if (component.status === COMPONENT_STATUS.INITIALIZED) {
        throw new Error('component ' + component.name + ' is already registered');
    }
}

function hoistAttributes(component, options, keys) {
    keys.forEach(function(key) {
        if (options[key]) {
            component[key] = options[key];
        }
    });
}

function mixinElementProto(component, elementProto) {
    var targetProto = component.elementProto;

    Object.getOwnPropertyNames(elementProto).forEach(function(name) {
        if (name === 'model') {
            targetProto.model = elementProto.model;
        } else {
            Object.defineProperty(targetProto, name,
                Object.getOwnPropertyDescriptor(elementProto, name)
            );
        }
    });
}

function handleViews(component, options) {
    if (options.view) {
        component.addView(options.view, 'index');
    }

    if (options.views) {
        Object.keys(options.views).forEach(function(key) {
            component.addView(options.views[key], key);
        });
    }
}

function handleStyle(component, options) {
    if (options.style) {
        component.style = options.style;
    }
}

function catchPromiseError(err) {
    console.log(err);
    if (err.stack) {
        console.log(err.stack);
    }
}

/* Element Prototype */
function createElementProto(component) {
    var elementProto = Object.create(HTMLElement.prototype);

    function wrapCallback(key) {
        var callback = component[key];
        return function() {
            callback.call(component, this, arguments);
        };
    }
    Object.defineProperties(elementProto, {
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
            value: function(viewName, data, options) {
                if (typeof viewName === 'object') {
                    options = data;
                    data = viewName;
                    viewName = 'index';
                }
                options = options || {};
                options.element = this;
                return component.renderView(viewName, data, options);
            }
        },
        refresh: {
            value: function(callback) {
                var element = this;
                Promise.resolve()
                    .then(component.renderNode.bind(component, element))
                    .then(function() {
                        if (typeof element.ready === 'function') {
                            element.ready();
                        }

                        if (typeof callback === 'function') {
                            callback.call(element);
                        }
                    })
                    /*jshint -W024 */
                    .catch(catchPromiseError);
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

    this.templateEngine = 'default';
    this.injectionMode  = 'shadow-dom';

    this.model = {};
    this.views = {};
    this.style = '';
}


Component.prototype = {
    on: function(name, fn) {
        if (!this._events) {
            this._events = {};
        }

        if (!this._events[name]) {
            this._events[name] = [];
        }

        this._events[name].push(fn);
    },
    fire: function(name) {
        if (this._events && this._events[name]) {
            this._events[name].forEach(function(fn) {
                fn();
            });
        }
    },
    prepare: function(elementProto) {
        throwIfAlreadyRegistered(this);

        if (elementProto) {
            mixinElementProto(this, elementProto);
            hoistAttributes(this, elementProto, [
                'templateEngine', 'injectionMode']);
            //handleViews(this, elementProto);
            handleStyle(this, elementProto);

            if (elementProto.component) {
                this.component = elementProto.component;
            }
        }
    },

    initialize: function(elementProto) {
        throwIfAlreadyRegistered(this);
        this.prepare(elementProto);

        document.registerElement(this.name, {
            prototype: this.elementProto
        });

        this.status = COMPONENT_STATUS.INITIALIZED;
        this.fire('initialized');
    },

    /* configuration methods */
    addView: function(viewTpl, viewName) {
        this.views[viewName || 'index'] = viewTpl + '';
    },
    getView: function(viewName) {
        var result;

        if (!viewName || viewName === 'index') {
            viewName = '';
        }

        $(this.component).find(' > template').each(function() {
            var $tpl = $(this),
                id = $tpl.attr('id') || '';

            if (viewName === id) {
                result = $tpl.html();
                return false;
            }
        });

        if (!result) {
            $(this.component).find(' > script[type="template"]').each(function() {
                var $tpl = $(this),
                    id = $tpl.attr('id') || '';

                if (viewName === id) {
                    result = $tpl.html();
                    return false;
                }
            });
        }

        return result || '';
    },
    renderView: function(viewName, data, options) {
        viewName = viewName || 'index';

        var templateEngine = Flipper.getTemplateEngine(this.templateEngine),
            viewId = this.name + '-' + viewName;

        if (!templateEngine.hasView(viewId)) {
            templateEngine.addView(viewId, this.getView(viewName));
        }

        return templateEngine.renderView(viewId, data, options);
    },

    /* created / attached cycle methods */
    createdCallback: function(element) {
        Promise.resolve()
            .then(function() {
                element.setAttribute('unresolved', '');
            })
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(function() {
                if (typeof element.ready === 'function') {
                    element.ready();
                }
            })
            .then(function() {
                element.removeAttribute('unresolved');
            })
            /*jshint -W024 */
            .catch(catchPromiseError);

    },
    attachedCallback: function() {

    },
    initElement: function(element) {
        if (typeof jQuery === 'function') {
            element.$ = jQuery(element);
        }

        if (typeof element.initialize === 'function') {
            return element.initialize();
        }
    },
    handleElement: function(element) {
        return Promise.resolve()
            .then(this.fetchModel.bind(this, element))
            .then(this.renderNode.bind(this, element))
            .then(this.addStyle.bind(this, element))
            .then(this.bindEvent.bind(this, element));
    },
    fetchModel: function(element) {
        var result, modelId;

        if (typeof element.fetch === 'function') {
            modelId = '';
            result = element.fetch();
        } else if (element.hasAttribute('model-id')) {
            modelId = element.getAttribute('model-id');
            result = Flipper.dataCenter.getSpace(modelId);
        }

        return Promise.resolve(result).then(function(model) {
            if (model === undefined) {
                return;
            }

            element.model = model;

            /* if the model not registered then register it */
            if (!modelId) {
                modelId = Flipper.dataCenter.requestSpace(model);
            }

            /* add one link */
            Flipper.dataCenter.linkSpace(modelId);
            element.modelId = modelId;
        });
    },

    /* refersh flow */
    renderNode: function(element) {
        if (typeof element.render === 'function') {
            return element.render();
        }

        return Promise.resolve()
            .then(this.formatModel.bind(this, element))
            .then(this.renderHTML.bind(this, element))
            .then(this.createTree.bind(this, element));
    },
    formatModel: function(element) {
        if (typeof element.formatModel === 'function') {
            return element.formatModel();
        } else {
            return element.model;
        }
    },
    renderHTML: function(element, model) {
        var viewName = 'index',
            commands = element.tplCommands;

        if (typeof commands === 'function') {
            commands = commands.call(element);
        }

        return this.renderView(viewName, model, {
            element:  element,
            commands: commands
        });
    },
    createTree: function(element, html) {
        /* if no specific value, then get from flipper global config */
        var isLightDom = this.injectionMode === 'light-dom' || 'light';

        var target = isLightDom ? element : element.createShadowRoot();

        target.innerHTML = html;
    },


    addStyle: function(element) {
        var style = document.createElement('style');
        style.textContent = this.style;
        style.setAttribute('referance-to', this.name);

        if (element.shadowRoot && element.shadowRoot.innerHTML) {
            element.shadowRoot.appendChild(style);
        } else {
            var existsStyle =
                document.querySelector('style[referance-to="' + this.name + '"]');
            if (!existsStyle) {
                (document.head || document.body).appendChild(style);
            }
        }

    },
    bindEvent: function(element) {
        if (typeof element.bind === 'function') {
            element.bind();
        }
    },

    /* detach cycle methods */
    detachedCallback: function(element) {
        Promise.resolve()
            .then(this.destroy(element));

    },
    destroy: function(element) {
        if (typeof element.destroy === 'function') {
            element.destroy();
        }

        if (element.modelId) {
            Flipper.dataCenter.unlinkSpace(element.modelId);
            element.modelId = undefined;
            element.model = undefined;
        }
    },

    /* attribute changed callback */
    attributeChangedCallback: function(element, args) {
        /*if (typeof this.elementProto.attributeChangedCallback === 'function') {
            this.elementProto._attributeChangedCallback.apply(element, args);
        }*/
    }
};

var components = {};

function createComponent(name, elementProto, needToWait) {
    if (components[name]) {
        throw new Error('component ' + name + ' is already registered');
    }

    var component = components[name] = new Component(name);

    component.prepare(elementProto);

    if (!needToWait) {
        component.initialize();
    } else {
        var timer = setTimeout(function() {
            console.log('component ' + name + ' is initializing automatically' +
                ', forgot noscript attribute? ');
            component.initialize();

        }, 10000);
        component.on('initialized', function() {
            clearTimeout(timer);
        });
    }

    return component;
}

function initializeComponent(name, options) {
    /* if the component is not exists, then create it */
    var component = components[name];

    if (!component) {
        components = createComponent(name, options, true);
    }

    /* it will throw error, if already initialized */
    component.initialize(options);
}

function tryGetBaseUriByScript() {
    var script = document.__currentScript || document.currentScript;
    return script.baseURI;
}

function tryGetNameByScript() {
    var script = document.__currentScript || document.currentScript,
        parentNode = script && script.parentNode;
    return parentNode && parentNode.getAttribute('name') || '';
}

/**
 * use to register new component,
 *     or attach config to exist component which defined from tag
 */
Flipper.register = function(name, dependencies, elementProto) {
    if (Array.isArray(name)) { /* Flipper.register( [ dep1, dep2], { ... } ); */
        elementProto = dependencies;
        dependencies = name;
        name = tryGetNameByScript();
    } else if (typeof name === 'object') { /* Flipper.register( {...} ); */
        elementProto = name;
        dependencies = undefined;
        name = tryGetNameByScript();
    } else if (typeof name === 'string' && !Array.isArray(dependencies)) {
        elementProto = dependencies;
        dependencies = undefined;
    }

    if (!name) {
        throw new Error('component name could not be inferred.');
    }

    if (!elementProto) {
        throw new Error('component prototype could not be inferred.');
    }


    /* initialize created component, or create it */
    if (!dependencies) {
        initializeComponent(name, elementProto);
    } else {
        var baseURI = tryGetBaseUriByScript();
        dependencies = dependencies.map(function(id) {
            if (id.charAt(0) === '.') {
                return utils.resolveUri(id, baseURI);
            } else {
                return id;
            }
        });
        require(dependencies, function() {
            if (typeof elementProto === 'object') {
                initializeComponent(name, elementProto);
            } else if (typeof elementProto === 'function') {
                initializeComponent(name, elementProto.apply(elementProto, arguments));
            }
        });
    }
};

function collectViews(node) {
    var views = {};
    $(node).find(' > template').each(function() {
        var $tpl = $(this);
        views[ $tpl.attr('id') || '' ] = $tpl.html();
    });
    return views;
}

function collectStyle(node) {
    var $node   = $(node),
        baseURI = node.ownerDocument.baseURI,
        style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var $links = $node.find(' > link[rel="stylesheets"]');
        $links.each(function() {
            var href = new URL($(this).getAttribute('href', baseURI));
            style += '@import "' + href + '";';
        }).remove();

    }
    function extractStyleElement() {
        var $styles = $node.find(' > style');
        $styles.each(function() {
            style += $(this).html();
        }).remove();
    }

    extractStyleSheet();
    extractStyleElement();

    return style;
}

document.registerElement('web-component', {
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {

                var name, options, needToWait = true;

                name = this.getAttribute('name');

                options = {
                    component: this,
                    //views: collectViews(this),
                    style: collectStyle(this),

                    templateEngine: this.getAttribute('template-engine'),
                    injectionMode:  this.getAttribute('injection-mode')
                };

                needToWait = !this.hasAttribute('noscript');
                createComponent(name, options, needToWait);
            }
        }
    })
});

Flipper.define = Flipper.register;

Flipper.components = components;

var packages = {};

function endsWtih(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getPackage(str) {
    var match = /(\w+)\//.exec(str);
    return match ? match[1] : '';
}

Flipper.config = function(name, options) {
    if (name === 'packages' && typeof options === 'object') {
        Object.keys(options).forEach(function(key) {
            packages[key] = options[key];
        });
    }
};

Flipper.imports = function() {
    var baseURI = document.baseURI,
        components = Array.prototype.slice.call(arguments, 0);

    if (components) {
        var frag = document.createDocumentFragment();

        components.map(function(name) {
            var pkg = getPackage(name);

            if (pkg && packages[pkg] && packages[pkg].base) {
                name = packages[pkg].base + name.substr(pkg.length);
            }

            if ( endsWtih(name, '/') ) {
                name += 'index.html';
            }


            return new URL(name, baseURI).toString();
        }).forEach(function(url) {
            var link = document.createElement('link');
            link.rel = 'import';
            link.href = url;
            frag.appendChild(link);
        });

        document.head.appendChild(frag);
    }
};

Flipper.findShadow = function(target, selector) {
    return target.shadowRoot.querySelectorAll(selector);
};

Flipper.fetch = $.ajax;

function definition() {
    return Flipper;
}

if (window.KISSY && typeof window.KISSY.add === 'function') {
    KISSY.add(definition);
} else if (typeof window.define === 'function' && window.define.amd) {
    window.define(definition);
} else {
    window.Flipper = definition();
}

}());
