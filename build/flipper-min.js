!function(){"use strict";function e(e,t){function n(e){if("string"!=typeof e||!e)throw new Error("view id has wrong format")}if("string"!=typeof e||!t)throw new Error("template engine arg have wrong format");if(Z[e])throw new Error("template engine ["+e+"] is already registered");if("function"!=typeof t.render)throw new Error("could not found render method for engine: "+e);var r={};Z[e]={hasView:function(e){return n(e),!!r[e]},getView:function(e){return n(e),r[e]},addView:function(e,t){if(n(e),"string"!=typeof t)throw new Error("view content must be string");r[e]=t},renderView:function(i,o,a){n(i);var c=r[i];if(!c)throw new Error('could not found view "'+i+'" on engine '+e);return a.viewId=i,t.render(c,o,a)}}}function t(e){if(!Z[e])throw new Error("could not found the template engine: "+e);return Z[e]}function n(){return G+=1}function r(e){var t=n();return W[t]=e,B[t]=0,t}function i(e){return W[e]}function o(e){e&&void 0!==W[e]&&(delete W[e],delete B[e])}function a(e){void 0!==B[e]&&(B[e]+=1)}function c(e){void 0!==B[e]&&(B[e]-=1,B[e]<=0&&o(e))}function s(e){var t,n={};return t=new Promise(function(t,r){n.name=e||"none",n.resolve=t,n.reject=r}),z.mixin(t,n),t}function u(){this.countOfProto=K,this.proto={},this.countOfModules=K,this.modules={},this.views={},this.promises={proto:s("proto"),modules:s("modules"),views:s("views")},this.promiseAll=Promise.all([this.promises.proto,this.promises.modules,this.promises.views]).then(function(){return this}),this.resolveViews()}function d(e,t){if(0===e)throw new Error("component declaration ["+t+"] is already registered")}function l(e,t){0===e&&t()}function f(e){if(e.status===Y.INITIALIZED)throw new Error("component "+e.name+" is already registered")}function h(e,t,n){n.forEach(function(n){t[n]&&(e[n]=t[n])})}function p(e,t){function n(e){var t=e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase()});return"-"===t.charAt(0)?t.substr(1):t}var r=e.watchers,i="Changed";Object.keys(t).forEach(function(e){if(e.endsWith(i)&&"function"==typeof t[e]){var o=n(e.substr(0,e.length-i.length));r[o]=e}})}function m(e,t){"string"==typeof t.template&&e.addView(t.template,"index"),"object"==typeof t.template&&Object.keys(t.template).forEach(function(n){e.addView(t.template[n],n)})}function v(e,t){t.style&&(e.style=t.style)}function g(e){console.error(e.stack||e)}function w(e,t){var n=e.elementProto;Object.getOwnPropertyNames(t).forEach(function(e){"model"===e?n.model=t.model:J.lastIndexOf(e)>-1?(Object.defineProperty(n._lifeCycle,e,Object.getOwnPropertyDescriptor(t,e)),Q.lastIndexOf(e)>-1&&Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))):Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))})}function y(e,t){return"function"==typeof e._lifeCycle[t]}function b(e,t,n){return e._lifeCycle[t].apply(e,n)}function E(e,t,n){return y(e,t)?b(e,t,n):void 0}function C(e){function t(t){var n=e[t];return function(){n.call(e,this,arguments)}}var n=Object.create(HTMLElement.prototype);return n._lifeCycle={},Object.defineProperties(n,{model:{value:void 0,writable:!0},modelId:{value:"",writable:!0},getView:{value:e.getView.bind(e)},renderView:{value:function(t,n,r){return"object"==typeof t&&(r=n,n=t,t="index"),r=r||{},r.element=this,e.renderView(t,n,r)}},refresh:{value:function(t,n){function r(){return o?e.handleElement(a):i?e.fetchModel(a,i).then(function(){return e.renderNode(a)}):e.renderNode(a)}var i,o=!1;"function"==typeof t?n=t:t===!0?o=!0:"object"==typeof t&&(i=t),"function"!=typeof n&&(n=function(){});var a=this;return Promise.resolve().then(e.renderBegin.bind(e,a)).then(r).then(e.renderEnd.bind(e,a)).then(n.bind(a))["catch"](e.renderFail.bind(e,a))}},createdCallback:{value:t("createdCallback")},attachedCallback:{value:t("attachedCallback")},detachedCallback:{value:t("detachedCallback")},attributeChangedCallback:{value:t("attributeChangedCallback")}}),n}function I(e){this.name=e,this.status=Y.INITIALIZING,this.elementProto=C(this),this.definition=new u,this.templateEngine="default",this.injectionMode="light-dom",this.model={},this.views={},this.style="",this.helpers={},this.watchers={},this.definition.ready(this.initialize.bind(this),this.markFailed.bind(this))}function O(e){var t=X[e];if(t||(t=X[e]=new U.Component(e)),t.isReady())throw new Error("component "+t.name+" is already registered");return X[e]}function P(){return document.baseURI}function N(e){var t=e.ownerDocument?e.ownerDocument.baseURI:"";return t||P()}function S(){return document._currentScript||document.currentScript}function j(){var e=S();return e?e.parentNode:void 0}function A(){var e=S();return e?e.baseURI||e.ownerDocument.baseURI:P()}function k(){var e=j();return e?e.getAttribute("name"):""}function M(e,t,n){return Array.isArray(e)?(n=t,t=e,e=k()):"object"==typeof e||void 0===e?(n=e,t=void 0,e=k()):"string"!=typeof e||Array.isArray(t)||(n=t,t=void 0),{name:e,dependencies:t,elementProto:n}}function R(e){function t(){var t=[];z.eachChildNodes(e,function(e){return e.tagName&&"link"===e.tagName.toLowerCase()&&"stylesheet"===e.getAttribute("rel")},function(e){t.push(e)}),t.forEach(function(t){var n=new URL(t.getAttribute("href"),r);i+='@import "'+n+'";',e.removeChild(t)})}function n(){var t=[];z.eachChildNodes(e,function(e){return e.tagName&&"style"===e.tagName.toLowerCase()},function(e){t.push(e)}),t.forEach(function(t){var n=t.innerHTML;i+=n,e.removeChild(t)})}var r=N(e),i="";return t(),n(),i}function T(e){if(!e.isReady()){var t=setTimeout(function(){if(!e.isReady())throw e.initialize(),new Error("component "+e.name+" is initialized automatically, forgot [noscript] attribute? ")},1e4);e.on("initialized",function(){clearTimeout(t)})}}function x(e,t){function n(e){c.mixinProto(i),c.mixinModules(e),t?(c.resolveProto(),c.resolveModules()):T(a)}var r=e.name,i=e.elementProto,o=e.dependencies;if(!r)throw new Error("component name could not be inferred.");var a=O(r),c=a.definition;if(!i)return void a.markFailed("component ["+r+"] prototype could not be inferred.");if(o){var s=A();o=o.map(function(e){return"."===e.charAt(0)?z.resolveUri(e,s):e}),U.require.check()?U.require(o,{success:function(){n(arguments)},error:function(e){var t="error";e&&e.error&&e.error.exception&&(t=e.error.exception),a.markFailed(t)}}):a.markFailed("could not found the global module loader")}else n()}function L(e,t,n){var r=M(e,t,n),i=!0,o=j(),a=o?o.tagName.toLowerCase():"";a===U.configs.declarationTag&&(i=!1),x(r,i)}function V(e){var t,n;t={definitionEle:e,style:R(e),templateEngine:e.getAttribute("template-engine"),injectionMode:e.getAttribute("injection-mode")},n={name:e.getAttribute("name"),dependencies:void 0,elementProto:t};var r=!1;e.hasAttribute("noscript")&&(r=!0),x(n,r)}function _(e,t){return-1!==e.indexOf(t,e.length-t.length)}function D(e){var t=/(\w+)\//.exec(e);return t?t[1]:""}function H(){return U}if(!document._currentScript){var F={get:function(){var e=document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return e},configurable:!0};Object.defineProperty(document,"_currentScript",F)}String.prototype.startsWith||Object.defineProperty(String.prototype,"startsWith",{enumerable:!1,configurable:!1,writable:!1,value:function(e,t){return t=t||0,this.lastIndexOf(e,t)===t}}),String.prototype.endsWith||Object.defineProperty(String.prototype,"endsWith",{enumerable:!1,configurable:!1,writable:!1,value:function(e,t){var n=this.toString();(void 0===t||t>n.length)&&(t=n.length),t-=e.length;var r=n.indexOf(e,t);return-1!==r&&r===t}});var q={templateEngine:"default",injectionMode:"light-dom",declarationTag:"web-component"},U={version:"@@VERSION@@",configs:q};U.config=function(e,t){if("object"==typeof e&&1===arguments.length)z.mixin(q,e);else{if("string"!=typeof e||2!==arguments.length)throw new Error("unsupoorted config type. key: "+e+", value: "+t);q[e]=t}};var z={};z.noop=function(){},z.format=function(e){var t=0;e.replace(/%s/,function(){return t+=1,arguments[t]||""})},z.isPromise=function(e){return e&&"function"==typeof e.then},z.mixin=function(e,t){Object.getOwnPropertyNames(t).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))})},z.log=function(){var e=z.format.apply(z,arguments);"function"==typeof console.log&&console.log(e)},z.resolveUri=function(e,t){var n=new URL(e,t);return n.href},z.eachChildNodes=function(e,t,n){var r,i,o,a="function"==typeof t;if(e.childNodes)for(i=0,o=e.childNodes.length;o>i;i+=1)r=e.childNodes[i],(!a||t(r))&&n(r)},U.utils=z;var Z={};e("default",{render:function(e){return e}}),U.registerTemplateEngine=e,U.getTemplateEngine=t,U.require=function(){window.require.apply(null,arguments)},U.require.check=function(){return!!window.require};var W={},B={},G=0;U.dataCenter={_warehouse:W,requestSpace:r,removeSpace:o,getSpace:i,linkSpace:a,unlinkSpace:c},U.requestSpace=r,U.removeSpace=o;var K=2;u.prototype={ready:function(e,t){return this.promiseAll.then(e,t)},mixinProto:function(e){function t(e){d(n.countOfProto,"element prototype"),z.mixin(n.proto,e),n.countOfProto-=1,l(n.countOfProto,n.resolveProto.bind(n))}var n=this;if("object"==typeof e)t(e);else{if("function"!=typeof e)throw new Error("element prototype has wrong format");n.promises.modules.then(function(n){var r=e.apply(null,n);t(r)})}},resolveProto:function(){this.promises.proto.resolve(this.proto)},mixinModules:function(e){var t=this;d(t.countOfModules,"element dependencies"),e&&(this.modules=e),this.countOfModules-=1,l(t.countOfModules,t.resolveModules.bind(t))},resolveModules:function(){this.promises.modules.resolve(this.modules)},rejectModules:function(e){this.promises.modules.reject(e)},resolveViews:function(){this.promises.views.resolve(this.views)}};var Y={ERROR:"ERROR",INITIALIZING:"INITIALIZING",INITIALIZED:"INITIALIZED"},J=["initialize","fetch","adapt","render","ready","destroy","fail"],Q=["fetch","adapt","render"];I.prototype={on:function(e,t){this._events||(this._events={}),this._events[e]||(this._events[e]=[]),this._events[e].push(t)},fire:function(e){this._events&&this._events[e]&&this._events[e].forEach(function(e){e()})},isReady:function(){return this.status===Y.INITIALIZED},prepare:function(e){f(this),e&&(w(this,e),h(this,e,["templateEngine","injectionMode","definitionEle","helpers"]),p(this,e),m(this,e),v(this,e))},initialize:function(){f(this),this.prepare(this.definition.proto),document.registerElement(this.name,{prototype:this.elementProto}),this.status=Y.INITIALIZED,this.definition=null,this.fire("initialized")},markFailed:function(e){if(this.status=Y.ERROR,"string"==typeof e&&(e=new Error(e)),this.fire("initialized",e),e)throw e},addView:function(e,t){this.views[t||"index"]=e+""},getView:function(e){var t;e=e||"index",this.views[e]&&(t=this.views[e]);var n=function(n){if((n.id||"index")===e&&(t=n.innerHTML,!t&&n.content&&n.content.cloneNode)){var r=document.createElement("div");r.appendChild(n.content.cloneNode(!0)),t=r.innerHTML}};return t||z.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"template"===e.tagName.toLowerCase()},function(e){return n(e)}),t||z.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"script"===e.tagName.toLowerCase()&&"template"===e.getAttribute("type")},function(e){return n(e)}),t||"index"!==e||(t=" "),t||""},renderView:function(e,t,n){e=e||"index";var r=U.getTemplateEngine(this.templateEngine),i=this.name+"-"+e;return r.hasView(i)||r.addView(i,this.getView(e)),r.renderView(i,t,n)},createdCallback:function(e){Promise.resolve().then(this.renderBegin.bind(this,e)).then(this.initElement.bind(this,e)).then(this.handleElement.bind(this,e)).then(this.renderEnd.bind(this,e))["catch"](this.renderFail.bind(this,e)).then(this.addStyle.bind(this,e))},renderBegin:function(e){e.setAttribute("unresolved","")},initElement:function(e){return E(e,"initialize")},handleElement:function(e){return Promise.resolve().then(this.fetchModel.bind(this,e)).then(this.renderNode.bind(this,e))},fetchModel:function(e,t){var n,r;return t?(r="",n=t):y(e,"fetch")?(r="",n=b(e,"fetch")):e.hasAttribute("model-id")&&(r=e.getAttribute("model-id"),n=U.dataCenter.getSpace(r)),Promise.resolve(n).then(function(t){void 0!==t&&(e.model=t,r||(r=U.dataCenter.requestSpace(t)),U.dataCenter.linkSpace(r),e.modelId=r)})},renderNode:function(e){return y(e,"render")?b(e,"render"):Promise.resolve().then(this.formatModel.bind(this,e)).then(this.renderHTML.bind(this,e)).then(this.createTree.bind(this,e))},formatModel:function(e){return y(e,"adapt")?b(e,"adapt",[e.model]):e.model},renderHTML:function(e,t){var n="index",r=e.commands;return"function"==typeof r&&(r=r.call(e)),this.renderView(n,t,{element:e,commands:r})},createTree:function(e,t){var n="light-dom"===this.injectionMode||"light",r=n?e:e.createShadowRoot();r.innerHTML=t},addStyle:function(e){var t=document.createElement("style");if(t.textContent=this.style,t.setAttribute("referance-to",this.name),e.shadowRoot&&e.shadowRoot.innerHTML)e.shadowRoot.appendChild(t);else{var n=document.querySelector('style[referance-to="'+this.name+'"]');n||(document.head||document.body).appendChild(t)}},renderFail:function(e,t){g(t);var n=E(e,"fail",[t]);return Promise.resolve(n).then(function(){var t=new CustomEvent("fail");e.dispatchEvent(t)})},renderEnd:function(e){var t=E(e,"ready");return Promise.resolve(t).then(function(){e.removeAttribute("unresolved");var t=new CustomEvent("ready");e.dispatchEvent(t)})},detachedCallback:function(e){this.destroy(e)},destroy:function(e){E(e,"destroy"),e.modelId&&(U.dataCenter.unlinkSpace(e.modelId),e.modelId=void 0,e.model=void 0)},attachedCallback:function(){},attributeChangedCallback:function(e,t){var n,r,i;"function"==typeof e.attributeChanged?e.attributeChanged.apply(e,t):(n=this.watchers,r=t[0],n[r]&&(i=e[n[r]],"function"==typeof i&&i.apply(e,Array.prototype.slice.call(t,1))))},setHelpers:function(e){this.helpers=e},getHelpers:function(){return this.helpers}},U.Component=I;var X={};U.define=U.register=L,document.registerElement(U.configs.declarationTag,{prototype:Object.create(HTMLElement.prototype,{createdCallback:{value:function(){V(this)}}})}),window.FlipperPolyfill&&window.FlipperPolyfill.flushDeclaration(U.register.bind(U)),U.getComponent=function(e){return X[e]},U.getComponentHelpers=function(e){var t=X[e];return t?t.getHelpers():{}},U.components=X;var $={};U.config=function(e,t){"packages"===e&&"object"==typeof t&&Object.keys(t).forEach(function(e){$[e]=t[e]})},U.imports=function(){var e=document.baseURI,t=Array.prototype.slice.call(arguments,0);if(t){var n=document.createDocumentFragment();t.map(function(t){var n=D(t);return n&&$[n]&&$[n].base&&(t=$[n].base+t.substr(n.length)),_(t,"/")&&(t+="index.html"),new URL(t,e).toString()}).forEach(function(e){var t=document.createElement("link");t.rel="import",t.href=e,n.appendChild(t)}),document.head.appendChild(n)}},U.findShadow=function(e,t){return e.shadowRoot.querySelectorAll(t)},window.KISSY&&"function"==typeof window.KISSY.add?KISSY.add(H):"function"==typeof window.define&&window.define.amd?window.define(H):window.Flipper=H()}();