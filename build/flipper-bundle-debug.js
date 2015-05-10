/**
 *  Most of logics below are copied from webcomponentjs, we just add some stub methods for Flipper at the end of this file.
    Original project is here: <https://github.com/webcomponents/webcomponentsjs>
 */

(function(root) {

	// Use polyfill for setImmediate for performance gains
	var asap = Promise.immediateFn || (typeof setImmediate === 'function' && setImmediate) ||
		function(fn) { setTimeout(fn, 1); };

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

})(this);
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.6.1
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
    if (flags.log && flags.log.split) {
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
          if (EOF != c && "	" != c && "\n" != c && "\r" != c) {
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
            if ("	" == cp || "\n" == cp || "\r" == cp) {
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
        } else if ("	" == c || "\n" == c || "\r" == c) {
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
        } else if ("	" != c && "\n" != c && "\r" != c) {
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
        } else if ("	" == c || "\n" == c || "\r" == c) {
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
        } else if ("	" != c && "\n" != c && "\r" != c) {
          buffer += percentEscape(c);
        }
        break;

       case "query":
        if (!stateOverride && "#" == c) {
          this._fragment = "#";
          state = "fragment";
        } else if (EOF != c && "	" != c && "\n" != c && "\r" != c) {
          this._query += percentEscapeQuery(c);
        }
        break;

       case "fragment":
        if (EOF != c && "	" != c && "\n" != c && "\r" != c) {
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
    toString: function() {
      return this.href;
    },
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
  function forDocumentTree(doc, cb) {
    _forDocumentTree(doc, cb, []);
  }
  function _forDocumentTree(doc, cb, processingDocuments) {
    doc = wrap(doc);
    if (processingDocuments.indexOf(doc) >= 0) {
      return;
    }
    processingDocuments.push(doc);
    var imports = doc.querySelectorAll("link[rel=" + IMPORT_LINK_TYPE + "]");
    for (var i = 0, l = imports.length, n; i < l && (n = imports[i]); i++) {
      if (n.import) {
        _forDocumentTree(n.import, cb, processingDocuments);
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
  var isIE11OrOlder = scope.isIE11OrOlder;
  var upgradeDocumentTree = scope.upgradeDocumentTree;
  var upgradeAll = scope.upgradeAll;
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
  var domCreateElement = document.createElement.bind(document);
  var domCreateElementNS = document.createElementNS.bind(document);
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
  function wrapDomMethodToForceUpgrade(obj, methodName) {
    var orig = obj[methodName];
    obj[methodName] = function() {
      var n = orig.apply(this, arguments);
      upgradeAll(n);
      return n;
    };
  }
  wrapDomMethodToForceUpgrade(Node.prototype, "cloneNode");
  wrapDomMethodToForceUpgrade(document, "importNode");
  if (isIE11OrOlder) {
    (function() {
      var importNode = document.importNode;
      document.importNode = function() {
        var n = importNode.apply(document, arguments);
        if (n.nodeType == n.DOCUMENT_FRAGMENT_NODE) {
          var f = document.createDocumentFragment();
          f.appendChild(n);
          return f;
        } else {
          return n;
        }
      };
    })();
  }
  document.registerElement = register;
  document.createElement = createElement;
  document.createElementNS = createElementNS;
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
  scope.isIE11OrOlder = isIE11OrOlder;
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

utils.each = function(obj, fn) {
    if (utils.isArray(obj)) {
        for (var i = 0, len = obj.length; i < len; i += 1) {
            fn(obj[i], i);
        }
    } else {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                fn(obj[prop], prop);
            }
        }
    }
};

utils.format = function format(pattern) {
    var i = 0;
    pattern.replace(/%s/, function() {
        i = i + 1;
        return arguments[i] || '';
    });
};

utils.isArray = Array.isArray || function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

utils.isPromise = function isPromise(obj) {
    return obj && typeof obj.then === 'function';
};



utils.log = function log() {
    var msg = utils.format.apply(utils, arguments);
    if (typeof console.log === 'function') {
        console.log(msg);
    }
};

function doesGetOwnPropertyDescriptorWork(object) {
    try {
        object.sentinel = 0;
        return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
    } catch (exception) {
        return false;
    }
}

var supportES5Property =
    doesGetOwnPropertyDescriptorWork({}) &&
    doesGetOwnPropertyDescriptorWork(document.createElement('div'));

utils.mixin = function mixin(to, from) {
    if (!to) {
        return;
    }
    if (supportES5Property) {
        Object.getOwnPropertyNames(from).forEach(function(name) {
            Object.defineProperty(to, name,
                Object.getOwnPropertyDescriptor(from, name)
            );
        });
    } else {
        for (var key in from) {
            if (from.hasOwnProperty(key)) {
                to[key] = from[key];
            }
        }
    }
};

utils.defineProperty = function(obj, name, descriptor) {
    if (supportES5Property) {
        Object.defineProperty(obj, name, descriptor);
    } else {
        obj[name] = descriptor.value;
    }
};

utils.getDescriptor = function(obj, name) {
    if (supportES5Property) {
        return Object.getOwnPropertyDescriptor(obj, name);
    } else {
        return {
            value: obj[name]
        };
    }
};

utils.defineProperties = function(obj, properties) {
    if (supportES5Property) {
        Object.defineProperties(obj, properties);
    } else {
        utils.each(properties, function(descriptor, key) {
            utils.defineProperty(obj, key, descriptor);
        });
    }
};

utils.createObject = Object.create && supportES5Property ?
    Object.create : (function() {
        var Temp = function() {};
        return function(prototype, propertiesObject) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }

            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;

            if (propertiesObject) {
                utils.defineProperties(result, propertiesObject);
            }

            return result;
        };
    }());

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

    function isWatcherMethod(key) {
        return key.substr(key.length - suffix.length);
    }

    utils.each(options, function(val, key) {
        if (isWatcherMethod(key) && typeof val === 'function') {
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
        utils.each(options.template, function(val, key) {
            component.addView(val, key);
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
    utils.each(elementProto, function(val, key) {
        var descriptor = utils.getDescriptor(elementProto, key);

        if (key === 'model') {
            targetProto.model = elementProto.model;
        } else if (LIFE_EVENTS.lastIndexOf(key) > -1 ) {
            utils.defineProperty(targetProto._lifeCycle, key, descriptor);

            if (PUBLIC_LIFE_EVENTS.lastIndexOf(key) > -1 ) {
                utils.defineProperty(targetProto, key, descriptor);
            }
        } else {
            utils.defineProperty(targetProto, key, descriptor);
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
    var elementProto = utils.createObject(HTMLElement.prototype);

    elementProto._lifeCycle = {};

    function wrapCallback(key) {
        var callback = component[key];
        return function() {
            callback.call(component, this, arguments);
        };
    }
    utils.defineProperties(elementProto, {
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
                        .then(component.renderSuccess.bind(component, element))
                        .then(callback.bind(element))
                        ['catch'](component.renderFail.bind(component, element))
                        .then(component.renderComplete.bind(component, element));
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

        if (document.registerElement) {
            document.registerElement(this.name, {
                prototype: this.elementProto
            });
        }

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
            .then(this.renderSuccess.bind(this, element))
            ['catch'](this.renderFail.bind(this, element))
            .then(this.addStyle.bind(this, element))
            .then(this.renderComplete.bind(this, element));

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
    renderSuccess: function(element) {
        var result = tryCallLifeCycleEvent(element, 'ready');

        return Promise.resolve(result).then(function() {
            element.removeAttribute('unresolved');
            var readyEvent = new CustomEvent('ready');
            element.dispatchEvent(readyEvent);
        });
    },

    renderComplete: function(element) {
        var completeEvent = new CustomEvent('initialized');
        element.dispatchEvent(completeEvent);
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

        var destroyEvent = new CustomEvent('destroy');
        element.dispatchEvent(destroyEvent);
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
    if (utils.isArray(name)) {
        elementProto = dependencies;
        dependencies = name;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register( { ... } ); */
    } else if (typeof name === 'object' || name === undefined) {
        elementProto = name;
        dependencies = undefined;
        name = tryGetNameFromCurrentScript();

    /* Flipper.register('xxx', { ... } ); */
    } else if (typeof name === 'string' && !utils.isArray(dependencies)) {
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

if (document.registerElement) {
    document.registerElement(Flipper.configs.declarationTag /* web-component */, {
        prototype: utils.createObject(HTMLElement.prototype, {
            createdCallback: {
                value: function() {
                    registerFromDeclarationTag(this);
                }
            }
        })
    });
}

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

/*var packages = {};

function endsWtih(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getPackage(str) {
    var match = /(\w+)\//.exec(str);
    return match ? match[1] : '';
}

Flipper.config = function(name, options) {
    if (name === 'packages' && typeof options === 'object') {
        utils.each(options, function(val, key) {
            packages[key] = val;
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
};*/

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

/*
Copyright 2015, xtemplate@4.2.4
MIT Licensed
build time: Thu, 07 May 2015 09:21:25 GMT
*/
var XTemplate = (function(){ var module = {};

/*
combined modules:
xtemplate/4.2.4/index
xtemplate/4.2.4/runtime
xtemplate/4.2.4/runtime/util
xtemplate/4.2.4/runtime/commands
xtemplate/4.2.4/runtime/scope
xtemplate/4.2.4/runtime/linked-buffer
xtemplate/4.2.4/compiler
xtemplate/4.2.4/compiler/tools
xtemplate/4.2.4/compiler/parser
xtemplate/4.2.4/compiler/ast
*/
var xtemplate424RuntimeUtil, xtemplate424RuntimeScope, xtemplate424RuntimeLinkedBuffer, xtemplate424CompilerTools, xtemplate424CompilerParser, xtemplate424CompilerAst, xtemplate424RuntimeCommands, xtemplate424Runtime, xtemplate424Compiler, xtemplate424Index;
xtemplate424RuntimeUtil = function (exports) {
  // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
  // http://wonko.com/post/html-escaping
  var htmlEntities = {
    '&': '&amp;',
    '>': '&gt;',
    '<': '&lt;',
    '`': '&#x60;',
    '/': '&#x2F;',
    '"': '&quot;',
    /*jshint quotmark:false*/
    '\'': '&#x27;'
  };
  var possibleEscapeHtmlReg = /[&<>"'`]/;
  var escapeHtmlReg = getEscapeReg();
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
  var win = typeof global !== 'undefined' ? global : window;
  function getEscapeReg() {
    var str = '';
    for (var entity in htmlEntities) {
      str += entity + '|';
    }
    str = str.slice(0, -1);
    escapeHtmlReg = new RegExp(str, 'g');
    return escapeHtmlReg;
  }
  var util;
  var toString = Object.prototype.toString;
  exports = util = {
    isArray: Array.isArray || function (obj) {
      return toString.call(obj) === '[object Array]';
    },
    keys: Object.keys || function (o) {
      var result = [];
      var p;
      for (p in o) {
        if (o.hasOwnProperty(p)) {
          result.push(p);
        }
      }
      return result;
    },
    each: function (object, fn, context) {
      if (object) {
        var key, val, keys;
        var i = 0;
        var length = object && object.length;
        var isObj = length === undefined || Object.prototype.toString.call(object) === '[object Function]';
        context = context || null;
        if (isObj) {
          keys = util.keys(object);
          for (; i < keys.length; i++) {
            key = keys[i];
            if (fn.call(context, object[key], key, object) === false) {
              break;
            }
          }
        } else {
          for (val = object[0]; i < length; val = object[++i]) {
            if (fn.call(context, val, i, object) === false) {
              break;
            }
          }
        }
      }
      return object;
    },
    mix: function (t, s) {
      if (s) {
        for (var p in s) {
          t[p] = s[p];
        }
      }
      return t;
    },
    globalEval: function (data) {
      if (win.execScript) {
        win.execScript(data);
      } else {
        (function (data) {
          win['eval'].call(win, data);
        }(data));
      }
    },
    substitute: function (str, o, regexp) {
      if (typeof str !== 'string' || !o) {
        return str;
      }
      return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
        if (match.charAt(0) === '\\') {
          return match.slice(1);
        }
        return o[name] === undefined ? '' : o[name];
      });
    },
    escapeHtml: function (str) {
      str = '' + str;
      if (!possibleEscapeHtmlReg.test(str)) {
        return str;
      }
      return (str + '').replace(escapeHtmlReg, function (m) {
        return htmlEntities[m];
      });
    },
    merge: function () {
      var i = 0;
      var len = arguments.length;
      var ret = {};
      for (; i < len; i++) {
        var arg = arguments[i];
        if (arg) {
          util.mix(ret, arg);
        }
      }
      return ret;
    }
  };
  return exports;
}();
xtemplate424RuntimeScope = function (exports) {
  function Scope(data, affix, parent) {
    if (data !== undefined) {
      this.data = data;
    } else {
      this.data = {};
    }
    if (parent) {
      this.parent = parent;
      this.root = parent.root;
    } else {
      this.parent = undefined;
      this.root = this;
    }
    this.affix = affix || {};
    this.ready = false;
  }
  Scope.prototype = {
    isScope: 1,
    constructor: Scope,
    setParent: function (parentScope) {
      this.parent = parentScope;
      this.root = parentScope.root;
    },
    set: function (name, value) {
      this.affix[name] = value;
    },
    setData: function (data) {
      this.data = data;
    },
    getData: function () {
      return this.data;
    },
    mix: function (v) {
      var affix = this.affix;
      for (var name in v) {
        affix[name] = v[name];
      }
    },
    get: function (name) {
      var data = this.data;
      var v;
      var affix = this.affix;
      if (data != null) {
        v = data[name];
      }
      if (v !== undefined) {
        return v;
      }
      return affix[name];
    },
    resolveInternalOuter: function (parts) {
      var part0 = parts[0];
      var v;
      var self = this;
      var scope = self;
      if (part0 === 'this') {
        v = self.data;
      } else if (part0 === 'root') {
        scope = scope.root;
        v = scope.data;
      } else if (part0) {
        do {
          v = scope.get(part0);
        } while (v === undefined && (scope = scope.parent));
      } else {
        return [scope.data];
      }
      return [
        undefined,
        v
      ];
    },
    resolveInternal: function (parts) {
      var ret = this.resolveInternalOuter(parts);
      if (ret.length === 1) {
        return ret[0];
      }
      var i;
      var len = parts.length;
      var v = ret[1];
      if (v === undefined) {
        return undefined;
      }
      for (i = 1; i < len; i++) {
        if (v == null) {
          return v;
        }
        v = v[parts[i]];
      }
      return v;
    },
    resolveLooseInternal: function (parts) {
      var ret = this.resolveInternalOuter(parts);
      if (ret.length === 1) {
        return ret[0];
      }
      var i;
      var len = parts.length;
      var v = ret[1];
      for (i = 1; v != null && i < len; i++) {
        v = v[parts[i]];
      }
      return v;
    },
    resolveUp: function (parts) {
      return this.parent && this.parent.resolveInternal(parts);
    },
    resolveLooseUp: function (parts) {
      return this.parent && this.parent.resolveLooseInternal(parts);
    },
    resolveOuter: function (parts, depth) {
      var self = this;
      var scope = self;
      var v;
      if (!depth && parts.length === 1) {
        v = self.get(parts[0]);
        if (v !== undefined) {
          return [v];
        } else {
          depth = 1;
        }
      }
      if (depth) {
        while (scope && depth--) {
          scope = scope.parent;
        }
      }
      if (!scope) {
        return [undefined];
      }
      return [
        undefined,
        scope
      ];
    },
    resolveLoose: function (parts, depth) {
      var ret = this.resolveOuter(parts, depth);
      if (ret.length === 1) {
        return ret[0];
      }
      return ret[1].resolveLooseInternal(parts);
    },
    resolve: function (parts, depth) {
      var ret = this.resolveOuter(parts, depth);
      if (ret.length === 1) {
        return ret[0];
      }
      return ret[1].resolveInternal(parts);
    }
  };
  exports = Scope;
  return exports;
}();
xtemplate424RuntimeLinkedBuffer = function (exports) {
  var util = xtemplate424RuntimeUtil;
  function Buffer(list, next, tpl) {
    this.list = list;
    this.init();
    this.next = next;
    this.ready = false;
    this.tpl = tpl;
  }
  Buffer.prototype = {
    constructor: Buffer,
    isBuffer: 1,
    init: function () {
      this.data = '';
    },
    append: function (data) {
      this.data += data;
      return this;
    },
    write: function (data) {
      if (data != null) {
        if (data.isBuffer) {
          return data;
        } else {
          this.data += data;
        }
      }
      return this;
    },
    writeEscaped: function (data) {
      if (data != null) {
        if (data.isBuffer) {
          return data;
        } else {
          this.data += util.escapeHtml(data);
        }
      }
      return this;
    },
    insert: function () {
      var self = this;
      var list = self.list;
      var tpl = self.tpl;
      var nextFragment = new Buffer(list, self.next, tpl);
      var asyncFragment = new Buffer(list, nextFragment, tpl);
      self.next = asyncFragment;
      self.ready = true;
      return asyncFragment;
    },
    async: function (fn) {
      var asyncFragment = this.insert();
      var nextFragment = asyncFragment.next;
      fn(asyncFragment);
      return nextFragment;
    },
    error: function (e) {
      var callback = this.list.callback;
      if (callback) {
        var tpl = this.tpl;
        if (tpl) {
          if (e instanceof Error) {
          } else {
            e = new Error(e);
          }
          var name = tpl.name;
          var line = tpl.pos.line;
          var errorStr = 'XTemplate error in file: ' + name + ' at line ' + line + ': ';
          e.stack = errorStr + e.stack;
          e.message = errorStr + e.message;
          e.xtpl = {
            pos: { line: line },
            name: name
          };
        }
        this.list.callback = null;
        callback(e, undefined);
      }
    },
    end: function () {
      var self = this;
      if (self.list.callback) {
        self.ready = true;
        self.list.flush();
      }
      return self;
    }
  };
  function LinkedBuffer(callback, config) {
    var self = this;
    self.config = config;
    self.head = new Buffer(self, undefined);
    self.callback = callback;
    this.init();
  }
  LinkedBuffer.prototype = {
    constructor: LinkedBuffer,
    init: function () {
      this.data = '';
    },
    append: function (data) {
      this.data += data;
    },
    end: function () {
      this.callback(null, this.data);
      this.callback = null;
    },
    flush: function () {
      var self = this;
      var fragment = self.head;
      while (fragment) {
        if (fragment.ready) {
          this.data += fragment.data;
        } else {
          self.head = fragment;
          return;
        }
        fragment = fragment.next;
      }
      self.end();
    }
  };
  LinkedBuffer.Buffer = Buffer;
  exports = LinkedBuffer;
  return exports;
}();
xtemplate424CompilerTools = function (exports) {
  var doubleReg = /\\*"/g;
  var singleReg = /\\*'/g;
  var arrayPush = [].push;
  var globals = {};
  globals['undefined'] = globals['null'] = globals['true'] = globals['false'] = 1;
  function genStackJudge(parts, data, count, lastVariable) {
    if (!parts.length) {
      return data;
    }
    lastVariable = lastVariable || data;
    count = count || 0;
    var part0 = parts[0];
    var variable = 't' + count;
    return [
      '(' + data + ' != null ? ',
      genStackJudge(parts.slice(1), '(' + variable + '=' + lastVariable + part0 + ')', ++count, variable),
      ' : ',
      lastVariable,
      ')'
    ].join('');
  }
  function accessVariable(loose, parts, topVariable, fullVariable) {
    return loose ? genStackJudge(parts.slice(1), topVariable) : fullVariable;
  }
  var tools = exports = {
    genStackJudge: genStackJudge,
    isGlobalId: function (node) {
      if (globals[node.string]) {
        return 1;
      }
      return 0;
    },
    chainedVariableRead: function (self, source, idParts, root, resolveUp, loose) {
      var strs = tools.convertIdPartsToRawAccessor(self, source, idParts);
      var parts = strs.parts;
      var part0 = parts[0];
      var scope = '';
      if (root) {
        scope = 'scope.root.';
      }
      var affix = scope + 'affix';
      var data = scope + 'data';
      var ret = [
        '(',
        '(t=(' + affix + part0 + ')) !== undefined ? ',
        idParts.length > 1 ? accessVariable(loose, parts, 't', affix + strs.str) : 't',
        ' : '
      ];
      if (resolveUp) {
        ret = ret.concat([
          '(',
          '(t = ' + data + part0 + ') !== undefined ? ',
          idParts.length > 1 ? accessVariable(loose, parts, 't', data + strs.str) : 't',
          '  : ',
          loose ? 'scope.resolveLooseUp(' + strs.arr + ')' : 'scope.resolveUp(' + strs.arr + ')',
          ')'
        ]);
      } else {
        ret.push(accessVariable(loose, parts, data + part0, data + strs.str));
      }
      ret.push(')');
      return ret.join('');
    },
    convertIdPartsToRawAccessor: function (self, source, idParts) {
      var i, l, idPart, idPartType, nextIdNameCode;
      var parts = [];
      var ret = [];
      var funcRet = '';
      for (i = 0, l = idParts.length; i < l; i++) {
        idPart = idParts[i];
        idPartType = idPart.type;
        if (idPartType) {
          nextIdNameCode = self[idPartType](idPart);
          tools.pushToArray(source, nextIdNameCode.source);
          if (idPartType === 'function') {
            funcRet = 1;
          }
          ret.push('[' + nextIdNameCode.exp + ']');
          parts.push(nextIdNameCode.exp);
        } else {
          ret.push('.' + idPart);
          parts.push(tools.wrapByDoubleQuote(idPart));
        }
      }
      return {
        str: ret.join(''),
        arr: '[' + parts.join(',') + ']',
        parts: ret,
        funcRet: funcRet,
        resolvedParts: parts
      };
    },
    wrapByDoubleQuote: function (str) {
      return '"' + str + '"';
    },
    wrapBySingleQuote: function (str) {
      return '\'' + str + '\'';
    },
    joinArrayOfString: function (arr) {
      return tools.wrapByDoubleQuote(arr.join('","'));
    },
    escapeSingleQuoteInCodeString: function (str, isDouble) {
      return str.replace(isDouble ? doubleReg : singleReg, function (m) {
        if (m.length % 2) {
          m = '\\' + m;
        }
        return m;
      });
    },
    escapeString: function (str, isCode) {
      if (isCode) {
        str = tools.escapeSingleQuoteInCodeString(str, 0);
      } else {
        str = str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
      }
      str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
      return str;
    },
    pushToArray: function (to, from) {
      if (from) {
        arrayPush.apply(to, from);
      }
    }
  };
  return exports;
}();
xtemplate424CompilerParser = function (exports) {
  var parser = function (undefined) {
    var parser = {};
    var GrammarConst = {
      'SHIFT_TYPE': 1,
      'REDUCE_TYPE': 2,
      'ACCEPT_TYPE': 0,
      'TYPE_INDEX': 0,
      'PRODUCTION_INDEX': 1,
      'TO_INDEX': 2
    };
    function peekStack(stack, n) {
      n = n || 1;
      return stack[stack.length - n];
    }
    function mix(to, from) {
      for (var f in from) {
        to[f] = from[f];
      }
    }
    function isArray(obj) {
      return '[object Array]' === Object.prototype.toString.call(obj);
    }
    function each(object, fn, context) {
      if (object) {
        var key, val, length, i = 0;
        context = context || null;
        if (!isArray(object)) {
          for (key in object) {
            if (fn.call(context, object[key], key, object) === false) {
              break;
            }
          }
        } else {
          length = object.length;
          for (val = object[0]; i < length; val = object[++i]) {
            if (fn.call(context, val, i, object) === false) {
              break;
            }
          }
        }
      }
    }
    function inArray(item, arr) {
      for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] === item) {
          return true;
        }
      }
      return false;
    }
    var Lexer = function Lexer(cfg) {
      var self = this;
      self.rules = [];
      mix(self, cfg);
      self.resetInput(self.input, self.filename);
    };
    Lexer.prototype = {
      'resetInput': function (input, filename) {
        mix(this, {
          input: input,
          filename: filename,
          matched: '',
          stateStack: [Lexer.STATIC.INITIAL],
          match: '',
          text: '',
          firstLine: 1,
          lineNumber: 1,
          lastLine: 1,
          firstColumn: 1,
          lastColumn: 1
        });
      },
      'getCurrentRules': function () {
        var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
        if (self.mapState) {
          currentState = self.mapState(currentState);
        }
        each(self.rules, function (r) {
          var state = r.state || r[3];
          if (!state) {
            if (currentState === Lexer.STATIC.INITIAL) {
              rules.push(r);
            }
          } else if (inArray(currentState, state)) {
            rules.push(r);
          }
        });
        return rules;
      },
      'pushState': function (state) {
        this.stateStack.push(state);
      },
      'popState': function (num) {
        num = num || 1;
        var ret;
        while (num--) {
          ret = this.stateStack.pop();
        }
        return ret;
      },
      'showDebugInfo': function () {
        var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
        matched = matched.slice(0, matched.length - match.length);
        var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/g, ' '), next = match + input;
        next = next.slice(0, DEBUG_CONTEXT_LIMIT).replace(/\n/g, ' ') + (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
        return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
      },
      'mapSymbol': function mapSymbolForCodeGen(t) {
        return this.symbolMap[t];
      },
      'mapReverseSymbol': function (rs) {
        var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
        if (!reverseSymbolMap && symbolMap) {
          reverseSymbolMap = self.reverseSymbolMap = {};
          for (i in symbolMap) {
            reverseSymbolMap[symbolMap[i]] = i;
          }
        }
        if (reverseSymbolMap) {
          return reverseSymbolMap[rs];
        } else {
          return rs;
        }
      },
      'lex': function () {
        var self = this;
        var input = self.input;
        var rules = self.getCurrentRules();
        var i, rule, m, ret, lines;
        self.match = self.text = '';
        if (!input) {
          return self.mapSymbol(Lexer.STATIC.END_TAG);
        }
        for (i = 0; i < rules.length; i++) {
          rule = rules[i];
          var regexp = rule.regexp || rule[1];
          var token = rule.token || rule[0];
          var action = rule.action || rule[2] || undefined;
          if (m = input.match(regexp)) {
            lines = m[0].match(/\n.*/g);
            if (lines) {
              self.lineNumber += lines.length;
            }
            mix(self, {
              firstLine: self.lastLine,
              lastLine: self.lineNumber,
              firstColumn: self.lastColumn,
              lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
            });
            var match;
            match = self.match = m[0];
            self.matches = m;
            self.text = match;
            self.matched += match;
            ret = action && action.call(self);
            if (ret === undefined) {
              ret = token;
            } else {
              ret = self.mapSymbol(ret);
            }
            input = input.slice(match.length);
            self.input = input;
            if (ret) {
              return ret;
            } else {
              return self.lex();
            }
          }
        }
      }
    };
    Lexer.STATIC = {
      'INITIAL': 'I',
      'DEBUG_CONTEXT_LIMIT': 20,
      'END_TAG': '$EOF'
    };
    var lexer = new Lexer({
      'rules': [
        [
          0,
          /^[\s\S]*?(?={{)/,
          function () {
            var self = this, text = self.text, m, n = 0;
            if (m = text.match(/\\+$/)) {
              n = m[0].length;
            }
            if (n % 2) {
              self.pushState('et');
              text = text.slice(0, -1);
            } else {
              self.pushState('t');
            }
            if (n) {
              text = text.replace(/\\+$/g, function (m) {
                return new Array(m.length / 2 + 1).join('\\');
              });
            }
            self.text = text;
            return 'CONTENT';
          }
        ],
        [
          'b',
          /^[\s\S]+/,
          0
        ],
        [
          'b',
          /^[\s\S]{2,}?(?:(?={{)|$)/,
          function popState() {
            this.popState();
          },
          ['et']
        ],
        [
          'c',
          /^{{\{?(?:#|@)/,
          function () {
            var self = this, text = self.text;
            if (text.length === 4) {
              self.pushState('p');
            } else {
              self.pushState('e');
            }
          },
          ['t']
        ],
        [
          'd',
          /^{{\{?\//,
          function () {
            var self = this, text = self.text;
            if (text.length === 4) {
              self.pushState('p');
            } else {
              self.pushState('e');
            }
          },
          ['t']
        ],
        [
          'e',
          /^{{\s*else\s*}}/,
          function popState() {
            this.popState();
          },
          ['t']
        ],
        [
          0,
          /^{{![\s\S]*?}}/,
          function popState() {
            this.popState();
          },
          ['t']
        ],
        [
          'b',
          /^{{%([\s\S]*?)%}}/,
          function () {
            this.text = this.matches[1] || '';
            this.popState();
          },
          ['t']
        ],
        [
          'f',
          /^{{\{?/,
          function () {
            var self = this, text = self.text;
            if (text.length === 3) {
              self.pushState('p');
            } else {
              self.pushState('e');
            }
          },
          ['t']
        ],
        [
          0,
          /^\s+/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'g',
          /^,/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'h',
          /^}}}/,
          function () {
            this.popState(2);
          },
          ['p']
        ],
        [
          'h',
          /^}}/,
          function () {
            this.popState(2);
          },
          ['e']
        ],
        [
          'i',
          /^\(/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'j',
          /^\)/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'k',
          /^\|\|/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'l',
          /^&&/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'm',
          /^===/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'n',
          /^!==/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'o',
          /^>=/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'p',
          /^<=/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'q',
          /^>/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'r',
          /^</,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          's',
          /^\+/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          't',
          /^-/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'u',
          /^\*/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'v',
          /^\//,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'w',
          /^%/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'x',
          /^!/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'y',
          /^"(\\[\s\S]|[^\\"\n])*"/,
          function () {
            this.text = this.text.slice(1, -1).replace(/\\"/g, '"');
          },
          [
            'p',
            'e'
          ]
        ],
        [
          'y',
          /^'(\\[\s\S]|[^\\'\n])*'/,
          function () {
            this.text = this.text.slice(1, -1).replace(/\\'/g, '\'');
          },
          [
            'p',
            'e'
          ]
        ],
        [
          'z',
          /^\d+(?:\.\d+)?(?:e-?\d+)?/i,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'aa',
          /^=/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ab',
          /^\.\./,
          function () {
            this.pushState('ws');
          },
          [
            'p',
            'e'
          ]
        ],
        [
          'ac',
          /^\//,
          function popState() {
            this.popState();
          },
          ['ws']
        ],
        [
          'ac',
          /^\./,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ad',
          /^\[/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ae',
          /^\]/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'af',
          /^\{/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ag',
          /^\:/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ah',
          /^\}/,
          0,
          [
            'p',
            'e'
          ]
        ],
        [
          'ab',
          /^[a-zA-Z_$][a-zA-Z0-9_$]*/,
          0,
          [
            'p',
            'e'
          ]
        ]
      ]
    });
    parser.lexer = lexer;
    lexer.symbolMap = {
      '$EOF': 'a',
      'CONTENT': 'b',
      'OPEN_BLOCK': 'c',
      'OPEN_CLOSE_BLOCK': 'd',
      'INVERSE': 'e',
      'OPEN_TPL': 'f',
      'COMMA': 'g',
      'CLOSE': 'h',
      'L_PAREN': 'i',
      'R_PAREN': 'j',
      'OR': 'k',
      'AND': 'l',
      'LOGIC_EQUALS': 'm',
      'LOGIC_NOT_EQUALS': 'n',
      'GE': 'o',
      'LE': 'p',
      'GT': 'q',
      'LT': 'r',
      'PLUS': 's',
      'MINUS': 't',
      'MULTIPLY': 'u',
      'DIVIDE': 'v',
      'MODULUS': 'w',
      'NOT': 'x',
      'STRING': 'y',
      'NUMBER': 'z',
      'EQUALS': 'aa',
      'ID': 'ab',
      'SEP': 'ac',
      'L_BRACKET': 'ad',
      'R_BRACKET': 'ae',
      'L_BRACE': 'af',
      'COLON': 'ag',
      'R_BRACE': 'ah',
      '$START': 'ai',
      'program': 'aj',
      'statements': 'ak',
      'statement': 'al',
      'function': 'am',
      'id': 'an',
      'expression': 'ao',
      'params': 'ap',
      'hash': 'aq',
      'param': 'ar',
      'conditionalOrExpression': 'as',
      'listExpression': 'at',
      'objectExpression': 'au',
      'objectPart': 'av',
      'conditionalAndExpression': 'aw',
      'equalityExpression': 'ax',
      'relationalExpression': 'ay',
      'additiveExpression': 'az',
      'multiplicativeExpression': 'ba',
      'unaryExpression': 'bb',
      'primaryExpression': 'bc',
      'hashSegment': 'bd',
      'idSegments': 'be'
    };
    parser.productions = [
      [
        'ai',
        ['aj']
      ],
      [
        'aj',
        [
          'ak',
          'e',
          'ak'
        ],
        function () {
          return new this.yy.ProgramNode({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, this.$3);
        }
      ],
      [
        'aj',
        ['ak'],
        function () {
          return new this.yy.ProgramNode({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'ak',
        ['al'],
        function () {
          return [this.$1];
        }
      ],
      [
        'ak',
        [
          'ak',
          'al'
        ],
        function () {
          this.$1.push(this.$2);
        }
      ],
      [
        'al',
        [
          'c',
          'am',
          'h',
          'aj',
          'd',
          'an',
          'h'
        ],
        function () {
          return new this.yy.BlockStatement({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$2, this.$4, this.$6, this.$1.length !== 4);
        }
      ],
      [
        'al',
        [
          'f',
          'ao',
          'h'
        ],
        function () {
          return new this.yy.ExpressionStatement({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$2, this.$1.length !== 3);
        }
      ],
      [
        'al',
        ['b'],
        function () {
          return new this.yy.ContentStatement({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'ap',
          'g',
          'aq',
          'j'
        ],
        function () {
          return new this.yy.Function({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, this.$3, this.$5);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'ap',
          'j'
        ],
        function () {
          return new this.yy.Function({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, this.$3);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'aq',
          'j'
        ],
        function () {
          return new this.yy.Function({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1, null, this.$3);
        }
      ],
      [
        'am',
        [
          'an',
          'i',
          'j'
        ],
        function () {
          return new this.yy.Function({
            filename: this.lexer.filename,
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'ap',
        [
          'ap',
          'g',
          'ar'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'ap',
        ['ar'],
        function () {
          return [this.$1];
        }
      ],
      [
        'ar',
        ['ao']
      ],
      [
        'ao',
        ['as']
      ],
      [
        'ao',
        [
          'ad',
          'at',
          'ae'
        ],
        function () {
          return new this.yy.ArrayExpression(this.$2);
        }
      ],
      [
        'ao',
        [
          'ad',
          'ae'
        ],
        function () {
          return new this.yy.ArrayExpression([]);
        }
      ],
      [
        'ao',
        [
          'af',
          'au',
          'ah'
        ],
        function () {
          return new this.yy.ObjectExpression(this.$2);
        }
      ],
      [
        'ao',
        [
          'af',
          'ah'
        ],
        function () {
          return new this.yy.ObjectExpression([]);
        }
      ],
      [
        'av',
        [
          'y',
          'ag',
          'ao'
        ],
        function () {
          return [
            this.$1,
            this.$3
          ];
        }
      ],
      [
        'av',
        [
          'ab',
          'ag',
          'ao'
        ],
        function () {
          return [
            this.$1,
            this.$3
          ];
        }
      ],
      [
        'au',
        ['av'],
        function () {
          return [this.$1];
        }
      ],
      [
        'au',
        [
          'au',
          'g',
          'av'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'at',
        ['ao'],
        function () {
          return [this.$1];
        }
      ],
      [
        'at',
        [
          'at',
          'g',
          'ao'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'as',
        ['aw']
      ],
      [
        'as',
        [
          'as',
          'k',
          'aw'
        ],
        function () {
          return new this.yy.ConditionalOrExpression(this.$1, this.$3);
        }
      ],
      [
        'aw',
        ['ax']
      ],
      [
        'aw',
        [
          'aw',
          'l',
          'ax'
        ],
        function () {
          return new this.yy.ConditionalAndExpression(this.$1, this.$3);
        }
      ],
      [
        'ax',
        ['ay']
      ],
      [
        'ax',
        [
          'ax',
          'm',
          'ay'
        ],
        function () {
          return new this.yy.EqualityExpression(this.$1, '===', this.$3);
        }
      ],
      [
        'ax',
        [
          'ax',
          'n',
          'ay'
        ],
        function () {
          return new this.yy.EqualityExpression(this.$1, '!==', this.$3);
        }
      ],
      [
        'ay',
        ['az']
      ],
      [
        'ay',
        [
          'ay',
          'r',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '<', this.$3);
        }
      ],
      [
        'ay',
        [
          'ay',
          'q',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '>', this.$3);
        }
      ],
      [
        'ay',
        [
          'ay',
          'p',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '<=', this.$3);
        }
      ],
      [
        'ay',
        [
          'ay',
          'o',
          'az'
        ],
        function () {
          return new this.yy.RelationalExpression(this.$1, '>=', this.$3);
        }
      ],
      [
        'az',
        ['ba']
      ],
      [
        'az',
        [
          'az',
          's',
          'ba'
        ],
        function () {
          return new this.yy.AdditiveExpression(this.$1, '+', this.$3);
        }
      ],
      [
        'az',
        [
          'az',
          't',
          'ba'
        ],
        function () {
          return new this.yy.AdditiveExpression(this.$1, '-', this.$3);
        }
      ],
      [
        'ba',
        ['bb']
      ],
      [
        'ba',
        [
          'ba',
          'u',
          'bb'
        ],
        function () {
          return new this.yy.MultiplicativeExpression(this.$1, '*', this.$3);
        }
      ],
      [
        'ba',
        [
          'ba',
          'v',
          'bb'
        ],
        function () {
          return new this.yy.MultiplicativeExpression(this.$1, '/', this.$3);
        }
      ],
      [
        'ba',
        [
          'ba',
          'w',
          'bb'
        ],
        function () {
          return new this.yy.MultiplicativeExpression(this.$1, '%', this.$3);
        }
      ],
      [
        'bb',
        [
          'x',
          'bb'
        ],
        function () {
          return new this.yy.UnaryExpression(this.$1, this.$2);
        }
      ],
      [
        'bb',
        [
          't',
          'bb'
        ],
        function () {
          return new this.yy.UnaryExpression(this.$1, this.$2);
        }
      ],
      [
        'bb',
        ['bc']
      ],
      [
        'bc',
        ['y'],
        function () {
          return new this.yy.String({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'bc',
        ['z'],
        function () {
          return new this.yy.Number({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'bc',
        ['an']
      ],
      [
        'bc',
        [
          'i',
          'ao',
          'j'
        ],
        function () {
          return this.$2;
        }
      ],
      [
        'aq',
        [
          'aq',
          'g',
          'bd'
        ],
        function () {
          this.$1.value.push(this.$3);
        }
      ],
      [
        'aq',
        ['bd'],
        function () {
          return new this.yy.Hash({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, [this.$1]);
        }
      ],
      [
        'bd',
        [
          'an',
          'aa',
          'ao'
        ],
        function () {
          return [
            this.$1,
            this.$3
          ];
        }
      ],
      [
        'an',
        ['be'],
        function () {
          return new this.yy.Id({
            line: this.lexer.firstLine,
            col: this.lexer.firstColumn
          }, this.$1);
        }
      ],
      [
        'be',
        ['am'],
        function () {
          return [this.$1];
        }
      ],
      [
        'be',
        [
          'be',
          'ac',
          'ab'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'be',
        [
          'be',
          'ad',
          'ao',
          'ae'
        ],
        function () {
          this.$1.push(this.$3);
        }
      ],
      [
        'be',
        ['ab'],
        function () {
          return [this.$1];
        }
      ]
    ];
    parser.table = {
      'gotos': {
        '0': {
          'aj': 4,
          'ak': 5,
          'al': 6
        },
        '2': {
          'am': 8,
          'an': 9,
          'be': 10
        },
        '3': {
          'am': 18,
          'an': 19,
          'ao': 20,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '5': { 'al': 30 },
        '11': {
          'am': 18,
          'an': 19,
          'ao': 35,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '12': {
          'am': 18,
          'an': 19,
          'bb': 36,
          'bc': 28,
          'be': 10
        },
        '13': {
          'am': 18,
          'an': 19,
          'bb': 37,
          'bc': 28,
          'be': 10
        },
        '16': {
          'am': 18,
          'an': 19,
          'ao': 39,
          'as': 21,
          'at': 40,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '17': {
          'au': 44,
          'av': 45
        },
        '29': {
          'ak': 60,
          'al': 6
        },
        '31': {
          'aj': 61,
          'ak': 5,
          'al': 6
        },
        '32': {
          'am': 18,
          'an': 63,
          'ao': 64,
          'ap': 65,
          'aq': 66,
          'ar': 67,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'bd': 68,
          'be': 10
        },
        '34': {
          'am': 18,
          'an': 19,
          'ao': 70,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '47': {
          'am': 18,
          'an': 19,
          'aw': 78,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '48': {
          'am': 18,
          'an': 19,
          'ax': 79,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '49': {
          'am': 18,
          'an': 19,
          'ay': 80,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '50': {
          'am': 18,
          'an': 19,
          'ay': 81,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '51': {
          'am': 18,
          'an': 19,
          'az': 82,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '52': {
          'am': 18,
          'an': 19,
          'az': 83,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '53': {
          'am': 18,
          'an': 19,
          'az': 84,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '54': {
          'am': 18,
          'an': 19,
          'az': 85,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '55': {
          'am': 18,
          'an': 19,
          'ba': 86,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '56': {
          'am': 18,
          'an': 19,
          'ba': 87,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '57': {
          'am': 18,
          'an': 19,
          'bb': 88,
          'bc': 28,
          'be': 10
        },
        '58': {
          'am': 18,
          'an': 19,
          'bb': 89,
          'bc': 28,
          'be': 10
        },
        '59': {
          'am': 18,
          'an': 19,
          'bb': 90,
          'bc': 28,
          'be': 10
        },
        '60': { 'al': 30 },
        '72': {
          'am': 18,
          'an': 19,
          'ao': 98,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '74': {
          'am': 18,
          'an': 19,
          'ao': 99,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '75': {
          'am': 18,
          'an': 19,
          'ao': 100,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '76': { 'av': 101 },
        '91': {
          'am': 18,
          'an': 102,
          'be': 10
        },
        '92': {
          'am': 18,
          'an': 19,
          'ao': 103,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'be': 10
        },
        '93': {
          'am': 18,
          'an': 63,
          'ao': 64,
          'aq': 104,
          'ar': 105,
          'as': 21,
          'aw': 22,
          'ax': 23,
          'ay': 24,
          'az': 25,
          'ba': 26,
          'bb': 27,
          'bc': 28,
          'bd': 68,
          'be': 10
        },
        '95': {
          'am': 18,
          'an': 106,
          'bd': 107,
          'be': 10
        }
      },
      'action': {
        '0': {
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '1': {
          'a': [
            2,
            7
          ],
          'e': [
            2,
            7
          ],
          'c': [
            2,
            7
          ],
          'f': [
            2,
            7
          ],
          'b': [
            2,
            7
          ],
          'd': [
            2,
            7
          ]
        },
        '2': {
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '3': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '4': { 'a': [0] },
        '5': {
          'a': [
            2,
            2
          ],
          'd': [
            2,
            2
          ],
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'e': [
            1,
            undefined,
            29
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '6': {
          'a': [
            2,
            3
          ],
          'e': [
            2,
            3
          ],
          'c': [
            2,
            3
          ],
          'f': [
            2,
            3
          ],
          'b': [
            2,
            3
          ],
          'd': [
            2,
            3
          ]
        },
        '7': {
          'i': [
            2,
            59
          ],
          'ac': [
            2,
            59
          ],
          'ad': [
            2,
            59
          ],
          'h': [
            2,
            59
          ],
          'k': [
            2,
            59
          ],
          'l': [
            2,
            59
          ],
          'm': [
            2,
            59
          ],
          'n': [
            2,
            59
          ],
          'o': [
            2,
            59
          ],
          'p': [
            2,
            59
          ],
          'q': [
            2,
            59
          ],
          'r': [
            2,
            59
          ],
          's': [
            2,
            59
          ],
          't': [
            2,
            59
          ],
          'u': [
            2,
            59
          ],
          'v': [
            2,
            59
          ],
          'w': [
            2,
            59
          ],
          'j': [
            2,
            59
          ],
          'ae': [
            2,
            59
          ],
          'g': [
            2,
            59
          ],
          'aa': [
            2,
            59
          ],
          'ah': [
            2,
            59
          ]
        },
        '8': {
          'i': [
            2,
            56
          ],
          'ac': [
            2,
            56
          ],
          'ad': [
            2,
            56
          ],
          'h': [
            1,
            undefined,
            31
          ]
        },
        '9': {
          'i': [
            1,
            undefined,
            32
          ]
        },
        '10': {
          'i': [
            2,
            55
          ],
          'h': [
            2,
            55
          ],
          'k': [
            2,
            55
          ],
          'l': [
            2,
            55
          ],
          'm': [
            2,
            55
          ],
          'n': [
            2,
            55
          ],
          'o': [
            2,
            55
          ],
          'p': [
            2,
            55
          ],
          'q': [
            2,
            55
          ],
          'r': [
            2,
            55
          ],
          's': [
            2,
            55
          ],
          't': [
            2,
            55
          ],
          'u': [
            2,
            55
          ],
          'v': [
            2,
            55
          ],
          'w': [
            2,
            55
          ],
          'j': [
            2,
            55
          ],
          'ae': [
            2,
            55
          ],
          'g': [
            2,
            55
          ],
          'aa': [
            2,
            55
          ],
          'ah': [
            2,
            55
          ],
          'ac': [
            1,
            undefined,
            33
          ],
          'ad': [
            1,
            undefined,
            34
          ]
        },
        '11': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '12': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '13': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '14': {
          'h': [
            2,
            48
          ],
          'k': [
            2,
            48
          ],
          'l': [
            2,
            48
          ],
          'm': [
            2,
            48
          ],
          'n': [
            2,
            48
          ],
          'o': [
            2,
            48
          ],
          'p': [
            2,
            48
          ],
          'q': [
            2,
            48
          ],
          'r': [
            2,
            48
          ],
          's': [
            2,
            48
          ],
          't': [
            2,
            48
          ],
          'u': [
            2,
            48
          ],
          'v': [
            2,
            48
          ],
          'w': [
            2,
            48
          ],
          'j': [
            2,
            48
          ],
          'ae': [
            2,
            48
          ],
          'g': [
            2,
            48
          ],
          'ah': [
            2,
            48
          ]
        },
        '15': {
          'h': [
            2,
            49
          ],
          'k': [
            2,
            49
          ],
          'l': [
            2,
            49
          ],
          'm': [
            2,
            49
          ],
          'n': [
            2,
            49
          ],
          'o': [
            2,
            49
          ],
          'p': [
            2,
            49
          ],
          'q': [
            2,
            49
          ],
          'r': [
            2,
            49
          ],
          's': [
            2,
            49
          ],
          't': [
            2,
            49
          ],
          'u': [
            2,
            49
          ],
          'v': [
            2,
            49
          ],
          'w': [
            2,
            49
          ],
          'j': [
            2,
            49
          ],
          'ae': [
            2,
            49
          ],
          'g': [
            2,
            49
          ],
          'ah': [
            2,
            49
          ]
        },
        '16': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'ae': [
            1,
            undefined,
            38
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '17': {
          'y': [
            1,
            undefined,
            41
          ],
          'ab': [
            1,
            undefined,
            42
          ],
          'ah': [
            1,
            undefined,
            43
          ]
        },
        '18': {
          'h': [
            2,
            56
          ],
          'k': [
            2,
            56
          ],
          'i': [
            2,
            56
          ],
          'l': [
            2,
            56
          ],
          'm': [
            2,
            56
          ],
          'n': [
            2,
            56
          ],
          'o': [
            2,
            56
          ],
          'p': [
            2,
            56
          ],
          'q': [
            2,
            56
          ],
          'r': [
            2,
            56
          ],
          's': [
            2,
            56
          ],
          't': [
            2,
            56
          ],
          'u': [
            2,
            56
          ],
          'v': [
            2,
            56
          ],
          'w': [
            2,
            56
          ],
          'ac': [
            2,
            56
          ],
          'ad': [
            2,
            56
          ],
          'j': [
            2,
            56
          ],
          'ae': [
            2,
            56
          ],
          'g': [
            2,
            56
          ],
          'aa': [
            2,
            56
          ],
          'ah': [
            2,
            56
          ]
        },
        '19': {
          'h': [
            2,
            50
          ],
          'k': [
            2,
            50
          ],
          'l': [
            2,
            50
          ],
          'm': [
            2,
            50
          ],
          'n': [
            2,
            50
          ],
          'o': [
            2,
            50
          ],
          'p': [
            2,
            50
          ],
          'q': [
            2,
            50
          ],
          'r': [
            2,
            50
          ],
          's': [
            2,
            50
          ],
          't': [
            2,
            50
          ],
          'u': [
            2,
            50
          ],
          'v': [
            2,
            50
          ],
          'w': [
            2,
            50
          ],
          'j': [
            2,
            50
          ],
          'ae': [
            2,
            50
          ],
          'g': [
            2,
            50
          ],
          'ah': [
            2,
            50
          ],
          'i': [
            1,
            undefined,
            32
          ]
        },
        '20': {
          'h': [
            1,
            undefined,
            46
          ]
        },
        '21': {
          'h': [
            2,
            15
          ],
          'j': [
            2,
            15
          ],
          'ae': [
            2,
            15
          ],
          'g': [
            2,
            15
          ],
          'ah': [
            2,
            15
          ],
          'k': [
            1,
            undefined,
            47
          ]
        },
        '22': {
          'h': [
            2,
            26
          ],
          'k': [
            2,
            26
          ],
          'j': [
            2,
            26
          ],
          'ae': [
            2,
            26
          ],
          'g': [
            2,
            26
          ],
          'ah': [
            2,
            26
          ],
          'l': [
            1,
            undefined,
            48
          ]
        },
        '23': {
          'h': [
            2,
            28
          ],
          'k': [
            2,
            28
          ],
          'l': [
            2,
            28
          ],
          'j': [
            2,
            28
          ],
          'ae': [
            2,
            28
          ],
          'g': [
            2,
            28
          ],
          'ah': [
            2,
            28
          ],
          'm': [
            1,
            undefined,
            49
          ],
          'n': [
            1,
            undefined,
            50
          ]
        },
        '24': {
          'h': [
            2,
            30
          ],
          'k': [
            2,
            30
          ],
          'l': [
            2,
            30
          ],
          'm': [
            2,
            30
          ],
          'n': [
            2,
            30
          ],
          'j': [
            2,
            30
          ],
          'ae': [
            2,
            30
          ],
          'g': [
            2,
            30
          ],
          'ah': [
            2,
            30
          ],
          'o': [
            1,
            undefined,
            51
          ],
          'p': [
            1,
            undefined,
            52
          ],
          'q': [
            1,
            undefined,
            53
          ],
          'r': [
            1,
            undefined,
            54
          ]
        },
        '25': {
          'h': [
            2,
            33
          ],
          'k': [
            2,
            33
          ],
          'l': [
            2,
            33
          ],
          'm': [
            2,
            33
          ],
          'n': [
            2,
            33
          ],
          'o': [
            2,
            33
          ],
          'p': [
            2,
            33
          ],
          'q': [
            2,
            33
          ],
          'r': [
            2,
            33
          ],
          'j': [
            2,
            33
          ],
          'ae': [
            2,
            33
          ],
          'g': [
            2,
            33
          ],
          'ah': [
            2,
            33
          ],
          's': [
            1,
            undefined,
            55
          ],
          't': [
            1,
            undefined,
            56
          ]
        },
        '26': {
          'h': [
            2,
            38
          ],
          'k': [
            2,
            38
          ],
          'l': [
            2,
            38
          ],
          'm': [
            2,
            38
          ],
          'n': [
            2,
            38
          ],
          'o': [
            2,
            38
          ],
          'p': [
            2,
            38
          ],
          'q': [
            2,
            38
          ],
          'r': [
            2,
            38
          ],
          's': [
            2,
            38
          ],
          't': [
            2,
            38
          ],
          'j': [
            2,
            38
          ],
          'ae': [
            2,
            38
          ],
          'g': [
            2,
            38
          ],
          'ah': [
            2,
            38
          ],
          'u': [
            1,
            undefined,
            57
          ],
          'v': [
            1,
            undefined,
            58
          ],
          'w': [
            1,
            undefined,
            59
          ]
        },
        '27': {
          'h': [
            2,
            41
          ],
          'k': [
            2,
            41
          ],
          'l': [
            2,
            41
          ],
          'm': [
            2,
            41
          ],
          'n': [
            2,
            41
          ],
          'o': [
            2,
            41
          ],
          'p': [
            2,
            41
          ],
          'q': [
            2,
            41
          ],
          'r': [
            2,
            41
          ],
          's': [
            2,
            41
          ],
          't': [
            2,
            41
          ],
          'u': [
            2,
            41
          ],
          'v': [
            2,
            41
          ],
          'w': [
            2,
            41
          ],
          'j': [
            2,
            41
          ],
          'ae': [
            2,
            41
          ],
          'g': [
            2,
            41
          ],
          'ah': [
            2,
            41
          ]
        },
        '28': {
          'h': [
            2,
            47
          ],
          'k': [
            2,
            47
          ],
          'l': [
            2,
            47
          ],
          'm': [
            2,
            47
          ],
          'n': [
            2,
            47
          ],
          'o': [
            2,
            47
          ],
          'p': [
            2,
            47
          ],
          'q': [
            2,
            47
          ],
          'r': [
            2,
            47
          ],
          's': [
            2,
            47
          ],
          't': [
            2,
            47
          ],
          'u': [
            2,
            47
          ],
          'v': [
            2,
            47
          ],
          'w': [
            2,
            47
          ],
          'j': [
            2,
            47
          ],
          'ae': [
            2,
            47
          ],
          'g': [
            2,
            47
          ],
          'ah': [
            2,
            47
          ]
        },
        '29': {
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '30': {
          'a': [
            2,
            4
          ],
          'e': [
            2,
            4
          ],
          'c': [
            2,
            4
          ],
          'f': [
            2,
            4
          ],
          'b': [
            2,
            4
          ],
          'd': [
            2,
            4
          ]
        },
        '31': {
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '32': {
          'i': [
            1,
            undefined,
            11
          ],
          'j': [
            1,
            undefined,
            62
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '33': {
          'ab': [
            1,
            undefined,
            69
          ]
        },
        '34': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '35': {
          'j': [
            1,
            undefined,
            71
          ]
        },
        '36': {
          'h': [
            2,
            46
          ],
          'k': [
            2,
            46
          ],
          'l': [
            2,
            46
          ],
          'm': [
            2,
            46
          ],
          'n': [
            2,
            46
          ],
          'o': [
            2,
            46
          ],
          'p': [
            2,
            46
          ],
          'q': [
            2,
            46
          ],
          'r': [
            2,
            46
          ],
          's': [
            2,
            46
          ],
          't': [
            2,
            46
          ],
          'u': [
            2,
            46
          ],
          'v': [
            2,
            46
          ],
          'w': [
            2,
            46
          ],
          'j': [
            2,
            46
          ],
          'ae': [
            2,
            46
          ],
          'g': [
            2,
            46
          ],
          'ah': [
            2,
            46
          ]
        },
        '37': {
          'h': [
            2,
            45
          ],
          'k': [
            2,
            45
          ],
          'l': [
            2,
            45
          ],
          'm': [
            2,
            45
          ],
          'n': [
            2,
            45
          ],
          'o': [
            2,
            45
          ],
          'p': [
            2,
            45
          ],
          'q': [
            2,
            45
          ],
          'r': [
            2,
            45
          ],
          's': [
            2,
            45
          ],
          't': [
            2,
            45
          ],
          'u': [
            2,
            45
          ],
          'v': [
            2,
            45
          ],
          'w': [
            2,
            45
          ],
          'j': [
            2,
            45
          ],
          'ae': [
            2,
            45
          ],
          'g': [
            2,
            45
          ],
          'ah': [
            2,
            45
          ]
        },
        '38': {
          'h': [
            2,
            17
          ],
          'j': [
            2,
            17
          ],
          'ae': [
            2,
            17
          ],
          'g': [
            2,
            17
          ],
          'ah': [
            2,
            17
          ]
        },
        '39': {
          'ae': [
            2,
            24
          ],
          'g': [
            2,
            24
          ]
        },
        '40': {
          'g': [
            1,
            undefined,
            72
          ],
          'ae': [
            1,
            undefined,
            73
          ]
        },
        '41': {
          'ag': [
            1,
            undefined,
            74
          ]
        },
        '42': {
          'ag': [
            1,
            undefined,
            75
          ]
        },
        '43': {
          'h': [
            2,
            19
          ],
          'j': [
            2,
            19
          ],
          'ae': [
            2,
            19
          ],
          'g': [
            2,
            19
          ],
          'ah': [
            2,
            19
          ]
        },
        '44': {
          'g': [
            1,
            undefined,
            76
          ],
          'ah': [
            1,
            undefined,
            77
          ]
        },
        '45': {
          'ah': [
            2,
            22
          ],
          'g': [
            2,
            22
          ]
        },
        '46': {
          'a': [
            2,
            6
          ],
          'e': [
            2,
            6
          ],
          'c': [
            2,
            6
          ],
          'f': [
            2,
            6
          ],
          'b': [
            2,
            6
          ],
          'd': [
            2,
            6
          ]
        },
        '47': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '48': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '49': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '50': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '51': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '52': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '53': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '54': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '55': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '56': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '57': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '58': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '59': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '60': {
          'a': [
            2,
            1
          ],
          'd': [
            2,
            1
          ],
          'b': [
            1,
            undefined,
            1
          ],
          'c': [
            1,
            undefined,
            2
          ],
          'f': [
            1,
            undefined,
            3
          ]
        },
        '61': {
          'd': [
            1,
            undefined,
            91
          ]
        },
        '62': {
          'h': [
            2,
            11
          ],
          'i': [
            2,
            11
          ],
          'ac': [
            2,
            11
          ],
          'ad': [
            2,
            11
          ],
          'k': [
            2,
            11
          ],
          'l': [
            2,
            11
          ],
          'm': [
            2,
            11
          ],
          'n': [
            2,
            11
          ],
          'o': [
            2,
            11
          ],
          'p': [
            2,
            11
          ],
          'q': [
            2,
            11
          ],
          'r': [
            2,
            11
          ],
          's': [
            2,
            11
          ],
          't': [
            2,
            11
          ],
          'u': [
            2,
            11
          ],
          'v': [
            2,
            11
          ],
          'w': [
            2,
            11
          ],
          'j': [
            2,
            11
          ],
          'ae': [
            2,
            11
          ],
          'g': [
            2,
            11
          ],
          'aa': [
            2,
            11
          ],
          'ah': [
            2,
            11
          ]
        },
        '63': {
          'g': [
            2,
            50
          ],
          'j': [
            2,
            50
          ],
          'k': [
            2,
            50
          ],
          'l': [
            2,
            50
          ],
          'm': [
            2,
            50
          ],
          'n': [
            2,
            50
          ],
          'o': [
            2,
            50
          ],
          'p': [
            2,
            50
          ],
          'q': [
            2,
            50
          ],
          'r': [
            2,
            50
          ],
          's': [
            2,
            50
          ],
          't': [
            2,
            50
          ],
          'u': [
            2,
            50
          ],
          'v': [
            2,
            50
          ],
          'w': [
            2,
            50
          ],
          'i': [
            1,
            undefined,
            32
          ],
          'aa': [
            1,
            undefined,
            92
          ]
        },
        '64': {
          'g': [
            2,
            14
          ],
          'j': [
            2,
            14
          ]
        },
        '65': {
          'g': [
            1,
            undefined,
            93
          ],
          'j': [
            1,
            undefined,
            94
          ]
        },
        '66': {
          'g': [
            1,
            undefined,
            95
          ],
          'j': [
            1,
            undefined,
            96
          ]
        },
        '67': {
          'g': [
            2,
            13
          ],
          'j': [
            2,
            13
          ]
        },
        '68': {
          'j': [
            2,
            53
          ],
          'g': [
            2,
            53
          ]
        },
        '69': {
          'i': [
            2,
            57
          ],
          'ac': [
            2,
            57
          ],
          'ad': [
            2,
            57
          ],
          'h': [
            2,
            57
          ],
          'k': [
            2,
            57
          ],
          'l': [
            2,
            57
          ],
          'm': [
            2,
            57
          ],
          'n': [
            2,
            57
          ],
          'o': [
            2,
            57
          ],
          'p': [
            2,
            57
          ],
          'q': [
            2,
            57
          ],
          'r': [
            2,
            57
          ],
          's': [
            2,
            57
          ],
          't': [
            2,
            57
          ],
          'u': [
            2,
            57
          ],
          'v': [
            2,
            57
          ],
          'w': [
            2,
            57
          ],
          'j': [
            2,
            57
          ],
          'ae': [
            2,
            57
          ],
          'g': [
            2,
            57
          ],
          'aa': [
            2,
            57
          ],
          'ah': [
            2,
            57
          ]
        },
        '70': {
          'ae': [
            1,
            undefined,
            97
          ]
        },
        '71': {
          'h': [
            2,
            51
          ],
          'k': [
            2,
            51
          ],
          'l': [
            2,
            51
          ],
          'm': [
            2,
            51
          ],
          'n': [
            2,
            51
          ],
          'o': [
            2,
            51
          ],
          'p': [
            2,
            51
          ],
          'q': [
            2,
            51
          ],
          'r': [
            2,
            51
          ],
          's': [
            2,
            51
          ],
          't': [
            2,
            51
          ],
          'u': [
            2,
            51
          ],
          'v': [
            2,
            51
          ],
          'w': [
            2,
            51
          ],
          'j': [
            2,
            51
          ],
          'ae': [
            2,
            51
          ],
          'g': [
            2,
            51
          ],
          'ah': [
            2,
            51
          ]
        },
        '72': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '73': {
          'h': [
            2,
            16
          ],
          'j': [
            2,
            16
          ],
          'ae': [
            2,
            16
          ],
          'g': [
            2,
            16
          ],
          'ah': [
            2,
            16
          ]
        },
        '74': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '75': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '76': {
          'y': [
            1,
            undefined,
            41
          ],
          'ab': [
            1,
            undefined,
            42
          ]
        },
        '77': {
          'h': [
            2,
            18
          ],
          'j': [
            2,
            18
          ],
          'ae': [
            2,
            18
          ],
          'g': [
            2,
            18
          ],
          'ah': [
            2,
            18
          ]
        },
        '78': {
          'h': [
            2,
            27
          ],
          'k': [
            2,
            27
          ],
          'j': [
            2,
            27
          ],
          'ae': [
            2,
            27
          ],
          'g': [
            2,
            27
          ],
          'ah': [
            2,
            27
          ],
          'l': [
            1,
            undefined,
            48
          ]
        },
        '79': {
          'h': [
            2,
            29
          ],
          'k': [
            2,
            29
          ],
          'l': [
            2,
            29
          ],
          'j': [
            2,
            29
          ],
          'ae': [
            2,
            29
          ],
          'g': [
            2,
            29
          ],
          'ah': [
            2,
            29
          ],
          'm': [
            1,
            undefined,
            49
          ],
          'n': [
            1,
            undefined,
            50
          ]
        },
        '80': {
          'h': [
            2,
            31
          ],
          'k': [
            2,
            31
          ],
          'l': [
            2,
            31
          ],
          'm': [
            2,
            31
          ],
          'n': [
            2,
            31
          ],
          'j': [
            2,
            31
          ],
          'ae': [
            2,
            31
          ],
          'g': [
            2,
            31
          ],
          'ah': [
            2,
            31
          ],
          'o': [
            1,
            undefined,
            51
          ],
          'p': [
            1,
            undefined,
            52
          ],
          'q': [
            1,
            undefined,
            53
          ],
          'r': [
            1,
            undefined,
            54
          ]
        },
        '81': {
          'h': [
            2,
            32
          ],
          'k': [
            2,
            32
          ],
          'l': [
            2,
            32
          ],
          'm': [
            2,
            32
          ],
          'n': [
            2,
            32
          ],
          'j': [
            2,
            32
          ],
          'ae': [
            2,
            32
          ],
          'g': [
            2,
            32
          ],
          'ah': [
            2,
            32
          ],
          'o': [
            1,
            undefined,
            51
          ],
          'p': [
            1,
            undefined,
            52
          ],
          'q': [
            1,
            undefined,
            53
          ],
          'r': [
            1,
            undefined,
            54
          ]
        },
        '82': {
          'h': [
            2,
            37
          ],
          'k': [
            2,
            37
          ],
          'l': [
            2,
            37
          ],
          'm': [
            2,
            37
          ],
          'n': [
            2,
            37
          ],
          'o': [
            2,
            37
          ],
          'p': [
            2,
            37
          ],
          'q': [
            2,
            37
          ],
          'r': [
            2,
            37
          ],
          'j': [
            2,
            37
          ],
          'ae': [
            2,
            37
          ],
          'g': [
            2,
            37
          ],
          'ah': [
            2,
            37
          ],
          's': [
            1,
            undefined,
            55
          ],
          't': [
            1,
            undefined,
            56
          ]
        },
        '83': {
          'h': [
            2,
            36
          ],
          'k': [
            2,
            36
          ],
          'l': [
            2,
            36
          ],
          'm': [
            2,
            36
          ],
          'n': [
            2,
            36
          ],
          'o': [
            2,
            36
          ],
          'p': [
            2,
            36
          ],
          'q': [
            2,
            36
          ],
          'r': [
            2,
            36
          ],
          'j': [
            2,
            36
          ],
          'ae': [
            2,
            36
          ],
          'g': [
            2,
            36
          ],
          'ah': [
            2,
            36
          ],
          's': [
            1,
            undefined,
            55
          ],
          't': [
            1,
            undefined,
            56
          ]
        },
        '84': {
          'h': [
            2,
            35
          ],
          'k': [
            2,
            35
          ],
          'l': [
            2,
            35
          ],
          'm': [
            2,
            35
          ],
          'n': [
            2,
            35
          ],
          'o': [
            2,
            35
          ],
          'p': [
            2,
            35
          ],
          'q': [
            2,
            35
          ],
          'r': [
            2,
            35
          ],
          'j': [
            2,
            35
          ],
          'ae': [
            2,
            35
          ],
          'g': [
            2,
            35
          ],
          'ah': [
            2,
            35
          ],
          's': [
            1,
            undefined,
            55
          ],
          't': [
            1,
            undefined,
            56
          ]
        },
        '85': {
          'h': [
            2,
            34
          ],
          'k': [
            2,
            34
          ],
          'l': [
            2,
            34
          ],
          'm': [
            2,
            34
          ],
          'n': [
            2,
            34
          ],
          'o': [
            2,
            34
          ],
          'p': [
            2,
            34
          ],
          'q': [
            2,
            34
          ],
          'r': [
            2,
            34
          ],
          'j': [
            2,
            34
          ],
          'ae': [
            2,
            34
          ],
          'g': [
            2,
            34
          ],
          'ah': [
            2,
            34
          ],
          's': [
            1,
            undefined,
            55
          ],
          't': [
            1,
            undefined,
            56
          ]
        },
        '86': {
          'h': [
            2,
            39
          ],
          'k': [
            2,
            39
          ],
          'l': [
            2,
            39
          ],
          'm': [
            2,
            39
          ],
          'n': [
            2,
            39
          ],
          'o': [
            2,
            39
          ],
          'p': [
            2,
            39
          ],
          'q': [
            2,
            39
          ],
          'r': [
            2,
            39
          ],
          's': [
            2,
            39
          ],
          't': [
            2,
            39
          ],
          'j': [
            2,
            39
          ],
          'ae': [
            2,
            39
          ],
          'g': [
            2,
            39
          ],
          'ah': [
            2,
            39
          ],
          'u': [
            1,
            undefined,
            57
          ],
          'v': [
            1,
            undefined,
            58
          ],
          'w': [
            1,
            undefined,
            59
          ]
        },
        '87': {
          'h': [
            2,
            40
          ],
          'k': [
            2,
            40
          ],
          'l': [
            2,
            40
          ],
          'm': [
            2,
            40
          ],
          'n': [
            2,
            40
          ],
          'o': [
            2,
            40
          ],
          'p': [
            2,
            40
          ],
          'q': [
            2,
            40
          ],
          'r': [
            2,
            40
          ],
          's': [
            2,
            40
          ],
          't': [
            2,
            40
          ],
          'j': [
            2,
            40
          ],
          'ae': [
            2,
            40
          ],
          'g': [
            2,
            40
          ],
          'ah': [
            2,
            40
          ],
          'u': [
            1,
            undefined,
            57
          ],
          'v': [
            1,
            undefined,
            58
          ],
          'w': [
            1,
            undefined,
            59
          ]
        },
        '88': {
          'h': [
            2,
            42
          ],
          'k': [
            2,
            42
          ],
          'l': [
            2,
            42
          ],
          'm': [
            2,
            42
          ],
          'n': [
            2,
            42
          ],
          'o': [
            2,
            42
          ],
          'p': [
            2,
            42
          ],
          'q': [
            2,
            42
          ],
          'r': [
            2,
            42
          ],
          's': [
            2,
            42
          ],
          't': [
            2,
            42
          ],
          'u': [
            2,
            42
          ],
          'v': [
            2,
            42
          ],
          'w': [
            2,
            42
          ],
          'j': [
            2,
            42
          ],
          'ae': [
            2,
            42
          ],
          'g': [
            2,
            42
          ],
          'ah': [
            2,
            42
          ]
        },
        '89': {
          'h': [
            2,
            43
          ],
          'k': [
            2,
            43
          ],
          'l': [
            2,
            43
          ],
          'm': [
            2,
            43
          ],
          'n': [
            2,
            43
          ],
          'o': [
            2,
            43
          ],
          'p': [
            2,
            43
          ],
          'q': [
            2,
            43
          ],
          'r': [
            2,
            43
          ],
          's': [
            2,
            43
          ],
          't': [
            2,
            43
          ],
          'u': [
            2,
            43
          ],
          'v': [
            2,
            43
          ],
          'w': [
            2,
            43
          ],
          'j': [
            2,
            43
          ],
          'ae': [
            2,
            43
          ],
          'g': [
            2,
            43
          ],
          'ah': [
            2,
            43
          ]
        },
        '90': {
          'h': [
            2,
            44
          ],
          'k': [
            2,
            44
          ],
          'l': [
            2,
            44
          ],
          'm': [
            2,
            44
          ],
          'n': [
            2,
            44
          ],
          'o': [
            2,
            44
          ],
          'p': [
            2,
            44
          ],
          'q': [
            2,
            44
          ],
          'r': [
            2,
            44
          ],
          's': [
            2,
            44
          ],
          't': [
            2,
            44
          ],
          'u': [
            2,
            44
          ],
          'v': [
            2,
            44
          ],
          'w': [
            2,
            44
          ],
          'j': [
            2,
            44
          ],
          'ae': [
            2,
            44
          ],
          'g': [
            2,
            44
          ],
          'ah': [
            2,
            44
          ]
        },
        '91': {
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '92': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '93': {
          'i': [
            1,
            undefined,
            11
          ],
          't': [
            1,
            undefined,
            12
          ],
          'x': [
            1,
            undefined,
            13
          ],
          'y': [
            1,
            undefined,
            14
          ],
          'z': [
            1,
            undefined,
            15
          ],
          'ab': [
            1,
            undefined,
            7
          ],
          'ad': [
            1,
            undefined,
            16
          ],
          'af': [
            1,
            undefined,
            17
          ]
        },
        '94': {
          'h': [
            2,
            9
          ],
          'i': [
            2,
            9
          ],
          'ac': [
            2,
            9
          ],
          'ad': [
            2,
            9
          ],
          'k': [
            2,
            9
          ],
          'l': [
            2,
            9
          ],
          'm': [
            2,
            9
          ],
          'n': [
            2,
            9
          ],
          'o': [
            2,
            9
          ],
          'p': [
            2,
            9
          ],
          'q': [
            2,
            9
          ],
          'r': [
            2,
            9
          ],
          's': [
            2,
            9
          ],
          't': [
            2,
            9
          ],
          'u': [
            2,
            9
          ],
          'v': [
            2,
            9
          ],
          'w': [
            2,
            9
          ],
          'j': [
            2,
            9
          ],
          'ae': [
            2,
            9
          ],
          'g': [
            2,
            9
          ],
          'aa': [
            2,
            9
          ],
          'ah': [
            2,
            9
          ]
        },
        '95': {
          'ab': [
            1,
            undefined,
            7
          ]
        },
        '96': {
          'h': [
            2,
            10
          ],
          'i': [
            2,
            10
          ],
          'ac': [
            2,
            10
          ],
          'ad': [
            2,
            10
          ],
          'k': [
            2,
            10
          ],
          'l': [
            2,
            10
          ],
          'm': [
            2,
            10
          ],
          'n': [
            2,
            10
          ],
          'o': [
            2,
            10
          ],
          'p': [
            2,
            10
          ],
          'q': [
            2,
            10
          ],
          'r': [
            2,
            10
          ],
          's': [
            2,
            10
          ],
          't': [
            2,
            10
          ],
          'u': [
            2,
            10
          ],
          'v': [
            2,
            10
          ],
          'w': [
            2,
            10
          ],
          'j': [
            2,
            10
          ],
          'ae': [
            2,
            10
          ],
          'g': [
            2,
            10
          ],
          'aa': [
            2,
            10
          ],
          'ah': [
            2,
            10
          ]
        },
        '97': {
          'i': [
            2,
            58
          ],
          'ac': [
            2,
            58
          ],
          'ad': [
            2,
            58
          ],
          'h': [
            2,
            58
          ],
          'k': [
            2,
            58
          ],
          'l': [
            2,
            58
          ],
          'm': [
            2,
            58
          ],
          'n': [
            2,
            58
          ],
          'o': [
            2,
            58
          ],
          'p': [
            2,
            58
          ],
          'q': [
            2,
            58
          ],
          'r': [
            2,
            58
          ],
          's': [
            2,
            58
          ],
          't': [
            2,
            58
          ],
          'u': [
            2,
            58
          ],
          'v': [
            2,
            58
          ],
          'w': [
            2,
            58
          ],
          'j': [
            2,
            58
          ],
          'ae': [
            2,
            58
          ],
          'g': [
            2,
            58
          ],
          'aa': [
            2,
            58
          ],
          'ah': [
            2,
            58
          ]
        },
        '98': {
          'ae': [
            2,
            25
          ],
          'g': [
            2,
            25
          ]
        },
        '99': {
          'ah': [
            2,
            20
          ],
          'g': [
            2,
            20
          ]
        },
        '100': {
          'ah': [
            2,
            21
          ],
          'g': [
            2,
            21
          ]
        },
        '101': {
          'ah': [
            2,
            23
          ],
          'g': [
            2,
            23
          ]
        },
        '102': {
          'h': [
            1,
            undefined,
            108
          ],
          'i': [
            1,
            undefined,
            32
          ]
        },
        '103': {
          'j': [
            2,
            54
          ],
          'g': [
            2,
            54
          ]
        },
        '104': {
          'g': [
            1,
            undefined,
            95
          ],
          'j': [
            1,
            undefined,
            109
          ]
        },
        '105': {
          'g': [
            2,
            12
          ],
          'j': [
            2,
            12
          ]
        },
        '106': {
          'i': [
            1,
            undefined,
            32
          ],
          'aa': [
            1,
            undefined,
            92
          ]
        },
        '107': {
          'j': [
            2,
            52
          ],
          'g': [
            2,
            52
          ]
        },
        '108': {
          'a': [
            2,
            5
          ],
          'e': [
            2,
            5
          ],
          'c': [
            2,
            5
          ],
          'f': [
            2,
            5
          ],
          'b': [
            2,
            5
          ],
          'd': [
            2,
            5
          ]
        },
        '109': {
          'h': [
            2,
            8
          ],
          'i': [
            2,
            8
          ],
          'ac': [
            2,
            8
          ],
          'ad': [
            2,
            8
          ],
          'k': [
            2,
            8
          ],
          'l': [
            2,
            8
          ],
          'm': [
            2,
            8
          ],
          'n': [
            2,
            8
          ],
          'o': [
            2,
            8
          ],
          'p': [
            2,
            8
          ],
          'q': [
            2,
            8
          ],
          'r': [
            2,
            8
          ],
          's': [
            2,
            8
          ],
          't': [
            2,
            8
          ],
          'u': [
            2,
            8
          ],
          'v': [
            2,
            8
          ],
          'w': [
            2,
            8
          ],
          'j': [
            2,
            8
          ],
          'ae': [
            2,
            8
          ],
          'g': [
            2,
            8
          ],
          'aa': [
            2,
            8
          ],
          'ah': [
            2,
            8
          ]
        }
      }
    };
    parser.parse = function parse(input, filename) {
      var state, symbol, ret, action, $$;
      var self = this;
      var lexer = self.lexer;
      var table = self.table;
      var gotos = table.gotos;
      var tableAction = table.action;
      var productions = self.productions;
      var prefix = filename ? 'in file: ' + filename + ' ' : '';
      var valueStack = [];
      var stateStack = [0];
      var symbolStack = [];
      lexer.resetInput(input, filename);
      while (1) {
        state = peekStack(stateStack);
        if (!symbol) {
          symbol = lexer.lex();
        }
        if (symbol) {
          action = tableAction[state] && tableAction[state][symbol];
        } else {
          action = null;
        }
        if (!action) {
          var expected = [];
          var error;
          if (tableAction[state]) {
            each(tableAction[state], function (v, symbolForState) {
              action = v[GrammarConst.TYPE_INDEX];
              var map = [];
              map[GrammarConst.SHIFT_TYPE] = 'shift';
              map[GrammarConst.REDUCE_TYPE] = 'reduce';
              map[GrammarConst.ACCEPT_TYPE] = 'accept';
              expected.push(map[action] + ':' + self.lexer.mapReverseSymbol(symbolForState));
            });
          }
          error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
          throw new Error(error);
        }
        switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          symbolStack.push(symbol);
          valueStack.push(lexer.text);
          stateStack.push(action[GrammarConst.TO_INDEX]);
          symbol = null;
          break;
        case GrammarConst.REDUCE_TYPE:
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]];
          var reducedSymbol = production.symbol || production[0];
          var reducedAction = production.action || production[2];
          var reducedRhs = production.rhs || production[1];
          var len = reducedRhs.length;
          $$ = peekStack(valueStack, len);
          ret = undefined;
          self.$$ = $$;
          for (var i = 0; i < len; i++) {
            self['$' + (len - i)] = peekStack(valueStack, i + 1);
          }
          if (reducedAction) {
            ret = reducedAction.call(self);
          }
          if (ret !== undefined) {
            $$ = ret;
          } else {
            $$ = self.$$;
          }
          var reverseIndex = len * -1;
          stateStack.splice(reverseIndex, len);
          valueStack.splice(reverseIndex, len);
          symbolStack.splice(reverseIndex, len);
          symbolStack.push(reducedSymbol);
          valueStack.push($$);
          var newState = gotos[peekStack(stateStack)][reducedSymbol];
          stateStack.push(newState);
          break;
        case GrammarConst.ACCEPT_TYPE:
          return $$;
        }
      }
    };
    return parser;
  }();
  if (typeof module !== 'undefined') {
    exports = parser;
  }
  return exports;
}();
xtemplate424CompilerAst = function (exports) {
  var ast = {};
  function sameArray(a1, a2) {
    var l1 = a1.length, l2 = a2.length;
    if (l1 !== l2) {
      return 0;
    }
    for (var i = 0; i < l1; i++) {
      if (a1[i] !== a2[i]) {
        return 0;
      }
    }
    return 1;
  }
  ast.ProgramNode = function (pos, statements, inverse) {
    var self = this;
    self.pos = pos;
    self.statements = statements;
    self.inverse = inverse;
  };
  ast.ProgramNode.prototype.type = 'program';
  ast.BlockStatement = function (pos, func, program, close, escape) {
    var closeParts = close.parts, self = this, e;
    if (!sameArray(func.id.parts, closeParts)) {
      e = 'in file: ' + pos.filename + ' syntax error at line ' + pos.line + ', col ' + pos.col + ':\n' + 'expect {{/' + func.id.parts + '}} not {{/' + closeParts + '}}';
      throw new Error(e);
    }
    self.escape = escape;
    self.pos = pos;
    self.func = func;
    self.program = program;
  };
  ast.BlockStatement.prototype.type = 'blockStatement';
  ast.ExpressionStatement = function (pos, expression, escape) {
    var self = this;
    self.pos = pos;
    self.value = expression;
    self.escape = escape;
  };
  ast.ExpressionStatement.prototype.type = 'expressionStatement';
  ast.ContentStatement = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.ContentStatement.prototype.type = 'contentStatement';
  ast.UnaryExpression = function (unaryType, v) {
    this.value = v;
    this.unaryType = unaryType;
  };
  ast.Function = function (pos, id, params, hash) {
    var self = this;
    self.pos = pos;
    self.id = id;
    self.params = params;
    self.hash = hash;
  };
  ast.Function.prototype.type = 'function';
  ast.UnaryExpression.prototype.type = 'unaryExpression';
  ast.MultiplicativeExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';
  ast.AdditiveExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.AdditiveExpression.prototype.type = 'additiveExpression';
  ast.RelationalExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.RelationalExpression.prototype.type = 'relationalExpression';
  ast.EqualityExpression = function (op1, opType, op2) {
    var self = this;
    self.op1 = op1;
    self.opType = opType;
    self.op2 = op2;
  };
  ast.EqualityExpression.prototype.type = 'equalityExpression';
  ast.ConditionalAndExpression = function (op1, op2) {
    var self = this;
    self.op1 = op1;
    self.op2 = op2;
    self.opType = '&&';
  };
  ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';
  ast.ConditionalOrExpression = function (op1, op2) {
    var self = this;
    self.op1 = op1;
    self.op2 = op2;
    self.opType = '||';
  };
  ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';
  ast.String = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.String.prototype.type = 'string';
  ast.Number = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.Number.prototype.type = 'number';
  ast.Hash = function (pos, value) {
    var self = this;
    self.pos = pos;
    self.value = value;
  };
  ast.Hash.prototype.type = 'hash';
  ast.ArrayExpression = function (list) {
    this.list = list;
  };
  ast.ArrayExpression.prototype.type = 'arrayExpression';
  ast.ObjectExpression = function (obj) {
    this.obj = obj;
  };
  ast.ObjectExpression.prototype.type = 'objectExpression';
  ast.Id = function (pos, raw) {
    var self = this;
    var parts = [];
    var depth = 0;
    self.pos = pos;
    for (var i = 0, l = raw.length; i < l; i++) {
      var p = raw[i];
      if (p === '..') {
        depth++;
      } else {
        parts.push(p);
      }
    }
    self.parts = parts;
    self.string = parts.join('.');
    self.depth = depth;
  };
  ast.Id.prototype.type = 'id';
  exports = ast;
  return exports;
}();
xtemplate424RuntimeCommands = function (exports) {
  var Scope = xtemplate424RuntimeScope;
  var util = xtemplate424RuntimeUtil;
  var commands = {
    range: function (scope, option) {
      var params = option.params;
      var start = params[0];
      var end = params[1];
      var step = params[2];
      if (!step) {
        step = start > end ? -1 : 1;
      } else if (start > end && step > 0 || start < end && step < 0) {
        step = -step;
      }
      var ret = [];
      for (var i = start; start < end ? i < end : i > end; i += step) {
        ret.push(i);
      }
      return ret;
    },
    foreach: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      var xindexName = params[2] || 'xindex';
      var valueName = params[1];
      var xcount, opScope, affix, xindex;
      if (param0) {
        xcount = param0.length;
        for (xindex = 0; xindex < xcount; xindex++) {
          opScope = new Scope(param0[xindex], {
            xcount: xcount,
            xindex: xindex
          }, scope);
          affix = opScope.affix;
          if (xindexName !== 'xindex') {
            affix[xindexName] = xindex;
            affix.xindex = undefined;
          }
          if (valueName) {
            affix[valueName] = param0[xindex];
          }
          buffer = option.fn(opScope, buffer);
        }
      }
      return buffer;
    },
    forin: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      var xindexName = params[2] || 'xindex';
      var valueName = params[1];
      var opScope, affix, name;
      if (param0) {
        for (name in param0) {
          opScope = new Scope(param0[name], { xindex: name }, scope);
          affix = opScope.affix;
          if (xindexName !== 'xindex') {
            affix[xindexName] = name;
            affix.xindex = undefined;
          }
          if (valueName) {
            affix[valueName] = param0[name];
          }
          buffer = option.fn(opScope, buffer);
        }
      }
      return buffer;
    },
    each: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        if (util.isArray(param0)) {
          return commands.foreach(scope, option, buffer);
        } else {
          return commands.forin(scope, option, buffer);
        }
      }
      return buffer;
    },
    'with': function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        var opScope = new Scope(param0, undefined, scope);
        buffer = option.fn(opScope, buffer);
      }
      return buffer;
    },
    'if': function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        var fn = option.fn;
        if (fn) {
          buffer = fn(scope, buffer);
        }
      } else {
        var matchElseIf = false;
        var elseIfs = option.elseIfs;
        var inverse = option.inverse;
        if (elseIfs) {
          for (var i = 0, len = elseIfs.length; i < len; i++) {
            var elseIf = elseIfs[i];
            matchElseIf = elseIf.test(scope);
            if (matchElseIf) {
              buffer = elseIf.fn(scope, buffer);
              break;
            }
          }
        }
        if (!matchElseIf && inverse) {
          buffer = inverse(scope, buffer);
        }
      }
      return buffer;
    },
    set: function (scope, option, buffer) {
      var hash = option.hash;
      var len = hash.length;
      for (var i = 0; i < len; i++) {
        var h = hash[i];
        var parts = h.key;
        var depth = h.depth;
        var value = h.value;
        if (parts.length === 1) {
          var root = scope.root;
          while (depth && root !== scope) {
            scope = scope.parent;
            --depth;
          }
          scope.set(parts[0], value);
        } else {
          var last = scope.resolve(parts.slice(0, -1), depth);
          if (last) {
            last[parts[parts.length - 1]] = value;
          }
        }
      }
      return buffer;
    },
    include: 1,
    parse: 1,
    extend: 1,
    block: function (scope, option, buffer) {
      var self = this;
      var runtime = self.runtime;
      var params = option.params;
      var blockName = params[0];
      var type;
      if (params.length === 2) {
        type = params[0];
        blockName = params[1];
      }
      var blocks = runtime.blocks = runtime.blocks || {};
      var head = blocks[blockName], cursor;
      var current = {
        fn: option.fn,
        type: type
      };
      if (!head) {
        blocks[blockName] = current;
      } else if (head.type) {
        if (head.type === 'append') {
          current.next = head;
          blocks[blockName] = current;
        } else if (head.type === 'prepend') {
          var prev;
          cursor = head;
          while (cursor && cursor.type === 'prepend') {
            prev = cursor;
            cursor = cursor.next;
          }
          current.next = cursor;
          prev.next = current;
        }
      }
      if (!runtime.extendTpl) {
        cursor = blocks[blockName];
        while (cursor) {
          if (cursor.fn) {
            buffer = cursor.fn.call(self, scope, buffer);
          }
          cursor = cursor.next;
        }
      }
      return buffer;
    },
    macro: function (scope, option, buffer) {
      var hash = option.hash;
      var params = option.params;
      var macroName = params[0];
      var params1 = params.slice(1);
      var self = this;
      var runtime = self.runtime;
      var macros = runtime.macros = runtime.macros || {};
      var macro = macros[macroName];
      if (option.fn) {
        macros[macroName] = {
          paramNames: params1,
          hash: hash,
          fn: option.fn
        };
      } else if (macro) {
        var paramValues = macro.hash || {};
        var paramNames;
        if (paramNames = macro.paramNames) {
          for (var i = 0, len = paramNames.length; i < len; i++) {
            var p = paramNames[i];
            paramValues[p] = params1[i];
          }
        }
        if (hash) {
          for (var h in hash) {
            paramValues[h] = hash[h];
          }
        }
        var newScope = new Scope(paramValues);
        newScope.root = scope.root;
        buffer = macro.fn.call(self, newScope, buffer);
      } else {
        var error = 'can not find macro: ' + macroName;
        buffer.error(error);
      }
      return buffer;
    }
  };
  commands['debugger'] = function () {
    if ('@DEBUG@') {
      util.globalEval('debugger');
    }
  };
  exports = commands;
  return exports;
}();
xtemplate424Runtime = function (exports) {
  var util = xtemplate424RuntimeUtil;
  var nativeCommands = xtemplate424RuntimeCommands;
  var commands = {};
  var Scope = xtemplate424RuntimeScope;
  var LinkedBuffer = xtemplate424RuntimeLinkedBuffer;
  function TplWrap(name, runtime, root, scope, buffer, originalName, fn, parent) {
    this.name = name;
    this.originalName = originalName || name;
    this.runtime = runtime;
    this.root = root;
    this.pos = { line: 1 };
    this.scope = scope;
    this.buffer = buffer;
    this.fn = fn;
    this.parent = parent;
  }
  function findCommand(runtimeCommands, instanceCommands, parts) {
    var name = parts[0];
    var cmd = runtimeCommands && runtimeCommands[name] || instanceCommands && instanceCommands[name] || commands[name];
    if (parts.length === 1) {
      return cmd;
    }
    if (cmd) {
      var len = parts.length;
      for (var i = 1; i < len; i++) {
        cmd = cmd[parts[i]];
        if (!cmd) {
          return false;
        }
      }
    }
    return cmd;
  }
  function getSubNameFromParentName(parentName, subName) {
    var parts = parentName.split('/');
    var subParts = subName.split('/');
    parts.pop();
    for (var i = 0, l = subParts.length; i < l; i++) {
      var subPart = subParts[i];
      if (subPart === '.') {
      } else if (subPart === '..') {
        parts.pop();
      } else {
        parts.push(subPart);
      }
    }
    return parts.join('/');
  }
  function callFn(tpl, scope, option, buffer, parts, depth) {
    var caller, fn, command1;
    if (!depth) {
      command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
    }
    if (command1) {
      return command1.call(tpl, scope, option, buffer);
    } else if (command1 !== false) {
      var callerParts = parts.slice(0, -1);
      caller = scope.resolve(callerParts, depth);
      if (caller == null) {
        buffer.error('Execute function `' + parts.join('.') + '` Error: ' + callerParts.join('.') + ' is undefined or null');
        return buffer;
      }
      fn = caller[parts[parts.length - 1]];
      if (fn) {
        try {
          return fn.apply(caller, option.params || []);
        } catch (err) {
          buffer.error('Execute function `' + parts.join('.') + '` Error: ' + err.message);
          return buffer;
        }
      }
    }
    buffer.error('Command Not Found: ' + parts.join('.'));
    return buffer;
  }
  var utils = {
    callFn: callFn,
    callDataFn: function (params, parts) {
      var caller = parts[0];
      var fn = caller;
      for (var i = 1; i < parts.length; i++) {
        var name = parts[i];
        if (fn && fn[name] != null) {
          caller = fn;
          fn = fn[name];
        } else {
          return '';
        }
      }
      return fn.apply(caller, params || []);
    },
    callCommand: function (tpl, scope, option, buffer, parts) {
      return callFn(tpl, scope, option, buffer, parts);
    }
  };
  function XTemplateRuntime(fn, config) {
    var self = this;
    self.fn = fn;
    self.config = util.merge(XTemplateRuntime.globalConfig, config);
    this.subNameResolveCache = {};
  }
  util.mix(XTemplateRuntime, {
    config: function (key, v) {
      var globalConfig = this.globalConfig = this.globalConfig || {};
      if (arguments.length) {
        if (v !== undefined) {
          globalConfig[key] = v;
        } else {
          util.mix(globalConfig, key);
        }
      } else {
        return globalConfig;
      }
    },
    nativeCommands: nativeCommands,
    utils: utils,
    util: util,
    addCommand: function (commandName, fn) {
      commands[commandName] = fn;
    },
    removeCommand: function (commandName) {
      delete commands[commandName];
    }
  });
  function resolve(self, subName, parentName) {
    if (subName.charAt(0) !== '.') {
      return subName;
    }
    var key = parentName + '_ks_' + subName;
    var nameResolveCache = self.subNameResolveCache;
    var cached = nameResolveCache[key];
    if (cached) {
      return cached;
    }
    subName = nameResolveCache[key] = getSubNameFromParentName(parentName, subName);
    return subName;
  }
  function includeInternal(self, scope, escape, buffer, tpl, originalName) {
    var name = resolve(self, originalName, tpl.name);
    var newBuffer = buffer.insert();
    var next = newBuffer.next;
    loadInternal(self, name, tpl.runtime, scope, newBuffer, originalName, escape, buffer.tpl);
    return next;
  }
  function includeModuleInternal(self, scope, buffer, tpl, tplFn) {
    var newBuffer = buffer.insert();
    var next = newBuffer.next;
    var newTpl = new TplWrap(tplFn.TPL_NAME, tpl.runtime, self, scope, newBuffer, undefined, tplFn, buffer.tpl);
    newBuffer.tpl = newTpl;
    renderTpl(newTpl);
    return next;
  }
  function loadInternal(self, name, runtime, scope, buffer, originalName, escape, parentTpl) {
    var tpl = new TplWrap(name, runtime, self, scope, buffer, originalName, undefined, parentTpl);
    buffer.tpl = tpl;
    self.config.loader.load(tpl, function (error, tplFn) {
      if (typeof tplFn === 'function') {
        tpl.fn = tplFn;
        renderTpl(tpl);
      } else if (error) {
        buffer.error(error);
      } else {
        tplFn = tplFn || '';
        if (escape) {
          buffer.writeEscaped(tplFn);
        } else {
          buffer.data += tplFn;
        }
        buffer.end();
      }
    });
  }
  function renderTpl(tpl) {
    var buffer = tpl.fn();
    if (buffer) {
      var runtime = tpl.runtime;
      var extendTpl = runtime.extendTpl;
      var extendTplName;
      if (extendTpl) {
        extendTplName = extendTpl.params[0];
        if (!extendTplName) {
          return buffer.error('extend command required a non-empty parameter');
        }
      }
      var extendTplFn = runtime.extendTplFn;
      var extendTplBuffer = runtime.extendTplBuffer;
      if (extendTplFn) {
        runtime.extendTpl = null;
        runtime.extendTplBuffer = null;
        runtime.extendTplFn = null;
        includeModuleInternal(tpl.root, tpl.scope, extendTplBuffer, tpl, extendTplFn).end();
      } else if (extendTplName) {
        runtime.extendTpl = null;
        runtime.extendTplBuffer = null;
        includeInternal(tpl.root, tpl.scope, 0, extendTplBuffer, tpl, extendTplName).end();
      }
      return buffer.end();
    }
  }
  function getIncludeScope(scope, option, buffer) {
    var params = option.params;
    if (!params[0]) {
      return buffer.error('include command required a non-empty parameter');
    }
    var newScope = scope;
    var newScopeData = params[1];
    var hash = option.hash;
    if (hash) {
      if (newScopeData) {
        newScopeData = util.mix({}, newScopeData);
      } else {
        newScopeData = {};
      }
      util.mix(newScopeData, hash);
    }
    if (newScopeData) {
      newScope = new Scope(newScopeData, undefined, scope);
    }
    return newScope;
  }
  XTemplateRuntime.prototype = {
    constructor: XTemplateRuntime,
    Scope: Scope,
    nativeCommands: nativeCommands,
    utils: utils,
    removeCommand: function (commandName) {
      var config = this.config;
      if (config.commands) {
        delete config.commands[commandName];
      }
    },
    addCommand: function (commandName, fn) {
      var config = this.config;
      config.commands = config.commands || {};
      config.commands[commandName] = fn;
    },
    include: function (scope, option, buffer, tpl) {
      return includeInternal(this, getIncludeScope(scope, option, buffer), option.escape, buffer, tpl, option.params[0]);
    },
    includeModule: function (scope, option, buffer, tpl) {
      return includeModuleInternal(this, getIncludeScope(scope, option, buffer), buffer, tpl, option.params[0]);
    },
    render: function (data, option, callback) {
      var html = '';
      var self = this;
      var fn = self.fn;
      var config = self.config;
      if (typeof option === 'function') {
        callback = option;
        option = null;
      }
      option = option || {};
      callback = callback || function (error, ret) {
        if (error) {
          if (!(error instanceof Error)) {
            error = new Error(error);
          }
          throw error;
        }
        html = ret;
      };
      var name = self.config.name;
      if (!name && fn && fn.TPL_NAME) {
        name = fn.TPL_NAME;
      }
      var scope;
      if (data instanceof Scope) {
        scope = data;
      } else {
        scope = new Scope(data);
      }
      var buffer = new XTemplateRuntime.LinkedBuffer(callback, config).head;
      var tpl = new TplWrap(name, { commands: option.commands }, self, scope, buffer, name, fn);
      buffer.tpl = tpl;
      if (!fn) {
        config.loader.load(tpl, function (err, fn) {
          if (fn) {
            tpl.fn = self.fn = fn;
            renderTpl(tpl);
          } else if (err) {
            buffer.error(err);
          }
        });
        return html;
      }
      renderTpl(tpl);
      return html;
    }
  };
  XTemplateRuntime.Scope = Scope;
  XTemplateRuntime.LinkedBuffer = LinkedBuffer;
  exports = XTemplateRuntime;
  return exports;
}();
xtemplate424Compiler = function (exports) {
  var util = xtemplate424Runtime.util;
  var compilerTools = xtemplate424CompilerTools;
  var pushToArray = compilerTools.pushToArray;
  var wrapByDoubleQuote = compilerTools.wrapByDoubleQuote;
  var TMP_DECLARATION = ['var t;'];
  for (var i = 0; i < 10; i++) {
    TMP_DECLARATION.push('var t' + i + ';');
  }
  var TOP_DECLARATION = TMP_DECLARATION.concat([
    'var tpl = this;',
    'var root = tpl.root;',
    'var buffer = tpl.buffer;',
    'var scope = tpl.scope;',
    'var runtime = tpl.runtime;',
    'var name = tpl.name;',
    'var pos = tpl.pos;',
    'var data = scope.data;',
    'var affix = scope.affix;',
    'var nativeCommands = root.nativeCommands;',
    'var utils = root.utils;'
  ]).join('\n');
  var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
  var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, {idParts});';
  var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts});';
  var CALL_DATA_FUNCTION = '{lhs} = callDataFnUtil([{params}], {idParts});';
  var CALL_FUNCTION_DEPTH = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts}, {depth});';
  var ASSIGN_STATEMENT = 'var {lhs} = {value};';
  var SCOPE_RESOLVE_DEPTH = 'var {lhs} = scope.resolve({idParts},{depth});';
  var SCOPE_RESOLVE_LOOSE_DEPTH = 'var {lhs} = scope.resolveLoose({idParts},{depth});';
  var FUNC = [
    'function {functionName}({params}){',
    '{body}',
    '}'
  ].join('\n');
  var SOURCE_URL = [
    '',
    '//# sourceURL = {name}.js'
  ].join('\n');
  var DECLARE_NATIVE_COMMANDS = 'var {name}Command = nativeCommands["{name}"];';
  var DECLARE_UTILS = 'var {name}Util = utils["{name}"];';
  var BUFFER_WRITE = 'buffer = buffer.write({value});';
  var BUFFER_APPEND = 'buffer.data += {value};';
  var BUFFER_WRITE_ESCAPED = 'buffer = buffer.writeEscaped({value});';
  var RETURN_BUFFER = 'return buffer;';
  var XTemplateRuntime = xtemplate424Runtime;
  var parser = xtemplate424CompilerParser;
  parser.yy = xtemplate424CompilerAst;
  var nativeCode = [];
  var substitute = util.substitute;
  var each = util.each;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  var nativeUtils = XTemplateRuntime.utils;
  each(nativeUtils, function (v, name) {
    nativeCode.push(substitute(DECLARE_UTILS, { name: name }));
  });
  each(nativeCommands, function (v, name) {
    nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, { name: name }));
  });
  nativeCode = nativeCode.join('\n');
  var lastLine = 1;
  function markLine(pos, source) {
    if (lastLine === pos.line) {
      return;
    }
    lastLine = pos.line;
    source.push('pos.line = ' + pos.line + ';');
  }
  function resetGlobal() {
    lastLine = 1;
  }
  function getFunctionDeclare(functionName) {
    return [
      'function ' + functionName + '(scope, buffer, undefined) {',
      'var data = scope.data;',
      'var affix = scope.affix;'
    ];
  }
  function guid(self, str) {
    return str + self.uuid++;
  }
  function opExpression(e) {
    var source = [];
    var type = e.opType;
    var exp1, exp2, code1Source, code2Source;
    var code1 = this[e.op1.type](e.op1);
    var code2 = this[e.op2.type](e.op2);
    var exp = guid(this, 'exp');
    exp1 = code1.exp;
    exp2 = code2.exp;
    code1Source = code1.source;
    code2Source = code2.source;
    pushToArray(source, code1Source);
    source.push('var ' + exp + ' = ' + exp1 + ';');
    if (type === '&&' || type === '||') {
      source.push('if(' + (type === '&&' ? '' : '!') + '(' + exp + ')){');
      pushToArray(source, code2Source);
      source.push(exp + ' = ' + exp2 + ';');
      source.push('}');
    } else {
      pushToArray(source, code2Source);
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    return {
      exp: exp,
      source: source
    };
  }
  function genFunction(self, statements) {
    var functionName = guid(self, 'func');
    var source = getFunctionDeclare(functionName);
    var statement;
    for (var i = 0, len = statements.length; i < len; i++) {
      statement = statements[i];
      pushToArray(source, self[statement.type](statement).source);
    }
    source.push(RETURN_BUFFER);
    source.push('}');
    pushToArray(self.functionDeclares, source);
    return functionName;
  }
  function genConditionFunction(self, condition) {
    var functionName = guid(self, 'func');
    var source = getFunctionDeclare(functionName);
    var gen = self[condition.type](condition);
    pushToArray(source, gen.source);
    source.push('return ' + gen.exp + ';');
    source.push('}');
    pushToArray(self.functionDeclares, source);
    return functionName;
  }
  function genTopFunction(self, statements) {
    var catchError = self.config.catchError;
    var source = [
      TOP_DECLARATION,
      nativeCode,
      catchError ? 'try {' : ''
    ];
    var statement, i, len;
    for (i = 0, len = statements.length; i < len; i++) {
      statement = statements[i];
      pushToArray(source, self[statement.type](statement, { top: 1 }).source);
    }
    source.splice.apply(source, [
      2,
      0
    ].concat(self.functionDeclares).concat(''));
    source.push(RETURN_BUFFER);
    if (catchError) {
      source.push('} catch(e) {');
      source.push('if(!e.xtpl){');
      source.push('buffer.error(e);');
      source.push('}else{ throw e; }');
      source.push('}');
    }
    return {
      params: ['undefined'],
      source: source.join('\n')
    };
  }
  function genOptionFromFunction(self, func, escape, fn, elseIfs, inverse) {
    var source = [];
    var params = func.params;
    var hash = func.hash;
    var funcParams = [];
    var isSetFunction = func.id.string === 'set';
    if (params) {
      each(params, function (param) {
        var nextIdNameCode = self[param.type](param);
        pushToArray(source, nextIdNameCode.source);
        funcParams.push(nextIdNameCode.exp);
      });
    }
    var funcHash = [];
    if (hash) {
      each(hash.value, function (h) {
        var v = h[1];
        var key = h[0];
        var vCode = self[v.type](v);
        pushToArray(source, vCode.source);
        if (isSetFunction) {
          var resolvedParts = compilerTools.convertIdPartsToRawAccessor(self, source, key.parts).resolvedParts;
          funcHash.push({
            key: resolvedParts,
            depth: key.depth,
            value: vCode.exp
          });
        } else {
          if (key.parts.length !== 1 || typeof key.parts[0] !== 'string') {
            throw new Error('invalid hash parameter');
          }
          funcHash.push([
            wrapByDoubleQuote(key.string),
            vCode.exp
          ]);
        }
      });
    }
    var exp = '';
    if (funcParams.length || funcHash.length || escape || fn || inverse || elseIfs) {
      if (escape) {
        exp += ',escape:1';
      }
      if (funcParams.length) {
        exp += ',params:[' + funcParams.join(',') + ']';
      }
      if (funcHash.length) {
        var hashStr = [];
        if (isSetFunction) {
          util.each(funcHash, function (h) {
            hashStr.push('{key:[' + h.key.join(',') + '],value:' + h.value + ', depth:' + h.depth + '}');
          });
          exp += ',hash: [' + hashStr.join(',') + ']';
        } else {
          util.each(funcHash, function (h) {
            hashStr.push(h[0] + ':' + h[1]);
          });
          exp += ',hash: {' + hashStr.join(',') + '}';
        }
      }
      if (fn) {
        exp += ',fn: ' + fn;
      }
      if (inverse) {
        exp += ',inverse: ' + inverse;
      }
      if (elseIfs) {
        exp += ',elseIfs: ' + elseIfs;
      }
      exp = '{' + exp.slice(1) + '}';
    }
    return {
      exp: exp || '{}',
      funcParams: funcParams,
      source: source
    };
  }
  function generateFunction(self, func, block, escape) {
    var source = [];
    markLine(func.pos, source);
    var functionConfigCode, idName;
    var id = func.id;
    var idString = id.string;
    if (idString in nativeCommands) {
      escape = 0;
    }
    var idParts = id.parts;
    var i;
    if (idString === 'elseif') {
      return {
        exp: '',
        source: []
      };
    }
    if (block) {
      var programNode = block.program;
      var inverse = programNode.inverse;
      var fnName, elseIfsName, inverseName;
      var elseIfs = [];
      var elseIf, functionValue, statement;
      var statements = programNode.statements;
      var thenStatements = [];
      for (i = 0; i < statements.length; i++) {
        statement = statements[i];
        if (statement.type === 'expressionStatement' && (functionValue = statement.value) && (functionValue = functionValue.parts) && functionValue.length === 1 && (functionValue = functionValue[0]) && functionValue.type === 'function' && functionValue.id.string === 'elseif') {
          if (elseIf) {
            elseIfs.push(elseIf);
          }
          elseIf = {
            condition: functionValue.params[0],
            statements: []
          };
        } else if (elseIf) {
          elseIf.statements.push(statement);
        } else {
          thenStatements.push(statement);
        }
      }
      if (elseIf) {
        elseIfs.push(elseIf);
      }
      fnName = genFunction(self, thenStatements);
      if (inverse) {
        inverseName = genFunction(self, inverse);
      }
      if (elseIfs.length) {
        var elseIfsVariable = [];
        for (i = 0; i < elseIfs.length; i++) {
          var elseIfStatement = elseIfs[i];
          var conditionName = genConditionFunction(self, elseIfStatement.condition);
          elseIfsVariable.push('{test: ' + conditionName + ',fn : ' + genFunction(self, elseIfStatement.statements) + '}');
        }
        elseIfsName = '[' + elseIfsVariable.join(',') + ']';
      }
      functionConfigCode = genOptionFromFunction(self, func, escape, fnName, elseIfsName, inverseName);
      pushToArray(source, functionConfigCode.source);
    }
    var isModule = self.config.isModule;
    if (idString === 'include' || idString === 'parse' || idString === 'extend') {
      if (!func.params || func.params.length > 2) {
        throw new Error('include/parse/extend can only has at most two parameter!');
      }
    }
    if (isModule) {
      if (idString === 'include' || idString === 'parse') {
        func.params[0] = {
          type: 'raw',
          value: 're' + 'quire("' + func.params[0].value + '")'
        };
      }
    }
    if (!functionConfigCode) {
      functionConfigCode = genOptionFromFunction(self, func, escape, null, null, null);
      pushToArray(source, functionConfigCode.source);
    }
    if (!block) {
      idName = guid(self, 'callRet');
      source.push('var ' + idName);
    }
    if (idString in nativeCommands) {
      if (idString === 'extend') {
        source.push('runtime.extendTpl = ' + functionConfigCode.exp);
        source.push('buffer = buffer.async(function(newBuffer){runtime.extendTplBuffer = newBuffer;});');
        if (isModule) {
          source.push('runtime.extendTplFn = re' + 'quire(' + functionConfigCode.exp + '.params[0])');
        }
      } else if (idString === 'include') {
        source.push('buffer = root.' + (isModule ? 'includeModule' : 'include') + '(scope,' + functionConfigCode.exp + ',buffer,tpl);');
      } else if (idString === 'parse') {
        source.push('buffer = root.' + (isModule ? 'includeModule' : 'include') + '(new scope.constructor(),' + functionConfigCode.exp + ',buffer,tpl);');
      } else {
        source.push(substitute(CALL_NATIVE_COMMAND, {
          lhs: block ? 'buffer' : idName,
          name: idString,
          option: functionConfigCode.exp
        }));
      }
    } else if (block) {
      source.push(substitute(CALL_CUSTOM_COMMAND, {
        option: functionConfigCode.exp,
        idParts: compilerTools.convertIdPartsToRawAccessor(self, source, idParts).arr
      }));
    } else {
      var resolveParts = compilerTools.convertIdPartsToRawAccessor(self, source, idParts);
      if (resolveParts.funcRet) {
        source.push(substitute(CALL_DATA_FUNCTION, {
          lhs: idName,
          params: functionConfigCode.funcParams.join(','),
          idParts: resolveParts.arr,
          depth: id.depth
        }));
      } else {
        source.push(substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
          lhs: idName,
          option: functionConfigCode.exp,
          idParts: resolveParts.arr,
          depth: id.depth
        }));
      }
    }
    return {
      exp: idName,
      source: source
    };
  }
  function AstToJSProcessor(config) {
    this.functionDeclares = [];
    this.config = config;
    this.uuid = 0;
  }
  AstToJSProcessor.prototype = {
    constructor: AstToJSProcessor,
    raw: function (raw) {
      return { exp: raw.value };
    },
    arrayExpression: function (e) {
      var list = e.list;
      var len = list.length;
      var r;
      var source = [];
      var exp = [];
      for (var i = 0; i < len; i++) {
        r = this[list[i].type](list[i]);
        pushToArray(source, r.source);
        exp.push(r.exp);
      }
      return {
        exp: '[' + exp.join(',') + ']',
        source: source
      };
    },
    objectExpression: function (e) {
      var obj = e.obj;
      var len = obj.length;
      var r;
      var source = [];
      var exp = [];
      for (var i = 0; i < len; i++) {
        var item = obj[i];
        r = this[item[1].type](item[1]);
        pushToArray(source, r.source);
        exp.push(wrapByDoubleQuote(item[0]) + ': ' + r.exp);
      }
      return {
        exp: '{' + exp.join(',') + '}',
        source: source
      };
    },
    conditionalOrExpression: opExpression,
    conditionalAndExpression: opExpression,
    relationalExpression: opExpression,
    equalityExpression: opExpression,
    additiveExpression: opExpression,
    multiplicativeExpression: opExpression,
    unaryExpression: function (e) {
      var code = this[e.value.type](e.value);
      return {
        exp: e.unaryType + '(' + code.exp + ')',
        source: code.source
      };
    },
    string: function (e) {
      return {
        exp: compilerTools.wrapBySingleQuote(compilerTools.escapeString(e.value, 1)),
        source: []
      };
    },
    number: function (e) {
      return {
        exp: e.value,
        source: []
      };
    },
    id: function (idNode) {
      var source = [];
      var self = this;
      var loose = !self.config.strict;
      markLine(idNode.pos, source);
      if (compilerTools.isGlobalId(idNode)) {
        return {
          exp: idNode.string,
          source: source
        };
      }
      var depth = idNode.depth;
      var idParts = idNode.parts;
      var idName = guid(self, 'id');
      if (depth) {
        source.push(substitute(loose ? SCOPE_RESOLVE_LOOSE_DEPTH : SCOPE_RESOLVE_DEPTH, {
          lhs: idName,
          idParts: compilerTools.convertIdPartsToRawAccessor(self, source, idParts).arr,
          depth: depth
        }));
        return {
          exp: idName,
          source: source
        };
      } else {
        var part0 = idParts[0];
        var remain;
        var remainParts;
        if (part0 === 'this') {
          remainParts = idParts.slice(1);
          source.push(substitute(ASSIGN_STATEMENT, {
            lhs: idName,
            value: remainParts.length ? compilerTools.chainedVariableRead(self, source, remainParts, undefined, undefined, loose) : 'data'
          }));
          return {
            exp: idName,
            source: source
          };
        } else if (part0 === 'root') {
          remainParts = idParts.slice(1);
          remain = remainParts.join('.');
          if (remain) {
            remain = '.' + remain;
          }
          source.push(substitute(ASSIGN_STATEMENT, {
            lhs: idName,
            value: remain ? compilerTools.chainedVariableRead(self, source, remainParts, true, undefined, loose) : 'scope.root.data',
            idParts: remain
          }));
          return {
            exp: idName,
            source: source
          };
        } else {
          if (idParts[0].type === 'function') {
            var resolvedParts = compilerTools.convertIdPartsToRawAccessor(self, source, idParts).resolvedParts;
            for (var i = 1; i < resolvedParts.length; i++) {
              resolvedParts[i] = '[' + resolvedParts[i] + ']';
            }
            var value;
            if (loose) {
              value = compilerTools.genStackJudge(resolvedParts.slice(1), resolvedParts[0]);
            } else {
              value = resolvedParts[0];
              for (var ri = 1; ri < resolvedParts.length; ri++) {
                value += resolvedParts[ri];
              }
            }
            source.push(substitute(ASSIGN_STATEMENT, {
              lhs: idName,
              value: value
            }));
          } else {
            source.push(substitute(ASSIGN_STATEMENT, {
              lhs: idName,
              value: compilerTools.chainedVariableRead(self, source, idParts, false, true, loose)
            }));
          }
          return {
            exp: idName,
            source: source
          };
        }
      }
    },
    'function': function (func, escape) {
      return generateFunction(this, func, false, escape);
    },
    blockStatement: function (block) {
      return generateFunction(this, block.func, block);
    },
    expressionStatement: function (expressionStatement) {
      var source = [];
      var escape = expressionStatement.escape;
      var code;
      var expression = expressionStatement.value;
      var type = expression.type;
      var expressionOrVariable;
      code = this[type](expression, escape);
      pushToArray(source, code.source);
      expressionOrVariable = code.exp;
      source.push(substitute(escape ? BUFFER_WRITE_ESCAPED : BUFFER_WRITE, { value: expressionOrVariable }));
      return {
        exp: '',
        source: source
      };
    },
    contentStatement: function (contentStatement) {
      return {
        exp: '',
        source: [substitute(BUFFER_APPEND, { value: compilerTools.wrapBySingleQuote(compilerTools.escapeString(contentStatement.value, 0)) })]
      };
    }
  };
  var compiler;
  var anonymousCount = 0;
  compiler = {
    parse: function (tplContent, name) {
      if (tplContent) {
        var ret;
        try {
          ret = parser.parse(tplContent, name);
        } catch (err) {
          var e;
          if (err instanceof Error) {
            e = err;
          } else {
            e = new Error(err);
          }
          var errorStr = 'XTemplate error ';
          e.stack = errorStr + e.stack;
          e.message = errorStr + e.message;
          throw e;
        }
        return ret;
      } else {
        return { statements: [] };
      }
    },
    compileToStr: function (param) {
      var func = compiler.compileToJson(param);
      return substitute(FUNC, {
        functionName: param.functionName || '',
        params: func.params.join(','),
        body: func.source
      });
    },
    compileToJson: function (param) {
      resetGlobal();
      var name = param.name = param.name || 'xtemplate' + ++anonymousCount;
      var content = param.content;
      var root = compiler.parse(content, name);
      return genTopFunction(new AstToJSProcessor(param), root.statements);
    },
    compile: function (tplContent, name, config) {
      var code = compiler.compileToJson(util.merge(config, {
        content: tplContent,
        name: name
      }));
      return Function.apply(null, code.params.concat(code.source + substitute(SOURCE_URL, { name: name })));
    }
  };
  exports = compiler;
  return exports;
}();
xtemplate424Index = function (exports) {
  var XTemplateRuntime = xtemplate424Runtime;
  var util = XTemplateRuntime.util;
  var Compiler = xtemplate424Compiler;
  var compile = Compiler.compile;
  function XTemplate(tpl, config) {
    var tplType = typeof tpl;
    if (tplType !== 'string' && tplType !== 'function') {
      config = tpl;
      tpl = undefined;
    }
    config = this.config = util.merge(XTemplate.globalConfig, config);
    if (tplType === 'string') {
      try {
        tpl = this.compile(tpl, config.name);
      } catch (err) {
        this.compileError = err;
      }
    }
    XTemplateRuntime.call(this, tpl, config);
  }
  function Noop() {
  }
  Noop.prototype = XTemplateRuntime.prototype;
  XTemplate.prototype = new Noop();
  XTemplate.prototype.constructor = XTemplate;
  XTemplate.prototype.compile = function (content, name) {
    return compile(content, name, this.config);
  };
  XTemplate.prototype.render = function (data, option, callback) {
    if (typeof option === 'function') {
      callback = option;
    }
    var compileError = this.compileError;
    if (compileError) {
      if (callback) {
        callback(compileError);
      } else {
        throw compileError;
      }
    } else {
      return XTemplateRuntime.prototype.render.apply(this, arguments);
    }
  };
  exports = util.mix(XTemplate, {
    config: XTemplateRuntime.config,
    compile: compile,
    Compiler: Compiler,
    Scope: XTemplateRuntime.Scope,
    Runtime: XTemplateRuntime,
    addCommand: XTemplateRuntime.addCommand,
    removeCommand: XTemplateRuntime.removeCommand
  });
  return exports;
}();
return xtemplate424Index;
})();
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

    options.commands = commands;

    return compiledView.render(data, options);
}

Flipper.registerTemplateEngine('xtpl', {
    render: renderView
});

}());
