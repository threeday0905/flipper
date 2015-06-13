'use strict';

var cheerio = require('cheerio');

exports.nonSupportedEle = function($sub, category) {
    console.error(category + '\nnon-supported element:\n' + cheerio.html($sub) + '\n');
};

exports.outputSomeHtml = function($ele) {
    return '\n' + cheerio.html($ele).substr(0, 100) + '\n...';
};
