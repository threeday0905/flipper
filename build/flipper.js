(function() {
'use strict';

var Flipper = {
    version: '0.1.0'
};

/*
    TODO Polyfills:
    - all es5 feature (Object.keys, Array.isArray, Object.create, etc.)
    - current script
    - Promise
    - web components
 */

var utils = {};

utils.format = function(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

utils.log = function() {
    var msg = utils.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};

utils.error = function() {
    var msg = utils.apply(utils, arguments);
    throw new Error(msg);
};

var renderMethods = {
    normal: function(template) {
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

var FLOW_APIS = ['createdCallback', 'attachedCallback', 'detachedCallback'];

function registerElement(component) {
    function wrapCallback(name) {
        return function() {
            component[name].call(component, this);
        };
    }
    var eleProto = Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: wrapCallback('createdCallback')
        },
        attachedCallback: {
            value: wrapCallback('attachedCallback')
        },
        detachedCallback: {
            value: wrapCallback('detachedCallback')
        }
    });

    document.registerElement(component.name, {
        prototype: eleProto
    });
}

function Component(name, options) {
    this.name = name;
    this.status = 'unresolved';

    this.domMode = 'shadow';
    this.renderMode = 'normal';

    this.templates = {};
    this.styles = [];

    this.dataQueue = [];

    this.lifeCycleCallback = {
        createdCallback: [],
        attachedCallback: [],
        detachedCallback: []
    };

    this.setup(options);
    registerElement(this);
    Component.add(name, this);
}

Component.prototype = {
    setup: function(options) {
        var name = this.name;

        if (this.status === 'ready') {
            throw new Error(
                util.format('should not re-setup registered component %s', name));
        }

        if (typeof options !== 'object') {
            return;
        }

        if (options.template) {
            this.addTemplate(options.template);
        }

        if (typeof options.templates === 'object') {
            Object.keys(options.templates).forEach(function(key) {
                this.addTemplate(options.templates[key], key);
            }, this);
        }

        if (options.domMode) {
            this.updateDomMode(options.domMode);
        }

        if (options.renderMode) {
            this.updateRenderMode(options.renderMode);
        }

        if (options.requireData) {
            this.addDataQueue(options.requireData);
        }

        FLOW_APIS.forEach(function(apiName) {
            var callback = options[apiName],
                addCallback = this.addLifeCycleCallback.bind(this, apiName);

            if (typeof callback === 'function') {
                addCallback(callback);
            } else if (Array.isArray(callback)) {
                callback.forEach(addCallback);
            }
        }, this);
    },
    updateDomMode: function(value) {
        /* available value: light | dom */
        this.domMode = value;
    },
    updateRenderMode: function(value) {
        /* default value: 'normal', can extend by flipper plugin, like 'xtpl' */
        this.renderMode = value;
    },
    addDataQueue: function(desc) {
        this.dataQueue.push(desc);
    },
    addLifeCycleCallback: function(name, value) {
        if (this.lifeCycleCallback[name] && typeof value === 'function') {
            this.lifeCycleCallback[name].push(value);
        }
    },
    addTemplate: function(template, name) {
        name = name || this.name;

        if (typeof template !== 'string') {
            template = String(template);
        }

        this.templates[name] = template;
    },
    addStyle: function(style) {
        this.styles.push(style);
    },
    fetchData: function(element) {
        var fetchEvent = this.dataQueue[0],
            result = typeof fetchEvent === 'function' ?
            fetchEvent.call(element) : fetchEvent,
            promise;

        if (result && typeof result.then === 'function') {
            promise = result;
        } else {
            promise = new Promise(function(resolve) {
                resolve(result);
            });
        }

        return promise;
    },
    renderHTML: function(data) {
        var renderMethod = Flipper.getRender(this.renderMode),
            template = this.templates[this.name],
            html = renderMethod(template, data);

        return html;
    },
    createdCallback: function(element) {
        var self = this;

        this.fetchData(element)
            .then(function(data) {
                return self.renderHTML(data, element);
            })
            .then(function(html) {
                var targetEle = self.domMode === 'shadow' ?
                    element.createShadowRoot() :
                    element;

                targetEle.innerHTML = html;

                self.lifeCycleCallback.createdCallback.forEach(function(fn) {
                    fn.call(element);
                });
            });
    },
    attachedCallback: function(element) {
        this.lifeCycleCallback.attachedCallback.forEach(function(fn) {
            fn.call(element);
        });
    },
    detachedCallback: function(element) {
        this.lifeCycleCallback.detachedCallback.forEach(function(fn) {
            fn.call(element);
        });
    }
};

Component.elements = {};
Component.add = function(name, component) {
    if (component instanceof Component) {
        Component.elements[name] = component;
    }
};

/* create method */
Flipper.register = function(name, options) {
    if (arguments.length < 2) {
        options = arguments[0] || {};
        name = (function() {
            var script = document.__currentScript || document.currentScript;
            return script.parentNode.getAttribute('name') || '';
        }());
    }

    var component = Component.elements[name];

    if (!component) {
        component = new Component(name, options);
    } else {
        component.setup(options);
    }
};

document.registerElement('web-component', {
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {
                var $component = $(this),
                    templates = {},
                    name,  options;

                $component.find(' > template').map(function() {
                    var $tpl = $(this);
                    templates[ $tpl.attr('id') || '' ] = $tpl.html();
                });

                name = $component.attr('name');
                options = {
                    templates:  templates,
                    domMode:    $component.attr('dom-mode'),
                    renderMode: $component.attr('render-mode')
                };

                Flipper.register(name, options);
            }
        }
    })
});


window.Flipper = Flipper;
} () );
