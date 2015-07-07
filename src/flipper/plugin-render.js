var templateEngines = {};

function registerTemplateEngine(name, engine) {
    if (typeof name !== 'string' || !engine) {
        throw new Error('template engine arg have wrong format');
    }

    if (templateEngines[name]) {
        throw new Error('template engine [' + name + '] is already registered');
    }

    if (typeof engine.render !== 'function') {
        throw new Error('could not found render method for engine: ' + name);
    }


    var views = {};

    function throwIfViewIdError(viewId) {
        if (typeof viewId !== 'string' || !viewId) {
            throw new Error('view id has wrong format');
        }
    }

    templateEngines[name] = {
        hasView: function(viewId) {
            throwIfViewIdError(viewId);
            return !!views[viewId];
        },
        getView: function(viewId) {
            throwIfViewIdError(viewId);
            return views[viewId];
        },
        addView: function(viewId, viewContent) {
            throwIfViewIdError(viewId);

            if (typeof viewContent !== 'string') {
                throw new Error('view content must be string');
            }

            views[viewId] = viewContent;
        },
        renderView: function(viewId, model, options, component) {
            throwIfViewIdError(viewId);
            var view = views[viewId];

            if (!view) {
                throw new Error(
                    'could not found view "' + viewId + '" on engine ' + name);
            }

            options.viewId = viewId;
            return engine.render(view, model, options, component);
        }
    };
}

function getTemplateEngine(name) {
    if (!templateEngines[name]) {
        throw new Error('could not found the template engine: ' + name);
    }
    return templateEngines[name];
}

registerTemplateEngine('default', {
    render: function(viewContent) {
        return viewContent;
    }
});

Flipper.registerTemplateEngine = registerTemplateEngine;
Flipper.getTemplateEngine = getTemplateEngine;
