'use strict';

var fs = require('fs'),
    path = require('path'),
    expect = require('args-expect');

var cheerio = require('cheerio');

var component = require('./lib/component'),
    external  = require('./lib/external'),
    registerScript = require('./lib/register-script');


function handleDocument(filePath, components, externals, options) {
    var $doc;

    $doc = cheerio.load( fs.readFileSync(filePath) );
    components = components || [];
    externals  = externals  || [];

    function handleRootTag($ele) {
        var tagName = $ele[0].tagName || $ele[0].name;

        if (tagName === 'web-component') {
            components.push(
                component.parse($ele, filePath, options)
            );
        } else if (tagName === 'link' && $ele.attr('rel') === 'import') {
            handleDocument(path.resolve(path.dirname(filePath), $ele.attr('href')),
                components, externals, options
            );
        } else {
            externals.push(
                external.parse($ele, filePath, options)
            );
        }
    }

    $doc.root().children().each(function() {
        handleRootTag(cheerio(this));
    });

    return {
        filePath:   filePath,
        components: components,
        externals:  externals
    };
}

function handleScript(filePath, components, externals, options) {
    var componentItem = component.create(filePath);
    componentItem.register = fs.readFileSync(filePath).toString();
    registerScript.parse(componentItem, options);

    return {
        filePath: filePath,
        components: [
            componentItem
        ],
        externals: []
    };
}


function compileFile(file, options) {
    var filePath = path.resolve(options.base, file),
        fileType = path.extname(filePath),
        result;

    if (!fs.existsSync(filePath)) {
        throw new Error('the file ' + filePath + ' is not exists');
    }

    if (fileType === '.js') {
        result = handleScript(filePath, undefined, undefined, options);
    } else {
        result = handleDocument(filePath, undefined, undefined, options);
    }

    return result;
}

function makeComponentBanner(component, baseDir) {
    var filePath = path.relative(baseDir, component.path);

    var banner = '[' + component.name + '] - ' + filePath;
    return '/* ' + banner + ' */\n';
}

function makeFileBanner(type) {
    return '/********************************************\n' +
           ' * ' + type + ' generated by Flipper' + '\n' +
           ' ********************************************/\n\n';
}

function makeContent(component, content, baseDir) {
    if (Array.isArray(content)) {
        content = content.join('\n');
    }
    //content = content.trim();
    return content ? makeComponentBanner(component, baseDir) + content + '\n' : '';
}

function compile(options) {
    expect(options).notNull().has([ 'base', 'files'] );
    if (!Array.isArray(options.files)) {
        options.files = [ options.files ];
    }

    if (!options.base) {
        throw new Error('must identify the source base folder');
    }

    if (!options.pkg) {
        options.pkg = 'Flipper_' + Date.now();
    }

    var files = options.files.map(function(file) {
        return compileFile(file, options);
    });

    var unique = {
        components: [],
        externals: []
    };

    var temp = {};

    files.forEach(function(item) {
        item.components.forEach(function(component) {
            if (temp[component.name]) {
                return;
            }

            unique.components.push(component);
            temp[component.name] = true;
        });
    });

    unique.components.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    unique.register = unique.components.map(function(component) {
        return makeContent(component, component.register, options.base);
    }).join('\n').trim();

    unique.script = unique.components.map(function(component) {
        return makeContent(component, component.script, options.base);
    }).join('\n').trim();

    unique.style = unique.components.map(function(component) {
        return makeContent(component, component.style, options.base);
    }).join('\n').trim();

    var outputScript = makeFileBanner('External Scripts') + unique.script +
                       makeFileBanner('Component Register') + unique.register;
    var outputStyle  = makeFileBanner('Component Styles') + unique.style;

    return {
        files:  files,
        unique: unique,
        script: outputScript,
        style:  outputStyle
    };
}

exports.compile = compile;
