(function(Flipper) {
    'use strict';

    var utils = Flipper.utils = {};

    utils.eachNodes = function(nodes, callback) {
        if (!nodes || !nodes.length) { return; }

        var node;
        for (var i = 0, len = nodes.length; i < len; i += 1) {
            node = nodes[i];
            callback(node, i);
        }
    };
} (Flipper));
