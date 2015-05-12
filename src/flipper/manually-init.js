function isCustomNode(node) {
    return node && node.tagName &&
        utils.isCustomTag( node.tagName );
}

Flipper.init = function flipperInit(nodes) {
    if (Flipper.useNative) {
        return false;
    }

    function initElement(component, node, needRebuild) {
        component.transform(node, needRebuild);
    }

    function handler(node) {
        if (!isCustomNode(node)) {
            return false;
        }

        if (node.initialized) {
            return false;
        }

        waitingComponent(node.tagName, node, initElement);
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
