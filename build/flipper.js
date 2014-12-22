window.Flipper = {
    version: '0.1.0'
};

(function() {
    'use strcit';

    var currentScriptDescriptor = {
        get: function() {
            var script = HTMLImports.currentScript || document.currentScript ||
                // NOTE: only works when called in synchronously executing code.
                // readyState should check if `loading` but IE10 is
                // interactive when scripts run so we cheat.
                (document.readyState !== 'complete' ?
                    document.scripts[document.scripts.length - 1] : null);
            return script;
        },
        configurable: true
    };

    Object.defineProperty(document, '_currentScript', currentScriptDescriptor);

}());

(function(Flipper) {
    'use strict';

    var utils = Flipper.utils = {};

    utils.eachNodes = function(nodes, callback) {
        if (!nodes || !nodes.length) { return; }

        var node;
        for (var i = 0, len = nodes.length; i < len; i += 1) {
            node = nodes[i];
            callback(node, i);
        }
    };


    utils.mix = function(to, from) {
        Object.getOwnPropertyNames(from).forEach(function(name) {
            Object.defineProperty(to, name,
                Object.getOwnPropertyDescriptor(from, name));
        });
    };
} (Flipper));

(function(Flipper) {
    'use strict';

    var config = {
        tagName: 'web-component'
    };

    Flipper._config = config;
} (Flipper));

(function(Flipper) {
    'use strict';

    function parseScript() { }

    Flipper.parser = Flipper.parser || {};
    Flipper.parser.parseScript = parseScript;
} (Flipper));

(function(Flipper) {
    'use strict';

    var utils = Flipper.utils;

    function importRuleForSheet(sheet, baseUrl) {
        var href = new URL(sheet.getAttribute('href'), baseUrl).href;
        return '@import \'' + href + '\';';
    }

    function createStyleElement(cssText, scope) {
        scope = scope || document;
        scope = scope.createElement ? scope : scope.ownerDocument;
        var style = scope.createElement('style');
        style.textContent = cssText;
        return style;
    }

    function copySheetAttributes(style, link) {
        var attrs = link.attributes,
            attr;
        for (var i = 0, len = attrs.length; i < len; i += 1) {
            attr = attrs[i];

            if (attr.name !== 'rel' && attr.name !== 'href') {
                style.setAttribute(attr.name, attr.value);
            }
        }
    }

    function extractStyleElement(ele) {
        var styles = ele.find('style'),
            content = ele.getTplContent();

        utils.eachNodes(styles, function(style) {
            content.appendChild(style);
        });
    }

    function importStyleSheet(ele) {
        var stylesheets = ele.find('link[rel="stylesheets]'),
            content = ele.getTplContent(),
            owner   = ele.getOwner(),
            baseURI = owner.baseURI;

        utils.eachNodes(stylesheets, function(node) {
            var rule  = importRuleForSheet(node, baseURI),
                style = createStyleElement(rule, owner);

            copySheetAttributes(style, node);

            node.parentNode.removeChild(node);
            content.appendChild(style);
        });
    }

    function parseStyle(ele) {
        extractStyleElement(ele);
        importStyleSheet(ele);
    }

    Flipper.parser = Flipper.parser || {};
    Flipper.parser.parseStyle = parseStyle;
} (Flipper));

(function(Flipper) {
    'use strict';
    var utils = Flipper.utils;

    var render = {
        xtpl: function(facotry) {
            var tplText = facotry.getTplHTML(),
                module = new XTemplate(tplText);

            return function(data, commands) {
                commands = utils.mix(commands || {}, {
                    $scope: function(scope) {
                        return JSON.stringify(scope.getData());
                    }
                });

                return module.render(data, {
                    commands: commands
                });
            };
        }
    };

    Flipper.render = render;
} (Flipper));

(function(Flipper) {
    'use strict';

    var utils = Flipper.utils,
        elements = {};

    function tryGetNameFromCurrentScript() {
        var script = document._currentScript,
            element = script && script.parentNode;

        return element && element.getAttribute ? element.getAttribute('name') : '';
    }

    function renderShadow(element, html) {
        var root = element.createShadowRoot();
        root.innerHTML = html;
    }

    function register(name, prototype) {
        if (typeof name !== 'string') {
            prototype = name;
            name = tryGetNameFromCurrentScript();
        }

        if (!name) {
            throw new Error('Element name could not be inferred.');
        }

        if (!elements[name].waitingRegister) {
            throw new Error('Already registered prototype for element ' + name);
        }

        var element = elements[name];
        element.waitingRegister = false;

        var fetchData = prototype && prototype.fetchData,
            overwriteRender  = prototype && prototype.render;

        var eleProto = Object.create(HTMLElement.prototype, {
            getData: {
                value: function() {
                    return this.data;
                }
            },
            createdCallback: {
                value: function() {
                    var self = this;

                    function render(data) {
                        self.data = data;
                        var html = overwriteRender ? overwriteRender.call(self, data) : element.render(data);
                        renderShadow(self, html);
                    }

                    if (this.getAttribute('scope')) {
                        var data = JSON.parse(this.getAttribute('scope'));
                        render(data);
                        this.removeAttribute('scope');

                    } else if (typeof fetchData === 'function') {
                        fetchData().then(function(data) {
                            render(data);
                        });
                    } else {
                        render({});
                    }
                }
            }
        });

        document.registerElement(name, {
            prototype: eleProto
        });
    }

    Flipper.elements  = elements;
    Flipper.register = register;
}(Flipper));

(function(Flipper) {
    'use strict';
    var config = Flipper._config,
        utils  = Flipper.utils,
        render = Flipper.render,
        parser = Flipper.parser,
        elements = Flipper.elements;

    var factoryProto = Object.create(HTMLElement.prototype);
    utils.mix(factoryProto, {
        find: function(selector) {
            return this.querySelectorAll(selector);
        },
        getName: function() {
            return this.getAttribute('name');
        },
        getTemplate: function() {
            return this.querySelector('template');
        },
        getTplContent: function() {
            var tpl = this.getTemplate();
            return tpl ? tpl.content : '';
        },
        getTplHTML: function() {
            var tpl = this.getTemplate();
            return tpl ? tpl.innerHTML : '';
        },
        getOwner: function() {
            return this.ownerDocument;
        }
    });

    utils.mix(factoryProto, {
        createdCallback: function() {
            var name = this.getName();
            parser.parseStyle(this);

            //console.log('init ' + name);
            elements[name] = {
                waitingRegister: true,
                render: render.xtpl(this)
            };
        }
    });

    document.registerElement(config.tagName, {
        prototype: factoryProto
    });
}(Flipper));

(function(Flipper) {
    'use strict';

    var componentFolder = '../component/';

    Flipper.find = function(selector) {
        var content = document.querySelector('link[rel="import"]').import;
        return content.querySelector(selector);
    };

    Flipper.import = function(href) {
        function add(name) {
            var link = document.createElement('link');
            link.rel = 'import';
            link.href = componentFolder + name + '/index.html';
            document.head.appendChild(link);
        }

        href.split(',').map(function(val) {
            return val.trim();
        }).forEach(add);
    };

    Flipper.get = function(url) {
        return $.getJSON(url);
    };
} (Flipper));
