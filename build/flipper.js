;(function(window) {
'use strict';

/*
    TODO Polyfills:
    - all es5 feature (Object.keys, Array.isArray, Object.create, etc.)
    - current script
    - Promise
    - web components
 */

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

var Flipper = {
    version: '@@VERSION@@'
};

var renderMethods = {
    'default': function(template) {
        return template;
    },
    xtpl: function(template, data) {
        var xtpl = new XTemplate(template);
        return xtpl.render(data);
    }
};

Flipper.getRender = function(mode) {
    return renderMethods[mode];
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
            get: function() {
                return component.model;
            },
            set: function(value) {
                component.model = value;
            }
        },
        getView: {
            value: function(viewName) {
                return component.views[viewName || 'index'];
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

    this.presenter    = 'shadow'; /* render to shadow root OR inner HTML */
    this.renderer = 'default';

    this.model = {};
    this.views = {};
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
            hoistAttributes(this, elementProto, ['presenter', 'renderer']);
            handleViews(this, elementProto);
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
    // Styles

    /* created / attached cycle methods */
    createdCallback: function(element) {
        Promise.resolve()
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(function() {
                if (typeof element.ready === 'function') {
                    element.ready();
                }
            })
            .catch(function(err) {
                console.error(err);
            });

    },
    attachedCallback: function() {

    },
    initElement: function(element) {
        element.$ = jQuery(element);

        if (typeof element.initialize === 'function') {
            /* if element implement initialize, then wait unit it done */
            var _initialize = element.initialize;
            element.setAttribute('unresolved', '');
            return new Promise(function(resolve) {
                element.initialize = function() {
                    resolve(_initialize.apply(element, arguments));
                };
            }).then(function(result) {
                element.removeAttribute('unresolved');
                element.initialize = _initialize;
                return result;
            });
        }
    },
    handleElement: function(element) {
        return Promise.resolve()
            .then(this.fetchModel.bind(this, element))
            .then(this.renderHTML.bind(this, element))
            .then(this.createTree.bind(this, element))
            .then(this.bindEvent.bind(this, element));
    },
    fetchModel: function(element) {
        var self = this;
        if (typeof element.fetch === 'function') {
            return element.fetch().then(function(data) {
                self.model = data;
            });
        }
    },
    renderHTML: function(element, viewName) {
        var renderMethod = Flipper.getRender(this.renderer),
            model = element.model,
            view  = this.views[viewName || 'index'],
            html  = renderMethod(view, model);

        return html;
    },
    createTree: function(element, html) {
        var target = this.presenter === 'shadow' ?
                element.createShadowRoot() : element;

        target.innerHTML = html;
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
            console.log('component ' + name + ' is initializing automatically, forgot noscript attribute? ');
            component.initialize();
        }, 1000);
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

/**
 * use to register new component,
 *     or attach config to exist component which defined from tag
 */
Flipper.register = function(name, elementProto) {
    if (typeof name === 'object') {
        elementProto = name || {};
        name = (function() {
            var script = document.__currentScript || document.currentScript,
                parentNode = script && script.parentNode;
            return parentNode && parentNode.getAttribute('name') || '';
        }());
    }

    if (!name) {
        throw new Error('component name could not be inferred.');
    }

    console.log('register ' + name);
    /* initialize created component, or create it */
    initializeComponent(name, elementProto);
};

document.registerElement('web-component', {
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {

                var $component = $(this),
                    name, options, views  = {},
                    needToWait = true;

                $component.find(' > template').map(function() {
                    var $tpl = $(this);
                    views[ $tpl.attr('id') || '' ] = $tpl.html();
                });

                name = this.getAttribute('name');

                options = {
                    views:     views,
                    presenter: this.getAttribute('presenter'),
                    renderer:  this.getAttribute('renderer')
                };

                needToWait = !this.hasAttribute('noscript');
                console.log('created ' + name);
                createComponent(name, options, needToWait);
            }
        }
    })
});

/*jshint -W024 */
Flipper.import = function(components, folder) {
    folder = folder || '../src';

    function add(name) {
        var link = document.createElement('link');
        link.rel = 'import';
        link.href = folder + name + '/index.html';
        document.head.appendChild(link);
    }

    components.split(',').map(function(val) {
        return val.trim();
    }).forEach(add);
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

}(this));
