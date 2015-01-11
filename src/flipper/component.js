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
            get: function() {
                return component.model;
            },
            set: function(value) {
                component.model = value;
            }
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
            value: function() {
                var element = this;
                Promise.resolve()
                    .then(component.renderNode.bind(component, element))
                    .then(function() {
                        if (typeof element.ready === 'function') {
                            element.ready();
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
            hoistAttributes(this, elementProto, ['templateEngine', 'injectionMode']);
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
    // Styles

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
        /* if element implement initialize, then wait unit it done */
        /*if (typeof element.initialize === 'function') {
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
        }*/
    },
    handleElement: function(element) {
        return Promise.resolve()
            .then(this.fetchModel.bind(this, element))
            .then(this.renderNode.bind(this, element))
            .then(this.addStyle.bind(this, element))
            .then(this.bindEvent.bind(this, element));
    },
    fetchModel: function(element) {
        var self = this, result;
        if (typeof element.fetch === 'function') {
            result = element.fetch();
            if (utils.isPromise(result)) {
                result = result.then(function(data) {
                    self.model = data;
                });
            } else if (typeof result === 'object') {
                self.model = result;
            }
        } else if (element.hasAttribute('model-id')) {
            element.model = Flipper.getModelSpace(element.getAttribute('model-id'));
        }
        return result;
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
        var viewName = 'index';
        return this.renderView(viewName, model, {
            element: element
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
    },

    /* attribute changed callback */
    attributeChangedCallback: function(element, args) {
        /*if (typeof this.elementProto.attributeChangedCallback === 'function') {
            this.elementProto._attributeChangedCallback.apply(element, args);
        }*/
    }
};
