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
