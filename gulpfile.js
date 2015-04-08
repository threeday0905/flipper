'use strict';

var gulp     = require('gulp'),
    rename   = require('gulp-rename'),
    concat   = require('gulp-concat'),
    uglify   = require('gulp-uglify'),
    clean    = require('gulp-clean'),
    sequence = require('run-sequence');

var buildHelper = require('./tool/build-helper'),
    perrier = require('perrier'),
    resolve = require('path').resolve;

var srcFolder  = resolve(__dirname, './src'),
    distFolder = resolve(__dirname, './build'),
    vendorDistFolder = resolve(distFolder, 'vendor');

/* sync vendor modules */
var syncVendors = function(done) {
    var vendorConfig = perrier.load( resolve(srcFolder, 'vendor.json') ),
        waiting = buildHelper.waitingMultiTasks(vendorConfig, done );

    Object.keys(vendorConfig).forEach(function(vendorName) {
        var config = buildHelper.parseConfig(vendorConfig[vendorName], srcFolder),
            targetFolder = resolve(vendorDistFolder, vendorName);

        buildHelper.checkConfig(config);

        gulp.src(config.src, { base: config.base })
            .pipe(gulp.dest( targetFolder ))
            .on('end', function() {
                gulp.src(buildHelper.getPackageFile(config.base))
                    .pipe(gulp.dest(targetFolder))
                    .on('end', waiting.doneOne);
            });
    });
};


/* build related tasks */
var buildTasks = (function() {
    var buildConfig = perrier.load( resolve(srcFolder, 'build.json') );

    return Object.keys(buildConfig).map(function(taskName) {
        var config = buildHelper.parseConfig(buildConfig[taskName], srcFolder);
        return {
            dist:  taskName, /* dist file name */
            src:   config.src, /* src files */
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

    function build() {
        buildHelper.checkExists(task.src);

        return gulp.src(task.src)
            .pipe(concat(task.dist))
            .pipe(rename(function(path) {
                path.basename += '-debug';
            }))
            .pipe(gulp.dest(distFolder))
            .pipe(uglify())
            .pipe(rename(function(path){
                path.basename = /* remove "-debug" */
                    path.basename.substr(0, path.basename.length -6);
            }))
            .pipe(gulp.dest(distFolder));
    }

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

gulp.task('clean-build', function() {
    return gulp.src(distFolder, { read: false }).pipe(clean());
});

gulp.task('build-all', function(done) {
    sequence(
        'clean-build', 'sync-vendor', 'build',
        done
    );
});
