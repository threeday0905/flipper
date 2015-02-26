(function() {
'use strict';

/*
    TODO Polyfills:
    - all es5 feature (Object.keys, Array.isArray, Object.create, etc.)
    - new URL
    - Promise
    - document base uri

    IE: ?
 */

/* the _currentScript prop may be already polyfill from webcomponentsjs */
if (!document._currentScript) {
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

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

var configs = {
    templateEngine: 'default',
    injectionMode:  'light-dom',
    declarationTag: 'web-component'
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

Flipper.utils = utils;

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
        renderView: function(viewId, model, options) {
            throwIfViewIdError(viewId);
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
    if (typeof name !== 'string' || !loader) {
        throw new Error('loader args have wrong format');
    }

    if (loaders[name]) {
        throw new Error('loader [' + name + '] is already registered');
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

Flipper.requestSpace = requestModelSpace;
Flipper.removeSpace  = removeModelSpace;


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
var PROTO_DIST_COUNT = 2;

function ComponentDefinition() {
    this.countOfProto = PROTO_DIST_COUNT;
    this.proto = {};   /* the prototoype of element */

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

    this.resolveModules();
    this.resolveViews();
}

function throwIfAlreadResolved(currentCount, name) {
    if (currentCount === 0) {
        throw new Error('component declaration [' + name + '] is already registered');
    }
}

function throwIfNotObject(target, name) {
    if (typeof target !== 'object') {
        throw new Error('component declaration [' + name + '] has wrong format');
    }
}

function goThrowIfIsReady(currentCount, goThrough) {
    if (currentCount === 0) {
        goThrough();
    }
}

ComponentDefinition.prototype = {
    ready: function(onFulfillment, onRejection) {
        return this.promiseAll.then(onFulfillment, onRejection);
    },
    mixinProto: function(newProto) {
        throwIfAlreadResolved(this.countOfProto, 'element prototype');
        throwIfNotObject(newProto, 'element prototype');

        utils.mixin(this.proto, newProto);
        this.countOfProto -= 1;

        goThrowIfIsReady(this.countOfProto, this.resolveProto.bind(this));
    },
    resolveProto: function() {
        this.promises.proto.resolve(this.proto);
    },
    resolveModules: function() {
        this.promises.modules.resolve(this.modules);
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
    keys.forEach(function(key) {
        if (options[key]) {
            component[key] = options[key];
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

    Object.keys(options).forEach(function(key) {
        /* endsWith method is polyfill by Flipper */
        if (key.endsWith(suffix) && typeof options[key] === 'function') {
            var attrName = parseCamel( key.substr(0, key.length - suffix.length) );
            watchers[attrName] = key;
        }
    });
}

function handleViews(component, options) {
    if (typeof options.template === 'string') {
        component.addView(options.template, 'index');
    }

    if (typeof options.template === 'object') {
        Object.keys(options.template).forEach(function(key) {
            component.addView(options.template[key], key);
        });
    }
}

function handleStyle(component, options) {
    if (options.style) {
        component.style = options.style;
    }
}

function logError(err) {
    console.error(err.stack || err);
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

function mixinElementProto(component, elementProto) {
    var targetProto = component.elementProto;

    Object.getOwnPropertyNames(elementProto).forEach(function(name) {
        if (name === 'model') {
            targetProto.model = elementProto.model;
        } else if (LIFE_EVENTS.lastIndexOf(name) > -1 ) {
            Object.defineProperty(targetProto._lifeCycle, name,
                Object.getOwnPropertyDescriptor(elementProto, name)
            );
            if (PUBLIC_LIFE_EVENTS.lastIndexOf(name) > -1 ) {
                Object.defineProperty(targetProto, name,
                    Object.getOwnPropertyDescriptor(elementProto, name)
                );
            }
        } else {
            Object.defineProperty(targetProto, name,
                Object.getOwnPropertyDescriptor(elementProto, name)
            );
        }
    });
}

function hasLifeCycleEvent(element, methodName) {
    return typeof element._lifeCycle[methodName] === 'function';
}

function callLifeCycleEvent(element, methodName, args) {
    return element._lifeCycle[methodName].apply(element, args);
}

function tryCallLifeCycleEvent(element, methodName, args) {
    if (hasLifeCycleEvent(element, methodName)) {
        return callLifeCycleEvent(element, methodName, args);
    }
}

function createElementProto(component) {
    var elementProto = Object.create(HTMLElement.prototype);

    elementProto._lifeCycle = {};

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

                return Promise.resolve()
                        .then(component.renderBegin.bind(component, element))
                        .then(handleRefresh)
                        .then(component.renderEnd.bind(component, element))
                        .then(callback.bind(element))
                        .catch(component.renderFail.bind(component, element));
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
    this.injectionMode  = 'shadow-dom';

    this.model = {};
    this.views = {};
    this.style = '';

    this.helpers = {};
    this.watchers = {};

    this.definition.ready(
        this.initialize.bind(this),
        this.markFailed.bind(this)
    );
}


Component.prototype = {
    /* event */
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

    /* initialize */
    isReady: function() {
        return this.status === COMPONENT_STATUS.INITIALIZED;
    },
    prepare: function(elementProto) {
        throwIfAlreadyRegistered(this);

        if (elementProto) {
            mixinElementProto(this, elementProto);
            hoistAttributes(this, elementProto,
                [ 'templateEngine', 'injectionMode', 'definitionEle', 'helpers' ]
            );

            hoistWatchers(this, elementProto);

            handleViews(this, elementProto);
            handleStyle(this, elementProto);
        }
    },
    initialize: function() {
        throwIfAlreadyRegistered(this);
        this.prepare(this.definition.proto);
        document.registerElement(this.name, {
            prototype: this.elementProto
        });

        this.status = COMPONENT_STATUS.INITIALIZED;
        this.definition = null;

        this.fire('initialized');
    },
    markFailed: function(error) {
        this.status = COMPONENT_STATUS.ERROR;

        if (typeof error === 'string') {
            error = new Error(error);
        }

        if (error) {
            throw error;
        }
    },

    /* configuration methods */
    addView: function(viewTpl, viewName) {
        this.views[viewName || 'index'] = viewTpl + '';
    },
    getView: function(viewName) {
        var result;

        viewName = viewName || 'index';

        if (this.views[viewName]) {
            result = this.views[viewName];
        }

        var setupTplIfIdMatched = function(ele) {
            if ( (ele.id || 'index') === viewName) {
                result = ele.innerHTML;
            }
        };

        if (!result) {
            utils.eachChildNodes(this.definitionEle, function(ele) {
                return ele.tagName && ele.tagName.toLowerCase() === 'template';
            }, function(ele) {
                return setupTplIfIdMatched(ele);
            });
        }

        if (!result) {
            utils.eachChildNodes(this.definitionEle, function(ele) {
                return ele.tagName && ele.tagName.toLowerCase() === 'script' &&
                        ele.getAttribute('type') === 'template';
            }, function(ele) {
                return setupTplIfIdMatched(ele);
            });
        }

        if (!result && viewName === 'index') {
            result = ' '; /* index view can ignore */
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
        /*jshint -W024 */
        Promise.resolve()
            .then(this.renderBegin.bind(this, element))
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(this.renderEnd.bind(this, element))
            .catch(this.renderFail.bind(this, element))
            .then(this.addStyle.bind(this, element));

    },
    renderBegin: function(element) {
        element.setAttribute('unresolved', '');
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
        if (hasLifeCycleEvent(element, 'render')) {
            return callLifeCycleEvent(element, 'render');
        } else {
            return Promise.resolve()
                .then(this.formatModel.bind(this, element))
                .then(this.renderHTML.bind(this, element))
                .then(this.createTree.bind(this, element));
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
        var viewName = 'index',
            commands = element.commands;

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
    /* refersh flow */
    renderFail: function(element, err) {
        logError(err);
        return tryCallLifeCycleEvent(element, 'fail', [ err ] );
    },
    renderEnd: function(element) {
        var result = tryCallLifeCycleEvent(element, 'ready');

        return Promise.resolve(result).then(function() {
            element.removeAttribute('unresolved');
            var readyEvent = new CustomEvent('ready');
            element.dispatchEvent(readyEvent);

            //$(element).trigger('ready');
        });
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

function createComponent(name) {
    var component = components[name];
    if (!component) {
        component = components[name] = new Flipper.Component(name);
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
    var script = tryGetCurrentScript();
    return script ? script.baseURI : tryGetBaseUri();
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
    if (Array.isArray(name)) {
        elementProto = dependencies;
        dependencies = name;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register( { ... } ); */
    } else if (typeof name === 'object') {
        elementProto = name;
        dependencies = undefined;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register('xxx', { ... } ); */
    } else if (typeof name === 'string' && !Array.isArray(dependencies)) {
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

        linkEles.forEach(function(ele) {
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

        styleEles.forEach(function(ele) {
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
        throw new Error('component ' + name.name + ' is initialized automatically' +
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

     if (!elementProto) {
         throw new Error('component prototype could not be inferred.');
     }


     /* it will create new component or return pending component */
     var component = createComponent(name),
        definition = component.definition;

     function registerElementProto(modules) {
         if (typeof elementProto === 'function') {
             elementProto = elementProto.apply(null, modules || []);
         }

         /* it will throw error if element proto is not an object */
         definition.mixinProto(elementProto);

         /* if the function is standalone, then mark proto as resolved */
         if (isStandalone) {
             definition.resolveProto();
         }
     }

     /* initialize created component, or create it */
     if (!dependencies) {
         registerElementProto();
     } else {
         var baseURI = tryGetBaseUriFromCurrentScript();
         dependencies = dependencies.map(function(id) {
             if (id.charAt(0) === '.') {
                 return utils.resolveUri(id, baseURI);
             } else {
                 return id;
             }
         });
         require(dependencies, function() {
             registerElementProto.call(null, arguments);
         });
     }

     /* if this component need to waiting other definition,
        then setTimeout to init automatically then log error */
     if (!isStandalone) {
        wakeComponentUpIfTimeout(component);
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

document.registerElement(Flipper.configs.declarationTag /* web-component */, {
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {
                registerFromDeclarationTag(this);
            }
        }
    })
});

if (window.FlipperPolyfill) {
    window.FlipperPolyfill.flushDeclaration(Flipper.register.bind(Flipper));
}

Flipper.getComponent = function getComponent(name) {
    return components[name];
};

Flipper.getComponentHelpers = function getComponentHelpers(name) {
    var component = components[name];

    return component ? component.getHelpers() : {};
};

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
