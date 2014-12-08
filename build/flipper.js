window.Flipper = {
    version: '0.1.0'
};

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

    function parseScript() { }

    Flipper.parser = Flipper.parser || {};
    Flipper.parser.parseScript = parseScript;
} (Flipper));

(function(Flipper) {
    'use strict';

    var render = {
        render: function(ele, definition) {
            var tplText = definition.getTplHTML(),
                xtpl = new XTemplate(tplText),
                root = ele.createShadowRoot(),
                html = xtpl.render();

            root.innerHTML = html;
        }
    };

    Flipper.render = render;
} (Flipper));

(function(Flipper) {
    'use strict';
    var config = Flipper._config,
        render = Flipper.render,
        parser = Flipper.parser;

    function registerElement(name, proto) {
        document.registerElement(name, {
            prototype: proto
        });
    }

    var sharedProto = Object.create(HTMLElement.prototype, {
        find: {
            value: function(selector) {
                return this.querySelectorAll(selector);
            }
        },
        getName: {
            value: function() {
                return this.getAttribute('name');
            }
        },
        getTemplate: {
            value: function() {
                return this.querySelector('template');
            }
        },
        getTplContent: {
            value: function() {
                var tpl = this.getTemplate();
                return tpl ? tpl.content : '';
            }
        },
        getTplHTML: {
            value: function() {
                var tpl = this.getTemplate();
                return tpl ? tpl.innerHTML : '';
            }
        },
        getOwner: {
            value: function() {
                return this.ownerDocument;
            }
        }
    });

    var factoryProto = Object.create(sharedProto, {
        createdCallback: {
            value: function() {
                var self = this,
                    name = this.getName();

                parser.parseStyle(this);

                registerElement(name, Object.create(sharedProto, {
                    createdCallback: {
                        value: function() {
                            render.render(this, self);
                        }
                    }
                }));
            }
        }
    });

    var component = registerElement(config.tagName, factoryProto);

    Flipper.element = component;
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

    Flipper.fetch = function(url) {
        $.getJSON(url).then(function(data) {
            console.log(data);
        });
    };
} (Flipper));
