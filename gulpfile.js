'use strict';

var gulp    = require('gulp'),
    perrier = require('perrier'),
    rename  = require('gulp-rename'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify');


var fs      = require('fs'),
    join    = require('path').join,
    resolve = require('path').resolve;

var srcFolder  = resolve(__dirname, './src'),
    distFolder = resolve(__dirname, './build'),
    vendorDistFolder = resolve(distFolder, 'vendor');

/* config reader */
function checkExists(fileName) {
    if (fileName.lastIndexOf('*') > -1 && !fs.existsSync(fileName)) {
        throw new Error(fileName + ' is not exists');
    }
}

function computeFiles(folder, config, check) {
    var files = [];

    if (Array.isArray( config )) {
        files = config.map(function(fileName) {
            return resolve(folder, fileName);
        });
        if (check) {
            files.map(checkExists);
        }
    } else if (typeof config === 'string') {
        folder = resolve(folder, config);
        if (check) {
            checkExists( folder );
        }
        files = join(folder, '/**/*.*');
    } else {
        throw new Error('error config format for: ' + config);
    }

    return files;
}


/* sync vendor modules */
var syncVendors = function(done) {
    var vendorConfig = perrier.load( resolve(srcFolder, 'vendor.json') ),
        pendingLength = Object.keys(vendorConfig).length;

    function checkDone() {
        pendingLength -= 1;
        if (pendingLength === 0) {
            done();
        }
    }

    function getPackageFile(folder) {
        var availableNames = [ 'package.json', 'bower.json' ],
            tmpFileName;

        for (var i = 0, len = availableNames.length; i < len; i += 1) {
            tmpFileName = join(folder, availableNames[i] );

            if (fs.existsSync(tmpFileName)) {
                return tmpFileName;
            }
        }
    }

    Object.keys(vendorConfig).forEach(function(vendorName) {
        var config, sourceFolder, baseFolder, srcFiles, targetFolder;

        config = vendorConfig[vendorName];

        targetFolder = resolve(vendorDistFolder, vendorName);
        sourceFolder = resolve(srcFolder, config.base);

        baseFolder   = undefined;
        srcFiles     = config.src;

        if (typeof srcFiles === 'string') {
            var subFolder = resolve(sourceFolder, config.src);

            /* if src is a folder, then specific base folder with all files inside */
            if ( fs.existsSync(subFolder) && fs.statSync(subFolder).isDirectory() ) {
                baseFolder = subFolder;
                srcFiles = join(subFolder, '**/*');
            }
        }

        /* otherwise covert src files to absolute */
        if (!baseFolder) {
            srcFiles = Array.isArray(srcFiles) ? srcFiles : [ srcFiles ];
            srcFiles = srcFiles.map(function(srcFile) {
                return resolve(sourceFolder, srcFile);
            });
        }

        gulp.src(srcFiles, { base: baseFolder })
            .pipe(gulp.dest(targetFolder))
            .on('end', function() {
                gulp.src(getPackageFile(sourceFolder))
                    .pipe(gulp.dest(targetFolder))
                    .on('end', checkDone);
            });
    });
};


/* build related tasks */
var buildTasks = (function() {
    var buildConfig = perrier.load(
        resolve(srcFolder, 'build.json')
    );

    return Object.keys(buildConfig).map(function(taskName) {
        var srcFiles = computeFiles(srcFolder, buildConfig[taskName]);

        return {
            dist:  taskName, /* dist file name */
            src:   srcFiles, /* src files */
            build: 'build-' + taskName, /* build task name */
            alone: 'build-alone-' + taskName,
            watch: 'watch-' + taskName  /* watch task name */
        };
    });
}());

buildTasks.buildQueue = [];
buildTasks.watchQueue = [];

buildTasks.forEach(function(task, idx) {
    var depTasks = buildTasks.slice(0, idx).map(function(task) {
        return task.build;
    });

    var build = function() {
        task.src.forEach(checkExists);

        return gulp.src(task.src)
            .pipe(concat(task.dist))
            .pipe(gulp.dest(distFolder))
            .pipe(uglify())
            .pipe(rename(function(path) {
                path.basename += '-min';
            }))
            .pipe(gulp.dest(distFolder));
    };

    gulp.task(task.build, depTasks, build);
    gulp.task(task.alone, build);

    gulp.task(task.watch, [ task.build ], function() {
        return gulp.watch(task.src, [ task.alone ]);
    });

    buildTasks.buildQueue.push(task.build);
    buildTasks.watchQueue.push(task.watch);
});

gulp.task('sync-vendor', syncVendors);
gulp.task('build', buildTasks.buildQueue);
gulp.task('default', [ 'build' ].concat(buildTasks.watchQueue));
