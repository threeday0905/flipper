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
