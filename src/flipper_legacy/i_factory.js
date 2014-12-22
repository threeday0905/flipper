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
