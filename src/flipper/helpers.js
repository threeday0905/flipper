Flipper.findShadow = function(target, selector) {
    return utils.query.all(target.shadowRoot, selector);
};

Flipper.whenReady = function(methods, doms, callback) {
    if (arguments.length === 2) {
        callback = doms;
        doms = methods;
        methods = 'initialized';
    }

    if (!utils.isArray(doms)) {
        doms = [ doms ];
    }

    if (typeof callback !== 'function') {
        callback = utils.noop;
    }

    methods = methods.split(',');

    function bindReadyEvent(dom, method) {
        utils.debug(dom, 'has flag on bind', dom.__flipper__);
        if (dom) {
            if (dom.initialized) {
                if (method === 'ready' && dom.status !== 'ready') {
                    return;
                }

                if (method === 'fail' && dom.status !== 'fail') {
                    return;
                }

                var ev = utils.event.create(method);
                callback.call(dom, ev);
            } else {
                utils.event.on(dom, method, callback);
            }
        }
    }

    utils.each(methods, function(method) {
        method = utils.trim(method);
        utils.each(doms, function(dom) {
            if (typeof dom === 'string') {
                utils.each(utils.query.all(document, dom), function(one) {
                    bindReadyEvent(one, method);
                });
            } else {
                bindReadyEvent(dom, method);
            }

        });
    });
};
