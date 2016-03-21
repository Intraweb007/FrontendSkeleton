const gulp = require('gulp'),
    helpers = require('./gulp-tasks/helpers'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins({
        DEBUG: false,
        pattern: ['*'],
        rename: {
            'css-mqpacker': 'mqpacker',
            'gulp-stylus': 'stylus',
            'gulp-concat-css': 'concatCss',
            'gulp-cssnano': 'nano',
            'gulp.spritesmith': 'spritesmith',
            'gulp-sourcemaps': 'sourcemaps',
            'browser-sync': 'browserSync',
            'gulp-concat': 'concat',
            'gulp-uglify': 'uglify',
            'gulp-notify': 'notify',
            'gulp-plumber': 'plumber',
            'gulp-babel': 'babel',
            'vinyl-source-stream': 'source',
            'gulp-file-include': 'fileinclude',
            'gulp-postcss': 'postcss'
        }
    });

function getTask(task) {
    return require('./gulp-tasks/' + task)(gulp, plugins, helpers);
}

gulp.task('css:stylus', getTask('css-stylus'));
gulp.task('css:concat', ['css:stylus'], getTask('css-concat'));
gulp.task('css:minify', ['css:concat'], getTask('css-minify'));

gulp.task('sprite', getTask('sprite'));
gulp.task('fileinclude', getTask('fileinclude'));

gulp.task('js:app:browserify', getTask('js-app-browserify'));
gulp.task('js:app:compress', ['js:app:browserify'], getTask('js-app-compress'));

gulp.task('js:vendor:concat', getTask('js-vendor-concat'));
gulp.task('js:vendor:make', ['js:vendor:concat'], getTask('js-vendor-compress'));

gulp.task('watch', getTask('watch'));

// Default action
gulp.task('default', function () {
    gulp.start('watch');
});