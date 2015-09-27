var postcss      = require('gulp-postcss'),
    gulp         = require('gulp'),
    autoprefixer = require('autoprefixer'),
    mqpacker     = require('css-mqpacker'),
    csswring     = require('csswring'),
    stylus       = require('gulp-stylus'),
    concatCss    = require('gulp-concat-css'),
    minifyCss    = require('gulp-minify-css'),
    nib          = require('nib'),
    rupture      = require('rupture'),
    spritesmith  = require('gulp.spritesmith'),
    browserSync  = require('browser-sync').create(),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    notify       = require("gulp-notify"),
    plumber      = require('gulp-plumber'),
    gutil        = require('gulp-util'),
    lost         = require('lost'),
    poststylus   = require('poststylus'),
    config       = require('config'),
    babel        = require("gulp-babel");

// Stylus to CSS
gulp.task('stylus', function () {
    return gulp.src(config.get('stylus.collectorPath'))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(stylus(
            {use: [nib(), poststylus(['lost']), rupture()], import: ['nib', 'rupture']}
        ))
        .pipe(gulp.dest(config.get('stylus.collectorCompilePath')))
        .pipe(browserSync.stream());
});

// Concat CSS Files
gulp.task('concat', function () {
    return gulp.src(config.get('concat.path'))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concatCss(config.get('concat.resultCss')))
        .pipe(gulp.dest(config.get('concat.resultPath')));
});

// CSS
gulp.task('css', ['concat'], function () {
    var processors = [
        autoprefixer({browsers: ['last 3 version']}),
        mqpacker,
        csswring
    ];
    return gulp.src(config.get('css.path'))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(config.get('css.resultPath')));
});

// Minify CSS
gulp.task('minify-css', ['css'], function () {
    return gulp.src(config.get('minify.path'))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest(config.get('minify.resultPath')))
        .pipe(notify("CSS cкомпилирован!"));
});

// Sprites
gulp.task('sprite', function () {
    var spriteData = gulp.src(config.get('sprite.path')).pipe(spritesmith({
        imgName: config.get('sprite.imgName'),
        cssName: config.get('sprite.cssName'),
        retinaSrcFilter: config.get('sprite.retinaSrcFilter'),
        retinaImgName: config.get('sprite.retinaImgName'),
        imgPath: config.get('sprite.imgPath'),
        retinaImgPath: config.get('sprite.retinaImgPath')
    }));
    return spriteData.pipe(gulp.dest(config.get('sprite.resultPath')));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(config.get('scripts.files'))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat(config.get('scripts.resultFile')))
        .pipe(gulp.dest(config.get('scripts.resultPath')));
});

// Compress
gulp.task('compress', ['scripts'], function () {
    return gulp.src(config.get('compress.path'))
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest(config.get('compress.resultPath')))
        .pipe(notify("JS файл готов!"));
});

// Default action
gulp.task('default', function () {
    gulp.start('minify-css', 'compress');
});

// Server
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(config.get('watch.stylus'), ['stylus']);
    gulp.watch(config.get('watch.minify'), ['minify-css']);
    gulp.watch(config.get('watch.compress'), ['compress']);
    gulp.watch(config.get('watch.buildCss')).on('change', browserSync.reload);
    gulp.watch(config.get('watch.buildJs')).on('change', browserSync.reload);
    gulp.watch("*.html").on('change', browserSync.reload);
});

var onError = function (err) {
    gutil.beep();
    console.log(err);
};