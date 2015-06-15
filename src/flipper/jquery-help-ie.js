
function requestjQuery(args) {
    if (!window.jQuery) {
        throw new Error('must include jQuery on IE browser');
    }
    return window.jQuery(args);
}

var supportCustomEvent = !!window.CustomEvent;

if (supportCustomEvent) {
    try {
        /* jshint nonew: false */
        new window.CustomEvent('xyz');
    } catch (ex) {
        supportCustomEvent = false;
    }
}

var isIE = (function() {
    function detectIE() {
        var ua = window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
           // IE 12 => return version number
           return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    }

    return detectIE();
}());

utils.event = {
    on: function(node, method, callback) {
        if (supportCustomEvent && !isIE) {
            node.addEventListener(method, callback, false);
        } else {
            requestjQuery(node).on(method, callback);
        }

    },
    trigger: function(node, method) {
        if (supportCustomEvent && !isIE) {
            var event = new CustomEvent(method);
            node.dispatchEvent( event );
        } else {
            requestjQuery(node).trigger(method);
        }

    },
    halt: function(ev) {
        ev = ev || window.event;
        if (ev) {
            if (ev.stopPropagation) {
                ev.stopPropagation();
            } else {
                ev.cancelBubble = true;
            }

            if (ev.preventDefault) {
                ev.preventDefault();
            } else {
                ev.returnValue = false;
            }
        }
    }
};

utils.eachChildNodes = function eachChildNodes(ele, checkFn, callbackFn) {
    var child, i, len, isBreak,
        hasCheckFn = typeof checkFn === 'function';

    if (ele.childNodes) {
        for (i = 0, len = ele.childNodes.length; i < len; i += 1) {
            child = ele.childNodes[i];

            if (!hasCheckFn || checkFn(child)) {
                isBreak = callbackFn(child);
                if (isBreak === false) {
                    break;
                }
            }
        }
    }
};

utils.moveChildNodes = function moveChildNodes(target, src) {
    if (src.firstChild && target.appendChild) {
        while (src.firstChild) {
            target.appendChild(src.firstChild);
        }
    }
};

utils.replaceChildNodes = function replaceChildNodes(target, src) {
    var replaced = false,
        flagNode = target,
        targetNode;

    while (src.firstChild) {
        targetNode = src.firstChild;
        if (!replaced) {
            target.parentNode.replaceChild(targetNode, target);
            replaced = true;
        } else {
            flagNode.parentNode.insertBefore(targetNode, flagNode.nextSibling);
        }
        flagNode = targetNode;
    }
};

utils.matchSelector = (function() {
    var matchsMethod,
        _div = document.createElement('div'),
        matchSelector;

    if (_div.matches) {
        matchsMethod = 'matches';
    } else if (_div.matchesSelector) {
        matchsMethod = 'matchesSelector';
    } else if (_div.mozMatchesSelector) {
        matchsMethod = 'mozMatchesSelector';
    } else if (_div.oMatchesSelector) {
        matchsMethod = 'oMatchesSelector';
    } else if (_div.msMatchesSelector) {
        matchsMethod = 'msMatchesSelector';
    }

    if (matchsMethod) {
        matchSelector = function(ele, selector) {
            return ele[matchsMethod](selector);
        };
    } else if (_div.querySelectorAll) {
        matchSelector = function(ele, selector) {
            var matches = (ele.document || ele.ownerDocument).querySelectorAll(selector);

            var i = 0;
            while (matches[i] && matches[i] !== ele) {
              i += 1;
            }

            return !!matches[i];
        };
    } else {
        matchSelector = function(ele, selector) {
            return requestjQuery(ele).is(selector);
        };
    }

    return matchSelector;
}());

utils.handleNode = function handleNode(node, callback) {
    if (node === undefined || node === null) {
        return;
    }

    if (typeof node === 'string') {
        node = utils.query.all(node);
    }

    if (node.length !== undefined) {
        for ( var i = 0, len = node.length; i < len; i += 1) {
            callback(node[i]);
        }
    } else {
        callback(node);
    }
};

utils.cloneNode = function cloneNode(node) {
    var componentName = node.tagName.toLowerCase(),
        newNode, attrs;

    newNode = document.createElement(componentName);

    if (node.hasAttributes()) {
        attrs = node.attributes;
        for (var i = 0, len = attrs.length; i < len; i += 1) {
            newNode.setAttribute(attrs[i].name, attrs[i].value);
        }
    }

    if (node.innerHTML && node.innerHTML.length) {
        newNode.innerHTML = node.innerHTML;
    }

    return newNode;
};

utils.query = function query(node, selector) {
    if (arguments.length === 1) {
        selector = node;
        node = document;
    }

    if (node.querySelector) {
        return node.querySelector(selector);
    } else {
        return requestjQuery(node).find(selector)[0];
    }
};

utils.query.all = function queryAll(node, selector) {
    if (arguments.length === 1) {
        selector = node;
        node = document;
    }

    if (node.querySelectorAll) {
        return node.querySelectorAll(selector);
    } else {
        var result = [];
        utils.requestjQuery(node).find(selector).each(function() {
            result.push(this);
        });
        return result;
    }
};
