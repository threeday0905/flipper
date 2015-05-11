!function(){"use strict";function e(e){try{return e.sentinel=0,0===Object.getOwnPropertyDescriptor(e,"sentinel").value}catch(t){return!1}}function t(e){if(!window.jQuery)throw new Error("must include jQuery on IE browser");return window.jQuery(e)}function n(e,t){function n(e){if("string"!=typeof e||!e)throw new Error("view id has wrong format")}if("string"!=typeof e||!t)throw new Error("template engine arg have wrong format");if(G[e])throw new Error("template engine ["+e+"] is already registered");if("function"!=typeof t.render)throw new Error("could not found render method for engine: "+e);var r={};G[e]={hasView:function(e){return n(e),!!r[e]},getView:function(e){return n(e),r[e]},addView:function(e,t){if(n(e),"string"!=typeof t)throw new Error("view content must be string");r[e]=t},renderView:function(i,o,a){n(i);var c=r[i];if(!c)throw new Error('could not found view "'+i+'" on engine '+e);return a.viewId=i,t.render(c,o,a)}}}function r(e){if(!G[e])throw new Error("could not found the template engine: "+e);return G[e]}function i(){return Y+=1}function o(e){var t=i();return K[t]=e,Q[t]=0,t}function a(e){return K[e]}function c(e){e&&void 0!==K[e]&&(delete K[e],delete Q[e])}function u(e){void 0!==Q[e]&&(Q[e]+=1)}function s(e){void 0!==Q[e]&&(Q[e]-=1,Q[e]<=0&&c(e))}function d(e){var t,n={};return t=new Promise(function(t,r){n.name=e||"none",n.resolve=t,n.reject=r}),H.mixin(t,n),t}function l(){this.countOfProto=$,this.proto={},this.countOfModules=$,this.modules={},this.views={},this.promises={proto:d("proto"),modules:d("modules"),views:d("views")},this.promiseAll=Promise.all([this.promises.proto,this.promises.modules,this.promises.views]).then(function(){return this}),this.resolveViews()}function f(e,t){if(0===e)throw new Error("component declaration ["+t+"] is already registered")}function h(e,t){0===e&&t()}function p(e){if(e.status===J.INITIALIZED)throw new Error("component "+e.name+" is already registered")}function m(e,t,n){H.each(n,function(n){t[n]&&(e[n]=t[n])})}function v(e,t){function n(e){var t=e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase()});return"-"===t.charAt(0)?t.substr(1):t}function r(e){return e.substr(e.length-o.length)}var i=e.watchers,o="Changed";H.each(t,function(e,t){if(r(t)&&"function"==typeof e){var a=n(t.substr(0,t.length-o.length));i[a]=t}})}function g(e,t){"string"==typeof t.template&&e.addView(t.template,"index"),"object"==typeof t.template&&H.each(t.template,function(t,n){e.addView(t,n)})}function y(e,t){t.style&&(e.style=t.style)}function w(e,t){var n=e.elementProto;H.each(t,function(e,r){var i=H.getDescriptor(t,r);"model"===r?n.model=t.model:W.lastIndexOf(r)>-1?(H.defineProperty(n._lifeCycle,r,i),X.lastIndexOf(r)>-1&&H.defineProperty(n,r,i)):H.defineProperty(n,r,i)})}function b(e,t){return"function"==typeof e._lifeCycle[t]}function E(e,t,n){return e._lifeCycle[t].apply(e,n)}function C(e,t,n){return b(e,t)?E(e,t,n):void 0}function I(e){function t(t){var n=e[t];return function(){n.call(e,this,arguments)}}var n=H.createObject(HTMLElement.prototype);return n._lifeCycle={},H.defineProperties(n,{model:{value:void 0,writable:!0},modelId:{value:"",writable:!0},getView:{value:e.getView.bind(e)},renderView:{value:function(t,n,r){"object"==typeof t&&(r=n,n=t,t="index"),r=r||{},r.element=this;var i=this.commands;return"function"==typeof i&&(i=i.call(this)),"object"==typeof i&&(r.commands?H.mixin(r.commands,i):r.commands=i),e.renderView(t,n,r)}},refresh:{value:function(t,n){function r(){return o?e.handleElement(a):i?e.fetchModel(a,i).then(function(){return e.renderNode(a)}):e.renderNode(a)}var i,o=!1;"function"==typeof t?n=t:t===!0?o=!0:"object"==typeof t&&(i=t),"function"!=typeof n&&(n=function(){});var a=this,c=e.renderComplete.bind(e,a);return Promise.resolve().then(e.renderBegin.bind(e,a)).then(r).then(e.renderSuccess.bind(e,a)).then(n.bind(a))["catch"](e.renderFail.bind(e,a)).then(c,c)}},createdCallback:{value:t("createdCallback")},attachedCallback:{value:t("attachedCallback")},detachedCallback:{value:t("detachedCallback")},attributeChangedCallback:{value:t("attributeChangedCallback")}}),n}function P(e){this.name=e,this.status=J.INITIALIZING,this.elementProto=I(this),this.definition=new l,this.templateEngine="default",this.injectionMode="light-dom",this.views={},this.style="",this.helpers={},this.watchers={},this.definition.ready(this.initialize.bind(this),this.markFailed.bind(this))}function A(e){var t=et[e];if(t||(t=et[e]=new D.Component(e),t.on("initialized",function(){tt[e]&&H.each(tt[e],function(e){e.callback(t,e.node)})})),t.isReady())throw new Error("component "+t.name+" is already registered");return et[e]}function N(){return document.baseURI}function S(e){var t=e.ownerDocument?e.ownerDocument.baseURI:"";return t||N()}function O(){return document._currentScript||document.currentScript}function j(){var e=O();return e?e.parentNode:void 0}function _(){var e=O();return e?e.baseURI||e.ownerDocument.baseURI:N()}function T(){var e=j();return e?e.getAttribute("name"):""}function k(e,t,n){return H.isArray(e)?(n=t,t=e,e=T()):"object"==typeof e||void 0===e?(n=e,t=void 0,e=T()):"string"!=typeof e||H.isArray(t)||(n=t,t=void 0),{name:e,dependencies:t,elementProto:n}}function M(e){function t(){var t=[];H.eachChildNodes(e,function(e){return e.tagName&&"link"===e.tagName.toLowerCase()&&"stylesheet"===e.getAttribute("rel")},function(e){t.push(e)}),H.each(t,function(t){var n=new URL(t.getAttribute("href"),r);i+='@import "'+n+'";',e.removeChild(t)})}function n(){var t=[];H.eachChildNodes(e,function(e){return e.tagName&&"style"===e.tagName.toLowerCase()},function(e){t.push(e)}),H.each(t,function(t){var n=t.innerHTML;i+=n,e.removeChild(t)})}var r=S(e),i="";return t(),n(),i}function L(e){if(!e.isReady()){var t=setTimeout(function(){if(!e.isReady())throw e.initialize(),new Error("component "+e.name+" is initialized automatically, forgot [noscript] attribute? ")},1e4);e.on("initialized",function(){clearTimeout(t)})}}function x(e,t){function n(e){c.mixinProto(i),c.mixinModules(e),t?(c.resolveProto(),c.resolveModules()):L(a)}var r=e.name,i=e.elementProto,o=e.dependencies;if(!r)throw new Error("component name could not be inferred.");var a=A(r),c=a.definition;if(!i)return void a.markFailed("component ["+r+"] prototype could not be inferred.");if(o){var u=_();o=o.map(function(e){return"."===e.charAt(0)?H.resolveUri(e,u):e}),D.require.check()?D.require(o,{success:function(){n(arguments)},error:function(e){var t="error";e&&e.error&&e.error.exception&&(t=e.error.exception),a.markFailed(t)}}):a.markFailed("could not found the global module loader")}else n()}function R(e,t,n){var r=k(e,t,n),i=!0,o=j(),a=o?o.tagName.toLowerCase():"";a===D.configs.declarationTag&&(i=!1),x(r,i)}function V(e){var t,n;t={definitionEle:e,style:M(e),templateEngine:e.getAttribute("template-engine"),injectionMode:e.getAttribute("injection-mode")},n={name:e.getAttribute("name"),dependencies:void 0,elementProto:t};var r=!1;e.hasAttribute("noscript")&&(r=!0),x(n,r)}function F(){return D}if(!document._currentScript){var q={get:function(){var e=document.currentScript||("complete"!==document.readyState?document.scripts[document.scripts.length-1]:null);return e},configurable:!0};Object.defineProperty(document,"_currentScript",q)}Function.prototype.bind||(Function.prototype.bind=function(e){if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var t=Array.prototype.slice.call(arguments,1),n=this,r=function(){},i=function(){return n.apply(this instanceof r?this:e,t.concat(Array.prototype.slice.call(arguments)))};return r.prototype=this.prototype,i.prototype=new r,i});var z={templateEngine:"default",injectionMode:"light-dom",declarationTag:"web-component"},D={version:"@@VERSION@@",configs:z};D.config=function(e,t){if("object"==typeof e&&1===arguments.length)H.mixin(z,e);else{if("string"!=typeof e||2!==arguments.length)throw new Error("unsupoorted config type. key: "+e+", value: "+t);z[e]=t}};var H={};H.noop=function(){},H.each=function(e,t){if(H.isArray(e))for(var n=0,r=e.length;r>n;n+=1)t(e[n],n);else for(var i in e)e.hasOwnProperty(i)&&t(e[i],i)};var Z=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;H.trim=function(e){return"string"==typeof e?e.trim?e.trim():e.replace(Z,""):e},H.format=function(e){var t=0;e.replace(/%s/,function(){return t+=1,arguments[t]||""})},H.isArray=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},H.isPromise=function(e){return e&&"function"==typeof e.then},H.isElement=function(e){return!(!e||1!==e.nodeType)};var U=!1;H.debug=function(){if(U){var e=H.format.apply(H,arguments);"function"==typeof console.log&&console.log(e)}},H.log=function(){var e=H.format.apply(H,arguments);"function"==typeof console.log&&console.log(e)},H.error=function(e){console.error(e.stack||e)};var B=e({})&&e(document.createElement("div"));H.mixin=function(e,t){if(e)if(B)H.each(Object.getOwnPropertyNames(t),function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))});else for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},H.defineProperty=function(e,t,n){B?Object.defineProperty(e,t,n):e[t]=n.value},H.getDescriptor=function(e,t){return B?Object.getOwnPropertyDescriptor(e,t):{value:e[t]}},H.defineProperties=function(e,t){B?Object.defineProperties(e,t):H.each(t,function(t,n){H.defineProperty(e,n,t)})},H.createObject=Object.create&&B?Object.create:function(){var e=function(){};return function(t,n){if(arguments.length>1)throw Error("Second argument not supported");e.prototype=t;var r=new e;return e.prototype=null,n&&H.defineProperties(r,n),r}}(),H.resolveUri=function(e,t){var n=new URL(e,t);return n.href},H.eachChildNodes=function(e,t,n){var r,i,o,a="function"==typeof t;if(e.childNodes)for(i=0,o=e.childNodes.length;o>i;i+=1)r=e.childNodes[i],(!a||t(r))&&n(r)},H.isCustomTag=function(e){return e&&e.lastIndexOf("-")>=0},H.event={on:function(e,n,r){e.addEventListener?e.addEventListener(n,r,!1):t(e).on("method",r)},trigger:function(e,n){e.dispatchEvent?e.dispatchEvent(H.event.create(n)):t(e).trigger("method")},create:function(e){var t;return window.CustomEvent?t=new CustomEvent(e):(t=document.createEvent("HTMLEvents"),t.initEvent(e,!0,!0)),t}},H.query=function(e,n){return e.querySelector?e.querySelector(n):t(e).find(n)[0]},H.query.all=function(e,n){if(e.querySelectorAll)return e.querySelectorAll(n);var r=[];return t(e).find(n).each(function(){r.push(this)}),r};var G={};n("default",{render:function(e){return e}}),D.registerTemplateEngine=n,D.getTemplateEngine=r,D.require=function(){window.require.apply(null,arguments)},D.require.check=function(){return!!window.require};var K={},Q={},Y=0;D.dataCenter={_warehouse:K,requestSpace:o,removeSpace:c,getSpace:a,linkSpace:u,unlinkSpace:s},D.requestSpace=o,D.removeSpace=c;var $=2;l.prototype={ready:function(e,t){return this.promiseAll.then(e,t)},mixinProto:function(e){function t(e){f(n.countOfProto,"element prototype"),H.mixin(n.proto,e),n.countOfProto-=1,h(n.countOfProto,n.resolveProto.bind(n))}var n=this;if("object"==typeof e)t(e);else{if("function"!=typeof e)throw new Error("element prototype has wrong format");n.promises.modules.then(function(n){var r=e.apply(null,n);t(r)})}},resolveProto:function(){this.promises.proto.resolve(this.proto)},mixinModules:function(e){var t=this;f(t.countOfModules,"element dependencies"),e&&(this.modules=e),this.countOfModules-=1,h(t.countOfModules,t.resolveModules.bind(t))},resolveModules:function(){this.promises.modules.resolve(this.modules)},rejectModules:function(e){this.promises.modules.reject(e)},resolveViews:function(){this.promises.views.resolve(this.views)}};var J={ERROR:"ERROR",INITIALIZING:"INITIALIZING",INITIALIZED:"INITIALIZED"},W=["initialize","fetch","adapt","render","ready","destroy","fail"],X=["fetch","adapt","render"];P.prototype={on:function(e,t){this._events||(this._events={}),this._events[e]||(this._events[e]=[]),this._events[e].push(t)},fire:function(e){this._events&&this._events[e]&&H.each(this._events[e],function(e){e()})},isReady:function(){return this.status===J.INITIALIZED},prepare:function(e){p(this),e&&(w(this,e),m(this,e,["templateEngine","injectionMode","definitionEle","helpers"]),v(this,e),g(this,e),y(this,e))},initialize:function(){p(this),this.prepare(this.definition.proto),document.registerElement&&document.registerElement(this.name,{prototype:this.elementProto}),this.status=J.INITIALIZED,this.definition=null,this.fire("initialized")},parse:function(e){e.__flipper__||(H.mixin(e,this.elementProto),e.createdCallback(),e.attachedCallback())},markFailed:function(e){if(this.status=J.ERROR,"string"==typeof e&&(e=new Error(e)),this.fire("initialized",e),e)throw e},addView:function(e,t){this.views[t||"index"]=e+""},getView:function(e){var t;e=e||"index",this.views[e]&&(t=this.views[e]);var n=function(n){if((n.id||"index")===e&&(t=n.innerHTML,!t&&n.content&&n.content.cloneNode)){var r=document.createElement("div");r.appendChild(n.content.cloneNode(!0)),t=r.innerHTML}};return t||H.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"template"===e.tagName.toLowerCase()},function(e){return n(e)}),t||H.eachChildNodes(this.definitionEle,function(e){return e.tagName&&"script"===e.tagName.toLowerCase()&&"template"===e.getAttribute("type")},function(e){return n(e)}),t||"index"!==e||(t=" "),t||""},renderView:function(e,t,n){e=e||"index";var r=D.getTemplateEngine(this.templateEngine),i=this.name+"-"+e;return r.hasView(i)||r.addView(i,this.getView(e)),r.renderView(i,t,n)},createdCallback:function(e){H.debug(e,"is created");var t=this.renderComplete.bind(this,e);Promise.resolve().then(this.renderBegin.bind(this,e)).then(this.initElement.bind(this,e)).then(this.handleElement.bind(this,e)).then(this.renderSuccess.bind(this,e))["catch"](this.renderFail.bind(this,e)).then(this.addStyle.bind(this,e)).then(t,t)},renderBegin:function(e){H.debug(e,"render begin"),e.setAttribute("unresolved",""),e.__flipper__=!0,H.debug(e,"has flipper flag",e.__flipper__)},initElement:function(e){return C(e,"initialize")},handleElement:function(e){return Promise.resolve().then(this.fetchModel.bind(this,e)).then(this.renderNode.bind(this,e))},fetchModel:function(e,t){var n,r;return t?(r="",n=t):b(e,"fetch")?(r="",n=E(e,"fetch")):e.hasAttribute("model-id")&&(r=e.getAttribute("model-id"),n=D.dataCenter.getSpace(r)),Promise.resolve(n).then(function(t){void 0!==t&&(e.model=t,r||(r=D.dataCenter.requestSpace(t)),D.dataCenter.linkSpace(r),e.modelId=r)})},renderNode:function(e){return b(e,"render")?E(e,"render"):Promise.resolve().then(this.formatModel.bind(this,e)).then(this.renderHTML.bind(this,e)).then(this.createTree.bind(this,e))},formatModel:function(e){return b(e,"adapt")?E(e,"adapt",[e.model]):e.model},renderHTML:function(e,t){var n="index",r=e.commands;return"function"==typeof r&&(r=r.call(e)),this.renderView(n,t,{element:e,commands:r})},createTree:function(e,t){var n="light-dom"===this.injectionMode||"light",r=n?e:e.createShadowRoot();r.innerHTML=t},addStyle:function(e){var t=document.createElement("style");if(t.textContent=this.style,t.setAttribute("referance-to",this.name),e.shadowRoot&&e.shadowRoot.innerHTML)e.shadowRoot.appendChild(t);else{var n=H.query(e,'style[referance-to="'+this.name+'"]');n||(document.head||document.body).appendChild(t)}},renderFail:function(e,t){H.debug(e,"render fail"),H.error(t),e.status="fail";var n=C(e,"fail",[t]);return Promise.resolve(n).then(function(){H.event.trigger(e,"fail")})},renderSuccess:function(e){H.debug(e,"render success"),e.status="ready";var t=C(e,"ready");return Promise.resolve(t).then(function(){H.event.trigger(e,"ready")})},renderComplete:function(e){H.debug(e,"render complete"),e.removeAttribute("unresolved"),e.initialized=!0,H.event.trigger(e,"initialized")},detachedCallback:function(e){this.destroy(e)},destroy:function(e){C(e,"destroy"),e.modelId&&(D.dataCenter.unlinkSpace(e.modelId),e.modelId=void 0,e.model=void 0),H.event.trigger(e,"destroy")},attachedCallback:function(){},attributeChangedCallback:function(e,t){var n,r,i;"function"==typeof e.attributeChanged?e.attributeChanged.apply(e,t):(n=this.watchers,r=t[0],n[r]&&(i=e[n[r]],"function"==typeof i&&i.apply(e,Array.prototype.slice.call(t,1))))},setHelpers:function(e){this.helpers=e},getHelpers:function(){return this.helpers}},D.Component=P;var et={},tt={};D.define=D.register=R,document.registerElement&&document.registerElement(D.configs.declarationTag,{prototype:H.createObject(HTMLElement.prototype,{createdCallback:{value:function(){V(this)}}})}),window.FlipperPolyfill&&window.FlipperPolyfill.flushDeclaration(D.register.bind(D)),D.getComponent=function(e){return et[e]},D.hasCompoent=function(e){return!!D.getComponent(e)},D.getComponentHelpers=function(e){var t=et[e];return t?t.getHelpers():{}},D.components=et,D.findShadow=function(e,t){return H.query.all(e.shadowRoot,t)},D.whenReady=function(e,t,n){function r(e,t){if(H.debug(e,"has flag on bind",e.__flipper__),e)if(e.initialized){if("ready"===t&&"ready"!==e.status)return;if("fail"===t&&"fail"!==e.status)return;var r=H.event.create(t);n.call(e,r)}else H.event.on(e,t,n)}2===arguments.length&&(n=t,t=e,e="initialized"),H.isArray(t)||(t=[t]),"function"!=typeof n&&(n=H.noop),e=e.split(","),H.each(e,function(e){e=H.trim(e),H.each(t,function(t){if("string"==typeof t){if(t=H.query.all(document,t),t&&t.length)for(var n=0,i=t.length;i>n;n+=1)r(t[n],e)}else r(t,e)})})},window.KISSY&&"function"==typeof window.KISSY.add?window.KISSY.add(F):"function"==typeof window.define&&window.define&&window.define(F),window.Flipper=F()}();