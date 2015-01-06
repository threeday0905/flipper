var renderMethods = {
    'default': function(template) {
        return template;
    },
    xtpl: function(template, data, element) {
        var xtpl = new XTemplate(template);
        return xtpl.render(data, {
            commands: {
                attr: function(scope, option) {
                    var key = option.params && option.params[0];
                    return key ? element.getAttribute(key) : key;
                }
            }
        });
    }
};

Flipper.getRender = function(mode) {
    return renderMethods[mode];
};

Flipper.getLoader = function() {
    if (require) {
        return require;
    } else {
        throw new Error('can not find loader');
    }
};
