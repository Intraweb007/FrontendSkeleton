module.exports = function (gulp, plugins, helpers) {
    return function() {
        plugins.browserSync.init({
            server: {
                baseDir: "./"
            }
        });

        gulp.watch(plugins.config.get('watch.minify'), ['css:minify']);
        gulp.watch(plugins.config.get('watch.compress'), ['js:app:compress']);
        gulp.watch(plugins.config.get('watch.buildCss')).on('change', plugins.browserSync.reload);
        gulp.watch(plugins.config.get('watch.buildJs')).on('change', plugins.browserSync.reload);
        gulp.watch(plugins.config.get('watch.fileinclude'), ['fileinclude']);
        gulp.watch("*.html").on('change', plugins.browserSync.reload);
    }
};