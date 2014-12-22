(function(Flipper) {
    'use strict';

    var utils = Flipper.utils;

    function importRuleForSheet(sheet, baseUrl) {
        var href = new URL(sheet.getAttribute('href'), baseUrl).href;
        return '@import \'' + href + '\';';
    }

    function createStyleElement(cssText, scope) {
        scope = scope || document;
        scope = scope.createElement ? scope : scope.ownerDocument;
        var style = scope.createElement('style');
        style.textContent = cssText;
        return style;
    }

    function copySheetAttributes(style, link) {
        var attrs = link.attributes,
            attr;
        for (var i = 0, len = attrs.length; i < len; i += 1) {
            attr = attrs[i];

            if (attr.name !== 'rel' && attr.name !== 'href') {
                style.setAttribute(attr.name, attr.value);
            }
        }
    }

    function extractStyleElement(ele) {
        var styles = ele.find('style'),
            content = ele.getTplContent();

        utils.eachNodes(styles, function(style) {
            content.appendChild(style);
        });
    }

    function importStyleSheet(ele) {
        var stylesheets = ele.find('link[rel="stylesheets]'),
            content = ele.getTplContent(),
            owner   = ele.getOwner(),
            baseURI = owner.baseURI;

        utils.eachNodes(stylesheets, function(node) {
            var rule  = importRuleForSheet(node, baseURI),
                style = createStyleElement(rule, owner);

            copySheetAttributes(style, node);

            node.parentNode.removeChild(node);
            content.appendChild(style);
        });
    }

    function parseStyle(ele) {
        extractStyleElement(ele);
        importStyleSheet(ele);
    }

    Flipper.parser = Flipper.parser || {};
    Flipper.parser.parseStyle = parseStyle;
} (Flipper));
