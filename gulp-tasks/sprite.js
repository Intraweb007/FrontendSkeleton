module.exports = function (gulp, plugins, helpers) {
    return function() {
        const spriteData = gulp.src(plugins.config.get('sprite.path')).pipe(plugins.spritesmith({
            imgName: plugins.config.get('sprite.imgName'),
            cssName: plugins.config.get('sprite.cssName'),
            retinaSrcFilter: plugins.config.get('sprite.retinaSrcFilter'),
            retinaImgName: plugins.config.get('sprite.retinaImgName'),
            imgPath: plugins.config.get('sprite.imgPath'),
            retinaImgPath: plugins.config.get('sprite.retinaImgPath')
        }));

        return spriteData.pipe(gulp.dest(plugins.config.get('sprite.resultPath')));
    }
};