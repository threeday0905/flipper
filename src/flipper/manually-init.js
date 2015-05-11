Flipper.init = function init(node) {
    if (!node || !node.tagName) {
        throw new Error('must provide a node obj for Flipper init');
    }

    var tagName = node.tagName.toLowerCase();

    if (!utils.isCustomTag(tagName)) {
        return false;
    }

    waitingComponent(tagName, node, function(component, node) {
        component.parse(node);
        utils.event.on(node, 'ready', function() {
            Flipper.parse(node);
        });
    });
};

Flipper.parse = function(node) {

};
