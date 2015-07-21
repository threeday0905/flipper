!function(e){function t(e,t){return function(){e.apply(t,arguments)}}function n(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],c(e,t(i,this),t(o,this))}function r(e){var t=this;return null===this._state?void this._deferreds.push(e):void s(function(){var n=t._state?e.onFulfilled:e.onRejected;if(null===n)return void(t._state?e.resolve:e.reject)(t._value);var r;try{r=n(t._value)}catch(i){return void e.reject(i)}e.resolve(r)})}function i(e){try{if(e===this)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if("function"==typeof n)return void c(t(n,e),t(i,this),t(o,this))}this._state=!0,this._value=e,a.call(this)}catch(r){o.call(this,r)}}function o(e){this._state=!1,this._value=e,a.call(this)}function a(){for(var e=0,t=this._deferreds.length;t>e;e++)r.call(this,this._deferreds[e]);this._deferreds=null}function u(e,t,n,r){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r}function c(e,t,n){var r=!1;try{e(function(e){r||(r=!0,t(e))},function(e){r||(r=!0,n(e))})}catch(i){if(r)return;r=!0,n(i)}}var s=n.immediateFn||"function"==typeof setImmediate&&setImmediate||function(e){setTimeout(e,1)},l=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};n.prototype["catch"]=function(e){return this.then(null,e)},n.prototype.then=function(e,t){var i=this;return new n(function(n,o){r.call(i,new u(e,t,n,o))})},n.all=function(){var e=Array.prototype.slice.call(1===arguments.length&&l(arguments[0])?arguments[0]:arguments);return new n(function(t,n){function r(o,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var u=a.then;if("function"==typeof u)return void u.call(a,function(e){r(o,e)},n)}e[o]=a,0===--i&&t(e)}catch(c){n(c)}}if(0===e.length)return t([]);for(var i=e.length,o=0;o<e.length;o++)r(o,e[o])})},n.resolve=function(e){return e&&"object"==typeof e&&e.constructor===n?e:new n(function(t){t(e)})},n.reject=function(e){return new n(function(t,n){n(e)})},n.race=function(e){return new n(function(t,n){for(var r=0,i=e.length;i>r;r++)e[r].then(t,n)})},"undefined"!=typeof module&&module.exports?module.exports=n:e.Promise||(e.Promise=n)}(this),function(){"use strict";function e(e){try{return e.sentinel=0,0===Object.getOwnPropertyDescriptor(e,"sentinel").value}catch(t){return!1}}function t(e){if(!window.jQuery)throw new Error("must include jQuery on IE browser");return window.jQuery(e)}function n(e,t){function n(e){if("string"!=typeof e||!e)throw new Error("view id has wrong format")}if("string"!=typeof e||!t)throw new Error("template engine arg have wrong format");if(nt[e])throw new Error("template engine ["+e+"] is already registered");if("function"!=typeof t.render)throw new Error("could not found render method for engine: "+e);var r={};nt[e]={hasView:function(e){return n(e),!!r[e]},getView:function(e){return n(e),r[e]},addView:function(e,t){if(n(e),"string"!=typeof t)throw new Error("view content must be string");r[e]=t},renderView:function(i,o,a,u){n(i);var c=r[i];if(!c)throw new Error('could not found view "'+i+'" on engine '+e);return a.viewId=i,t.render(c,o,a,u)}}}function r(e){if(!nt[e])throw new Error("could not found the template engine: "+e);return nt[e]}function i(){return ot+=1}function o(e){var t=i();return rt[t]=e,it[t]=0,t}function a(e){return rt[e]}function u(e){e&&void 0!==rt[e]&&(delete rt[e],delete it[e])}function c(e){void 0!==it[e]&&(it[e]+=1)}function s(e){void 0!==it[e]&&(it[e]-=1,it[e]<=0&&u(e))}function l(e){var t,n={};return t=new Promise(function(t,r){n.name=e||"none",n.resolve=t,n.reject=r}),$.mixin(t,n),t}function d(){this.countOfProto=st,this.proto={},this.countOfModules=st,this.modules={},this.views={},this.promises={proto:l("proto"),modules:l("modules"),views:l("views")},this.promiseAll=Promise.all([this.promises.proto,this.promises.modules,this.promises.views]).then(function(){return this}),this.resolveViews()}function f(e,t){if(0===e)throw new Error("component declaration ["+t+"] is already registered")}function h(e,t){0===e&&t()}function p(e){if(e.status===lt.INITIALIZED)throw new Error("component "+e.name+" is already registered")}function m(e,t,n){$.each(n,function(n){t[n]&&(e[n]=t[n],t[n]=null)})}function v(e,t){function n(e){var t=e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase()});return"-"===t.charAt(0)?t.substr(1):t}function r(e){return e.length>o.length&&e.substr(e.length-o.length)===o}var i=e.watchers,o="Changed";$.each(t,function(e,t){if(r(t)&&"function"==typeof e){var a=n(t.substr(0,t.length-o.length));i[a]=t}})}function g(e,t){"string"==typeof t.template&&e.addView(t.template,"index"),"object"==typeof t.template&&$.each(t.template,function(t,n){e.addView(t,n)}),t.template=null}function y(e,t){t.style&&(e.style=t.style),t.style=null}function w(e,t){var n=e.elementProto;$.each(t,function(e,r){if(null!==e){var i=$.getDescriptor(t,r);"model"===r?n.model=t.model:$.contains(dt,r)?($.defineProperty(n.__flipper_lifecycle__,r,i),$.contains(ft,r)&&$.defineProperty(n,r,i)):$.defineProperty(n,r,i)}})}function _(e,t){return"function"==typeof e.__flipper_lifecycle__[t]}function b(e,t,n){return e.__flipper_lifecycle__[t].apply(e,n||[])}function C(e,t,n){return _(e,t)?b(e,t,n):void 0}function E(e,t){$.event.trigger(e,t);var n=e.__flipper_when__;n&&n[t]&&$.each(n[t],function(t){"function"==typeof t&&t.call(e)})}function N(e){function t(t){var n=e[t];return function(){n.call(e,this,arguments)}}var n=window.HTMLElement||window.Element,r=$.createObject(n.prototype);return r.__flipper_lifecycle__={},$.defineProperties(r,{model:{value:void 0,writable:!0},modelId:{value:"",writable:!0},getView:{value:e.getView.bind(e)},renderView:{value:function(t,n,r){return"object"==typeof t&&(r=n,n=t,t="index"),r=r||{},r.element=this,e.renderView(t,n,r)}},refresh:{value:function(t,n){function r(){return o?e.handleElement(a):i?e.fetchModel(a,i).then(function(){return e.renderNode(a)}):e.renderNode(a)}var i,o=!1;"function"==typeof t?n=t:t===!0?o=!0:"object"==typeof t&&(i=t),"function"!=typeof n&&(n=function(){});var a=this,u=e.renderComplete.bind(e,a),c=function(){$.event.trigger(a,"refresh")};return Promise.resolve().then(e.renderBegin.bind(e,a)).then(r).then(e.renderSuccess.bind(e,a)).then(n.bind(a))["catch"](e.renderFail.bind(e,a)).then(u,u).then(c)}},createdCallback:{value:t("createdCallback")},attachedCallback:{value:t("attachedCallback")},detachedCallback:{value:t("detachedCallback")},attributeChangedCallback:{value:t("attributeChangedCallback")}}),r}function I(e){this.name=e,this.status=lt.INITIALIZING,this.elementProto=N(this),this.definition=new d,this.templateEngine="default",this.injectionMode="light-dom",this.views={},this.style="",this.helpers={},this.watchers={},this.commands=null,this.definition.ready(this.initialize.bind(this),this.markFailed.bind(this))}function A(e,t){e=e.toLowerCase();var n=ht[e];n&&n.isReady()?t(n):(pt[e]||(pt[e]=[]),pt[e].push(t))}function S(e){var t=ht[e];if(t||(t=ht[e]=new Q.Component(e),t.on("initialized",function(){pt[e]&&($.each(pt[e],function(e){e(t)}),pt[e]=null)})),t.isReady())throw new Error("component "+t.name+" is already registered");return ht[e]}function T(){return document.baseURI}function L(e){var t=e.ownerDocument?e.ownerDocument.baseURI:"";return t||T()}function P(){return document._currentScript||document.currentScript}function j(){var e=P();return e?e.parentNode:void 0}function O(){var e,t=P(),n=j();return e=n&&n.tagName&&n.tagName.toLowerCase()===Q.configs.declarationTag?n.baseURI:t.src?t.src:t.baseURI||t.ownerDocument.baseURI,e||T()}function M(){var e=j();return e?e.getAttribute("name"):""}function k(e,t,n){return $.isArray(e)?(n=t,t=e,e=M()):"object"==typeof e||void 0===e?(n=e,t=void 0,e=M()):"string"!=typeof e||$.isArray(t)||(n=t,t=void 0),{name:e,dependencies:t,elementProto:n}}function x(e){function t(){var t=[];$.eachChildNodes(e,function(e){return e.tagName&&"link"===e.tagName.toLowerCase()&&"stylesheet"===e.getAttribute("rel")},function(e){t.push(e)}),$.each(t,function(t){var n=new URL(t.getAttribute("href"),r);i+='@import "'+n+'";',e.removeChild(t)})}function n(){var t=[];$.eachChildNodes(e,function(e){return e.tagName&&"style"===e.tagName.toLowerCase()},function(e){t.push(e)}),$.each(t,function(t){var n=t.innerHTML;i+=n,e.removeChild(t)})}var r=L(e),i="";return t(),n(),i}function R(e){if(!e.isReady()){var t=setTimeout(function(){if(!e.isReady())throw e.initialize(),new Error("component "+e.name+" is initialized automatically, forgot [noscript] attribute? ")},1e4);e.on("initialized",function(){clearTimeout(t)})}}function D(e,t){function n(e){u.mixinProto(i),u.mixinModules(e),t?(u.resolveProto(),u.resolveModules()):R(a)}var r=e.name,i=e.elementProto,o=e.dependencies;if(!r)throw new Error("component name could not be inferred.");var a=S(r),u=a.definition;if(!i)return void a.markFailed("component ["+r+"] prototype could not be inferred.");if(o){var c=O();$.each(o,function(e,t){"."===e.charAt(0)&&(e=$.resolveUri(e,c),o[t]=e)}),Q.require.check()?Q.require(o,{success:function(){n(arguments)},error:function(e){var t="error";e&&e.error&&e.error.exception&&(t=e.error.exception),a.markFailed(t)}}):a.markFailed("could not found the global module loader")}else n()}function F(e,t,n){var r=k(e,t,n),i=!0,o=j(),a=o?o.tagName.toLowerCase():"";a===Q.configs.declarationTag&&(i=!1),D(r,i)}function V(e){var t,n;t={definitionEle:e,style:x(e),templateEngine:e.getAttribute("template-engine"),injectionMode:e.getAttribute("injection-mode")},n={name:e.getAttribute("name"),dependencies:void 0,elementProto:t};var r=!1;e.hasAttribute("noscript")&&(r=!0),D(n,r)}function q(e){return e&&e.tagName&&$.isCustomTag(e.tagName)}function H(e){return $.isElement(e)&&$.isCustomTag(e.tagName)}function z(e){return Q.hasComponent(e.tagName)}function Z(e,t,n){function r(e){n.call(e,e.__error__||void 0)}function i(t){if($.debug(t,"has flag on bind",t.__flipper__),H(t))if(z(t))if(t.resolved){if("success"===e&&"success"!==t.__status__)return;if("error"===e&&"error"!==t.__status__)return;r(t)}else t.__flipper_when__||(t.__flipper_when__={}),t.__flipper_when__[e]||(t.__flipper_when__[e]=[]),t.__flipper_when__[e].push(r);else setTimeout(function(){z(t)?i(t):r(t)},1e3);else r(t)}if(void 0!==t&&null!==t&&("string"!=typeof t&&t.length||(t=[t]),"function"==typeof n))for(var o=0,a=t.length;a>o;o+=1)$.handleNode(t[o],i)}function U(){return Q}if(Object.defineProperty&&!document._currentScript){var B={get:function(){var e=document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return e},configurable:!0};Object.defineProperty(document,"_currentScript",B)}Function.prototype.bind||(Function.prototype.bind=function(e){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=Array.prototype.slice.call(arguments,1),n=this,r=function(){},i=function(){return n.apply(this instanceof r?this:e,t.concat(Array.prototype.slice.call(arguments)))};return r.prototype=this.prototype,i.prototype=new r,i});var G={templateEngine:"default",injectionMode:"light-dom",declarationTag:"web-component"},Q={version:"@@VERSION@@",configs:G,useNative:!!document.registerElement};Q.config=function(e,t){if("object"==typeof e&&1===arguments.length)$.mixin(G,e);else{if("string"!=typeof e||2!==arguments.length)throw new Error("unsupoorted config type. key: "+e+", value: "+t);G[e]=t}};var $={};$.noop=function(){},$.each=function(e,t){if($.isArray(e))for(var n=0,r=e.length;r>n;n+=1)t(e[n],n);else for(var i in e)e.hasOwnProperty(i)&&t(e[i],i)};var J=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;$.trim=function(e){return"string"==typeof e?e.trim?e.trim():e.replace(J,""):e},$.format=function(e){var t=0;e.replace(/%s/,function(){return t+=1,arguments[t]||""})},$.isArray=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},$.contains=function(e,t){if(e.lastIndexOf)return e.lastIndexOf(t)>-1;for(var n=0,r=e.length;r>n;n+=1)if(t===e[n])return!0;return!1},$.isPromise=function(e){return e&&"function"==typeof e.then},$.isElement=function(e){return!(!e||1!==e.nodeType)};var K=!1;$.debug=function(){if(K){var e=$.format.apply($,arguments);"function"==typeof console.log&&console.log(e)}},$.log=function(e){"function"==typeof console.log&&console.log(e)},$.error=function(e){console.error(e.stack||e)};var W=e({})&&e(document.createElement("div"));$.mixin=function(e,t){if(e)if(W)$.each(Object.getOwnPropertyNames(t),function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))});else for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},$.defineProperty=function(e,t,n){W?Object.defineProperty(e,t,n):e[t]=n.value},$.getDescriptor=function(e,t){return W?Object.getOwnPropertyDescriptor(e,t):{value:e[t]}},$.defineProperties=function(e,t){W?Object.defineProperties(e,t):$.each(t,function(t,n){$.defineProperty(e,n,t)})},$.createObject=Object.create&&W?Object.create:function(){var e=function(){};return function(t,n){if(arguments.length>1)throw Error("Second argument not supported");e.prototype=t;var r=new e;return e.prototype=null,n&&$.defineProperties(r,n),r}}(),$.resolveUri=function(e,t){var n=new URL(e,t);return n.href},$.isCustomTag=function(e){return e&&e.lastIndexOf("-")>=0},$.revertEscapedHTML=function(e){return e&&e.replace?e.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">"):e};var X=!!window.CustomEvent;if(X)try{new window.CustomEvent("xyz")}catch(Y){X=!1}var et=function(){function e(){var e=window.navigator.userAgent,t=e.indexOf("MSIE ");if(t>0)return parseInt(e.substring(t+5,e.indexOf(".",t)),10);var n=e.indexOf("Trident/");if(n>0){var r=e.indexOf("rv:");return parseInt(e.substring(r+3,e.indexOf(".",r)),10)}var i=e.indexOf("Edge/");return i>0?parseInt(e.substring(i+5,e.indexOf(".",i)),10):!1}return e()}();$.event={on:function(e,n,r){X&&!et?e.addEventListener(n,r,!1):t(e).on(n,r)},trigger:function(e,n){if(X&&!et){var r=new CustomEvent(n);e.dispatchEvent(r)}else t(e).trigger(n)},halt:function(e){e=e||window.event,e&&(e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,e.preventDefault?e.preventDefault():e.returnValue=!1)}},$.eachChildNodes=function(e,t,n){var r,i,o,a,u="function"==typeof t;if(e.childNodes)for(i=0,o=e.childNodes.length;o>i&&(r=e.childNodes[i],u&&!t(r)||(a=n(r),a!==!1));i+=1);},$.moveChildNodes=function(e,t){if(t.firstChild&&e.appendChild)for(;t.firstChild;)e.appendChild(t.firstChild)},$.replaceChildNodes=function(e,t){for(var n,r=!1,i=e;t.firstChild;)n=t.firstChild,r?i.parentNode.insertBefore(n,i.nextSibling):(e.parentNode.replaceChild(n,e),r=!0),i=n},$.matchSelector=function(){var e,n,r=document.createElement("div");return r.matches?e="matches":r.matchesSelector?e="matchesSelector":r.mozMatchesSelector?e="mozMatchesSelector":r.oMatchesSelector?e="oMatchesSelector":r.msMatchesSelector&&(e="msMatchesSelector"),n=e?function(t,n){return t[e](n)}:r.querySelectorAll?function(e,t){for(var n=(e.document||e.ownerDocument).querySelectorAll(t),r=0;n[r]&&n[r]!==e;)r+=1;return!!n[r]}:function(e,n){return t(e).is(n)}}(),$.handleNode=function(e,t){if(void 0!==e&&null!==e)if("string"==typeof e&&(e=$.query.all(e)),void 0!==e.length)for(var n=0,r=e.length;r>n;n+=1)t(e[n]);else t(e)},$.cloneNode=function(e){var t,n,r=e.tagName.toLowerCase();if(t=document.createElement(r),e.hasAttributes()){n=e.attributes;for(var i=0,o=n.length;o>i;i+=1)t.setAttribute(n[i].name,n[i].value)}return e.innerHTML&&e.innerHTML.length&&(t.innerHTML=e.innerHTML),t},$.query=function(e,n){return 1===arguments.length&&(n=e,e=document),e.querySelector?e.querySelector(n):t(e).find(n)[0]},$.query.all=function(e,t){if(1===arguments.length&&(t=e,e=document),e.querySelectorAll)return e.querySelectorAll(t);var n=[];return $.requestjQuery(e).find(t).each(function(){n.push(this)}),n};var tt={lookupContentNode:function mt(e,t){if(e&&e.childNodes){for(var n,r=e.firstChild;r;)n=r,r=n.nextSibling,1===n.nodeType&&("CONTENT"===n.tagName?t(n):n.childNodes&&n.childNodes.length&&mt(n,t));$.eachChildNodes(e,null,function(e){1===e.nodeType&&("CONTENT"===e.tagName?t(e):e.childNodes&&e.childNodes.length&&tt.lookupContentNode(e,t))})}},makeContentFragment:function(e){var t=document.createDocumentFragment();return $.moveChildNodes(t,e),t},handleContentReflect:function(e,t){tt.lookupContentNode(t,function(t){var n,r,i=t.getAttribute("select");i?($.eachChildNodes(e,function(e){return 1===e.nodeType&&$.matchSelector(e,i)},function(e){return r=e,!1}),r?t.hasAttribute("inner")?$.replaceChildNodes(t,r):t.parentNode.replaceChild(r,t):t.hasAttribute("default")?(n=document.createElement("div"),n.innerHTML=t.getAttribute("default"),$.replaceChildNodes(t,n)):t.parentNode.removeChild(t)):$.replaceChildNodes(t,e)})}},nt={};n("default",{render:function(e){return e}}),Q.registerTemplateEngine=n,Q.getTemplateEngine=r,Q.require=function(){window.require.apply(null,arguments)},Q.require.check=function(){return!!window.require};var rt={},it={},ot=0;Q.dataCenter={_warehouse:rt,requestSpace:o,removeSpace:u,getSpace:a,linkSpace:c,unlinkSpace:s},Q.requestSpace=o,Q.removeSpace=u;var at,ut={},ct={add:function(e,t){ut[e]||(at||(at=document.createElement("style"),(document.head||document.body).appendChild(at)),t&&t.length&&(at.textContent+=t),ut[e]=!0)}},st=2;d.prototype={ready:function(e,t){return this.promiseAll.then(e)["catch"](t)},mixinProto:function(e){function t(e){f(n.countOfProto,"element prototype"),$.mixin(n.proto,e),n.countOfProto-=1,h(n.countOfProto,n.resolveProto.bind(n))}var n=this;if("object"==typeof e)t(e);else{if("function"!=typeof e)throw new Error("element prototype has wrong format");n.promises.modules.then(function(n){var r=e.apply(null,n);t(r)})}},resolveProto:function(){this.promises.proto.resolve(this.proto)},mixinModules:function(e){var t=this;f(t.countOfModules,"element dependencies"),e&&(this.modules=e),this.countOfModules-=1,h(t.countOfModules,t.resolveModules.bind(t))},resolveModules:function(){this.promises.modules.resolve(this.modules)},rejectModules:function(e){this.promises.modules.reject(e)},resolveViews:function(){this.promises.views.resolve(this.views)}};var lt={ERROR:"ERROR",INITIALIZING:"INITIALIZING",INITIALIZED:"INITIALIZED"},dt=["initialize","fetch","adapt","render","ready","destroy","fail"],ft=["fetch","adapt","render"];I.prototype={on:function(e,t){this.__events__||(this.__events__={}),this.__events__[e]||(this.__events__[e]=[]),this.__events__[e].push(t)},fire:function(e,t){var n=this;this.__events__&&this.__events__[e]&&$.each(this.__events__[e],function(e){e.apply(n,t||[])})},isReady:function(){return this.status===lt.INITIALIZED},prepare:function(e){p(this),e&&(m(this,e,["templateEngine","injectionMode","definitionEle","helpers","commands"]),v(this,e),g(this,e),y(this,e),w(this,e))},initialize:function(){p(this),this.prepare(this.definition.proto),Q.useNative&&document.registerElement(this.name,{prototype:this.elementProto}),Q.useNative||document.createElement(this.name),this.status=lt.INITIALIZED,this.definition=null,this.fire("initialized")},transform:function(e,t){if(this.status===lt.INITIALIZING)this.on("initialized",function(){this.transform(e)});else if(this.status===lt.INITIALIZED&&!e.__flipper__){var n=$.cloneNode(e);n.__flipper_when__=e.__flipper_when__,e.parentNode.replaceChild(n,e),e=n,$.mixin(e,this.elementProto),e.createdCallback(),e.attachedCallback()}},markFailed:function(e){this.status=lt.ERROR,"string"==typeof e&&(e=new Error(e)),this.fire("initialized",[e]),$.error(e)},addView:function(e,t){this.views[t||"index"]=e+""},getView:function(e){e=e||"index";var t,n=function(n,r){if((n.id||"index")===e){if(t=n.innerHTML,!t&&n.content&&n.content.cloneNode){var i=document.createElement("div");i.appendChild(n.content.cloneNode(!0)),t=i.innerHTML}r&&(t=$.revertEscapedHTML(t))}return t?!1:void 0};return this.views[e]?t=this.views[e]:this.definitionEle&&($.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"template"===e.tagName.toLowerCase()},function(e){return n(e,!0)}),t||$.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"script"===e.tagName.toLowerCase()&&"template"===e.getAttribute("type")},function(e){return n(e,!1)}),t&&(this.views[e]=t)),t||"index"!==e||(t=" "),t||""},renderView:function(e,t,n){e=e||"index";var r,i,o=Q.getTemplateEngine(this.templateEngine),a=this.name+"-"+e;return o.hasView(a)||o.addView(a,this.getView(e)),r=n.element,i=this.commands,"function"==typeof i&&(i=i.call(r)),"object"==typeof i&&(n.commands?$.mixin(n.commands,i):n.commands=i),o.renderView(a,t,n,this)},createdCallback:function(e){$.debug(e,"is created");var t=this.renderComplete.bind(this,e);Promise.resolve().then(this.addLightDomStyle.bind(this,e)).then(this.renderBegin.bind(this,e)).then(this.initElement.bind(this,e)).then(this.handleElement.bind(this,e)).then(this.renderSuccess.bind(this,e))["catch"](this.renderFail.bind(this,e)).then(t,t)},renderBegin:function(e){$.debug(e,"render begin"),e.setAttribute("unresolved",""),e.__flipper__=!0,e.resolved&&(e.resolved=!1),$.debug(e,"has flipper flag",e.__flipper__)},initElement:function(e){return C(e,"initialize")},handleElement:function(e){return Promise.resolve().then(this.fetchModel.bind(this,e)).then(this.renderNode.bind(this,e))},fetchModel:function(e,t){var n,r;return e.hasAttribute("model-key")&&($.log('"model-key" is a test feature, do not use'),r=Q.dataCenter.requestSpace(window[e.getAttribute("model-key")]),e.hasAttribute("model-id")&&(Q.dataCenter.unlinkSpace(e.getAttribute("model-id")),e.removeAttribute("model-id")),e.setAttribute("model-id",r),e.removeAttribute("model-key")),t?(r="",n=t):_(e,"fetch")?(r="",n=b(e,"fetch")):e.hasAttribute("model-id")&&(r=e.getAttribute("model-id"),n=Q.dataCenter.getSpace(r)),!r&&e.hasAttribute("model-id")&&Q.dataCenter.unlinkSpace(e.getAttribute("model-id")),Promise.resolve(n).then(function(t){void 0!==t&&(e.model=t,r||(r=Q.dataCenter.requestSpace(t)),Q.dataCenter.linkSpace(r),e.modelId=r)})},renderNode:function(e){var t,n=this.formatModel(e);return t=_(e,"render")?b(e,"render",[n]):this.renderHTML(e,n),void 0!==t?Promise.resolve(t).then(this.createTree.bind(this,e)):Promise.resolve()},formatModel:function(e){return _(e,"adapt")?b(e,"adapt",[e.model]):e.model},renderHTML:function(e,t){var n="index";return this.renderView(n,t,{element:e})},isLightDom:function(){return"light-dom"===this.injectionMode||"ligth"},createTree:function(e,t){var n,r=this.isLightDom();r?(n=tt.makeContentFragment(e),e.innerHTML=t,tt.handleContentReflect(n,e)):e.createShadowRoot().innerHTML=t},addLightDomStyle:function(){this.isLightDom()&&ct.add(this.name,this.style)},addShadowDomStyle:function(e){if(!this.isLightDom()&&this.style&&this.style.length&&e.shadowRoot&&e.shadowRoot.innerHTML){var t=document.createElement("style");t.textContent=this.style,e.shadowRoot.appendChild(t)}},renderFail:function(e,t){$.debug(e,"render fail"),$.error(t);var n=C(e,"fail",[t]);return Q.useNative||Q.parse(e),Promise.resolve(n).then(function(){e.__status__="error",e.__error__=t,E(e,"error")})},renderSuccess:function(e){$.debug(e,"render success"),this.isLightDom()||this.addShadowDomStyle(e),Q.useNative||Q.parse(e),E(e,"rendered");var t=C(e,"ready");return Promise.resolve(t).then(function(){e.__status__="success",e.removeAttribute("unresolved"),E(e,"success")})},renderComplete:function(e){$.debug(e,"render complete"),e.resolved=!0,E(e,"ready"),e.__flipper_when___&&(e.__flipper_when__=null,delete e.__flipper_when__)},detachedCallback:function(e){this.destroy(e)},destroy:function(e){C(e,"destroy"),e.modelId&&(Q.dataCenter.unlinkSpace(e.modelId),e.modelId=void 0,e.model=void 0),$.event.trigger(e,"destroy")},attachedCallback:function(){},attributeChangedCallback:function(e,t){var n,r,i;"function"==typeof e.attributeChanged?e.attributeChanged.apply(e,t):(n=this.watchers,r=t[0],n[r]&&(i=e[n[r]],"function"==typeof i&&i.apply(e,Array.prototype.slice.call(t,1))))},setHelpers:function(e){this.helpers=e},getHelpers:function(){return this.helpers}},Q.Component=I;var ht={},pt={};Q.define=Q.register=F,Q.useNative&&document.registerElement(Q.configs.declarationTag,{prototype:$.createObject(HTMLElement.prototype,{createdCallback:{value:function(){V(this)}}})}),window.FlipperPolyfill&&window.FlipperPolyfill.flushDeclaration(Q.register.bind(Q)),Q.getComponent=function(e){return ht[e.toLowerCase()]},Q.hasComponent=function(e){return!!Q.getComponent(e)},Q.getComponentHelpers=function(e){var t=Q.getComponent(e);return t?t.getHelpers():{}},Q.components=ht,Q.init=function(e){function t(e){if(!q(e))return!1;if(e.initialized)return!1;if(e.initialing)return!1;var t=Q.getComponent(e.tagName);t&&t.isReady()?t.transform(e):(e.initialing=!0,A(e.tagName,function(t){t.transform(e,!0),delete e.initialing}))}return Q.useNative?!1:($.handleNode(e,t),!0)},Q.parse=function(e){return Q.useNative?!1:void $.handleNode(e,function(e){$.eachChildNodes(e,void 0,function(e){q(e)?Q.init(e):e.childNodes&&e.childNodes.length&&Q.parse(e)})})},Q.useNative||!function(){function e(e){(document.addEventListener||e&&"load"===e.type||"complete"===document.readyState)&&(t(),n=!0,Q.parse(document.body))}function t(){document.addEventListener?(document.removeEventListener("DOMContentLoaded",e,!1),window.removeEventListener("load",e,!1)):(document.detachEvent("onreadystatechange",e),window.detachEvent("onload",e))}var n=!1;if("complete"===document.readyState)setTimeout(e,1);else if(document.addEventListener)document.addEventListener("DOMContentLoaded",e,!1),window.addEventListener("load",e,!1);else if(document.attachEvent){document.attachEvent("onreadystatechange",e),window.attachEvent("onload",e);var r=!1;try{r=!window.frameElement&&document.documentElement}catch(i){}r&&r.doScroll&&!function o(){if(!n){try{r.doScroll("left")}catch(i){return setTimeout(o,50)}t(),e()}}()}}(),Q.findShadow=function(e,t){return $.query.all(e.shadowRoot,t)},Q.whenError=function(e,t){Z("error",e,t)},Q.whenSuccess=function(e,t){Z("success",e,t)},Q.whenReady=function(e,t){Z("ready",e,t)},Q.waitReady=function(e,t){return void 0!==e&&null!==e?("string"!=typeof e&&e.length||(e=[e]),new Promise(function(n,r){function i(){"function"==typeof t&&t(),n()}function o(){a-=1,0===a&&i()}var a=e.length;Q.whenSuccess(e,o),Q.whenError(e,r)})):void 0},window.Flipper=U()}();