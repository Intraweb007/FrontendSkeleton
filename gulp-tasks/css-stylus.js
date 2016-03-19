module.exports = function (gulp, plugins, helpers) {
    return function() {
        return gulp.src(plugins.config.get('stylus.collectorPath'))
            .pipe(plugins.plumber({errorHandler: helpers.errorHandler}))
            .pipe(plugins.stylus(
                {use: [plugins.poststylus(['lost']), plugins.rupture()], import: ['rupture']}
            ))
            .pipe(gulp.dest(plugins.config.get('stylus.collectorCompilePath')))
            .pipe(plugins.browserSync.stream());
    }
};