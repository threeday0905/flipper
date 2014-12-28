var renderMethods = {
    'default': function(template) {
        return template;
    },
    xtpl: function(template, data) {
        var xtpl = new XTemplate(template);
        return xtpl.render(data);
    }
};

Flipper.getRender = function(mode) {
    return renderMethods[mode];
};
