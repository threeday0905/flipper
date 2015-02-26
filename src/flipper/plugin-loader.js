var loaders = {};

function registerLoader(name, loader) {
    if (typeof name !== 'string' || !loader) {
        throw new Error('loader args have wrong format');
    }

    if (loaders[name]) {
        throw new Error('loader [' + name + '] is already registered');
    }

    if (typeof loader !== 'function') {
        throw new Error('loader must be a function' + name);
    }

    loaders[name] = loader;
}

function getLoader(name) {
    if (!loaders[name]) {
        throw new Error('could not found the loader: ' + name);
    }

    return loaders[name];
}

if (window.require) {
    registerLoader('default', window.require);
}

Flipper.registerLoader = registerLoader;
Flipper.getLoader = getLoader;
