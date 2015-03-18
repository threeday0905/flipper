function definition() {
    return Flipper;
}

if (window.KISSY && typeof window.KISSY.add === 'function') {
    window.KISSY.add(definition);
} else if (typeof window.define === 'function' && window.define) {
    window.define(definition);
}

window.Flipper = definition();
