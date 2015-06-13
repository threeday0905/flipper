'use strict';

var cheerio = require('cheerio'),
    loader = require('../util/loader'),
    error  = require('../util/error');

exports.parse = function($ele, filePath, options) {
    var resources = {
        externalScript: [],
        externalStyle: [],
        inlineScript: [],
        inlineStyle: [],
        error: []
    };

    function handleExternalScript($ele) {
        resources.externalScript.push( loader.load($ele.attr('src'), filePath) );
    }

    function handleExtrernaStyle($ele) {
        resources.externalScript.push( loader.load($ele.attr('href'), filePath) );
    }

    function handleInlineScript($ele) {
        resources.inlineScript.push($ele.html());
    }

    function handleInlineStyle($ele) {
        resources.inlineStyle.push($ele.html());
    }

    $ele = cheerio($ele);

    var tagName = $ele[0].tagName || $ele[0].name;

    if (tagName === 'script') {
        if ($ele.attr('src')) {
            handleExternalScript($ele);
        } else {
            handleInlineScript($ele);
        }
    } else if (tagName === 'style') {
        handleInlineStyle($ele);
    } else if (tagName === 'link' && $ele.attr('rel') === 'stylesheet') {
        handleExtrernaStyle($ele);
    } else {
        error.nonSupportedEle($ele, '[root file] ' + filePath);
    }

    return resources;
};
