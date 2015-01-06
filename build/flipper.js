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


util.resolveUri = function(target, baseUri) {
  return new URL(target, baseUri).toString();
};

var Flipper = {
    version: '@@VERSION@@'
};

var renderMethods = {
    'default': function(template) {
        return template;
    },
    xtpl: function(template, data, element) {
        var xtpl = new XTemplate(template);
        return xtpl.render(data, {
            commands: {
                attr: function(scope, option) {
                    var key = option.params && option.params[0];
                    return key ? element.getAttribute(key) : key;
                }
            }
        });
    }
};

Flipper.getRender = function(mode) {
    return renderMethods[mode];
};

Flipper.getLoader = function() {
    if (require) {
        return require;
    } else {
        throw new Error('can not find loader');
    }
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
        name: {
            get: function() {
                return component.name;
            }
        },
        getView: {
            value: component.getView.bind(component)
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
            hoistAttributes(this, elementProto, ['presenter', 'renderer']);
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
        viewName = viewName || '';
        $(this.component).find(' > template').each(function() {
            var $tpl = $(this),
                id = $tpl.attr('id') || '';

            if (viewName === id) {
                result = $tpl.html();
                return false;
            }
        });

        return result || '';
    },
    // Styles

    /* created / attached cycle methods */
    createdCallback: function(element) {
        Promise.resolve()
            .then(function() {
                element.setAttribute('resolved', '');
            })
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(function() {
                if (typeof element.ready === 'function') {
                    element.ready();
                }
            })
            .then(function() {
                element.removeAttribute('resolved');
            })
            .catch(function(err) {
                throw err;
            });

    },
    attachedCallback: function() {

    },
    initElement: function(element) {
        element.$ = jQuery(element);
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
            if (util.isPromise(result)) {
                result = result.then(function(data) {
                    self.model = data;
                });
            } else if (typeof result === 'object') {
                self.model = result;
            }
        }
        return result;
    },
    renderNode: function(element) {
        if (typeof element.render === 'function') {
            return element.render();
        }

        return Promise.resolve()
            .then(this.renderHTML.bind(this, element))
            .then(this.createTree.bind(this, element));
    },
    renderHTML: function(element, viewName) {
        var renderMethod = Flipper.getRender(this.renderer),
            model = element.model,
            view  = this.getView(viewName),
            html  = renderMethod(view, model, element);

        return html;
    },
    getPresenter: function() {
        var presenter = this.presenter;
        if (presenter === 'light' || presenter === 'light-dom') {
            return 'light-dom';
        } else /* if (presenter === 'shadow' || presenter === 'shadow-dom') */ {
            return 'shadow-dom';
        }
    },
    createTree: function(element, html) {
        var target = this.getPresenter() === 'shadow-dom' ?
                element.createShadowRoot() : element;

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
            /*console.log('component ' + name + ' is initializing automatically' +
                ', forgot noscript attribute? ');
            component.initialize();*/

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

    util.debug('register ' + name);

    /* initialize created component, or create it */
    if (!dependencies) {
        initializeComponent(name, elementProto);
    } else {
        var baseURI = tryGetBaseUriByScript();
        dependencies = dependencies.map(function(id) {
            if (id.charAt(0) === '.') {
                return util.resolveUri(id, baseURI);
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
                    presenter: this.getAttribute('presenter'),
                    renderer:  this.getAttribute('renderer')
                };

                needToWait = !this.hasAttribute('noscript');
                util.debug('created ' + name);
                createComponent(name, options, needToWait);
            }
        }
    })
});

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

}(this));
