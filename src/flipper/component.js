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
        return key.substr(key.length - suffix.length);
    }

    utils.each(options, function(val, key) {
        if (isWatcherMethod(key) && typeof val === 'function') {
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
        utils.each(options.template, function(val, key) {
            component.addView(val, key);
        });
    }
}

function handleStyle(component, options) {
    if (options.style) {
        component.style = options.style;
    }
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
    utils.each(elementProto, function(val, key) {
        var descriptor = utils.getDescriptor(elementProto, key);

        if (key === 'model') {
            targetProto.model = elementProto.model;
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
            value: function(viewName, data, options) {
                if (typeof viewName === 'object') {
                    options = data;
                    data = viewName;
                    viewName = 'index';
                }
                options = options || {};
                options.element = this;

                var commands = this.commands;

                if (typeof commands === 'function') {
                    commands = commands.call(this);
                }

                if (typeof commands === 'object') {
                    if (options.commands) {
                        utils.mixin(options.commands, commands);
                    } else {
                        options.commands = commands;
                    }
                }

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
    transform: function(dom, needRebuild) {
        if (this.status === COMPONENT_STATUS.INITIALIZING) {
            this.on('initialized', function() {
                this.transform(dom);
            });
        } else if (this.status === COMPONENT_STATUS.INITIALIZED) {
            /* transform it if the node is empty */
            if (!dom.__flipper__) {
                if (needRebuild) {
                    var clonedNode = utils.cloneNode(dom);
                    clonedNode.__flipper_when__ = dom.__flipper_when__;
                    dom.parentNode.replaceChild(clonedNode, dom);
                    dom = clonedNode;
                }

                utils.mixin(dom, this.elementProto);
                dom.createdCallback();
                dom.attachedCallback();
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
        var result;

        viewName = viewName || 'index';

        if (this.views[viewName]) {
            result = this.views[viewName];
        }

        var setupTplIfIdMatched = function(ele) {
            if ( (ele.id || 'index') === viewName) {
                result = ele.innerHTML;

                /* if template polyfill,
                    all content will be copied to content as a fragment */
                if (!result && ele.content && ele.content.cloneNode) {
                    var div = document.createElement('div');
                    div.appendChild(ele.content.cloneNode(true));
                    result = div.innerHTML;
                }
            }
        };

        if (!result && this.definitionEle) {
            utils.eachChildNodes(this.definitionEle, function(ele) {
                return ele.tagName && ele.tagName.toLowerCase() === 'template';
            }, function(ele) {
                return setupTplIfIdMatched(ele);
            });

            if (!result) {
                utils.eachChildNodes(this.definitionEle, function(ele) {
                    return ele.tagName && ele.tagName.toLowerCase() === 'script' &&
                            ele.getAttribute('type') === 'template';
                }, function(ele) {
                    return setupTplIfIdMatched(ele);
                });
            }
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
        utils.debug(element, 'is created');
        var renderComplete = this.renderComplete.bind(this, element);

        /*jshint -W024 */
        Promise.resolve()
            .then(this.renderBegin.bind(this, element))
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(this.renderSuccess.bind(this, element))
            ['catch'](this.renderFail.bind(this, element))
            .then(this.addStyle.bind(this, element))
            .then(renderComplete, renderComplete);

    },
    renderBegin: function(element) {
        utils.debug(element, 'render begin');
        element.setAttribute('unresolved', '');
        element.__flipper__ = true;
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
        if (!this.style || !this.style.length) {
            return;
        }

        var style = document.createElement('style');
        style.textContent = this.style;
        style.setAttribute('referance-to', this.name);

        if (element.shadowRoot && element.shadowRoot.innerHTML) {
            element.shadowRoot.appendChild(style);
        } else {
            var existsStyle = utils.query(element,
                'style[referance-to="' + this.name + '"]');
            if (!existsStyle) {
                (document.head || document.body).appendChild(style);
            }
        }

    },
    /* refersh flow */
    renderFail: function(element, err) {
        utils.debug(element, 'render fail');
        utils.error(err);

        element.status = 'error';
        element.reason = err;

        var result = tryCallLifeCycleEvent(element, 'fail', [ err ] );

        return Promise.resolve(result).then(function() {
            triggerExternalLifeEvent(element, 'error');
        });
    },
    renderSuccess: function(element) {
        utils.debug(element, 'render success');

        element.status = 'success';

        var result = tryCallLifeCycleEvent(element, 'ready');

        return Promise.resolve(result).then(function() {
            triggerExternalLifeEvent(element, 'success');
        });
    },
    renderComplete: function(element) {
        utils.debug(element, 'render complete');
        element.removeAttribute('unresolved');
        element.initialized = true;

        triggerExternalLifeEvent(element, 'ready');

        if (!Flipper.useNative) {
            Flipper.parse(element);
        }

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
