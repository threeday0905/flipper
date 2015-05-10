/*
    TODO Polyfills:
    - all es5 feature (Object.keys, Array.isArray, Object.create, etc.)
    - new URL
    - Promise
    - document base uri

    IE: ?
 */

/* the _currentScript prop may be already polyfill from webcomponentsjs */
if (!document._currentScript) {
    var currentScriptDescriptor = {
        get: function() {
            var script = document.currentScript ||
                // NOTE: only works when called in synchronously executing code.
                // readyState should check if `loading` but IE10 is
                // interactive when scripts run so we cheat.
                (document.readyState !== 'complete' ?
                    document.scripts[document.scripts.length - 1] : null);
            return script;
        },
        configurable: true
    };

    Object.defineProperty(document, '_currentScript', currentScriptDescriptor);
}
