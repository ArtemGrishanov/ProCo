/**
 * Created by artyom.grishanov on 18.04.16.
 *
 * Основной объект управления приложением.
 *
 */
var AWS_INIT_EVENT = 'AWS_INIT_EVENT';
var FB_INIT_EVENT = 'FB_INIT_EVENT';

var App = App || {};
(function(global){

    /**
     * id
     * name
     * first_name
     * gender
     * picture.data.url
     * email
     * etc..
     *
     * @type {object}
     */
    var userData = null;
    /**
     * апи для работы со aws хранилищем
     *
     * @type {object}
     */
    var bucket = null;
    /**
     * Обработчики на события внутри App
     * Например, на инициализацию апи AWS
     *
     * @type {{function}}
     */
    var callbacks = {};

    function start() {
        if (config.common.facebookAuthEnable === true) {
            initFB();
        }
        initUIHandlers();
    }

    /**
     * Привязать стандартные обработчики событий в интерфейсе
     *
     * .js-login
     * .js-logout
     * .js-show_login
     */
    function initUIHandlers() {
        $('#id-user_toolbar').off('click').click(function() {
            var e = $('#id-user_ctx_menu');
            if (e.css('display') === 'none') {
                e.show();
            }
            else {
                e.hide();
            }
        });
        $('.js-logout').click(onLogoutClick);
        $('.js-login').click(onFBLoginClick);
        $('.js-show_login').click(showLogin);
        //TODO этим должен управлять контроллер окна
        $('.js-close').click(function() {
            $('#id-modal_cnt').empty();
        });
        $('.js-video').click(function() {
            $('#id-video').show();
            document.getElementById('id-videoplayer').play();
        });
        $('.js-video_close').click(function() {
            $('#id-video').hide();
            document.getElementById('id-videoplayer').pause();
        });
    }

    /**
     * Инициализация js fb sdk
     */
    function initFB() {
        window.fbAsyncInit = function() {
            FB.init({
                appId      : config.common.facebookAppId,
                cookie     : true,  // enable cookies to allow the server to access
                // the session
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.5' // use graph api version 2.5
            });
            // Now that we've initialized the JavaScript SDK, we call
            // FB.getLoginStatus().  This function gets the state of the
            // person visiting this page and can return one of three states to
            // the callback you provide.  They can be:
            //
            // 1. Logged into your app ('connected')
            // 2. Logged into Facebook, but not your app ('not_authorized')
            // 3. Not logged into Facebook and can't tell if they are logged into
            //    your app or not.
            //
            // These three cases are handled in the callback function.
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        };
        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }

    /**
     * Инициализация апи для работы с хранилищем Amazon
     * Должна проходить после успешной авторизации через фб, так как нужен user_id
     *
     * @param {string} accessToken - fb access token, that was got after authorization
     */
    function initAWS(accessToken) {
        if (config.common.awsEnabled === true) {
            AWS.config.region = config.common.awsRegion;
            bucket = new AWS.S3({
                params: {
                    Bucket: config.common.awsBucketName
                }
            });
            bucket.config.credentials = new AWS.WebIdentityCredentials({
                ProviderId: 'graph.facebook.com',
                RoleArn: config.common.awsRoleArn,
                WebIdentityToken: accessToken
            });
            if (typeof callbacks[AWS_INIT_EVENT] === 'function') {
                callbacks[AWS_INIT_EVENT]();
            }
        }
    }

    /**
     * Проверить состояние логина пользвателя.
     * Если пользователь незалогинен, то запросить логин
     */
    function checkLoginState() {
        if (FB) {
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        }
    }

    /**
     * This is called with the results from from FB.getLoginStatus().
     *
     * @param response
     */
    function statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            if (userData === null) {
                getUserInfo();
            }
            // Первый раз должны проинициализировать апи для aws
            if (config.common.awsEnabled === true && bucket === null) {
                initAWS(response.authResponse.accessToken);
            }
        } else {
            userData = null;
            bucket = null;
            //not_authorized unknown
            if (typeof callbacks[FB_INIT_EVENT] === 'function') {
                callbacks[FB_INIT_EVENT]('unknown');
            }
        }
        updateUI();
    }

    /**
     * Request basic info from fb api
     */
    function getUserInfo() {
        if (FB) {
            userData = null;
            FB.api('/me',
                {fields: "id,about,age_range,picture,bio,birthday,context,email,first_name,gender,hometown,link,location,middle_name,name,timezone,website,work"},
                function(response) {
                console.log('Successful login for: ' + response.name);
                userData = response;
                updateUI();
                if (typeof callbacks[FB_INIT_EVENT] === 'function') {
                    callbacks[FB_INIT_EVENT]('ok');
                }
            });
        }
    }

    /**
     * Обработчик клика на любую кнопку с классом js-login
     */
    function onFBLoginClick() {
        if (FB) {
            FB.login(function(response) {
                statusChangeCallback(response);
            });
        }
    }

    /**
     * Кликнули на кнопку разлогина
     */
    function onLogoutClick() {
        if (FB) {
            FB.logout(function(response) {
                // Person is now logged out
                statusChangeCallback(response);
            });
        }
    }

    /**
     * Обновить станлартные компоненты UI на основе пользовательских данных
     * Реализуется поведение по умолчанию
     *
     * .js-profile_picture
     * .js-user_name
     * .js-authorization_status
     */
    function updateUI() {
        if (userData) {
            $('.js-login').hide();
            $('.js-show_login').hide();
            $('.js-user_ctx_menu').show().find('#id-user_ctx_menu').hide();
            $('.js-profile_picture').show().empty().append('<img src="' + userData.picture.data.url + '"> ');
            $('.js-user_name').text(userData.name);
            $('.js-authorization_status').text('Thanks for logging in, ' + userData.name + '!');
            //TODO показать/скрыть кнопку Выйти/Войти
            // ава показать-заменить на кнопку войти
            //
            $('#id-modal_cnt').empty();
        }
        else {
            $('.js-login').show();
            $('.js-show_login').show();
            $('.js-user_ctx_menu').hide();
            $('.js-profile_picture').empty().hide();
            $('.js-user_name').text('');
            $('.js-authorization_status').text('Not logged');
        }
    }

    /**
     * Показать окно с приглашением к логину и различными способами логина
     */
    function showLogin() {
        $('#id-modal_cnt').load('templates/login.html', function() {
             initUIHandlers();
        })
    }

    /**
     *
     * TODO: Ограничение - один колбек на одно событие. В Engine.js уже есть такой паттерн, просто надо вынести в отдельный класс.
     *
     * @param event
     * @param callback
     */
    function on(event, callback) {
        callbacks[event] = callback;
    }

    // public methoods below
    global.start = start;
    global.getUserData = function() { return userData; };
    global.getAWSBucket = function() { return bucket; };
    global.showLogin = showLogin;
    global.on = on;
})(App);