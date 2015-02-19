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

function renderView(viewContent, data, options) {
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

    commands.requestSpace = requestSpace;

    if (options.commands) {
        Object.keys(options.commands).forEach(function(key) {
            if (typeof options.commands[key] === 'function') {
                commands[key] = options.commands[key];
            } else {
                console.warn('template command must be a function');
            }
        });
    }

    options.commands = commands;

    return compiledView.render(data, options);
}

Flipper.registerTemplateEngine('xtpl', {
    render: renderView
});
