'use strict';

var cheerio = require('cheerio'),
    expect  = require('args-expect'),
    loader = require('../util/loader'),
    error  = require('../util/error');

var registerScript = require('./register-script');

var SUPPORTED_TAG_ATTRIBUTES = [ 'template-engine', 'injection-mode', 'extends', 'is' ];

function parseDash(str) {
    if (str.charAt(0) === '-') {
        str = str.substr(1);
    }

    var result = str.replace(/\-./, function(mat) {
        return mat.substr(1).toUpperCase();
    });

    return result;
}

exports.create = function(filePath) {
    expect(filePath).isString();
    return {
        name: '',
        style: [],
        script: [],
        template: {},
        attrs: {},
        register: '',
        path: filePath
    };
};

exports.parse = function($ele, filePath, options) {
    var component = exports.create(filePath);

    component.name = $ele.attr('name');

    if (!component.name) {
        throw new Error('lost component name on "web-component" tag:' +
            error.outputSomeHtml($ele)
        );
    }

    SUPPORTED_TAG_ATTRIBUTES.forEach(function(attrName) {
        var attrValue = $ele.attr(attrName);
        if (attrValue) {
            attrName = parseDash(attrName);
            component.attrs[attrName] = attrValue;
        }
    });

    function handleTemplate(content, id) {
        id = id || 'index';
        component.template[id] = content;
    }

    function handleStyle(content) {
        component.style.push(content);
    }

    function handleScript(content) {
        component.script.push(content);
    }

    var debugPrefix = '[web-component] ' + component.name;

    $ele.children().each(function() {
        var $sub = cheerio(this),
            tagName = $sub[0].tagName || $sub[0].name,
            content = $sub.html();

        if ($sub.attr('src')) {
            content = loader.load($sub.attr('src'), filePath);
        } else if ($sub.attr('href')) {
            content = loader.load($sub.attr('href'), filePath);
        }

        if (tagName === 'script') {
            if (/Flipper\.(register|define)/.test(content)) {
                component.register = content;
            } else if ($sub.attr('type') === 'template') {
                handleTemplate(content, $sub.attr('id'));
            } else {
                handleScript(content);
            }
        } else if (tagName === 'template') {
            handleTemplate(content, $sub.attr('id'));
        } else if (tagName === 'style') {
            handleStyle(content);
        } else if (tagName === 'link') {
            if ($sub.attr('rel') === 'stylesheet') {
                handleStyle(content);
            } else {
                error.nonSupportedEle($sub, debugPrefix);
            }
        } else {
            error.nonSupportedEle($sub, debugPrefix);
        }
    });

    registerScript.parse(component, options);
    component.style  = component.style.join('\n');
    component.script = component.script.join('\n');
    return component;
};
