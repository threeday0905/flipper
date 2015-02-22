var tempElementDeclarations = [];

function stubRegister() {
    var args = arguments, name = args[0];
    if (typeof name !== 'string') {
        var currentScript = document._currentScript;
        name = currentScript.parentNode.getAttribute('name');
        args.unshift(name);
    }
    tempElementDeclarations.push(args);
}

function flushDeclaration(callback) {
    window.flushDeclaration = function() {
        throw new Error('you may load Flipper twice');
    };

    if (callback) {
        tempElementDeclarations.forEach(function(declaration) {
            try {
                callback.apply(null, declaration);
            } catch (ex) {
                var name = declaration[0];
                console.log('falied to register element: ' + name, 'caused by');
                console.log(ex);
            }
        });
    }

    tempElementDeclarations = null;
    delete window.FlipperPolyfill;
}

window.Flipper = {
    register: stubRegister
};

window.FlipperPolyfill = {
    flushDeclaration: flushDeclaration
};
