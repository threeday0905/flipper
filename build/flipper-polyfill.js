(function() {
'use strict';

var supportHTMLImports = Boolean('import' in document.createElement('link')),
    supportCustomElement = Boolean(document.registerElement);

if (!supportHTMLImports || !supportCustomElement) {
    window.onload = function() {
        document.body.innerHTML = '<div style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: #333;"><div style="position: absolute; position: fixed; top: 25%; width: 60%; left: 20%; height: 50%; background: #fff; border: 10px solid gray; z-index: 99999;"><img style="box-sizing: content-box; width: 220px; padding: 50px; margin-right: 30px; display: block; float: left;" src="http://g.tbcdn.cn/crm/flipper/0.2.3/assets/sorry.gif" alt="Sorry"><div style="width: 420px; float: left;"><h3 style="padding-top: 70px">\u76ee\u524d\u4e0d\u652f\u6301\u60a8\u7684\u6d4f\u89c8\u5668\uff0c\u8bf7\u6682\u65f6\u5148\u4f7f\u7528<br />\u6700\u65b0\u7248\u7684<a href="https://www.google.com/chrome/browser/desktop/">Chrome</a></h3><strong style="float: left; padding-top: 30px; font-size: 28px;">\u6211\u4eec\u4f1a\u5c3d\u5feb\u652f\u63f4\u7684\uff01\uff01\uff01</strong></div></div></div>';
    };
}

}());
