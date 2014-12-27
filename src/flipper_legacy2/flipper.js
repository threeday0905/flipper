var renderMethods = {
    normal: function(template) {
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

/*jshint -W024 */
Flipper.import = function(components, folder) {
    folder = folder || '../src';

    function add(name) {
        var link = document.createElement('link');
        link.rel = 'import';
        link.href = folder + name + '/index.html';
        document.head.appendChild(link);
    }

    components.split(',').map(function(val) {
        return val.trim();
    }).forEach(add);
};

Flipper.findShadow = function(target, selector) {
    return target.shadowRoot.querySelectorAll(selector);
};

Flipper.fetch = $.ajax;
