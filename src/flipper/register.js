var components = {};

function createComponent(name, elementProto, needToWait) {
    if (components[name]) {
        throw new Error('component ' + name + ' is already registered');
    }

    var component = components[name] = new Flipper.Component(name);

    component.prepare(elementProto);

    if (!needToWait) {
        component.initialize();
    } else {
        var timer = setTimeout(function() {
            component.initialize();
            throw new Error('component ' + name + ' is initializing automatically' +
                ', forgot [noscript] attribute? ');

        }, 10000);

        component.on('initialized', function() {
            clearTimeout(timer);
        });
    }

    return component;
}

function initializeComponent(name, elementProto) {
    /* if the component is not exists, then create it */
    var component = components[name];

    if (!component) {
        component = createComponent(name, {}, true);
    }

    /* it will throw error, if already initialized */
    component.initialize(elementProto);
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
            if (typeof elementProto === 'function') {
                elementProto = elementProto.apply(elementProto, arguments);
            }

            initializeComponent(name, elementProto);
        });
    }
};

/*function collectViews(node) {
    var views = {};
    $(node).find(' > template').each(function() {
        var $tpl = $(this);
        views[ $tpl.attr('id') || '' ] = $tpl.html();
    });
    return views;
}*/

function collectStyle(node) {
    var $node   = $(node),
        baseURI = node.ownerDocument.baseURI,
        style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var $links = $node.find(' > link[rel="stylesheets"]');
        $links.each(function() {
            var href = new URL(this.getAttribute('href', baseURI));
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

                var name, options, needToWait;

                name = this.getAttribute('name');

                options = {
                    definitionEle: this,
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

Flipper.getComponent = function getComponent(name) {
    return components[name];
};

Flipper.getComponentHelpers = function getComponentHelpers(name) {
    var component = components[name];

    return component ? component.getHelpers() : {};
};

Flipper.define = Flipper.register;
Flipper.components = components;
