'use strict';

var esprima = require('esprima'),
    escodegen = require('escodegen');

var fs = require('fs'),
    path = require('path');


function checkIsFlipperExpression(syntax) {
    if (syntax.type === 'ExpressionStatement' &&
        syntax.expression.type === 'CallExpression' &&
        syntax.expression.callee && syntax.expression.callee.object &&
        syntax.expression.callee.object.name === 'Flipper') {
        return true;
    }
    return false;
}

function findFlipperRecursive(syntax) {
    var key, prop, result;
    for (key in syntax) {
        prop = syntax[key];

        if (prop && typeof prop === 'object') {
            if (checkIsFlipperExpression(prop)) {
                result = prop;
            } else {
                result = findFlipperRecursive(prop);
            }
        }

        if (result) {
            break;
        }
    }
    return result;
}

function findFlipperSyntax(fullSyntax) {
    var result;
    if (checkIsFlipperExpression(fullSyntax.body[0]) ) {
        result = fullSyntax.body[0];
    } else {
        result = findFlipperRecursive(fullSyntax.body[0]);
    }

    if (!result) {
        throw new Error('could not find Flipper.register statement');
    }

    return result;
}

function findRegisterArgs(syntax) {
    try {
        return syntax.expression['arguments'];
    } catch (ex) {
        console.error('failed to find flipper register arguments');
        console.error(ex.stack);
    }
}


function findComponentPrototype(syntax) {
    try {
        var registerArgs = findRegisterArgs(syntax),
            definition;

        registerArgs.forEach(function(arg) {
            if (arg.type === 'ObjectExpression' || arg.type === 'FunctionExpression') {
                definition = arg;
            }
        });

        if (!definition) {
            definition = {
                type: 'ObjectExpression',
                properties: []
            };

            registerArgs.push(definition);
        }

        if (definition.type === 'FunctionExpression') {
            definition.body.body.forEach(function(line) {
                if (line.type === 'ReturnStatement') {
                    definition = line.argument;
                }
            });
        }

        return definition;
    } catch (ex) {
        console.error(ex.stack);
    }
}


function injectComponentAttrs(component, syntax) {
    var definition = findComponentPrototype(syntax),
        props = definition.properties;
    try {

        Object.keys(component.attrs).forEach(function(attrKey) {
            var attrVal = component.attrs[attrKey],
                isExists = false;

            props.forEach(function(prop) {
                if (prop.key.name === attrKey) {
                    isExists = true;
                }
            });

            if (!isExists) {
                props.unshift({
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: attrKey
                    },
                    computed: false,
                    value: {
                        type:  'Literal',
                        value: attrVal,
                        raw:   attrVal
                    },
                    kind: 'init',
                    method: false,
                    shorthand: false
                });
            }

        });
    } catch (ex) {
        console.error('failed to inject component attributes');
        console.error(ex.stack);
    }
}

function injectComponentTpl(component, syntax) {
    var definition = findComponentPrototype(syntax),
        props = definition.properties,
        tplDeinition, tplProps;


    try {
        props.forEach(function(prop) {
            if (prop.key.name === 'template') {
                if (prop.value.type !== 'ObjectExpression') {
                    throw new Error('Flipper template must be an object');
                }

                tplDeinition = prop.value;
            }
        });

        if (!tplDeinition) {
            tplDeinition = {
                type: 'ObjectExpression',
                properties: [
                ]
            };
            props.unshift({
                type: 'Property',
                key: {
                    type: 'Identifier',
                    name: 'template'
                },
                computed: false,
                value: tplDeinition,
                kind: 'init',
                method: false,
                shorthand: false
            });
        }

        tplProps = tplDeinition.properties;

        Object.keys(component.template).forEach(function(tplKey) {
            var tplVal = component.template[tplKey],
                isExists = false;
            tplProps.forEach(function(prop) {
                if (prop.key.name === tplKey) {
                    isExists = true;
                }
            });

            if (!isExists) {
                tplProps.unshift({
                    type: 'Property',
                    key: {
                        type: 'Identifier',
                        name: tplKey
                    },
                    computed: false,
                    value: {
                        type:  'Literal',
                        value: tplVal,
                        raw:   tplVal
                    },
                    kind: 'init',
                    method: false,
                    shorthand: false
                });
            }

        });


    } catch (ex) {
        console.error('failed to inject component template');
        console.error(ex.stack);
    }
}

function injectComponentName(component, syntax) {
    try {
        var registerArgs = findRegisterArgs(syntax);

        if (registerArgs.length === 0 || registerArgs[0].type !== 'Literal') {
            registerArgs.unshift({
                type:  'Literal',
                value: component.name,
                raw:   component.name
            });
        }
    } catch (ex) {
        console.error('failed to inject component name');
        console.error(ex.stack);
    }
}

function injectPackageName(component, syntax, options) {
    var pkgName = options.pkg,
        baseFolder = options.base,
        fileFolder = path.dirname(component.path);

    function joinPackage(moduleName) {
        var absFilePath = path.resolve(fileFolder, moduleName),
            relativeFromBase = path.relative(baseFolder, absFilePath);

        return path.join(pkgName, relativeFromBase);
    }

    try {
        var registerArgs = findRegisterArgs(syntax),
            modules;

        registerArgs.forEach(function(arg) {
            if (arg.type === 'ArrayExpression') {
                modules = arg.elements;
            }
        });

        if (modules) {
            modules.forEach(function(moduleName) {
                if (moduleName.type === 'Literal') {
                    if (moduleName.value.charAt(0) === '.') {
                        moduleName.value = moduleName.raw = joinPackage(moduleName.value);
                    }
                }
            });
        }

        if (registerArgs[0].type !== 'Literal') {
            registerArgs.unshift({
                type:  'Literal',
                value: component.name,
                raw:   component.name
            });
        }
    } catch (ex) {
        console.error('failed to inject component name');
        console.error(ex.stack);
    }
}

function parseComponent(component, fullSyntax, options) {
    var syntax = findFlipperSyntax(fullSyntax);
    injectComponentName(component, syntax);
    injectPackageName(component, syntax, options);
    injectComponentTpl(component, syntax);
    injectComponentAttrs(component, syntax);
}


exports.parse = function (component, options) {
    if (!component.register) {
        component.register = 'Flipper.register()';
    }

    var syntax = esprima.parse(component.register);

    parseComponent(component, syntax, options);

    component.register = escodegen.generate(syntax, {
        format: {
            indent: {
                style: '    '
            },
            quotes: 'single'
        }

    });

    return component;
};
