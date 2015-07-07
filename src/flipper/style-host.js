var addedStyle = {},
    styleNode;

var styleHost = {
    add: function(name, style) {
        if (addedStyle[name]) {
            return;
        }

        if (!styleNode) {
            styleNode = document.createElement('style');
            (document.head || document.body).appendChild(styleNode);
        }

        if (style && style.length) {
            styleNode.textContent += style;
        }

        addedStyle[name] = true;
    }
};


