var packages = {};

function endsWtih(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getPackage(str) {
    var match = /(\w+)\//.exec(str);
    return match ? match[1] : '';
}

Flipper.config = function(name, options) {
    if (name === 'packages' && typeof options === 'object') {
        Object.keys(options).forEach(function(key) {
            packages[key] = options[key];
        });
    }
};

Flipper.imports = function() {
    var baseURI = document.baseURI,
        components = Array.prototype.slice.call(arguments, 0);

    if (components) {
        var frag = document.createDocumentFragment();

        components.map(function(name) {
            var pkg = getPackage(name);

            if (pkg && packages[pkg] && packages[pkg].base) {
                name = packages[pkg].base + name.substr(pkg.length);
            }

            if ( endsWtih(name, '/') ) {
                name += 'index.html';
            }


            return new URL(name, baseURI).toString();
        }).forEach(function(url) {
            var link = document.createElement('link');
            link.rel = 'import';
            link.href = url;
            frag.appendChild(link);
        });

        document.head.appendChild(frag);
    }
};

Flipper.findShadow = function(target, selector) {
    return target.shadowRoot.querySelectorAll(selector);
};

Flipper.fetch = $.ajax;
