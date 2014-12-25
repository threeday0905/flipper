var components = {};

function attachConfig(name, options) {
    /* if the component is not exists, then create it */
    var component = components[name];

    if (!component) {
        components[name] = component = new Component(name);
    }

    if (component.isReady()) {
        throw new Error('component ' + name + ' is ready, should not be updated');
    }

    component.initialize(options);
}

function createComponent(name, options, needToWait) {
    if (components[name]) {
        throw new Error('component ' + name + ' is already registered');
    }

    var component = components[name] = new Component(name);

    if (!needToWait) {
        component.initialize(options);
    } else {
        component.setup(options);
    }
}

/**
 * use to register new component,
 *     or attach config to exist component which defined from tag
 */
Flipper.register = function(name, options) {
    if (typeof name === 'object') {
        options = name || {};
        name = (function() {
            var script = document.__currentScript || document.currentScript,
                parentNode = script && script.parentNode;
            return parentNode && parentNode.getAttribute('name') || '';
        }());
    }

    if (!name) {
        throw new Error('component name could not be inferred.');
    }

    attachConfig(name, options);
};

document.registerElement('web-component', {
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {
                var $component = $(this),
                    templates  = {},
                    name,  options, needToWait = true;

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

                needToWait = $component.not('[no-script]');

                createComponent(name, options, needToWait);
            }
        }
    })
});
