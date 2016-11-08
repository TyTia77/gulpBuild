const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const uglify = require('gulp-uglify'); //only js
const concat = require('gulp-concat'); //concat css and js
const uglifycss = require('gulp-uglifycss');
const autoprefixer = require('gulp-autoprefixer');
// const pump = require('pump');

//NOTE style
gulp.task('sass', () => {
    return gulp
        .src('./sass/*.scss')
        .pipe(sass())
        .pipe(plumber())
        .pipe(gulp.dest('./styles'));

});

gulp.task('prefix', () =>
    gulp.src('./styles/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./styles/prefix'))
);

gulp.task('csscompress', () => {
    return gulp
        .src('./styles/prefix/*.css')
        .pipe(uglifycss({
          // "maxLineLen": 80,
          "uglyComments":true
        }))
        .pipe(gulp.dest('./dist/styles/'));
});

gulp.task('buildcss',()=>{
  return gulp
    .src('styles/**/*.+(js|css)')
    .pipe(uglifycss({
      // "maxLineLen": 80,
      "uglyComments":true
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('dist/styles'));
});


//NOTE javascript
gulp.task('es6', () => {
    return gulp
        .src('./es6/**/*.js')
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('./scripts'));
});

gulp.task('jsconcat', () => {
    return gulp
        .src('./scripts/**/*.js')
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest('./concat/'));
});

gulp.task('jscompress', () => {
    return gulp
        .src('./concat/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist/scripts/'));
});

//NOTE watch
gulp.task('watch', () => {
    gulp.watch('./sass/*.scss', ['sass']);
    gulp.watch([
        './es6/**/*.js', './es6/*.js'
    ], ['es6']);
});


gulp.task('css',['sass','csscompress']);
gulp.task('java',['es6','jsconcat','jscompress']);
gulp.task('default', ['es6', 'sass', 'watch']);
