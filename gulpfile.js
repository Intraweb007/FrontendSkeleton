const postcss      = require('gulp-postcss'),
      gulp         = require('gulp'),
      autoprefixer = require('autoprefixer'),
      mqpacker     = require('css-mqpacker'),
      csswring     = require('csswring'),
      stylus       = require('gulp-stylus'),
      concatCss    = require('gulp-concat-css'),
      nano         = require('gulp-cssnano'),
      rupture      = require('rupture'),
      spritesmith  = require('gulp.spritesmith'),
      browserSync  = require('browser-sync').create(),
      concat       = require('gulp-concat'),
      uglify       = require('gulp-uglify'),
      notify       = require("gulp-notify"),
      plumber      = require('gulp-plumber'),
      lost         = require('lost'),
      poststylus   = require('poststylus'),
      config       = require('config'),
      babel        = require('gulp-babel'),
      browserify   = require('browserify'),
      babelify     = require('babelify'),
      source       = require('vinyl-source-stream'),
      fileinclude  = require('gulp-file-include'),
      vueify       = require('vueify');

var processors = [
    mqpacker,
    csswring
];

vueify.compiler.applyConfig({
    autoprefixer: {},
    postcss: processors
});

var errorHandler = function() {
    var args = Array.prototype.slice.call(arguments);
    // Send error to notification center with gulp-notify
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);

    // Keep gulp from hanging on this task
    this.emit('end');
};

// Stylus to CSS
gulp.task('stylus', function () {
    return gulp.src(config.get('stylus.collectorPath'))
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(stylus(
            {use: [poststylus(['lost']), rupture()], import: ['rupture']}
        ))
        .pipe(gulp.dest(config.get('stylus.collectorCompilePath')))
        .pipe(browserSync.stream());
});

// Concat CSS Files
gulp.task('concat', function () {
    return gulp.src(config.get('concat.path'))
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(concatCss(config.get('concat.resultCss')))
        .pipe(gulp.dest(config.get('concat.resultPath')));
});

// CSS
gulp.task('css', ['concat'], function () {
    return gulp.src(config.get('css.path'))
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(postcss(processors))
        .pipe(gulp.dest(config.get('css.resultPath')));
});

// Minify CSS
gulp.task('minify-css', ['css'], function () {
    return gulp.src(config.get('minify.path'))
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(
            nano({
                autoprefixer: {}
            })
        )
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

// Browserify
gulp.task('browserify', function () {
    return browserify({
        entries: config.get('browserify.path'),
        debug: true,
        transform: [babelify.configure({presets: ["es2015"]}), vueify]
    })
        .bundle()
        .on('error', errorHandler)
        .pipe(source(config.get('browserify.resultFile')))
        .pipe(gulp.dest(config.get('browserify.resultPath')));
});

// Compress
gulp.task('compress', ['browserify'], function () {
    return gulp.src(config.get('compress.path'))
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(uglify())
        .pipe(gulp.dest(config.get('compress.resultPath')))
        .pipe(notify("JS файл готов!"));
});

gulp.task('fileinclude', function () {
    gulp.src(['./src/html/*.html', '!./src/html/includes/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: './src/html/includes'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('compress-vendor', ['concat-vendor'], function () {
    return gulp.src(config.get('compress.vendorPath'))
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(uglify())
        .pipe(gulp.dest(config.get('compress.resultPath')))
        .pipe(notify("JS Vendor файл готов!"));
});

gulp.task('concat-vendor', function () {
    return gulp.src(config.get('concatVendor.path'))
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(config.get('concatVendor.resultPath')))
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
    gulp.watch("./src/html/**/*.html", ['fileinclude']);
    gulp.watch("*.html").on('change', browserSync.reload);
});