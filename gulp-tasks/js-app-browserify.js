module.exports = function (gulp, plugins, helpers) {
    return function() {
        return plugins.browserify({
                entries: plugins.config.get('browserify.path'),
                debug: true,
                transform: [plugins.babelify.configure({presets: ["es2015"]}), plugins.vueify]
            })
            .bundle()
            .on('error', helpers.errorHandler)
            .pipe(plugins.source(plugins.config.get('browserify.resultFile')))
            .pipe(gulp.dest(plugins.config.get('browserify.resultPath')));
    }
};