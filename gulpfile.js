/**
 * Created by artyom.grishanov on 02.08.16.
 *
 * Product build:
 *      - delete libs from product folders: memori, panoramas
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
var productVersion = 'v2.1.1';


var gulp = require('gulp');
var gutil = require('gulp-util');
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
var injectString = require('gulp-inject-string');
var replace = require('gulp-string-replace');
var uniqid = require('uniqid');
var argv = require('yargs').argv;

/**
 * Pass environment into this script: 'gulp build --prod'
 */
var environment = 'dev';
if (argv.prod === true) environment = 'prod';
if (argv.test === true) environment = 'test';

var robotsFolder = (environment === 'prod') ? '/robots/testix.me/*': '/robots/test.testix.me/*';

var buildUniqId = uniqid();
buildUniqId = buildUniqId.substring(buildUniqId.length-6,buildUniqId.length);

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
        libJsSrc: [
            './pub/products/common/js/jquery.js',
            './pub/products/common/js/underscore-min.js',
            './pub/products/common/js/backbone-min.js',
            './pub/products/common/js/mutapp.js'
        ],
        libJsFileName: 'lib.js',
        libDest: './build/products/common/js',
        commonCss: ['./pub/products/common/css/tstx_cmn_products.css'], // must be array
        commonCssFileName: 'style.css'
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

/**
 * Скрипты (например статистика) которые надо вставить в продакшн версию
 * @type {{ga: string, yaMetrika: string}}
 */
var scriptsToEmbed = {
    ga: {
        environments: ['prod'],
        anchor: '<!--ga-->',
        code: '<script>(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");ga("create", "UA-88595022-1", "auto");ga("send", "pageview");</script>'
    },
    yaMetrika: {
        environments: ['prod'],
        anchor: '<!--yametrika-->',
        code: '<!-- Yandex.Metrika counter --><script type="text/javascript">(function (d, w, c) {(w[c] = w[c] || []).push(function() {try {w.yaCounter37720792 = new Ya.Metrika({id:37720792,clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});} catch(e) { }});var n = d.getElementsByTagName("script")[0],s = d.createElement("script"),f = function () { n.parentNode.insertBefore(s, n); };s.type = "text/javascript";s.async = true;s.src = "https://mc.yandex.ru/metrika/watch.js";if (w.opera == "[object Opera]") {d.addEventListener("DOMContentLoaded", f, false);} else { f(); }})(document, window, "yandex_metrika_callbacks");</script><noscript><div><img src="https://mc.yandex.ru/watch/37720792" style="position:absolute; left:-9999px;" alt="" /></div></noscript><!-- /Yandex.Metrika counter -->'
    },
    fbPixel: {
        environments: ['prod'],
        anchor: '<!--fbpixel-->',
        code: '<!-- Facebook Pixel Code --><script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");fbq("init", "1456263851069324");fbq("track", "PageView");</script><noscript><img height="1" width="1" style="display:none"src="https://www.facebook.com/tr?id=1456263851069324&ev=PageView&noscript=1"/></noscript><!-- DO NOT MODIFY --><!-- End Facebook Pixel Code -->'
    },
    fbTrackEditor: {
        environments: ['prod'],
        anchor: '<!--fbtrackeditor-->',
        code: '<script>fbq("track", "editor.html");</script>'
    },
    fbViewContent: {
        environments: ['prod'],
        anchor: '<!--fbviewcontent-->',
        code: '<script>fbq("track", "ViewContent", {value: 1.0,currency: "USD"});</script>'
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
        'key' : '_v',
        'cover' : 0,
        'to' : [
            'css', 'js'
        ]
    }
};

var productsConfig = [
    {
        productName: 'trivia',
        src: {
            js: ['./pub/products/trivia/**/*.js'],
            html: ['./pub/products/trivia/*.html'],
            css: ['./pub/products/trivia/**/*.css']
        }
    },
    {
        productName: 'personality',
        src: {
            js: ['./pub/products/personality/**/*.js'],
            html: ['./pub/products/personality/*.html'],
            css: ['./pub/products/personality/**/*.css']
        }
    },
    {
        productName: 'memoriz',
        src: {
            js: ['./pub/products/memoriz/**/*.js'],
            html: ['./pub/products/memoriz/*.html'],
            css: ['./pub/products/memoriz/**/*.css']
        }
    },
    {
        productName: 'fbPanorama',
        src: {
            js: [
                './pub/products/fbPanorama/three.min.js',
                './pub/products/fbPanorama/D.min.js',
                './pub/products/fbPanorama/uevent.min.js',
                './pub/products/fbPanorama/doT.min.js',
                './pub/products/fbPanorama/photo-sphere-viewer.min.js',
                './pub/products/fbPanorama/model/*.js',
                './pub/products/fbPanorama/view/*.js',
                './pub/products/fbPanorama/drawing.js',
                './pub/products/fbPanorama/panoconfig.js',
                './pub/products/fbPanorama/app.js'
            ],
            html: ['./pub/products/fbPanorama/*.html'],
            css: ['./pub/products/fbPanorama/**/*.css'],
            i: ['./pub/products/fbPanorama/**/*.+(png|jpg|jpeg|gif|svg)']
        }
    },
    {
        productName: 'photostory',
        src: {
            js: ['./pub/products/photostory/**/*.js'],
            html: ['./pub/products/photostory/*.html'],
            css: ['./pub/products/photostory/**/*.css']
        }
    }
];

/**
 * Список динамически созданных тасков, которые будут использованы как зависимости для таска 'products'
 *
 * Пример: ['trivia:js', 'trivia:html', 'personality:js', 'personality:html'...]
 * @type {Array}
 */
var productTasks = [];

// создать динамис=чески таски для сборки MutApp приложений
productsConfig.forEach(function (e) {
    console.log('Creating task for build product: ' + e.productName);

    var productJsTaskName = e.productName+':js';
    productTasks.push(productJsTaskName);
    gulp.task(productJsTaskName, function() {
        console.log('Building product js: ' + e.productName + ', src: ' + e.src.js);
        return gulp.src(e.src.js)
            .pipe(concat(buildConfig.products.commonJsFileName))
            .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
            .pipe(gulp.dest('./build/products/'+ e.productName));
    });

    var productJsTaskName = e.productName+':css';
    productTasks.push(productJsTaskName);
    gulp.task(productJsTaskName, function() {
        console.log('Building product css: ' + e.productName + ', src: ' + e.src.css);
        return gulp.src(buildConfig.products.commonCss.concat(e.src.css)) // два массива склеиваются
            .pipe(concat(buildConfig.products.commonCssFileName))
            .pipe(gulpIf('*.css', cssnano({zindex: false})))
            .pipe(gulp.dest('./build/products/'+ e.productName));
    });

    var productHtmlTaskName = e.productName+':html';
    productTasks.push(productHtmlTaskName);
    gulp.task(productHtmlTaskName, function() {
        console.log('Building product html: ' + e.productName + ', src: ' + e.src.html);
        var srclib = gulp.src(['./build/products/common/js/lib.js'], {read: false});
        var srcapp = gulp.src(['./build/products/'+ e.productName + 'app.js'], {read: false});
        return gulp.src(e.src.html)
            .pipe(useref())
            // выбрал gulp-inject-string вместо gulp-inject, так как в последнем получаются громадные относительные пути
            .pipe(injectString.replace('<!-- build:lib:js -->', '<script type="text/javascript" src="../common/js/lib.js"></script>'))
            .pipe(injectString.replace('<!-- build:app:js -->', '<script type="text/javascript" src="app.js"></script>'))
            //.pipe(inject(srclib, {name: 'lib', relative: true, ignorePath: '../../build/products/'}))
            //.pipe(inject(srcapp, {name: 'app', relative: true, ignorePath: '../../../build/products/'+ e.productName+'/'}))
            .pipe(version(versionConfig))
            .pipe(gulp.dest('./build/products/'+ e.productName));
    });

    if (e.src.i) {
        var productImgTaskName = e.productName+':i';
        productTasks.push(productImgTaskName);
        gulp.task(productImgTaskName, function() {
            console.log('Building product img: ' + e.productName + ', src: ' + e.src.i);
            return gulp.src(e.src.i)
                .pipe(cache(imagemin({
                    interlaced: true
                })))
                .pipe(gulp.dest('./build/products/'+ e.productName));
        });
    }
});

/**
 *
 */
gulp.task('products:lib', function() {
    return gulp.src(buildConfig.products.libJsSrc)
        .pipe(concat(buildConfig.products.libJsFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest(buildConfig.products.libDest));
});

gulp.task('uniq', function() {
    console.log(uniqid('html_'));
    console.log(uniqid('html_'));
    console.log(uniqid('html_'));
    console.log(uniqid('html_'));
    console.log(uniqid('html_'));
});

/**
 *
 */
gulp.task('products', productTasks);

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
        .pipe(gulpIf('*.css', cssnano({zindex: false})))
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:commonlib', function() {
    return gulp.src(buildConfig.src.js.srcCommonLibs)
        .pipe(concat(buildConfig.names.commonLibFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:editorlib', function() {
    return gulp.src(buildConfig.src.js.srcEditorLibs)
        .pipe(concat(buildConfig.names.editorLibFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:common', function() {
    // в рамках сборки основного js, заменим путь для локальной сборки
    return gulp.src(buildConfig.src.js.srcCommon)
        .pipe(concat(buildConfig.names.commonFileName))
        .pipe(replace('http://localhost:63342/ProCo/pub/', 'http://localhost:63342/ProCo/build/'))
        //.pipe(replace('buildStatus: "development"', 'buildStatus: "production"'))
        .pipe(replace('{{js_product_environment}}', environment))
        .pipe(replace('{{js_product_version}}', productVersion))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

gulp.task('concat:editor', function() {
    return gulp.src(buildConfig.src.js.srcEditor)
        .pipe(concat(buildConfig.names.editorFileName))
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(gulp.dest(buildConfig.names.distFolder));
});

/**
 * Delete all development scripts
 * and copy html sources to dist folder
 */
gulp.task('useref:site', function() {
    return gulp.src(buildConfig.src.html.site.src)
        .pipe(useref())
        .pipe(injectString.replace('<!--product_version-->', productVersion))
        // Скрипты вставляем только пр и сборке нужной среды: например статистика будет считаться только на проде
        .pipe(gulpIf(scriptsToEmbed.ga.environments.indexOf(environment) >= 0, injectString.replace(scriptsToEmbed.ga.anchor, scriptsToEmbed.ga.code)))
        .pipe(gulpIf(scriptsToEmbed.ga.environments.indexOf(environment) >= 0, injectString.replace(scriptsToEmbed.yaMetrika.anchor, scriptsToEmbed.yaMetrika.code)))
        .pipe(gulpIf(scriptsToEmbed.ga.environments.indexOf(environment) >= 0, injectString.replace(scriptsToEmbed.fbPixel.anchor, scriptsToEmbed.fbPixel.code)))
        .pipe(gulpIf(scriptsToEmbed.ga.environments.indexOf(environment) >= 0, injectString.replace(scriptsToEmbed.fbTrackEditor.anchor, scriptsToEmbed.fbTrackEditor.code)))
        .pipe(gulpIf(scriptsToEmbed.ga.environments.indexOf(environment) >= 0, injectString.replace(scriptsToEmbed.fbViewContent.anchor, scriptsToEmbed.fbViewContent.code)))
        .pipe(gulp.dest(buildConfig.src.html.site.dist));
});

gulp.task('useref:blog', function() {
    return gulp.src('./pub/blog/**/*.html')
        .pipe(useref())
        .pipe(injectString.replace('<!--product_version-->', productVersion))
        .pipe(gulp.dest('./build/blog'));
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

/**
 * Просто копирование
 */
gulp.task('copy:prices', function() {
    return gulp.src('./pub/prices/**/*')
        .pipe(gulp.dest('./build/prices'));
});

/**
 * Просто копирование
 */
gulp.task('copy:robots', function() {
    return gulp.src('./pub'+robotsFolder)
        .pipe(gulp.dest('./build'));
});

/**
 * Просто копирование
 */
gulp.task('copy:favicon', function() {
    return gulp.src('./pub/favicon.ico')
        .pipe(gulp.dest('./build'));
});

/**
 * loader.js собирается отдельно
 * Он должен остаться отдельным минифицированным файлом
 */
gulp.task('build:loader', function() {
    return gulp.src('./pub/js/loader.js')
        .pipe(gulpIf(buildConfig.uglifyJs, uglify()))
        .pipe(gulp.dest('./build/js'));
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

gulp.task('images:root', function(){
    return gulp.src(['pub/i/**/*.+(png|jpg|jpeg|gif|svg)', 'pub/controls/i/**/*.+(png|jpg|jpeg|gif|svg)'])
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('build/i'))
});

gulp.task('images:blog', function(){
    return gulp.src(['pub/blog/**/*.+(png|jpg|jpeg|gif|svg)'])
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('build/blog'))
});

//gulp.task('controls', function() {
//    return gulp.src('pub/controls/**/*')
//        .pipe(gulp.dest('build/controls'))
//});
//gulp.task('templates', function() {
//    return gulp.src('pub/templates/**/*')
//        .pipe(gulp.dest('build/templates'))
//});
//gulp.task('fonts', function() {
//    return gulp.src('pub/fonts/**/*')
//        .pipe(gulp.dest('build/fonts'))
//});
//gulp.task('lib', function() {
//    return gulp.src('pub/lib/**/*.js')
//        .pipe(gulp.dest('build/lib'))
//});
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
        'images:blog',
        'useref:site',
        'useref:blog',
        'copy:robots',
        'copy:prices',
        'copy:favicon',
        'copy:templates',
        'copy:controlviews',
        'build:loader',
        'concat:css',
        'concat:commonlib',
        'concat:editorlib',
        'concat:common',
        'concat:editor',
        'inject',
        'version',
        'products:lib',
        'products',
        callback
    )
});