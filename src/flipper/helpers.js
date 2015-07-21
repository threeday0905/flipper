Flipper.findShadow = function(target, selector) {
    return utils.query.all(target.shadowRoot, selector);
};


function isCustomElement(node) {
    return utils.isElement(node) && utils.isCustomTag(node.tagName);
}

function isFlipperElement(node) {
    return Flipper.hasComponent(node.tagName);
}

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

    function execCallback(node) {
        callback.call(node, node.__error__ || undefined);
    }

    function handler(node) {
        utils.debug(node, 'has flag on bind', node.__flipper__);

        /* if it is not custom element, then call Callback directly */
        if (!isCustomElement(node) ) {
            execCallback(node);

        /* if the component is not registered, then wait it */
        } else if (!isFlipperElement(node)) {

            /* wait 1000ms to load the component */
            setTimeout(function() {
                if (isFlipperElement(node)) {
                    handler(node);
                } else {
                    /* if still not loaded, then exec callback */
                    execCallback(node);
                }
            }, 1000);

        /* if the node is a flipper-component, and it is resolved */
        } else if (node.resolved) {

            /* skip success callback, if status is not success */
            if (method === 'success' && node.__status__ !== 'success') {
                return;
            }

            /* skip error callback, if status is not error */
            if (method === 'error' && node.__status__ !== 'error') {
                return;
            }

            execCallback(node);

        /* if the node is a flipper-component, and during rendering */
        } else {

            /* add callback events on itsself, it will be exec once rendered */
            if (!node.__flipper_when__) {
                node.__flipper_when__ = {};
            }

            if (!node.__flipper_when__[method]) {
                node.__flipper_when__[method] = [];
            }

            node.__flipper_when__[method].push(execCallback);
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

Flipper.waitReady = function(nodes, callback) {
    if (nodes === undefined || nodes === null) {
        return;
    }

    if (typeof nodes === 'string' || !nodes.length) {
        nodes = [ nodes ];
    }

    return new Promise(function(resolve, reject) {
        var waitingCount = nodes.length;

        function done() {
            if (typeof callback === 'function') {
                callback();
            }
            resolve();
        }

        function resolveOne() {
            waitingCount -= 1;
            if (waitingCount === 0) {
                done();
            }
        }

        Flipper.whenSuccess(nodes, resolveOne);
        Flipper.whenError(nodes, reject);
    });
};
