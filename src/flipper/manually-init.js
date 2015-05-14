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

        if (node.initialing) {
            return false;
        }

        var component = Flipper.getComponent(node.tagName);

        if (component && component.isReady()) {
            component.transform(node);
        } else {
            node.initialing = true;
            waitingComponent(node.tagName, function(component) {
                component.transform(node, true);
                delete node.initialing;
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

if (!Flipper.useNative) {
    (function() {
        var isReady = false;

        function ready() {
            // readyState === 'complete' is good enough for us to call the dom ready in oldIE
            if ( document.addEventListener ||
                 event.type === 'load' ||
                 document.readyState === 'complete' ) {

                detach();
                isReady = true;
                Flipper.parse(document.body);
            }
        }

        function detach() {
            if ( document.addEventListener ) {
                document.removeEventListener( 'DOMContentLoaded', ready, false );
                window.removeEventListener( 'load', ready, false );

            } else {
                document.detachEvent( 'onreadystatechange', ready );
                window.detachEvent( 'onload', ready );
            }
        }

        if (document.readyState === 'complete') {
            setTimeout(ready, 1);
        } else if (document.addEventListener) {
            // Use the handy event callback
            document.addEventListener( 'DOMContentLoaded', ready, false );

            // A fallback to window.onload, that will always work
            window.addEventListener( 'load', ready, false );

        } else if (document.attachEvent) {
            // Ensure firing before onload, maybe late but safe also for iframes
            document.attachEvent( 'onreadystatechange', ready );

            // A fallback to window.onload, that will always work
            window.attachEvent( 'onload', ready );

            // If IE and not a frame
            // continually check to see if the document is ready
            var top = false;

            try {
                top = !window.frameElement && document.documentElement;
            } catch(e) {}

            if ( top && top.doScroll ) {
                (function doScrollCheck() {
                    if ( !isReady ) {
                        try {
                            // Use the trick by Diego Perini
                            // http://javascript.nwbox.com/IEContentLoaded/
                            top.doScroll('left');
                        } catch(e) {
                            return setTimeout( doScrollCheck, 50 );
                        }

                        // detach all dom ready events
                        detach();

                        // and execute any waiting functions
                        ready();
                    }
                })();
            }
        }
    }());
}
