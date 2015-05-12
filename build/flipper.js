!function(e){function t(e,t){return function(){e.apply(t,arguments)}}function n(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],c(e,t(i,this),t(o,this))}function r(e){var t=this;return null===this._state?void this._deferreds.push(e):void s(function(){var n=t._state?e.onFulfilled:e.onRejected;if(null===n)return void(t._state?e.resolve:e.reject)(t._value);var r;try{r=n(t._value)}catch(i){return void e.reject(i)}e.resolve(r)})}function i(e){try{if(e===this)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if("function"==typeof n)return void c(t(n,e),t(i,this),t(o,this))}this._state=!0,this._value=e,a.call(this)}catch(r){o.call(this,r)}}function o(e){this._state=!1,this._value=e,a.call(this)}function a(){for(var e=0,t=this._deferreds.length;t>e;e++)r.call(this,this._deferreds[e]);this._deferreds=null}function u(e,t,n,r){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r}function c(e,t,n){var r=!1;try{e(function(e){r||(r=!0,t(e))},function(e){r||(r=!0,n(e))})}catch(i){if(r)return;r=!0,n(i)}}var s=n.immediateFn||"function"==typeof setImmediate&&setImmediate||function(e){setTimeout(e,1)},l=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};n.prototype["catch"]=function(e){return this.then(null,e)},n.prototype.then=function(e,t){var i=this;return new n(function(n,o){r.call(i,new u(e,t,n,o))})},n.all=function(){var e=Array.prototype.slice.call(1===arguments.length&&l(arguments[0])?arguments[0]:arguments);return new n(function(t,n){function r(o,a){try{if(a&&("object"==typeof a||"function"==typeof a)){var u=a.then;if("function"==typeof u)return void u.call(a,function(e){r(o,e)},n)}e[o]=a,0===--i&&t(e)}catch(c){n(c)}}if(0===e.length)return t([]);for(var i=e.length,o=0;o<e.length;o++)r(o,e[o])})},n.resolve=function(e){return e&&"object"==typeof e&&e.constructor===n?e:new n(function(t){t(e)})},n.reject=function(e){return new n(function(t,n){n(e)})},n.race=function(e){return new n(function(t,n){for(var r=0,i=e.length;i>r;r++)e[r].then(t,n)})},"undefined"!=typeof module&&module.exports?module.exports=n:e.Promise||(e.Promise=n)}(this),function(){"use strict";function e(e){try{return e.sentinel=0,0===Object.getOwnPropertyDescriptor(e,"sentinel").value}catch(t){return!1}}function t(e){if(!window.jQuery)throw new Error("must include jQuery on IE browser");return window.jQuery(e)}function n(e,t){function n(e){if("string"!=typeof e||!e)throw new Error("view id has wrong format")}if("string"!=typeof e||!t)throw new Error("template engine arg have wrong format");if(W[e])throw new Error("template engine ["+e+"] is already registered");if("function"!=typeof t.render)throw new Error("could not found render method for engine: "+e);var r={};W[e]={hasView:function(e){return n(e),!!r[e]},getView:function(e){return n(e),r[e]},addView:function(e,t){if(n(e),"string"!=typeof t)throw new Error("view content must be string");r[e]=t},renderView:function(i,o,a){n(i);var u=r[i];if(!u)throw new Error('could not found view "'+i+'" on engine '+e);return a.viewId=i,t.render(u,o,a)}}}function r(e){if(!W[e])throw new Error("could not found the template engine: "+e);return W[e]}function i(){return tt+=1}function o(e){var t=i();return X[t]=e,et[t]=0,t}function a(e){return X[e]}function u(e){e&&void 0!==X[e]&&(delete X[e],delete et[e])}function c(e){void 0!==et[e]&&(et[e]+=1)}function s(e){void 0!==et[e]&&(et[e]-=1,et[e]<=0&&u(e))}function l(e){var t,n={};return t=new Promise(function(t,r){n.name=e||"none",n.resolve=t,n.reject=r}),B.mixin(t,n),t}function f(){this.countOfProto=nt,this.proto={},this.countOfModules=nt,this.modules={},this.views={},this.promises={proto:l("proto"),modules:l("modules"),views:l("views")},this.promiseAll=Promise.all([this.promises.proto,this.promises.modules,this.promises.views]).then(function(){return this}),this.resolveViews()}function d(e,t){if(0===e)throw new Error("component declaration ["+t+"] is already registered")}function h(e,t){0===e&&t()}function p(e){if(e.status===rt.INITIALIZED)throw new Error("component "+e.name+" is already registered")}function m(e,t,n){B.each(n,function(n){t[n]&&(e[n]=t[n])})}function v(e,t){function n(e){var t=e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase()});return"-"===t.charAt(0)?t.substr(1):t}function r(e){return e.substr(e.length-o.length)}var i=e.watchers,o="Changed";B.each(t,function(e,t){if(r(t)&&"function"==typeof e){var a=n(t.substr(0,t.length-o.length));i[a]=t}})}function g(e,t){"string"==typeof t.template&&e.addView(t.template,"index"),"object"==typeof t.template&&B.each(t.template,function(t,n){e.addView(t,n)})}function y(e,t){t.style&&(e.style=t.style)}function w(e,t){var n=e.elementProto;B.each(t,function(e,r){var i=B.getDescriptor(t,r);"model"===r?n.model=t.model:B.contains(it,r)?(B.defineProperty(n._lifeCycle,r,i),B.contains(ot,r)&&B.defineProperty(n,r,i)):B.defineProperty(n,r,i)})}function b(e,t){return"function"==typeof e._lifeCycle[t]}function _(e,t,n){return e._lifeCycle[t].apply(e,n)}function E(e,t,n){return b(e,t)?_(e,t,n):void 0}function I(e){function t(t){var n=e[t];return function(){n.call(e,this,arguments)}}var n=window.HTMLElement||window.Element,r=B.createObject(n.prototype);return r._lifeCycle={},B.defineProperties(r,{model:{value:void 0,writable:!0},modelId:{value:"",writable:!0},getView:{value:e.getView.bind(e)},renderView:{value:function(t,n,r){"object"==typeof t&&(r=n,n=t,t="index"),r=r||{},r.element=this;var i=this.commands;return"function"==typeof i&&(i=i.call(this)),"object"==typeof i&&(r.commands?B.mixin(r.commands,i):r.commands=i),e.renderView(t,n,r)}},refresh:{value:function(t,n){function r(){return o?e.handleElement(a):i?e.fetchModel(a,i).then(function(){return e.renderNode(a)}):e.renderNode(a)}var i,o=!1;"function"==typeof t?n=t:t===!0?o=!0:"object"==typeof t&&(i=t),"function"!=typeof n&&(n=function(){});var a=this,u=e.renderComplete.bind(e,a);return Promise.resolve().then(e.renderBegin.bind(e,a)).then(r).then(e.renderSuccess.bind(e,a)).then(n.bind(a))["catch"](e.renderFail.bind(e,a)).then(u,u)}},createdCallback:{value:t("createdCallback")},attachedCallback:{value:t("attachedCallback")},detachedCallback:{value:t("detachedCallback")},attributeChangedCallback:{value:t("attributeChangedCallback")}}),r}function C(e){this.name=e,this.status=rt.INITIALIZING,this.elementProto=I(this),this.definition=new f,this.templateEngine="default",this.injectionMode="light-dom",this.views={},this.style="",this.helpers={},this.watchers={},this.definition.ready(this.initialize.bind(this),this.markFailed.bind(this))}function N(e,t,n){e=e.toLowerCase();var r=at[e];r&&r.isReady()?n(r,t):(ut[e]||(ut[e]=[]),ut[e].push({node:t,callback:n}))}function P(e){var t=at[e];if(t||(t=at[e]=new U.Component(e),t.on("initialized",function(){ut[e]&&(B.each(ut[e],function(e){e.callback(t,e.node)}),ut[e]=null)})),t.isReady())throw new Error("component "+t.name+" is already registered");return at[e]}function A(){return document.baseURI}function j(e){var t=e.ownerDocument?e.ownerDocument.baseURI:"";return t||A()}function O(){return document._currentScript||document.currentScript}function S(){var e=O();return e?e.parentNode:void 0}function T(){var e=O();return e?e.baseURI||e.ownerDocument.baseURI:A()}function x(){var e=S();return e?e.getAttribute("name"):""}function k(e,t,n){return B.isArray(e)?(n=t,t=e,e=x()):"object"==typeof e||void 0===e?(n=e,t=void 0,e=x()):"string"!=typeof e||B.isArray(t)||(n=t,t=void 0),{name:e,dependencies:t,elementProto:n}}function M(e){function t(){var t=[];B.eachChildNodes(e,function(e){return e.tagName&&"link"===e.tagName.toLowerCase()&&"stylesheet"===e.getAttribute("rel")},function(e){t.push(e)}),B.each(t,function(t){var n=new URL(t.getAttribute("href"),r);i+='@import "'+n+'";',e.removeChild(t)})}function n(){var t=[];B.eachChildNodes(e,function(e){return e.tagName&&"style"===e.tagName.toLowerCase()},function(e){t.push(e)}),B.each(t,function(t){var n=t.innerHTML;i+=n,e.removeChild(t)})}var r=j(e),i="";return t(),n(),i}function L(e){if(!e.isReady()){var t=setTimeout(function(){if(!e.isReady())throw e.initialize(),new Error("component "+e.name+" is initialized automatically, forgot [noscript] attribute? ")},1e4);e.on("initialized",function(){clearTimeout(t)})}}function R(e,t){function n(e){u.mixinProto(i),u.mixinModules(e),t?(u.resolveProto(),u.resolveModules()):L(a)}var r=e.name,i=e.elementProto,o=e.dependencies;if(!r)throw new Error("component name could not be inferred.");var a=P(r),u=a.definition;if(!i)return void a.markFailed("component ["+r+"] prototype could not be inferred.");if(o){var c=T();o=o.map(function(e){return"."===e.charAt(0)?B.resolveUri(e,c):e}),U.require.check()?U.require(o,{success:function(){n(arguments)},error:function(e){var t="error";e&&e.error&&e.error.exception&&(t=e.error.exception),a.markFailed(t)}}):a.markFailed("could not found the global module loader")}else n()}function F(e,t,n){var r=k(e,t,n),i=!0,o=S(),a=o?o.tagName.toLowerCase():"";a===U.configs.declarationTag&&(i=!1),R(r,i)}function V(e){var t,n;t={definitionEle:e,style:M(e),templateEngine:e.getAttribute("template-engine"),injectionMode:e.getAttribute("injection-mode")},n={name:e.getAttribute("name"),dependencies:void 0,elementProto:t};var r=!1;e.hasAttribute("noscript")&&(r=!0),R(n,r)}function q(e){return e&&e.tagName&&B.isCustomTag(e.tagName)}function z(e){return"string"==typeof e?B.query(e):e}function D(){return U}if(!document._currentScript){var H={get:function(){var e=document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return e},configurable:!0};Object.defineProperty(document,"_currentScript",H)}Function.prototype.bind||(Function.prototype.bind=function(e){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=Array.prototype.slice.call(arguments,1),n=this,r=function(){},i=function(){return n.apply(this instanceof r?this:e,t.concat(Array.prototype.slice.call(arguments)))};return r.prototype=this.prototype,i.prototype=new r,i});var Z={templateEngine:"default",injectionMode:"light-dom",declarationTag:"web-component"},U={version:"@@VERSION@@",configs:Z,useNative:!!document.registerElement};U.config=function(e,t){if("object"==typeof e&&1===arguments.length)B.mixin(Z,e);else{if("string"!=typeof e||2!==arguments.length)throw new Error("unsupoorted config type. key: "+e+", value: "+t);Z[e]=t}};var B={};B.noop=function(){},B.each=function(e,t){if(B.isArray(e))for(var n=0,r=e.length;r>n;n+=1)t(e[n],n);else for(var i in e)e.hasOwnProperty(i)&&t(e[i],i)};var G=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;B.trim=function(e){return"string"==typeof e?e.trim?e.trim():e.replace(G,""):e},B.format=function(e){var t=0;e.replace(/%s/,function(){return t+=1,arguments[t]||""})},B.isArray=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},B.contains=function(e,t){if(e.lastIndexOf)return e.lastIndexOf(t)>-1;for(var n=0,r=e.length;r>n;n+=1)if(t===e[n])return!0;return!1},B.isPromise=function(e){return e&&"function"==typeof e.then},B.isElement=function(e){return!(!e||1!==e.nodeType)};var K=!1;B.debug=function(){if(K){var e=B.format.apply(B,arguments);"function"==typeof console.log&&console.log(e)}},B.log=function(){var e=B.format.apply(B,arguments);"function"==typeof console.log&&console.log(e)},B.error=function(e){console.error(e.stack||e)};var Q=e({})&&e(document.createElement("div"));B.mixin=function(e,t){if(e)if(Q)B.each(Object.getOwnPropertyNames(t),function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))});else for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},B.defineProperty=function(e,t,n){Q?Object.defineProperty(e,t,n):e[t]=n.value},B.getDescriptor=function(e,t){return Q?Object.getOwnPropertyDescriptor(e,t):{value:e[t]}},B.defineProperties=function(e,t){Q?Object.defineProperties(e,t):B.each(t,function(t,n){B.defineProperty(e,n,t)})},B.createObject=Object.create&&Q?Object.create:function(){var e=function(){};return function(t,n){if(arguments.length>1)throw Error("Second argument not supported");e.prototype=t;var r=new e;return e.prototype=null,n&&B.defineProperties(r,n),r}}(),B.resolveUri=function(e,t){var n=new URL(e,t);return n.href},B.eachChildNodes=function(e,t,n){var r,i,o,a="function"==typeof t;if(e.childNodes)for(i=0,o=e.childNodes.length;o>i;i+=1)r=e.childNodes[i],(!a||t(r))&&n(r)},B.isCustomTag=function(e){return e&&e.lastIndexOf("-")>=0};var Y=!!window.CustomEvent;if(Y)try{new CustomEvent("xyz")}catch($){Y=!1}var J=function(){function e(){var e=window.navigator.userAgent,t=e.indexOf("MSIE ");if(t>0)return parseInt(e.substring(t+5,e.indexOf(".",t)),10);var n=e.indexOf("Trident/");if(n>0){var r=e.indexOf("rv:");return parseInt(e.substring(r+3,e.indexOf(".",r)),10)}var i=e.indexOf("Edge/");return i>0?parseInt(e.substring(i+5,e.indexOf(".",i)),10):!1}return e()}();B.event={on:function(e,n,r){Y&&!J?e.addEventListener(n,r,!1):t(e).on(n,r)},trigger:function(e,n){if(Y&&!J){var r=new CustomEvent(n);e.dispatchEvent(r)}else t(e).trigger(n)},halt:function(e){e=e||window.event,e&&(e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,e.preventDefault?e.preventDefault():e.returnValue=!1)}},B.query=function(e,n){return 1===arguments.length&&(n=e,e=document),e.querySelector?e.querySelector(n):t(e).find(n)[0]},B.query.all=function(e,n){if(1===arguments.length&&(n=e,e=document),e.querySelectorAll)return e.querySelectorAll(n);var r=[];return t(e).find(n).each(function(){r.push(this)}),r};var W={};n("default",{render:function(e){return e}}),U.registerTemplateEngine=n,U.getTemplateEngine=r,U.require=function(){window.require.apply(null,arguments)},U.require.check=function(){return!!window.require};var X={},et={},tt=0;U.dataCenter={_warehouse:X,requestSpace:o,removeSpace:u,getSpace:a,linkSpace:c,unlinkSpace:s},U.requestSpace=o,U.removeSpace=u;var nt=2;f.prototype={ready:function(e,t){return this.promiseAll.then(e)["catch"](t)},mixinProto:function(e){function t(e){d(n.countOfProto,"element prototype"),B.mixin(n.proto,e),n.countOfProto-=1,h(n.countOfProto,n.resolveProto.bind(n))}var n=this;if("object"==typeof e)t(e);else{if("function"!=typeof e)throw new Error("element prototype has wrong format");n.promises.modules.then(function(n){var r=e.apply(null,n);t(r)})}},resolveProto:function(){this.promises.proto.resolve(this.proto)},mixinModules:function(e){var t=this;d(t.countOfModules,"element dependencies"),e&&(this.modules=e),this.countOfModules-=1,h(t.countOfModules,t.resolveModules.bind(t))},resolveModules:function(){this.promises.modules.resolve(this.modules)},rejectModules:function(e){this.promises.modules.reject(e)},resolveViews:function(){this.promises.views.resolve(this.views)}};var rt={ERROR:"ERROR",INITIALIZING:"INITIALIZING",INITIALIZED:"INITIALIZED"},it=["initialize","fetch","adapt","render","ready","destroy","fail"],ot=["fetch","adapt","render"];C.prototype={on:function(e,t){this.__events__||(this.__events__={}),this.__events__[e]||(this.__events__[e]=[]),this.__events__[e].push(t)},fire:function(e,t){var n=this;this.__events__&&this.__events__[e]&&B.each(this.__events__[e],function(e){e.apply(n,t||[])})},isReady:function(){return this.status===rt.INITIALIZED},prepare:function(e){p(this),e&&(w(this,e),m(this,e,["templateEngine","injectionMode","definitionEle","helpers"]),v(this,e),g(this,e),y(this,e))},initialize:function(){p(this),this.prepare(this.definition.proto),U.useNative&&document.registerElement(this.name,{prototype:this.elementProto}),this.status=rt.INITIALIZED,this.definition=null,this.fire("initialized")},transform:function(e){this.status===rt.INITIALIZING?this.on("initialized",function(){this.transform(e)}):this.status===rt.INITIALIZED&&(e.__flipper__||(B.mixin(e,this.elementProto),e.createdCallback(),e.attachedCallback()))},markFailed:function(e){this.status=rt.ERROR,"string"==typeof e&&(e=new Error(e)),this.fire("initialized",[e]),B.error(e)},addView:function(e,t){this.views[t||"index"]=e+""},getView:function(e){var t;e=e||"index",this.views[e]&&(t=this.views[e]);var n=function(n){if((n.id||"index")===e&&(t=n.innerHTML,!t&&n.content&&n.content.cloneNode)){var r=document.createElement("div");r.appendChild(n.content.cloneNode(!0)),t=r.innerHTML}};return!t&&this.definitionEle&&(B.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"template"===e.tagName.toLowerCase()},function(e){return n(e)}),t||B.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"script"===e.tagName.toLowerCase()&&"template"===e.getAttribute("type")},function(e){return n(e)})),t||"index"!==e||(t=" "),t||""},renderView:function(e,t,n){e=e||"index";var r=U.getTemplateEngine(this.templateEngine),i=this.name+"-"+e;return r.hasView(i)||r.addView(i,this.getView(e)),r.renderView(i,t,n)},createdCallback:function(e){B.debug(e,"is created");var t=this.renderComplete.bind(this,e);Promise.resolve().then(this.renderBegin.bind(this,e)).then(this.initElement.bind(this,e)).then(this.handleElement.bind(this,e)).then(this.renderSuccess.bind(this,e))["catch"](this.renderFail.bind(this,e)).then(this.addStyle.bind(this,e)).then(t,t)},renderBegin:function(e){B.debug(e,"render begin"),e.setAttribute("unresolved",""),e.__flipper__=!0,B.debug(e,"has flipper flag",e.__flipper__)},initElement:function(e){return E(e,"initialize")},handleElement:function(e){return Promise.resolve().then(this.fetchModel.bind(this,e)).then(this.renderNode.bind(this,e))},fetchModel:function(e,t){var n,r;return t?(r="",n=t):b(e,"fetch")?(r="",n=_(e,"fetch")):e.hasAttribute("model-id")&&(r=e.getAttribute("model-id"),n=U.dataCenter.getSpace(r)),Promise.resolve(n).then(function(t){void 0!==t&&(e.model=t,r||(r=U.dataCenter.requestSpace(t)),U.dataCenter.linkSpace(r),e.modelId=r)})},renderNode:function(e){return b(e,"render")?_(e,"render"):Promise.resolve().then(this.formatModel.bind(this,e)).then(this.renderHTML.bind(this,e)).then(this.createTree.bind(this,e))},formatModel:function(e){return b(e,"adapt")?_(e,"adapt",[e.model]):e.model},renderHTML:function(e,t){var n="index",r=e.commands;return"function"==typeof r&&(r=r.call(e)),this.renderView(n,t,{element:e,commands:r})},createTree:function(e,t){var n="light-dom"===this.injectionMode||"light",r=n?e:e.createShadowRoot();r.innerHTML=t},addStyle:function(e){var t=document.createElement("style");if(t.textContent=this.style,t.setAttribute("referance-to",this.name),e.shadowRoot&&e.shadowRoot.innerHTML)e.shadowRoot.appendChild(t);else{var n=B.query(e,'style[referance-to="'+this.name+'"]');n||(document.head||document.body).appendChild(t)}},renderFail:function(e,t){B.debug(e,"render fail"),B.error(t),e.status="fail";var n=E(e,"fail",[t]);return Promise.resolve(n).then(function(){B.event.trigger(e,"fail")})},renderSuccess:function(e){B.debug(e,"render success"),e.status="ready";var t=E(e,"ready");return Promise.resolve(t).then(function(){B.event.trigger(e,"ready")})},renderComplete:function(e){B.debug(e,"render complete"),e.removeAttribute("unresolved"),e.initialized=!0,B.event.trigger(e,"initialized"),U.useNative||U.parse(e)},detachedCallback:function(e){this.destroy(e)},destroy:function(e){E(e,"destroy"),e.modelId&&(U.dataCenter.unlinkSpace(e.modelId),e.modelId=void 0,e.model=void 0),B.event.trigger(e,"destroy")},attachedCallback:function(){},attributeChangedCallback:function(e,t){var n,r,i;"function"==typeof e.attributeChanged?e.attributeChanged.apply(e,t):(n=this.watchers,r=t[0],n[r]&&(i=e[n[r]],"function"==typeof i&&i.apply(e,Array.prototype.slice.call(t,1))))},setHelpers:function(e){this.helpers=e},getHelpers:function(){return this.helpers}},U.Component=C;var at={},ut={};U.define=U.register=F,U.useNative&&document.registerElement(U.configs.declarationTag,{prototype:B.createObject(HTMLElement.prototype,{createdCallback:{value:function(){V(this)}}})}),window.FlipperPolyfill&&window.FlipperPolyfill.flushDeclaration(U.register.bind(U)),U.getComponent=function(e){return at[e]},U.hasCompoent=function(e){return!!U.getComponent(e)},U.getComponentHelpers=function(e){var t=at[e];return t?t.getHelpers():{}},U.components=at,U.init=function(e){return U.useNative?!1:(e=z(e),q(e)?e.initialized?!1:(N(e.tagName,e,function(e,t){e.transform(t)}),!0):!1)},U.parse=function(e){return U.useNative?!1:(e=z(e),void B.eachChildNodes(e,void 0,function(e){q(e)?U.init(e):e.childNodes&&e.childNodes.length&&U.parse(e)}))},U.findShadow=function(e,t){return B.query.all(e.shadowRoot,t)},U.whenReady=function(e,t,n){function r(e,t){if(B.debug(e,"has flag on bind",e.__flipper__),e)if(e.initialized){if("ready"===t&&"ready"!==e.status)return;if("fail"===t&&"fail"!==e.status)return;n.call(e)}else B.event.on(e,t,function(t){t.target===e&&(B.event.halt(t),n.call(e))})}2===arguments.length&&(n=t,t=e,e="initialized"),B.isArray(t)||(t=[t]),"function"!=typeof n&&(n=B.noop),e=e.split(","),B.each(e,function(e){e=B.trim(e),B.each(t,function(t){if("string"==typeof t){if(t=B.query.all(document,t),t&&t.length)for(var n=0,i=t.length;i>n;n+=1)r(t[n],e)}else r(t,e)})})},window.KISSY&&"function"==typeof window.KISSY.add?window.KISSY.add(D):"function"==typeof window.define&&window.define&&window.define(D),window.Flipper=D()}();