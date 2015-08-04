function collectStyleFromNode(node, baseUri) {
    var style = '';

    // TODO: Copy Attributes, such as
    function extractStyleSheet() {
        var linkEles = [];

        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'link' &&
                ele.getAttribute('rel') === 'stylesheet';
        }, function(ele) {
            linkEles.push(ele);
        });

        utils.each(linkEles, function(ele) {
            var href = new URL(ele.getAttribute('href'), baseUri);
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

        utils.each(styleEles, function(ele) {
            var styleContent = ele.innerHTML;
            style += styleContent;
            node.removeChild(ele);
        });
    }

    extractStyleSheet();
    extractStyleElement();

    return new Promise(function(resolve){
        resolve(style);
    });
}
