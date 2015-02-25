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

/*function collectViewsFromNode(node) {
    var views = {};
    $(node).find(' > template').each(function() {
        var $tpl = $(this);
        views[ $tpl.attr('id') || '' ] = $tpl.html();
    });
    return views;
}*/


function collectStyleFromNode(node) {
    var baseURI = tryGetBaseUriFromNode(node),
        style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var ele, i, len, linkEles = [];

        for (i = 0, len = node.childNodes.length; i < len; i += 1) {
            ele = node.childNodes[i];

            if (ele.tagName && ele.tagName.toLowerCase() === 'link' &&
                ele.getAttribute('rel') === 'stylesheets') {
                linkEles.push(ele);
            }
        }

        linkEles.forEach(function(ele) {
            var href = new URL(ele.getAttribute('href', baseURI));
            style += '@import "' + href + '";';
            node.removeChild(ele);
        });
    }

    function extractStyleElement() {
        var ele, i, len, styleEles = [];

        for (i = 0, len = node.childNodes.length; i < len; i += 1) {
            ele = node.childNodes[i];

            if (ele.tagName && ele.tagName.toLowerCase() === 'style') {
                styleEles.push(ele);
            }
        }

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
