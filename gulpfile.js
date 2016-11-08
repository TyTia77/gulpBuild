const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');

const uglify = require('gulp-uglify');
// const pump = require('pump');

gulp.task('sass', () => {
    return gulp
        .src('./sass/*.scss')
        .pipe(sass())
        .pipe(plumber())
        .pipe(gulp.dest('./styles'));

});

gulp.task('es6', () => {
    return gulp
        .src('./es6/**/*.js')
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('./scripts'));
});

gulp.task('watch', () => {
    gulp.watch('./sass/*.scss', ['sass']);
    gulp.watch([
        './es6/**/*.js', './es6/*.js'
    ], ['es6']);
});

gulp.task('compress', () => {
    return gulp
        .src('./scripts/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['es6', 'sass', 'watch']);
