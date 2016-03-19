module.exports = function (gulp, plugins, helpers) {
    return function() {
        return gulp.src(plugins.config.get('compress.vendorPath'))
            .pipe(plugins.plumber({errorHandler: helpers.errorHandler}))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(plugins.config.get('compress.resultPath')))
            .pipe(plugins.notify("JS Vendor файл готов!"));
    }
};