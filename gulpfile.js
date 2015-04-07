'use strict';

var fs      = require('fs'),
    path    = require('path'),
    gulp    = require('gulp'),
    perrier = require('perrier'),
    rename  = require('gulp-rename'),
    concat  = require('gulp-concat'),
    uglify  = require('gulp-uglify');


var srcFolder  = path.resolve(__dirname, './src'),
    destFolder = path.resolve(__dirname, './build'),
    buildTasks;

buildTasks = (function() {
    var buildConfig = perrier.load(
            './src/build.json'
        );

    return Object.keys(buildConfig).map(function(taskName) {
        var destFile = taskName,
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
            name:  taskName,
            dest:  destFile,
            src:   srcFiles,
            build: 'build-' + taskName,
            alone: 'build-alone-' + taskName,
            watch: 'watch-' + taskName
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
            .pipe(concat(task.dest))
            .pipe(gulp.dest(destFolder))
            .pipe(uglify())
            .pipe(rename(function(path) {
                path.basename += '-min';
            }))
            .pipe(gulp.dest(destFolder));
    };

    gulp.task(task.build, depTasks, build);
    gulp.task(task.alone, build);

    gulp.task(task.watch, [ task.build ], function() {
        return gulp.watch(task.src, [ task.alone ]);
    });

    buildTasks.buildQueue.push(task.build);
    buildTasks.watchQueue.push(task.watch);
});

gulp.task('compress', buildTasks.buildQueue, function() {
    return gulp
        .src([
            'build/**/*.js',
            '!build/vendor/**/*.js',
            '!build/**/*.min.js',
            '!build/**/*-min.js'
        ])
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += '-min';
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('build', buildTasks.buildQueue);
gulp.task('default', [ 'build' ].concat(buildTasks.watchQueue));
