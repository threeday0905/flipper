/**
 *  Most of logics below are copied from webcomponentjs, we just add some stub methods for Flipper at the end of this file.
    Original project is here: <https://github.com/webcomponents/webcomponentsjs>
 */

(function() {
    var root;

	if (typeof window === 'object' && window) {
		root = window;
	} else {
		root = global;
	}

	// Use polyfill for setImmediate for performance gains
	var asap = Promise.immediateFn || root.setImmediate || function(fn) { setTimeout(fn, 1); };

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
		return function() {
			fn.apply(thisArg, arguments);
		}
	}

	var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]" };

	function Promise(fn) {
		if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
		if (typeof fn !== 'function') throw new TypeError('not a function');
		this._state = null;
		this._value = null;
		this._deferreds = []

		doResolve(fn, bind(resolve, this), bind(reject, this))
	}

	function handle(deferred) {
		var me = this;
		if (this._state === null) {
			this._deferreds.push(deferred);
			return
		}
		asap(function() {
			var cb = me._state ? deferred.onFulfilled : deferred.onRejected
			if (cb === null) {
				(me._state ? deferred.resolve : deferred.reject)(me._value);
				return;
			}
			var ret;
			try {
				ret = cb(me._value);
			}
			catch (e) {
				deferred.reject(e);
				return;
			}
			deferred.resolve(ret);
		})
	}

	function resolve(newValue) {
		try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
			if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
			if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
				var then = newValue.then;
				if (typeof then === 'function') {
					doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
					return;
				}
			}
			this._state = true;
			this._value = newValue;
			finale.call(this);
		} catch (e) { reject.call(this, e); }
	}

	function reject(newValue) {
		this._state = false;
		this._value = newValue;
		finale.call(this);
	}

	function finale() {
		for (var i = 0, len = this._deferreds.length; i < len; i++) {
			handle.call(this, this._deferreds[i]);
		}
		this._deferreds = null;
	}

	function Handler(onFulfilled, onRejected, resolve, reject){
		this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
		this.onRejected = typeof onRejected === 'function' ? onRejected : null;
		this.resolve = resolve;
		this.reject = reject;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, onFulfilled, onRejected) {
		var done = false;
		try {
			fn(function (value) {
				if (done) return;
				done = true;
				onFulfilled(value);
			}, function (reason) {
				if (done) return;
				done = true;
				onRejected(reason);
			})
		} catch (ex) {
			if (done) return;
			done = true;
			onRejected(ex);
		}
	}

	Promise.prototype['catch'] = function (onRejected) {
		return this.then(null, onRejected);
	};

	Promise.prototype.then = function(onFulfilled, onRejected) {
		var me = this;
		return new Promise(function(resolve, reject) {
			handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
		})
	};

	Promise.all = function () {
		var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

		return new Promise(function (resolve, reject) {
			if (args.length === 0) return resolve([]);
			var remaining = args.length;
			function res(i, val) {
				try {
					if (val && (typeof val === 'object' || typeof val === 'function')) {
						var then = val.then;
						if (typeof then === 'function') {
							then.call(val, function (val) { res(i, val) }, reject);
							return;
						}
					}
					args[i] = val;
					if (--remaining === 0) {
						resolve(args);
					}
				} catch (ex) {
					reject(ex);
				}
			}
			for (var i = 0; i < args.length; i++) {
				res(i, args[i]);
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (value) {
		return new Promise(function (resolve, reject) {
			reject(value);
		});
	};

	Promise.race = function (values) {
		return new Promise(function (resolve, reject) {
			for(var i = 0, len = values.length; i < len; i++) {
				values[i].then(resolve, reject);
			}
		});
	};

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Promise;
	} else if (!root.Promise) {
		root.Promise = Promise;
	}
})();
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.5.5-b437b5c
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

(function(scope) {
  "use strict";
  var hasWorkingUrl = false;
  if (!scope.forceJURL) {
    try {
      var u = new URL("b", "http://a");
      u.pathname = "c%20d";
      hasWorkingUrl = u.href === "http://a/c%20d";
    } catch (e) {}
  }
  if (hasWorkingUrl) return;
  var relative = Object.create(null);
  relative["ftp"] = 21;
  relative["file"] = 0;
  relative["gopher"] = 70;
  relative["http"] = 80;
  relative["https"] = 443;
  relative["ws"] = 80;
  relative["wss"] = 443;
  var relativePathDotMapping = Object.create(null);
  relativePathDotMapping["%2e"] = ".";
  relativePathDotMapping[".%2e"] = "..";
  relativePathDotMapping["%2e."] = "..";
  relativePathDotMapping["%2e%2e"] = "..";
  function isRelativeScheme(scheme) {
    return relative[scheme] !== undefined;
  }
  function invalid() {
    clear.call(this);
    this._isInvalid = true;
  }
  function IDNAToASCII(h) {
    if ("" == h) {
      invalid.call(this);
    }
    return h.toLowerCase();
  }
  function percentEscape(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 32 && unicode < 127 && [ 34, 35, 60, 62, 63, 96 ].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }
  function percentEscapeQuery(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 32 && unicode < 127 && [ 34, 35, 60, 62, 96 ].indexOf(unicode) == -1) {
      return c;
    }
    return encodeURIComponent(c);
  }
  var EOF = undefined, ALPHA = /[a-zA-Z]/, ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;
  function parse(input, stateOverride, base) {
    function err(message) {
      errors.push(message);
    }
    var state = stateOverride || "scheme start", cursor = 0, buffer = "", seenAt = false, seenBracket = false, errors = [];
    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
      var c = input[cursor];
      switch (state) {
       case "scheme start":
        if (c && ALPHA.test(c)) {
          buffer += c.toLowerCase();
          state = "scheme";
        } else if (!stateOverride) {
          buffer = "";
          state = "no scheme";
          continue;
        } else {
          err("Invalid scheme.");
          break loop;
        }
        break;

       case "scheme":
        if (c && ALPHANUMERIC.test(c)) {
          buffer += c.toLowerCase();
        } else if (":" == c) {
          this._scheme = buffer;
          buffer = "";
          if (stateOverride) {
            break loop;
          }
          if (isRelativeScheme(this._scheme)) {
            this._isRelative = true;
          }
          if ("file" == this._scheme) {
            state = "relative";
          } else if (this._isRelative && base && base._scheme == this._scheme) {
            state = "relative or authority";
          } else if (this._isRelative) {
            state = "authority first slash";
          } else {
            state = "scheme data";
          }
        } else if (!stateOverride) {
          buffer = "";
          cursor = 0;
          state = "no scheme";
          continue;
        } else if (EOF == c) {
          break loop;
        } else {
          err("Code point not allowed in scheme: " + c);
          break loop;
        }
        break;

       case "scheme data":
        if ("?" == c) {
          query = "?";
          state = "query";
        } else if ("#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else {
          if (EOF != c && " " != c && "\n" != c && "\r" != c) {
            this._schemeData += percentEscape(c);
          }
        }
        break;

       case "no scheme":
        if (!base || !isRelativeScheme(base._scheme)) {
          err("Missing scheme.");
          invalid.call(this);
        } else {
          state = "relative";
          continue;
        }
        break;

       case "relative or authority":
        if ("/" == c && "/" == input[cursor + 1]) {
          state = "authority ignore slashes";
        } else {
          err("Expected /, got: " + c);
          state = "relative";
          continue;
        }
        break;

       case "relative":
        this._isRelative = true;
        if ("file" != this._scheme) this._scheme = base._scheme;
        if (EOF == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = base._query;
          break loop;
        } else if ("/" == c || "\\" == c) {
          if ("\\" == c) err("\\ is an invalid code point.");
          state = "relative slash";
        } else if ("?" == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = "?";
          state = "query";
        } else if ("#" == c) {
          this._host = base._host;
          this._port = base._port;
          this._path = base._path.slice();
          this._query = base._query;
          this._fragment = "#";
          state = "fragment";
        } else {
          var nextC = input[cursor + 1];
          var nextNextC = input[cursor + 2];
          if ("file" != this._scheme || !ALPHA.test(c) || nextC != ":" && nextC != "|" || EOF != nextNextC && "/" != nextNextC && "\\" != nextNextC && "?" != nextNextC && "#" != nextNextC) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._path.pop();
          }
          state = "relative path";
          continue;
        }
        break;

       case "relative slash":
        if ("/" == c || "\\" == c) {
          if ("\\" == c) {
            err("\\ is an invalid code point.");
          }
          if ("file" == this._scheme) {
            state = "file host";
          } else {
            state = "authority ignore slashes";
          }
        } else {
          if ("file" != this._scheme) {
            this._host = base._host;
            this._port = base._port;
          }
          state = "relative path";
          continue;
        }
        break;

       case "authority first slash":
        if ("/" == c) {
          state = "authority second slash";
        } else {
          err("Expected '/', got: " + c);
          state = "authority ignore slashes";
          continue;
        }
        break;

       case "authority second slash":
        state = "authority ignore slashes";
        if ("/" != c) {
          err("Expected '/', got: " + c);
          continue;
        }
        break;

       case "authority ignore slashes":
        if ("/" != c && "\\" != c) {
          state = "authority";
          continue;
        } else {
          err("Expected authority, got: " + c);
        }
        break;

       case "authority":
        if ("@" == c) {
          if (seenAt) {
            err("@ already seen.");
            buffer += "%40";
          }
          seenAt = true;
          for (var i = 0; i < buffer.length; i++) {
            var cp = buffer[i];
            if (" " == cp || "\n" == cp || "\r" == cp) {
              err("Invalid whitespace in authority.");
              continue;
            }
            if (":" == cp && null === this._password) {
              this._password = "";
              continue;
            }
            var tempC = percentEscape(cp);
            null !== this._password ? this._password += tempC : this._username += tempC;
          }
          buffer = "";
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          cursor -= buffer.length;
          buffer = "";
          state = "host";
          continue;
        } else {
          buffer += c;
        }
        break;

       case "file host":
        if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ":" || buffer[1] == "|")) {
            state = "relative path";
          } else if (buffer.length == 0) {
            state = "relative path start";
          } else {
            this._host = IDNAToASCII.call(this, buffer);
            buffer = "";
            state = "relative path start";
          }
          continue;
        } else if ("  " == c || "\n" == c || "\r" == c) {
          err("Invalid whitespace in file host.");
        } else {
          buffer += c;
        }
        break;

       case "host":
       case "hostname":
        if (":" == c && !seenBracket) {
          this._host = IDNAToASCII.call(this, buffer);
          buffer = "";
          state = "port";
          if ("hostname" == stateOverride) {
            break loop;
          }
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c) {
          this._host = IDNAToASCII.call(this, buffer);
          buffer = "";
          state = "relative path start";
          if (stateOverride) {
            break loop;
          }
          continue;
        } else if ("  " != c && "\n" != c && "\r" != c) {
          if ("[" == c) {
            seenBracket = true;
          } else if ("]" == c) {
            seenBracket = false;
          }
          buffer += c;
        } else {
          err("Invalid code point in host/hostname: " + c);
        }
        break;

       case "port":
        if (/[0-9]/.test(c)) {
          buffer += c;
        } else if (EOF == c || "/" == c || "\\" == c || "?" == c || "#" == c || stateOverride) {
          if ("" != buffer) {
            var temp = parseInt(buffer, 10);
            if (temp != relative[this._scheme]) {
              this._port = temp + "";
            }
            buffer = "";
          }
          if (stateOverride) {
            break loop;
          }
          state = "relative path start";
          continue;
        } else if ("  " == c || "\n" == c || "\r" == c) {
          err("Invalid code point in port: " + c);
        } else {
          invalid.call(this);
        }
        break;

       case "relative path start":
        if ("\\" == c) err("'\\' not allowed in path.");
        state = "relative path";
        if ("/" != c && "\\" != c) {
          continue;
        }
        break;

       case "relative path":
        if (EOF == c || "/" == c || "\\" == c || !stateOverride && ("?" == c || "#" == c)) {
          if ("\\" == c) {
            err("\\ not allowed in relative path.");
          }
          var tmp;
          if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
            buffer = tmp;
          }
          if (".." == buffer) {
            this._path.pop();
            if ("/" != c && "\\" != c) {
              this._path.push("");
            }
          } else if ("." == buffer && "/" != c && "\\" != c) {
            this._path.push("");
          } else if ("." != buffer) {
            if ("file" == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == "|") {
              buffer = buffer[0] + ":";
            }
            this._path.push(buffer);
          }
          buffer = "";
          if ("?" == c) {
            this._query = "?";
            state = "query";
          } else if ("#" == c) {
            this._fragment = "#";
            state = "fragment";
          }
        } else if ("  " != c && "\n" != c && "\r" != c) {
          buffer += percentEscape(c);
        }
        break;

       case "query":
        if (!stateOverride && "#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else if (EOF != c && "  " != c && "\n" != c && "\r" != c) {
          this._query += percentEscapeQuery(c);
        }
        break;

       case "fragment":
        if (EOF != c && " " != c && "\n" != c && "\r" != c) {
          this._fragment += c;
        }
        break;
      }
      cursor++;
    }
  }
  function clear() {
    this._scheme = "";
    this._schemeData = "";
    this._username = "";
    this._password = null;
    this._host = "";
    this._port = "";
    this._path = [];
    this._query = "";
    this._fragment = "";
    this._isInvalid = false;
    this._isRelative = false;
  }
  function jURL(url, base) {
    if (base !== undefined && !(base instanceof jURL)) base = new jURL(String(base));
    this._url = url;
    clear.call(this);
    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, "");
    parse.call(this, input, null, base);
  }
  jURL.prototype = {
    get href() {
      if (this._isInvalid) return this._url;
      var authority = "";
      if ("" != this._username || null != this._password) {
        authority = this._username + (null != this._password ? ":" + this._password : "") + "@";
      }
      return this.protocol + (this._isRelative ? "//" + authority + this.host : "") + this.pathname + this._query + this._fragment;
    },
    set href(href) {
      clear.call(this);
      parse.call(this, href);
    },
    get protocol() {
      return this._scheme + ":";
    },
    set protocol(protocol) {
      if (this._isInvalid) return;
      parse.call(this, protocol + ":", "scheme start");
    },
    get host() {
      return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host;
    },
    set host(host) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, host, "host");
    },
    get hostname() {
      return this._host;
    },
    set hostname(hostname) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, hostname, "hostname");
    },
    get port() {
      return this._port;
    },
    set port(port) {
      if (this._isInvalid || !this._isRelative) return;
      parse.call(this, port, "port");
    },
    get pathname() {
      return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData;
    },
    set pathname(pathname) {
      if (this._isInvalid || !this._isRelative) return;
      this._path = [];
      parse.call(this, pathname, "relative path start");
    },
    get search() {
      return this._isInvalid || !this._query || "?" == this._query ? "" : this._query;
    },
    set search(search) {
      if (this._isInvalid || !this._isRelative) return;
      this._query = "?";
      if ("?" == search[0]) search = search.slice(1);
      parse.call(this, search, "query");
    },
    get hash() {
      return this._isInvalid || !this._fragment || "#" == this._fragment ? "" : this._fragment;
    },
    set hash(hash) {
      if (this._isInvalid) return;
      this._fragment = "#";
      if ("#" == hash[0]) hash = hash.slice(1);
      parse.call(this, hash, "fragment");
    },
    get origin() {
      var host;
      if (this._isInvalid || !this._scheme) {
        return "";
      }
      switch (this._scheme) {
       case "data":
       case "file":
       case "javascript":
       case "mailto":
        return "null";
      }
      host = this.host;
      if (!host) {
        return "";
      }
      return this._scheme + "://" + host;
    }
  };
  var OriginalURL = scope.URL;
  if (OriginalURL) {
    jURL.createObjectURL = function(blob) {
      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
    };
    jURL.revokeObjectURL = function(url) {
      OriginalURL.revokeObjectURL(url);
    };
  }
  scope.URL = jURL;
})(this);

(function(global) {
  var registrationsTable = new WeakMap();
  var setImmediate;
  if (/Trident|Edge/.test(navigator.userAgent)) {
    setImmediate = setTimeout;
  } else if (window.setImmediate) {
    setImmediate = window.setImmediate;
  } else {
    var setImmediateQueue = [];
    var sentinel = String(Math.random());
    window.addEventListener("message", function(e) {
      if (e.data === sentinel) {
        var queue = setImmediateQueue;
        setImmediateQueue = [];
        queue.forEach(function(func) {
          func();
        });
      }
    });
    setImmediate = function(func) {
      setImmediateQueue.push(func);
      window.postMessage(sentinel, "*");
    };
  }
  var isScheduled = false;
  var scheduledObservers = [];
  function scheduleCallback(observer) {
    scheduledObservers.push(observer);
    if (!isScheduled) {
      isScheduled = true;
      setImmediate(dispatchCallbacks);
    }
  }
  function wrapIfNeeded(node) {
    return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(node) || node;
  }
  function dispatchCallbacks() {
    isScheduled = false;
    var observers = scheduledObservers;
    scheduledObservers = [];
    observers.sort(function(o1, o2) {
      return o1.uid_ - o2.uid_;
    });
    var anyNonEmpty = false;
    observers.forEach(function(observer) {
      var queue = observer.takeRecords();
      removeTransientObserversFor(observer);
      if (queue.length) {
        observer.callback_(queue, observer);
        anyNonEmpty = true;
      }
    });
    if (anyNonEmpty) dispatchCallbacks();
  }
  function removeTransientObserversFor(observer) {
    observer.nodes_.forEach(function(node) {
      var registrations = registrationsTable.get(node);
      if (!registrations) return;
      registrations.forEach(function(registration) {
        if (registration.observer === observer) registration.removeTransientObservers();
      });
    });
  }
  function forEachAncestorAndObserverEnqueueRecord(target, callback) {
    for (var node = target; node; node = node.parentNode) {
      var registrations = registrationsTable.get(node);
      if (registrations) {
        for (var j = 0; j < registrations.length; j++) {
          var registration = registrations[j];
          var options = registration.options;
          if (node !== target && !options.subtree) continue;
          var record = callback(options);
          if (record) registration.enqueue(record);
        }
      }
    }
  }
  var uidCounter = 0;
  function JsMutationObserver(callback) {
    this.callback_ = callback;
    this.nodes_ = [];
    this.records_ = [];
    this.uid_ = ++uidCounter;
  }
  JsMutationObserver.prototype = {
    observe: function(target, options) {
      target = wrapIfNeeded(target);
      if (!options.childList && !options.attributes && !options.characterData || options.attributeOldValue && !options.attributes || options.attributeFilter && options.attributeFilter.length && !options.attributes || options.characterDataOldValue && !options.characterData) {
        throw new SyntaxError();
      }
      var registrations = registrationsTable.get(target);
      if (!registrations) registrationsTable.set(target, registrations = []);
      var registration;
      for (var i = 0; i < registrations.length; i++) {
        if (registrations[i].observer === this) {
          registration = registrations[i];
          registration.removeListeners();
          registration.options = options;
          break;
        }
      }
      if (!registration) {
        registration = new Registration(this, target, options);
        registrations.push(registration);
        this.nodes_.push(target);
      }
      registration.addListeners();
    },
    disconnect: function() {
      this.nodes_.forEach(function(node) {
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          var registration = registrations[i];
          if (registration.observer === this) {
            registration.removeListeners();
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
  function MutationRecord(type, target) {
    this.type = type;
    this.target = target;
    this.addedNodes = [];
    this.removedNodes = [];
    this.previousSibling = null;
    this.nextSibling = null;
    this.attributeName = null;
    this.attributeNamespace = null;
    this.oldValue = null;
  }
  function copyMutationRecord(original) {
    var record = new MutationRecord(original.type, original.target);
    record.addedNodes = original.addedNodes.slice();
    record.removedNodes = original.removedNodes.slice();
    record.previousSibling = original.previousSibling;
    record.nextSibling = original.nextSibling;
    record.attributeName = original.attributeName;
    record.attributeNamespace = original.attributeNamespace;
    record.oldValue = original.oldValue;
    return record;
  }
  var currentRecord, recordWithOldValue;
  function getRecord(type, target) {
    return currentRecord = new MutationRecord(type, target);
  }
  function getRecordWithOldValue(oldValue) {
    if (recordWithOldValue) return recordWithOldValue;
    recordWithOldValue = copyMutationRecord(currentRecord);
    recordWithOldValue.oldValue = oldValue;
    return recordWithOldValue;
  }
  function clearRecords() {
    currentRecord = recordWithOldValue = undefined;
  }
  function recordRepresentsCurrentMutation(record) {
    return record === recordWithOldValue || record === currentRecord;
  }
  function selectRecord(lastRecord, newRecord) {
    if (lastRecord === newRecord) return lastRecord;
    if (recordWithOldValue && recordRepresentsCurrentMutation(lastRecord)) return recordWithOldValue;
    return null;
  }
  function Registration(observer, target, options) {
    this.observer = observer;
    this.target = target;
    this.options = options;
    this.transientObservedNodes = [];
  }
  Registration.prototype = {
    enqueue: function(record) {
      var records = this.observer.records_;
      var length = records.length;
      if (records.length > 0) {
        var lastRecord = records[length - 1];
        var recordToReplaceLast = selectRecord(lastRecord, record);
        if (recordToReplaceLast) {
          records[length - 1] = recordToReplaceLast;
          return;
        }
      } else {
        scheduleCallback(this.observer);
      }
      records[length] = record;
    },
    addListeners: function() {
      this.addListeners_(this.target);
    },
    addListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.addEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.addEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.addEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.addEventListener("DOMNodeRemoved", this, true);
    },
    removeListeners: function() {
      this.removeListeners_(this.target);
    },
    removeListeners_: function(node) {
      var options = this.options;
      if (options.attributes) node.removeEventListener("DOMAttrModified", this, true);
      if (options.characterData) node.removeEventListener("DOMCharacterDataModified", this, true);
      if (options.childList) node.removeEventListener("DOMNodeInserted", this, true);
      if (options.childList || options.subtree) node.removeEventListener("DOMNodeRemoved", this, true);
    },
    addTransientObserver: function(node) {
      if (node === this.target) return;
      this.addListeners_(node);
      this.transientObservedNodes.push(node);
      var registrations = registrationsTable.get(node);
      if (!registrations) registrationsTable.set(node, registrations = []);
      registrations.push(this);
    },
    removeTransientObservers: function() {
      var transientObservedNodes = this.transientObservedNodes;
      this.transientObservedNodes = [];
      transientObservedNodes.forEach(function(node) {
        this.removeListeners_(node);
        var registrations = registrationsTable.get(node);
        for (var i = 0; i < registrations.length; i++) {
          if (registrations[i] === this) {
            registrations.splice(i, 1);
            break;
          }
        }
      }, this);
    },
    handleEvent: function(e) {
      e.stopImmediatePropagation();
      switch (e.type) {
       case "DOMAttrModified":
        var name = e.attrName;
        var namespace = e.relatedNode.namespaceURI;
        var target = e.target;
        var record = new getRecord("attributes", target);
        record.attributeName = name;
        record.attributeNamespace = namespace;
        var oldValue = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.attributes) return;
          if (options.attributeFilter && options.attributeFilter.length && options.attributeFilter.indexOf(name) === -1 && options.attributeFilter.indexOf(namespace) === -1) {
            return;
          }
          if (options.attributeOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMCharacterDataModified":
        var target = e.target;
        var record = getRecord("characterData", target);
        var oldValue = e.prevValue;
        forEachAncestorAndObserverEnqueueRecord(target, function(options) {
          if (!options.characterData) return;
          if (options.characterDataOldValue) return getRecordWithOldValue(oldValue);
          return record;
        });
        break;

       case "DOMNodeRemoved":
        this.addTransientObserver(e.target);

       case "DOMNodeInserted":
        var changedNode = e.target;
        var addedNodes, removedNodes;
        if (e.type === "DOMNodeInserted") {
          addedNodes = [ changedNode ];
          removedNodes = [];
        } else {
          addedNodes = [];
          removedNodes = [ changedNode ];
        }
        var previousSibling = changedNode.previousSibling;
        var nextSibling = changedNode.nextSibling;
        var record = getRecord("childList", e.target.parentNode);
        record.addedNodes = addedNodes;
        record.removedNodes = removedNodes;
        record.previousSibling = previousSibling;
        record.nextSibling = nextSibling;
        forEachAncestorAndObserverEnqueueRecord(e.relatedNode, function(options) {
          if (!options.childList) return;
          return record;
        });
      }
      clearRecords();
    }
  };
  global.JsMutationObserver = JsMutationObserver;
  if (!global.MutationObserver) global.MutationObserver = JsMutationObserver;
})(this);

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
    var parsedCount = 0, importCount = imports.length, newImports = [], errorImports = [];
    function checkDone() {
      if (parsedCount == importCount && callback) {
        callback({
          allImports: imports,
          loadedImports: newImports,
          errorImports: errorImports
        });
      }
    }
    function loadedImport(e) {
      markTargetLoaded(e);
      newImports.push(this);
      parsedCount++;
      checkDone();
    }
    function errorLoadingImport(e) {
      errorImports.push(this);
      parsedCount++;
      checkDone();
    }
    if (importCount) {
      for (var i = 0, imp; i < importCount && (imp = imports[i]); i++) {
        if (isImportLoaded(imp)) {
          parsedCount++;
          checkDone();
        } else {
          imp.addEventListener("load", loadedImport);
          imp.addEventListener("error", errorLoadingImport);
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
  whenReady(function(detail) {
    HTMLImports.ready = true;
    HTMLImports.readyTime = new Date().getTime();
    var evt = rootDocument.createEvent("CustomEvent");
    evt.initCustomEvent("HTMLImportsLoaded", true, true, detail);
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
    resolveUrlsInStyle: function(style, linkUrl) {
      var doc = style.ownerDocument;
      var resolver = doc.createElement("a");
      style.textContent = this.resolveUrlsInCssText(style.textContent, linkUrl, resolver);
      return style;
    },
    resolveUrlsInCssText: function(cssText, linkUrl, urlObj) {
      var r = this.replaceUrls(cssText, urlObj, linkUrl, CSS_URL_REGEXP);
      r = this.replaceUrls(r, urlObj, linkUrl, CSS_IMPORT_REGEXP);
      return r;
    },
    replaceUrls: function(text, urlObj, linkUrl, regexp) {
      return text.replace(regexp, function(m, pre, url, post) {
        var urlPath = url.replace(/["']/g, "");
        if (linkUrl) {
          urlPath = new URL(urlPath, linkUrl).href;
        }
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
      src.__appliedElement = elt;
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
      p = p.parentNode || p.nodeType === Node.DOCUMENT_FRAGMENT_NODE && p.host;
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

if (typeof HTMLTemplateElement === "undefined") {
  (function() {
    var TEMPLATE_TAG = "template";
    HTMLTemplateElement = function() {};
    HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);
    HTMLTemplateElement.decorate = function(template) {
      if (!template.content) {
        template.content = template.ownerDocument.createDocumentFragment();
        var child;
        while (child = template.firstChild) {
          template.content.appendChild(child);
        }
      }
    };
    HTMLTemplateElement.bootstrap = function(doc) {
      var templates = doc.querySelectorAll(TEMPLATE_TAG);
      for (var i = 0, l = templates.length, t; i < l && (t = templates[i]); i++) {
        HTMLTemplateElement.decorate(t);
      }
    };
    addEventListener("DOMContentLoaded", function() {
      HTMLTemplateElement.bootstrap(document);
    });
  })();
}

(function(scope) {
  var style = document.createElement("style");
  style.textContent = "" + "body {" + "transition: opacity ease-in 0.2s;" + " } \n" + "body[unresolved] {" + "opacity: 0; display: block; overflow: hidden; position: relative;" + " } \n";
  var head = document.querySelector("head");
  head.insertBefore(style, head.firstChild);
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
    //return new URL(target, baseUri).toString();
    var url = new URL(target, baseUri);
    return url.href;
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

                var commands = this.commands;

                if (typeof commands === 'function') {
                    commands = commands.call(this);
                }

                if (typeof commands === 'object') {
                    if (options.commands) {
                        utils.mixin(options.commands, commands);
                    } else {
                        options.commands = commands;
                    }
                }

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

                /* if template polyfill,
                    all content will be copied to content as a fragment */
                if (!result && ele.content && ele.content.cloneNode) {
                    var div = document.createElement('div');
                    div.appendChild(ele.content.cloneNode(true));
                    result = div.innerHTML;
                }
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
    return script ?
        (script.baseURI || script.ownerDocument.baseURI ) : tryGetBaseUri();
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
    window.KISSY.add(definition);
} else if (typeof window.define === 'function' && window.define) {
    window.define(definition);
}

window.Flipper = definition();

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
