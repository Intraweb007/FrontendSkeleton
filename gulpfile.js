var postcss = require('gulp-postcss');
var gulp = require('gulp');
var autoprefixer = require('autoprefixer-core');
var mqpacker = require('css-mqpacker');
var csswring = require('csswring');
var stylus = require('gulp-stylus');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var nib = require('nib');
var jeet = require('jeet');
var rupture = require('rupture');
var spritesmith = require('gulp.spritesmith');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var notify = require("gulp-notify");
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');

// Stylus to CSS
gulp.task('stylus', function () {
    return gulp.src('./src/stylus/collector.styl')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(stylus(
            { use: [nib(), jeet(), rupture()],  import: ['nib', 'jeet', 'rupture']}
        ))
        .pipe(gulp.dest('./src/css'))
        .pipe(browserSync.stream());
});

gulp.task('concat', ['stylus'], function () {
    return gulp.src(['./src/css/*.css', '!./src/css/build.css'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concatCss("build.css"))
        .pipe(gulp.dest('./src/css'));
});

gulp.task('css', ['concat'], function () {
    var processors = [
        autoprefixer({browsers: ['last 3 version']}),
        mqpacker,
        csswring
    ];
    return gulp.src('./src/css/build.css')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dest'));
});

gulp.task('minify-css', ['css'], function() {
    return gulp.src('./dest/build.css')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('dest'))
        .pipe(notify("CSS cкомпилирован!"));
});

// Спрайты
gulp.task('sprite', function () {
    var spriteData = gulp.src('img/icons/*.png').pipe(spritesmith({
        imgName: 'sprites/spritesheet.png',
        cssName: '../src/stylus/sprites.styl',
        retinaSrcFilter: ['img/icons/*-2x.png'],
        retinaImgName: 'sprites/spritesheet.retina-2x.png',
        imgPath: "../img/sprites/spritesheet.png",
        retinaImgPath: "../img/sprites/spritesheet.retina-2x.png"
    }));
    return spriteData.pipe(gulp.dest('./img'));
});

// Скрипты
gulp.task('scripts', function() {
    return gulp.src([
        './src/js/plugins.js',
        './src/js/main.js'
    ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('build.js'))
        .pipe(gulp.dest('./dest/'));
});

gulp.task('compress', ['scripts'], function() {
    return gulp.src('./dest/build.js')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dest'))
        .pipe(notify("JS файл готов!"));
});


// Действие по умолчанию
gulp.task('default', function(){
    gulp.start('minify-css', 'compress');
});

// Сервер
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("src/stylus/**/*.styl", ['stylus']);
    gulp.watch("src/css/**/*.css", ['minify-css']);
    gulp.watch("src/js/**/*.js", ['compress']);
    gulp.watch("dest/build.css").on('change', browserSync.reload);
    gulp.watch("dest/build.js").on('change', browserSync.reload);
    gulp.watch("*.html").on('change', browserSync.reload);
});

var onError = function (err) {
    gutil.beep();
    console.log(err);
};