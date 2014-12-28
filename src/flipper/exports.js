function definition() {
    return Flipper;
}

if (window.KISSY && typeof window.KISSY.add === 'function') {
    KISSY.add(definition);
} else if (typeof window.define === 'function' && window.define.amd) {
    window.define(definition);
} else {
    window.Flipper = definition();
}
