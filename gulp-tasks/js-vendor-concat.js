module.exports = function (gulp, plugins, helpers) {
    return function() {
        return gulp.src(plugins.config.get('concatVendor.path'))
            .pipe(plugins.concat('vendor.js'))
            .pipe(gulp.dest(plugins.config.get('concatVendor.resultPath')))
    }
};