var insertionPointUtil = {
    lookupContentNode: function lookupContentNode(target, callback) {
        if (!target || !target.childNodes) {
            return;
        }

        var currNode,
            nextNode = target.firstChild;
        while(nextNode) {
            currNode = nextNode;
            nextNode = currNode.nextSibling;

            if (currNode.nodeType === 1) {
                if (currNode.tagName === 'CONTENT') {
                    callback(currNode);
                } else if (currNode.childNodes && currNode.childNodes.length) {
                    lookupContentNode(currNode, callback);
                }
            }
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
                found = false, defaultWrapper;

            if (select) {
                utils.eachChildNodes(contentNode, function(node) {
                    return node.nodeType === 1 && utils.matchSelector(node, select);
                }, function(matchedContent) {
                    content.parentNode.replaceChild(matchedContent, content);
                    found = true;
                    return false; /* break the iterate */
                });

                if (!found) {
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
