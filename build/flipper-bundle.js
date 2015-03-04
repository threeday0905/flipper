/**
 *  Most of logics below are copied from webcomponentjs, we just add some stub methods for Flipper at the end of this file.
    Original project is here: <https://github.com/webcomponents/webcomponentsjs>
 */

/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.5.5
window.WebComponents = window.WebComponents || {};

(function(scope) {
  var flags = scope.flags || {};
  var file = "webcomponents.js";
  var script = document.querySelector('script[src*="' + file + '"]');
  if (!flags.noOpts) {
    location.search.slice(1).split("&").forEach(function(o) {
      o = o.split("=");
      o[0] && (flags[o[0]] = o[1] || true);
    });
    if (script) {
      for (var i = 0, a; a = script.attributes[i]; i++) {
        if (a.name !== "src") {
          flags[a.name] = a.value || true;
        }
      }
    }
    if (flags.log) {
      var parts = flags.log.split(",");
      flags.log = {};
      parts.forEach(function(f) {
        flags.log[f] = true;
      });
    } else {
      flags.log = {};
    }
  }
  flags.shadow = flags.shadow || flags.shadowdom || flags.polyfill;
  if (flags.shadow === "native") {
    flags.shadow = false;
  } else {
    flags.shadow = flags.shadow || !HTMLElement.prototype.createShadowRoot;
  }
  if (flags.register) {
    window.CustomElements = window.CustomElements || {
      flags: {}
    };
    window.CustomElements.flags.register = flags.register;
  }
  scope.flags = flags;
})(WebComponents);

if (WebComponents.flags.shadow) {
  if (typeof WeakMap === "undefined") {
    (function() {
      var defineProperty = Object.defineProperty;
      var counter = Date.now() % 1e9;
      var WeakMap = function() {
        this.name = "__st" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
      };
      WeakMap.prototype = {
        set: function(key, value) {
          var entry = key[this.name];
          if (entry && entry[0] === key) entry[1] = value; else defineProperty(key, this.name, {
            value: [ key, value ],
            writable: true
          });
          return this;
        },
        get: function(key) {
          var entry;
          return (entry = key[this.name]) && entry[0] === key ? entry[1] : undefined;
        },
        "delete": function(key) {
          var entry = key[this.name];
          if (!entry || entry[0] !== key) return false;
          entry[0] = entry[1] = undefined;
          return true;
        },
        has: function(key) {
          var entry = key[this.name];
          if (!entry) return false;
          return entry[0] === key;
        }
      };
      window.WeakMap = WeakMap;
    })();
  }
  window.ShadowDOMPolyfill = {};
  (function(scope) {
    "use strict";
    var constructorTable = new WeakMap();
    var nativePrototypeTable = new WeakMap();
    var wrappers = Object.create(null);
    function detectEval() {
      if (typeof chrome !== "undefined" && chrome.app && chrome.app.runtime) {
        return false;
      }
      if (navigator.getDeviceStorage) {
        return false;
      }
      try {
        var f = new Function("return true;");
        return f();
      } catch (ex) {
        return false;
      }
    }
    var hasEval = detectEval();
    function assert(b) {
      if (!b) throw new Error("Assertion failed");
    }
    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function mixin(to, from) {
      var names = getOwnPropertyNames(from);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        defineProperty(to, name, getOwnPropertyDescriptor(from, name));
      }
      return to;
    }
    function mixinStatics(to, from) {
      var names = getOwnPropertyNames(from);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        switch (name) {
         case "arguments":
         case "caller":
         case "length":
         case "name":
         case "prototype":
         case "toString":
          continue;
        }
        defineProperty(to, name, getOwnPropertyDescriptor(from, name));
      }
      return to;
    }
    function oneOf(object, propertyNames) {
      for (var i = 0; i < propertyNames.length; i++) {
        if (propertyNames[i] in object) return propertyNames[i];
      }
    }
    var nonEnumerableDataDescriptor = {
      value: undefined,
      configurable: true,
      enumerable: false,
      writable: true
    };
    function defineNonEnumerableDataProperty(object, name, value) {
      nonEnumerableDataDescriptor.value = value;
      defineProperty(object, name, nonEnumerableDataDescriptor);
    }
    getOwnPropertyNames(window);
    function getWrapperConstructor(node) {
      var nativePrototype = node.__proto__ || Object.getPrototypeOf(node);
      if (isFirefox) {
        try {
          getOwnPropertyNames(nativePrototype);
        } catch (error) {
          nativePrototype = nativePrototype.__proto__;
        }
      }
      var wrapperConstructor = constructorTable.get(nativePrototype);
      if (wrapperConstructor) return wrapperConstructor;
      var parentWrapperConstructor = getWrapperConstructor(nativePrototype);
      var GeneratedWrapper = createWrapperConstructor(parentWrapperConstructor);
      registerInternal(nativePrototype, GeneratedWrapper, node);
      return GeneratedWrapper;
    }
    function addForwardingProperties(nativePrototype, wrapperPrototype) {
      installProperty(nativePrototype, wrapperPrototype, true);
    }
    function registerInstanceProperties(wrapperPrototype, instanceObject) {
      installProperty(instanceObject, wrapperPrototype, false);
    }
    var isFirefox = /Firefox/.test(navigator.userAgent);
    var dummyDescriptor = {
      get: function() {},
      set: function(v) {},
      configurable: true,
      enumerable: true
    };
    function isEventHandlerName(name) {
      return /^on[a-z]+$/.test(name);
    }
    function isIdentifierName(name) {
      return /^\w[a-zA-Z_0-9]*$/.test(name);
    }
    function getGetter(name) {
      return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name) : function() {
        return this.__impl4cf1e782hg__[name];
      };
    }
    function getSetter(name) {
      return hasEval && isIdentifierName(name) ? new Function("v", "this.__impl4cf1e782hg__." + name + " = v") : function(v) {
        this.__impl4cf1e782hg__[name] = v;
      };
    }
    function getMethod(name) {
      return hasEval && isIdentifierName(name) ? new Function("return this.__impl4cf1e782hg__." + name + ".apply(this.__impl4cf1e782hg__, arguments)") : function() {
        return this.__impl4cf1e782hg__[name].apply(this.__impl4cf1e782hg__, arguments);
      };
    }
    function getDescriptor(source, name) {
      try {
        return Object.getOwnPropertyDescriptor(source, name);
      } catch (ex) {
        return dummyDescriptor;
      }
    }
    var isBrokenSafari = function() {
      var descr = Object.getOwnPropertyDescriptor(Node.prototype, "nodeType");
      return descr && !descr.get && !descr.set;
    }();
    function installProperty(source, target, allowMethod, opt_blacklist) {
      var names = getOwnPropertyNames(source);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        if (name === "polymerBlackList_") continue;
        if (name in target) continue;
        if (source.polymerBlackList_ && source.polymerBlackList_[name]) continue;
        if (isFirefox) {
          source.__lookupGetter__(name);
        }
        var descriptor = getDescriptor(source, name);
        var getter, setter;
        if (allowMethod && typeof descriptor.value === "function") {
          target[name] = getMethod(name);
          continue;
        }
        var isEvent = isEventHandlerName(name);
        if (isEvent) getter = scope.getEventHandlerGetter(name); else getter = getGetter(name);
        if (descriptor.writable || descriptor.set || isBrokenSafari) {
          if (isEvent) setter = scope.getEventHandlerSetter(name); else setter = getSetter(name);
        }
        var configurable = isBrokenSafari || descriptor.configurable;
        defineProperty(target, name, {
          get: getter,
          set: setter,
          configurable: configurable,
          enumerable: descriptor.enumerable
        });
      }
    }
    function register(nativeConstructor, wrapperConstructor, opt_instance) {
      var nativePrototype = nativeConstructor.prototype;
      registerInternal(nativePrototype, wrapperConstructor, opt_instance);
      mixinStatics(wrapperConstructor, nativeConstructor);
    }
    function registerInternal(nativePrototype, wrapperConstructor, opt_instance) {
      var wrapperPrototype = wrapperConstructor.prototype;
      assert(constructorTable.get(nativePrototype) === undefined);
      constructorTable.set(nativePrototype, wrapperConstructor);
      nativePrototypeTable.set(wrapperPrototype, nativePrototype);
      addForwardingProperties(nativePrototype, wrapperPrototype);
      if (opt_instance) registerInstanceProperties(wrapperPrototype, opt_instance);
      defineNonEnumerableDataProperty(wrapperPrototype, "constructor", wrapperConstructor);
      wrapperConstructor.prototype = wrapperPrototype;
    }
    function isWrapperFor(wrapperConstructor, nativeConstructor) {
      return constructorTable.get(nativeConstructor.prototype) === wrapperConstructor;
    }
    function registerObject(object) {
      var nativePrototype = Object.getPrototypeOf(object);
      var superWrapperConstructor = getWrapperConstructor(nativePrototype);
      var GeneratedWrapper = createWrapperConstructor(superWrapperConstructor);
      registerInternal(nativePrototype, GeneratedWrapper, object);
      return GeneratedWrapper;
    }
    function createWrapperConstructor(superWrapperConstructor) {
      function GeneratedWrapper(node) {
        superWrapperConstructor.call(this, node);
      }
      var p = Object.create(superWrapperConstructor.prototype);
      p.constructor = GeneratedWrapper;
      GeneratedWrapper.prototype = p;
      return GeneratedWrapper;
    }
    function isWrapper(object) {
      return object && object.__impl4cf1e782hg__;
    }
    function isNative(object) {
      return !isWrapper(object);
    }
    function wrap(impl) {
      if (impl === null) return null;
      assert(isNative(impl));
      return impl.__wrapper8e3dd93a60__ || (impl.__wrapper8e3dd93a60__ = new (getWrapperConstructor(impl))(impl));
    }
    function unwrap(wrapper) {
      if (wrapper === null) return null;
      assert(isWrapper(wrapper));
      return wrapper.__impl4cf1e782hg__;
    }
    function unsafeUnwrap(wrapper) {
      return wrapper.__impl4cf1e782hg__;
    }
    function setWrapper(impl, wrapper) {
      wrapper.__impl4cf1e782hg__ = impl;
      impl.__wrapper8e3dd93a60__ = wrapper;
    }
    function unwrapIfNeeded(object) {
      return object && isWrapper(object) ? unwrap(object) : object;
    }
    function wrapIfNeeded(object) {
      return object && !isWrapper(object) ? wrap(object) : object;
    }
    function rewrap(node, wrapper) {
      if (wrapper === null) return;
      assert(isNative(node));
      assert(wrapper === undefined || isWrapper(wrapper));
      node.__wrapper8e3dd93a60__ = wrapper;
    }
    var getterDescriptor = {
      get: undefined,
      configurable: true,
      enumerable: true
    };
    function defineGetter(constructor, name, getter) {
      getterDescriptor.get = getter;
      defineProperty(constructor.prototype, name, getterDescriptor);
    }
    function defineWrapGetter(constructor, name) {
      defineGetter(constructor, name, function() {
        return wrap(this.__impl4cf1e782hg__[name]);
      });
    }
    function forwardMethodsToWrapper(constructors, names) {
      constructors.forEach(function(constructor) {
        names.forEach(function(name) {
          constructor.prototype[name] = function() {
            var w = wrapIfNeeded(this);
            return w[name].apply(w, arguments);
          };
        });
      });
    }
    scope.assert = assert;
    scope.constructorTable = constructorTable;
    scope.defineGetter = defineGetter;
    scope.defineWrapGetter = defineWrapGetter;
    scope.forwardMethodsToWrapper = forwardMethodsToWrapper;
    scope.isWrapper = isWrapper;
    scope.isWrapperFor = isWrapperFor;
    scope.mixin = mixin;
    scope.nativePrototypeTable = nativePrototypeTable;
    scope.oneOf = oneOf;
    scope.registerObject = registerObject;
    scope.registerWrapper = register;
    scope.rewrap = rewrap;
    scope.setWrapper = setWrapper;
    scope.unsafeUnwrap = unsafeUnwrap;
    scope.unwrap = unwrap;
    scope.unwrapIfNeeded = unwrapIfNeeded;
    scope.wrap = wrap;
    scope.wrapIfNeeded = wrapIfNeeded;
    scope.wrappers = wrappers;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    function newSplice(index, removed, addedCount) {
      return {
        index: index,
        removed: removed,
        addedCount: addedCount
      };
    }
    var EDIT_LEAVE = 0;
    var EDIT_UPDATE = 1;
    var EDIT_ADD = 2;
    var EDIT_DELETE = 3;
    function ArraySplice() {}
    ArraySplice.prototype = {
      calcEditDistances: function(current, currentStart, currentEnd, old, oldStart, oldEnd) {
        var rowCount = oldEnd - oldStart + 1;
        var columnCount = currentEnd - currentStart + 1;
        var distances = new Array(rowCount);
        for (var i = 0; i < rowCount; i++) {
          distances[i] = new Array(columnCount);
          distances[i][0] = i;
        }
        for (var j = 0; j < columnCount; j++) distances[0][j] = j;
        for (var i = 1; i < rowCount; i++) {
          for (var j = 1; j < columnCount; j++) {
            if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1])) distances[i][j] = distances[i - 1][j - 1]; else {
              var north = distances[i - 1][j] + 1;
              var west = distances[i][j - 1] + 1;
              distances[i][j] = north < west ? north : west;
            }
          }
        }
        return distances;
      },
      spliceOperationsFromEditDistances: function(distances) {
        var i = distances.length - 1;
        var j = distances[0].length - 1;
        var current = distances[i][j];
        var edits = [];
        while (i > 0 || j > 0) {
          if (i == 0) {
            edits.push(EDIT_ADD);
            j--;
            continue;
          }
          if (j == 0) {
            edits.push(EDIT_DELETE);
            i--;
            continue;
          }
          var northWest = distances[i - 1][j - 1];
          var west = distances[i - 1][j];
          var north = distances[i][j - 1];
          var min;
          if (west < north) min = west < northWest ? west : northWest; else min = north < northWest ? north : northWest;
          if (min == northWest) {
            if (northWest == current) {
              edits.push(EDIT_LEAVE);
            } else {
              edits.push(EDIT_UPDATE);
              current = northWest;
            }
            i--;
            j--;
          } else if (min == west) {
            edits.push(EDIT_DELETE);
            i--;
            current = west;
          } else {
            edits.push(EDIT_ADD);
            j--;
            current = north;
          }
        }
        edits.reverse();
        return edits;
      },
      calcSplices: function(current, currentStart, currentEnd, old, oldStart, oldEnd) {
        var prefixCount = 0;
        var suffixCount = 0;
        var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
        if (currentStart == 0 && oldStart == 0) prefixCount = this.sharedPrefix(current, old, minLength);
        if (currentEnd == current.length && oldEnd == old.length) suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
        currentStart += prefixCount;
        oldStart += prefixCount;
        currentEnd -= suffixCount;
        oldEnd -= suffixCount;
        if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];
        if (currentStart == currentEnd) {
          var splice = newSplice(currentStart, [], 0);
          while (oldStart < oldEnd) splice.removed.push(old[oldStart++]);
          return [ splice ];
        } else if (oldStart == oldEnd) return [ newSplice(currentStart, [], currentEnd - currentStart) ];
        var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));
        var splice = undefined;
        var splices = [];
        var index = currentStart;
        var oldIndex = oldStart;
        for (var i = 0; i < ops.length; i++) {
          switch (ops[i]) {
           case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }
            index++;
            oldIndex++;
            break;

           case EDIT_UPDATE:
            if (!splice) splice = newSplice(index, [], 0);
            splice.addedCount++;
            index++;
            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;

           case EDIT_ADD:
            if (!splice) splice = newSplice(index, [], 0);
            splice.addedCount++;
            index++;
            break;

           case EDIT_DELETE:
            if (!splice) splice = newSplice(index, [], 0);
            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          }
        }
        if (splice) {
          splices.push(splice);
        }
        return splices;
      },
      sharedPrefix: function(current, old, searchLength) {
        for (var i = 0; i < searchLength; i++) if (!this.equals(current[i], old[i])) return i;
        return searchLength;
      },
      sharedSuffix: function(current, old, searchLength) {
        var index1 = current.length;
        var index2 = old.length;
        var count = 0;
        while (count < searchLength && this.equals(current[--index1], old[--index2])) count++;
        return count;
      },
      calculateSplices: function(current, previous) {
        return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
      },
      equals: function(currentValue, previousValue) {
        return currentValue === previousValue;
      }
    };
    scope.ArraySplice = ArraySplice;
  })(window.ShadowDOMPolyfill);
  (function(context) {
    "use strict";
    var OriginalMutationObserver = window.MutationObserver;
    var callbacks = [];
    var pending = false;
    var timerFunc;
    function handle() {
      pending = false;
      var copies = callbacks.slice(0);
      callbacks = [];
      for (var i = 0; i < copies.length; i++) {
        (0, copies[i])();
      }
    }
    if (OriginalMutationObserver) {
      var counter = 1;
      var observer = new OriginalMutationObserver(handle);
      var textNode = document.createTextNode(counter);
      observer.observe(textNode, {
        characterData: true
      });
      timerFunc = function() {
        counter = (counter + 1) % 2;
        textNode.data = counter;
      };
    } else {
      timerFunc = window.setTimeout;
    }
    function setEndOfMicrotask(func) {
      callbacks.push(func);
      if (pending) return;
      pending = true;
      timerFunc(handle, 0);
    }
    context.setEndOfMicrotask = setEndOfMicrotask;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var setEndOfMicrotask = scope.setEndOfMicrotask;
    var wrapIfNeeded = scope.wrapIfNeeded;
    var wrappers = scope.wrappers;
    var registrationsTable = new WeakMap();
    var globalMutationObservers = [];
    var isScheduled = false;
    function scheduleCallback(observer) {
      if (observer.scheduled_) return;
      observer.scheduled_ = true;
      globalMutationObservers.push(observer);
      if (isScheduled) return;
      setEndOfMicrotask(notifyObservers);
      isScheduled = true;
    }
    function notifyObservers() {
      isScheduled = false;
      while (globalMutationObservers.length) {
        var notifyList = globalMutationObservers;
        globalMutationObservers = [];
        notifyList.sort(function(x, y) {
          return x.uid_ - y.uid_;
        });
        for (var i = 0; i < notifyList.length; i++) {
          var mo = notifyList[i];
          mo.scheduled_ = false;
          var queue = mo.takeRecords();
          removeTransientObserversFor(mo);
          if (queue.length) {
            mo.callback_(queue, mo);
          }
        }
      }
    }
    function MutationRecord(type, target) {
      this.type = type;
      this.target = target;
      this.addedNodes = new wrappers.NodeList();
      this.removedNodes = new wrappers.NodeList();
      this.previousSibling = null;
      this.nextSibling = null;
      this.attributeName = null;
      this.attributeNamespace = null;
      this.oldValue = null;
    }
    function registerTransientObservers(ancestor, node) {
      for (;ancestor; ancestor = ancestor.parentNode) {
        var registrations = registrationsTable.get(ancestor);
        if (!registrations) continue;
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.options.subtree) registration.addTransientObserver(node);
        }
      }
    }
    function removeTransientObserversFor(observer) {
      for (var i = 0; i < observer.nodes_.length; i++) {
        var node = observer.nodes_[i];
        var registrations = registrationsTable.get(node);
        if (!registrations) return;
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          if (registration.observer === observer) registration.removeTransientObservers();
        }
      }
    }
    function enqueueMutation(target, type, data) {
      var interestedObservers = Object.create(null);
      var associatedStrings = Object.create(null);
      for (var node = target; node; node = node.parentNode) {
        var registrations = registrationsTable.get(node);
        if (!registrations) continue;
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          if (type === "attributes" && !options.attributes) continue;
          if (type === "attributes" && options.attributeFilter && (data.namespace !== null || options.attributeFilter.indexOf(data.name) === -1)) {
            continue;
          }
          if (type === "characterData" && !options.characterData) continue;
          if (type === "childList" && !options.childList) continue;
          var observer = registration.observer;
          interestedObservers[observer.uid_] = observer;
          if (type === "attributes" && options.attributeOldValue || type === "characterData" && options.characterDataOldValue) {
            associatedStrings[observer.uid_] = data.oldValue;
          }
        }
      }
      for (var uid in interestedObservers) {
        var observer = interestedObservers[uid];
        var record = new MutationRecord(type, target);
        if ("name" in data && "namespace" in data) {
          record.attributeName = data.name;
          record.attributeNamespace = data.namespace;
        }
        if (data.addedNodes) record.addedNodes = data.addedNodes;
        if (data.removedNodes) record.removedNodes = data.removedNodes;
        if (data.previousSibling) record.previousSibling = data.previousSibling;
        if (data.nextSibling) record.nextSibling = data.nextSibling;
        if (associatedStrings[uid] !== undefined) record.oldValue = associatedStrings[uid];
        scheduleCallback(observer);
        observer.records_.push(record);
      }
    }
    var slice = Array.prototype.slice;
    function MutationObserverOptions(options) {
      this.childList = !!options.childList;
      this.subtree = !!options.subtree;
      if (!("attributes" in options) && ("attributeOldValue" in options || "attributeFilter" in options)) {
        this.attributes = true;
      } else {
        this.attributes = !!options.attributes;
      }
      if ("characterDataOldValue" in options && !("characterData" in options)) this.characterData = true; else this.characterData = !!options.characterData;
      if (!this.attributes && (options.attributeOldValue || "attributeFilter" in options) || !this.characterData && options.characterDataOldValue) {
        throw new TypeError();
      }
      this.characterData = !!options.characterData;
      this.attributeOldValue = !!options.attributeOldValue;
      this.characterDataOldValue = !!options.characterDataOldValue;
      if ("attributeFilter" in options) {
        if (options.attributeFilter == null || typeof options.attributeFilter !== "object") {
          throw new TypeError();
        }
        this.attributeFilter = slice.call(options.attributeFilter);
      } else {
        this.attributeFilter = null;
      }
    }
    var uidCounter = 0;
    function MutationObserver(callback) {
      this.callback_ = callback;
      this.nodes_ = [];
      this.records_ = [];
      this.uid_ = ++uidCounter;
      this.scheduled_ = false;
    }
    MutationObserver.prototype = {
      constructor: MutationObserver,
      observe: function(target, options) {
        target = wrapIfNeeded(target);
        var newOptions = new MutationObserverOptions(options);
        var registration;
        var registrations = registrationsTable.get(target);
        if (!registrations) registrationsTable.set(target, registrations = []);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i].observer === this) {
            registration = registrations[i];
            registration.removeTransientObservers();
            registration.options = newOptions;
          }
        }
        if (!registration) {
          registration = new Registration(this, target, newOptions);
          registrations.push(registration);
          this.nodes_.push(target);
        }
      },
      disconnect: function() {
        this.nodes_.forEach(function(node) {
          var registrations = registrationsTable.get(node);
          for (var i = 0; i < registrations.length; i++) {
            var registration = registrations[i];
            if (registration.observer === this) {
              registrations.splice(i, 1);
              break;
            }
          }
        }, this);
        this.records_ = [];
      },
      takeRecords: function() {
        var copyOfRecords = this.records_;
        this.records_ = [];
        return copyOfRecords;
      }
    };
    function Registration(observer, target, options) {
      this.observer = observer;
      this.target = target;
      this.options = options;
      this.transientObservedNodes = [];
    }
    Registration.prototype = {
      addTransientObserver: function(node) {
        if (node === this.target) return;
        scheduleCallback(this.observer);
        this.transientObservedNodes.push(node);
        var registrations = registrationsTable.get(node);
        if (!registrations) registrationsTable.set(node, registrations = []);
        registrations.push(this);
      },
      removeTransientObservers: function() {
        var transientObservedNodes = this.transientObservedNodes;
        this.transientObservedNodes = [];
        for (var i = 0; i < transientObservedNodes.length; i++) {
          var node = transientObservedNodes[i];
          var registrations = registrationsTable.get(node);
          for (var j = 0; j < registrations.length; j++) {
            if (registrations[j] === this) {
              registrations.splice(j, 1);
              break;
            }
          }
        }
      }
    };
    scope.enqueueMutation = enqueueMutation;
    scope.registerTransientObservers = registerTransientObservers;
    scope.wrappers.MutationObserver = MutationObserver;
    scope.wrappers.MutationRecord = MutationRecord;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    function TreeScope(root, parent) {
      this.root = root;
      this.parent = parent;
    }
    TreeScope.prototype = {
      get renderer() {
        if (this.root instanceof scope.wrappers.ShadowRoot) {
          return scope.getRendererForHost(this.root.host);
        }
        return null;
      },
      contains: function(treeScope) {
        for (;treeScope; treeScope = treeScope.parent) {
          if (treeScope === this) return true;
        }
        return false;
      }
    };
    function setTreeScope(node, treeScope) {
      if (node.treeScope_ !== treeScope) {
        node.treeScope_ = treeScope;
        for (var sr = node.shadowRoot; sr; sr = sr.olderShadowRoot) {
          sr.treeScope_.parent = treeScope;
        }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          setTreeScope(child, treeScope);
        }
      }
    }
    function getTreeScope(node) {
      if (node instanceof scope.wrappers.Window) {
        debugger;
      }
      if (node.treeScope_) return node.treeScope_;
      var parent = node.parentNode;
      var treeScope;
      if (parent) treeScope = getTreeScope(parent); else treeScope = new TreeScope(node, null);
      return node.treeScope_ = treeScope;
    }
    scope.TreeScope = TreeScope;
    scope.getTreeScope = getTreeScope;
    scope.setTreeScope = setTreeScope;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
    var getTreeScope = scope.getTreeScope;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrappers = scope.wrappers;
    var wrappedFuns = new WeakMap();
    var listenersTable = new WeakMap();
    var handledEventsTable = new WeakMap();
    var currentlyDispatchingEvents = new WeakMap();
    var targetTable = new WeakMap();
    var currentTargetTable = new WeakMap();
    var relatedTargetTable = new WeakMap();
    var eventPhaseTable = new WeakMap();
    var stopPropagationTable = new WeakMap();
    var stopImmediatePropagationTable = new WeakMap();
    var eventHandlersTable = new WeakMap();
    var eventPathTable = new WeakMap();
    function isShadowRoot(node) {
      return node instanceof wrappers.ShadowRoot;
    }
    function rootOfNode(node) {
      return getTreeScope(node).root;
    }
    function getEventPath(node, event) {
      var path = [];
      var current = node;
      path.push(current);
      while (current) {
        var destinationInsertionPoints = getDestinationInsertionPoints(current);
        if (destinationInsertionPoints && destinationInsertionPoints.length > 0) {
          for (var i = 0; i < destinationInsertionPoints.length; i++) {
            var insertionPoint = destinationInsertionPoints[i];
            if (isShadowInsertionPoint(insertionPoint)) {
              var shadowRoot = rootOfNode(insertionPoint);
              var olderShadowRoot = shadowRoot.olderShadowRoot;
              if (olderShadowRoot) path.push(olderShadowRoot);
            }
            path.push(insertionPoint);
          }
          current = destinationInsertionPoints[destinationInsertionPoints.length - 1];
        } else {
          if (isShadowRoot(current)) {
            if (inSameTree(node, current) && eventMustBeStopped(event)) {
              break;
            }
            current = current.host;
            path.push(current);
          } else {
            current = current.parentNode;
            if (current) path.push(current);
          }
        }
      }
      return path;
    }
    function eventMustBeStopped(event) {
      if (!event) return false;
      switch (event.type) {
       case "abort":
       case "error":
       case "select":
       case "change":
       case "load":
       case "reset":
       case "resize":
       case "scroll":
       case "selectstart":
        return true;
      }
      return false;
    }
    function isShadowInsertionPoint(node) {
      return node instanceof HTMLShadowElement;
    }
    function getDestinationInsertionPoints(node) {
      return scope.getDestinationInsertionPoints(node);
    }
    function eventRetargetting(path, currentTarget) {
      if (path.length === 0) return currentTarget;
      if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;
      var currentTargetTree = getTreeScope(currentTarget);
      var originalTarget = path[0];
      var originalTargetTree = getTreeScope(originalTarget);
      var relativeTargetTree = lowestCommonInclusiveAncestor(currentTargetTree, originalTargetTree);
      for (var i = 0; i < path.length; i++) {
        var node = path[i];
        if (getTreeScope(node) === relativeTargetTree) return node;
      }
      return path[path.length - 1];
    }
    function getTreeScopeAncestors(treeScope) {
      var ancestors = [];
      for (;treeScope; treeScope = treeScope.parent) {
        ancestors.push(treeScope);
      }
      return ancestors;
    }
    function lowestCommonInclusiveAncestor(tsA, tsB) {
      var ancestorsA = getTreeScopeAncestors(tsA);
      var ancestorsB = getTreeScopeAncestors(tsB);
      var result = null;
      while (ancestorsA.length > 0 && ancestorsB.length > 0) {
        var a = ancestorsA.pop();
        var b = ancestorsB.pop();
        if (a === b) result = a; else break;
      }
      return result;
    }
    function getTreeScopeRoot(ts) {
      if (!ts.parent) return ts;
      return getTreeScopeRoot(ts.parent);
    }
    function relatedTargetResolution(event, currentTarget, relatedTarget) {
      if (currentTarget instanceof wrappers.Window) currentTarget = currentTarget.document;
      var currentTargetTree = getTreeScope(currentTarget);
      var relatedTargetTree = getTreeScope(relatedTarget);
      var relatedTargetEventPath = getEventPath(relatedTarget, event);
      var lowestCommonAncestorTree;
      var lowestCommonAncestorTree = lowestCommonInclusiveAncestor(currentTargetTree, relatedTargetTree);
      if (!lowestCommonAncestorTree) lowestCommonAncestorTree = relatedTargetTree.root;
      for (var commonAncestorTree = lowestCommonAncestorTree; commonAncestorTree; commonAncestorTree = commonAncestorTree.parent) {
        var adjustedRelatedTarget;
        for (var i = 0; i < relatedTargetEventPath.length; i++) {
          var node = relatedTargetEventPath[i];
          if (getTreeScope(node) === commonAncestorTree) return node;
        }
      }
      return null;
    }
    function inSameTree(a, b) {
      return getTreeScope(a) === getTreeScope(b);
    }
    var NONE = 0;
    var CAPTURING_PHASE = 1;
    var AT_TARGET = 2;
    var BUBBLING_PHASE = 3;
    var pendingError;
    function dispatchOriginalEvent(originalEvent) {
      if (handledEventsTable.get(originalEvent)) return;
      handledEventsTable.set(originalEvent, true);
      dispatchEvent(wrap(originalEvent), wrap(originalEvent.target));
      if (pendingError) {
        var err = pendingError;
        pendingError = null;
        throw err;
      }
    }
    function isLoadLikeEvent(event) {
      switch (event.type) {
       case "load":
       case "beforeunload":
       case "unload":
        return true;
      }
      return false;
    }
    function dispatchEvent(event, originalWrapperTarget) {
      if (currentlyDispatchingEvents.get(event)) throw new Error("InvalidStateError");
      currentlyDispatchingEvents.set(event, true);
      scope.renderAllPending();
      var eventPath;
      var overrideTarget;
      var win;
      if (isLoadLikeEvent(event) && !event.bubbles) {
        var doc = originalWrapperTarget;
        if (doc instanceof wrappers.Document && (win = doc.defaultView)) {
          overrideTarget = doc;
          eventPath = [];
        }
      }
      if (!eventPath) {
        if (originalWrapperTarget instanceof wrappers.Window) {
          win = originalWrapperTarget;
          eventPath = [];
        } else {
          eventPath = getEventPath(originalWrapperTarget, event);
          if (!isLoadLikeEvent(event)) {
            var doc = eventPath[eventPath.length - 1];
            if (doc instanceof wrappers.Document) win = doc.defaultView;
          }
        }
      }
      eventPathTable.set(event, eventPath);
      if (dispatchCapturing(event, eventPath, win, overrideTarget)) {
        if (dispatchAtTarget(event, eventPath, win, overrideTarget)) {
          dispatchBubbling(event, eventPath, win, overrideTarget);
        }
      }
      eventPhaseTable.set(event, NONE);
      currentTargetTable.delete(event, null);
      currentlyDispatchingEvents.delete(event);
      return event.defaultPrevented;
    }
    function dispatchCapturing(event, eventPath, win, overrideTarget) {
      var phase = CAPTURING_PHASE;
      if (win) {
        if (!invoke(win, event, phase, eventPath, overrideTarget)) return false;
      }
      for (var i = eventPath.length - 1; i > 0; i--) {
        if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return false;
      }
      return true;
    }
    function dispatchAtTarget(event, eventPath, win, overrideTarget) {
      var phase = AT_TARGET;
      var currentTarget = eventPath[0] || win;
      return invoke(currentTarget, event, phase, eventPath, overrideTarget);
    }
    function dispatchBubbling(event, eventPath, win, overrideTarget) {
      var phase = BUBBLING_PHASE;
      for (var i = 1; i < eventPath.length; i++) {
        if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget)) return;
      }
      if (win && eventPath.length > 0) {
        invoke(win, event, phase, eventPath, overrideTarget);
      }
    }
    function invoke(currentTarget, event, phase, eventPath, overrideTarget) {
      var listeners = listenersTable.get(currentTarget);
      if (!listeners) return true;
      var target = overrideTarget || eventRetargetting(eventPath, currentTarget);
      if (target === currentTarget) {
        if (phase === CAPTURING_PHASE) return true;
        if (phase === BUBBLING_PHASE) phase = AT_TARGET;
      } else if (phase === BUBBLING_PHASE && !event.bubbles) {
        return true;
      }
      if ("relatedTarget" in event) {
        var originalEvent = unwrap(event);
        var unwrappedRelatedTarget = originalEvent.relatedTarget;
        if (unwrappedRelatedTarget) {
          if (unwrappedRelatedTarget instanceof Object && unwrappedRelatedTarget.addEventListener) {
            var relatedTarget = wrap(unwrappedRelatedTarget);
            var adjusted = relatedTargetResolution(event, currentTarget, relatedTarget);
            if (adjusted === target) return true;
          } else {
            adjusted = null;
          }
          relatedTargetTable.set(event, adjusted);
        }
      }
      eventPhaseTable.set(event, phase);
      var type = event.type;
      var anyRemoved = false;
      targetTable.set(event, target);
      currentTargetTable.set(event, currentTarget);
      listeners.depth++;
      for (var i = 0, len = listeners.length; i < len; i++) {
        var listener = listeners[i];
        if (listener.removed) {
          anyRemoved = true;
          continue;
        }
        if (listener.type !== type || !listener.capture && phase === CAPTURING_PHASE || listener.capture && phase === BUBBLING_PHASE) {
          continue;
        }
        try {
          if (typeof listener.handler === "function") listener.handler.call(currentTarget, event); else listener.handler.handleEvent(event);
          if (stopImmediatePropagationTable.get(event)) return false;
        } catch (ex) {
          if (!pendingError) pendingError = ex;
        }
      }
      listeners.depth--;
      if (anyRemoved && listeners.depth === 0) {
        var copy = listeners.slice();
        listeners.length = 0;
        for (var i = 0; i < copy.length; i++) {
          if (!copy[i].removed) listeners.push(copy[i]);
        }
      }
      return !stopPropagationTable.get(event);
    }
    function Listener(type, handler, capture) {
      this.type = type;
      this.handler = handler;
      this.capture = Boolean(capture);
    }
    Listener.prototype = {
      equals: function(that) {
        return this.handler === that.handler && this.type === that.type && this.capture === that.capture;
      },
      get removed() {
        return this.handler === null;
      },
      remove: function() {
        this.handler = null;
      }
    };
    var OriginalEvent = window.Event;
    OriginalEvent.prototype.polymerBlackList_ = {
      returnValue: true,
      keyLocation: true
    };
    function Event(type, options) {
      if (type instanceof OriginalEvent) {
        var impl = type;
        if (!OriginalBeforeUnloadEvent && impl.type === "beforeunload" && !(this instanceof BeforeUnloadEvent)) {
          return new BeforeUnloadEvent(impl);
        }
        setWrapper(impl, this);
      } else {
        return wrap(constructEvent(OriginalEvent, "Event", type, options));
      }
    }
    Event.prototype = {
      get target() {
        return targetTable.get(this);
      },
      get currentTarget() {
        return currentTargetTable.get(this);
      },
      get eventPhase() {
        return eventPhaseTable.get(this);
      },
      get path() {
        var eventPath = eventPathTable.get(this);
        if (!eventPath) return [];
        return eventPath.slice();
      },
      stopPropagation: function() {
        stopPropagationTable.set(this, true);
      },
      stopImmediatePropagation: function() {
        stopPropagationTable.set(this, true);
        stopImmediatePropagationTable.set(this, true);
      }
    };
    registerWrapper(OriginalEvent, Event, document.createEvent("Event"));
    function unwrapOptions(options) {
      if (!options || !options.relatedTarget) return options;
      return Object.create(options, {
        relatedTarget: {
          value: unwrap(options.relatedTarget)
        }
      });
    }
    function registerGenericEvent(name, SuperEvent, prototype) {
      var OriginalEvent = window[name];
      var GenericEvent = function(type, options) {
        if (type instanceof OriginalEvent) setWrapper(type, this); else return wrap(constructEvent(OriginalEvent, name, type, options));
      };
      GenericEvent.prototype = Object.create(SuperEvent.prototype);
      if (prototype) mixin(GenericEvent.prototype, prototype);
      if (OriginalEvent) {
        try {
          registerWrapper(OriginalEvent, GenericEvent, new OriginalEvent("temp"));
        } catch (ex) {
          registerWrapper(OriginalEvent, GenericEvent, document.createEvent(name));
        }
      }
      return GenericEvent;
    }
    var UIEvent = registerGenericEvent("UIEvent", Event);
    var CustomEvent = registerGenericEvent("CustomEvent", Event);
    var relatedTargetProto = {
      get relatedTarget() {
        var relatedTarget = relatedTargetTable.get(this);
        if (relatedTarget !== undefined) return relatedTarget;
        return wrap(unwrap(this).relatedTarget);
      }
    };
    function getInitFunction(name, relatedTargetIndex) {
      return function() {
        arguments[relatedTargetIndex] = unwrap(arguments[relatedTargetIndex]);
        var impl = unwrap(this);
        impl[name].apply(impl, arguments);
      };
    }
    var mouseEventProto = mixin({
      initMouseEvent: getInitFunction("initMouseEvent", 14)
    }, relatedTargetProto);
    var focusEventProto = mixin({
      initFocusEvent: getInitFunction("initFocusEvent", 5)
    }, relatedTargetProto);
    var MouseEvent = registerGenericEvent("MouseEvent", UIEvent, mouseEventProto);
    var FocusEvent = registerGenericEvent("FocusEvent", UIEvent, focusEventProto);
    var defaultInitDicts = Object.create(null);
    var supportsEventConstructors = function() {
      try {
        new window.FocusEvent("focus");
      } catch (ex) {
        return false;
      }
      return true;
    }();
    function constructEvent(OriginalEvent, name, type, options) {
      if (supportsEventConstructors) return new OriginalEvent(type, unwrapOptions(options));
      var event = unwrap(document.createEvent(name));
      var defaultDict = defaultInitDicts[name];
      var args = [ type ];
      Object.keys(defaultDict).forEach(function(key) {
        var v = options != null && key in options ? options[key] : defaultDict[key];
        if (key === "relatedTarget") v = unwrap(v);
        args.push(v);
      });
      event["init" + name].apply(event, args);
      return event;
    }
    if (!supportsEventConstructors) {
      var configureEventConstructor = function(name, initDict, superName) {
        if (superName) {
          var superDict = defaultInitDicts[superName];
          initDict = mixin(mixin({}, superDict), initDict);
        }
        defaultInitDicts[name] = initDict;
      };
      configureEventConstructor("Event", {
        bubbles: false,
        cancelable: false
      });
      configureEventConstructor("CustomEvent", {
        detail: null
      }, "Event");
      configureEventConstructor("UIEvent", {
        view: null,
        detail: 0
      }, "Event");
      configureEventConstructor("MouseEvent", {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: null
      }, "UIEvent");
      configureEventConstructor("FocusEvent", {
        relatedTarget: null
      }, "UIEvent");
    }
    var OriginalBeforeUnloadEvent = window.BeforeUnloadEvent;
    function BeforeUnloadEvent(impl) {
      Event.call(this, impl);
    }
    BeforeUnloadEvent.prototype = Object.create(Event.prototype);
    mixin(BeforeUnloadEvent.prototype, {
      get returnValue() {
        return unsafeUnwrap(this).returnValue;
      },
      set returnValue(v) {
        unsafeUnwrap(this).returnValue = v;
      }
    });
    if (OriginalBeforeUnloadEvent) registerWrapper(OriginalBeforeUnloadEvent, BeforeUnloadEvent);
    function isValidListener(fun) {
      if (typeof fun === "function") return true;
      return fun && fun.handleEvent;
    }
    function isMutationEvent(type) {
      switch (type) {
       case "DOMAttrModified":
       case "DOMAttributeNameChanged":
       case "DOMCharacterDataModified":
       case "DOMElementNameChanged":
       case "DOMNodeInserted":
       case "DOMNodeInsertedIntoDocument":
       case "DOMNodeRemoved":
       case "DOMNodeRemovedFromDocument":
       case "DOMSubtreeModified":
        return true;
      }
      return false;
    }
    var OriginalEventTarget = window.EventTarget;
    function EventTarget(impl) {
      setWrapper(impl, this);
    }
    var methodNames = [ "addEventListener", "removeEventListener", "dispatchEvent" ];
    [ Node, Window ].forEach(function(constructor) {
      var p = constructor.prototype;
      methodNames.forEach(function(name) {
        Object.defineProperty(p, name + "_", {
          value: p[name]
        });
      });
    });
    function getTargetToListenAt(wrapper) {
      if (wrapper instanceof wrappers.ShadowRoot) wrapper = wrapper.host;
      return unwrap(wrapper);
    }
    EventTarget.prototype = {
      addEventListener: function(type, fun, capture) {
        if (!isValidListener(fun) || isMutationEvent(type)) return;
        var listener = new Listener(type, fun, capture);
        var listeners = listenersTable.get(this);
        if (!listeners) {
          listeners = [];
          listeners.depth = 0;
          listenersTable.set(this, listeners);
        } else {
          for (var i = 0; i < listeners.length; i++) {
            if (listener.equals(listeners[i])) return;
          }
        }
        listeners.push(listener);
        var target = getTargetToListenAt(this);
        target.addEventListener_(type, dispatchOriginalEvent, true);
      },
      removeEventListener: function(type, fun, capture) {
        capture = Boolean(capture);
        var listeners = listenersTable.get(this);
        if (!listeners) return;
        var count = 0, found = false;
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i].type === type && listeners[i].capture === capture) {
            count++;
            if (listeners[i].handler === fun) {
              found = true;
              listeners[i].remove();
            }
          }
        }
        if (found && count === 1) {
          var target = getTargetToListenAt(this);
          target.removeEventListener_(type, dispatchOriginalEvent, true);
        }
      },
      dispatchEvent: function(event) {
        var nativeEvent = unwrap(event);
        var eventType = nativeEvent.type;
        handledEventsTable.set(nativeEvent, false);
        scope.renderAllPending();
        var tempListener;
        if (!hasListenerInAncestors(this, eventType)) {
          tempListener = function() {};
          this.addEventListener(eventType, tempListener, true);
        }
        try {
          return unwrap(this).dispatchEvent_(nativeEvent);
        } finally {
          if (tempListener) this.removeEventListener(eventType, tempListener, true);
        }
      }
    };
    function hasListener(node, type) {
      var listeners = listenersTable.get(node);
      if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
          if (!listeners[i].removed && listeners[i].type === type) return true;
        }
      }
      return false;
    }
    function hasListenerInAncestors(target, type) {
      for (var node = unwrap(target); node; node = node.parentNode) {
        if (hasListener(wrap(node), type)) return true;
      }
      return false;
    }
    if (OriginalEventTarget) registerWrapper(OriginalEventTarget, EventTarget);
    function wrapEventTargetMethods(constructors) {
      forwardMethodsToWrapper(constructors, methodNames);
    }
    var originalElementFromPoint = document.elementFromPoint;
    function elementFromPoint(self, document, x, y) {
      scope.renderAllPending();
      var element = wrap(originalElementFromPoint.call(unsafeUnwrap(document), x, y));
      if (!element) return null;
      var path = getEventPath(element, null);
      var idx = path.lastIndexOf(self);
      if (idx == -1) return null; else path = path.slice(0, idx);
      return eventRetargetting(path, self);
    }
    function getEventHandlerGetter(name) {
      return function() {
        var inlineEventHandlers = eventHandlersTable.get(this);
        return inlineEventHandlers && inlineEventHandlers[name] && inlineEventHandlers[name].value || null;
      };
    }
    function getEventHandlerSetter(name) {
      var eventType = name.slice(2);
      return function(value) {
        var inlineEventHandlers = eventHandlersTable.get(this);
        if (!inlineEventHandlers) {
          inlineEventHandlers = Object.create(null);
          eventHandlersTable.set(this, inlineEventHandlers);
        }
        var old = inlineEventHandlers[name];
        if (old) this.removeEventListener(eventType, old.wrapped, false);
        if (typeof value === "function") {
          var wrapped = function(e) {
            var rv = value.call(this, e);
            if (rv === false) e.preventDefault(); else if (name === "onbeforeunload" && typeof rv === "string") e.returnValue = rv;
          };
          this.addEventListener(eventType, wrapped, false);
          inlineEventHandlers[name] = {
            value: value,
            wrapped: wrapped
          };
        }
      };
    }
    scope.elementFromPoint = elementFromPoint;
    scope.getEventHandlerGetter = getEventHandlerGetter;
    scope.getEventHandlerSetter = getEventHandlerSetter;
    scope.wrapEventTargetMethods = wrapEventTargetMethods;
    scope.wrappers.BeforeUnloadEvent = BeforeUnloadEvent;
    scope.wrappers.CustomEvent = CustomEvent;
    scope.wrappers.Event = Event;
    scope.wrappers.EventTarget = EventTarget;
    scope.wrappers.FocusEvent = FocusEvent;
    scope.wrappers.MouseEvent = MouseEvent;
    scope.wrappers.UIEvent = UIEvent;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var UIEvent = scope.wrappers.UIEvent;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var OriginalTouchEvent = window.TouchEvent;
    if (!OriginalTouchEvent) return;
    var nativeEvent;
    try {
      nativeEvent = document.createEvent("TouchEvent");
    } catch (ex) {
      return;
    }
    var nonEnumDescriptor = {
      enumerable: false
    };
    function nonEnum(obj, prop) {
      Object.defineProperty(obj, prop, nonEnumDescriptor);
    }
    function Touch(impl) {
      setWrapper(impl, this);
    }
    Touch.prototype = {
      get target() {
        return wrap(unsafeUnwrap(this).target);
      }
    };
    var descr = {
      configurable: true,
      enumerable: true,
      get: null
    };
    [ "clientX", "clientY", "screenX", "screenY", "pageX", "pageY", "identifier", "webkitRadiusX", "webkitRadiusY", "webkitRotationAngle", "webkitForce" ].forEach(function(name) {
      descr.get = function() {
        return unsafeUnwrap(this)[name];
      };
      Object.defineProperty(Touch.prototype, name, descr);
    });
    function TouchList() {
      this.length = 0;
      nonEnum(this, "length");
    }
    TouchList.prototype = {
      item: function(index) {
        return this[index];
      }
    };
    function wrapTouchList(nativeTouchList) {
      var list = new TouchList();
      for (var i = 0; i < nativeTouchList.length; i++) {
        list[i] = new Touch(nativeTouchList[i]);
      }
      list.length = i;
      return list;
    }
    function TouchEvent(impl) {
      UIEvent.call(this, impl);
    }
    TouchEvent.prototype = Object.create(UIEvent.prototype);
    mixin(TouchEvent.prototype, {
      get touches() {
        return wrapTouchList(unsafeUnwrap(this).touches);
      },
      get targetTouches() {
        return wrapTouchList(unsafeUnwrap(this).targetTouches);
      },
      get changedTouches() {
        return wrapTouchList(unsafeUnwrap(this).changedTouches);
      },
      initTouchEvent: function() {
        throw new Error("Not implemented");
      }
    });
    registerWrapper(OriginalTouchEvent, TouchEvent, nativeEvent);
    scope.wrappers.Touch = Touch;
    scope.wrappers.TouchEvent = TouchEvent;
    scope.wrappers.TouchList = TouchList;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var nonEnumDescriptor = {
      enumerable: false
    };
    function nonEnum(obj, prop) {
      Object.defineProperty(obj, prop, nonEnumDescriptor);
    }
    function NodeList() {
      this.length = 0;
      nonEnum(this, "length");
    }
    NodeList.prototype = {
      item: function(index) {
        return this[index];
      }
    };
    nonEnum(NodeList.prototype, "item");
    function wrapNodeList(list) {
      if (list == null) return list;
      var wrapperList = new NodeList();
      for (var i = 0, length = list.length; i < length; i++) {
        wrapperList[i] = wrap(list[i]);
      }
      wrapperList.length = length;
      return wrapperList;
    }
    function addWrapNodeListMethod(wrapperConstructor, name) {
      wrapperConstructor.prototype[name] = function() {
        return wrapNodeList(unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments));
      };
    }
    scope.wrappers.NodeList = NodeList;
    scope.addWrapNodeListMethod = addWrapNodeListMethod;
    scope.wrapNodeList = wrapNodeList;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    scope.wrapHTMLCollection = scope.wrapNodeList;
    scope.wrappers.HTMLCollection = scope.wrappers.NodeList;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var EventTarget = scope.wrappers.EventTarget;
    var NodeList = scope.wrappers.NodeList;
    var TreeScope = scope.TreeScope;
    var assert = scope.assert;
    var defineWrapGetter = scope.defineWrapGetter;
    var enqueueMutation = scope.enqueueMutation;
    var getTreeScope = scope.getTreeScope;
    var isWrapper = scope.isWrapper;
    var mixin = scope.mixin;
    var registerTransientObservers = scope.registerTransientObservers;
    var registerWrapper = scope.registerWrapper;
    var setTreeScope = scope.setTreeScope;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var wrapIfNeeded = scope.wrapIfNeeded;
    var wrappers = scope.wrappers;
    function assertIsNodeWrapper(node) {
      assert(node instanceof Node);
    }
    function createOneElementNodeList(node) {
      var nodes = new NodeList();
      nodes[0] = node;
      nodes.length = 1;
      return nodes;
    }
    var surpressMutations = false;
    function enqueueRemovalForInsertedNodes(node, parent, nodes) {
      enqueueMutation(parent, "childList", {
        removedNodes: nodes,
        previousSibling: node.previousSibling,
        nextSibling: node.nextSibling
      });
    }
    function enqueueRemovalForInsertedDocumentFragment(df, nodes) {
      enqueueMutation(df, "childList", {
        removedNodes: nodes
      });
    }
    function collectNodes(node, parentNode, previousNode, nextNode) {
      if (node instanceof DocumentFragment) {
        var nodes = collectNodesForDocumentFragment(node);
        surpressMutations = true;
        for (var i = nodes.length - 1; i >= 0; i--) {
          node.removeChild(nodes[i]);
          nodes[i].parentNode_ = parentNode;
        }
        surpressMutations = false;
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].previousSibling_ = nodes[i - 1] || previousNode;
          nodes[i].nextSibling_ = nodes[i + 1] || nextNode;
        }
        if (previousNode) previousNode.nextSibling_ = nodes[0];
        if (nextNode) nextNode.previousSibling_ = nodes[nodes.length - 1];
        return nodes;
      }
      var nodes = createOneElementNodeList(node);
      var oldParent = node.parentNode;
      if (oldParent) {
        oldParent.removeChild(node);
      }
      node.parentNode_ = parentNode;
      node.previousSibling_ = previousNode;
      node.nextSibling_ = nextNode;
      if (previousNode) previousNode.nextSibling_ = node;
      if (nextNode) nextNode.previousSibling_ = node;
      return nodes;
    }
    function collectNodesNative(node) {
      if (node instanceof DocumentFragment) return collectNodesForDocumentFragment(node);
      var nodes = createOneElementNodeList(node);
      var oldParent = node.parentNode;
      if (oldParent) enqueueRemovalForInsertedNodes(node, oldParent, nodes);
      return nodes;
    }
    function collectNodesForDocumentFragment(node) {
      var nodes = new NodeList();
      var i = 0;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        nodes[i++] = child;
      }
      nodes.length = i;
      enqueueRemovalForInsertedDocumentFragment(node, nodes);
      return nodes;
    }
    function snapshotNodeList(nodeList) {
      return nodeList;
    }
    function nodeWasAdded(node, treeScope) {
      setTreeScope(node, treeScope);
      node.nodeIsInserted_();
    }
    function nodesWereAdded(nodes, parent) {
      var treeScope = getTreeScope(parent);
      for (var i = 0; i < nodes.length; i++) {
        nodeWasAdded(nodes[i], treeScope);
      }
    }
    function nodeWasRemoved(node) {
      setTreeScope(node, new TreeScope(node, null));
    }
    function nodesWereRemoved(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        nodeWasRemoved(nodes[i]);
      }
    }
    function ensureSameOwnerDocument(parent, child) {
      var ownerDoc = parent.nodeType === Node.DOCUMENT_NODE ? parent : parent.ownerDocument;
      if (ownerDoc !== child.ownerDocument) ownerDoc.adoptNode(child);
    }
    function adoptNodesIfNeeded(owner, nodes) {
      if (!nodes.length) return;
      var ownerDoc = owner.ownerDocument;
      if (ownerDoc === nodes[0].ownerDocument) return;
      for (var i = 0; i < nodes.length; i++) {
        scope.adoptNodeNoRemove(nodes[i], ownerDoc);
      }
    }
    function unwrapNodesForInsertion(owner, nodes) {
      adoptNodesIfNeeded(owner, nodes);
      var length = nodes.length;
      if (length === 1) return unwrap(nodes[0]);
      var df = unwrap(owner.ownerDocument.createDocumentFragment());
      for (var i = 0; i < length; i++) {
        df.appendChild(unwrap(nodes[i]));
      }
      return df;
    }
    function clearChildNodes(wrapper) {
      if (wrapper.firstChild_ !== undefined) {
        var child = wrapper.firstChild_;
        while (child) {
          var tmp = child;
          child = child.nextSibling_;
          tmp.parentNode_ = tmp.previousSibling_ = tmp.nextSibling_ = undefined;
        }
      }
      wrapper.firstChild_ = wrapper.lastChild_ = undefined;
    }
    function removeAllChildNodes(wrapper) {
      if (wrapper.invalidateShadowRenderer()) {
        var childWrapper = wrapper.firstChild;
        while (childWrapper) {
          assert(childWrapper.parentNode === wrapper);
          var nextSibling = childWrapper.nextSibling;
          var childNode = unwrap(childWrapper);
          var parentNode = childNode.parentNode;
          if (parentNode) originalRemoveChild.call(parentNode, childNode);
          childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = null;
          childWrapper = nextSibling;
        }
        wrapper.firstChild_ = wrapper.lastChild_ = null;
      } else {
        var node = unwrap(wrapper);
        var child = node.firstChild;
        var nextSibling;
        while (child) {
          nextSibling = child.nextSibling;
          originalRemoveChild.call(node, child);
          child = nextSibling;
        }
      }
    }
    function invalidateParent(node) {
      var p = node.parentNode;
      return p && p.invalidateShadowRenderer();
    }
    function cleanupNodes(nodes) {
      for (var i = 0, n; i < nodes.length; i++) {
        n = nodes[i];
        n.parentNode.removeChild(n);
      }
    }
    var originalImportNode = document.importNode;
    var originalCloneNode = window.Node.prototype.cloneNode;
    function cloneNode(node, deep, opt_doc) {
      var clone;
      if (opt_doc) clone = wrap(originalImportNode.call(opt_doc, unsafeUnwrap(node), false)); else clone = wrap(originalCloneNode.call(unsafeUnwrap(node), false));
      if (deep) {
        for (var child = node.firstChild; child; child = child.nextSibling) {
          clone.appendChild(cloneNode(child, true, opt_doc));
        }
        if (node instanceof wrappers.HTMLTemplateElement) {
          var cloneContent = clone.content;
          for (var child = node.content.firstChild; child; child = child.nextSibling) {
            cloneContent.appendChild(cloneNode(child, true, opt_doc));
          }
        }
      }
      return clone;
    }
    function contains(self, child) {
      if (!child || getTreeScope(self) !== getTreeScope(child)) return false;
      for (var node = child; node; node = node.parentNode) {
        if (node === self) return true;
      }
      return false;
    }
    var OriginalNode = window.Node;
    function Node(original) {
      assert(original instanceof OriginalNode);
      EventTarget.call(this, original);
      this.parentNode_ = undefined;
      this.firstChild_ = undefined;
      this.lastChild_ = undefined;
      this.nextSibling_ = undefined;
      this.previousSibling_ = undefined;
      this.treeScope_ = undefined;
    }
    var OriginalDocumentFragment = window.DocumentFragment;
    var originalAppendChild = OriginalNode.prototype.appendChild;
    var originalCompareDocumentPosition = OriginalNode.prototype.compareDocumentPosition;
    var originalInsertBefore = OriginalNode.prototype.insertBefore;
    var originalRemoveChild = OriginalNode.prototype.removeChild;
    var originalReplaceChild = OriginalNode.prototype.replaceChild;
    var isIe = /Trident|Edge/.test(navigator.userAgent);
    var removeChildOriginalHelper = isIe ? function(parent, child) {
      try {
        originalRemoveChild.call(parent, child);
      } catch (ex) {
        if (!(parent instanceof OriginalDocumentFragment)) throw ex;
      }
    } : function(parent, child) {
      originalRemoveChild.call(parent, child);
    };
    Node.prototype = Object.create(EventTarget.prototype);
    mixin(Node.prototype, {
      appendChild: function(childWrapper) {
        return this.insertBefore(childWrapper, null);
      },
      insertBefore: function(childWrapper, refWrapper) {
        assertIsNodeWrapper(childWrapper);
        var refNode;
        if (refWrapper) {
          if (isWrapper(refWrapper)) {
            refNode = unwrap(refWrapper);
          } else {
            refNode = refWrapper;
            refWrapper = wrap(refNode);
          }
        } else {
          refWrapper = null;
          refNode = null;
        }
        refWrapper && assert(refWrapper.parentNode === this);
        var nodes;
        var previousNode = refWrapper ? refWrapper.previousSibling : this.lastChild;
        var useNative = !this.invalidateShadowRenderer() && !invalidateParent(childWrapper);
        if (useNative) nodes = collectNodesNative(childWrapper); else nodes = collectNodes(childWrapper, this, previousNode, refWrapper);
        if (useNative) {
          ensureSameOwnerDocument(this, childWrapper);
          clearChildNodes(this);
          originalInsertBefore.call(unsafeUnwrap(this), unwrap(childWrapper), refNode);
        } else {
          if (!previousNode) this.firstChild_ = nodes[0];
          if (!refWrapper) {
            this.lastChild_ = nodes[nodes.length - 1];
            if (this.firstChild_ === undefined) this.firstChild_ = this.firstChild;
          }
          var parentNode = refNode ? refNode.parentNode : unsafeUnwrap(this);
          if (parentNode) {
            originalInsertBefore.call(parentNode, unwrapNodesForInsertion(this, nodes), refNode);
          } else {
            adoptNodesIfNeeded(this, nodes);
          }
        }
        enqueueMutation(this, "childList", {
          addedNodes: nodes,
          nextSibling: refWrapper,
          previousSibling: previousNode
        });
        nodesWereAdded(nodes, this);
        return childWrapper;
      },
      removeChild: function(childWrapper) {
        assertIsNodeWrapper(childWrapper);
        if (childWrapper.parentNode !== this) {
          var found = false;
          var childNodes = this.childNodes;
          for (var ieChild = this.firstChild; ieChild; ieChild = ieChild.nextSibling) {
            if (ieChild === childWrapper) {
              found = true;
              break;
            }
          }
          if (!found) {
            throw new Error("NotFoundError");
          }
        }
        var childNode = unwrap(childWrapper);
        var childWrapperNextSibling = childWrapper.nextSibling;
        var childWrapperPreviousSibling = childWrapper.previousSibling;
        if (this.invalidateShadowRenderer()) {
          var thisFirstChild = this.firstChild;
          var thisLastChild = this.lastChild;
          var parentNode = childNode.parentNode;
          if (parentNode) removeChildOriginalHelper(parentNode, childNode);
          if (thisFirstChild === childWrapper) this.firstChild_ = childWrapperNextSibling;
          if (thisLastChild === childWrapper) this.lastChild_ = childWrapperPreviousSibling;
          if (childWrapperPreviousSibling) childWrapperPreviousSibling.nextSibling_ = childWrapperNextSibling;
          if (childWrapperNextSibling) {
            childWrapperNextSibling.previousSibling_ = childWrapperPreviousSibling;
          }
          childWrapper.previousSibling_ = childWrapper.nextSibling_ = childWrapper.parentNode_ = undefined;
        } else {
          clearChildNodes(this);
          removeChildOriginalHelper(unsafeUnwrap(this), childNode);
        }
        if (!surpressMutations) {
          enqueueMutation(this, "childList", {
            removedNodes: createOneElementNodeList(childWrapper),
            nextSibling: childWrapperNextSibling,
            previousSibling: childWrapperPreviousSibling
          });
        }
        registerTransientObservers(this, childWrapper);
        return childWrapper;
      },
      replaceChild: function(newChildWrapper, oldChildWrapper) {
        assertIsNodeWrapper(newChildWrapper);
        var oldChildNode;
        if (isWrapper(oldChildWrapper)) {
          oldChildNode = unwrap(oldChildWrapper);
        } else {
          oldChildNode = oldChildWrapper;
          oldChildWrapper = wrap(oldChildNode);
        }
        if (oldChildWrapper.parentNode !== this) {
          throw new Error("NotFoundError");
        }
        var nextNode = oldChildWrapper.nextSibling;
        var previousNode = oldChildWrapper.previousSibling;
        var nodes;
        var useNative = !this.invalidateShadowRenderer() && !invalidateParent(newChildWrapper);
        if (useNative) {
          nodes = collectNodesNative(newChildWrapper);
        } else {
          if (nextNode === newChildWrapper) nextNode = newChildWrapper.nextSibling;
          nodes = collectNodes(newChildWrapper, this, previousNode, nextNode);
        }
        if (!useNative) {
          if (this.firstChild === oldChildWrapper) this.firstChild_ = nodes[0];
          if (this.lastChild === oldChildWrapper) this.lastChild_ = nodes[nodes.length - 1];
          oldChildWrapper.previousSibling_ = oldChildWrapper.nextSibling_ = oldChildWrapper.parentNode_ = undefined;
          if (oldChildNode.parentNode) {
            originalReplaceChild.call(oldChildNode.parentNode, unwrapNodesForInsertion(this, nodes), oldChildNode);
          }
        } else {
          ensureSameOwnerDocument(this, newChildWrapper);
          clearChildNodes(this);
          originalReplaceChild.call(unsafeUnwrap(this), unwrap(newChildWrapper), oldChildNode);
        }
        enqueueMutation(this, "childList", {
          addedNodes: nodes,
          removedNodes: createOneElementNodeList(oldChildWrapper),
          nextSibling: nextNode,
          previousSibling: previousNode
        });
        nodeWasRemoved(oldChildWrapper);
        nodesWereAdded(nodes, this);
        return oldChildWrapper;
      },
      nodeIsInserted_: function() {
        for (var child = this.firstChild; child; child = child.nextSibling) {
          child.nodeIsInserted_();
        }
      },
      hasChildNodes: function() {
        return this.firstChild !== null;
      },
      get parentNode() {
        return this.parentNode_ !== undefined ? this.parentNode_ : wrap(unsafeUnwrap(this).parentNode);
      },
      get firstChild() {
        return this.firstChild_ !== undefined ? this.firstChild_ : wrap(unsafeUnwrap(this).firstChild);
      },
      get lastChild() {
        return this.lastChild_ !== undefined ? this.lastChild_ : wrap(unsafeUnwrap(this).lastChild);
      },
      get nextSibling() {
        return this.nextSibling_ !== undefined ? this.nextSibling_ : wrap(unsafeUnwrap(this).nextSibling);
      },
      get previousSibling() {
        return this.previousSibling_ !== undefined ? this.previousSibling_ : wrap(unsafeUnwrap(this).previousSibling);
      },
      get parentElement() {
        var p = this.parentNode;
        while (p && p.nodeType !== Node.ELEMENT_NODE) {
          p = p.parentNode;
        }
        return p;
      },
      get textContent() {
        var s = "";
        for (var child = this.firstChild; child; child = child.nextSibling) {
          if (child.nodeType != Node.COMMENT_NODE) {
            s += child.textContent;
          }
        }
        return s;
      },
      set textContent(textContent) {
        if (textContent == null) textContent = "";
        var removedNodes = snapshotNodeList(this.childNodes);
        if (this.invalidateShadowRenderer()) {
          removeAllChildNodes(this);
          if (textContent !== "") {
            var textNode = unsafeUnwrap(this).ownerDocument.createTextNode(textContent);
            this.appendChild(textNode);
          }
        } else {
          clearChildNodes(this);
          unsafeUnwrap(this).textContent = textContent;
        }
        var addedNodes = snapshotNodeList(this.childNodes);
        enqueueMutation(this, "childList", {
          addedNodes: addedNodes,
          removedNodes: removedNodes
        });
        nodesWereRemoved(removedNodes);
        nodesWereAdded(addedNodes, this);
      },
      get childNodes() {
        var wrapperList = new NodeList();
        var i = 0;
        for (var child = this.firstChild; child; child = child.nextSibling) {
          wrapperList[i++] = child;
        }
        wrapperList.length = i;
        return wrapperList;
      },
      cloneNode: function(deep) {
        return cloneNode(this, deep);
      },
      contains: function(child) {
        return contains(this, wrapIfNeeded(child));
      },
      compareDocumentPosition: function(otherNode) {
        return originalCompareDocumentPosition.call(unsafeUnwrap(this), unwrapIfNeeded(otherNode));
      },
      normalize: function() {
        var nodes = snapshotNodeList(this.childNodes);
        var remNodes = [];
        var s = "";
        var modNode;
        for (var i = 0, n; i < nodes.length; i++) {
          n = nodes[i];
          if (n.nodeType === Node.TEXT_NODE) {
            if (!modNode && !n.data.length) this.removeChild(n); else if (!modNode) modNode = n; else {
              s += n.data;
              remNodes.push(n);
            }
          } else {
            if (modNode && remNodes.length) {
              modNode.data += s;
              cleanupNodes(remNodes);
            }
            remNodes = [];
            s = "";
            modNode = null;
            if (n.childNodes.length) n.normalize();
          }
        }
        if (modNode && remNodes.length) {
          modNode.data += s;
          cleanupNodes(remNodes);
        }
      }
    });
    defineWrapGetter(Node, "ownerDocument");
    registerWrapper(OriginalNode, Node, document.createDocumentFragment());
    delete Node.prototype.querySelector;
    delete Node.prototype.querySelectorAll;
    Node.prototype = mixin(Object.create(EventTarget.prototype), Node.prototype);
    scope.cloneNode = cloneNode;
    scope.nodeWasAdded = nodeWasAdded;
    scope.nodeWasRemoved = nodeWasRemoved;
    scope.nodesWereAdded = nodesWereAdded;
    scope.nodesWereRemoved = nodesWereRemoved;
    scope.originalInsertBefore = originalInsertBefore;
    scope.originalRemoveChild = originalRemoveChild;
    scope.snapshotNodeList = snapshotNodeList;
    scope.wrappers.Node = Node;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLCollection = scope.wrappers.HTMLCollection;
    var NodeList = scope.wrappers.NodeList;
    var getTreeScope = scope.getTreeScope;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var originalDocumentQuerySelector = document.querySelector;
    var originalElementQuerySelector = document.documentElement.querySelector;
    var originalDocumentQuerySelectorAll = document.querySelectorAll;
    var originalElementQuerySelectorAll = document.documentElement.querySelectorAll;
    var originalDocumentGetElementsByTagName = document.getElementsByTagName;
    var originalElementGetElementsByTagName = document.documentElement.getElementsByTagName;
    var originalDocumentGetElementsByTagNameNS = document.getElementsByTagNameNS;
    var originalElementGetElementsByTagNameNS = document.documentElement.getElementsByTagNameNS;
    var OriginalElement = window.Element;
    var OriginalDocument = window.HTMLDocument || window.Document;
    function filterNodeList(list, index, result, deep) {
      var wrappedItem = null;
      var root = null;
      for (var i = 0, length = list.length; i < length; i++) {
        wrappedItem = wrap(list[i]);
        if (!deep && (root = getTreeScope(wrappedItem).root)) {
          if (root instanceof scope.wrappers.ShadowRoot) {
            continue;
          }
        }
        result[index++] = wrappedItem;
      }
      return index;
    }
    function shimSelector(selector) {
      return String(selector).replace(/\/deep\/|::shadow/g, " ");
    }
    function shimMatchesSelector(selector) {
      return String(selector).replace(/:host\(([^\s]+)\)/g, "$1").replace(/([^\s]):host/g, "$1").replace(":host", "*").replace(/\^|\/shadow\/|\/shadow-deep\/|::shadow|\/deep\/|::content/g, " ");
    }
    function findOne(node, selector) {
      var m, el = node.firstElementChild;
      while (el) {
        if (el.matches(selector)) return el;
        m = findOne(el, selector);
        if (m) return m;
        el = el.nextElementSibling;
      }
      return null;
    }
    function matchesSelector(el, selector) {
      return el.matches(selector);
    }
    var XHTML_NS = "http://www.w3.org/1999/xhtml";
    function matchesTagName(el, localName, localNameLowerCase) {
      var ln = el.localName;
      return ln === localName || ln === localNameLowerCase && el.namespaceURI === XHTML_NS;
    }
    function matchesEveryThing() {
      return true;
    }
    function matchesLocalNameOnly(el, ns, localName) {
      return el.localName === localName;
    }
    function matchesNameSpace(el, ns) {
      return el.namespaceURI === ns;
    }
    function matchesLocalNameNS(el, ns, localName) {
      return el.namespaceURI === ns && el.localName === localName;
    }
    function findElements(node, index, result, p, arg0, arg1) {
      var el = node.firstElementChild;
      while (el) {
        if (p(el, arg0, arg1)) result[index++] = el;
        index = findElements(el, index, result, p, arg0, arg1);
        el = el.nextElementSibling;
      }
      return index;
    }
    function querySelectorAllFiltered(p, index, result, selector, deep) {
      var target = unsafeUnwrap(this);
      var list;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        return findElements(this, index, result, p, selector, null);
      } else if (target instanceof OriginalElement) {
        list = originalElementQuerySelectorAll.call(target, selector);
      } else if (target instanceof OriginalDocument) {
        list = originalDocumentQuerySelectorAll.call(target, selector);
      } else {
        return findElements(this, index, result, p, selector, null);
      }
      return filterNodeList(list, index, result, deep);
    }
    var SelectorsInterface = {
      querySelector: function(selector) {
        var shimmed = shimSelector(selector);
        var deep = shimmed !== selector;
        selector = shimmed;
        var target = unsafeUnwrap(this);
        var wrappedItem;
        var root = getTreeScope(this).root;
        if (root instanceof scope.wrappers.ShadowRoot) {
          return findOne(this, selector);
        } else if (target instanceof OriginalElement) {
          wrappedItem = wrap(originalElementQuerySelector.call(target, selector));
        } else if (target instanceof OriginalDocument) {
          wrappedItem = wrap(originalDocumentQuerySelector.call(target, selector));
        } else {
          return findOne(this, selector);
        }
        if (!wrappedItem) {
          return wrappedItem;
        } else if (!deep && (root = getTreeScope(wrappedItem).root)) {
          if (root instanceof scope.wrappers.ShadowRoot) {
            return findOne(this, selector);
          }
        }
        return wrappedItem;
      },
      querySelectorAll: function(selector) {
        var shimmed = shimSelector(selector);
        var deep = shimmed !== selector;
        selector = shimmed;
        var result = new NodeList();
        result.length = querySelectorAllFiltered.call(this, matchesSelector, 0, result, selector, deep);
        return result;
      }
    };
    var MatchesInterface = {
      matches: function(selector) {
        selector = shimMatchesSelector(selector);
        return scope.originalMatches.call(unsafeUnwrap(this), selector);
      }
    };
    function getElementsByTagNameFiltered(p, index, result, localName, lowercase) {
      var target = unsafeUnwrap(this);
      var list;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        return findElements(this, index, result, p, localName, lowercase);
      } else if (target instanceof OriginalElement) {
        list = originalElementGetElementsByTagName.call(target, localName, lowercase);
      } else if (target instanceof OriginalDocument) {
        list = originalDocumentGetElementsByTagName.call(target, localName, lowercase);
      } else {
        return findElements(this, index, result, p, localName, lowercase);
      }
      return filterNodeList(list, index, result, false);
    }
    function getElementsByTagNameNSFiltered(p, index, result, ns, localName) {
      var target = unsafeUnwrap(this);
      var list;
      var root = getTreeScope(this).root;
      if (root instanceof scope.wrappers.ShadowRoot) {
        return findElements(this, index, result, p, ns, localName);
      } else if (target instanceof OriginalElement) {
        list = originalElementGetElementsByTagNameNS.call(target, ns, localName);
      } else if (target instanceof OriginalDocument) {
        list = originalDocumentGetElementsByTagNameNS.call(target, ns, localName);
      } else {
        return findElements(this, index, result, p, ns, localName);
      }
      return filterNodeList(list, index, result, false);
    }
    var GetElementsByInterface = {
      getElementsByTagName: function(localName) {
        var result = new HTMLCollection();
        var match = localName === "*" ? matchesEveryThing : matchesTagName;
        result.length = getElementsByTagNameFiltered.call(this, match, 0, result, localName, localName.toLowerCase());
        return result;
      },
      getElementsByClassName: function(className) {
        return this.querySelectorAll("." + className);
      },
      getElementsByTagNameNS: function(ns, localName) {
        var result = new HTMLCollection();
        var match = null;
        if (ns === "*") {
          match = localName === "*" ? matchesEveryThing : matchesLocalNameOnly;
        } else {
          match = localName === "*" ? matchesNameSpace : matchesLocalNameNS;
        }
        result.length = getElementsByTagNameNSFiltered.call(this, match, 0, result, ns || null, localName);
        return result;
      }
    };
    scope.GetElementsByInterface = GetElementsByInterface;
    scope.SelectorsInterface = SelectorsInterface;
    scope.MatchesInterface = MatchesInterface;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var NodeList = scope.wrappers.NodeList;
    function forwardElement(node) {
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.nextSibling;
      }
      return node;
    }
    function backwardsElement(node) {
      while (node && node.nodeType !== Node.ELEMENT_NODE) {
        node = node.previousSibling;
      }
      return node;
    }
    var ParentNodeInterface = {
      get firstElementChild() {
        return forwardElement(this.firstChild);
      },
      get lastElementChild() {
        return backwardsElement(this.lastChild);
      },
      get childElementCount() {
        var count = 0;
        for (var child = this.firstElementChild; child; child = child.nextElementSibling) {
          count++;
        }
        return count;
      },
      get children() {
        var wrapperList = new NodeList();
        var i = 0;
        for (var child = this.firstElementChild; child; child = child.nextElementSibling) {
          wrapperList[i++] = child;
        }
        wrapperList.length = i;
        return wrapperList;
      },
      remove: function() {
        var p = this.parentNode;
        if (p) p.removeChild(this);
      }
    };
    var ChildNodeInterface = {
      get nextElementSibling() {
        return forwardElement(this.nextSibling);
      },
      get previousElementSibling() {
        return backwardsElement(this.previousSibling);
      }
    };
    scope.ChildNodeInterface = ChildNodeInterface;
    scope.ParentNodeInterface = ParentNodeInterface;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var ChildNodeInterface = scope.ChildNodeInterface;
    var Node = scope.wrappers.Node;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var OriginalCharacterData = window.CharacterData;
    function CharacterData(node) {
      Node.call(this, node);
    }
    CharacterData.prototype = Object.create(Node.prototype);
    mixin(CharacterData.prototype, {
      get textContent() {
        return this.data;
      },
      set textContent(value) {
        this.data = value;
      },
      get data() {
        return unsafeUnwrap(this).data;
      },
      set data(value) {
        var oldValue = unsafeUnwrap(this).data;
        enqueueMutation(this, "characterData", {
          oldValue: oldValue
        });
        unsafeUnwrap(this).data = value;
      }
    });
    mixin(CharacterData.prototype, ChildNodeInterface);
    registerWrapper(OriginalCharacterData, CharacterData, document.createTextNode(""));
    scope.wrappers.CharacterData = CharacterData;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var CharacterData = scope.wrappers.CharacterData;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    function toUInt32(x) {
      return x >>> 0;
    }
    var OriginalText = window.Text;
    function Text(node) {
      CharacterData.call(this, node);
    }
    Text.prototype = Object.create(CharacterData.prototype);
    mixin(Text.prototype, {
      splitText: function(offset) {
        offset = toUInt32(offset);
        var s = this.data;
        if (offset > s.length) throw new Error("IndexSizeError");
        var head = s.slice(0, offset);
        var tail = s.slice(offset);
        this.data = head;
        var newTextNode = this.ownerDocument.createTextNode(tail);
        if (this.parentNode) this.parentNode.insertBefore(newTextNode, this.nextSibling);
        return newTextNode;
      }
    });
    registerWrapper(OriginalText, Text, document.createTextNode(""));
    scope.wrappers.Text = Text;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    if (!window.DOMTokenList) {
      console.warn("Missing DOMTokenList prototype, please include a " + "compatible classList polyfill such as http://goo.gl/uTcepH.");
      return;
    }
    var unsafeUnwrap = scope.unsafeUnwrap;
    var enqueueMutation = scope.enqueueMutation;
    function getClass(el) {
      return unsafeUnwrap(el).getAttribute("class");
    }
    function enqueueClassAttributeChange(el, oldValue) {
      enqueueMutation(el, "attributes", {
        name: "class",
        namespace: null,
        oldValue: oldValue
      });
    }
    function invalidateClass(el) {
      scope.invalidateRendererBasedOnAttribute(el, "class");
    }
    function changeClass(tokenList, method, args) {
      var ownerElement = tokenList.ownerElement_;
      if (ownerElement == null) {
        return method.apply(tokenList, args);
      }
      var oldValue = getClass(ownerElement);
      var retv = method.apply(tokenList, args);
      if (getClass(ownerElement) !== oldValue) {
        enqueueClassAttributeChange(ownerElement, oldValue);
        invalidateClass(ownerElement);
      }
      return retv;
    }
    var oldAdd = DOMTokenList.prototype.add;
    DOMTokenList.prototype.add = function() {
      changeClass(this, oldAdd, arguments);
    };
    var oldRemove = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function() {
      changeClass(this, oldRemove, arguments);
    };
    var oldToggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function() {
      return changeClass(this, oldToggle, arguments);
    };
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var ChildNodeInterface = scope.ChildNodeInterface;
    var GetElementsByInterface = scope.GetElementsByInterface;
    var Node = scope.wrappers.Node;
    var ParentNodeInterface = scope.ParentNodeInterface;
    var SelectorsInterface = scope.SelectorsInterface;
    var MatchesInterface = scope.MatchesInterface;
    var addWrapNodeListMethod = scope.addWrapNodeListMethod;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var oneOf = scope.oneOf;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrappers = scope.wrappers;
    var OriginalElement = window.Element;
    var matchesNames = [ "matches", "mozMatchesSelector", "msMatchesSelector", "webkitMatchesSelector" ].filter(function(name) {
      return OriginalElement.prototype[name];
    });
    var matchesName = matchesNames[0];
    var originalMatches = OriginalElement.prototype[matchesName];
    function invalidateRendererBasedOnAttribute(element, name) {
      var p = element.parentNode;
      if (!p || !p.shadowRoot) return;
      var renderer = scope.getRendererForHost(p);
      if (renderer.dependsOnAttribute(name)) renderer.invalidate();
    }
    function enqueAttributeChange(element, name, oldValue) {
      enqueueMutation(element, "attributes", {
        name: name,
        namespace: null,
        oldValue: oldValue
      });
    }
    var classListTable = new WeakMap();
    function Element(node) {
      Node.call(this, node);
    }
    Element.prototype = Object.create(Node.prototype);
    mixin(Element.prototype, {
      createShadowRoot: function() {
        var newShadowRoot = new wrappers.ShadowRoot(this);
        unsafeUnwrap(this).polymerShadowRoot_ = newShadowRoot;
        var renderer = scope.getRendererForHost(this);
        renderer.invalidate();
        return newShadowRoot;
      },
      get shadowRoot() {
        return unsafeUnwrap(this).polymerShadowRoot_ || null;
      },
      setAttribute: function(name, value) {
        var oldValue = unsafeUnwrap(this).getAttribute(name);
        unsafeUnwrap(this).setAttribute(name, value);
        enqueAttributeChange(this, name, oldValue);
        invalidateRendererBasedOnAttribute(this, name);
      },
      removeAttribute: function(name) {
        var oldValue = unsafeUnwrap(this).getAttribute(name);
        unsafeUnwrap(this).removeAttribute(name);
        enqueAttributeChange(this, name, oldValue);
        invalidateRendererBasedOnAttribute(this, name);
      },
      get classList() {
        var list = classListTable.get(this);
        if (!list) {
          list = unsafeUnwrap(this).classList;
          if (!list) return;
          list.ownerElement_ = this;
          classListTable.set(this, list);
        }
        return list;
      },
      get className() {
        return unsafeUnwrap(this).className;
      },
      set className(v) {
        this.setAttribute("class", v);
      },
      get id() {
        return unsafeUnwrap(this).id;
      },
      set id(v) {
        this.setAttribute("id", v);
      }
    });
    matchesNames.forEach(function(name) {
      if (name !== "matches") {
        Element.prototype[name] = function(selector) {
          return this.matches(selector);
        };
      }
    });
    if (OriginalElement.prototype.webkitCreateShadowRoot) {
      Element.prototype.webkitCreateShadowRoot = Element.prototype.createShadowRoot;
    }
    mixin(Element.prototype, ChildNodeInterface);
    mixin(Element.prototype, GetElementsByInterface);
    mixin(Element.prototype, ParentNodeInterface);
    mixin(Element.prototype, SelectorsInterface);
    mixin(Element.prototype, MatchesInterface);
    registerWrapper(OriginalElement, Element, document.createElementNS(null, "x"));
    scope.invalidateRendererBasedOnAttribute = invalidateRendererBasedOnAttribute;
    scope.matchesNames = matchesNames;
    scope.originalMatches = originalMatches;
    scope.wrappers.Element = Element;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Element = scope.wrappers.Element;
    var defineGetter = scope.defineGetter;
    var enqueueMutation = scope.enqueueMutation;
    var mixin = scope.mixin;
    var nodesWereAdded = scope.nodesWereAdded;
    var nodesWereRemoved = scope.nodesWereRemoved;
    var registerWrapper = scope.registerWrapper;
    var snapshotNodeList = scope.snapshotNodeList;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrappers = scope.wrappers;
    var escapeAttrRegExp = /[&\u00A0"]/g;
    var escapeDataRegExp = /[&\u00A0<>]/g;
    function escapeReplace(c) {
      switch (c) {
       case "&":
        return "&amp;";

       case "<":
        return "&lt;";

       case ">":
        return "&gt;";

       case '"':
        return "&quot;";

       case " ":
        return "&nbsp;";
      }
    }
    function escapeAttr(s) {
      return s.replace(escapeAttrRegExp, escapeReplace);
    }
    function escapeData(s) {
      return s.replace(escapeDataRegExp, escapeReplace);
    }
    function makeSet(arr) {
      var set = {};
      for (var i = 0; i < arr.length; i++) {
        set[arr[i]] = true;
      }
      return set;
    }
    var voidElements = makeSet([ "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr" ]);
    var plaintextParents = makeSet([ "style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript" ]);
    function getOuterHTML(node, parentNode) {
      switch (node.nodeType) {
       case Node.ELEMENT_NODE:
        var tagName = node.tagName.toLowerCase();
        var s = "<" + tagName;
        var attrs = node.attributes;
        for (var i = 0, attr; attr = attrs[i]; i++) {
          s += " " + attr.name + '="' + escapeAttr(attr.value) + '"';
        }
        s += ">";
        if (voidElements[tagName]) return s;
        return s + getInnerHTML(node) + "</" + tagName + ">";

       case Node.TEXT_NODE:
        var data = node.data;
        if (parentNode && plaintextParents[parentNode.localName]) return data;
        return escapeData(data);

       case Node.COMMENT_NODE:
        return "<!--" + node.data + "-->";

       default:
        console.error(node);
        throw new Error("not implemented");
      }
    }
    function getInnerHTML(node) {
      if (node instanceof wrappers.HTMLTemplateElement) node = node.content;
      var s = "";
      for (var child = node.firstChild; child; child = child.nextSibling) {
        s += getOuterHTML(child, node);
      }
      return s;
    }
    function setInnerHTML(node, value, opt_tagName) {
      var tagName = opt_tagName || "div";
      node.textContent = "";
      var tempElement = unwrap(node.ownerDocument.createElement(tagName));
      tempElement.innerHTML = value;
      var firstChild;
      while (firstChild = tempElement.firstChild) {
        node.appendChild(wrap(firstChild));
      }
    }
    var oldIe = /MSIE/.test(navigator.userAgent);
    var OriginalHTMLElement = window.HTMLElement;
    var OriginalHTMLTemplateElement = window.HTMLTemplateElement;
    function HTMLElement(node) {
      Element.call(this, node);
    }
    HTMLElement.prototype = Object.create(Element.prototype);
    mixin(HTMLElement.prototype, {
      get innerHTML() {
        return getInnerHTML(this);
      },
      set innerHTML(value) {
        if (oldIe && plaintextParents[this.localName]) {
          this.textContent = value;
          return;
        }
        var removedNodes = snapshotNodeList(this.childNodes);
        if (this.invalidateShadowRenderer()) {
          if (this instanceof wrappers.HTMLTemplateElement) setInnerHTML(this.content, value); else setInnerHTML(this, value, this.tagName);
        } else if (!OriginalHTMLTemplateElement && this instanceof wrappers.HTMLTemplateElement) {
          setInnerHTML(this.content, value);
        } else {
          unsafeUnwrap(this).innerHTML = value;
        }
        var addedNodes = snapshotNodeList(this.childNodes);
        enqueueMutation(this, "childList", {
          addedNodes: addedNodes,
          removedNodes: removedNodes
        });
        nodesWereRemoved(removedNodes);
        nodesWereAdded(addedNodes, this);
      },
      get outerHTML() {
        return getOuterHTML(this, this.parentNode);
      },
      set outerHTML(value) {
        var p = this.parentNode;
        if (p) {
          p.invalidateShadowRenderer();
          var df = frag(p, value);
          p.replaceChild(df, this);
        }
      },
      insertAdjacentHTML: function(position, text) {
        var contextElement, refNode;
        switch (String(position).toLowerCase()) {
         case "beforebegin":
          contextElement = this.parentNode;
          refNode = this;
          break;

         case "afterend":
          contextElement = this.parentNode;
          refNode = this.nextSibling;
          break;

         case "afterbegin":
          contextElement = this;
          refNode = this.firstChild;
          break;

         case "beforeend":
          contextElement = this;
          refNode = null;
          break;

         default:
          return;
        }
        var df = frag(contextElement, text);
        contextElement.insertBefore(df, refNode);
      },
      get hidden() {
        return this.hasAttribute("hidden");
      },
      set hidden(v) {
        if (v) {
          this.setAttribute("hidden", "");
        } else {
          this.removeAttribute("hidden");
        }
      }
    });
    function frag(contextElement, html) {
      var p = unwrap(contextElement.cloneNode(false));
      p.innerHTML = html;
      var df = unwrap(document.createDocumentFragment());
      var c;
      while (c = p.firstChild) {
        df.appendChild(c);
      }
      return wrap(df);
    }
    function getter(name) {
      return function() {
        scope.renderAllPending();
        return unsafeUnwrap(this)[name];
      };
    }
    function getterRequiresRendering(name) {
      defineGetter(HTMLElement, name, getter(name));
    }
    [ "clientHeight", "clientLeft", "clientTop", "clientWidth", "offsetHeight", "offsetLeft", "offsetTop", "offsetWidth", "scrollHeight", "scrollWidth" ].forEach(getterRequiresRendering);
    function getterAndSetterRequiresRendering(name) {
      Object.defineProperty(HTMLElement.prototype, name, {
        get: getter(name),
        set: function(v) {
          scope.renderAllPending();
          unsafeUnwrap(this)[name] = v;
        },
        configurable: true,
        enumerable: true
      });
    }
    [ "scrollLeft", "scrollTop" ].forEach(getterAndSetterRequiresRendering);
    function methodRequiresRendering(name) {
      Object.defineProperty(HTMLElement.prototype, name, {
        value: function() {
          scope.renderAllPending();
          return unsafeUnwrap(this)[name].apply(unsafeUnwrap(this), arguments);
        },
        configurable: true,
        enumerable: true
      });
    }
    [ "getBoundingClientRect", "getClientRects", "scrollIntoView" ].forEach(methodRequiresRendering);
    registerWrapper(OriginalHTMLElement, HTMLElement, document.createElement("b"));
    scope.wrappers.HTMLElement = HTMLElement;
    scope.getInnerHTML = getInnerHTML;
    scope.setInnerHTML = setInnerHTML;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var OriginalHTMLCanvasElement = window.HTMLCanvasElement;
    function HTMLCanvasElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLCanvasElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLCanvasElement.prototype, {
      getContext: function() {
        var context = unsafeUnwrap(this).getContext.apply(unsafeUnwrap(this), arguments);
        return context && wrap(context);
      }
    });
    registerWrapper(OriginalHTMLCanvasElement, HTMLCanvasElement, document.createElement("canvas"));
    scope.wrappers.HTMLCanvasElement = HTMLCanvasElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLContentElement = window.HTMLContentElement;
    function HTMLContentElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLContentElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLContentElement.prototype, {
      constructor: HTMLContentElement,
      get select() {
        return this.getAttribute("select");
      },
      set select(value) {
        this.setAttribute("select", value);
      },
      setAttribute: function(n, v) {
        HTMLElement.prototype.setAttribute.call(this, n, v);
        if (String(n).toLowerCase() === "select") this.invalidateShadowRenderer(true);
      }
    });
    if (OriginalHTMLContentElement) registerWrapper(OriginalHTMLContentElement, HTMLContentElement);
    scope.wrappers.HTMLContentElement = HTMLContentElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var unwrap = scope.unwrap;
    var OriginalHTMLFormElement = window.HTMLFormElement;
    function HTMLFormElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLFormElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLFormElement.prototype, {
      get elements() {
        return wrapHTMLCollection(unwrap(this).elements);
      }
    });
    registerWrapper(OriginalHTMLFormElement, HTMLFormElement, document.createElement("form"));
    scope.wrappers.HTMLFormElement = HTMLFormElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var rewrap = scope.rewrap;
    var OriginalHTMLImageElement = window.HTMLImageElement;
    function HTMLImageElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLImageElement.prototype = Object.create(HTMLElement.prototype);
    registerWrapper(OriginalHTMLImageElement, HTMLImageElement, document.createElement("img"));
    function Image(width, height) {
      if (!(this instanceof Image)) {
        throw new TypeError("DOM object constructor cannot be called as a function.");
      }
      var node = unwrap(document.createElement("img"));
      HTMLElement.call(this, node);
      rewrap(node, this);
      if (width !== undefined) node.width = width;
      if (height !== undefined) node.height = height;
    }
    Image.prototype = HTMLImageElement.prototype;
    scope.wrappers.HTMLImageElement = HTMLImageElement;
    scope.wrappers.Image = Image;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var NodeList = scope.wrappers.NodeList;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLShadowElement = window.HTMLShadowElement;
    function HTMLShadowElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLShadowElement.prototype = Object.create(HTMLElement.prototype);
    HTMLShadowElement.prototype.constructor = HTMLShadowElement;
    if (OriginalHTMLShadowElement) registerWrapper(OriginalHTMLShadowElement, HTMLShadowElement);
    scope.wrappers.HTMLShadowElement = HTMLShadowElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var contentTable = new WeakMap();
    var templateContentsOwnerTable = new WeakMap();
    function getTemplateContentsOwner(doc) {
      if (!doc.defaultView) return doc;
      var d = templateContentsOwnerTable.get(doc);
      if (!d) {
        d = doc.implementation.createHTMLDocument("");
        while (d.lastChild) {
          d.removeChild(d.lastChild);
        }
        templateContentsOwnerTable.set(doc, d);
      }
      return d;
    }
    function extractContent(templateElement) {
      var doc = getTemplateContentsOwner(templateElement.ownerDocument);
      var df = unwrap(doc.createDocumentFragment());
      var child;
      while (child = templateElement.firstChild) {
        df.appendChild(child);
      }
      return df;
    }
    var OriginalHTMLTemplateElement = window.HTMLTemplateElement;
    function HTMLTemplateElement(node) {
      HTMLElement.call(this, node);
      if (!OriginalHTMLTemplateElement) {
        var content = extractContent(node);
        contentTable.set(this, wrap(content));
      }
    }
    HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTemplateElement.prototype, {
      constructor: HTMLTemplateElement,
      get content() {
        if (OriginalHTMLTemplateElement) return wrap(unsafeUnwrap(this).content);
        return contentTable.get(this);
      }
    });
    if (OriginalHTMLTemplateElement) registerWrapper(OriginalHTMLTemplateElement, HTMLTemplateElement);
    scope.wrappers.HTMLTemplateElement = HTMLTemplateElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLMediaElement = window.HTMLMediaElement;
    if (!OriginalHTMLMediaElement) return;
    function HTMLMediaElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLMediaElement.prototype = Object.create(HTMLElement.prototype);
    registerWrapper(OriginalHTMLMediaElement, HTMLMediaElement, document.createElement("audio"));
    scope.wrappers.HTMLMediaElement = HTMLMediaElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLMediaElement = scope.wrappers.HTMLMediaElement;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var rewrap = scope.rewrap;
    var OriginalHTMLAudioElement = window.HTMLAudioElement;
    if (!OriginalHTMLAudioElement) return;
    function HTMLAudioElement(node) {
      HTMLMediaElement.call(this, node);
    }
    HTMLAudioElement.prototype = Object.create(HTMLMediaElement.prototype);
    registerWrapper(OriginalHTMLAudioElement, HTMLAudioElement, document.createElement("audio"));
    function Audio(src) {
      if (!(this instanceof Audio)) {
        throw new TypeError("DOM object constructor cannot be called as a function.");
      }
      var node = unwrap(document.createElement("audio"));
      HTMLMediaElement.call(this, node);
      rewrap(node, this);
      node.setAttribute("preload", "auto");
      if (src !== undefined) node.setAttribute("src", src);
    }
    Audio.prototype = HTMLAudioElement.prototype;
    scope.wrappers.HTMLAudioElement = HTMLAudioElement;
    scope.wrappers.Audio = Audio;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var rewrap = scope.rewrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLOptionElement = window.HTMLOptionElement;
    function trimText(s) {
      return s.replace(/\s+/g, " ").trim();
    }
    function HTMLOptionElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLOptionElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLOptionElement.prototype, {
      get text() {
        return trimText(this.textContent);
      },
      set text(value) {
        this.textContent = trimText(String(value));
      },
      get form() {
        return wrap(unwrap(this).form);
      }
    });
    registerWrapper(OriginalHTMLOptionElement, HTMLOptionElement, document.createElement("option"));
    function Option(text, value, defaultSelected, selected) {
      if (!(this instanceof Option)) {
        throw new TypeError("DOM object constructor cannot be called as a function.");
      }
      var node = unwrap(document.createElement("option"));
      HTMLElement.call(this, node);
      rewrap(node, this);
      if (text !== undefined) node.text = text;
      if (value !== undefined) node.setAttribute("value", value);
      if (defaultSelected === true) node.setAttribute("selected", "");
      node.selected = selected === true;
    }
    Option.prototype = HTMLOptionElement.prototype;
    scope.wrappers.HTMLOptionElement = HTMLOptionElement;
    scope.wrappers.Option = Option;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLSelectElement = window.HTMLSelectElement;
    function HTMLSelectElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLSelectElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLSelectElement.prototype, {
      add: function(element, before) {
        if (typeof before === "object") before = unwrap(before);
        unwrap(this).add(unwrap(element), before);
      },
      remove: function(indexOrNode) {
        if (indexOrNode === undefined) {
          HTMLElement.prototype.remove.call(this);
          return;
        }
        if (typeof indexOrNode === "object") indexOrNode = unwrap(indexOrNode);
        unwrap(this).remove(indexOrNode);
      },
      get form() {
        return wrap(unwrap(this).form);
      }
    });
    registerWrapper(OriginalHTMLSelectElement, HTMLSelectElement, document.createElement("select"));
    scope.wrappers.HTMLSelectElement = HTMLSelectElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var OriginalHTMLTableElement = window.HTMLTableElement;
    function HTMLTableElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLTableElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTableElement.prototype, {
      get caption() {
        return wrap(unwrap(this).caption);
      },
      createCaption: function() {
        return wrap(unwrap(this).createCaption());
      },
      get tHead() {
        return wrap(unwrap(this).tHead);
      },
      createTHead: function() {
        return wrap(unwrap(this).createTHead());
      },
      createTFoot: function() {
        return wrap(unwrap(this).createTFoot());
      },
      get tFoot() {
        return wrap(unwrap(this).tFoot);
      },
      get tBodies() {
        return wrapHTMLCollection(unwrap(this).tBodies);
      },
      createTBody: function() {
        return wrap(unwrap(this).createTBody());
      },
      get rows() {
        return wrapHTMLCollection(unwrap(this).rows);
      },
      insertRow: function(index) {
        return wrap(unwrap(this).insertRow(index));
      }
    });
    registerWrapper(OriginalHTMLTableElement, HTMLTableElement, document.createElement("table"));
    scope.wrappers.HTMLTableElement = HTMLTableElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLTableSectionElement = window.HTMLTableSectionElement;
    function HTMLTableSectionElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLTableSectionElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTableSectionElement.prototype, {
      constructor: HTMLTableSectionElement,
      get rows() {
        return wrapHTMLCollection(unwrap(this).rows);
      },
      insertRow: function(index) {
        return wrap(unwrap(this).insertRow(index));
      }
    });
    registerWrapper(OriginalHTMLTableSectionElement, HTMLTableSectionElement, document.createElement("thead"));
    scope.wrappers.HTMLTableSectionElement = HTMLTableSectionElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var wrapHTMLCollection = scope.wrapHTMLCollection;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalHTMLTableRowElement = window.HTMLTableRowElement;
    function HTMLTableRowElement(node) {
      HTMLElement.call(this, node);
    }
    HTMLTableRowElement.prototype = Object.create(HTMLElement.prototype);
    mixin(HTMLTableRowElement.prototype, {
      get cells() {
        return wrapHTMLCollection(unwrap(this).cells);
      },
      insertCell: function(index) {
        return wrap(unwrap(this).insertCell(index));
      }
    });
    registerWrapper(OriginalHTMLTableRowElement, HTMLTableRowElement, document.createElement("tr"));
    scope.wrappers.HTMLTableRowElement = HTMLTableRowElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLContentElement = scope.wrappers.HTMLContentElement;
    var HTMLElement = scope.wrappers.HTMLElement;
    var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
    var HTMLTemplateElement = scope.wrappers.HTMLTemplateElement;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var OriginalHTMLUnknownElement = window.HTMLUnknownElement;
    function HTMLUnknownElement(node) {
      switch (node.localName) {
       case "content":
        return new HTMLContentElement(node);

       case "shadow":
        return new HTMLShadowElement(node);

       case "template":
        return new HTMLTemplateElement(node);
      }
      HTMLElement.call(this, node);
    }
    HTMLUnknownElement.prototype = Object.create(HTMLElement.prototype);
    registerWrapper(OriginalHTMLUnknownElement, HTMLUnknownElement);
    scope.wrappers.HTMLUnknownElement = HTMLUnknownElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Element = scope.wrappers.Element;
    var HTMLElement = scope.wrappers.HTMLElement;
    var registerObject = scope.registerObject;
    var defineWrapGetter = scope.defineWrapGetter;
    var SVG_NS = "http://www.w3.org/2000/svg";
    var svgTitleElement = document.createElementNS(SVG_NS, "title");
    var SVGTitleElement = registerObject(svgTitleElement);
    var SVGElement = Object.getPrototypeOf(SVGTitleElement.prototype).constructor;
    if (!("classList" in svgTitleElement)) {
      var descr = Object.getOwnPropertyDescriptor(Element.prototype, "classList");
      Object.defineProperty(HTMLElement.prototype, "classList", descr);
      delete Element.prototype.classList;
    }
    defineWrapGetter(SVGElement, "ownerSVGElement");
    scope.wrappers.SVGElement = SVGElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var OriginalSVGUseElement = window.SVGUseElement;
    var SVG_NS = "http://www.w3.org/2000/svg";
    var gWrapper = wrap(document.createElementNS(SVG_NS, "g"));
    var useElement = document.createElementNS(SVG_NS, "use");
    var SVGGElement = gWrapper.constructor;
    var parentInterfacePrototype = Object.getPrototypeOf(SVGGElement.prototype);
    var parentInterface = parentInterfacePrototype.constructor;
    function SVGUseElement(impl) {
      parentInterface.call(this, impl);
    }
    SVGUseElement.prototype = Object.create(parentInterfacePrototype);
    if ("instanceRoot" in useElement) {
      mixin(SVGUseElement.prototype, {
        get instanceRoot() {
          return wrap(unwrap(this).instanceRoot);
        },
        get animatedInstanceRoot() {
          return wrap(unwrap(this).animatedInstanceRoot);
        }
      });
    }
    registerWrapper(OriginalSVGUseElement, SVGUseElement, useElement);
    scope.wrappers.SVGUseElement = SVGUseElement;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var EventTarget = scope.wrappers.EventTarget;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var wrap = scope.wrap;
    var OriginalSVGElementInstance = window.SVGElementInstance;
    if (!OriginalSVGElementInstance) return;
    function SVGElementInstance(impl) {
      EventTarget.call(this, impl);
    }
    SVGElementInstance.prototype = Object.create(EventTarget.prototype);
    mixin(SVGElementInstance.prototype, {
      get correspondingElement() {
        return wrap(unsafeUnwrap(this).correspondingElement);
      },
      get correspondingUseElement() {
        return wrap(unsafeUnwrap(this).correspondingUseElement);
      },
      get parentNode() {
        return wrap(unsafeUnwrap(this).parentNode);
      },
      get childNodes() {
        throw new Error("Not implemented");
      },
      get firstChild() {
        return wrap(unsafeUnwrap(this).firstChild);
      },
      get lastChild() {
        return wrap(unsafeUnwrap(this).lastChild);
      },
      get previousSibling() {
        return wrap(unsafeUnwrap(this).previousSibling);
      },
      get nextSibling() {
        return wrap(unsafeUnwrap(this).nextSibling);
      }
    });
    registerWrapper(OriginalSVGElementInstance, SVGElementInstance);
    scope.wrappers.SVGElementInstance = SVGElementInstance;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalCanvasRenderingContext2D = window.CanvasRenderingContext2D;
    function CanvasRenderingContext2D(impl) {
      setWrapper(impl, this);
    }
    mixin(CanvasRenderingContext2D.prototype, {
      get canvas() {
        return wrap(unsafeUnwrap(this).canvas);
      },
      drawImage: function() {
        arguments[0] = unwrapIfNeeded(arguments[0]);
        unsafeUnwrap(this).drawImage.apply(unsafeUnwrap(this), arguments);
      },
      createPattern: function() {
        arguments[0] = unwrap(arguments[0]);
        return unsafeUnwrap(this).createPattern.apply(unsafeUnwrap(this), arguments);
      }
    });
    registerWrapper(OriginalCanvasRenderingContext2D, CanvasRenderingContext2D, document.createElement("canvas").getContext("2d"));
    scope.wrappers.CanvasRenderingContext2D = CanvasRenderingContext2D;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalWebGLRenderingContext = window.WebGLRenderingContext;
    if (!OriginalWebGLRenderingContext) return;
    function WebGLRenderingContext(impl) {
      setWrapper(impl, this);
    }
    mixin(WebGLRenderingContext.prototype, {
      get canvas() {
        return wrap(unsafeUnwrap(this).canvas);
      },
      texImage2D: function() {
        arguments[5] = unwrapIfNeeded(arguments[5]);
        unsafeUnwrap(this).texImage2D.apply(unsafeUnwrap(this), arguments);
      },
      texSubImage2D: function() {
        arguments[6] = unwrapIfNeeded(arguments[6]);
        unsafeUnwrap(this).texSubImage2D.apply(unsafeUnwrap(this), arguments);
      }
    });
    var instanceProperties = /WebKit/.test(navigator.userAgent) ? {
      drawingBufferHeight: null,
      drawingBufferWidth: null
    } : {};
    registerWrapper(OriginalWebGLRenderingContext, WebGLRenderingContext, instanceProperties);
    scope.wrappers.WebGLRenderingContext = WebGLRenderingContext;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalRange = window.Range;
    function Range(impl) {
      setWrapper(impl, this);
    }
    Range.prototype = {
      get startContainer() {
        return wrap(unsafeUnwrap(this).startContainer);
      },
      get endContainer() {
        return wrap(unsafeUnwrap(this).endContainer);
      },
      get commonAncestorContainer() {
        return wrap(unsafeUnwrap(this).commonAncestorContainer);
      },
      setStart: function(refNode, offset) {
        unsafeUnwrap(this).setStart(unwrapIfNeeded(refNode), offset);
      },
      setEnd: function(refNode, offset) {
        unsafeUnwrap(this).setEnd(unwrapIfNeeded(refNode), offset);
      },
      setStartBefore: function(refNode) {
        unsafeUnwrap(this).setStartBefore(unwrapIfNeeded(refNode));
      },
      setStartAfter: function(refNode) {
        unsafeUnwrap(this).setStartAfter(unwrapIfNeeded(refNode));
      },
      setEndBefore: function(refNode) {
        unsafeUnwrap(this).setEndBefore(unwrapIfNeeded(refNode));
      },
      setEndAfter: function(refNode) {
        unsafeUnwrap(this).setEndAfter(unwrapIfNeeded(refNode));
      },
      selectNode: function(refNode) {
        unsafeUnwrap(this).selectNode(unwrapIfNeeded(refNode));
      },
      selectNodeContents: function(refNode) {
        unsafeUnwrap(this).selectNodeContents(unwrapIfNeeded(refNode));
      },
      compareBoundaryPoints: function(how, sourceRange) {
        return unsafeUnwrap(this).compareBoundaryPoints(how, unwrap(sourceRange));
      },
      extractContents: function() {
        return wrap(unsafeUnwrap(this).extractContents());
      },
      cloneContents: function() {
        return wrap(unsafeUnwrap(this).cloneContents());
      },
      insertNode: function(node) {
        unsafeUnwrap(this).insertNode(unwrapIfNeeded(node));
      },
      surroundContents: function(newParent) {
        unsafeUnwrap(this).surroundContents(unwrapIfNeeded(newParent));
      },
      cloneRange: function() {
        return wrap(unsafeUnwrap(this).cloneRange());
      },
      isPointInRange: function(node, offset) {
        return unsafeUnwrap(this).isPointInRange(unwrapIfNeeded(node), offset);
      },
      comparePoint: function(node, offset) {
        return unsafeUnwrap(this).comparePoint(unwrapIfNeeded(node), offset);
      },
      intersectsNode: function(node) {
        return unsafeUnwrap(this).intersectsNode(unwrapIfNeeded(node));
      },
      toString: function() {
        return unsafeUnwrap(this).toString();
      }
    };
    if (OriginalRange.prototype.createContextualFragment) {
      Range.prototype.createContextualFragment = function(html) {
        return wrap(unsafeUnwrap(this).createContextualFragment(html));
      };
    }
    registerWrapper(window.Range, Range, document.createRange());
    scope.wrappers.Range = Range;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var GetElementsByInterface = scope.GetElementsByInterface;
    var ParentNodeInterface = scope.ParentNodeInterface;
    var SelectorsInterface = scope.SelectorsInterface;
    var mixin = scope.mixin;
    var registerObject = scope.registerObject;
    var DocumentFragment = registerObject(document.createDocumentFragment());
    mixin(DocumentFragment.prototype, ParentNodeInterface);
    mixin(DocumentFragment.prototype, SelectorsInterface);
    mixin(DocumentFragment.prototype, GetElementsByInterface);
    var Comment = registerObject(document.createComment(""));
    scope.wrappers.Comment = Comment;
    scope.wrappers.DocumentFragment = DocumentFragment;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var DocumentFragment = scope.wrappers.DocumentFragment;
    var TreeScope = scope.TreeScope;
    var elementFromPoint = scope.elementFromPoint;
    var getInnerHTML = scope.getInnerHTML;
    var getTreeScope = scope.getTreeScope;
    var mixin = scope.mixin;
    var rewrap = scope.rewrap;
    var setInnerHTML = scope.setInnerHTML;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var shadowHostTable = new WeakMap();
    var nextOlderShadowTreeTable = new WeakMap();
    var spaceCharRe = /[ \t\n\r\f]/;
    function ShadowRoot(hostWrapper) {
      var node = unwrap(unsafeUnwrap(hostWrapper).ownerDocument.createDocumentFragment());
      DocumentFragment.call(this, node);
      rewrap(node, this);
      var oldShadowRoot = hostWrapper.shadowRoot;
      nextOlderShadowTreeTable.set(this, oldShadowRoot);
      this.treeScope_ = new TreeScope(this, getTreeScope(oldShadowRoot || hostWrapper));
      shadowHostTable.set(this, hostWrapper);
    }
    ShadowRoot.prototype = Object.create(DocumentFragment.prototype);
    mixin(ShadowRoot.prototype, {
      constructor: ShadowRoot,
      get innerHTML() {
        return getInnerHTML(this);
      },
      set innerHTML(value) {
        setInnerHTML(this, value);
        this.invalidateShadowRenderer();
      },
      get olderShadowRoot() {
        return nextOlderShadowTreeTable.get(this) || null;
      },
      get host() {
        return shadowHostTable.get(this) || null;
      },
      invalidateShadowRenderer: function() {
        return shadowHostTable.get(this).invalidateShadowRenderer();
      },
      elementFromPoint: function(x, y) {
        return elementFromPoint(this, this.ownerDocument, x, y);
      },
      getElementById: function(id) {
        if (spaceCharRe.test(id)) return null;
        return this.querySelector('[id="' + id + '"]');
      }
    });
    scope.wrappers.ShadowRoot = ShadowRoot;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var Element = scope.wrappers.Element;
    var HTMLContentElement = scope.wrappers.HTMLContentElement;
    var HTMLShadowElement = scope.wrappers.HTMLShadowElement;
    var Node = scope.wrappers.Node;
    var ShadowRoot = scope.wrappers.ShadowRoot;
    var assert = scope.assert;
    var getTreeScope = scope.getTreeScope;
    var mixin = scope.mixin;
    var oneOf = scope.oneOf;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var ArraySplice = scope.ArraySplice;
    function updateWrapperUpAndSideways(wrapper) {
      wrapper.previousSibling_ = wrapper.previousSibling;
      wrapper.nextSibling_ = wrapper.nextSibling;
      wrapper.parentNode_ = wrapper.parentNode;
    }
    function updateWrapperDown(wrapper) {
      wrapper.firstChild_ = wrapper.firstChild;
      wrapper.lastChild_ = wrapper.lastChild;
    }
    function updateAllChildNodes(parentNodeWrapper) {
      assert(parentNodeWrapper instanceof Node);
      for (var childWrapper = parentNodeWrapper.firstChild; childWrapper; childWrapper = childWrapper.nextSibling) {
        updateWrapperUpAndSideways(childWrapper);
      }
      updateWrapperDown(parentNodeWrapper);
    }
    function insertBefore(parentNodeWrapper, newChildWrapper, refChildWrapper) {
      var parentNode = unwrap(parentNodeWrapper);
      var newChild = unwrap(newChildWrapper);
      var refChild = refChildWrapper ? unwrap(refChildWrapper) : null;
      remove(newChildWrapper);
      updateWrapperUpAndSideways(newChildWrapper);
      if (!refChildWrapper) {
        parentNodeWrapper.lastChild_ = parentNodeWrapper.lastChild;
        if (parentNodeWrapper.lastChild === parentNodeWrapper.firstChild) parentNodeWrapper.firstChild_ = parentNodeWrapper.firstChild;
        var lastChildWrapper = wrap(parentNode.lastChild);
        if (lastChildWrapper) lastChildWrapper.nextSibling_ = lastChildWrapper.nextSibling;
      } else {
        if (parentNodeWrapper.firstChild === refChildWrapper) parentNodeWrapper.firstChild_ = refChildWrapper;
        refChildWrapper.previousSibling_ = refChildWrapper.previousSibling;
      }
      scope.originalInsertBefore.call(parentNode, newChild, refChild);
    }
    function remove(nodeWrapper) {
      var node = unwrap(nodeWrapper);
      var parentNode = node.parentNode;
      if (!parentNode) return;
      var parentNodeWrapper = wrap(parentNode);
      updateWrapperUpAndSideways(nodeWrapper);
      if (nodeWrapper.previousSibling) nodeWrapper.previousSibling.nextSibling_ = nodeWrapper;
      if (nodeWrapper.nextSibling) nodeWrapper.nextSibling.previousSibling_ = nodeWrapper;
      if (parentNodeWrapper.lastChild === nodeWrapper) parentNodeWrapper.lastChild_ = nodeWrapper;
      if (parentNodeWrapper.firstChild === nodeWrapper) parentNodeWrapper.firstChild_ = nodeWrapper;
      scope.originalRemoveChild.call(parentNode, node);
    }
    var distributedNodesTable = new WeakMap();
    var destinationInsertionPointsTable = new WeakMap();
    var rendererForHostTable = new WeakMap();
    function resetDistributedNodes(insertionPoint) {
      distributedNodesTable.set(insertionPoint, []);
    }
    function getDistributedNodes(insertionPoint) {
      var rv = distributedNodesTable.get(insertionPoint);
      if (!rv) distributedNodesTable.set(insertionPoint, rv = []);
      return rv;
    }
    function getChildNodesSnapshot(node) {
      var result = [], i = 0;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        result[i++] = child;
      }
      return result;
    }
    var request = oneOf(window, [ "requestAnimationFrame", "mozRequestAnimationFrame", "webkitRequestAnimationFrame", "setTimeout" ]);
    var pendingDirtyRenderers = [];
    var renderTimer;
    function renderAllPending() {
      for (var i = 0; i < pendingDirtyRenderers.length; i++) {
        var renderer = pendingDirtyRenderers[i];
        var parentRenderer = renderer.parentRenderer;
        if (parentRenderer && parentRenderer.dirty) continue;
        renderer.render();
      }
      pendingDirtyRenderers = [];
    }
    function handleRequestAnimationFrame() {
      renderTimer = null;
      renderAllPending();
    }
    function getRendererForHost(host) {
      var renderer = rendererForHostTable.get(host);
      if (!renderer) {
        renderer = new ShadowRenderer(host);
        rendererForHostTable.set(host, renderer);
      }
      return renderer;
    }
    function getShadowRootAncestor(node) {
      var root = getTreeScope(node).root;
      if (root instanceof ShadowRoot) return root;
      return null;
    }
    function getRendererForShadowRoot(shadowRoot) {
      return getRendererForHost(shadowRoot.host);
    }
    var spliceDiff = new ArraySplice();
    spliceDiff.equals = function(renderNode, rawNode) {
      return unwrap(renderNode.node) === rawNode;
    };
    function RenderNode(node) {
      this.skip = false;
      this.node = node;
      this.childNodes = [];
    }
    RenderNode.prototype = {
      append: function(node) {
        var rv = new RenderNode(node);
        this.childNodes.push(rv);
        return rv;
      },
      sync: function(opt_added) {
        if (this.skip) return;
        var nodeWrapper = this.node;
        var newChildren = this.childNodes;
        var oldChildren = getChildNodesSnapshot(unwrap(nodeWrapper));
        var added = opt_added || new WeakMap();
        var splices = spliceDiff.calculateSplices(newChildren, oldChildren);
        var newIndex = 0, oldIndex = 0;
        var lastIndex = 0;
        for (var i = 0; i < splices.length; i++) {
          var splice = splices[i];
          for (;lastIndex < splice.index; lastIndex++) {
            oldIndex++;
            newChildren[newIndex++].sync(added);
          }
          var removedCount = splice.removed.length;
          for (var j = 0; j < removedCount; j++) {
            var wrapper = wrap(oldChildren[oldIndex++]);
            if (!added.get(wrapper)) remove(wrapper);
          }
          var addedCount = splice.addedCount;
          var refNode = oldChildren[oldIndex] && wrap(oldChildren[oldIndex]);
          for (var j = 0; j < addedCount; j++) {
            var newChildRenderNode = newChildren[newIndex++];
            var newChildWrapper = newChildRenderNode.node;
            insertBefore(nodeWrapper, newChildWrapper, refNode);
            added.set(newChildWrapper, true);
            newChildRenderNode.sync(added);
          }
          lastIndex += addedCount;
        }
        for (var i = lastIndex; i < newChildren.length; i++) {
          newChildren[i].sync(added);
        }
      }
    };
    function ShadowRenderer(host) {
      this.host = host;
      this.dirty = false;
      this.invalidateAttributes();
      this.associateNode(host);
    }
    ShadowRenderer.prototype = {
      render: function(opt_renderNode) {
        if (!this.dirty) return;
        this.invalidateAttributes();
        var host = this.host;
        this.distribution(host);
        var renderNode = opt_renderNode || new RenderNode(host);
        this.buildRenderTree(renderNode, host);
        var topMostRenderer = !opt_renderNode;
        if (topMostRenderer) renderNode.sync();
        this.dirty = false;
      },
      get parentRenderer() {
        return getTreeScope(this.host).renderer;
      },
      invalidate: function() {
        if (!this.dirty) {
          this.dirty = true;
          var parentRenderer = this.parentRenderer;
          if (parentRenderer) parentRenderer.invalidate();
          pendingDirtyRenderers.push(this);
          if (renderTimer) return;
          renderTimer = window[request](handleRequestAnimationFrame, 0);
        }
      },
      distribution: function(root) {
        this.resetAllSubtrees(root);
        this.distributionResolution(root);
      },
      resetAll: function(node) {
        if (isInsertionPoint(node)) resetDistributedNodes(node); else resetDestinationInsertionPoints(node);
        this.resetAllSubtrees(node);
      },
      resetAllSubtrees: function(node) {
        for (var child = node.firstChild; child; child = child.nextSibling) {
          this.resetAll(child);
        }
        if (node.shadowRoot) this.resetAll(node.shadowRoot);
        if (node.olderShadowRoot) this.resetAll(node.olderShadowRoot);
      },
      distributionResolution: function(node) {
        if (isShadowHost(node)) {
          var shadowHost = node;
          var pool = poolPopulation(shadowHost);
          var shadowTrees = getShadowTrees(shadowHost);
          for (var i = 0; i < shadowTrees.length; i++) {
            this.poolDistribution(shadowTrees[i], pool);
          }
          for (var i = shadowTrees.length - 1; i >= 0; i--) {
            var shadowTree = shadowTrees[i];
            var shadow = getShadowInsertionPoint(shadowTree);
            if (shadow) {
              var olderShadowRoot = shadowTree.olderShadowRoot;
              if (olderShadowRoot) {
                pool = poolPopulation(olderShadowRoot);
              }
              for (var j = 0; j < pool.length; j++) {
                destributeNodeInto(pool[j], shadow);
              }
            }
            this.distributionResolution(shadowTree);
          }
        }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          this.distributionResolution(child);
        }
      },
      poolDistribution: function(node, pool) {
        if (node instanceof HTMLShadowElement) return;
        if (node instanceof HTMLContentElement) {
          var content = node;
          this.updateDependentAttributes(content.getAttribute("select"));
          var anyDistributed = false;
          for (var i = 0; i < pool.length; i++) {
            var node = pool[i];
            if (!node) continue;
            if (matches(node, content)) {
              destributeNodeInto(node, content);
              pool[i] = undefined;
              anyDistributed = true;
            }
          }
          if (!anyDistributed) {
            for (var child = content.firstChild; child; child = child.nextSibling) {
              destributeNodeInto(child, content);
            }
          }
          return;
        }
        for (var child = node.firstChild; child; child = child.nextSibling) {
          this.poolDistribution(child, pool);
        }
      },
      buildRenderTree: function(renderNode, node) {
        var children = this.compose(node);
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var childRenderNode = renderNode.append(child);
          this.buildRenderTree(childRenderNode, child);
        }
        if (isShadowHost(node)) {
          var renderer = getRendererForHost(node);
          renderer.dirty = false;
        }
      },
      compose: function(node) {
        var children = [];
        var p = node.shadowRoot || node;
        for (var child = p.firstChild; child; child = child.nextSibling) {
          if (isInsertionPoint(child)) {
            this.associateNode(p);
            var distributedNodes = getDistributedNodes(child);
            for (var j = 0; j < distributedNodes.length; j++) {
              var distributedNode = distributedNodes[j];
              if (isFinalDestination(child, distributedNode)) children.push(distributedNode);
            }
          } else {
            children.push(child);
          }
        }
        return children;
      },
      invalidateAttributes: function() {
        this.attributes = Object.create(null);
      },
      updateDependentAttributes: function(selector) {
        if (!selector) return;
        var attributes = this.attributes;
        if (/\.\w+/.test(selector)) attributes["class"] = true;
        if (/#\w+/.test(selector)) attributes["id"] = true;
        selector.replace(/\[\s*([^\s=\|~\]]+)/g, function(_, name) {
          attributes[name] = true;
        });
      },
      dependsOnAttribute: function(name) {
        return this.attributes[name];
      },
      associateNode: function(node) {
        unsafeUnwrap(node).polymerShadowRenderer_ = this;
      }
    };
    function poolPopulation(node) {
      var pool = [];
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (isInsertionPoint(child)) {
          pool.push.apply(pool, getDistributedNodes(child));
        } else {
          pool.push(child);
        }
      }
      return pool;
    }
    function getShadowInsertionPoint(node) {
      if (node instanceof HTMLShadowElement) return node;
      if (node instanceof HTMLContentElement) return null;
      for (var child = node.firstChild; child; child = child.nextSibling) {
        var res = getShadowInsertionPoint(child);
        if (res) return res;
      }
      return null;
    }
    function destributeNodeInto(child, insertionPoint) {
      getDistributedNodes(insertionPoint).push(child);
      var points = destinationInsertionPointsTable.get(child);
      if (!points) destinationInsertionPointsTable.set(child, [ insertionPoint ]); else points.push(insertionPoint);
    }
    function getDestinationInsertionPoints(node) {
      return destinationInsertionPointsTable.get(node);
    }
    function resetDestinationInsertionPoints(node) {
      destinationInsertionPointsTable.set(node, undefined);
    }
    var selectorStartCharRe = /^(:not\()?[*.#[a-zA-Z_|]/;
    function matches(node, contentElement) {
      var select = contentElement.getAttribute("select");
      if (!select) return true;
      select = select.trim();
      if (!select) return true;
      if (!(node instanceof Element)) return false;
      if (!selectorStartCharRe.test(select)) return false;
      try {
        return node.matches(select);
      } catch (ex) {
        return false;
      }
    }
    function isFinalDestination(insertionPoint, node) {
      var points = getDestinationInsertionPoints(node);
      return points && points[points.length - 1] === insertionPoint;
    }
    function isInsertionPoint(node) {
      return node instanceof HTMLContentElement || node instanceof HTMLShadowElement;
    }
    function isShadowHost(shadowHost) {
      return shadowHost.shadowRoot;
    }
    function getShadowTrees(host) {
      var trees = [];
      for (var tree = host.shadowRoot; tree; tree = tree.olderShadowRoot) {
        trees.push(tree);
      }
      return trees;
    }
    function render(host) {
      new ShadowRenderer(host).render();
    }
    Node.prototype.invalidateShadowRenderer = function(force) {
      var renderer = unsafeUnwrap(this).polymerShadowRenderer_;
      if (renderer) {
        renderer.invalidate();
        return true;
      }
      return false;
    };
    HTMLContentElement.prototype.getDistributedNodes = HTMLShadowElement.prototype.getDistributedNodes = function() {
      renderAllPending();
      return getDistributedNodes(this);
    };
    Element.prototype.getDestinationInsertionPoints = function() {
      renderAllPending();
      return getDestinationInsertionPoints(this) || [];
    };
    HTMLContentElement.prototype.nodeIsInserted_ = HTMLShadowElement.prototype.nodeIsInserted_ = function() {
      this.invalidateShadowRenderer();
      var shadowRoot = getShadowRootAncestor(this);
      var renderer;
      if (shadowRoot) renderer = getRendererForShadowRoot(shadowRoot);
      unsafeUnwrap(this).polymerShadowRenderer_ = renderer;
      if (renderer) renderer.invalidate();
    };
    scope.getRendererForHost = getRendererForHost;
    scope.getShadowTrees = getShadowTrees;
    scope.renderAllPending = renderAllPending;
    scope.getDestinationInsertionPoints = getDestinationInsertionPoints;
    scope.visual = {
      insertBefore: insertBefore,
      remove: remove
    };
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var HTMLElement = scope.wrappers.HTMLElement;
    var assert = scope.assert;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var elementsWithFormProperty = [ "HTMLButtonElement", "HTMLFieldSetElement", "HTMLInputElement", "HTMLKeygenElement", "HTMLLabelElement", "HTMLLegendElement", "HTMLObjectElement", "HTMLOutputElement", "HTMLTextAreaElement" ];
    function createWrapperConstructor(name) {
      if (!window[name]) return;
      assert(!scope.wrappers[name]);
      var GeneratedWrapper = function(node) {
        HTMLElement.call(this, node);
      };
      GeneratedWrapper.prototype = Object.create(HTMLElement.prototype);
      mixin(GeneratedWrapper.prototype, {
        get form() {
          return wrap(unwrap(this).form);
        }
      });
      registerWrapper(window[name], GeneratedWrapper, document.createElement(name.slice(4, -7)));
      scope.wrappers[name] = GeneratedWrapper;
    }
    elementsWithFormProperty.forEach(createWrapperConstructor);
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalSelection = window.Selection;
    function Selection(impl) {
      setWrapper(impl, this);
    }
    Selection.prototype = {
      get anchorNode() {
        return wrap(unsafeUnwrap(this).anchorNode);
      },
      get focusNode() {
        return wrap(unsafeUnwrap(this).focusNode);
      },
      addRange: function(range) {
        unsafeUnwrap(this).addRange(unwrap(range));
      },
      collapse: function(node, index) {
        unsafeUnwrap(this).collapse(unwrapIfNeeded(node), index);
      },
      containsNode: function(node, allowPartial) {
        return unsafeUnwrap(this).containsNode(unwrapIfNeeded(node), allowPartial);
      },
      extend: function(node, offset) {
        unsafeUnwrap(this).extend(unwrapIfNeeded(node), offset);
      },
      getRangeAt: function(index) {
        return wrap(unsafeUnwrap(this).getRangeAt(index));
      },
      removeRange: function(range) {
        unsafeUnwrap(this).removeRange(unwrap(range));
      },
      selectAllChildren: function(node) {
        unsafeUnwrap(this).selectAllChildren(unwrapIfNeeded(node));
      },
      toString: function() {
        return unsafeUnwrap(this).toString();
      }
    };
    registerWrapper(window.Selection, Selection, window.getSelection());
    scope.wrappers.Selection = Selection;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var GetElementsByInterface = scope.GetElementsByInterface;
    var Node = scope.wrappers.Node;
    var ParentNodeInterface = scope.ParentNodeInterface;
    var Selection = scope.wrappers.Selection;
    var SelectorsInterface = scope.SelectorsInterface;
    var ShadowRoot = scope.wrappers.ShadowRoot;
    var TreeScope = scope.TreeScope;
    var cloneNode = scope.cloneNode;
    var defineWrapGetter = scope.defineWrapGetter;
    var elementFromPoint = scope.elementFromPoint;
    var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
    var matchesNames = scope.matchesNames;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var renderAllPending = scope.renderAllPending;
    var rewrap = scope.rewrap;
    var setWrapper = scope.setWrapper;
    var unsafeUnwrap = scope.unsafeUnwrap;
    var unwrap = scope.unwrap;
    var wrap = scope.wrap;
    var wrapEventTargetMethods = scope.wrapEventTargetMethods;
    var wrapNodeList = scope.wrapNodeList;
    var implementationTable = new WeakMap();
    function Document(node) {
      Node.call(this, node);
      this.treeScope_ = new TreeScope(this, null);
    }
    Document.prototype = Object.create(Node.prototype);
    defineWrapGetter(Document, "documentElement");
    defineWrapGetter(Document, "body");
    defineWrapGetter(Document, "head");
    function wrapMethod(name) {
      var original = document[name];
      Document.prototype[name] = function() {
        return wrap(original.apply(unsafeUnwrap(this), arguments));
      };
    }
    [ "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "getElementById" ].forEach(wrapMethod);
    var originalAdoptNode = document.adoptNode;
    function adoptNodeNoRemove(node, doc) {
      originalAdoptNode.call(unsafeUnwrap(doc), unwrap(node));
      adoptSubtree(node, doc);
    }
    function adoptSubtree(node, doc) {
      if (node.shadowRoot) doc.adoptNode(node.shadowRoot);
      if (node instanceof ShadowRoot) adoptOlderShadowRoots(node, doc);
      for (var child = node.firstChild; child; child = child.nextSibling) {
        adoptSubtree(child, doc);
      }
    }
    function adoptOlderShadowRoots(shadowRoot, doc) {
      var oldShadowRoot = shadowRoot.olderShadowRoot;
      if (oldShadowRoot) doc.adoptNode(oldShadowRoot);
    }
    var originalGetSelection = document.getSelection;
    mixin(Document.prototype, {
      adoptNode: function(node) {
        if (node.parentNode) node.parentNode.removeChild(node);
        adoptNodeNoRemove(node, this);
        return node;
      },
      elementFromPoint: function(x, y) {
        return elementFromPoint(this, this, x, y);
      },
      importNode: function(node, deep) {
        return cloneNode(node, deep, unsafeUnwrap(this));
      },
      getSelection: function() {
        renderAllPending();
        return new Selection(originalGetSelection.call(unwrap(this)));
      },
      getElementsByName: function(name) {
        return SelectorsInterface.querySelectorAll.call(this, "[name=" + JSON.stringify(String(name)) + "]");
      }
    });
    if (document.registerElement) {
      var originalRegisterElement = document.registerElement;
      Document.prototype.registerElement = function(tagName, object) {
        var prototype, extendsOption;
        if (object !== undefined) {
          prototype = object.prototype;
          extendsOption = object.extends;
        }
        if (!prototype) prototype = Object.create(HTMLElement.prototype);
        if (scope.nativePrototypeTable.get(prototype)) {
          throw new Error("NotSupportedError");
        }
        var proto = Object.getPrototypeOf(prototype);
        var nativePrototype;
        var prototypes = [];
        while (proto) {
          nativePrototype = scope.nativePrototypeTable.get(proto);
          if (nativePrototype) break;
          prototypes.push(proto);
          proto = Object.getPrototypeOf(proto);
        }
        if (!nativePrototype) {
          throw new Error("NotSupportedError");
        }
        var newPrototype = Object.create(nativePrototype);
        for (var i = prototypes.length - 1; i >= 0; i--) {
          newPrototype = Object.create(newPrototype);
        }
        [ "createdCallback", "attachedCallback", "detachedCallback", "attributeChangedCallback" ].forEach(function(name) {
          var f = prototype[name];
          if (!f) return;
          newPrototype[name] = function() {
            if (!(wrap(this) instanceof CustomElementConstructor)) {
              rewrap(this);
            }
            f.apply(wrap(this), arguments);
          };
        });
        var p = {
          prototype: newPrototype
        };
        if (extendsOption) p.extends = extendsOption;
        function CustomElementConstructor(node) {
          if (!node) {
            if (extendsOption) {
              return document.createElement(extendsOption, tagName);
            } else {
              return document.createElement(tagName);
            }
          }
          setWrapper(node, this);
        }
        CustomElementConstructor.prototype = prototype;
        CustomElementConstructor.prototype.constructor = CustomElementConstructor;
        scope.constructorTable.set(newPrototype, CustomElementConstructor);
        scope.nativePrototypeTable.set(prototype, newPrototype);
        var nativeConstructor = originalRegisterElement.call(unwrap(this), tagName, p);
        return CustomElementConstructor;
      };
      forwardMethodsToWrapper([ window.HTMLDocument || window.Document ], [ "registerElement" ]);
    }
    forwardMethodsToWrapper([ window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement, window.HTMLHtmlElement ], [ "appendChild", "compareDocumentPosition", "contains", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "insertBefore", "querySelector", "querySelectorAll", "removeChild", "replaceChild" ]);
    forwardMethodsToWrapper([ window.HTMLBodyElement, window.HTMLHeadElement, window.HTMLHtmlElement ], matchesNames);
    forwardMethodsToWrapper([ window.HTMLDocument || window.Document ], [ "adoptNode", "importNode", "contains", "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "elementFromPoint", "getElementById", "getElementsByName", "getSelection" ]);
    mixin(Document.prototype, GetElementsByInterface);
    mixin(Document.prototype, ParentNodeInterface);
    mixin(Document.prototype, SelectorsInterface);
    mixin(Document.prototype, {
      get implementation() {
        var implementation = implementationTable.get(this);
        if (implementation) return implementation;
        implementation = new DOMImplementation(unwrap(this).implementation);
        implementationTable.set(this, implementation);
        return implementation;
      },
      get defaultView() {
        return wrap(unwrap(this).defaultView);
      }
    });
    registerWrapper(window.Document, Document, document.implementation.createHTMLDocument(""));
    if (window.HTMLDocument) registerWrapper(window.HTMLDocument, Document);
    wrapEventTargetMethods([ window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement ]);
    function DOMImplementation(impl) {
      setWrapper(impl, this);
    }
    function wrapImplMethod(constructor, name) {
      var original = document.implementation[name];
      constructor.prototype[name] = function() {
        return wrap(original.apply(unsafeUnwrap(this), arguments));
      };
    }
    function forwardImplMethod(constructor, name) {
      var original = document.implementation[name];
      constructor.prototype[name] = function() {
        return original.apply(unsafeUnwrap(this), arguments);
      };
    }
    wrapImplMethod(DOMImplementation, "createDocumentType");
    wrapImplMethod(DOMImplementation, "createDocument");
    wrapImplMethod(DOMImplementation, "createHTMLDocument");
    forwardImplMethod(DOMImplementation, "hasFeature");
    registerWrapper(window.DOMImplementation, DOMImplementation);
    forwardMethodsToWrapper([ window.DOMImplementation ], [ "createDocumentType", "createDocument", "createHTMLDocument", "hasFeature" ]);
    scope.adoptNodeNoRemove = adoptNodeNoRemove;
    scope.wrappers.DOMImplementation = DOMImplementation;
    scope.wrappers.Document = Document;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var EventTarget = scope.wrappers.EventTarget;
    var Selection = scope.wrappers.Selection;
    var mixin = scope.mixin;
    var registerWrapper = scope.registerWrapper;
    var renderAllPending = scope.renderAllPending;
    var unwrap = scope.unwrap;
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var wrap = scope.wrap;
    var OriginalWindow = window.Window;
    var originalGetComputedStyle = window.getComputedStyle;
    var originalGetDefaultComputedStyle = window.getDefaultComputedStyle;
    var originalGetSelection = window.getSelection;
    function Window(impl) {
      EventTarget.call(this, impl);
    }
    Window.prototype = Object.create(EventTarget.prototype);
    OriginalWindow.prototype.getComputedStyle = function(el, pseudo) {
      return wrap(this || window).getComputedStyle(unwrapIfNeeded(el), pseudo);
    };
    if (originalGetDefaultComputedStyle) {
      OriginalWindow.prototype.getDefaultComputedStyle = function(el, pseudo) {
        return wrap(this || window).getDefaultComputedStyle(unwrapIfNeeded(el), pseudo);
      };
    }
    OriginalWindow.prototype.getSelection = function() {
      return wrap(this || window).getSelection();
    };
    delete window.getComputedStyle;
    delete window.getDefaultComputedStyle;
    delete window.getSelection;
    [ "addEventListener", "removeEventListener", "dispatchEvent" ].forEach(function(name) {
      OriginalWindow.prototype[name] = function() {
        var w = wrap(this || window);
        return w[name].apply(w, arguments);
      };
      delete window[name];
    });
    mixin(Window.prototype, {
      getComputedStyle: function(el, pseudo) {
        renderAllPending();
        return originalGetComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);
      },
      getSelection: function() {
        renderAllPending();
        return new Selection(originalGetSelection.call(unwrap(this)));
      },
      get document() {
        return wrap(unwrap(this).document);
      }
    });
    if (originalGetDefaultComputedStyle) {
      Window.prototype.getDefaultComputedStyle = function(el, pseudo) {
        renderAllPending();
        return originalGetDefaultComputedStyle.call(unwrap(this), unwrapIfNeeded(el), pseudo);
      };
    }
    registerWrapper(OriginalWindow, Window, window);
    scope.wrappers.Window = Window;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var unwrap = scope.unwrap;
    var OriginalDataTransfer = window.DataTransfer || window.Clipboard;
    var OriginalDataTransferSetDragImage = OriginalDataTransfer.prototype.setDragImage;
    if (OriginalDataTransferSetDragImage) {
      OriginalDataTransfer.prototype.setDragImage = function(image, x, y) {
        OriginalDataTransferSetDragImage.call(this, unwrap(image), x, y);
      };
    }
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var registerWrapper = scope.registerWrapper;
    var setWrapper = scope.setWrapper;
    var unwrap = scope.unwrap;
    var OriginalFormData = window.FormData;
    if (!OriginalFormData) return;
    function FormData(formElement) {
      var impl;
      if (formElement instanceof OriginalFormData) {
        impl = formElement;
      } else {
        impl = new OriginalFormData(formElement && unwrap(formElement));
      }
      setWrapper(impl, this);
    }
    registerWrapper(OriginalFormData, FormData, new OriginalFormData());
    scope.wrappers.FormData = FormData;
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var unwrapIfNeeded = scope.unwrapIfNeeded;
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(obj) {
      return originalSend.call(this, unwrapIfNeeded(obj));
    };
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    "use strict";
    var isWrapperFor = scope.isWrapperFor;
    var elements = {
      a: "HTMLAnchorElement",
      area: "HTMLAreaElement",
      audio: "HTMLAudioElement",
      base: "HTMLBaseElement",
      body: "HTMLBodyElement",
      br: "HTMLBRElement",
      button: "HTMLButtonElement",
      canvas: "HTMLCanvasElement",
      caption: "HTMLTableCaptionElement",
      col: "HTMLTableColElement",
      content: "HTMLContentElement",
      data: "HTMLDataElement",
      datalist: "HTMLDataListElement",
      del: "HTMLModElement",
      dir: "HTMLDirectoryElement",
      div: "HTMLDivElement",
      dl: "HTMLDListElement",
      embed: "HTMLEmbedElement",
      fieldset: "HTMLFieldSetElement",
      font: "HTMLFontElement",
      form: "HTMLFormElement",
      frame: "HTMLFrameElement",
      frameset: "HTMLFrameSetElement",
      h1: "HTMLHeadingElement",
      head: "HTMLHeadElement",
      hr: "HTMLHRElement",
      html: "HTMLHtmlElement",
      iframe: "HTMLIFrameElement",
      img: "HTMLImageElement",
      input: "HTMLInputElement",
      keygen: "HTMLKeygenElement",
      label: "HTMLLabelElement",
      legend: "HTMLLegendElement",
      li: "HTMLLIElement",
      link: "HTMLLinkElement",
      map: "HTMLMapElement",
      marquee: "HTMLMarqueeElement",
      menu: "HTMLMenuElement",
      menuitem: "HTMLMenuItemElement",
      meta: "HTMLMetaElement",
      meter: "HTMLMeterElement",
      object: "HTMLObjectElement",
      ol: "HTMLOListElement",
      optgroup: "HTMLOptGroupElement",
      option: "HTMLOptionElement",
      output: "HTMLOutputElement",
      p: "HTMLParagraphElement",
      param: "HTMLParamElement",
      pre: "HTMLPreElement",
      progress: "HTMLProgressElement",
      q: "HTMLQuoteElement",
      script: "HTMLScriptElement",
      select: "HTMLSelectElement",
      shadow: "HTMLShadowElement",
      source: "HTMLSourceElement",
      span: "HTMLSpanElement",
      style: "HTMLStyleElement",
      table: "HTMLTableElement",
      tbody: "HTMLTableSectionElement",
      template: "HTMLTemplateElement",
      textarea: "HTMLTextAreaElement",
      thead: "HTMLTableSectionElement",
      time: "HTMLTimeElement",
      title: "HTMLTitleElement",
      tr: "HTMLTableRowElement",
      track: "HTMLTrackElement",
      ul: "HTMLUListElement",
      video: "HTMLVideoElement"
    };
    function overrideConstructor(tagName) {
      var nativeConstructorName = elements[tagName];
      var nativeConstructor = window[nativeConstructorName];
      if (!nativeConstructor) return;
      var element = document.createElement(tagName);
      var wrapperConstructor = element.constructor;
      window[nativeConstructorName] = wrapperConstructor;
    }
    Object.keys(elements).forEach(overrideConstructor);
    Object.getOwnPropertyNames(scope.wrappers).forEach(function(name) {
      window[name] = scope.wrappers[name];
    });
  })(window.ShadowDOMPolyfill);
  (function(scope) {
    var ShadowCSS = {
      strictStyling: false,
      registry: {},
      shimStyling: function(root, name, extendsName) {
        var scopeStyles = this.prepareRoot(root, name, extendsName);
        var typeExtension = this.isTypeExtension(extendsName);
        var scopeSelector = this.makeScopeSelector(name, typeExtension);
        var cssText = stylesToCssText(scopeStyles, true);
        cssText = this.scopeCssText(cssText, scopeSelector);
        if (root) {
          root.shimmedStyle = cssText;
        }
        this.addCssToDocument(cssText, name);
      },
      shimStyle: function(style, selector) {
        return this.shimCssText(style.textContent, selector);
      },
      shimCssText: function(cssText, selector) {
        cssText = this.insertDirectives(cssText);
        return this.scopeCssText(cssText, selector);
      },
      makeScopeSelector: function(name, typeExtension) {
        if (name) {
          return typeExtension ? "[is=" + name + "]" : name;
        }
        return "";
      },
      isTypeExtension: function(extendsName) {
        return extendsName && extendsName.indexOf("-") < 0;
      },
      prepareRoot: function(root, name, extendsName) {
        var def = this.registerRoot(root, name, extendsName);
        this.replaceTextInStyles(def.rootStyles, this.insertDirectives);
        this.removeStyles(root, def.rootStyles);
        if (this.strictStyling) {
          this.applyScopeToContent(root, name);
        }
        return def.scopeStyles;
      },
      removeStyles: function(root, styles) {
        for (var i = 0, l = styles.length, s; i < l && (s = styles[i]); i++) {
          s.parentNode.removeChild(s);
        }
      },
      registerRoot: function(root, name, extendsName) {
        var def = this.registry[name] = {
          root: root,
          name: name,
          extendsName: extendsName
        };
        var styles = this.findStyles(root);
        def.rootStyles = styles;
        def.scopeStyles = def.rootStyles;
        var extendee = this.registry[def.extendsName];
        if (extendee) {
          def.scopeStyles = extendee.scopeStyles.concat(def.scopeStyles);
        }
        return def;
      },
      findStyles: function(root) {
        if (!root) {
          return [];
        }
        var styles = root.querySelectorAll("style");
        return Array.prototype.filter.call(styles, function(s) {
          return !s.hasAttribute(NO_SHIM_ATTRIBUTE);
        });
      },
      applyScopeToContent: function(root, name) {
        if (root) {
          Array.prototype.forEach.call(root.querySelectorAll("*"), function(node) {
            node.setAttribute(name, "");
          });
          Array.prototype.forEach.call(root.querySelectorAll("template"), function(template) {
            this.applyScopeToContent(template.content, name);
          }, this);
        }
      },
      insertDirectives: function(cssText) {
        cssText = this.insertPolyfillDirectivesInCssText(cssText);
        return this.insertPolyfillRulesInCssText(cssText);
      },
      insertPolyfillDirectivesInCssText: function(cssText) {
        cssText = cssText.replace(cssCommentNextSelectorRe, function(match, p1) {
          return p1.slice(0, -2) + "{";
        });
        return cssText.replace(cssContentNextSelectorRe, function(match, p1) {
          return p1 + " {";
        });
      },
      insertPolyfillRulesInCssText: function(cssText) {
        cssText = cssText.replace(cssCommentRuleRe, function(match, p1) {
          return p1.slice(0, -1);
        });
        return cssText.replace(cssContentRuleRe, function(match, p1, p2, p3) {
          var rule = match.replace(p1, "").replace(p2, "");
          return p3 + rule;
        });
      },
      scopeCssText: function(cssText, scopeSelector) {
        var unscoped = this.extractUnscopedRulesFromCssText(cssText);
        cssText = this.insertPolyfillHostInCssText(cssText);
        cssText = this.convertColonHost(cssText);
        cssText = this.convertColonHostContext(cssText);
        cssText = this.convertShadowDOMSelectors(cssText);
        if (scopeSelector) {
          var self = this, cssText;
          withCssRules(cssText, function(rules) {
            cssText = self.scopeRules(rules, scopeSelector);
          });
        }
        cssText = cssText + "\n" + unscoped;
        return cssText.trim();
      },
      extractUnscopedRulesFromCssText: function(cssText) {
        var r = "", m;
        while (m = cssCommentUnscopedRuleRe.exec(cssText)) {
          r += m[1].slice(0, -1) + "\n\n";
        }
        while (m = cssContentUnscopedRuleRe.exec(cssText)) {
          r += m[0].replace(m[2], "").replace(m[1], m[3]) + "\n\n";
        }
        return r;
      },
      convertColonHost: function(cssText) {
        return this.convertColonRule(cssText, cssColonHostRe, this.colonHostPartReplacer);
      },
      convertColonHostContext: function(cssText) {
        return this.convertColonRule(cssText, cssColonHostContextRe, this.colonHostContextPartReplacer);
      },
      convertColonRule: function(cssText, regExp, partReplacer) {
        return cssText.replace(regExp, function(m, p1, p2, p3) {
          p1 = polyfillHostNoCombinator;
          if (p2) {
            var parts = p2.split(","), r = [];
            for (var i = 0, l = parts.length, p; i < l && (p = parts[i]); i++) {
              p = p.trim();
              r.push(partReplacer(p1, p, p3));
            }
            return r.join(",");
          } else {
            return p1 + p3;
          }
        });
      },
      colonHostContextPartReplacer: function(host, part, suffix) {
        if (part.match(polyfillHost)) {
          return this.colonHostPartReplacer(host, part, suffix);
        } else {
          return host + part + suffix + ", " + part + " " + host + suffix;
        }
      },
      colonHostPartReplacer: function(host, part, suffix) {
        return host + part.replace(polyfillHost, "") + suffix;
      },
      convertShadowDOMSelectors: function(cssText) {
        for (var i = 0; i < shadowDOMSelectorsRe.length; i++) {
          cssText = cssText.replace(shadowDOMSelectorsRe[i], " ");
        }
        return cssText;
      },
      scopeRules: function(cssRules, scopeSelector) {
        var cssText = "";
        if (cssRules) {
          Array.prototype.forEach.call(cssRules, function(rule) {
            if (rule.selectorText && (rule.style && rule.style.cssText !== undefined)) {
              cssText += this.scopeSelector(rule.selectorText, scopeSelector, this.strictStyling) + " {\n	";
              cssText += this.propertiesFromRule(rule) + "\n}\n\n";
            } else if (rule.type === CSSRule.MEDIA_RULE) {
              cssText += "@media " + rule.media.mediaText + " {\n";
              cssText += this.scopeRules(rule.cssRules, scopeSelector);
              cssText += "\n}\n\n";
            } else {
              try {
                if (rule.cssText) {
                  cssText += rule.cssText + "\n\n";
                }
              } catch (x) {
                if (rule.type === CSSRule.KEYFRAMES_RULE && rule.cssRules) {
                  cssText += this.ieSafeCssTextFromKeyFrameRule(rule);
                }
              }
            }
          }, this);
        }
        return cssText;
      },
      ieSafeCssTextFromKeyFrameRule: function(rule) {
        var cssText = "@keyframes " + rule.name + " {";
        Array.prototype.forEach.call(rule.cssRules, function(rule) {
          cssText += " " + rule.keyText + " {" + rule.style.cssText + "}";
        });
        cssText += " }";
        return cssText;
      },
      scopeSelector: function(selector, scopeSelector, strict) {
        var r = [], parts = selector.split(",");
        parts.forEach(function(p) {
          p = p.trim();
          if (this.selectorNeedsScoping(p, scopeSelector)) {
            p = strict && !p.match(polyfillHostNoCombinator) ? this.applyStrictSelectorScope(p, scopeSelector) : this.applySelectorScope(p, scopeSelector);
          }
          r.push(p);
        }, this);
        return r.join(", ");
      },
      selectorNeedsScoping: function(selector, scopeSelector) {
        if (Array.isArray(scopeSelector)) {
          return true;
        }
        var re = this.makeScopeMatcher(scopeSelector);
        return !selector.match(re);
      },
      makeScopeMatcher: function(scopeSelector) {
        scopeSelector = scopeSelector.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
        return new RegExp("^(" + scopeSelector + ")" + selectorReSuffix, "m");
      },
      applySelectorScope: function(selector, selectorScope) {
        return Array.isArray(selectorScope) ? this.applySelectorScopeList(selector, selectorScope) : this.applySimpleSelectorScope(selector, selectorScope);
      },
      applySelectorScopeList: function(selector, scopeSelectorList) {
        var r = [];
        for (var i = 0, s; s = scopeSelectorList[i]; i++) {
          r.push(this.applySimpleSelectorScope(selector, s));
        }
        return r.join(", ");
      },
      applySimpleSelectorScope: function(selector, scopeSelector) {
        if (selector.match(polyfillHostRe)) {
          selector = selector.replace(polyfillHostNoCombinator, scopeSelector);
          return selector.replace(polyfillHostRe, scopeSelector + " ");
        } else {
          return scopeSelector + " " + selector;
        }
      },
      applyStrictSelectorScope: function(selector, scopeSelector) {
        scopeSelector = scopeSelector.replace(/\[is=([^\]]*)\]/g, "$1");
        var splits = [ " ", ">", "+", "~" ], scoped = selector, attrName = "[" + scopeSelector + "]";
        splits.forEach(function(sep) {
          var parts = scoped.split(sep);
          scoped = parts.map(function(p) {
            var t = p.trim().replace(polyfillHostRe, "");
            if (t && splits.indexOf(t) < 0 && t.indexOf(attrName) < 0) {
              p = t.replace(/([^:]*)(:*)(.*)/, "$1" + attrName + "$2$3");
            }
            return p;
          }).join(sep);
        });
        return scoped;
      },
      insertPolyfillHostInCssText: function(selector) {
        return selector.replace(colonHostContextRe, polyfillHostContext).replace(colonHostRe, polyfillHost);
      },
      propertiesFromRule: function(rule) {
        var cssText = rule.style.cssText;
        if (rule.style.content && !rule.style.content.match(/['"]+|attr/)) {
          cssText = cssText.replace(/content:[^;]*;/g, "content: '" + rule.style.content + "';");
        }
        var style = rule.style;
        for (var i in style) {
          if (style[i] === "initial") {
            cssText += i + ": initial; ";
          }
        }
        return cssText;
      },
      replaceTextInStyles: function(styles, action) {
        if (styles && action) {
          if (!(styles instanceof Array)) {
            styles = [ styles ];
          }
          Array.prototype.forEach.call(styles, function(s) {
            s.textContent = action.call(this, s.textContent);
          }, this);
        }
      },
      addCssToDocument: function(cssText, name) {
        if (cssText.match("@import")) {
          addOwnSheet(cssText, name);
        } else {
          addCssToDocument(cssText);
        }
      }
    };
    var selectorRe = /([^{]*)({[\s\S]*?})/gim, cssCommentRe = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim, cssCommentNextSelectorRe = /\/\*\s*@polyfill ([^*]*\*+([^/*][^*]*\*+)*\/)([^{]*?){/gim, cssContentNextSelectorRe = /polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim, cssCommentRuleRe = /\/\*\s@polyfill-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim, cssContentRuleRe = /(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssCommentUnscopedRuleRe = /\/\*\s@polyfill-unscoped-rule([^*]*\*+([^/*][^*]*\*+)*)\//gim, cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, cssPseudoRe = /::(x-[^\s{,(]*)/gim, cssPartRe = /::part\(([^)]*)\)/gim, polyfillHost = "-shadowcsshost", polyfillHostContext = "-shadowcsscontext", parenSuffix = ")(?:\\((" + "(?:\\([^)(]*\\)|[^)(]*)+?" + ")\\))?([^,{]*)";
    var cssColonHostRe = new RegExp("(" + polyfillHost + parenSuffix, "gim"), cssColonHostContextRe = new RegExp("(" + polyfillHostContext + parenSuffix, "gim"), selectorReSuffix = "([>\\s~+[.,{:][\\s\\S]*)?$", colonHostRe = /\:host/gim, colonHostContextRe = /\:host-context/gim, polyfillHostNoCombinator = polyfillHost + "-no-combinator", polyfillHostRe = new RegExp(polyfillHost, "gim"), polyfillHostContextRe = new RegExp(polyfillHostContext, "gim"), shadowDOMSelectorsRe = [ /\^\^/g, /\^/g, /\/shadow\//g, /\/shadow-deep\//g, /::shadow/g, /\/deep\//g, /::content/g ];
    function stylesToCssText(styles, preserveComments) {
      var cssText = "";
      Array.prototype.forEach.call(styles, function(s) {
        cssText += s.textContent + "\n\n";
      });
      if (!preserveComments) {
        cssText = cssText.replace(cssCommentRe, "");
      }
      return cssText;
    }
    function cssTextToStyle(cssText) {
      var style = document.createElement("style");
      style.textContent = cssText;
      return style;
    }
    function cssToRules(cssText) {
      var style = cssTextToStyle(cssText);
      document.head.appendChild(style);
      var rules = [];
      if (style.sheet) {
        try {
          rules = style.sheet.cssRules;
        } catch (e) {}
      } else {
        console.warn("sheet not found", style);
      }
      style.parentNode.removeChild(style);
      return rules;
    }
    var frame = document.createElement("iframe");
    frame.style.display = "none";
    function initFrame() {
      frame.initialized = true;
      document.body.appendChild(frame);
      var doc = frame.contentDocument;
      var base = doc.createElement("base");
      base.href = document.baseURI;
      doc.head.appendChild(base);
    }
    function inFrame(fn) {
      if (!frame.initialized) {
        initFrame();
      }
      document.body.appendChild(frame);
      fn(frame.contentDocument);
      document.body.removeChild(frame);
    }
    var isChrome = navigator.userAgent.match("Chrome");
    function withCssRules(cssText, callback) {
      if (!callback) {
        return;
      }
      var rules;
      if (cssText.match("@import") && isChrome) {
        var style = cssTextToStyle(cssText);
        inFrame(function(doc) {
          doc.head.appendChild(style.impl);
          rules = Array.prototype.slice.call(style.sheet.cssRules, 0);
          callback(rules);
        });
      } else {
        rules = cssToRules(cssText);
        callback(rules);
      }
    }
    function rulesToCss(cssRules) {
      for (var i = 0, css = []; i < cssRules.length; i++) {
        css.push(cssRules[i].cssText);
      }
      return css.join("\n\n");
    }
    function addCssToDocument(cssText) {
      if (cssText) {
        getSheet().appendChild(document.createTextNode(cssText));
      }
    }
    function addOwnSheet(cssText, name) {
      var style = cssTextToStyle(cssText);
      style.setAttribute(name, "");
      style.setAttribute(SHIMMED_ATTRIBUTE, "");
      document.head.appendChild(style);
    }
    var SHIM_ATTRIBUTE = "shim-shadowdom";
    var SHIMMED_ATTRIBUTE = "shim-shadowdom-css";
    var NO_SHIM_ATTRIBUTE = "no-shim";
    var sheet;
    function getSheet() {
      if (!sheet) {
        sheet = document.createElement("style");
        sheet.setAttribute(SHIMMED_ATTRIBUTE, "");
        sheet[SHIMMED_ATTRIBUTE] = true;
      }
      return sheet;
    }
    if (window.ShadowDOMPolyfill) {
      addCssToDocument("style { display: none !important; }\n");
      var doc = ShadowDOMPolyfill.wrap(document);
      var head = doc.querySelector("head");
      head.insertBefore(getSheet(), head.childNodes[0]);
      document.addEventListener("DOMContentLoaded", function() {
        var urlResolver = scope.urlResolver;
        if (window.HTMLImports && !HTMLImports.useNative) {
          var SHIM_SHEET_SELECTOR = "link[rel=stylesheet]" + "[" + SHIM_ATTRIBUTE + "]";
          var SHIM_STYLE_SELECTOR = "style[" + SHIM_ATTRIBUTE + "]";
          HTMLImports.importer.documentPreloadSelectors += "," + SHIM_SHEET_SELECTOR;
          HTMLImports.importer.importsPreloadSelectors += "," + SHIM_SHEET_SELECTOR;
          HTMLImports.parser.documentSelectors = [ HTMLImports.parser.documentSelectors, SHIM_SHEET_SELECTOR, SHIM_STYLE_SELECTOR ].join(",");
          var originalParseGeneric = HTMLImports.parser.parseGeneric;
          HTMLImports.parser.parseGeneric = function(elt) {
            if (elt[SHIMMED_ATTRIBUTE]) {
              return;
            }
            var style = elt.__importElement || elt;
            if (!style.hasAttribute(SHIM_ATTRIBUTE)) {
              originalParseGeneric.call(this, elt);
              return;
            }
            if (elt.__resource) {
              style = elt.ownerDocument.createElement("style");
              style.textContent = elt.__resource;
            }
            HTMLImports.path.resolveUrlsInStyle(style);
            style.textContent = ShadowCSS.shimStyle(style);
            style.removeAttribute(SHIM_ATTRIBUTE, "");
            style.setAttribute(SHIMMED_ATTRIBUTE, "");
            style[SHIMMED_ATTRIBUTE] = true;
            if (style.parentNode !== head) {
              if (elt.parentNode === head) {
                head.replaceChild(style, elt);
              } else {
                this.addElementToDocument(style);
              }
            }
            style.__importParsed = true;
            this.markParsingComplete(elt);
            this.parseNext();
          };
          var hasResource = HTMLImports.parser.hasResource;
          HTMLImports.parser.hasResource = function(node) {
            if (node.localName === "link" && node.rel === "stylesheet" && node.hasAttribute(SHIM_ATTRIBUTE)) {
              return node.__resource;
            } else {
              return hasResource.call(this, node);
            }
          };
        }
      });
    }
    scope.ShadowCSS = ShadowCSS;
  })(window.WebComponents);
}

(function(scope) {
  if (window.ShadowDOMPolyfill) {
    window.wrap = ShadowDOMPolyfill.wrapIfNeeded;
    window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;
  } else {
    window.wrap = window.unwrap = function(n) {
      return n;
    };
  }
})(window.WebComponents);

window.HTMLImports = window.HTMLImports || {
  flags: {}
};

(function(scope) {
  var IMPORT_LINK_TYPE = "import";
  var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement("link"));
  var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);
  var wrap = function(node) {
    return hasShadowDOMPolyfill ? ShadowDOMPolyfill.wrapIfNeeded(node) : node;
  };
  var rootDocument = wrap(document);
  var currentScriptDescriptor = {
    get: function() {
      var script = HTMLImports.currentScript || document.currentScript || (document.readyState !== "complete" ? document.scripts[document.scripts.length - 1] : null);
      return wrap(script);
    },
    configurable: true
  };
  Object.defineProperty(document, "_currentScript", currentScriptDescriptor);
  Object.defineProperty(rootDocument, "_currentScript", currentScriptDescriptor);
  var isIE = /Trident|Edge/.test(navigator.userAgent);
  function whenReady(callback, doc) {
    doc = doc || rootDocument;
    whenDocumentReady(function() {
      watchImportsLoad(callback, doc);
    }, doc);
  }
  var requiredReadyState = isIE ? "complete" : "interactive";
  var READY_EVENT = "readystatechange";
  function isDocumentReady(doc) {
    return doc.readyState === "complete" || doc.readyState === requiredReadyState;
  }
  function whenDocumentReady(callback, doc) {
    if (!isDocumentReady(doc)) {
      var checkReady = function() {
        if (doc.readyState === "complete" || doc.readyState === requiredReadyState) {
          doc.removeEventListener(READY_EVENT, checkReady);
          whenDocumentReady(callback, doc);
        }
      };
      doc.addEventListener(READY_EVENT, checkReady);
    } else if (callback) {
      callback();
    }
  }
  function markTargetLoaded(event) {
    event.target.__loaded = true;
  }
  function watchImportsLoad(callback, doc) {
    var imports = doc.querySelectorAll("link[rel=import]");
    var loaded = 0, l = imports.length;
    function checkDone(d) {
      if (loaded == l && callback) {
        callback();
      }
    }
    function loadedImport(e) {
      markTargetLoaded(e);
      loaded++;
      checkDone();
    }
    if (l) {
      for (var i = 0, imp; i < l && (imp = imports[i]); i++) {
        if (isImportLoaded(imp)) {
          loadedImport.call(imp, {
            target: imp
          });
        } else {
          imp.addEventListener("load", loadedImport);
          imp.addEventListener("error", loadedImport);
        }
      }
    } else {
      checkDone();
    }
  }
  function isImportLoaded(link) {
    return useNative ? link.__loaded || link.import && link.import.readyState !== "loading" : link.__importParsed;
  }
  if (useNative) {
    new MutationObserver(function(mxns) {
      for (var i = 0, l = mxns.length, m; i < l && (m = mxns[i]); i++) {
        if (m.addedNodes) {
          handleImports(m.addedNodes);
        }
      }
    }).observe(document.head, {
      childList: true
    });
    function handleImports(nodes) {
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        if (isImport(n)) {
          handleImport(n);
        }
      }
    }
    function isImport(element) {
      return element.localName === "link" && element.rel === "import";
    }
    function handleImport(element) {
      var loaded = element.import;
      if (loaded) {
        markTargetLoaded({
          target: element
        });
      } else {
        element.addEventListener("load", markTargetLoaded);
        element.addEventListener("error", markTargetLoaded);
      }
    }
    (function() {
      if (document.readyState === "loading") {
        var imports = document.querySelectorAll("link[rel=import]");
        for (var i = 0, l = imports.length, imp; i < l && (imp = imports[i]); i++) {
          handleImport(imp);
        }
      }
    })();
  }
  whenReady(function() {
    HTMLImports.ready = true;
    HTMLImports.readyTime = new Date().getTime();
    var evt = rootDocument.createEvent("CustomEvent");
    evt.initCustomEvent("HTMLImportsLoaded", true, true, {});
    rootDocument.dispatchEvent(evt);
  });
  scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
  scope.useNative = useNative;
  scope.rootDocument = rootDocument;
  scope.whenReady = whenReady;
  scope.isIE = isIE;
})(HTMLImports);

(function(scope) {
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
})(HTMLImports);

HTMLImports.addModule(function(scope) {
  var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
  var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
  var path = {
    resolveUrlsInStyle: function(style) {
      var doc = style.ownerDocument;
      var resolver = doc.createElement("a");
      style.textContent = this.resolveUrlsInCssText(style.textContent, resolver);
      return style;
    },
    resolveUrlsInCssText: function(cssText, urlObj) {
      var r = this.replaceUrls(cssText, urlObj, CSS_URL_REGEXP);
      r = this.replaceUrls(r, urlObj, CSS_IMPORT_REGEXP);
      return r;
    },
    replaceUrls: function(text, urlObj, regexp) {
      return text.replace(regexp, function(m, pre, url, post) {
        var urlPath = url.replace(/["']/g, "");
        urlObj.href = urlPath;
        urlPath = urlObj.href;
        return pre + "'" + urlPath + "'" + post;
      });
    }
  };
  scope.path = path;
});

HTMLImports.addModule(function(scope) {
  var xhr = {
    async: true,
    ok: function(request) {
      return request.status >= 200 && request.status < 300 || request.status === 304 || request.status === 0;
    },
    load: function(url, next, nextContext) {
      var request = new XMLHttpRequest();
      if (scope.flags.debug || scope.flags.bust) {
        url += "?" + Math.random();
      }
      request.open("GET", url, xhr.async);
      request.addEventListener("readystatechange", function(e) {
        if (request.readyState === 4) {
          var locationHeader = request.getResponseHeader("Location");
          var redirectedUrl = null;
          if (locationHeader) {
            var redirectedUrl = locationHeader.substr(0, 1) === "/" ? location.origin + locationHeader : locationHeader;
          }
          next.call(nextContext, !xhr.ok(request) && request, request.response || request.responseText, redirectedUrl);
        }
      });
      request.send();
      return request;
    },
    loadDocument: function(url, next, nextContext) {
      this.load(url, next, nextContext).responseType = "document";
    }
  };
  scope.xhr = xhr;
});

HTMLImports.addModule(function(scope) {
  var xhr = scope.xhr;
  var flags = scope.flags;
  var Loader = function(onLoad, onComplete) {
    this.cache = {};
    this.onload = onLoad;
    this.oncomplete = onComplete;
    this.inflight = 0;
    this.pending = {};
  };
  Loader.prototype = {
    addNodes: function(nodes) {
      this.inflight += nodes.length;
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        this.require(n);
      }
      this.checkDone();
    },
    addNode: function(node) {
      this.inflight++;
      this.require(node);
      this.checkDone();
    },
    require: function(elt) {
      var url = elt.src || elt.href;
      elt.__nodeUrl = url;
      if (!this.dedupe(url, elt)) {
        this.fetch(url, elt);
      }
    },
    dedupe: function(url, elt) {
      if (this.pending[url]) {
        this.pending[url].push(elt);
        return true;
      }
      var resource;
      if (this.cache[url]) {
        this.onload(url, elt, this.cache[url]);
        this.tail();
        return true;
      }
      this.pending[url] = [ elt ];
      return false;
    },
    fetch: function(url, elt) {
      flags.load && console.log("fetch", url, elt);
      if (!url) {
        setTimeout(function() {
          this.receive(url, elt, {
            error: "href must be specified"
          }, null);
        }.bind(this), 0);
      } else if (url.match(/^data:/)) {
        var pieces = url.split(",");
        var header = pieces[0];
        var body = pieces[1];
        if (header.indexOf(";base64") > -1) {
          body = atob(body);
        } else {
          body = decodeURIComponent(body);
        }
        setTimeout(function() {
          this.receive(url, elt, null, body);
        }.bind(this), 0);
      } else {
        var receiveXhr = function(err, resource, redirectedUrl) {
          this.receive(url, elt, err, resource, redirectedUrl);
        }.bind(this);
        xhr.load(url, receiveXhr);
      }
    },
    receive: function(url, elt, err, resource, redirectedUrl) {
      this.cache[url] = resource;
      var $p = this.pending[url];
      for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
        this.onload(url, p, resource, err, redirectedUrl);
        this.tail();
      }
      this.pending[url] = null;
    },
    tail: function() {
      --this.inflight;
      this.checkDone();
    },
    checkDone: function() {
      if (!this.inflight) {
        this.oncomplete();
      }
    }
  };
  scope.Loader = Loader;
});

HTMLImports.addModule(function(scope) {
  var Observer = function(addCallback) {
    this.addCallback = addCallback;
    this.mo = new MutationObserver(this.handler.bind(this));
  };
  Observer.prototype = {
    handler: function(mutations) {
      for (var i = 0, l = mutations.length, m; i < l && (m = mutations[i]); i++) {
        if (m.type === "childList" && m.addedNodes.length) {
          this.addedNodes(m.addedNodes);
        }
      }
    },
    addedNodes: function(nodes) {
      if (this.addCallback) {
        this.addCallback(nodes);
      }
      for (var i = 0, l = nodes.length, n, loading; i < l && (n = nodes[i]); i++) {
        if (n.children && n.children.length) {
          this.addedNodes(n.children);
        }
      }
    },
    observe: function(root) {
      this.mo.observe(root, {
        childList: true,
        subtree: true
      });
    }
  };
  scope.Observer = Observer;
});

HTMLImports.addModule(function(scope) {
  var path = scope.path;
  var rootDocument = scope.rootDocument;
  var flags = scope.flags;
  var isIE = scope.isIE;
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
  var IMPORT_SELECTOR = "link[rel=" + IMPORT_LINK_TYPE + "]";
  var importParser = {
    documentSelectors: IMPORT_SELECTOR,
    importsSelectors: [ IMPORT_SELECTOR, "link[rel=stylesheet]", "style", "script:not([type])", 'script[type="text/javascript"]' ].join(","),
    map: {
      link: "parseLink",
      script: "parseScript",
      style: "parseStyle"
    },
    dynamicElements: [],
    parseNext: function() {
      var next = this.nextToParse();
      if (next) {
        this.parse(next);
      }
    },
    parse: function(elt) {
      if (this.isParsed(elt)) {
        flags.parse && console.log("[%s] is already parsed", elt.localName);
        return;
      }
      var fn = this[this.map[elt.localName]];
      if (fn) {
        this.markParsing(elt);
        fn.call(this, elt);
      }
    },
    parseDynamic: function(elt, quiet) {
      this.dynamicElements.push(elt);
      if (!quiet) {
        this.parseNext();
      }
    },
    markParsing: function(elt) {
      flags.parse && console.log("parsing", elt);
      this.parsingElement = elt;
    },
    markParsingComplete: function(elt) {
      elt.__importParsed = true;
      this.markDynamicParsingComplete(elt);
      if (elt.__importElement) {
        elt.__importElement.__importParsed = true;
        this.markDynamicParsingComplete(elt.__importElement);
      }
      this.parsingElement = null;
      flags.parse && console.log("completed", elt);
    },
    markDynamicParsingComplete: function(elt) {
      var i = this.dynamicElements.indexOf(elt);
      if (i >= 0) {
        this.dynamicElements.splice(i, 1);
      }
    },
    parseImport: function(elt) {
      if (HTMLImports.__importsParsingHook) {
        HTMLImports.__importsParsingHook(elt);
      }
      if (elt.import) {
        elt.import.__importParsed = true;
      }
      this.markParsingComplete(elt);
      if (elt.__resource && !elt.__error) {
        elt.dispatchEvent(new CustomEvent("load", {
          bubbles: false
        }));
      } else {
        elt.dispatchEvent(new CustomEvent("error", {
          bubbles: false
        }));
      }
      if (elt.__pending) {
        var fn;
        while (elt.__pending.length) {
          fn = elt.__pending.shift();
          if (fn) {
            fn({
              target: elt
            });
          }
        }
      }
      this.parseNext();
    },
    parseLink: function(linkElt) {
      if (nodeIsImport(linkElt)) {
        this.parseImport(linkElt);
      } else {
        linkElt.href = linkElt.href;
        this.parseGeneric(linkElt);
      }
    },
    parseStyle: function(elt) {
      var src = elt;
      elt = cloneStyle(elt);
      elt.__importElement = src;
      this.parseGeneric(elt);
    },
    parseGeneric: function(elt) {
      this.trackElement(elt);
      this.addElementToDocument(elt);
    },
    rootImportForElement: function(elt) {
      var n = elt;
      while (n.ownerDocument.__importLink) {
        n = n.ownerDocument.__importLink;
      }
      return n;
    },
    addElementToDocument: function(elt) {
      var port = this.rootImportForElement(elt.__importElement || elt);
      port.parentNode.insertBefore(elt, port);
    },
    trackElement: function(elt, callback) {
      var self = this;
      var done = function(e) {
        if (callback) {
          callback(e);
        }
        self.markParsingComplete(elt);
        self.parseNext();
      };
      elt.addEventListener("load", done);
      elt.addEventListener("error", done);
      if (isIE && elt.localName === "style") {
        var fakeLoad = false;
        if (elt.textContent.indexOf("@import") == -1) {
          fakeLoad = true;
        } else if (elt.sheet) {
          fakeLoad = true;
          var csr = elt.sheet.cssRules;
          var len = csr ? csr.length : 0;
          for (var i = 0, r; i < len && (r = csr[i]); i++) {
            if (r.type === CSSRule.IMPORT_RULE) {
              fakeLoad = fakeLoad && Boolean(r.styleSheet);
            }
          }
        }
        if (fakeLoad) {
          elt.dispatchEvent(new CustomEvent("load", {
            bubbles: false
          }));
        }
      }
    },
    parseScript: function(scriptElt) {
      var script = document.createElement("script");
      script.__importElement = scriptElt;
      script.src = scriptElt.src ? scriptElt.src : generateScriptDataUrl(scriptElt);
      scope.currentScript = scriptElt;
      this.trackElement(script, function(e) {
        script.parentNode.removeChild(script);
        scope.currentScript = null;
      });
      this.addElementToDocument(script);
    },
    nextToParse: function() {
      this._mayParse = [];
      return !this.parsingElement && (this.nextToParseInDoc(rootDocument) || this.nextToParseDynamic());
    },
    nextToParseInDoc: function(doc, link) {
      if (doc && this._mayParse.indexOf(doc) < 0) {
        this._mayParse.push(doc);
        var nodes = doc.querySelectorAll(this.parseSelectorsForNode(doc));
        for (var i = 0, l = nodes.length, p = 0, n; i < l && (n = nodes[i]); i++) {
          if (!this.isParsed(n)) {
            if (this.hasResource(n)) {
              return nodeIsImport(n) ? this.nextToParseInDoc(n.import, n) : n;
            } else {
              return;
            }
          }
        }
      }
      return link;
    },
    nextToParseDynamic: function() {
      return this.dynamicElements[0];
    },
    parseSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === rootDocument ? this.documentSelectors : this.importsSelectors;
    },
    isParsed: function(node) {
      return node.__importParsed;
    },
    needsDynamicParsing: function(elt) {
      return this.dynamicElements.indexOf(elt) >= 0;
    },
    hasResource: function(node) {
      if (nodeIsImport(node) && node.import === undefined) {
        return false;
      }
      return true;
    }
  };
  function nodeIsImport(elt) {
    return elt.localName === "link" && elt.rel === IMPORT_LINK_TYPE;
  }
  function generateScriptDataUrl(script) {
    var scriptContent = generateScriptContent(script);
    return "data:text/javascript;charset=utf-8," + encodeURIComponent(scriptContent);
  }
  function generateScriptContent(script) {
    return script.textContent + generateSourceMapHint(script);
  }
  function generateSourceMapHint(script) {
    var owner = script.ownerDocument;
    owner.__importedScripts = owner.__importedScripts || 0;
    var moniker = script.ownerDocument.baseURI;
    var num = owner.__importedScripts ? "-" + owner.__importedScripts : "";
    owner.__importedScripts++;
    return "\n//# sourceURL=" + moniker + num + ".js\n";
  }
  function cloneStyle(style) {
    var clone = style.ownerDocument.createElement("style");
    clone.textContent = style.textContent;
    path.resolveUrlsInStyle(clone);
    return clone;
  }
  scope.parser = importParser;
  scope.IMPORT_SELECTOR = IMPORT_SELECTOR;
});

HTMLImports.addModule(function(scope) {
  var flags = scope.flags;
  var IMPORT_LINK_TYPE = scope.IMPORT_LINK_TYPE;
  var IMPORT_SELECTOR = scope.IMPORT_SELECTOR;
  var rootDocument = scope.rootDocument;
  var Loader = scope.Loader;
  var Observer = scope.Observer;
  var parser = scope.parser;
  var importer = {
    documents: {},
    documentPreloadSelectors: IMPORT_SELECTOR,
    importsPreloadSelectors: [ IMPORT_SELECTOR ].join(","),
    loadNode: function(node) {
      importLoader.addNode(node);
    },
    loadSubtree: function(parent) {
      var nodes = this.marshalNodes(parent);
      importLoader.addNodes(nodes);
    },
    marshalNodes: function(parent) {
      return parent.querySelectorAll(this.loadSelectorsForNode(parent));
    },
    loadSelectorsForNode: function(node) {
      var doc = node.ownerDocument || node;
      return doc === rootDocument ? this.documentPreloadSelectors : this.importsPreloadSelectors;
    },
    loaded: function(url, elt, resource, err, redirectedUrl) {
      flags.load && console.log("loaded", url, elt);
      elt.__resource = resource;
      elt.__error = err;
      if (isImportLink(elt)) {
        var doc = this.documents[url];
        if (doc === undefined) {
          doc = err ? null : makeDocument(resource, redirectedUrl || url);
          if (doc) {
            doc.__importLink = elt;
            this.bootDocument(doc);
          }
          this.documents[url] = doc;
        }
        elt.import = doc;
      }
      parser.parseNext();
    },
    bootDocument: function(doc) {
      this.loadSubtree(doc);
      this.observer.observe(doc);
      parser.parseNext();
    },
    loadedAll: function() {
      parser.parseNext();
    }
  };
  var importLoader = new Loader(importer.loaded.bind(importer), importer.loadedAll.bind(importer));
  importer.observer = new Observer();
  function isImportLink(elt) {
    return isLinkRel(elt, IMPORT_LINK_TYPE);
  }
  function isLinkRel(elt, rel) {
    return elt.localName === "link" && elt.getAttribute("rel") === rel;
  }
  function hasBaseURIAccessor(doc) {
    return !!Object.getOwnPropertyDescriptor(doc, "baseURI");
  }
  function makeDocument(resource, url) {
    var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
    doc._URL = url;
    var base = doc.createElement("base");
    base.setAttribute("href", url);
    if (!doc.baseURI && !hasBaseURIAccessor(doc)) {
      Object.defineProperty(doc, "baseURI", {
        value: url
      });
    }
    var meta = doc.createElement("meta");
    meta.setAttribute("charset", "utf-8");
    doc.head.appendChild(meta);
    doc.head.appendChild(base);
    doc.body.innerHTML = resource;
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(doc);
    }
    return doc;
  }
  if (!document.baseURI) {
    var baseURIDescriptor = {
      get: function() {
        var base = document.querySelector("base");
        return base ? base.href : window.location.href;
      },
      configurable: true
    };
    Object.defineProperty(document, "baseURI", baseURIDescriptor);
    Object.defineProperty(rootDocument, "baseURI", baseURIDescriptor);
  }
  scope.importer = importer;
  scope.importLoader = importLoader;
});

HTMLImports.addModule(function(scope) {
  var parser = scope.parser;
  var importer = scope.importer;
  var dynamic = {
    added: function(nodes) {
      var owner, parsed, loading;
      for (var i = 0, l = nodes.length, n; i < l && (n = nodes[i]); i++) {
        if (!owner) {
          owner = n.ownerDocument;
          parsed = parser.isParsed(owner);
        }
        loading = this.shouldLoadNode(n);
        if (loading) {
          importer.loadNode(n);
        }
        if (this.shouldParseNode(n) && parsed) {
          parser.parseDynamic(n, loading);
        }
      }
    },
    shouldLoadNode: function(node) {
      return node.nodeType === 1 && matches.call(node, importer.loadSelectorsForNode(node));
    },
    shouldParseNode: function(node) {
      return node.nodeType === 1 && matches.call(node, parser.parseSelectorsForNode(node));
    }
  };
  importer.observer.addCallback = dynamic.added.bind(dynamic);
  var matches = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector;
});

(function(scope) {
  var initializeModules = scope.initializeModules;
  var isIE = scope.isIE;
  if (scope.useNative) {
    return;
  }
  if (isIE && typeof window.CustomEvent !== "function") {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
  initializeModules();
  var rootDocument = scope.rootDocument;
  function bootstrap() {
    HTMLImports.importer.bootDocument(rootDocument);
  }
  if (document.readyState === "complete" || document.readyState === "interactive" && !window.attachEvent) {
    bootstrap();
  } else {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }
})(HTMLImports);

window.CustomElements = window.CustomElements || {
  flags: {}
};

(function(scope) {
  var flags = scope.flags;
  var modules = [];
  var addModule = function(module) {
    modules.push(module);
  };
  var initializeModules = function() {
    modules.forEach(function(module) {
      module(scope);
    });
  };
  scope.addModule = addModule;
  scope.initializeModules = initializeModules;
  scope.hasNative = Boolean(document.registerElement);
  scope.useNative = !flags.register && scope.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || HTMLImports.useNative);
})(CustomElements);

CustomElements.addModule(function(scope) {
  var IMPORT_LINK_TYPE = window.HTMLImports ? HTMLImports.IMPORT_LINK_TYPE : "none";
  function forSubtree(node, cb) {
    findAllElements(node, function(e) {
      if (cb(e)) {
        return true;
      }
      forRoots(e, cb);
    });
    forRoots(node, cb);
  }
  function findAllElements(node, find, data) {
    var e = node.firstElementChild;
    if (!e) {
      e = node.firstChild;
      while (e && e.nodeType !== Node.ELEMENT_NODE) {
        e = e.nextSibling;
      }
    }
    while (e) {
      if (find(e, data) !== true) {
        findAllElements(e, find, data);
      }
      e = e.nextElementSibling;
    }
    return null;
  }
  function forRoots(node, cb) {
    var root = node.shadowRoot;
    while (root) {
      forSubtree(root, cb);
      root = root.olderShadowRoot;
    }
  }
  var processingDocuments;
  function forDocumentTree(doc, cb) {
    processingDocuments = [];
    _forDocumentTree(doc, cb);
    processingDocuments = null;
  }
  function _forDocumentTree(doc, cb) {
    doc = wrap(doc);
    if (processingDocuments.indexOf(doc) >= 0) {
      return;
    }
    processingDocuments.push(doc);
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
      if (n.import) {
        _forDocumentTree(n.import, cb);
      }
    }
    cb(doc);
  }
  scope.forDocumentTree = forDocumentTree;
  scope.forSubtree = forSubtree;
});

CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  var forSubtree = scope.forSubtree;
  var forDocumentTree = scope.forDocumentTree;
  function addedNode(node) {
    return added(node) || addedSubtree(node);
  }
  function added(node) {
    if (scope.upgrade(node)) {
      return true;
    }
    attached(node);
  }
  function addedSubtree(node) {
    forSubtree(node, function(e) {
      if (added(e)) {
        return true;
      }
    });
  }
  function attachedNode(node) {
    attached(node);
    if (inDocument(node)) {
      forSubtree(node, function(e) {
        attached(e);
      });
    }
  }
  var hasPolyfillMutations = !window.MutationObserver || window.MutationObserver === window.JsMutationObserver;
  scope.hasPolyfillMutations = hasPolyfillMutations;
  var isPendingMutations = false;
  var pendingMutations = [];
  function deferMutation(fn) {
    pendingMutations.push(fn);
    if (!isPendingMutations) {
      isPendingMutations = true;
      setTimeout(takeMutations);
    }
  }
  function takeMutations() {
    isPendingMutations = false;
    var $p = pendingMutations;
    for (var i = 0, l = $p.length, p; i < l && (p = $p[i]); i++) {
      p();
    }
    pendingMutations = [];
  }
  function attached(element) {
    if (hasPolyfillMutations) {
      deferMutation(function() {
        _attached(element);
      });
    } else {
      _attached(element);
    }
  }
  function _attached(element) {
    if (element.__upgraded__ && (element.attachedCallback || element.detachedCallback)) {
      if (!element.__attached && inDocument(element)) {
        element.__attached = true;
        if (element.attachedCallback) {
          element.attachedCallback();
        }
      }
    }
  }
  function detachedNode(node) {
    detached(node);
    forSubtree(node, function(e) {
      detached(e);
    });
  }
  function detached(element) {
    if (hasPolyfillMutations) {
      deferMutation(function() {
        _detached(element);
      });
    } else {
      _detached(element);
    }
  }
  function _detached(element) {
    if (element.__upgraded__ && (element.attachedCallback || element.detachedCallback)) {
      if (element.__attached && !inDocument(element)) {
        element.__attached = false;
        if (element.detachedCallback) {
          element.detachedCallback();
        }
      }
    }
  }
  function inDocument(element) {
    var p = element;
    var doc = wrap(document);
    while (p) {
      if (p == doc) {
        return true;
      }
      p = p.parentNode || p.host;
    }
  }
  function watchShadow(node) {
    if (node.shadowRoot && !node.shadowRoot.__watched) {
      flags.dom && console.log("watching shadow-root for: ", node.localName);
      var root = node.shadowRoot;
      while (root) {
        observe(root);
        root = root.olderShadowRoot;
      }
    }
  }
  function handler(mutations) {
    if (flags.dom) {
      var mx = mutations[0];
      if (mx && mx.type === "childList" && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || d.host && d.host.localName) || "";
          u = u.split("/?").shift().split("/").pop();
        }
      }
      console.group("mutations (%d) [%s]", mutations.length, u || "");
    }
    mutations.forEach(function(mx) {
      if (mx.type === "childList") {
        forEach(mx.addedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          addedNode(n);
        });
        forEach(mx.removedNodes, function(n) {
          if (!n.localName) {
            return;
          }
          detachedNode(n);
        });
      }
    });
    flags.dom && console.groupEnd();
  }
  function takeRecords(node) {
    node = wrap(node);
    if (!node) {
      node = wrap(document);
    }
    while (node.parentNode) {
      node = node.parentNode;
    }
    var observer = node.__observer;
    if (observer) {
      handler(observer.takeRecords());
      takeMutations();
    }
  }
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  function observe(inRoot) {
    if (inRoot.__observer) {
      return;
    }
    var observer = new MutationObserver(handler);
    observer.observe(inRoot, {
      childList: true,
      subtree: true
    });
    inRoot.__observer = observer;
  }
  function upgradeDocument(doc) {
    doc = wrap(doc);
    flags.dom && console.group("upgradeDocument: ", doc.baseURI.split("/").pop());
    addedNode(doc);
    observe(doc);
    flags.dom && console.groupEnd();
  }
  function upgradeDocumentTree(doc) {
    forDocumentTree(doc, upgradeDocument);
  }
  var originalCreateShadowRoot = Element.prototype.createShadowRoot;
  if (originalCreateShadowRoot) {
    Element.prototype.createShadowRoot = function() {
      var root = originalCreateShadowRoot.call(this);
      CustomElements.watchShadow(this);
      return root;
    };
  }
  scope.watchShadow = watchShadow;
  scope.upgradeDocumentTree = upgradeDocumentTree;
  scope.upgradeSubtree = addedSubtree;
  scope.upgradeAll = addedNode;
  scope.attachedNode = attachedNode;
  scope.takeRecords = takeRecords;
});

CustomElements.addModule(function(scope) {
  var flags = scope.flags;
  function upgrade(node) {
    if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
      var is = node.getAttribute("is");
      var definition = scope.getRegisteredDefinition(is || node.localName);
      if (definition) {
        if (is && definition.tag == node.localName) {
          return upgradeWithDefinition(node, definition);
        } else if (!is && !definition.extends) {
          return upgradeWithDefinition(node, definition);
        }
      }
    }
  }
  function upgradeWithDefinition(element, definition) {
    flags.upgrade && console.group("upgrade:", element.localName);
    if (definition.is) {
      element.setAttribute("is", definition.is);
    }
    implementPrototype(element, definition);
    element.__upgraded__ = true;
    created(element);
    scope.attachedNode(element);
    scope.upgradeSubtree(element);
    flags.upgrade && console.groupEnd();
    return element;
  }
  function implementPrototype(element, definition) {
    if (Object.__proto__) {
      element.__proto__ = definition.prototype;
    } else {
      customMixin(element, definition.prototype, definition.native);
      element.__proto__ = definition.prototype;
    }
  }
  function customMixin(inTarget, inSrc, inNative) {
    var used = {};
    var p = inSrc;
    while (p !== inNative && p !== HTMLElement.prototype) {
      var keys = Object.getOwnPropertyNames(p);
      for (var i = 0, k; k = keys[i]; i++) {
        if (!used[k]) {
          Object.defineProperty(inTarget, k, Object.getOwnPropertyDescriptor(p, k));
          used[k] = 1;
        }
      }
      p = Object.getPrototypeOf(p);
    }
  }
  function created(element) {
    if (element.createdCallback) {
      element.createdCallback();
    }
  }
  scope.upgrade = upgrade;
  scope.upgradeWithDefinition = upgradeWithDefinition;
  scope.implementPrototype = implementPrototype;
});

CustomElements.addModule(function(scope) {
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgrade = scope.upgrade;
  var upgradeWithDefinition = scope.upgradeWithDefinition;
  var implementPrototype = scope.implementPrototype;
  var useNative = scope.useNative;
  function register(name, options) {
    var definition = options || {};
    if (!name) {
      throw new Error("document.registerElement: first argument `name` must not be empty");
    }
    if (name.indexOf("-") < 0) {
      throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(name) + "'.");
    }
    if (isReservedTag(name)) {
      throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(name) + "'. The type name is invalid.");
    }
    if (getRegisteredDefinition(name)) {
      throw new Error("DuplicateDefinitionError: a type with name '" + String(name) + "' is already registered");
    }
    if (!definition.prototype) {
      definition.prototype = Object.create(HTMLElement.prototype);
    }
    definition.__name = name.toLowerCase();
    definition.lifecycle = definition.lifecycle || {};
    definition.ancestry = ancestry(definition.extends);
    resolveTagName(definition);
    resolvePrototypeChain(definition);
    overrideAttributeApi(definition.prototype);
    registerDefinition(definition.__name, definition);
    definition.ctor = generateConstructor(definition);
    definition.ctor.prototype = definition.prototype;
    definition.prototype.constructor = definition.ctor;
    if (scope.ready) {
      upgradeDocumentTree(document);
    }
    return definition.ctor;
  }
  function overrideAttributeApi(prototype) {
    if (prototype.setAttribute._polyfilled) {
      return;
    }
    var setAttribute = prototype.setAttribute;
    prototype.setAttribute = function(name, value) {
      changeAttribute.call(this, name, value, setAttribute);
    };
    var removeAttribute = prototype.removeAttribute;
    prototype.removeAttribute = function(name) {
      changeAttribute.call(this, name, null, removeAttribute);
    };
    prototype.setAttribute._polyfilled = true;
  }
  function changeAttribute(name, value, operation) {
    name = name.toLowerCase();
    var oldValue = this.getAttribute(name);
    operation.apply(this, arguments);
    var newValue = this.getAttribute(name);
    if (this.attributeChangedCallback && newValue !== oldValue) {
      this.attributeChangedCallback(name, oldValue, newValue);
    }
  }
  function isReservedTag(name) {
    for (var i = 0; i < reservedTagList.length; i++) {
      if (name === reservedTagList[i]) {
        return true;
      }
    }
  }
  var reservedTagList = [ "annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph" ];
  function ancestry(extnds) {
    var extendee = getRegisteredDefinition(extnds);
    if (extendee) {
      return ancestry(extendee.extends).concat([ extendee ]);
    }
    return [];
  }
  function resolveTagName(definition) {
    var baseTag = definition.extends;
    for (var i = 0, a; a = definition.ancestry[i]; i++) {
      baseTag = a.is && a.tag;
    }
    definition.tag = baseTag || definition.__name;
    if (baseTag) {
      definition.is = definition.__name;
    }
  }
  function resolvePrototypeChain(definition) {
    if (!Object.__proto__) {
      var nativePrototype = HTMLElement.prototype;
      if (definition.is) {
        var inst = document.createElement(definition.tag);
        var expectedPrototype = Object.getPrototypeOf(inst);
        if (expectedPrototype === definition.prototype) {
          nativePrototype = expectedPrototype;
        }
      }
      var proto = definition.prototype, ancestor;
      while (proto && proto !== nativePrototype) {
        ancestor = Object.getPrototypeOf(proto);
        proto.__proto__ = ancestor;
        proto = ancestor;
      }
      definition.native = nativePrototype;
    }
  }
  function instantiate(definition) {
    return upgradeWithDefinition(domCreateElement(definition.tag), definition);
  }
  var registry = {};
  function getRegisteredDefinition(name) {
    if (name) {
      return registry[name.toLowerCase()];
    }
  }
  function registerDefinition(name, definition) {
    registry[name] = definition;
  }
  function generateConstructor(definition) {
    return function() {
      return instantiate(definition);
    };
  }
  var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
  function createElementNS(namespace, tag, typeExtension) {
    if (namespace === HTML_NAMESPACE) {
      return createElement(tag, typeExtension);
    } else {
      return domCreateElementNS(namespace, tag);
    }
  }
  function createElement(tag, typeExtension) {
    var definition = getRegisteredDefinition(typeExtension || tag);
    if (definition) {
      if (tag == definition.tag && typeExtension == definition.is) {
        return new definition.ctor();
      }
      if (!typeExtension && !definition.is) {
        return new definition.ctor();
      }
    }
    var element;
    if (typeExtension) {
      element = createElement(tag);
      element.setAttribute("is", typeExtension);
      return element;
    }
    element = domCreateElement(tag);
    if (tag.indexOf("-") >= 0) {
      implementPrototype(element, HTMLElement);
    }
    return element;
  }
  function cloneNode(deep) {
    var n = domCloneNode.call(this, deep);
    upgrade(n);
    return n;
  }
  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);
  var domCloneNode = Node.prototype.cloneNode;
  var isInstance;
  if (!Object.__proto__ && !useNative) {
    isInstance = function(obj, ctor) {
      var p = obj;
      while (p) {
        if (p === ctor.prototype) {
          return true;
        }
        p = p.__proto__;
      }
      return false;
    };
  } else {
    isInstance = function(obj, base) {
      return obj instanceof base;
    };
  }
  document.registerElement = register;
  document.createElement = createElement;
  document.createElementNS = createElementNS;
  Node.prototype.cloneNode = cloneNode;
  scope.registry = registry;
  scope.instanceof = isInstance;
  scope.reservedTagList = reservedTagList;
  scope.getRegisteredDefinition = getRegisteredDefinition;
  document.register = document.registerElement;
});

(function(scope) {
  var useNative = scope.useNative;
  var initializeModules = scope.initializeModules;
  var isIE11OrOlder = /Trident/.test(navigator.userAgent);
  if (useNative) {
    var nop = function() {};
    scope.watchShadow = nop;
    scope.upgrade = nop;
    scope.upgradeAll = nop;
    scope.upgradeDocumentTree = nop;
    scope.upgradeSubtree = nop;
    scope.takeRecords = nop;
    scope.instanceof = function(obj, base) {
      return obj instanceof base;
    };
  } else {
    initializeModules();
  }
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  if (!window.wrap) {
    if (window.ShadowDOMPolyfill) {
      window.wrap = ShadowDOMPolyfill.wrapIfNeeded;
      window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded;
    } else {
      window.wrap = window.unwrap = function(node) {
        return node;
      };
    }
  }
  function bootstrap() {
    upgradeDocumentTree(wrap(document));
    if (window.HTMLImports) {
      HTMLImports.__importsParsingHook = function(elt) {
        upgradeDocumentTree(wrap(elt.import));
      };
    }
    CustomElements.ready = true;
    setTimeout(function() {
      CustomElements.readyTime = Date.now();
      if (window.HTMLImports) {
        CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
      }
      document.dispatchEvent(new CustomEvent("WebComponentsReady", {
        bubbles: true
      }));
    });
  }
  if (isIE11OrOlder && typeof window.CustomEvent !== "function") {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent("CustomEvent");
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
  if (document.readyState === "complete" || scope.flags.eager) {
    bootstrap();
  } else if (document.readyState === "interactive" && !window.attachEvent && (!window.HTMLImports || window.HTMLImports.ready)) {
    bootstrap();
  } else {
    var loadEvent = window.HTMLImports && !HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
    window.addEventListener(loadEvent, bootstrap);
  }
})(window.CustomElements);

(function(scope) {
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(scope) {
      var self = this;
      var args = Array.prototype.slice.call(arguments, 1);
      return function() {
        var args2 = args.slice();
        args2.push.apply(args2, arguments);
        return self.apply(scope, args2);
      };
    };
  }
})(window.WebComponents);

(function(scope) {
  "use strict";
  if (!window.performance) {
    var start = Date.now();
    window.performance = {
      now: function() {
        return Date.now() - start;
      }
    };
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function() {
      var nativeRaf = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
      return nativeRaf ? function(callback) {
        return nativeRaf(function() {
          callback(performance.now());
        });
      } : function(callback) {
        return window.setTimeout(callback, 1e3 / 60);
      };
    }();
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function() {
      return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(id) {
        clearTimeout(id);
      };
    }();
  }
  var elementDeclarations = [];
  var polymerStub = function(name, dictionary) {
    if (typeof name !== "string" && arguments.length === 1) {
      Array.prototype.push.call(arguments, document._currentScript);
    }
    elementDeclarations.push(arguments);
  };
  window.Polymer = polymerStub;
  scope.consumeDeclarations = function(callback) {
    scope.consumeDeclarations = function() {
      throw "Possible attempt to load Polymer twice";
    };
    if (callback) {
      callback(elementDeclarations);
    }
    elementDeclarations = null;
  };
  function installPolymerWarning() {
    if (window.Polymer === polymerStub) {
      window.Polymer = function() {
        throw new Error("You tried to use polymer without loading it first. To " + 'load polymer, <link rel="import" href="' + 'components/polymer/polymer.html">');
      };
    }
  }
  if (HTMLImports.useNative) {
    installPolymerWarning();
  } else {
    addEventListener("DOMContentLoaded", installPolymerWarning);
  }
})(window.WebComponents);

(function(scope) {
  var style = document.createElement("style");
  style.textContent = "" + "body {" + "transition: opacity ease-in 0.2s;" + " } \n" + "body[unresolved] {" + "opacity: 0; display: block; overflow: hidden; position: relative;" + " } \n";
  var head = document.querySelector("head");
  head.insertBefore(style, head.firstChild);
})(window.WebComponents);

(function(scope) {
  window.Platform = scope;
})(window.WebComponents);
(function() {
'use strict';

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

}());

(function() {
'use strict';

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

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
            position = position || 0;
            return this.lastIndexOf(searchString, position) === position;
        }
    });
}

if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

var configs = {
    templateEngine: 'default',
    injectionMode:  'light-dom',
    declarationTag: 'web-component'
};

var Flipper = {
    version: '@@VERSION@@',
    configs: configs
};

Flipper.config = function(key, value) {
    if (typeof key === 'object' && arguments.length === 1) {
        utils.mixin(configs, key);
    } else if (typeof key === 'string' && arguments.length === 2) {
        configs[key] = value;
    } else {
        throw new Error('unsupoorted config type. key: ' + key + ', value: ' + value);
    }
};

var utils = {};

utils.noop = function() {};

utils.format = function format(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

utils.isPromise = function isPromise(obj) {
    return obj && typeof obj.then === 'function';
};

utils.mixin = function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        Object.defineProperty(to, name,
            Object.getOwnPropertyDescriptor(from, name)
        );
    });
};

utils.log = function log() {
    var msg = utils.format.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};


utils.resolveUri = function(target, baseUri) {
    return new URL(target, baseUri).toString();
};

utils.eachChildNodes = function(ele, checkFn, callbackFn) {
    var child, i, len,
        hasCheckFn = typeof checkFn === 'function';

    if (ele.childNodes) {
        for (i = 0, len = ele.childNodes.length; i < len; i += 1) {
            child = ele.childNodes[i];

            if (!hasCheckFn || checkFn(child)) {
                callbackFn(child);
            }
        }
    }
};

Flipper.utils = utils;

var templateEngines = {};

function registerTemplateEngine(name, engine) {
    if (typeof name !== 'string' || !engine) {
        throw new Error('template engine arg have wrong format');
    }

    if (templateEngines[name]) {
        throw new Error('template engine [' + name + '] is already registered');
    }

    if (typeof engine.render !== 'function') {
        throw new Error('could not found render method for engine: ' + name);
    }


    var views = {};

    function throwIfViewIdError(viewId) {
        if (typeof viewId !== 'string' || !viewId) {
            throw new Error('view id has wrong format');
        }
    }

    templateEngines[name] = {
        hasView: function(viewId) {
            throwIfViewIdError(viewId);
            return !!views[viewId];
        },
        getView: function(viewId) {
            throwIfViewIdError(viewId);
            return views[viewId];
        },
        addView: function(viewId, viewContent) {
            throwIfViewIdError(viewId);

            if (typeof viewContent !== 'string') {
                throw new Error('view content must be string');
            }

            views[viewId] = viewContent;
        },
        renderView: function(viewId, model, options) {
            throwIfViewIdError(viewId);
            var view = views[viewId];

            if (!view) {
                throw new Error(
                    'could not found view "' + viewId + '" on engine ' + name);
            }

            options.viewId = viewId;
            return engine.render(view, model, options);
        }
    };
}

function getTemplateEngine(name) {
    if (!templateEngines[name]) {
        throw new Error('could not found the template engine: ' + name);
    }
    return templateEngines[name];
}

registerTemplateEngine('default', {
    render: function(viewContent) {
        return viewContent;
    }
});

Flipper.registerTemplateEngine = registerTemplateEngine;
Flipper.getTemplateEngine = getTemplateEngine;

Flipper.require = function() {
    window.require.apply(null, arguments);
};

Flipper.require.check = function() {
    return !!window.require;
};

var dataCenter = {},
    dataCenterUsage = {};

var uniqueId = 0;
function getUnqiueId() {
    uniqueId += 1;
    return uniqueId;
}

function requestModelSpace(model) {
    var spaceId = getUnqiueId();
    dataCenter[spaceId] = model;
    dataCenterUsage[spaceId] = 0;
    return spaceId;
}

function getModelSpace(spaceId) {
    return dataCenter[spaceId];
}

function removeModelSpace(spaceId) {
    if (spaceId && dataCenter[spaceId] !== undefined) {
        delete dataCenter[spaceId];
        delete dataCenterUsage[spaceId];
    }
}

function linkModelSpace(spaceId) {
    if (dataCenterUsage[spaceId] !== undefined) {
        dataCenterUsage[spaceId] += 1;
    }
}

function unlinkModelSpace(spaceId) {
    if (dataCenterUsage[spaceId] !== undefined) {
        dataCenterUsage[spaceId] -= 1;

        if (dataCenterUsage[spaceId] <= 0) {
            removeModelSpace(spaceId);
        }
    }
}

Flipper.dataCenter = {
    _warehouse:   dataCenter,
    requestSpace: requestModelSpace,
    removeSpace:  removeModelSpace,
    getSpace:     getModelSpace,
    linkSpace:    linkModelSpace,
    unlinkSpace:  unlinkModelSpace
};

Flipper.requestSpace = requestModelSpace;
Flipper.removeSpace  = removeModelSpace;


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
var DEF_DIST_COUNT = 2;

function ComponentDefinition() {
    this.countOfProto = DEF_DIST_COUNT;
    this.proto = {};   /* the prototoype of element */

    this.countOfModules = DEF_DIST_COUNT;
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

    this.resolveViews();
}

function throwIfAlreadResolved(currentCount, name) {
    if (currentCount === 0) {
        throw new Error('component declaration [' + name + '] is already registered');
    }
}

function goThroughIfReady(currentCount, goThrough) {
    if (currentCount === 0) {
        goThrough();
    }
}

ComponentDefinition.prototype = {
    ready: function(onFulfillment, onRejection) {
        return this.promiseAll.then(onFulfillment, onRejection);
    },
    mixinProto: function(newProto) {
        var self = this;
        function mixin(obj) {
            throwIfAlreadResolved(self.countOfProto, 'element prototype');
            utils.mixin(self.proto, obj);
            self.countOfProto -= 1;
            goThroughIfReady(self.countOfProto, self.resolveProto.bind(self));

        }

        if (typeof newProto === 'object') {
            mixin(newProto);
        } else if (typeof newProto === 'function') {
            self.promises.modules.then(function(modules) {
                var protoObj = newProto.apply(null, modules);
                mixin(protoObj);
            });
        } else {
            throw new Error('element prototype has wrong format');
        }
    },
    resolveProto: function() {
        this.promises.proto.resolve(this.proto);
    },
    mixinModules: function(modules) {
        var self = this;

        throwIfAlreadResolved(self.countOfModules, 'element dependencies');

        if (modules) {
            this.modules = modules;
        }
        this.countOfModules -= 1;
        goThroughIfReady(self.countOfModules, self.resolveModules.bind(self));

    },
    resolveModules: function() {
        this.promises.modules.resolve(this.modules);
    },
    rejectModules: function(reason) {
        this.promises.modules.reject(reason);
    },
    resolveViews: function() {
        this.promises.views.resolve(this.views);
    }
};


var COMPONENT_STATUS = {
    ERROR: 'ERROR', // -1,
    INITIALIZING: 'INITIALIZING', //0,
    INITIALIZED: 'INITIALIZED' //1
};

/* component helpers */
function throwIfAlreadyRegistered(component) {
    if (component.status === COMPONENT_STATUS.INITIALIZED) {
        throw new Error('component ' + component.name + ' is already registered');
    }
}

function hoistAttributes(component, options, keys) {
    keys.forEach(function(key) {
        if (options[key]) {
            component[key] = options[key];
        }
    });
}

function hoistWatchers(component, options) {
    var watchers = component.watchers;

    var suffix = 'Changed';

    function parseCamel(str) {
        var result = str.replace(/([A-Z])/g, function(mat) {
            return '-' + mat.toLowerCase();
        });

        return result.charAt(0) === '-' ? result.substr(1) : result;
    }

    Object.keys(options).forEach(function(key) {
        /* endsWith method is polyfill by Flipper */
        if (key.endsWith(suffix) && typeof options[key] === 'function') {
            var attrName = parseCamel( key.substr(0, key.length - suffix.length) );
            watchers[attrName] = key;
        }
    });
}

function handleViews(component, options) {
    if (typeof options.template === 'string') {
        component.addView(options.template, 'index');
    }

    if (typeof options.template === 'object') {
        Object.keys(options.template).forEach(function(key) {
            component.addView(options.template[key], key);
        });
    }
}

function handleStyle(component, options) {
    if (options.style) {
        component.style = options.style;
    }
}

function logError(err) {
    console.error(err.stack || err);
}

/* Element Prototype */
var LIFE_EVENTS = [
    'initialize',
    'fetch',
    'adapt',
    'render',
    'ready',
    'destroy',
    'fail'
];

var PUBLIC_LIFE_EVENTS = [
    'fetch', 'adapt', 'render'
];

function mixinElementProto(component, elementProto) {
    var targetProto = component.elementProto;

    Object.getOwnPropertyNames(elementProto).forEach(function(name) {
        if (name === 'model') {
            targetProto.model = elementProto.model;
        } else if (LIFE_EVENTS.lastIndexOf(name) > -1 ) {
            Object.defineProperty(targetProto._lifeCycle, name,
                Object.getOwnPropertyDescriptor(elementProto, name)
            );
            if (PUBLIC_LIFE_EVENTS.lastIndexOf(name) > -1 ) {
                Object.defineProperty(targetProto, name,
                    Object.getOwnPropertyDescriptor(elementProto, name)
                );
            }
        } else {
            Object.defineProperty(targetProto, name,
                Object.getOwnPropertyDescriptor(elementProto, name)
            );
        }
    });
}

function hasLifeCycleEvent(element, methodName) {
    return typeof element._lifeCycle[methodName] === 'function';
}

function callLifeCycleEvent(element, methodName, args) {
    return element._lifeCycle[methodName].apply(element, args);
}

function tryCallLifeCycleEvent(element, methodName, args) {
    if (hasLifeCycleEvent(element, methodName)) {
        return callLifeCycleEvent(element, methodName, args);
    }
}

function createElementProto(component) {
    var elementProto = Object.create(HTMLElement.prototype);

    elementProto._lifeCycle = {};

    function wrapCallback(key) {
        var callback = component[key];
        return function() {
            callback.call(component, this, arguments);
        };
    }
    Object.defineProperties(elementProto, {
        model: {
            value: undefined,
            writable: true
        },
        modelId: {
            value: '',
            writable: true
        },
        getView: {
            value: component.getView.bind(component)
        },
        renderView: {
            value: function(viewName, data, options) {
                if (typeof viewName === 'object') {
                    options = data;
                    data = viewName;
                    viewName = 'index';
                }
                options = options || {};
                options.element = this;
                return component.renderView(viewName, data, options);
            }
        },
        refresh: {
            value: function(refetchOrNewModel, callback) {
                /*jshint -W024 */

                var refetch = false, model;

                if (typeof refetchOrNewModel === 'function') {
                    callback = refetchOrNewModel;
                } else if (refetchOrNewModel === true) {
                    refetch = true;
                } else if (typeof refetchOrNewModel === 'object') {
                    model = refetchOrNewModel;
                }

                if (typeof callback !== 'function') {
                    callback = function() {};
                }

                var element = this;

                function handleRefresh() {
                    if (refetch) {
                        return component.handleElement(element);
                    } else  if (model) {
                        return component.fetchModel(element, model).then(function() {
                            return component.renderNode(element);
                        });
                    } else {
                        return component.renderNode(element);
                    }
                }

                return Promise.resolve()
                        .then(component.renderBegin.bind(component, element))
                        .then(handleRefresh)
                        .then(component.renderEnd.bind(component, element))
                        .then(callback.bind(element))
                        .catch(component.renderFail.bind(component, element));
            }
        },
        createdCallback: {
            value: wrapCallback('createdCallback')
        },
        attachedCallback: {
            value: wrapCallback('attachedCallback')
        },
        detachedCallback: {
            value: wrapCallback('detachedCallback')
        },
        attributeChangedCallback: {
            value: wrapCallback('attributeChangedCallback')
        }
    });

    return elementProto;
}

/* Component Constructor */
function Component(name) {
    this.name = name;
    this.status = COMPONENT_STATUS.INITIALIZING;

    this.elementProto = createElementProto(this);
    this.definition = new ComponentDefinition();

    this.templateEngine = 'default';
    this.injectionMode  = 'light-dom';

    this.model = {};
    this.views = {};
    this.style = '';

    this.helpers = {};
    this.watchers = {};

    this.definition.ready(
        this.initialize.bind(this),
        this.markFailed.bind(this)
    );
}


Component.prototype = {
    /* event */
    on: function(name, fn) {
        if (!this._events) {
            this._events = {};
        }

        if (!this._events[name]) {
            this._events[name] = [];
        }

        this._events[name].push(fn);
    },
    fire: function(name) {
        if (this._events && this._events[name]) {
            this._events[name].forEach(function(fn) {
                fn();
            });
        }
    },

    /* initialize */
    isReady: function() {
        return this.status === COMPONENT_STATUS.INITIALIZED;
    },
    prepare: function(elementProto) {
        throwIfAlreadyRegistered(this);

        if (elementProto) {
            mixinElementProto(this, elementProto);
            hoistAttributes(this, elementProto,
                [ 'templateEngine', 'injectionMode', 'definitionEle', 'helpers' ]
            );

            hoistWatchers(this, elementProto);

            handleViews(this, elementProto);
            handleStyle(this, elementProto);
        }
    },
    initialize: function() {
        throwIfAlreadyRegistered(this);
        this.prepare(this.definition.proto);
        document.registerElement(this.name, {
            prototype: this.elementProto
        });

        this.status = COMPONENT_STATUS.INITIALIZED;
        this.definition = null;

        this.fire('initialized');
    },
    markFailed: function(error) {
        this.status = COMPONENT_STATUS.ERROR;

        if (typeof error === 'string') {
            error = new Error(error);
        }

        this.fire('initialized', error);

        if (error) {
            throw error;
        }
    },

    /* configuration methods */
    addView: function(viewTpl, viewName) {
        this.views[viewName || 'index'] = viewTpl + '';
    },
    getView: function(viewName) {
        var result;

        viewName = viewName || 'index';

        if (this.views[viewName]) {
            result = this.views[viewName];
        }

        var setupTplIfIdMatched = function(ele) {
            if ( (ele.id || 'index') === viewName) {
                result = ele.innerHTML;
            }
        };

        if (!result) {
            utils.eachChildNodes(this.definitionEle, function(ele) {
                return ele.tagName && ele.tagName.toLowerCase() === 'template';
            }, function(ele) {
                return setupTplIfIdMatched(ele);
            });
        }

        if (!result) {
            utils.eachChildNodes(this.definitionEle, function(ele) {
                return ele.tagName && ele.tagName.toLowerCase() === 'script' &&
                        ele.getAttribute('type') === 'template';
            }, function(ele) {
                return setupTplIfIdMatched(ele);
            });
        }

        if (!result && viewName === 'index') {
            result = ' '; /* index view can ignore */
        }

        return result || '';
    },
    renderView: function(viewName, data, options) {
        viewName = viewName || 'index';

        var templateEngine = Flipper.getTemplateEngine(this.templateEngine),
            viewId = this.name + '-' + viewName;

        if (!templateEngine.hasView(viewId)) {
            templateEngine.addView(viewId, this.getView(viewName));
        }

        return templateEngine.renderView(viewId, data, options);
    },

    /* created / attached cycle methods */
    createdCallback: function(element) {
        /*jshint -W024 */
        Promise.resolve()
            .then(this.renderBegin.bind(this, element))
            .then(this.initElement.bind(this, element))
            .then(this.handleElement.bind(this, element))
            .then(this.renderEnd.bind(this, element))
            .catch(this.renderFail.bind(this, element))
            .then(this.addStyle.bind(this, element));

    },
    renderBegin: function(element) {
        element.setAttribute('unresolved', '');
    },
    initElement: function(element) {
        return tryCallLifeCycleEvent(element, 'initialize');
    },
    handleElement: function(element) {
        return Promise.resolve()
            .then(this.fetchModel.bind(this, element))
            .then(this.renderNode.bind(this, element));
    },
    fetchModel: function(element, model) {
        var result, modelId;

        if (model) {
            modelId = '';
            result = model;
        } else if (hasLifeCycleEvent(element, 'fetch')) {
            modelId = '';
            result = callLifeCycleEvent(element, 'fetch');
        } else if (element.hasAttribute('model-id')) {
            modelId = element.getAttribute('model-id');
            result = Flipper.dataCenter.getSpace(modelId);
        }

        return Promise.resolve(result).then(function(model) {
            if (model !== undefined) {
                element.model = model;

                /* if the model not registered then register it */
                if (!modelId) {
                    modelId = Flipper.dataCenter.requestSpace(model);
                }

                /* add one link */
                Flipper.dataCenter.linkSpace(modelId);
                element.modelId = modelId;
            }
        });
    },
    renderNode: function(element) {
        if (hasLifeCycleEvent(element, 'render')) {
            return callLifeCycleEvent(element, 'render');
        } else {
            return Promise.resolve()
                .then(this.formatModel.bind(this, element))
                .then(this.renderHTML.bind(this, element))
                .then(this.createTree.bind(this, element));
        }
    },
    formatModel: function(element) {
        /* must return model, it will be dispatched to renderHTML method */
        if (hasLifeCycleEvent(element, 'adapt')) {
            return callLifeCycleEvent(element, 'adapt', [ element.model ]);
        } else {
            return element.model;
        }
    },
    renderHTML: function(element, model) {
        var viewName = 'index',
            commands = element.commands;

        if (typeof commands === 'function') {
            commands = commands.call(element);
        }

        return this.renderView(viewName, model, {
            element:  element,
            commands: commands
        });
    },
    createTree: function(element, html) {
        /* if no specific value, then get from flipper global config */
        var isLightDom = this.injectionMode === 'light-dom' || 'light';

        var target = isLightDom ? element : element.createShadowRoot();

        target.innerHTML = html;
    },
    addStyle: function(element) {
        var style = document.createElement('style');
        style.textContent = this.style;
        style.setAttribute('referance-to', this.name);

        if (element.shadowRoot && element.shadowRoot.innerHTML) {
            element.shadowRoot.appendChild(style);
        } else {
            var existsStyle =
                document.querySelector('style[referance-to="' + this.name + '"]');
            if (!existsStyle) {
                (document.head || document.body).appendChild(style);
            }
        }

    },
    /* refersh flow */
    renderFail: function(element, err) {
        logError(err);
        var result = tryCallLifeCycleEvent(element, 'fail', [ err ] );
        return Promise.resolve(result).then(function() {
            var readyEvent = new CustomEvent('fail');
            element.dispatchEvent(readyEvent);
        });
    },
    renderEnd: function(element) {
        var result = tryCallLifeCycleEvent(element, 'ready');

        return Promise.resolve(result).then(function() {
            element.removeAttribute('unresolved');
            var readyEvent = new CustomEvent('ready');
            element.dispatchEvent(readyEvent);

            //$(element).trigger('ready');
        });
    },

    /* detach cycle methods */
    detachedCallback: function(element) {
        this.destroy(element);
    },
    destroy: function(element) {
        tryCallLifeCycleEvent(element, 'destroy');

        if (element.modelId) {
            Flipper.dataCenter.unlinkSpace(element.modelId);
            element.modelId = undefined;
            element.model = undefined;
        }
    },

    /* attribute changed callback */
    attachedCallback: function() {

    },
    attributeChangedCallback: function(element, args) {
        var watchers, attrName, changedCallback;
        if (typeof element.attributeChanged === 'function') {
            element.attributeChanged.apply(element, args);
        } else {
            watchers = this.watchers;
            attrName = args[0];

            if (watchers[attrName]) {
                changedCallback = element[watchers[attrName]];
                if (typeof changedCallback === 'function') {
                    changedCallback.apply(element,
                        Array.prototype.slice.call(args, 1)
                    );
                }
            }
        }
    },

    /* helpers */
    setHelpers: function(helpers) {
        this.helpers = helpers;
    },
    getHelpers: function() {
        return this.helpers;
    }
};

Flipper.Component = Component;

var components = {};

function createComponent(name) {
    var component = components[name];
    if (!component) {
        component = components[name] = new Flipper.Component(name);
    }

    if (component.isReady()) {
        throw new Error('component ' + component.name + ' is already registered');
    }

    return components[name];
}

/**
 *  dom related methods
 */

 function tryGetBaseUri() {
    // TODO: polyfill if baseURI is not exists
    return document.baseURI;
 }

function tryGetBaseUriFromNode(node) {
    var baseURI = node.ownerDocument ? node.ownerDocument.baseURI : '';
    return baseURI || tryGetBaseUri();
}

function tryGetCurrentScript() {
    /* the current script prop is polyfill from webcomponentsjs */
    return document._currentScript || document.currentScript;
}

function tryGetWrapperFromCurrentScript() {
    var script = tryGetCurrentScript();
    return script ? script.parentNode : undefined;
}

function tryGetBaseUriFromCurrentScript() {
    var script = tryGetCurrentScript();
    return script ? script.baseURI : tryGetBaseUri();
}

function tryGetNameFromCurrentScript() {
    var wrapper = tryGetWrapperFromCurrentScript();
    return wrapper ? wrapper.getAttribute('name') : '';
}

/**
 * register helper
 */
function parseFactoryArgs(name, dependencies, elementProto) {
    /* Flipper.register( [ dep1, dep2], { ... } ); */
    if (Array.isArray(name)) {
        elementProto = dependencies;
        dependencies = name;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register( { ... } ); */
    } else if (typeof name === 'object' || name === undefined) {
        elementProto = name;
        dependencies = undefined;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register('xxx', { ... } ); */
    } else if (typeof name === 'string' && !Array.isArray(dependencies)) {
        elementProto = dependencies;
        dependencies = undefined;
    }
    /* else Flipper.register('xxx', [ dep1, dep2 ], { ... } ); */

    return {
        name: name,
        dependencies: dependencies,
        elementProto: elementProto
    };
}

function collectStyleFromNode(node) {
    var baseURI = tryGetBaseUriFromNode(node),
        style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var linkEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'link' &&
                ele.getAttribute('rel') === 'stylesheet';
        }, function(ele) {
            linkEles.push(ele);
        });

        linkEles.forEach(function(ele) {
            var href = new URL(ele.getAttribute('href'), baseURI);
            style += '@import "' + href + '";';
            node.removeChild(ele);
        });
    }

    function extractStyleElement() {
        var styleEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'style';
        }, function(ele) {
            styleEles.push(ele);
        });

        styleEles.forEach(function(ele) {
            var styleContent = ele.innerHTML;
            style += styleContent;
            node.removeChild(ele);
        });
    }

    extractStyleSheet();
    extractStyleElement();

    return style;
}


function wakeComponentUpIfTimeout(component) {
    if (component.isReady()) {
        return;
    }

    var timer = setTimeout(function() {
        if (component.isReady()) {
            return;
        }

        component.initialize();
        throw new Error('component ' + component.name + ' is initialized automatically' +
            ', forgot [noscript] attribute? ');
    }, 10000);

    component.on('initialized', function() {
        clearTimeout(timer);
    });
}

/**
 * register a component
 */
 function registerComponent(componentArgs, isStandalone) {
    var name = componentArgs.name,
        elementProto = componentArgs.elementProto,
        dependencies = componentArgs.dependencies;

    if (!name) {
        throw new Error('component name could not be inferred.');
    }


    /* it will create new component or return pending component */
    var component = createComponent(name),
        definition = component.definition;


    if (!elementProto) {
         component.markFailed(
            'component [' + name + '] prototype could not be inferred.');
         return;
    }

     function markRegistrationCompleted(modules) {
        /* if the elementProto is function,
           it will be executed after dependency module loaded,
           and the returing value will be assigned as element proto */
        definition.mixinProto(elementProto);

        /* we need to call mixin modules even there is no dependencies,
           since the ready method will be called after mixin twice */
        definition.mixinModules(modules);

        /* in normal case, the register method will be called from
                1. definition tag: <web-component>
                2. register method: Flipper.register()

           if the component only has one registration fn,
                then call resolve method directly */
        if (isStandalone) {
            definition.resolveProto();
            definition.resolveModules();
        } else {
            wakeComponentUpIfTimeout(component);
        }
     }

     if (dependencies) {
         var baseURI = tryGetBaseUriFromCurrentScript();
         dependencies = dependencies.map(function(id) {
             if (id.charAt(0) === '.') {
                 return utils.resolveUri(id, baseURI);
             } else {
                 return id;
             }
         });

         if (Flipper.require.check()) {
            Flipper.require(dependencies, {
                success: function() {
                    markRegistrationCompleted(arguments);
                },
                error: function(moduleA) {
                    var error = 'error';
                    if (moduleA && moduleA.error && moduleA.error.exception) {
                        error = moduleA.error.exception;
                    }

                    component.markFailed(error);
                }
            });
         } else {
            component.markFailed('could not found the global module loader');
         }

     } else {
        markRegistrationCompleted();
     }
 }

 /**
  * register from script, e.g. Flipper.register( 'xxx', ... );
  */
function registerFromFactoryScript(name, dependencies, elementProto) {
    var componentArgs = parseFactoryArgs(name, dependencies, elementProto);


    var isStandalone = true,
        wrapperEle = tryGetWrapperFromCurrentScript(),
        wrapperTag = wrapperEle ? wrapperEle.tagName.toLowerCase() : '';

    if (wrapperTag === Flipper.configs.declarationTag) {
        isStandalone = false;
    }

    /* if call Flipper.register directly without <web-component> tag,
        then it is standalone,
        otherwise it should need <web-component> element parsed */

    /* in polyfill, <web-component> will be exeuted after script called */
    registerComponent(componentArgs, isStandalone);
}

/**
 * register from declaration tag, e.g <web-component name="xxx">...</web-component>
 */
function registerFromDeclarationTag(ele) {
    var elementProto, componentArgs;

    elementProto = {
        definitionEle: ele,
        style: collectStyleFromNode(ele),
        templateEngine: ele.getAttribute('template-engine'),
        injectionMode:  ele.getAttribute('injection-mode')
    };

    componentArgs = {
        name: ele.getAttribute('name'),
        dependencies: undefined,
        elementProto: elementProto
    };

    var isStandalone = false;

    if (ele.hasAttribute('noscript')) {
        isStandalone = true;
    }

    /* if the <web-component> has noscript attr,
        then it is standalone,
        otherwise it need to wait Flipper.register() called */
    registerComponent(componentArgs, isStandalone);
}


/**
 * exports APIs
 */
Flipper.define = Flipper.register = registerFromFactoryScript;

document.registerElement(Flipper.configs.declarationTag /* web-component */, {
    prototype: Object.create(HTMLElement.prototype, {
        createdCallback: {
            value: function() {
                registerFromDeclarationTag(this);
            }
        }
    })
});

if (window.FlipperPolyfill) {
    window.FlipperPolyfill.flushDeclaration(Flipper.register.bind(Flipper));
}

Flipper.getComponent = function getComponent(name) {
    return components[name];
};

Flipper.getComponentHelpers = function getComponentHelpers(name) {
    var component = components[name];

    return component ? component.getHelpers() : {};
};

Flipper.components = components;

var packages = {};

function endsWtih(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getPackage(str) {
    var match = /(\w+)\//.exec(str);
    return match ? match[1] : '';
}

Flipper.config = function(name, options) {
    if (name === 'packages' && typeof options === 'object') {
        Object.keys(options).forEach(function(key) {
            packages[key] = options[key];
        });
    }
};

Flipper.imports = function() {
    var baseURI = document.baseURI,
        components = Array.prototype.slice.call(arguments, 0);

    if (components) {
        var frag = document.createDocumentFragment();

        components.map(function(name) {
            var pkg = getPackage(name);

            if (pkg && packages[pkg] && packages[pkg].base) {
                name = packages[pkg].base + name.substr(pkg.length);
            }

            if ( endsWtih(name, '/') ) {
                name += 'index.html';
            }


            return new URL(name, baseURI).toString();
        }).forEach(function(url) {
            var link = document.createElement('link');
            link.rel = 'import';
            link.href = url;
            frag.appendChild(link);
        });

        document.head.appendChild(frag);
    }
};

Flipper.findShadow = function(target, selector) {
    return target.shadowRoot.querySelectorAll(selector);
};

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

}());

var XTemplate=function(){var e,t,n,a,r,i,o,s,u,p,l={};return e=function(e){function t(){var e="";for(var t in a)e+=t+"|";return e=e.slice(0,-1),i=new RegExp(e,"g")}var n,a={"&":"&amp;",">":"&gt;","<":"&lt;","`":"&#x60;","/":"&#x2F;",'"':"&quot;","'":"&#x27;"},r=/[&<>"'`]/,i=t(),o=/\\?\{([^{}]+)\}/g,s="undefined"!=typeof global?global:window,u=Object.prototype.toString;return e=n={isArray:Array.isArray||function(e){return"[object Array]"===u.call(e)},keys:Object.keys||function(e){var t,n=[];for(t in e)e.hasOwnProperty(t)&&n.push(t);return n},each:function(e,t,a){if(e){var r,i,o,s=0,u=e&&e.length,p=void 0===u||"[object Function]"===Object.prototype.toString.call(e);if(a=a||null,p)for(o=n.keys(e);s<o.length&&(r=o[s],t.call(a,e[r],r,e)!==!1);s++);else for(i=e[0];u>s&&t.call(a,i,s,e)!==!1;i=e[++s]);}return e},mix:function(e,t){for(var n in t)e[n]=t[n];return e},globalEval:function(e){s.execScript?s.execScript(e):!function(e){s.eval.call(s,e)}(e)},substitute:function(e,t,n){return"string"==typeof e&&t?e.replace(n||o,function(e,n){return"\\"===e.charAt(0)?e.slice(1):void 0===t[n]?"":t[n]}):e},escapeHtml:function(e){return e=""+e,r.test(e)?(e+"").replace(i,function(e){return a[e]}):e},merge:function(){for(var e=0,t=arguments.length,a={};t>e;e++){var r=arguments[e];r&&n.mix(a,r)}return a}}}(),t=function(e){function t(e,t,n){this.data=void 0!==e?e:{},n?(this.parent=n,this.root=n.root):(this.parent=void 0,this.root=this),this.affix=t||{},this.ready=!1}return t.prototype={isScope:1,constructor:t,setParent:function(e){this.parent=e,this.root=e.root},set:function(e,t){this.affix[e]=t},setData:function(e){this.data=e},getData:function(){return this.data},mix:function(e){var t=this.affix;for(var n in e)t[n]=e[n]},get:function(e){var t,n=this.data,a=this.affix;return null!=n&&(t=n[e]),void 0!==t?t:a[e]},resolveInternalOuter:function(e){var t,n=e[0],a=this,r=a;if("this"===n)t=a.data;else if("root"===n)r=r.root,t=r.data;else{if(!n)return[r.data];do t=r.get(n);while(void 0===t&&(r=r.parent))}return[void 0,t]},resolveInternal:function(e){var t=this.resolveInternalOuter(e);if(1===t.length)return t[0];var n,a=e.length,r=t[1];if(void 0===r)return void 0;for(n=1;a>n;n++)r=r[e[n]];return r},resolveLooseInternal:function(e){var t=this.resolveInternalOuter(e);if(1===t.length)return t[0];var n,a=e.length,r=t[1];for(n=1;null!=r&&a>n;n++)r=r[e[n]];return r},resolveUp:function(e){return this.parent&&this.parent.resolveInternal(e)},resolveLooseUp:function(e){return this.parent&&this.parent.resolveLooseInternal(e)},resolveOuter:function(e,t){var n,a=this,r=a;if(!t&&1===e.length){if(n=a.get(e[0]),void 0!==n)return[n];t=1}if(t)for(;r&&t--;)r=r.parent;return r?[void 0,r]:[void 0]},resolveLoose:function(e,t){var n=this.resolveOuter(e,t);return 1===n.length?n[0]:n[1].resolveLooseInternal(e)},resolve:function(e,t){var n=this.resolveOuter(e,t);return 1===n.length?n[0]:n[1].resolveInternal(e)}},e=t}(),n=function(t){function n(e,t,n){this.list=e,this.init(),this.next=t,this.ready=!1,this.tpl=n}function a(e,t){var a=this;a.config=t,a.head=new n(a,void 0),a.callback=e,this.init()}var r=e;return n.prototype={constructor:n,isBuffer:1,init:function(){this.data=""},append:function(e){return this.data+=e,this},write:function(e){if(null!=e){if(e.isBuffer)return e;this.data+=e}return this},writeEscaped:function(e){if(null!=e){if(e.isBuffer)return e;this.data+=r.escapeHtml(e)}return this},insert:function(){var e=this,t=e.list,a=e.tpl,r=new n(t,e.next,a),i=new n(t,r,a);return e.next=i,e.ready=!0,i},async:function(e){var t=this.insert(),n=t.next;return e(t),n},error:function(e){var t=this.list.callback;if(t){var n=this.tpl;if(n){e instanceof Error||(e=new Error(e));var a=n.name,r=n.pos.line,i="XTemplate error in file: "+a+" at line "+r+": ";e.stack=i+e.stack,e.message=i+e.message,e.xtpl={pos:{line:r},name:a}}this.list.callback=null,t(e,void 0)}},end:function(){var e=this;return e.list.callback&&(e.ready=!0,e.list.flush()),e}},a.prototype={constructor:a,init:function(){this.data=""},append:function(e){this.data+=e},end:function(){this.callback(null,this.data),this.callback=null},flush:function(){for(var e=this,t=e.head;t;){if(!t.ready)return e.head=t,void 0;this.data+=t.data,t=t.next}e.end()}},a.Buffer=n,t=a}(),a=function(e){function t(e,n,a){var r=e[0];if(1===e.length)return"("+n+r+")";var i="t"+a;return"(("+i+"="+n+r+") != null?"+t(e.slice(1),i,++a)+":"+i+")"}var n=/\\*"/g,a=/\\*'/g,r=[].push,i={};i.undefined=i["null"]=i["true"]=i["false"]=1;var o=e={isGlobalId:function(e){return i[e.string]?1:0},chainedVariableRead:function(e,n,a,r,i,s){var u=o.convertIdPartsToRawAccessor(e,n,a),p=u.parts[0],l=u.parts,c="";r&&(c="scope.root.");var h=c+"affix",f=c+"data",m=["(","(t=("+h+p+")) !== undefined ? ",a.length>1?h+u.str:"t",":"];return i?m=m.concat(["(","(t = "+f+p+") !== undefined ? ",a.length>1?s?t(l.slice(1),"t",0):f+u.str:"t"," :",s?"scope.resolveLooseUp("+u.arr+")":"scope.resolveUp("+u.arr+")",")"]):m.push(s?t(l,f,0):f+u.str),m.push(")"),m.join("")},convertIdPartsToRawAccessor:function(e,t,n){var a,r,i,s,u,p=[],l=[];for(a=0,r=n.length;r>a;a++)i=n[a],s=i.type,s?(u=e[s](i),o.pushToArray(t,u.source),l.push("["+u.exp+"]"),p.push(u.exp)):(l.push("."+i),p.push(o.wrapByDoubleQuote(i)));return{str:l.join(""),arr:"["+p.join(",")+"]",parts:l}},wrapByDoubleQuote:function(e){return'"'+e+'"'},wrapBySingleQuote:function(e){return"'"+e+"'"},joinArrayOfString:function(e){return o.wrapByDoubleQuote(e.join('","'))},escapeSingleQuoteInCodeString:function(e,t){return e.replace(t?n:a,function(e){return e.length%2&&(e="\\"+e),e})},escapeString:function(e,t){return e=t?o.escapeSingleQuoteInCodeString(e,0):e.replace(/\\/g,"\\\\").replace(/'/g,"\\'"),e=e.replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")},pushToArray:function(e,t){t&&r.apply(e,t)}};return e}(),r=function(e){var t=function(e){function t(e,t){return t=t||1,e[e.length-t]}function n(e,t){for(var n in t)e[n]=t[n]}function a(e){return"[object Array]"===Object.prototype.toString.call(e)}function r(e,t,n){if(e){var r,i,o,s=0;if(n=n||null,a(e))for(o=e.length,i=e[0];o>s&&t.call(n,i,s,e)!==!1;i=e[++s]);else for(r in e)if(t.call(n,e[r],r,e)===!1)break}}function i(e,t){for(var n=0,a=t.length;a>n;n++)if(t[n]===e)return!0;return!1}var o={},s={SHIFT_TYPE:1,REDUCE_TYPE:2,ACCEPT_TYPE:0,TYPE_INDEX:0,PRODUCTION_INDEX:1,TO_INDEX:2},u=function(e){var t=this;t.rules=[],n(t,e),t.resetInput(t.input,t.filename)};u.prototype={resetInput:function(e,t){n(this,{input:e,filename:t,matched:"",stateStack:[u.STATIC.INITIAL],match:"",text:"",firstLine:1,lineNumber:1,lastLine:1,firstColumn:1,lastColumn:1})},getCurrentRules:function(){var e=this,t=e.stateStack[e.stateStack.length-1],n=[];return e.mapState&&(t=e.mapState(t)),r(e.rules,function(e){var a=e.state||e[3];a?i(t,a)&&n.push(e):t===u.STATIC.INITIAL&&n.push(e)}),n},pushState:function(e){this.stateStack.push(e)},popState:function(e){e=e||1;for(var t;e--;)t=this.stateStack.pop();return t},showDebugInfo:function(){var e=this,t=u.STATIC.DEBUG_CONTEXT_LIMIT,n=e.matched,a=e.match,r=e.input;n=n.slice(0,n.length-a.length);var i=(n.length>t?"...":"")+n.slice(0-t).replace(/\n/g," "),o=a+r;return o=o.slice(0,t).replace(/\n/g," ")+(o.length>t?"...":""),i+o+"\n"+new Array(i.length+1).join("-")+"^"},mapSymbol:function(e){return this.symbolMap[e]},mapReverseSymbol:function(e){var t,n=this,a=n.symbolMap,r=n.reverseSymbolMap;if(!r&&a){r=n.reverseSymbolMap={};for(t in a)r[a[t]]=t}return r?r[e]:e},lex:function(){var t,a,r,i,o,s=this,p=s.input,l=s.getCurrentRules();if(s.match=s.text="",!p)return s.mapSymbol(u.STATIC.END_TAG);for(t=0;t<l.length;t++){a=l[t];var c=a.regexp||a[1],h=a.token||a[0],f=a.action||a[2]||e;if(r=p.match(c)){o=r[0].match(/\n.*/g),o&&(s.lineNumber+=o.length),n(s,{firstLine:s.lastLine,lastLine:s.lineNumber,firstColumn:s.lastColumn,lastColumn:o?o[o.length-1].length-1:s.lastColumn+r[0].length});var m;return m=s.match=r[0],s.matches=r,s.text=m,s.matched+=m,i=f&&f.call(s),i=i===e?h:s.mapSymbol(i),p=p.slice(m.length),s.input=p,i?i:s.lex()}}}},u.STATIC={INITIAL:"I",DEBUG_CONTEXT_LIMIT:20,END_TAG:"$EOF"};var p=new u({rules:[[0,/^[\s\S]*?(?={{)/,function(){var e,t=this,n=t.text,a=0;return(e=n.match(/\\+$/))&&(a=e[0].length),a%2?(t.pushState("et"),n=n.slice(0,-1)):t.pushState("t"),a&&(n=n.replace(/\\+$/g,function(e){return new Array(e.length/2+1).join("\\")})),t.text=n,"CONTENT"}],["b",/^[\s\S]+/,0],["b",/^[\s\S]{2,}?(?:(?={{)|$)/,function(){this.popState()},["et"]],["c",/^{{{?(?:#|@)/,function(){var e=this,t=e.text;4===t.length?e.pushState("p"):e.pushState("e")},["t"]],["d",/^{{{?\//,function(){var e=this,t=e.text;4===t.length?e.pushState("p"):e.pushState("e")},["t"]],["e",/^{{\s*else\s*}}/,function(){this.popState()},["t"]],[0,/^{{![\s\S]*?}}/,function(){this.popState()},["t"]],["b",/^{{%([\s\S]*?)%}}/,function(){this.text=this.matches[1]||"",this.popState()},["t"]],["f",/^{{{?/,function(){var e=this,t=e.text;3===t.length?e.pushState("p"):e.pushState("e")},["t"]],[0,/^\s+/,0,["p","e"]],["g",/^,/,0,["p","e"]],["h",/^}}}/,function(){this.popState(2)},["p"]],["h",/^}}/,function(){this.popState(2)},["e"]],["i",/^\(/,0,["p","e"]],["j",/^\)/,0,["p","e"]],["k",/^\|\|/,0,["p","e"]],["l",/^&&/,0,["p","e"]],["m",/^===/,0,["p","e"]],["n",/^!==/,0,["p","e"]],["o",/^>=/,0,["p","e"]],["p",/^<=/,0,["p","e"]],["q",/^>/,0,["p","e"]],["r",/^</,0,["p","e"]],["s",/^\+/,0,["p","e"]],["t",/^-/,0,["p","e"]],["u",/^\*/,0,["p","e"]],["v",/^\//,0,["p","e"]],["w",/^%/,0,["p","e"]],["x",/^!/,0,["p","e"]],["y",/^"(\\[\s\S]|[^\\"\n])*"/,function(){this.text=this.text.slice(1,-1).replace(/\\"/g,'"')},["p","e"]],["y",/^'(\\[\s\S]|[^\\'\n])*'/,function(){this.text=this.text.slice(1,-1).replace(/\\'/g,"'")},["p","e"]],["z",/^\d+(?:\.\d+)?(?:e-?\d+)?/i,0,["p","e"]],["aa",/^=/,0,["p","e"]],["ab",/^\.\./,function(){this.pushState("ws")},["p","e"]],["ac",/^\//,function(){this.popState()},["ws"]],["ac",/^\./,0,["p","e"]],["ad",/^\[/,0,["p","e"]],["ae",/^\]/,0,["p","e"]],["af",/^\{/,0,["p","e"]],["ag",/^\:/,0,["p","e"]],["ah",/^\}/,0,["p","e"]],["ab",/^[a-zA-Z_$][a-zA-Z0-9_$]*/,0,["p","e"]]]});return o.lexer=p,p.symbolMap={$EOF:"a",CONTENT:"b",OPEN_BLOCK:"c",OPEN_CLOSE_BLOCK:"d",INVERSE:"e",OPEN_TPL:"f",COMMA:"g",CLOSE:"h",L_PAREN:"i",R_PAREN:"j",OR:"k",AND:"l",LOGIC_EQUALS:"m",LOGIC_NOT_EQUALS:"n",GE:"o",LE:"p",GT:"q",LT:"r",PLUS:"s",MINUS:"t",MULTIPLY:"u",DIVIDE:"v",MODULUS:"w",NOT:"x",STRING:"y",NUMBER:"z",EQUALS:"aa",ID:"ab",SEP:"ac",L_BRACKET:"ad",R_BRACKET:"ae",L_BRACE:"af",COLON:"ag",R_BRACE:"ah",$START:"ai",program:"aj",statements:"ak",statement:"al","function":"am",id:"an",expression:"ao",params:"ap",hash:"aq",param:"ar",conditionalOrExpression:"as",listExpression:"at",jsonExpression:"au",jsonPart:"av",conditionalAndExpression:"aw",equalityExpression:"ax",relationalExpression:"ay",additiveExpression:"az",multiplicativeExpression:"ba",unaryExpression:"bb",primaryExpression:"bc",hashSegment:"bd",idSegments:"be"},o.productions=[["ai",["aj"]],["aj",["ak","e","ak"],function(){return new this.yy.ProgramNode({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,this.$3)}],["aj",["ak"],function(){return new this.yy.ProgramNode({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1)}],["ak",["al"],function(){return[this.$1]}],["ak",["ak","al"],function(){this.$1.push(this.$2)}],["al",["c","am","h","aj","d","an","h"],function(){return new this.yy.BlockStatement({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$2,this.$4,this.$6,4!==this.$1.length)}],["al",["f","ao","h"],function(){return new this.yy.ExpressionStatement({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$2,3!==this.$1.length)}],["al",["b"],function(){return new this.yy.ContentStatement({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1)}],["am",["an","i","ap","g","aq","j"],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,this.$3,this.$5)}],["am",["an","i","ap","j"],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,this.$3)}],["am",["an","i","aq","j"],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1,null,this.$3)}],["am",["an","i","j"],function(){return new this.yy.Function({filename:this.lexer.filename,line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1)}],["ap",["ap","g","ar"],function(){this.$1.push(this.$3)}],["ap",["ar"],function(){return[this.$1]}],["ar",["ao"]],["ao",["as"]],["ao",["ad","at","ae"],function(){return new this.yy.ArrayExpression(this.$2)}],["ao",["af","au","ah"],function(){return new this.yy.JsonExpression(this.$2)}],["av",["y","ag","ao"],function(){return[this.$1,this.$3]}],["av",["ab","ag","ao"],function(){return[this.$1,this.$3]}],["au",["av"],function(){return[this.$1]}],["au",["au","g","av"],function(){this.$1.push(this.$3)}],["at",["ao"],function(){return[this.$1]}],["at",["at","g","ao"],function(){this.$1.push(this.$3)}],["as",["aw"]],["as",["as","k","aw"],function(){return new this.yy.ConditionalOrExpression(this.$1,this.$3)}],["aw",["ax"]],["aw",["aw","l","ax"],function(){return new this.yy.ConditionalAndExpression(this.$1,this.$3)}],["ax",["ay"]],["ax",["ax","m","ay"],function(){return new this.yy.EqualityExpression(this.$1,"===",this.$3)}],["ax",["ax","n","ay"],function(){return new this.yy.EqualityExpression(this.$1,"!==",this.$3)}],["ay",["az"]],["ay",["ay","r","az"],function(){return new this.yy.RelationalExpression(this.$1,"<",this.$3)}],["ay",["ay","q","az"],function(){return new this.yy.RelationalExpression(this.$1,">",this.$3)}],["ay",["ay","p","az"],function(){return new this.yy.RelationalExpression(this.$1,"<=",this.$3)}],["ay",["ay","o","az"],function(){return new this.yy.RelationalExpression(this.$1,">=",this.$3)}],["az",["ba"]],["az",["az","s","ba"],function(){return new this.yy.AdditiveExpression(this.$1,"+",this.$3)}],["az",["az","t","ba"],function(){return new this.yy.AdditiveExpression(this.$1,"-",this.$3)}],["ba",["bb"]],["ba",["ba","u","bb"],function(){return new this.yy.MultiplicativeExpression(this.$1,"*",this.$3)}],["ba",["ba","v","bb"],function(){return new this.yy.MultiplicativeExpression(this.$1,"/",this.$3)}],["ba",["ba","w","bb"],function(){return new this.yy.MultiplicativeExpression(this.$1,"%",this.$3)}],["bb",["x","bb"],function(){return new this.yy.UnaryExpression(this.$1,this.$2)}],["bb",["t","bb"],function(){return new this.yy.UnaryExpression(this.$1,this.$2)}],["bb",["bc"]],["bc",["am"]],["bc",["y"],function(){return new this.yy.String({line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1)}],["bc",["z"],function(){return new this.yy.Number({line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1)}],["bc",["an"]],["bc",["i","ao","j"],function(){return this.$2}],["aq",["aq","g","bd"],function(){var e=this.$1,t=this.$3;e.value[t[0]]=t[1]}],["aq",["bd"],function(){var e=new this.yy.Hash({line:this.lexer.firstLine,col:this.lexer.firstColumn}),t=this.$1;return e.value[t[0]]=t[1],e}],["bd",["ab","aa","ao"],function(){return[this.$1,this.$3]}],["an",["be"],function(){return new this.yy.Id({line:this.lexer.firstLine,col:this.lexer.firstColumn},this.$1)}],["be",["be","ac","ab"],function(){this.$1.push(this.$3)}],["be",["be","ad","ao","ae"],function(){this.$1.push(this.$3)}],["be",["ab"],function(){return[this.$1]}]],o.table={gotos:{0:{aj:4,ak:5,al:6},2:{am:8,an:9,be:10},3:{am:18,an:19,ao:20,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},5:{al:30},11:{am:18,an:19,ao:35,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},12:{am:18,an:19,bb:36,bc:28,be:10},13:{am:18,an:19,bb:37,bc:28,be:10},16:{am:18,an:19,ao:38,as:21,at:39,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},17:{au:42,av:43},29:{ak:58,al:6},31:{aj:59,ak:5,al:6},32:{am:18,an:19,ao:62,ap:63,aq:64,ar:65,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,bd:66,be:10},34:{am:18,an:19,ao:68,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},45:{am:18,an:19,aw:76,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},46:{am:18,an:19,ax:77,ay:24,az:25,ba:26,bb:27,bc:28,be:10},47:{am:18,an:19,ay:78,az:25,ba:26,bb:27,bc:28,be:10},48:{am:18,an:19,ay:79,az:25,ba:26,bb:27,bc:28,be:10},49:{am:18,an:19,az:80,ba:26,bb:27,bc:28,be:10},50:{am:18,an:19,az:81,ba:26,bb:27,bc:28,be:10},51:{am:18,an:19,az:82,ba:26,bb:27,bc:28,be:10},52:{am:18,an:19,az:83,ba:26,bb:27,bc:28,be:10},53:{am:18,an:19,ba:84,bb:27,bc:28,be:10},54:{am:18,an:19,ba:85,bb:27,bc:28,be:10},55:{am:18,an:19,bb:86,bc:28,be:10},56:{am:18,an:19,bb:87,bc:28,be:10},57:{am:18,an:19,bb:88,bc:28,be:10},58:{al:30},70:{am:18,an:19,ao:96,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},72:{am:18,an:19,ao:97,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},73:{am:18,an:19,ao:98,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},74:{av:99},89:{an:100,be:10},90:{am:18,an:19,ao:101,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,be:10},91:{am:18,an:19,ao:62,aq:102,ar:103,as:21,aw:22,ax:23,ay:24,az:25,ba:26,bb:27,bc:28,bd:66,be:10},93:{bd:105}},action:{0:{b:[1,e,1],c:[1,e,2],f:[1,e,3]},1:{a:[2,7],e:[2,7],c:[2,7],f:[2,7],b:[2,7],d:[2,7]},2:{ab:[1,e,7]},3:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},4:{a:[0]},5:{a:[2,2],d:[2,2],b:[1,e,1],c:[1,e,2],e:[1,e,29],f:[1,e,3]},6:{a:[2,3],e:[2,3],c:[2,3],f:[2,3],b:[2,3],d:[2,3]},7:{i:[2,57],ac:[2,57],ad:[2,57],h:[2,57],k:[2,57],l:[2,57],m:[2,57],n:[2,57],o:[2,57],p:[2,57],q:[2,57],r:[2,57],s:[2,57],t:[2,57],u:[2,57],v:[2,57],w:[2,57],j:[2,57],ae:[2,57],g:[2,57],ah:[2,57]},8:{h:[1,e,31]},9:{i:[1,e,32]},10:{i:[2,54],h:[2,54],k:[2,54],l:[2,54],m:[2,54],n:[2,54],o:[2,54],p:[2,54],q:[2,54],r:[2,54],s:[2,54],t:[2,54],u:[2,54],v:[2,54],w:[2,54],j:[2,54],ae:[2,54],g:[2,54],ah:[2,54],ac:[1,e,33],ad:[1,e,34]},11:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},12:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},13:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},14:{h:[2,47],k:[2,47],l:[2,47],m:[2,47],n:[2,47],o:[2,47],p:[2,47],q:[2,47],r:[2,47],s:[2,47],t:[2,47],u:[2,47],v:[2,47],w:[2,47],j:[2,47],ae:[2,47],g:[2,47],ah:[2,47]},15:{h:[2,48],k:[2,48],l:[2,48],m:[2,48],n:[2,48],o:[2,48],p:[2,48],q:[2,48],r:[2,48],s:[2,48],t:[2,48],u:[2,48],v:[2,48],w:[2,48],j:[2,48],ae:[2,48],g:[2,48],ah:[2,48]},16:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},17:{y:[1,e,40],ab:[1,e,41]},18:{h:[2,46],k:[2,46],l:[2,46],m:[2,46],n:[2,46],o:[2,46],p:[2,46],q:[2,46],r:[2,46],s:[2,46],t:[2,46],u:[2,46],v:[2,46],w:[2,46],j:[2,46],ae:[2,46],g:[2,46],ah:[2,46]},19:{h:[2,49],k:[2,49],l:[2,49],m:[2,49],n:[2,49],o:[2,49],p:[2,49],q:[2,49],r:[2,49],s:[2,49],t:[2,49],u:[2,49],v:[2,49],w:[2,49],j:[2,49],ae:[2,49],g:[2,49],ah:[2,49],i:[1,e,32]},20:{h:[1,e,44]},21:{h:[2,15],j:[2,15],ae:[2,15],g:[2,15],ah:[2,15],k:[1,e,45]},22:{h:[2,24],k:[2,24],j:[2,24],ae:[2,24],g:[2,24],ah:[2,24],l:[1,e,46]},23:{h:[2,26],k:[2,26],l:[2,26],j:[2,26],ae:[2,26],g:[2,26],ah:[2,26],m:[1,e,47],n:[1,e,48]},24:{h:[2,28],k:[2,28],l:[2,28],m:[2,28],n:[2,28],j:[2,28],ae:[2,28],g:[2,28],ah:[2,28],o:[1,e,49],p:[1,e,50],q:[1,e,51],r:[1,e,52]},25:{h:[2,31],k:[2,31],l:[2,31],m:[2,31],n:[2,31],o:[2,31],p:[2,31],q:[2,31],r:[2,31],j:[2,31],ae:[2,31],g:[2,31],ah:[2,31],s:[1,e,53],t:[1,e,54]},26:{h:[2,36],k:[2,36],l:[2,36],m:[2,36],n:[2,36],o:[2,36],p:[2,36],q:[2,36],r:[2,36],s:[2,36],t:[2,36],j:[2,36],ae:[2,36],g:[2,36],ah:[2,36],u:[1,e,55],v:[1,e,56],w:[1,e,57]},27:{h:[2,39],k:[2,39],l:[2,39],m:[2,39],n:[2,39],o:[2,39],p:[2,39],q:[2,39],r:[2,39],s:[2,39],t:[2,39],u:[2,39],v:[2,39],w:[2,39],j:[2,39],ae:[2,39],g:[2,39],ah:[2,39]},28:{h:[2,45],k:[2,45],l:[2,45],m:[2,45],n:[2,45],o:[2,45],p:[2,45],q:[2,45],r:[2,45],s:[2,45],t:[2,45],u:[2,45],v:[2,45],w:[2,45],j:[2,45],ae:[2,45],g:[2,45],ah:[2,45]},29:{b:[1,e,1],c:[1,e,2],f:[1,e,3]},30:{a:[2,4],e:[2,4],c:[2,4],f:[2,4],b:[2,4],d:[2,4]},31:{b:[1,e,1],c:[1,e,2],f:[1,e,3]},32:{i:[1,e,11],j:[1,e,60],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,61],ad:[1,e,16],af:[1,e,17]},33:{ab:[1,e,67]},34:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},35:{j:[1,e,69]},36:{h:[2,44],k:[2,44],l:[2,44],m:[2,44],n:[2,44],o:[2,44],p:[2,44],q:[2,44],r:[2,44],s:[2,44],t:[2,44],u:[2,44],v:[2,44],w:[2,44],j:[2,44],ae:[2,44],g:[2,44],ah:[2,44]},37:{h:[2,43],k:[2,43],l:[2,43],m:[2,43],n:[2,43],o:[2,43],p:[2,43],q:[2,43],r:[2,43],s:[2,43],t:[2,43],u:[2,43],v:[2,43],w:[2,43],j:[2,43],ae:[2,43],g:[2,43],ah:[2,43]},38:{ae:[2,22],g:[2,22]},39:{g:[1,e,70],ae:[1,e,71]},40:{ag:[1,e,72]},41:{ag:[1,e,73]},42:{g:[1,e,74],ah:[1,e,75]},43:{ah:[2,20],g:[2,20]},44:{a:[2,6],e:[2,6],c:[2,6],f:[2,6],b:[2,6],d:[2,6]},45:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},46:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},47:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},48:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},49:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},50:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},51:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},52:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},53:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},54:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},55:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},56:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},57:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7]},58:{a:[2,1],d:[2,1],b:[1,e,1],c:[1,e,2],f:[1,e,3]},59:{d:[1,e,89]},60:{h:[2,11],k:[2,11],l:[2,11],m:[2,11],n:[2,11],o:[2,11],p:[2,11],q:[2,11],r:[2,11],s:[2,11],t:[2,11],u:[2,11],v:[2,11],w:[2,11],j:[2,11],ae:[2,11],g:[2,11],ah:[2,11]},61:{g:[2,57],i:[2,57],j:[2,57],k:[2,57],l:[2,57],m:[2,57],n:[2,57],o:[2,57],p:[2,57],q:[2,57],r:[2,57],s:[2,57],t:[2,57],u:[2,57],v:[2,57],w:[2,57],ac:[2,57],ad:[2,57],aa:[1,e,90]},62:{g:[2,14],j:[2,14]},63:{g:[1,e,91],j:[1,e,92]},64:{g:[1,e,93],j:[1,e,94]},65:{g:[2,13],j:[2,13]},66:{j:[2,52],g:[2,52]},67:{i:[2,55],ac:[2,55],ad:[2,55],h:[2,55],k:[2,55],l:[2,55],m:[2,55],n:[2,55],o:[2,55],p:[2,55],q:[2,55],r:[2,55],s:[2,55],t:[2,55],u:[2,55],v:[2,55],w:[2,55],j:[2,55],ae:[2,55],g:[2,55],ah:[2,55]},68:{ae:[1,e,95]},69:{h:[2,50],k:[2,50],l:[2,50],m:[2,50],n:[2,50],o:[2,50],p:[2,50],q:[2,50],r:[2,50],s:[2,50],t:[2,50],u:[2,50],v:[2,50],w:[2,50],j:[2,50],ae:[2,50],g:[2,50],ah:[2,50]},70:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},71:{h:[2,16],j:[2,16],ae:[2,16],g:[2,16],ah:[2,16]},72:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},73:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},74:{y:[1,e,40],ab:[1,e,41]},75:{h:[2,17],j:[2,17],ae:[2,17],g:[2,17],ah:[2,17]},76:{h:[2,25],k:[2,25],j:[2,25],ae:[2,25],g:[2,25],ah:[2,25],l:[1,e,46]},77:{h:[2,27],k:[2,27],l:[2,27],j:[2,27],ae:[2,27],g:[2,27],ah:[2,27],m:[1,e,47],n:[1,e,48]},78:{h:[2,29],k:[2,29],l:[2,29],m:[2,29],n:[2,29],j:[2,29],ae:[2,29],g:[2,29],ah:[2,29],o:[1,e,49],p:[1,e,50],q:[1,e,51],r:[1,e,52]},79:{h:[2,30],k:[2,30],l:[2,30],m:[2,30],n:[2,30],j:[2,30],ae:[2,30],g:[2,30],ah:[2,30],o:[1,e,49],p:[1,e,50],q:[1,e,51],r:[1,e,52]},80:{h:[2,35],k:[2,35],l:[2,35],m:[2,35],n:[2,35],o:[2,35],p:[2,35],q:[2,35],r:[2,35],j:[2,35],ae:[2,35],g:[2,35],ah:[2,35],s:[1,e,53],t:[1,e,54]},81:{h:[2,34],k:[2,34],l:[2,34],m:[2,34],n:[2,34],o:[2,34],p:[2,34],q:[2,34],r:[2,34],j:[2,34],ae:[2,34],g:[2,34],ah:[2,34],s:[1,e,53],t:[1,e,54]},82:{h:[2,33],k:[2,33],l:[2,33],m:[2,33],n:[2,33],o:[2,33],p:[2,33],q:[2,33],r:[2,33],j:[2,33],ae:[2,33],g:[2,33],ah:[2,33],s:[1,e,53],t:[1,e,54]},83:{h:[2,32],k:[2,32],l:[2,32],m:[2,32],n:[2,32],o:[2,32],p:[2,32],q:[2,32],r:[2,32],j:[2,32],ae:[2,32],g:[2,32],ah:[2,32],s:[1,e,53],t:[1,e,54]},84:{h:[2,37],k:[2,37],l:[2,37],m:[2,37],n:[2,37],o:[2,37],p:[2,37],q:[2,37],r:[2,37],s:[2,37],t:[2,37],j:[2,37],ae:[2,37],g:[2,37],ah:[2,37],u:[1,e,55],v:[1,e,56],w:[1,e,57]},85:{h:[2,38],k:[2,38],l:[2,38],m:[2,38],n:[2,38],o:[2,38],p:[2,38],q:[2,38],r:[2,38],s:[2,38],t:[2,38],j:[2,38],ae:[2,38],g:[2,38],ah:[2,38],u:[1,e,55],v:[1,e,56],w:[1,e,57]},86:{h:[2,40],k:[2,40],l:[2,40],m:[2,40],n:[2,40],o:[2,40],p:[2,40],q:[2,40],r:[2,40],s:[2,40],t:[2,40],u:[2,40],v:[2,40],w:[2,40],j:[2,40],ae:[2,40],g:[2,40],ah:[2,40]},87:{h:[2,41],k:[2,41],l:[2,41],m:[2,41],n:[2,41],o:[2,41],p:[2,41],q:[2,41],r:[2,41],s:[2,41],t:[2,41],u:[2,41],v:[2,41],w:[2,41],j:[2,41],ae:[2,41],g:[2,41],ah:[2,41]},88:{h:[2,42],k:[2,42],l:[2,42],m:[2,42],n:[2,42],o:[2,42],p:[2,42],q:[2,42],r:[2,42],s:[2,42],t:[2,42],u:[2,42],v:[2,42],w:[2,42],j:[2,42],ae:[2,42],g:[2,42],ah:[2,42]},89:{ab:[1,e,7]},90:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,7],ad:[1,e,16],af:[1,e,17]},91:{i:[1,e,11],t:[1,e,12],x:[1,e,13],y:[1,e,14],z:[1,e,15],ab:[1,e,61],ad:[1,e,16],af:[1,e,17]},92:{h:[2,9],k:[2,9],l:[2,9],m:[2,9],n:[2,9],o:[2,9],p:[2,9],q:[2,9],r:[2,9],s:[2,9],t:[2,9],u:[2,9],v:[2,9],w:[2,9],j:[2,9],ae:[2,9],g:[2,9],ah:[2,9]},93:{ab:[1,e,104]},94:{h:[2,10],k:[2,10],l:[2,10],m:[2,10],n:[2,10],o:[2,10],p:[2,10],q:[2,10],r:[2,10],s:[2,10],t:[2,10],u:[2,10],v:[2,10],w:[2,10],j:[2,10],ae:[2,10],g:[2,10],ah:[2,10]},95:{i:[2,56],ac:[2,56],ad:[2,56],h:[2,56],k:[2,56],l:[2,56],m:[2,56],n:[2,56],o:[2,56],p:[2,56],q:[2,56],r:[2,56],s:[2,56],t:[2,56],u:[2,56],v:[2,56],w:[2,56],j:[2,56],ae:[2,56],g:[2,56],ah:[2,56]},96:{ae:[2,23],g:[2,23]},97:{ah:[2,18],g:[2,18]},98:{ah:[2,19],g:[2,19]},99:{ah:[2,21],g:[2,21]},100:{h:[1,e,106]},101:{j:[2,53],g:[2,53]},102:{g:[1,e,93],j:[1,e,107]},103:{g:[2,12],j:[2,12]},104:{aa:[1,e,90]},105:{j:[2,51],g:[2,51]},106:{a:[2,5],e:[2,5],c:[2,5],f:[2,5],b:[2,5],d:[2,5]},107:{h:[2,8],k:[2,8],l:[2,8],m:[2,8],n:[2,8],o:[2,8],p:[2,8],q:[2,8],r:[2,8],s:[2,8],t:[2,8],u:[2,8],v:[2,8],w:[2,8],j:[2,8],ae:[2,8],g:[2,8],ah:[2,8]}}},o.parse=function(n,a){var i,o,u,p,l,c=this,h=c.lexer,f=c.table,m=f.gotos,v=f.action,d=c.productions,b=a?"in file: "+a+" ":"",x=[],y=[0],g=[];for(h.resetInput(n,a);;){if(i=t(y),o||(o=h.lex()),p=o?v[i]&&v[i][o]:null,!p){var E,w=[];throw v[i]&&r(v[i],function(e,t){p=e[s.TYPE_INDEX];var n=[];n[s.SHIFT_TYPE]="shift",n[s.REDUCE_TYPE]="reduce",n[s.ACCEPT_TYPE]="accept",w.push(n[p]+":"+c.lexer.mapReverseSymbol(t))}),E=b+"syntax error at line "+h.lineNumber+":\n"+h.showDebugInfo()+"\nexpect "+w.join(", "),new Error(E)}switch(p[s.TYPE_INDEX]){case s.SHIFT_TYPE:g.push(o),x.push(h.text),y.push(p[s.TO_INDEX]),o=null;break;case s.REDUCE_TYPE:var S=d[p[s.PRODUCTION_INDEX]],j=S.symbol||S[0],T=S.action||S[2],$=S.rhs||S[1],C=$.length;l=t(x,C),u=e,c.$$=l;for(var k=0;C>k;k++)c["$"+(C-k)]=t(x,k+1);T&&(u=T.call(c)),l=u!==e?u:c.$$;var I=-1*C;y.splice(I,C),x.splice(I,C),g.splice(I,C),g.push(j),x.push(l);var A=m[t(y)][j];y.push(A);break;case s.ACCEPT_TYPE:return l}}},o}();return"undefined"!=typeof l&&(e=t),e}(),i=function(e){function t(e,t){var n=e.length,a=t.length;if(n!==a)return 0;for(var r=0;n>r;r++)if(e[r]!==t[r])return 0;return 1}var n={};return n.ProgramNode=function(e,t,n){var a=this;a.pos=e,a.statements=t,a.inverse=n},n.ProgramNode.prototype.type="program",n.BlockStatement=function(e,n,a,r,i){var o,s=r.parts,u=this;if(!t(n.id.parts,s))throw o="in file: "+e.filename+" syntax error at line "+e.line+", col "+e.col+":\nexpect {{/"+n.id.parts+"}} not {{/"+s+"}}",new Error(o);u.escape=i,u.pos=e,u.func=n,u.program=a},n.BlockStatement.prototype.type="blockStatement",n.ExpressionStatement=function(e,t,n){var a=this;a.pos=e,a.value=t,a.escape=n},n.ExpressionStatement.prototype.type="expressionStatement",n.ContentStatement=function(e,t){var n=this;n.pos=e,n.value=t},n.ContentStatement.prototype.type="contentStatement",n.UnaryExpression=function(e,t){this.value=t,this.unaryType=e},n.Function=function(e,t,n,a){var r=this;r.pos=e,r.id=t,r.params=n,r.hash=a},n.Function.prototype.type="function",n.UnaryExpression.prototype.type="unaryExpression",n.MultiplicativeExpression=function(e,t,n){var a=this;a.op1=e,a.opType=t,a.op2=n},n.MultiplicativeExpression.prototype.type="multiplicativeExpression",n.AdditiveExpression=function(e,t,n){var a=this;a.op1=e,a.opType=t,a.op2=n},n.AdditiveExpression.prototype.type="additiveExpression",n.RelationalExpression=function(e,t,n){var a=this;a.op1=e,a.opType=t,a.op2=n},n.RelationalExpression.prototype.type="relationalExpression",n.EqualityExpression=function(e,t,n){var a=this;a.op1=e,a.opType=t,a.op2=n},n.EqualityExpression.prototype.type="equalityExpression",n.ConditionalAndExpression=function(e,t){var n=this;n.op1=e,n.op2=t,n.opType="&&"},n.ConditionalAndExpression.prototype.type="conditionalAndExpression",n.ConditionalOrExpression=function(e,t){var n=this;n.op1=e,n.op2=t,n.opType="||"},n.ConditionalOrExpression.prototype.type="conditionalOrExpression",n.String=function(e,t){var n=this;n.pos=e,n.value=t},n.String.prototype.type="string",n.Number=function(e,t){var n=this;n.pos=e,n.value=t},n.Number.prototype.type="number",n.Hash=function(e){var t=this,n={};t.pos=e,t.value=n},n.Hash.prototype.type="hash",n.ArrayExpression=function(e){this.list=e},n.ArrayExpression.prototype.type="arrayExpression",n.JsonExpression=function(e){this.json=e},n.JsonExpression.prototype.type="jsonExpression",n.Id=function(e,t){var n=this,a=[],r=0;n.pos=e;for(var i=0,o=t.length;o>i;i++){var s=t[i];".."===s?r++:a.push(s)}n.parts=a,n.string=a.join("."),n.depth=r},n.Id.prototype.type="id",e=n}(),o=function(n){var a=t,r=e,i={range:function(e,t){var n=t.params,a=n[0],r=n[1],i=n[2];i?(a>r&&i>0||r>a&&0>i)&&(i=-i):i=a>r?-1:1;for(var o=[],s=a;r>a?r>s:s>r;s+=i)o.push(s);return o},foreach:function(e,t,n){var r,i,o,s,u=t.params,p=u[0],l=u[2]||"xindex",c=u[1];if(p)for(r=p.length,s=0;r>s;s++)i=new a(p[s],{xcount:r,xindex:s},e),o=i.affix,"xindex"!==l&&(o[l]=s,o.xindex=void 0),c&&(o[c]=p[s]),n=t.fn(i,n);return n},forin:function(e,t,n){var r,i,o,s=t.params,u=s[0],p=s[2]||"xindex",l=s[1];if(u)for(o in u)r=new a(u[o],{xindex:o},e),i=r.affix,"xindex"!==p&&(i[p]=o,i.xindex=void 0),l&&(i[l]=u[o]),n=t.fn(r,n);return n},each:function(e,t,n){var a=t.params,o=a[0];return o?r.isArray(o)?i.foreach(e,t,n):i.forin(e,t,n):n},"with":function(e,t,n){var r=t.params,i=r[0];if(i){var o=new a(i,void 0,e);n=t.fn(o,n)}return n},"if":function(e,t,n){var a=t.params,r=a[0];if(r){var i=t.fn;i&&(n=i(e,n))}else{var o=!1,s=t.elseIfs,u=t.inverse;if(s)for(var p=0,l=s.length;l>p;p++){var c=s[p];if(o=c.test(e)){n=c.fn(e,n);break}}!o&&u&&(n=u(e,n))}return n},set:function(e,t,n){return e.mix(t.hash),n},include:1,parse:1,extend:1,block:function(e,t,n){var a,r=this,i=r.runtime,o=t.params,s=o[0];2===o.length&&(a=o[0],s=o[1]);var u,p=i.blocks=i.blocks||{},l=p[s],c={fn:t.fn,type:a};if(l){if(l.type)if("append"===l.type)c.next=l,p[s]=c;else if("prepend"===l.type){var h;for(u=l;u&&"prepend"===u.type;)h=u,u=u.next;c.next=u,h.next=c}}else p[s]=c;if(!i.extendTpl)for(u=p[s];u;)u.fn&&(n=u.fn.call(r,e,n)),u=u.next;return n},macro:function(e,t,n){var r=t.hash,i=t.params,o=i[0],s=i.slice(1),u=this,p=u.runtime,l=p.macros=p.macros||{},c=l[o];if(t.fn)l[o]={paramNames:s,hash:r,fn:t.fn};else if(c){var h,f=c.hash||{};if(h=c.paramNames)for(var m=0,v=h.length;v>m;m++){var d=h[m];f[d]=s[m]}if(r)for(var b in r)f[b]=r[b];var x=new a(f);x.root=e.root,n=c.fn.call(u,x,n)}else{var y="can not find macro: "+o;n.error(y)}return n}};return i["debugger"]=function(){r.globalEval("debugger")},n=i}(),s=function(a){function r(e,t,n,a,r,i,o,s){this.name=e,this.originalName=i||e,this.runtime=t,this.root=n,this.pos={line:1},this.scope=a,this.buffer=r,this.fn=o,this.parent=s}function i(e,t,n){var a=n[0],r=e&&e[a]||t&&t[a]||b[a];if(1===n.length)return r;
if(r)for(var i=n.length,o=1;i>o;o++)if(r=r[n[o]],!r)return!1;return r}function s(e,t){var n=e.split("/"),a=t.split("/");n.pop();for(var r=0,i=a.length;i>r;r++){var o=a[r];"."===o||(".."===o?n.pop():n.push(o))}return n.join("/")}function u(e,t,n,a,r,o){var s,u,p;return o||(p=i(e.runtime.commands,e.root.config.commands,r)),p?p.call(e,t,n,a):p!==!1&&(s=t.resolve(r.slice(0,-1),o),u=s[r[r.length-1]])?u.apply(s,n.params):(a.error("Command Not Found: "+r.join(".")),a)}function p(e,t){var n=this;n.fn=e,n.config=v.merge(p.globalConfig,t),this.subNameResolveCache={}}function l(e,t,n){if("."!==t.charAt(0))return t;var a=n+"_ks_"+t,r=e.subNameResolveCache,i=r[a];return i?i:t=r[a]=s(n,t)}function c(e,t,n,a,r,i){var o=l(e,i,r.name),s=a.insert(),u=s.next;return f(e,o,r.runtime,t,s,i,n,a.tpl),u}function h(e,t,n,a,i){var o=n.insert(),s=o.next,u=new r(i.TPL_NAME,a.runtime,e,t,o,void 0,i,n.tpl);return o.tpl=u,m(u),s}function f(e,t,n,a,i,o,s,u){var p=new r(t,n,e,a,i,o,void 0,u);i.tpl=p,e.config.loader.load(p,function(e,t){"function"==typeof t?(p.fn=t,m(p)):e?i.error(e):(t=t||"",s?i.writeEscaped(t):i.data+=t,i.end())})}function m(e){var t=e.fn();if(t){var n,a=e.runtime,r=a.extendTpl;if(r&&(n=r.params[0],!n))return t.error("extend command required a non-empty parameter");var i=a.extendTplFn,o=a.extendTplBuffer;return i?(a.extendTpl=null,a.extendTplBuffer=null,a.extendTplFn=null,h(e.root,e.scope,o,e,i).end()):n&&(a.extendTpl=null,a.extendTplBuffer=null,c(e.root,e.scope,0,o,e,n).end()),t.end()}}var v=e,d=o,b={},x=t,y=n,g={callFn:u,callCommand:function(e,t,n,a,r){return u(e,t,n,a,r)}};return v.mix(p,{config:function(e,t){var n=this.globalConfig=this.globalConfig||{};return arguments.length?(void 0!==t?n[e]=t:v.mix(n,e),void 0):n},version:"3.7.1",nativeCommands:d,utils:g,util:v,addCommand:function(e,t){b[e]=t},removeCommand:function(e){delete b[e]}}),p.prototype={constructor:p,Scope:x,nativeCommands:d,utils:g,removeCommand:function(e){var t=this.config;t.commands&&delete t.commands[e]},addCommand:function(e,t){var n=this.config;n.commands=n.commands||{},n.commands[e]=t},include:function(e,t,n,a){var r,i=t.params;r=e;var o=t.hash,s=t&&t.escape;return o&&(r=new x(o,void 0,e)),i[0]?n=c(this,r,s,n,a,i[0]):n.error("include command required a non-empty parameter")},includeModule:function(e,t,n,a){var r=t.params,i=e,o=t.hash;return o&&(i=new x(o,void 0,e)),r[0]?n=h(this,i,n,a,r[0]):n.error("include command required a non-empty parameter")},render:function(e,t,n){var a="",i=this,o=i.fn,s=i.config;"function"==typeof t&&(n=t,t=null),t=t||{},n=n||function(e,t){if(e)throw e instanceof Error||(e=new Error(e)),e;a=t};var u=i.config.name;!u&&o&&o.TPL_NAME&&(u=o.TPL_NAME);var l;l=e instanceof x?e:new x(e);var c=new p.LinkedBuffer(n,s).head,h=new r(u,{commands:t.commands},i,l,c,u,o);return c.tpl=h,o?(m(h),a):(s.loader.load(h,function(e,t){t?(h.fn=i.fn=t,m(h)):e&&c.error(e)}),a)}},p.Scope=x,p.LinkedBuffer=y,a=p}(),u=function(e){function t(e){return["function "+e+"(scope, buffer, undefined) {","var data = scope.data;","var affix = scope.affix;"]}function n(e,t){return t+e.uuid++}function o(e){var t,a,r,i,o=[],s=e.opType,u=this[e.op1.type](e.op1),p=this[e.op2.type](e.op2),l=n(this,"exp");return t=u.exp,a=p.exp,r=u.source,i=p.source,b(o,r),o.push("var "+l+" = "+t+";"),"&&"===s||"||"===s?(o.push("if("+("&&"===s?"":"!")+"("+l+")){"),b(o,i),o.push(l+" = "+a+";"),o.push("}")):(b(o,i),o.push(l+" = ("+t+")"+s+"("+a+");")),{exp:l,source:o}}function u(e,t){Y!==e.line&&(Y=e.line,t.push("pos.line = "+e.line+";"))}function p(e,a){for(var r,i=n(e,"func"),o=t(i),s=0,u=a.length;u>s;s++)r=a[s],b(o,e[r.type](r).source);return o.push(O),o.push("}"),b(e.functionDeclares,o),i}function l(e,a){var r=n(e,"func"),i=t(r),o=e[a.type](a);return b(i,o.source),i.push("return "+o.exp+";"),i.push("}"),b(e.functionDeclares,i),r}function c(e,t){var n,a,r,i=e.config.catchError,o=[E,D,i?"try {":""];for(a=0,r=t.length;r>a;a++)n=t[a],b(o,e[n.type](n,{top:1}).source);return o.splice.apply(o,[2,0].concat(e.functionDeclares).concat("")),o.push(O),i&&(o.push("} catch(e) {"),o.push("if(!e.xtpl){"),o.push("buffer.error(e);"),o.push("}else{ throw e; }"),o.push("}")),{params:["undefined"],source:o.join("\n")}}function h(e,t,n,a,r,i){var o=[],s=t.params,u=t.hash,p=[];s&&U(s,function(t){var n=e[t.type](t);b(o,n.source),p.push(n.exp)});var l=[];u&&U(u.value,function(t,n){var a=e[t.type](t);b(o,a.source),l.push([x(n),a.exp])});var c="";if(p.length||l.length||n||a||i||r){if(n&&(c+=",escape:1"),p.length&&(c+=",params:["+p.join(",")+"]"),l.length){var h="";v.each(l,function(e){h+=","+e[0]+":"+e[1]}),c+=",hash:{"+h.slice(1)+"}"}a&&(c+=",fn: "+a),i&&(c+=",inverse: "+i),r&&(c+=",elseIfs: "+r),c="{"+c.slice(1)+"}"}return{exp:c||"{}",source:o}}function f(e,t,a,r){var i=[];u(t.pos,i);var o,s,c=t.id,f=c.string;f in M&&(r=0);var m,v=c.parts;if("elseif"===f)return{exp:"",source:[]};if(a){var x,y,g,E,$,C,k=a.program,I=k.inverse,A=[],z=k.statements,q=[];for(m=0;m<z.length;m++)C=z[m],"expressionStatement"===C.type&&($=C.value)&&"function"===$.type&&"elseif"===$.id.string?(E&&A.push(E),E={condition:$.params[0],statements:[]}):E?E.statements.push(C):q.push(C);if(E&&A.push(E),x=p(e,q),I&&(g=p(e,I)),A.length){var L=[];for(m=0;m<A.length;m++){var N=A[m],P=l(e,N.condition);L.push("{test: "+P+",fn : "+p(e,N.statements)+"}")}y="["+L.join(",")+"]"}o=h(e,t,r,x,y,g),b(i,o.source)}var O=e.config.isModule;if(!("include"!==f&&"parse"!==f&&"extend"!==f||t.params&&1===t.params.length))throw new Error("include/parse/extend can only has one parameter!");return O&&("include"===f||"parse"===f)&&(t.params[0]={type:"raw",value:'require("'+t.params[0].value+'")'}),o||(o=h(e,t,r,null,null,null),b(i,o.source)),a||(s=n(e,"callRet"),i.push("var "+s)),f in M?"extend"===f?(i.push("runtime.extendTpl = "+o.exp),i.push("buffer = buffer.async(function(newBuffer){runtime.extendTplBuffer = newBuffer;});"),O&&i.push("runtime.extendTplFn = require("+o.exp+".params[0])")):"include"===f?i.push("buffer = root."+(O?"includeModule":"include")+"(scope,"+o.exp+",buffer,tpl);"):"parse"===f?i.push("buffer = root."+(O?"includeModule":"include")+"(new scope.constructor(),"+o.exp+",buffer,tpl);"):i.push(B(w,{lhs:a?"buffer":s,name:f,option:o.exp})):a?i.push(B(S,{option:o.exp,idParts:d.convertIdPartsToRawAccessor(e,i,v).arr})):i.push(B(c.depth?T:j,{lhs:s,option:o.exp,idParts:d.convertIdPartsToRawAccessor(e,i,v).arr,depth:c.depth})),{exp:s,source:i}}function m(e){this.functionDeclares=[],this.config=e,this.uuid=0}for(var v=s.util,d=a,b=d.pushToArray,x=d.wrapByDoubleQuote,y=["var t;"],g=0;10>g;g++)y.push("var t"+g+";");var E=y.concat(["var tpl = this;","var root = tpl.root;","var buffer = tpl.buffer;","var scope = tpl.scope;","var runtime = tpl.runtime;","var name = tpl.name;","var pos = tpl.pos;","var data = scope.data;","var affix = scope.affix;","var nativeCommands = root.nativeCommands;","var utils = root.utils;"]).join("\n"),w="{lhs} = {name}Command.call(tpl, scope, {option}, buffer);",S="buffer = callCommandUtil(tpl, scope, {option}, buffer, {idParts});",j="{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts});",T="{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts}, {depth});",$="var {lhs} = {value};",C="var {lhs} = scope.resolve({idParts},{depth});",k="var {lhs} = scope.resolveLoose({idParts},{depth});",I=["function {functionName}({params}){","{body}","}"].join("\n"),A=["","//# sourceURL = {name}.js"].join("\n"),z='var {name}Command = nativeCommands["{name}"];',q='var {name}Util = utils["{name}"];',L="buffer = buffer.write({value});",N="buffer.data += {value};",P="buffer = buffer.writeEscaped({value});",O="return buffer;",R=s,_=r;_.yy=i;var D=[],B=v.substitute,U=v.each,M=R.nativeCommands,F=R.utils;U(F,function(e,t){D.push(B(q,{name:t}))}),U(M,function(e,t){D.push(B(z,{name:t}))}),D=D.join("\n");var Y=1;m.prototype={constructor:m,raw:function(e){return{exp:e.value}},arrayExpression:function(e){for(var t,n=e.list,a=n.length,r=[],i=[],o=0;a>o;o++)t=this[n[o].type](n[o]),b(r,t.source),i.push(t.exp);return{exp:"["+i.join(",")+"]",source:r}},jsonExpression:function(e){for(var t,n=e.json,a=n.length,r=[],i=[],o=0;a>o;o++){var s=n[o];t=this[s[1].type](s[1]),b(r,t.source),i.push(x(s[0])+": "+t.exp)}return{exp:"{"+i.join(",")+"}",source:r}},conditionalOrExpression:o,conditionalAndExpression:o,relationalExpression:o,equalityExpression:o,additiveExpression:o,multiplicativeExpression:o,unaryExpression:function(e){var t=this[e.value.type](e.value);return{exp:e.unaryType+"("+t.exp+")",source:t.source}},string:function(e){return{exp:d.wrapBySingleQuote(d.escapeString(e.value,1)),source:[]}},number:function(e){return{exp:e.value,source:[]}},id:function(e){var t=[],a=this,r=!a.config.strict;if(u(e.pos,t),d.isGlobalId(e))return{exp:e.string,source:t};var i=e.depth,o=e.parts,s=n(a,"id");if(i)return t.push(B(r?k:C,{lhs:s,idParts:d.convertIdPartsToRawAccessor(a,t,o).arr,depth:i})),{exp:s,source:t};var p,l,c=o[0];return"this"===c?(l=o.slice(1),t.push(B($,{lhs:s,value:l.length?d.chainedVariableRead(a,t,l,void 0,void 0,r):"data"})),{exp:s,source:t}):"root"===c?(l=o.slice(1),p=l.join("."),p&&(p="."+p),t.push(B($,{lhs:s,value:p?d.chainedVariableRead(a,t,l,!0,void 0,r):"scope.root.data",idParts:p})),{exp:s,source:t}):(t.push(B($,{lhs:s,value:d.chainedVariableRead(a,t,o,!1,!0,r)})),{exp:s,source:t})},"function":function(e,t){return f(this,e,!1,t)},blockStatement:function(e){return f(this,e.func,e)},expressionStatement:function(e){var t,n,a=[],r=e.escape,i=e.value,o=i.type;return t=this[o](i,r),b(a,t.source),n=t.exp,a.push(B(r?P:L,{value:n})),{exp:"",source:a}},contentStatement:function(e){return{exp:"",source:[B(N,{value:d.wrapBySingleQuote(d.escapeString(e.value,0))})]}}};var Q,X=0;return Q={parse:function(e,t){return e?_.parse(e,t):{statements:[]}},compileToStr:function(e){var t=Q.compileToJson(e);return B(I,{functionName:e.functionName||"",params:t.params.join(","),body:t.source})},compileToJson:function(e){var t=e.name=e.name||"xtemplate"+ ++X,n=e.content,a=Q.parse(n,t);return c(new m(e),a.statements)},compile:function(e,t,n){var a=Q.compileToJson(v.merge(n,{content:e,name:t}));return Function.apply(null,a.params.concat(a.source+B(A,{name:t})))}},e=Q}(),p=function(e){function t(e,n){var i=typeof e;if("string"!==i&&"function"!==i&&(n=e,e=void 0),n=this.config=r.merge(t.globalConfig,n),"string"===i)try{e=this.compile(e,n.name)}catch(o){var s;s=o instanceof Error?o:new Error(o);var u="XTemplate error ";s.stack=u+s.stack,s.message=u+s.message,this.compileError=s}a.call(this,e,n)}function n(){}var a=s,r=a.util,i=u,o=i.compile;return n.prototype=a.prototype,t.prototype=new n,t.prototype.constructor=t,t.prototype.compile=function(e,t){return o(e,t,this.config)},t.prototype.render=function(e,t,n){"function"==typeof t&&(n=t);var r=this.compileError;if(!r)return a.prototype.render.apply(this,arguments);if(!n)throw r;n(r)},e=r.mix(t,{config:a.config,compile:o,version:"3.7.1",Compiler:i,Scope:a.Scope,Runtime:a,addCommand:a.addCommand,removeCommand:a.removeCommand})}()}();
(function() {
'use strict';

var compiledView = {};

function compileView(viewId, viewContent) {
    if (viewId) {
        if (!compiledView[viewId]) {
            compiledView[viewId] = new XTemplate(viewContent);
        }
        return compiledView[viewId];
    } else {
        return new XTemplate(viewContent);
    }
}

function requestSpace(scope, option) {
    var data = (option && option.params) ? option.params[0] : undefined;
    return Flipper.dataCenter.requestSpace(data);
}

function renderView(viewContent, data, options) {
    var viewId = options.viewId,
        element = options.element,
        compiledView = compileView(viewId, viewContent);

    var commands = options.commands || {};
    commands.attr = function(scope, options) {
        var key = options.params && options.params[0];
        return key ? element.getAttribute(key) : key;
    };

    commands.modelId = function() {
        return element.modelId || '';
    };

    commands.requestSpace = requestSpace;

    if (options.commands) {
        Object.keys(options.commands).forEach(function(key) {
            if (typeof options.commands[key] === 'function') {
                commands[key] = options.commands[key];
            } else {
                console.warn('template command must be a function');
            }
        });
    }

    options.commands = commands;

    return compiledView.render(data, options);
}

Flipper.registerTemplateEngine('xtpl', {
    render: renderView
});

}());
