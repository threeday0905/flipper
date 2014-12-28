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
