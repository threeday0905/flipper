function isCustomNode(node) {
    return node && node.tagName &&
        utils.isCustomTag( node.tagName );
}

Flipper.init = function flipperInit(nodes) {
    if (Flipper.useNative) {
        return false;
    }

    function handler(node) {
        if (!isCustomNode(node)) {
            return false;
        }

        if (node.initialized) {
            return false;
        }

        var component = Flipper.getComponent(node.tagName);

        if (component && component.isReady()) {
            component.transform(node);
        } else {
            waitingComponent(node.tagName, function(component) {
                component.transform(node, true);
            });
        }
    }

    utils.handleNode(nodes, handler);

    return true;
};

Flipper.parse = function flipperParse(nodes) {
    if (Flipper.useNative) {
        return false;
    }

    utils.handleNode(nodes, function(node) {
        utils.eachChildNodes(node, undefined, function(childNode) {
            if (isCustomNode(childNode)) {
                Flipper.init(childNode);
            } else if (childNode.childNodes && childNode.childNodes.length) {
                Flipper.parse(childNode);
            }
        });
    });
};
