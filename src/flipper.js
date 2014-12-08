var tagName = 'web-component';


/*var proto = Object.create(HTMLTemplateElement.prototype);
proto.createdCallback = function() {
    console.log('created callback');
};

var element = document.registerElement(tagName, {
    prototype: proto
});

*/


function eachNode(nodes, callback) {
    var node;

    for (var i = 0, len = nodes.length; i < len; i += 1) {
        node = nodes[i];
        callback(node, i);
    }
}

var proto = Object.create(HTMLTemplateElement.prototype);


function importRuleForSheet(sheet, baseUrl) {
    var href = new URL(sheet.getAttribute('href'), baseUrl).href;
    return '@import \'' + href + '\';';
}

function createStyleElement(cssText, scope) {
    scope = scope || document;
    scope = scope.createElement ? scope : scope.ownerDocument;
    var style = scope.createElement('style');
    style.textContent = cssText;
    return style;
}

function copySheetAttributes(style, link) {
    var attrs = link.attributes, attr;
    for (var i = 0, len = attrs.length; i < len; i += 1) {
        attr = attrs[i];

        if (attr.name !== 'rel' && attr.name !== 'href') {
            style.setAttribute(attr.name, attr.value);
        }
    }
}


proto.createdCallback = function() {

    var name = this.getAttribute('name'),
        tpl = this.querySelector('template'),
        content = tpl.content,
        proto = Object.create(HTMLElement.prototype);

    var ownerDocument = this.ownerDocument,
        baseURI = ownerDocument.baseURI;

    var style = this.querySelector('style');
    if (style) {
        content.appendChild(style);
    }


    var links = this.querySelectorAll('link[rel="stylesheet"]');
    if (links) {
        eachNode(links, function(node) {
            var rule = importRuleForSheet(node, baseURI),
                style = createStyleElement(rule, ownerDocument);

            copySheetAttributes(style, node);

            node.parentNode.removeChild(node);
            content.appendChild(style);
        });
    }

    proto.createdCallback = function() {
        //var clone = document.importNode(tpl.content, true);
        //this.createShadowRoot().appendChild(clone);
        //
        var view = tpl.innerHTML,
            render = new XTemplate(view),
            root = this.createShadowRoot(),
            html = render.render();


        root.innerHTML = html;
    };

    document.registerElement(name, {
        prototype: proto
    });

};
proto.attachedCallback = function() {
    console.log('attached');
};

var WebComponent = document.registerElement('web-component', {
    prototype: proto
});

var Flipper = F = {};

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

//<link rel="import" href="../component/report-editor/index.html">
