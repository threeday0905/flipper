/*
    TODO Polyfills:
    - all es5 feature (Object.keys, Array.isArray, Object.create, etc.)
    - current script
    - new URL
    - Promise
    - web components
 */

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
