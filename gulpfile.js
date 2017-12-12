/**
 * Created by artyom.grishanov on 02.08.16.
 *
 * Ideas: https://css-tricks.com/gulp-for-beginners/
 *
 * - переключение для локальной среды {{config.common.home}}  pub <-> build
 * - backbone, underscore - положить уже минимиированные файлы от производителей
 *
 * Product build:
 *      - common libs for products
 *      - delete libs from product folders: memori, panoramas
 *      - tstx_cmn_products.css - concat with product styles
 *      - remove and inject
 *
 * - как на публикации проекта это отразится
 *      - config.products.common.publishresources.replace - убрать совсем попробовать
 *      - config.products.common.publishresources оставить только templates/anonymPage/index.html остальные убрать
 * - как на редактировании проекта это отразится
 *      - config.products.trivia.stylesForEmbed - здесь всё остается как есть
 *      - config.products.common.styles посмотреть где используется
 *          если я планирую склеить этот файл с общие стили style.css то по идее ссылка не нужна эта
 *
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
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var version = require('gulp-version-number');

var buildConfig = {
    uglifyJs: true,
    names: {
        distFolder: './build',
        styleFileName: 'css/style.css',
        commonFileName: 'common.js',
        editorFileName: 'editor.js',
        commonLibFileName: 'commonlib.js',
        editorLibFileName: 'editorlib.js'
    },
    products: {
        commonJsFileName: 'app.js',
        libJsFileName: 'lib.js',
    },
    src: {
        html: {
            site: {
                src: ['./pub/*.html'],
                dist: './build'
            },
            controls: {
                src: ['./pub/controls/view/*.html'],
                dist: './build/controls/view'
            },
            templates: {
                src: ['./pub/templates/**/*.html'],
                dist: './build/templates'
            }

        },
        css: {
            srcSite: [
                './pub/css/*.css',
                './pub/controls/css/*.css'
            ]
        },
        js: {
            srcCommonLibs: [
                './pub/lib/aws-cognito-sdk.min.js',
                './pub/lib/amazon-cognito-identity.min.js',
                './pub/lib/clipboard.js',
                './pub/lib/jquery.js',
            ],
            srcEditorLibs: [
                './pub/lib/clipboard.js',
                './pub/lib/FileAPI.min.js',
                './pub/lib/html2canvas.js',
                './pub/lib/jpeg_encoder.js',
                './pub/lib/jscolor.min.js',
                './pub/lib/underscore.js'
            ],
            srcCommon: [
                './pub/lib/jquery.js',
                './pub/js/config.js',
                './pub/js/model/**/*.js',
                './pub/js/view/**/*.js',
                './pub/js/util/*.js'
            ],
            srcEditor: [
                './pub/js/editorui/*.js',
                './pub/js/charts/*.js',
                './pub/controls/**/**/*.js',
            ]
        }
    }
};

var versionConfig = {
    /**
     * Global version value
     * default: %MDS%
     */
    'value' : '%MDS%',
    /**
     * MODE: APPEND
     * Can coexist and replace, after execution to replace
     */
    'append' : {

        /**
         * Parameter
         */
        'key' : '_v',

        /**
         * Whether to overwrite the existing parameters
         * default: 0 (don't overwrite)
         * If the parameter already exists, as a "custom", covering not executed.
         * If you need to cover, please set to 1
         */
        'cover' : 0,

        /**
         * Appended to the position (specify type)
         * {String|Array|Object}
         * If you set to 'all', will apply to all type, rules will use the global setting.
         * If an array or object, will use your custom rules.
         * others will passing.
         *
         * eg:
         *     'js'
         *     ['js']
         *     {type:'js'}
         *     ['css', '%DATE%']
         */
        'to' : [
        /**
         * {String} Specify type, the value is the global value
         */
            'css',
        /**
         * {Array}
         * Specify type, keyword and cover rules will use the global
         * setting, If you need more details, please use the object
         * configure.
         *
         * argument 0 necessary, otherwise passing.
         * argument 1 optional, the value will use the global value
         */
            ['image', '%TS%'],
        /**
         * {Object}
         * Use detailed custom rules to replace, missing items will
         * be taken in setting the global completion
         * type is necessary, otherwise passing.
         */
            {
                'type' : 'js',
                'key' : '_v',
                'value' : '%DATE%',
                'cover' : 1
            }
        ]
    }
};

var productsConfig = [
    {
        productName: 'trivia',
        src: {
            js: ['./pub/products/trivia/**/*.js'],
            html: ['./pub/products/trivia/*.html'],
            css: ['./pub/products/trivia/**/*.css'],
            i: ['./pub/products/trivia/i/**/*.+(png|jpg|jpeg|gif|svg)']
        }
    },
    {
        productName: 'personality',
        src: {
            js: ['./pub/products/personality/**/*.js'],
            html: ['./pub/products/personality/*.html'],
            css: ['./pub/products/personality/**/*.css'],
            i: ['./pub/products/personality/i/**/*.+(png|jpg|jpeg|gif|svg)']
        }
    }
];

/**
 * Список динамически созданных тасков, которые будут использованы как зависимости для таска 'products'
 *
 * Пример: ['trivia', 'personality']
 * @type {Array}
 */
var productTasks = [];


productsConfig.forEach(function (e) {
    console.log('Creating task for build product: ' + e.productName);
    productTasks.push(e.productName);
    gulp.task(e.productName, function() {
        console.log('Building product: ' + e.productName + ', src: ' + e.src.js);
        return gulp.src(e.src.js)
            .pipe(concat(buildConfig.products.commonJsFileName))
            .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
            .pipe(gulp.dest('./build/products/'+ e.productName));
    });
});


gulp.task('products', productTasks);
//gulp.task('products', function() {
//    productsConfig.forEach(function (e) {
//        gulp.start(e.productName);
//    });
//});

gulp.task('version', function() {
    /**
     * By tutorial https://www.npmjs.com/package/gulp-version-number
     */
    return gulp.src('build/**/**/*.html')
        .pipe(version(versionConfig))
        .pipe(gulp.dest('build'));
});

gulp.task('concat:css', function() {
    return gulp.src(buildConfig.src.css.srcSite)
        .pipe(concat(buildConfig.names.styleFileName))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:commonlib', function() {
    return gulp.src(buildConfig.src.js.srcCommonLibs)
        .pipe(concat(buildConfig.names.commonLibFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:editorlib', function() {
    return gulp.src(buildConfig.src.js.srcEditorLibs)
        .pipe(concat(buildConfig.names.editorLibFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:common', function() {
    return gulp.src(buildConfig.src.js.srcCommon)
        .pipe(concat(buildConfig.names.commonFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:editor', function() {
    return gulp.src(buildConfig.src.js.srcEditor)
        .pipe(concat(buildConfig.names.editorFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

/**
 * Delete all development scripts
 * and copy html sources to dist folder
 */
gulp.task('useref:remove', function() {
    return gulp.src(buildConfig.src.html.site.src)
        .pipe(useref())
        .pipe(gulp.dest(buildConfig.src.html.site.dist));
});

/**
 * Просто копирование
 */
gulp.task('copy:templates', function() {
    return gulp.src(buildConfig.src.html.templates.src)
        .pipe(gulp.dest(buildConfig.src.html.templates.dist));
});

/**
 * Просто копирование
 */
gulp.task('copy:controlviews', function() {
    return gulp.src(buildConfig.src.html.controls.src)
        .pipe(gulp.dest(buildConfig.src.html.controls.dist));
});

gulp.task('inject', function () {
    var target = gulp.src(['./build/**/**/*.html']);

    var sourcesStyle = gulp.src(['./build/css/style.css'], {read: false});
    var sourcesCommon = gulp.src(['./build/common.js'], {read: false});
    var sourcesEditor = gulp.src(['./build/editor.js'], {read: false});
    var sourcesEditorLib = gulp.src(['./build/editorlib.js'], {read: false});
    var sourcesCommonLib = gulp.src(['./build/commonlib.js'], {read: false});

    var injectOptionsCommon = {
        name: 'common',
        relative: true
    };
    var injectOptionsEditor = {
        name: 'editor',
        relative: true
    };
    var injectOptionsCommonLib = {
        name: 'commonlib',
        relative: true
    };
    var injectOptionsEditorLib = {
        name: 'editorlib',
        relative: true
    };

    return target
        .pipe(inject(sourcesCommonLib, injectOptionsCommonLib))
        .pipe(inject(sourcesEditorLib, injectOptionsEditorLib))
        .pipe(inject(sourcesCommon, injectOptionsCommon))
        .pipe(inject(sourcesEditor, injectOptionsEditor))
        .pipe(inject(sourcesStyle, {name: 'style', relative: true}))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

//gulp.task('watch', ['browserSync'], function(){
//    // Reloads the browser whenever HTML, CSS or JS files change
//    gulp.watch('pub/**/*.html', browserSync.reload);
//    gulp.watch('pub/**/*.js', browserSync.reload);
//    gulp.watch('pub/**/*.css', browserSync.reload);
//});
//
//gulp.task('browserSync', function() {
//    browserSync.init({
//        server: {
//            baseDir: 'pub'
//        },
//    });
//});

// <autotest>
//gulp.task('useref:autotest', function(){
//    return gulp.src('pub/autotest/index.html')
//        .pipe(useref())
//        //не надо минимизировать автотесты
//        //.pipe(gulpIf('*.js', uglify()))
//        .pipe(gulpIf('*.css', cssnano()))
//        .pipe(gulp.dest('build/autotest'));
//});
// </autotest>


// <test_new>
//gulp.task('useref:test_new', function(){
//    return gulp.src('pub/products/test_new/index.html')
//        .pipe(useref())
//        .pipe(gulpIf('*.js', uglify()))
//        .pipe(gulpIf('*.css', cssnano()))
//        .pipe(gulp.dest('build/products/test_new'))
//});
//gulp.task('images:test_new', function(){
//    return gulp.src('pub/products/test_new/i/**/*.+(png|jpg|jpeg|gif|svg)')
//        .pipe(cache(imagemin({
//            interlaced: true
//        })))
//        .pipe(gulp.dest('build/products/test_new/i'))
//});
// </test_new>

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


//gulp.task('build', function (callback) {
//    runSequence('measure:start','clean:build',
//        ['useref:root','useref:autotest', 'useref:test_new', 'useref:test', 'images:root', 'fonts', 'templates', 'controls', 'lib'],
//        'measure:end','hello',
//        callback
//    )
//});

gulp.task('build', function (callback) {
    runSequence('clean:build',
        'images:root',
        'useref:remove',
        'copy:templates',
        'copy:controlviews',
        'concat:css',
        'concat:commonlib',
        'concat:editorlib',
        'concat:common',
        'concat:editor',
        'inject',
        'version',
        callback
    )
});