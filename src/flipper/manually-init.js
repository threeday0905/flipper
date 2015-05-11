function isCustomNode(node) {
    return node && node.tagName &&
        utils.isCustomTag( node.tagName );
}

function getNodeObj(node) {
    if (typeof node === 'string') {
        return utils.query(node);
    } else {
        return node;
    }
}

Flipper.init = function init(node) {
    if (Flipper.useNative) {
        return false;
    }

    node = getNodeObj(node);

    if (!isCustomNode(node)) {
        return false;
    }

    if (node.initialized) {
        return false;
    }

    waitingComponent(node.tagName, node, function(component, node) {
        component.transform(node);
    });

    return true;
};

Flipper.parse = function(node) {
    if (Flipper.useNative) {
        return false;
    }

    node = getNodeObj(node);

    utils.eachChildNodes(node, undefined, function(ele) {
        if (isCustomNode(ele)) {
            Flipper.init(ele);
        } else if (ele.childNodes && ele.childNodes.length) {
            Flipper.parse(ele);
        }
    });
};
