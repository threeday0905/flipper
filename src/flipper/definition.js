
function createNonStrictPromise(name) {
    var temp = {}, promise;
    promise = new Promise(function(resolve, reject) {
        temp.name = name || 'none';
        temp.resolve = resolve;
        temp.reject = reject;
    });

    utils.mixin(promise, temp);

    return promise;
}


/**
 *  element prototype may come from two available dist:
 *      1. tag: <web-componen>....</web-component>
 *      2. script: Flipper.register( ... )
 */
var PROTO_DIST_COUNT = 2;

function ComponentDefinition() {
    this.countOfProto = PROTO_DIST_COUNT;
    this.proto = {};   /* the prototoype of element */

    this.modules = {}; /* dependent modules */
    this.views = {};   /* external view files */

    this.promises = {
        proto: createNonStrictPromise('proto'),
        modules: createNonStrictPromise('modules'),
        views: createNonStrictPromise('views')
    };

    this.promiseAll = Promise.all([
        this.promises.proto,
        this.promises.modules,
        this.promises.views
    ]).then(function() {
        return this;
    });

    this.resolveModules();
    this.resolveViews();
}

function throwIfAlreadResolved(currentCount, name) {
    if (currentCount === 0) {
        throw new Error('component declaration [' + name + '] is already registered');
    }
}

function throwIfNotObject(target, name) {
    if (typeof target !== 'object') {
        throw new Error('component declaration [' + name + '] has wrong format');
    }
}

function goThrowIfIsReady(currentCount, goThrough) {
    if (currentCount === 0) {
        goThrough();
    }
}

ComponentDefinition.prototype = {
    ready: function(onFulfillment, onRejection) {
        return this.promiseAll.then(onFulfillment, onRejection);
    },
    mixinProto: function(newProto) {
        throwIfAlreadResolved(this.countOfProto, 'element prototype');
        throwIfNotObject(newProto, 'element prototype');

        utils.mixin(this.proto, newProto);
        this.countOfProto -= 1;

        goThrowIfIsReady(this.countOfProto, this.resolveProto.bind(this));
    },
    resolveProto: function() {
        this.promises.proto.resolve(this.proto);
    },
    resolveModules: function() {
        this.promises.modules.resolve(this.modules);
    },
    resolveViews: function() {
        this.promises.views.resolve(this.views);
    }
};
