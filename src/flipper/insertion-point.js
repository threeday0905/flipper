var insertionPointUtil = {
    lookupContentNode: function lookupContentNode(target, callback) {
        if (!target || !target.childNodes) {
            return;
        }

        utils.eachChildNodes(target, null, function(child) {
            if (child.nodeType !== 1) {
                return;
            }

            if (child.tagName === 'CONTENT') {
                callback(child);
            } else if (child.childNodes && child.childNodes.length) {
                insertionPointUtil.lookupContentNode(child, callback);
            }
        });
    },
    makeContentFragment: function(srcNode) {
        var fragment = document.createDocumentFragment();
        utils.moveChildNodes(fragment, srcNode);
        return fragment;
    },
    handleContentReflect: function handleContentReflect(contentNode, presentNode) {
        insertionPointUtil.lookupContentNode(presentNode, function(content) {
            var select = content.getAttribute('select'),
                defaultWrapper, matchedNode;

            if (select) {
                utils.eachChildNodes(contentNode, function(node) {
                    return node.nodeType === 1 && utils.matchSelector(node, select);
                }, function(node) {
                    matchedNode = node;
                    return false; /* break the iterate */
                });

                if (matchedNode) {
                    if (content.hasAttribute('inner')) {
                        utils.replaceChildNodes(content, matchedNode);
                    } else {
                        content.parentNode.replaceChild(matchedNode, content);
                    }
                } else {
                    if (content.hasAttribute('default')) {
                        defaultWrapper = document.createElement('div');
                        defaultWrapper.innerHTML = content.getAttribute('default');
                        utils.replaceChildNodes(content, defaultWrapper);
                    } else {
                        content.parentNode.removeChild(content);
                    }
                }
            } else {
                utils.replaceChildNodes(content, contentNode);
            }
        });
    }
};
