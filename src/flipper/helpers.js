Flipper.findShadow = function(target, selector) {
    return utils.query.all(target.shadowRoot, selector);
};

function attachWhenEvent(method, nodes, callback) {
    if (nodes === undefined || nodes === null) {
        return;
    }

    if (typeof nodes === 'string' || !nodes.length) {
        nodes = [ nodes ];
    }

    if (typeof callback !== 'function') {
        return;
    }

    function handler(node) {
        utils.debug(node, 'has flag on bind', node.__flipper__);
        if (!node) {
            return;
        }

        if (node.initialized) {
            if (method === 'success' && node.status !== 'success') {
                return;
            }

            if (method === 'error' && node.status !== 'error') {
                return;
            }

            /* dispatch the error */
            callback.call(node, node.reason || undefined);
        } else {
            if (!node.__flipper_when__) {
                node.__flipper_when__ = {};
            }

            var flipperEvents = node.__flipper_when__;

            if (!flipperEvents[method]) {
                flipperEvents[method] = [];
            }

            flipperEvents[method].push(callback);
        }
    }

    for (var i = 0, len1 = nodes.length; i < len1; i += 1) {
        utils.handleNode(nodes[i], handler);
    }
}

Flipper.whenError = function(doms, callback) {
    attachWhenEvent('error', doms, callback);
};

Flipper.whenSuccess = function(doms, callback) {
    attachWhenEvent('success', doms, callback);
};

Flipper.whenReady = function(doms, callback) {
    attachWhenEvent('ready', doms, callback);
};


