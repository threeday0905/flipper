'use strict';

var fs      = require('fs'),
    path    = require('path'),
    gulp    = require('gulp'),
    perrier = require('perrier'),
    concat  = require('gulp-concat');

var srcFolder  = path.resolve(__dirname, './src'),
    destFolder = path.resolve(__dirname, './build'),
    buildTasks;

buildTasks = (function() {
    var buildConfig = perrier.load(
            './src/build.json'
        );

    return Object.keys(buildConfig).map(function(taskName) {
        var destFile = taskName + '.js',
            buildSource = buildConfig[taskName],
            srcFiles;

        if ( typeof buildSource === 'string' ) {
            var targetFolder = path.resolve(srcFolder, buildSource);
            srcFiles = fs.readdirSync(targetFolder).map(function(fileName) {
                return path.resolve(targetFolder, fileName);
            }).sort(function(a, b) {
                return a > b ? 1 : -1;
            });
        } else if (Array.isArray(buildSource)) {
            srcFiles = buildConfig[taskName].map(function(fileName) {
                return path.resolve(srcFolder, fileName);
            });
        }

        return {
            name: taskName,
            dest: destFile,
            src:  srcFiles
        };
    });
}());

buildTasks.buildQueue = [];
buildTasks.watchQueue = [];

buildTasks.forEach(function(task) {
    var buildTaskName = 'build-' + task.name,
        watchTaskName = 'watch-' + task.name;

    gulp.task(buildTaskName, function() {
        gulp.src(task.src)
            .pipe(concat(task.dest))
            .pipe(gulp.dest(destFolder));
    });

    gulp.task(watchTaskName, function() {
        gulp.watch(task.src, [ buildTaskName ]);
    });

    buildTasks.buildQueue.push(buildTaskName);
    buildTasks.watchQueue.push(watchTaskName);
});

gulp.task('build', buildTasks.buildQueue);
gulp.task('default', [ 'build' ].concat(buildTasks.watchQueue));
