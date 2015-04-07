var fs      = require('fs'),
    path    = require('path');

/* helper methods */
function endsWith(str, searchString, position) {
    var subjectString = str.toString();
    if (position === undefined || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
}


function checkExists(fileName, silent) {
    if (Array.isArray(fileName)) {
        /* array check will not supports silent opt */
        fileName.forEach(checkExists);
        return;
    }

    if (!/[\*\!]/.test(fileName) && !fs.existsSync(fileName)) {
        if (silent !== true ) {
            throw new Error(fileName + ' is not exists');
        }
        return false;
    }
    return true;
}

var AVAILABLE_PACKAGE_FILES = [ 'package.json', 'bower.json' ],
    AVAILABLE_MODULE_FOLDER = [ 'node_modules', 'bower_components' ];

function getPackageFile(targetFolder, moduleName) {
    var excludeFolder = AVAILABLE_MODULE_FOLDER.concat(moduleName),
        packageFile;

    function tryGet(currentFolder) {
        var tmpFileName;
        for (var i = 0; i < AVAILABLE_PACKAGE_FILES.length; i += 1) {
            tmpFileName = path.join(currentFolder, AVAILABLE_PACKAGE_FILES[i]);

            if (fs.existsSync(tmpFileName)) {
                return tmpFileName;
            }
        }
    }

    function isExcludeFolder(currentFolder) {
        for (var i = 0; i < excludeFolder.length; i += 1) {
            if (endsWith(currentFolder, '/' + excludeFolder[i]) ) {
                return true;
            }
        }
        return false;
    }

    while (targetFolder && !isExcludeFolder(targetFolder) ) {
        packageFile = tryGet(targetFolder);

        if (packageFile) {
            break;
        } else {
            targetFolder = path.dirname(targetFolder);
        }
    }

    return packageFile || '';
}

function parseConfig(config, rootPath) {
    config.base = path.resolve(rootPath, config.base);
    config.src  = Array.isArray(config.src) ? config.src : [ config.src ];
    config.src  = config.src.map(function(srcFile) {
        return path.resolve(config.base, srcFile);
    });

    checkExists(config.base);
    checkExists(config.src);

    return config;
}

function checkMultiTasks(number, done) {
    if (Array.isArray(number)) {
        number = number.length;
    } else if (typeof number === 'object') {
        number = Object.keys(number).length;
    } else if (typeof number !== 'number') {
        throw new Error('task number should be Number');
    }

    var pending = number;
    return function doneOne() {
        pending -= 1;
        if (pending === 0) {
            done();
        }
    };
}

exports.checkExists     = checkExists;
exports.checkMultiTasks = checkMultiTasks;
exports.getPackageFile  = getPackageFile;
exports.parseConfig     = parseConfig;
