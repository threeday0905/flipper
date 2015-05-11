Flipper.findShadow = function(target, selector) {
    return target.shadowRoot.querySelectorAll(selector);
};
