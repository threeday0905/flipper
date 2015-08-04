function ajax(url, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
        if (xhr.status === 200) {
            onSuccess(xhr.responseText);
        } else {
            onError(xhr.status);
        }
    };
    xhr.send();
}

function parseStyleConent(styleContent, componentName) {
    if (/@import/.test(styleContent)) {
        utils.warn('do not supported @import on component sytle. ' + componentName);
    }
    return styleContent;
}

function collectStyleFromNode(node, baseUri, componentName) {
    var styleText = '', linkUrls = [];

    function extractStyleSheet() {
        var linkEles = [];
        utils.eachChildNodes(node, function(ele) {
            return ele.tagName && ele.tagName.toLowerCase() === 'link' &&
                ele.getAttribute('rel') === 'stylesheet';
        }, function(ele) {
            linkEles.push(ele);
        });

        utils.each(linkEles, function(ele) {
            linkUrls.push(new URL(ele.getAttribute('href'), baseUri).href);
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
            styleText += styleContent;
            node.removeChild(ele);
        });
    }

    extractStyleElement();
    extractStyleSheet();

    return new Promise(function(resolve, reject){
        var linksCount = linkUrls.length,
            styleContent = styleText,
            resolveLink, parseAndDone;

        parseAndDone = function() {
            resolve(parseStyleConent(styleContent, componentName));
        };

        if (!linksCount) {
            parseAndDone();
            return;
        }

        resolveLink = function(responseText) {
            styleContent += '\n' + responseText;
            linksCount -= 1;
            if (linksCount === 0) {
                parseAndDone();
            }
        };

        utils.each(linkUrls, function(linkUrl) {
            ajax(linkUrl, resolveLink, function(reason) {
                reject('fetch link [' +
                    linkUrl +
                    '] error, caused by: ' + reason);
            });
        });
    });
}
