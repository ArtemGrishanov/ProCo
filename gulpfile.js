/**
 * Created by artyom.grishanov on 02.08.16.
 *
 * Ideas: https://css-tricks.com/gulp-for-beginners/
 */
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var cssnano = require('gulp-cssnano');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('hello', function() {
    console.log('Hello Zell');
});

gulp.task('watch', ['browserSync'], function(){
    // Reloads the browser whenever HTML, CSS or JS files change
    gulp.watch('pub/**/*.html', browserSync.reload);
    gulp.watch('pub/**/*.js', browserSync.reload);
    gulp.watch('pub/**/*.css', browserSync.reload);
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'pub'
        },
    });
});

gulp.task('useref', function(){
    return gulp.src('pub/**/*.html')
        .pipe(useref())
        // Minifies only if it's a JavaScript file
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('build'))
});

gulp.task('images', function(){
    return gulp.src('pub/i/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('build/i'))
});

gulp.task('fonts', function() {
    return gulp.src('pub/fonts/**/*')
        .pipe(gulp.dest('build/fonts'))
});

gulp.task('clean:build', function() {
    return del.sync('build');
});

gulp.task('build', function (callback) {
    runSequence('clean:build',
        ['useref', 'images', 'fonts'],
        callback
    )
});