var templateEngines = {};

function registerTemplateEngine(name, engine) {
    expect(name).isString();
    expect(engine).notNull();

    if (templateEngines[name]) {
        throw new Error('template engine [' + name + '] is already registered');
    }

    if (typeof engine.render !== 'function') {
        throw new Error('could not found render method for engine: ' + name);
    }


    var views = {};

    templateEngines[name] = {
        hasView: function(viewId) {
            expect(viewId).isString().notNull();
            return !!views[viewId];
        },
        getView: function(viewId) {
            expect(viewId).isString().notNull();
            return views[viewId];
        },
        addView: function(viewId, viewContent) {
            expect(viewId).isString().notNull();
            expect(viewContent).isString();
            views[viewId] = viewContent;
        },
        renderView: function(viewId, model, options) {
            expect(viewId).isString().notNull();
            var view = views[viewId];

            if (!view) {
                throw new Error(
                    'could not found view "' + viewId + '" on engine ' + name);
            }

            options.viewId = viewId;
            return engine.render(view, model, options);
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
