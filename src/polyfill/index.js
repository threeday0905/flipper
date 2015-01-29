var supportHTMLImports = Boolean('import' in document.createElement('link')),
    supportCustomElement = Boolean(document.registerElement);

if (!supportHTMLImports || !supportCustomElement) {
    window.onload = function() {
        document.body.innerHTML = '<div style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: #333;"><div style="position: absolute; position: fixed; top: 25%; width: 60%; left: 20%; height: 50%; background: #fff; border: 10px solid gray; z-index: 99999;"><img style="box-sizing: content-box; width: 220px; padding: 50px; margin-right: 30px; display: block; float: left;" src="http://g.tbcdn.cn/crm/flipper/0.2.3/assets/sorry.gif" alt="Sorry"><div style="width: 420px; float: left;"><h3 style="padding-top: 70px">目前不支持您的浏览器，请暂时先使用<br />最新版的<a href="https://www.google.com/chrome/browser/desktop/">Chrome</a></h3><strong style="float: left; padding-top: 30px; font-size: 28px;">我们会尽快支援的！！！</strong></div></div></div>';
    };
}
