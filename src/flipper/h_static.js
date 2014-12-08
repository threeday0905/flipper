(function(Flipper) {
    'use strict';

    var componentFolder = '../component/';

    Flipper.find = function(selector) {
        var content = document.querySelector('link[rel="import"]').import;
        return content.querySelector(selector);
    };

    Flipper.import = function(href) {
        function add(name) {
            var link = document.createElement('link');
            link.rel = 'import';
            link.href = componentFolder + name + '/index.html';
            document.head.appendChild(link);
        }

        href.split(',').map(function(val) {
            return val.trim();
        }).forEach(add);
    };

    Flipper.fetch = function(url) {
        $.getJSON(url).then(function(data) {
            console.log(data);
        });
    };
} (Flipper));
