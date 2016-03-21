module.exports = function (gulp, plugins, helpers) {
    return function() {
        return gulp.src(plugins.config.get('compress.path'))
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.plumber({errorHandler: helpers.errorHandler}))
            .pipe(plugins.uglify())
            .pipe(plugins.sourcemaps.write('maps'))
            .pipe(gulp.dest(plugins.config.get('compress.resultPath')))
            .pipe(plugins.notify("JS файл готов!"));
    }
};