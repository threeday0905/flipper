'use strict';

var fs      = require('fs'),
    path    = require('path'),
    gulp    = require('gulp'),
    perrier = require('perrier'),
    rename  = require('gulp-rename'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify');


var srcFolder  = path.resolve(__dirname, './src'),
    distFolder = path.resolve(__dirname, './build');


/* shortcut methods */
var resolveSrc  = path.resolve.bind(path, srcFolder);
    /*, resolveDist = path.resolve.bind(path, distFolder); */


/* build related tasks */
var buildTasks = (function() {
    var buildConfig = perrier.load( resolveSrc('build.json') );

    return Object.keys(buildConfig).map(function(taskName) {
        var srcFiles;

        if (Array.isArray( buildConfig[taskName] )) {
            srcFiles = buildConfig[taskName].map(function(srcFileName) {
                return resolveSrc(srcFileName);
            });
        } else {
            throw new Error('build files for ' + taskName + ' must be an array');
        }

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
        task.src.forEach(function(file) {
            if (!fs.existsSync(file)) {
                throw new Error('the file ' + file + ' is not exists');
            }
        });

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

gulp.task('build', buildTasks.buildQueue);
gulp.task('default', [ 'build' ].concat(buildTasks.watchQueue));
