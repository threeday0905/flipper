'use strict';

var fs = require('fs'),
    builder = require('../../../toolkit/builder');

var result = builder.compile({
    pkg: 'test',
    base: __dirname,
    files: [
        './components/btn-a.html',
        './components/btn-b.js'
    ]
});

fs.writeFileSync(__dirname + '/components/compiled/all.js', result.script);
fs.writeFileSync(__dirname + '/components/compiled/all.css', result.style);
