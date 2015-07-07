(function() {
'use strict';

var compiledView = {};

function compileView(viewId, viewContent) {
    if (viewId) {
        if (!compiledView[viewId]) {
            compiledView[viewId] = new XTemplate(viewContent);
        }
        return compiledView[viewId];
    } else {
        return new XTemplate(viewContent);
    }
}

function requestSpace(scope, option) {
    var data = (option && option.params) ? option.params[0] : undefined;
    return Flipper.dataCenter.requestSpace(data);
}

function renderView(viewContent, data, options, component) {
    var viewId = options.viewId,
        element = options.element,
        compiledView = compileView(viewId, viewContent);

    var commands = options.commands || {};
    commands.attr = function(scope, options) {
        var key = options.params && options.params[0];
        return key ? element.getAttribute(key) : key;
    };

    commands.modelId = function() {
        return element.modelId || '';
    };

    commands.model = commands.requestSpace = requestSpace;

    options.commands = commands;

    compiledView.config.loader = {
        tplCache: {},
        load: function(tpl, callback) {
            var tplName = tpl.name;
            if (!this.tplCache[tplName]) {
                this.tplCache[tplName] = tpl.root.compile(component.getView(tplName));
            }
            callback(null, this.tplCache[tpl.name]);
        }
    };

    return compiledView.render(data, options);
}

Flipper.registerTemplateEngine('xtpl', {
    render: renderView
});

}());
