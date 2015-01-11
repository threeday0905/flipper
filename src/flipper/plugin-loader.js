var loaders = {};

function registerLoader(name, loader) {
    expect(name).isString();
    expect(loader).notNull();

    if (loaders[name]) {
        throw new Error('loaders [' + name + '] is already registered');
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
    utils.requireDebugger('plugin-loader')
        ('register default loader with window.require');
}

Flipper.registerLoader = registerLoader;
Flipper.getLoader = getLoader;
