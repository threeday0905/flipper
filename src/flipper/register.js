var components = {};

var waitings = {};

function waitingComponent(name, callback) {
    name = name.toLowerCase();
    var component = components[name];

    if (component && component.isReady()) {
        callback(component);
    } else {
        if (!waitings[name]) {
            waitings[name] = [];
        }

        waitings[name].push(callback);
    }
}

/*****************************************/

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
    var script = tryGetCurrentScript(),
        wrapper = tryGetWrapperFromCurrentScript(),
        baseURI;


    /* ths script is inside <web-component> on independent html file */
    if (wrapper && wrapper.tagName &&
        wrapper.tagName.toLowerCase() === Flipper.configs.declarationTag) {
        baseURI = wrapper.baseURI;

        /* the script is loaded as independent js file*/
    } else if (script.src) {
        baseURI = script.src;

        /* otherwise get the base uri. */
    } else {
        baseURI = script.baseURI || script.ownerDocument.baseURI;
    }

    return baseURI || tryGetBaseUri();
}

function tryGetNameFromCurrentScript() {
    var wrapper = tryGetWrapperFromCurrentScript();
    return wrapper ? wrapper.getAttribute('name') : '';
}

/*****************************************/

function wakeComponentUpIfTimeout(component) {
    if (component.isReady()) {
        return;
    }

    var timer = setTimeout(function() {
        if (component.isReady()) {
            return;
        }

        component.initialize();
        throw new Error('component ' + component.name + ' is initialized automatically' +
            ', forgot [noscript] attribute? ');
    }, 10000);

    component.on('initialized', function() {
        clearTimeout(timer);
    });
}

function createComponent(name) {
    var component = components[name];
    if (!component) {
        component = components[name] = new Flipper.Component(name);
        component.on('initialized', function() {
            if (!waitings[name]) {
                return;
            }

            utils.each(waitings[name], function(callback) {
                callback(component);
            });
            waitings[name] = null;
        });
    }

    if (component.isReady()) {
        throw new Error('component ' + component.name + ' is already registered');
    }

    return components[name];
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


    /* it will create new component or return pending component */
    var component = createComponent(name),
        definition = component.definition;


    if (!elementProto) {
        component.markFailed(
            'component [' + name + '] prototype could not be inferred.');
        return;
    }

    function markRegistrationCompleted(modules) {
        /* if the elementProto is function,
           it will be executed after dependency module loaded,
           and the returing value will be assigned as element proto */
        definition.mixinProto(elementProto);

        /* we need to call mixin modules even there is no dependencies,
           since the ready method will be called after mixin twice */
        definition.mixinModules(modules);

        /* in normal case, the register method will be called from
                1. definition tag: <web-component>
                2. register method: Flipper.register()

           if the component only has one registration fn,
                then call resolve method directly */
        if (isStandalone) {
            definition.resolveProto();
            definition.resolveModules();
        } else {
            wakeComponentUpIfTimeout(component);
        }
    }

    if (dependencies) {
        var baseURI = tryGetBaseUriFromCurrentScript();
        utils.each(dependencies, function(id, index) {
            if (id.charAt(0) === '.') {
                id = utils.resolveUri(id, baseURI);
                dependencies[index] = id;
            }
        });

        if (Flipper.require.check()) {
            Flipper.require(dependencies, {
                success: function() {
                    markRegistrationCompleted(arguments);
                },
                error: function(moduleA) {
                    var error = 'error';
                    if (moduleA && moduleA.error && moduleA.error.exception) {
                        error = moduleA.error.exception;
                    }

                    component.markFailed(error);
                }
            });
        } else {
            component.markFailed('could not found the global module loader');
        }

    } else {
        markRegistrationCompleted();
    }
}

/*****************************************/

/**
 * register from script, e.g. Flipper.register( 'xxx', ... );
 */
function parseScriptArgs(name, dependencies, elementProto) {
    /* Flipper.register( [ dep1, dep2], { ... } ); */
    if (utils.isArray(name)) {
        elementProto = dependencies;
        dependencies = name;
        name = tryGetNameFromCurrentScript();

        /* Flipper.register( { ... } ); || Flipper.register(); */
    } else if (typeof name === 'object' || name === undefined) {
        elementProto = name;
        dependencies = undefined;
        name = tryGetNameFromCurrentScript();

        /* Flipper.register('xxx', { ... } ); */
    } else if (typeof name === 'string' && !utils.isArray(dependencies)) {
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

function registerFromFactoryScript(name, dependencies, elementProto) {
    var componentArgs = parseScriptArgs(name, dependencies, elementProto);

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

/*****************************************/

/**
 * register from declaration tag, e.g <web-component name="xxx">...</web-component>
 */
function collectStyleFromNode(node) {
    var baseURI = tryGetBaseUriFromNode(node),
        style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var linkEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'link' &&
                ele.getAttribute('rel') === 'stylesheet';
        }, function(ele) {
            linkEles.push(ele);
        });

        utils.each(linkEles, function(ele) {
            var href = new URL(ele.getAttribute('href'), baseURI);
            style += '@import "' + href + '";';
            node.removeChild(ele);
        });
    }

    function extractStyleElement() {
        var styleEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'style';
        }, function(ele) {
            styleEles.push(ele);
        });

        utils.each(styleEles, function(ele) {
            var styleContent = ele.innerHTML;
            style += styleContent;
            node.removeChild(ele);
        });
    }

    extractStyleSheet();
    extractStyleElement();

    return style;
}

function registerFromDeclarationTag(ele) {
    var elementProto, componentArgs;

    elementProto = {
        definitionEle: ele,
        style: collectStyleFromNode(ele),
        templateEngine: ele.getAttribute('template-engine'),
        injectionMode: ele.getAttribute('injection-mode')
    };

    componentArgs = {
        name: ele.getAttribute('name'),
        dependencies: undefined,
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


/*****************************************/


/**
 * register component by script: Flipper.register( ... )
 */
Flipper.define = Flipper.register = registerFromFactoryScript;

/**
 * register component by tag: <web-component> ... </web-component>
 */
if (Flipper.useNative) {
    document.registerElement(Flipper.configs.declarationTag, {
        prototype: utils.createObject(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    registerFromDeclarationTag(this);
                }
            }
        })
    });
}

/**
 * if cached some declaration before, the flush thosem
 */
if (window.FlipperPolyfill) {
    window.FlipperPolyfill.flushDeclaration(Flipper.register.bind(Flipper));
}

/**
 * other related apis
 */
Flipper.getComponent = function getComponent(name) {
    return components[name.toLowerCase()];
};

Flipper.hasComponent = function hasComponent(name) {
    return !!Flipper.getComponent(name);
};

/**
 * deparacted
 */
Flipper.getComponentHelpers = function getComponentHelpers(name) {
    var component = Flipper.getComponent(name);

    return component ? component.getHelpers() : {};
};

Flipper.components = components;
