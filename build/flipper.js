!function(e){function t(e,t){return function(){e.apply(t,arguments)}}function n(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],u(e,t(i,this),t(o,this))}function r(e){var t=this;return null===this._state?void this._deferreds.push(e):void s(function(){var n=t._state?e.onFulfilled:e.onRejected;if(null===n)return void(t._state?e.resolve:e.reject)(t._value);var r;try{r=n(t._value)}catch(i){return void e.reject(i)}e.resolve(r)})}function i(e){try{if(e===this)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if("function"==typeof n)return void u(t(n,e),t(i,this),t(o,this))}this._state=!0,this._value=e,a.call(this)}catch(r){o.call(this,r)}}function o(e){this._state=!1,this._value=e,a.call(this)}function a(){for(var e=0,t=this._deferreds.length;t>e;e++)r.call(this,this._deferreds[e]);this._deferreds=null}function c(e,t,n,r){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r}function u(e,t,n){var r=!1;try{e(function(e){r||(r=!0,t(e))},function(e){r||(r=!0,n(e))})}catch(i){if(r)return;r=!0,n(i)}}var s=n.immediateFn||"function"==typeof setImmediate&&setImmediate||function(e){setTimeout(e,1)},l=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};n.prototype["catch"]=function(e){return this.then(null,e)},n.prototype.then=function(e,t){var i=this;return new n(function(n,o){r.call(i,new c(e,t,n,o))})},n.all=function(){var e=Array.prototype.slice.call(1===arguments.length&&l(arguments[0])?arguments[0]:arguments);return new n(function(t,n){function r(o,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void c.call(a,function(e){r(o,e)},n)}e[o]=a,0===--i&&t(e)}catch(u){n(u)}}if(0===e.length)return t([]);for(var i=e.length,o=0;o<e.length;o++)r(o,e[o])})},n.resolve=function(e){return e&&"object"==typeof e&&e.constructor===n?e:new n(function(t){t(e)})},n.reject=function(e){return new n(function(t,n){n(e)})},n.race=function(e){return new n(function(t,n){for(var r=0,i=e.length;i>r;r++)e[r].then(t,n)})},"undefined"!=typeof module&&module.exports?module.exports=n:e.Promise||(e.Promise=n)}(this),function(){"use strict";function e(e){try{return e.sentinel=0,0===Object.getOwnPropertyDescriptor(e,"sentinel").value}catch(t){return!1}}function t(e){if(!window.jQuery)throw new Error("must include jQuery on IE browser");return window.jQuery(e)}function n(e,t){function n(e){if("string"!=typeof e||!e)throw new Error("view id has wrong format")}if("string"!=typeof e||!t)throw new Error("template engine arg have wrong format");if(et[e])throw new Error("template engine ["+e+"] is already registered");if("function"!=typeof t.render)throw new Error("could not found render method for engine: "+e);var r={};et[e]={hasView:function(e){return n(e),!!r[e]},getView:function(e){return n(e),r[e]},addView:function(e,t){if(n(e),"string"!=typeof t)throw new Error("view content must be string");r[e]=t},renderView:function(i,o,a){n(i);var c=r[i];if(!c)throw new Error('could not found view "'+i+'" on engine '+e);return a.viewId=i,t.render(c,o,a)}}}function r(e){if(!et[e])throw new Error("could not found the template engine: "+e);return et[e]}function i(){return rt+=1}function o(e){var t=i();return tt[t]=e,nt[t]=0,t}function a(e){return tt[e]}function c(e){e&&void 0!==tt[e]&&(delete tt[e],delete nt[e])}function u(e){void 0!==nt[e]&&(nt[e]+=1)}function s(e){void 0!==nt[e]&&(nt[e]-=1,nt[e]<=0&&c(e))}function l(e){var t,n={};return t=new Promise(function(t,r){n.name=e||"none",n.resolve=t,n.reject=r}),G.mixin(t,n),t}function d(){this.countOfProto=it,this.proto={},this.countOfModules=it,this.modules={},this.views={},this.promises={proto:l("proto"),modules:l("modules"),views:l("views")},this.promiseAll=Promise.all([this.promises.proto,this.promises.modules,this.promises.views]).then(function(){return this}),this.resolveViews()}function f(e,t){if(0===e)throw new Error("component declaration ["+t+"] is already registered")}function h(e,t){0===e&&t()}function p(e){if(e.status===ot.INITIALIZED)throw new Error("component "+e.name+" is already registered")}function m(e,t,n){G.each(n,function(n){t[n]&&(e[n]=t[n],t[n]=null)})}function v(e,t){function n(e){var t=e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase()});return"-"===t.charAt(0)?t.substr(1):t}function r(e){return e.substr(e.length-o.length)}var i=e.watchers,o="Changed";G.each(t,function(e,a){if(r(a)&&"function"==typeof e){var c=n(a.substr(0,a.length-o.length));i[c]=a,t[a]=null}})}function g(e,t){"string"==typeof t.template&&e.addView(t.template,"index"),"object"==typeof t.template&&G.each(t.template,function(t,n){e.addView(t,n)}),t.template&&(t.template=null)}function y(e,t){t.style&&(e.style=t.style,t.style=null)}function w(e,t){var n=e.elementProto;G.each(t,function(e,r){if(null!==e){var i=G.getDescriptor(t,r);"model"===r?n.model=t.model:G.contains(at,r)?(G.defineProperty(n.__flipper_lifecycle__,r,i),G.contains(ct,r)&&G.defineProperty(n,r,i)):G.defineProperty(n,r,i)}})}function b(e,t){return"function"==typeof e.__flipper_lifecycle__[t]}function _(e,t,n){return e.__flipper_lifecycle__[t].apply(e,n||[])}function C(e,t,n){return b(e,t)?_(e,t,n):void 0}function E(e,t){G.event.trigger(e,t);var n=e.__flipper_when__;n&&n[t]&&G.each(n[t],function(t){"function"==typeof t&&t.call(e)})}function N(e){function t(t){var n=e[t];return function(){n.call(e,this,arguments)}}var n=window.HTMLElement||window.Element,r=G.createObject(n.prototype);return r.__flipper_lifecycle__={},G.defineProperties(r,{model:{value:void 0,writable:!0},modelId:{value:"",writable:!0},getView:{value:e.getView.bind(e)},renderView:{value:function(t,n,r){"object"==typeof t&&(r=n,n=t,t="index"),r=r||{},r.element=this;var i=this.commands;return"function"==typeof i&&(i=i.call(this)),"object"==typeof i&&(r.commands?G.mixin(r.commands,i):r.commands=i),e.renderView(t,n,r)}},refresh:{value:function(t,n){function r(){return o?e.handleElement(a):i?e.fetchModel(a,i).then(function(){return e.renderNode(a)}):e.renderNode(a)}var i,o=!1;"function"==typeof t?n=t:t===!0?o=!0:"object"==typeof t&&(i=t),"function"!=typeof n&&(n=function(){});var a=this,c=e.renderComplete.bind(e,a),u=function(){G.event.trigger(a,"refresh")};return Promise.resolve().then(e.renderBegin.bind(e,a)).then(r).then(e.renderSuccess.bind(e,a)).then(n.bind(a))["catch"](e.renderFail.bind(e,a)).then(c,c).then(u)}},createdCallback:{value:t("createdCallback")},attachedCallback:{value:t("attachedCallback")},detachedCallback:{value:t("detachedCallback")},attributeChangedCallback:{value:t("attributeChangedCallback")}}),r}function I(e){this.name=e,this.status=ot.INITIALIZING,this.elementProto=N(this),this.definition=new d,this.templateEngine="default",this.injectionMode="light-dom",this.views={},this.style="",this.helpers={},this.watchers={},this.definition.ready(this.initialize.bind(this),this.markFailed.bind(this))}function A(e,t){e=e.toLowerCase();var n=ut[e];n&&n.isReady()?t(n):(st[e]||(st[e]=[]),st[e].push(t))}function T(e){var t=ut[e];if(t||(t=ut[e]=new B.Component(e),t.on("initialized",function(){st[e]&&(G.each(st[e],function(e){e(t)}),st[e]=null)})),t.isReady())throw new Error("component "+t.name+" is already registered");return ut[e]}function P(){return document.baseURI}function S(e){var t=e.ownerDocument?e.ownerDocument.baseURI:"";return t||P()}function L(){return document._currentScript||document.currentScript}function j(){var e=L();return e?e.parentNode:void 0}function O(){var e,t=L(),n=j();return e=n&&n.tagName&&n.tagName.toLowerCase()===B.configs.declarationTag?n.baseURI:t.src?t.src:t.baseURI||t.ownerDocument.baseURI,e||P()}function M(){var e=j();return e?e.getAttribute("name"):""}function x(e,t,n){return G.isArray(e)?(n=t,t=e,e=M()):"object"==typeof e||void 0===e?(n=e,t=void 0,e=M()):"string"!=typeof e||G.isArray(t)||(n=t,t=void 0),{name:e,dependencies:t,elementProto:n}}function k(e){function t(){var t=[];G.eachChildNodes(e,function(e){return e.tagName&&"link"===e.tagName.toLowerCase()&&"stylesheet"===e.getAttribute("rel")},function(e){t.push(e)}),G.each(t,function(t){var n=new URL(t.getAttribute("href"),r);i+='@import "'+n+'";',e.removeChild(t)})}function n(){var t=[];G.eachChildNodes(e,function(e){return e.tagName&&"style"===e.tagName.toLowerCase()},function(e){t.push(e)}),G.each(t,function(t){var n=t.innerHTML;i+=n,e.removeChild(t)})}var r=S(e),i="";return t(),n(),i}function R(e){if(!e.isReady()){var t=setTimeout(function(){if(!e.isReady())throw e.initialize(),new Error("component "+e.name+" is initialized automatically, forgot [noscript] attribute? ")},1e4);e.on("initialized",function(){clearTimeout(t)})}}function F(e,t){function n(e){c.mixinProto(i),c.mixinModules(e),t?(c.resolveProto(),c.resolveModules()):R(a)}var r=e.name,i=e.elementProto,o=e.dependencies;if(!r)throw new Error("component name could not be inferred.");var a=T(r),c=a.definition;if(!i)return void a.markFailed("component ["+r+"] prototype could not be inferred.");if(o){var u=O();G.each(o,function(e,t){"."===e.charAt(0)&&(e=G.resolveUri(e,u),o[t]=e)}),B.require.check()?B.require(o,{success:function(){n(arguments)},error:function(e){var t="error";e&&e.error&&e.error.exception&&(t=e.error.exception),a.markFailed(t)}}):a.markFailed("could not found the global module loader")}else n()}function V(e,t,n){var r=x(e,t,n),i=!0,o=j(),a=o?o.tagName.toLowerCase():"";a===B.configs.declarationTag&&(i=!1),F(r,i)}function q(e){var t,n;t={definitionEle:e,style:k(e),templateEngine:e.getAttribute("template-engine"),injectionMode:e.getAttribute("injection-mode")},n={name:e.getAttribute("name"),dependencies:void 0,elementProto:t};var r=!1;e.hasAttribute("noscript")&&(r=!0),F(n,r)}function D(e){return e&&e.tagName&&G.isCustomTag(e.tagName)}function H(e,t,n){function r(t){if(G.debug(t,"has flag on bind",t.__flipper__),t)if(t.initialized){if("success"===e&&"success"!==t.status)return;if("error"===e&&"error"!==t.status)return;n.call(t,t.reason||void 0)}else{t.__flipper_when__||(t.__flipper_when__={});var r=t.__flipper_when__;r[e]||(r[e]=[]),r[e].push(n)}}if(void 0!==t&&null!==t&&("string"!=typeof t&&t.length||(t=[t]),"function"==typeof n))for(var i=0,o=t.length;o>i;i+=1)G.handleNode(t[i],r)}function z(){return B}if(Object.defineProperty&&!document._currentScript){var Z={get:function(){var e=document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return e},configurable:!0};Object.defineProperty(document,"_currentScript",Z)}Function.prototype.bind||(Function.prototype.bind=function(e){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=Array.prototype.slice.call(arguments,1),n=this,r=function(){},i=function(){return n.apply(this instanceof r?this:e,t.concat(Array.prototype.slice.call(arguments)))};return r.prototype=this.prototype,i.prototype=new r,i});var U={templateEngine:"default",injectionMode:"light-dom",declarationTag:"web-component"},B={version:"@@VERSION@@",configs:U,useNative:!!document.registerElement};B.config=function(e,t){if("object"==typeof e&&1===arguments.length)G.mixin(U,e);else{if("string"!=typeof e||2!==arguments.length)throw new Error("unsupoorted config type. key: "+e+", value: "+t);U[e]=t}};var G={};G.noop=function(){},G.each=function(e,t){if(G.isArray(e))for(var n=0,r=e.length;r>n;n+=1)t(e[n],n);else for(var i in e)e.hasOwnProperty(i)&&t(e[i],i)};var Q=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;G.trim=function(e){return"string"==typeof e?e.trim?e.trim():e.replace(Q,""):e},G.format=function(e){var t=0;e.replace(/%s/,function(){return t+=1,arguments[t]||""})},G.isArray=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},G.contains=function(e,t){if(e.lastIndexOf)return e.lastIndexOf(t)>-1;for(var n=0,r=e.length;r>n;n+=1)if(t===e[n])return!0;return!1},G.isPromise=function(e){return e&&"function"==typeof e.then},G.isElement=function(e){return!(!e||1!==e.nodeType)};var $=!1;G.debug=function(){if($){var e=G.format.apply(G,arguments);"function"==typeof console.log&&console.log(e)}},G.log=function(){var e=G.format.apply(G,arguments);"function"==typeof console.log&&console.log(e)},G.error=function(e){console.error(e.stack||e)};var J=e({})&&e(document.createElement("div"));G.mixin=function(e,t){if(e)if(J)G.each(Object.getOwnPropertyNames(t),function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))});else for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},G.defineProperty=function(e,t,n){J?Object.defineProperty(e,t,n):e[t]=n.value},G.getDescriptor=function(e,t){return J?Object.getOwnPropertyDescriptor(e,t):{value:e[t]}},G.defineProperties=function(e,t){J?Object.defineProperties(e,t):G.each(t,function(t,n){G.defineProperty(e,n,t)})},G.createObject=Object.create&&J?Object.create:function(){var e=function(){};return function(t,n){if(arguments.length>1)throw Error("Second argument not supported");e.prototype=t;var r=new e;return e.prototype=null,n&&G.defineProperties(r,n),r}}(),G.resolveUri=function(e,t){var n=new URL(e,t);return n.href},G.isCustomTag=function(e){return e&&e.lastIndexOf("-")>=0},G.revertEscapedHTML=function(e){return e&&e.replace?e.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">"):e};var K=!!window.CustomEvent;if(K)try{new window.CustomEvent("xyz")}catch(W){K=!1}var X=function(){function e(){var e=window.navigator.userAgent,t=e.indexOf("MSIE ");if(t>0)return parseInt(e.substring(t+5,e.indexOf(".",t)),10);var n=e.indexOf("Trident/");if(n>0){var r=e.indexOf("rv:");return parseInt(e.substring(r+3,e.indexOf(".",r)),10)}var i=e.indexOf("Edge/");return i>0?parseInt(e.substring(i+5,e.indexOf(".",i)),10):!1}return e()}();G.event={on:function(e,n,r){K&&!X?e.addEventListener(n,r,!1):t(e).on(n,r)},trigger:function(e,n){if(K&&!X){var r=new CustomEvent(n);e.dispatchEvent(r)}else t(e).trigger(n)},halt:function(e){e=e||window.event,e&&(e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,e.preventDefault?e.preventDefault():e.returnValue=!1)}},G.eachChildNodes=function(e,t,n){var r,i,o,a,c="function"==typeof t;if(e.childNodes)for(i=0,o=e.childNodes.length;o>i&&(r=e.childNodes[i],c&&!t(r)||(a=n(r),a!==!1));i+=1);},G.moveChildNodes=function(e,t){if(t.firstChild&&e.appendChild)for(;t.firstChild;)e.appendChild(t.firstChild)},G.replaceChildNodes=function(e,t){for(var n,r=!1,i=e;t.firstChild;)n=t.firstChild,r?i.parentNode.insertBefore(n,i.nextSibling):(e.parentNode.replaceChild(n,e),r=!0),i=n},G.matchSelector=function(){var e,n,r=document.createElement("div");return r.matches?e="matches":r.matchesSelector?e="matchesSelector":r.mozMatchesSelector?e="mozMatchesSelector":r.oMatchesSelector?e="oMatchesSelector":r.msMatchesSelector&&(e="msMatchesSelector"),n=e?function(t,n){return t[e](n)}:r.querySelectorAll?function(e,t){for(var n=(e.document||e.ownerDocument).querySelectorAll(t),r=0;n[r]&&n[r]!==e;)r+=1;return!!n[r]}:function(e,n){return t(e).is(n)}}(),G.handleNode=function(e,t){if(void 0!==e&&null!==e)if("string"==typeof e&&(e=G.query.all(e)),void 0!==e.length)for(var n=0,r=e.length;r>n;n+=1)t(e[n]);else t(e)},G.cloneNode=function(e){var t,n,r=e.tagName.toLowerCase();if(t=document.createElement(r),e.hasAttributes()){n=e.attributes;for(var i=0,o=n.length;o>i;i+=1)t.setAttribute(n[i].name,n[i].value)}return e.innerHTML&&e.innerHTML.length&&(t.innerHTML=e.innerHTML),t},G.query=function(e,n){return 1===arguments.length&&(n=e,e=document),e.querySelector?e.querySelector(n):t(e).find(n)[0]},G.query.all=function(e,t){if(1===arguments.length&&(t=e,e=document),e.querySelectorAll)return e.querySelectorAll(t);var n=[];return G.requestjQuery(e).find(t).each(function(){n.push(this)}),n};var Y={lookupContentNode:function lt(e,t){if(e&&e.childNodes){for(var n,r=e.firstChild;r;)n=r,r=n.nextSibling,1===n.nodeType&&("CONTENT"===n.tagName?t(n):n.childNodes&&n.childNodes.length&&lt(n,t));G.eachChildNodes(e,null,function(e){1===e.nodeType&&("CONTENT"===e.tagName?t(e):e.childNodes&&e.childNodes.length&&Y.lookupContentNode(e,t))})}},makeContentFragment:function(e){var t=document.createDocumentFragment();return G.moveChildNodes(t,e),t},handleContentReflect:function(e,t){Y.lookupContentNode(t,function(t){var n,r,i=t.getAttribute("select");i?(G.eachChildNodes(e,function(e){return 1===e.nodeType&&G.matchSelector(e,i)},function(e){return r=e,!1}),r?t.hasAttribute("inner")?G.replaceChildNodes(t,r):t.parentNode.replaceChild(r,t):t.hasAttribute("default")?(n=document.createElement("div"),n.innerHTML=t.getAttribute("default"),G.replaceChildNodes(t,n)):t.parentNode.removeChild(t)):G.replaceChildNodes(t,e)})}},et={};n("default",{render:function(e){return e}}),B.registerTemplateEngine=n,B.getTemplateEngine=r,B.require=function(){window.require.apply(null,arguments)},B.require.check=function(){return!!window.require};var tt={},nt={},rt=0;B.dataCenter={_warehouse:tt,requestSpace:o,removeSpace:c,getSpace:a,linkSpace:u,unlinkSpace:s},B.requestSpace=o,B.removeSpace=c;var it=2;d.prototype={ready:function(e,t){return this.promiseAll.then(e)["catch"](t)},mixinProto:function(e){function t(e){f(n.countOfProto,"element prototype"),G.mixin(n.proto,e),n.countOfProto-=1,h(n.countOfProto,n.resolveProto.bind(n))}var n=this;if("object"==typeof e)t(e);else{if("function"!=typeof e)throw new Error("element prototype has wrong format");n.promises.modules.then(function(n){var r=e.apply(null,n);t(r)})}},resolveProto:function(){this.promises.proto.resolve(this.proto)},mixinModules:function(e){var t=this;f(t.countOfModules,"element dependencies"),e&&(this.modules=e),this.countOfModules-=1,h(t.countOfModules,t.resolveModules.bind(t))},resolveModules:function(){this.promises.modules.resolve(this.modules)},rejectModules:function(e){this.promises.modules.reject(e)},resolveViews:function(){this.promises.views.resolve(this.views)}};var ot={ERROR:"ERROR",INITIALIZING:"INITIALIZING",INITIALIZED:"INITIALIZED"},at=["initialize","fetch","adapt","render","ready","destroy","fail"],ct=["fetch","adapt","render"];I.prototype={on:function(e,t){this.__events__||(this.__events__={}),this.__events__[e]||(this.__events__[e]=[]),this.__events__[e].push(t)},fire:function(e,t){var n=this;this.__events__&&this.__events__[e]&&G.each(this.__events__[e],function(e){e.apply(n,t||[])})},isReady:function(){return this.status===ot.INITIALIZED},prepare:function(e){p(this),e&&(m(this,e,["templateEngine","injectionMode","definitionEle","helpers"]),v(this,e),g(this,e),y(this,e),w(this,e))},initialize:function(){p(this),this.prepare(this.definition.proto),B.useNative&&document.registerElement(this.name,{prototype:this.elementProto}),B.useNative||document.createElement(this.name),this.status=ot.INITIALIZED,this.definition=null,this.fire("initialized")},transform:function(e,t){if(this.status===ot.INITIALIZING)this.on("initialized",function(){this.transform(e)});else if(this.status===ot.INITIALIZED&&!e.__flipper__){var n=G.cloneNode(e);n.__flipper_when__=e.__flipper_when__,e.parentNode.replaceChild(n,e),e=n,G.mixin(e,this.elementProto),e.createdCallback(),e.attachedCallback()}},markFailed:function(e){this.status=ot.ERROR,"string"==typeof e&&(e=new Error(e)),this.fire("initialized",[e]),G.error(e)},addView:function(e,t){this.views[t||"index"]=e+""},getView:function(e){e=e||"index";var t,n=function(n,r){if((n.id||"index")===e){if(t=n.innerHTML,!t&&n.content&&n.content.cloneNode){var i=document.createElement("div");i.appendChild(n.content.cloneNode(!0)),t=i.innerHTML}r&&(t=G.revertEscapedHTML(t))}return t?!1:void 0};return this.views[e]?t=this.views[e]:this.definitionEle&&(G.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"template"===e.tagName.toLowerCase()},function(e){return n(e,!0)}),t||G.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"script"===e.tagName.toLowerCase()&&"template"===e.getAttribute("type")},function(e){return n(e,!1)}),t&&(this.views[e]=t)),t||"index"!==e||(t=" "),t||""},renderView:function(e,t,n){e=e||"index";var r=B.getTemplateEngine(this.templateEngine),i=this.name+"-"+e;return r.hasView(i)||r.addView(i,this.getView(e)),r.renderView(i,t,n)},createdCallback:function(e){G.debug(e,"is created");var t=this.renderComplete.bind(this,e);Promise.resolve().then(this.renderBegin.bind(this,e)).then(this.initElement.bind(this,e)).then(this.handleElement.bind(this,e)).then(this.renderSuccess.bind(this,e))["catch"](this.renderFail.bind(this,e)).then(this.addStyle.bind(this,e)).then(t,t)},renderBegin:function(e){G.debug(e,"render begin"),e.setAttribute("unresolved",""),e.__flipper__=!0,G.debug(e,"has flipper flag",e.__flipper__)},initElement:function(e){return C(e,"initialize")},handleElement:function(e){return Promise.resolve().then(this.fetchModel.bind(this,e)).then(this.renderNode.bind(this,e))},fetchModel:function(e,t){var n,r;return t?(r="",n=t):b(e,"fetch")?(r="",n=_(e,"fetch")):e.hasAttribute("model-id")&&(r=e.getAttribute("model-id"),n=B.dataCenter.getSpace(r)),Promise.resolve(n).then(function(t){void 0!==t&&(e.model=t,r||(r=B.dataCenter.requestSpace(t)),B.dataCenter.linkSpace(r),e.modelId=r)})},renderNode:function(e){return b(e,"render")?_(e,"render"):Promise.resolve().then(this.formatModel.bind(this,e)).then(this.renderHTML.bind(this,e)).then(this.createTree.bind(this,e))},formatModel:function(e){return b(e,"adapt")?_(e,"adapt",[e.model]):e.model},renderHTML:function(e,t){var n="index",r=e.commands;return"function"==typeof r&&(r=r.call(e)),this.renderView(n,t,{element:e,commands:r})},createTree:function(e,t){var n,r="light-dom"===this.injectionMode||"light";r?(n=Y.makeContentFragment(e),e.innerHTML=t,Y.handleContentReflect(n,e)):e.createShadowRoot().innerHTML=t},addStyle:function(e){if(this.style&&this.style.length){var t;if(e.shadowRoot&&e.shadowRoot.innerHTML)t=document.createElement("style"),t.textContent=this.style,e.shadowRoot.appendChild(t);else{var n=G.query('style[referance-to="'+this.name+'"]');n||(t=document.createElement("style"),t.textContent=this.style,t.setAttribute("referance-to",this.name),(document.head||document.body).appendChild(t))}}},renderFail:function(e,t){G.debug(e,"render fail"),G.error(t);var n=C(e,"fail",[t]);return B.useNative||B.parse(e),Promise.resolve(n).then(function(){e.status="error",e.reason=t,E(e,"error")})},renderSuccess:function(e){G.debug(e,"render success"),B.useNative||B.parse(e);var t=C(e,"ready");return Promise.resolve(t).then(function(){e.status="success",e.removeAttribute("unresolved"),E(e,"success")})},renderComplete:function(e){G.debug(e,"render complete"),e.initialized=!0,E(e,"ready"),e.__flipper_when___&&(e.__flipper_when__=null,delete e.__flipper_when__)},detachedCallback:function(e){this.destroy(e)},destroy:function(e){C(e,"destroy"),e.modelId&&(B.dataCenter.unlinkSpace(e.modelId),e.modelId=void 0,e.model=void 0),G.event.trigger(e,"destroy")},attachedCallback:function(){},attributeChangedCallback:function(e,t){var n,r,i;"function"==typeof e.attributeChanged?e.attributeChanged.apply(e,t):(n=this.watchers,r=t[0],n[r]&&(i=e[n[r]],"function"==typeof i&&i.apply(e,Array.prototype.slice.call(t,1))))},setHelpers:function(e){this.helpers=e},getHelpers:function(){return this.helpers}},B.Component=I;var ut={},st={};B.define=B.register=V,B.useNative&&document.registerElement(B.configs.declarationTag,{prototype:G.createObject(HTMLElement.prototype,{createdCallback:{value:function(){q(this)}}})}),window.FlipperPolyfill&&window.FlipperPolyfill.flushDeclaration(B.register.bind(B)),B.getComponent=function(e){return ut[e.toLowerCase()]},B.hasComponent=function(e){return!!B.getComponent(e)},B.getComponentHelpers=function(e){var t=B.getComponent(e);return t?t.getHelpers():{}},B.components=ut,B.init=function(e){function t(e){if(!D(e))return!1;if(e.initialized)return!1;if(e.initialing)return!1;var t=B.getComponent(e.tagName);t&&t.isReady()?t.transform(e):(e.initialing=!0,A(e.tagName,function(t){t.transform(e,!0),delete e.initialing}))}return B.useNative?!1:(G.handleNode(e,t),!0)},B.parse=function(e){return B.useNative?!1:void G.handleNode(e,function(e){G.eachChildNodes(e,void 0,function(e){D(e)?B.init(e):e.childNodes&&e.childNodes.length&&B.parse(e)})})},B.useNative||!function(){function e(e){(document.addEventListener||e&&"load"===e.type||"complete"===document.readyState)&&(t(),n=!0,B.parse(document.body))}function t(){document.addEventListener?(document.removeEventListener("DOMContentLoaded",e,!1),window.removeEventListener("load",e,!1)):(document.detachEvent("onreadystatechange",e),window.detachEvent("onload",e))}var n=!1;if("complete"===document.readyState)setTimeout(e,1);else if(document.addEventListener)document.addEventListener("DOMContentLoaded",e,!1),window.addEventListener("load",e,!1);else if(document.attachEvent){document.attachEvent("onreadystatechange",e),window.attachEvent("onload",e);var r=!1;try{r=!window.frameElement&&document.documentElement}catch(i){}r&&r.doScroll&&!function o(){if(!n){try{r.doScroll("left")}catch(i){return setTimeout(o,50)}t(),e()}}()}}(),B.findShadow=function(e,t){return G.query.all(e.shadowRoot,t)},B.whenError=function(e,t){H("error",e,t)},B.whenSuccess=function(e,t){H("success",e,t)},B.whenReady=function(e,t){H("ready",e,t)},window.Flipper=z()}();