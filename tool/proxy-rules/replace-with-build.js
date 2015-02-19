'use strict';

var fs = require('fs'),
    path = require('path');

var regexp = require('../regexp-generator'),
    mimetype = require('../map-content-type');

var BUILD_FOLDER = path.join(__dirname, '../../build'),
    /* '%' symbol will be converted to '\' on regexp  */
    URL_PATH = '/crm/flipper/%d.%d.%d/',
    INTERCEPT_FILES;

function createFileRegexp(fileName) {
    var regStr = URL_PATH + fileName + '$';
    return regexp.create(regStr);
}

INTERCEPT_FILES = fs.readdirSync(BUILD_FOLDER).map(function(fileName) {
    return {
        fileName: fileName,
        filePath: path.join(BUILD_FOLDER, fileName),
        urlReg:   createFileRegexp(fileName)
    };
}).filter(function(obj) {
    return fs.statSync(obj.filePath).isFile();
});


module.exports = {
    summary: function() {
        return 'replace live file with local build';
    },
    shouldUseLocalResponse: function(req) {
        INTERCEPT_FILES.forEach(function(obj) {
            if (obj.urlReg.test(req.url)) {
                req.interceptFile = obj.filePath;
            }
        });

        return !!req.interceptFile;
    },

    dealLocalResponse: function(req, reqBody, callback) {
        if (req.interceptFile) {
            fs.readFile(req.interceptFile, function(err, content) {
                callback(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': mimetype(req.interceptFile)
                }, content);
            });
        }
    }
};
