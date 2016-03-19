module.exports = function (gulp, plugins, helpers) {
    return function() {
        return gulp.src(plugins.config.get('concat.path'))
            .pipe(plugins.plumber({errorHandler: helpers.errorHandler}))
            .pipe(plugins.concatCss(plugins.config.get('concat.resultCss')))
            .pipe(gulp.dest(plugins.config.get('concat.resultPath')));
    }
};