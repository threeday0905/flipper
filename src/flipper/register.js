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
