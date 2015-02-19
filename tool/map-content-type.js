'use strict';

var path = require('path');

var table = {
    js:   'application/x-javascript',
    json: 'application/json',
    html: 'text/html'
};

module.exports = function(file) {
    var extname = path.extname(file);
    return table[ extname.substr(1) ] || 'text/plain';
};
