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
var changed = require('gulp-changed');
var buildTimeStart = 0;

gulp.task('hello', function() {
    console.log('Hello Zell');
});

gulp.task('measure:start', function() {
    buildTimeStart = new Date().getTime();
    console.log('Starting build...'+buildTimeStart);
});

gulp.task('measure:end', function() {
    var t = Math.round((new Date().getTime()-buildTimeStart)/1000);
    console.log('Built in ' + t + ' sec');
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

// <autotest>
gulp.task('useref:autotest', function(){
    return gulp.src('pub/autotest/index.html')
        .pipe(useref())
        //не надо минимизировать автотесты
        //.pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('build/autotest'));
});
// </autotest>


// <test_new>
gulp.task('useref:test_new', function(){
    return gulp.src('pub/products/test_new/index.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('build/products/test_new'))
});
gulp.task('images:test_new', function(){
    return gulp.src('pub/products/test_new/i/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('build/products/test_new/i'))
});
// </test_new>

// <test>
gulp.task('useref:test', function(){
    return gulp.src('pub/products/test/index.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('build/products/test'))
});
gulp.task('images:test', function(){
    return gulp.src('pub/products/test/i/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('build/products/test/i'))
});
// </test>


// <root>
gulp.task('useref:root', function(){
    return gulp.src('pub/*.html')
        // пытался оптимизировать
        // .pipe(changed('build'))
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('build'))
});
gulp.task('images:root', function(){
    return gulp.src('pub/i/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('build/i'))
});
gulp.task('controls', function() {
    return gulp.src('pub/controls/**/*')
        .pipe(gulp.dest('build/controls'))
});
gulp.task('templates', function() {
    return gulp.src('pub/templates/**/*')
        .pipe(gulp.dest('build/templates'))
});
gulp.task('fonts', function() {
    return gulp.src('pub/fonts/**/*')
        .pipe(gulp.dest('build/fonts'))
});
gulp.task('lib', function() {
    return gulp.src('pub/lib/**/*.js')
        .pipe(gulp.dest('build/lib'))
});
// </root>


gulp.task('clean:build', function() {
    return del.sync('build');
});


gulp.task('build', function (callback) {
    runSequence('measure:start','clean:build',
        ['useref:root','useref:autotest', 'useref:test_new', 'useref:test', 'images:root', 'fonts', 'templates', 'controls', 'lib'],
        'measure:end','hello',
        callback
    )
});