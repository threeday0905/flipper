'use strict';

var fs = require('fs'),
    path = require('path');

function startsWith(prefix, str) {
    return str.lastIndexOf(prefix) === 0;
}

function isRemoteFile(filePath) {
    return startsWith(filePath, 'http') ||
           startsWith(filePath, 'https') ||
           startsWith(filePath, '//');
}

var cache = {};

exports.load = function(filePath, baseFile) {
    if (isRemoteFile(filePath)) {
        throw new Error('We are not support remote file now: ' + filePath);
    }

    filePath = path.resolve(path.dirname(baseFile), filePath);

    if (!fs.existsSync(filePath)) {
        throw new Error('local resouce not exists: ' + filePath);
    }

    if (!cache[filePath]) {
        cache[filePath] = fs.readFileSync(filePath).toString();
    }

    return cache[filePath];
};
