/**
 * Created by artyom.grishanov on 18.04.16.
 *
 * Основной объект управления приложением.
 *
 * Организация проекта простая, исходя из того что нет бекенда:
 * 1. На каждой странице инициализируем App, в котором собраны ключевые функции.
 * 1.1 FB апи.
 * 1.2 AWS апи.
 * 1.3 Функции локализации
 * 1.4 Множество UI обработчиков (применяются, понятно, только актуальные для страницы)
 * 2. В верстке каждой страницы: избыточность и повторы.
 *
 *
 * Дальше:
 * TODO вынести обработчики в view-контроллеры, в модели только работа с данными
 * TODO заменить на серверные шаблоны.
 * TODO авторизация: будет замена на свою куку вместо запроса к ФБ каждый раз
 *
 */

/**
 * AWS bucket доступен для работы
 * @type {string}
 */
var AWS_INIT_EVENT = 'AWS_INIT_EVENT';
/**
 *
 * @type {string}
 */
var FB_CONNECTED = 'FB_CONNECTED';
/**
 *
 * @type {string}
 */
var USER_DATA_RECEIVED = 'USER_DATA_RECEIVED';
///**
// * Был загружен список шаблонов пользователя
// * Например, можно начинать рисовать список шаблонов пользователя
// * @type {string}
// */
//var USER_TEMPLATES_LIST_RECEIVED = 'USER_TEMPLATES_LIST_RECEIVED';
///**
// * Вызывается на каждый загруженный шаблон индивидуально
// * @type {string}
// */
//var USER_TEMPLATES_LIST_RECEIVED = 'USER_TEMPLATE_INFO_RECEIVED';

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
     * Статус который возвращает FB api (например connected - подключено)
     * @type {null}
     */
    var responseStatus = null;
    /**
     * Сохраненные проекты пользователя
     * Коллекция шаблонов пользователя
     */
    var userTemplateCollection = null;
    /**
     * апи для работы со aws хранилищем
     *
     * @type {object}
     */
    var bucket = null;
    var bucketForPublishedProjects = null;
    /**
     * Обработчики на события внутри App
     * Например, на инициализацию апи AWS
     *
     * @type {{function}}
     */
    var callbacks = {};
    /**
     * Язык который стоит в интерфейсе по умолчанию
     * @type {string}
     */
    var defaultLang = 'RU';
    /**
     *
     * @type {{}}
     */
    var dict = {
        'RU': {

        },
        'EN': {
            main_desc: 'Create quizes and<br>other special projects online',
            special_what_is_it: 'What special project is?',
            business_solutions: 'Business solutions',
            spec_descr: 'Special projects are quizes, timelines, infografics and other formats. They can easily tell about complex topics, and using game ways frequently.',
            buss_descr: 'It\'s a good alternative to the standart ad formats. Create effective special projects to support your brand, which can be shared by people in social netwoks.',
            to_bloggers: 'Bloggers',
            to_media: 'Media',
            to_companies: 'Companies',
            surprise_them: 'Surprise your users offering them unusual formats',
            attract_new_readers: 'Use special projects to attract new followers',
            increase_reach: 'Increase your reach due to the viral effect of a special project',
            your_design: 'Special project with your design',
            choose_template: 'Select an appropriate template from the library and customize it according to your tasks.',
            spec_in_one_touch: 'Special projects with one touch',
            editor_desc: 'Convenient online Testix editor allows you to create high-quality quiz without programming skills,<br>and intuitive interface allows a designer to do without.',
            idea_publish: 'One step from idea to publication',
            create_in_blowser: 'Create special projects directly in your browser.<br>Get a link to your test or the code to insert into your website or blog.',
            learn_more: 'Want to know more about Testix? Write to us!',
            send_message: 'Send message',
            watch_video: 'Video',
            create_spec: 'Create project',
            how_it_helps_to_business: 'Learn how special project<br>can support your business'
        }
    };

    /**
     * Забрать из верстки тексты и сложить в словарь
     * @param lang
     */
    function initLang(lang) {
        if (dict.hasOwnProperty(lang)) {
            var elements = $('.pts_string');
            for (var i = 0; i < elements.length; i++) {
                var classes = $(elements[i]).attr('class');
                var reg = /pts_([A-z0-9]+)/ig;
                var match = null;
                while (match = reg.exec(classes)) {
                    if (match[0] && match[1] && match[1] !== 'string')  {
                        var key = match[1];
                        if (dict[lang].hasOwnProperty(key) === false) {
                            dict[lang][key] = $('.pts_'+key).html();
                        }
                        break;
                    }
                }
            }
        }
    }

    function setLang(lang) {
        if (dict.hasOwnProperty(lang)) {
            for (var key in dict[lang]) {
                if (dict[lang].hasOwnProperty(key)) {
                    $('.pts_'+key).html(dict[lang][key]);
                }
            }
        }
    }

    function start() {
        if (config.common.facebookAuthEnabled === true) {
            initFB();
        }
        initUIHandlers();
        initLang('RU');
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
        $('.js-show_login').click(function(){
            Modal.showLogin();
        });
        $('.js-video').click(function() {
            $('#id-video').show();
            if (document.getElementById('id-videoplayer')) {
                // standar <video> tag controls
                document.getElementById('id-videoplayer').play();
            }
        });
        $('.js-video_close').click(function() {
            $('#id-video').hide();
            if (document.getElementById('id-videoplayer')) {
                // standar <video> tag controls
                document.getElementById('id-videoplayer').pause();
            }
        });
        $('.js-lang').click(function(e){
            var $e = $(e.currentTarget);
            $('.js-lang').removeClass('__active');
            $e.addClass('__active');
            setLang($e.attr('data-lang'));
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
                // если приложение в тестовом режиме, то пользователь должен быть добавлен в приложение руками
                // иначе никакого колбека не будет, ни с каким статусом
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

            bucketForPublishedProjects = new AWS.S3({
                params: {
                    Bucket: config.common.awsPublishedProjectsBucketName
                }
            });
            bucketForPublishedProjects.config.credentials = new AWS.WebIdentityCredentials({
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
        responseStatus = response.status;
        if (response.status === 'connected') {
            // событие: установлена свзяь с фб, пользователь вошел
            if (typeof callbacks[FB_CONNECTED] === 'function') {
                callbacks[FB_CONNECTED]('connected');
            }
            // Logged into your app and Facebook.
            if (userData === null) {
                getUserInfo();
            }
            // Первый раз должны проинициализировать апи для aws
            if (config.common.awsEnabled === true && bucket === null && bucketForPublishedProjects === null) {
                initAWS(response.authResponse.accessToken);
            }
        } else {
            userData = null;
            bucket = null;
            bucketForPublishedProjects = null;
            if (typeof callbacks[FB_CONNECTED] === 'function') {
                callbacks[FB_CONNECTED]('not_authorized, unknown');
            }
            //not_authorized, unknown
        }
        updateUI();
    }

    /**
     * Запросить логин у FB апи
     */
    function requestLogin() {
        if (FB) {
            FB.login(function(response) {
                statusChangeCallback(response);
            }, {scope:'user_friends,email'});
        }
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
                    if (typeof callbacks[USER_DATA_RECEIVED] === 'function') {
                        callbacks[USER_DATA_RECEIVED]('ok');
                    }
                    //getFriends();
            });
        }
    }

    /**
     * Get friends
     */
    function getFriends() {
        if (FB) {
            FB.api(userData.id+'/friends',
                {fields: "id,about,age_range,picture,bio,birthday,context,email,first_name,gender,hometown,link,location,middle_name,name,timezone,website,work"},
                function(response) {
                    console.log('Successful getfriends');
                });
        }
    }

    /**
     * Обработчик клика на любую кнопку с классом js-login
     */
    function onFBLoginClick() {
        requestLogin();
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
            // $('#id-modal_cnt').empty().hide();
        }
        else {
            if (responseStatus === 'connected') {
                $('.js-show_login').hide();
                $('.js-login').hide();
            }
            else {
                $('.js-show_login').show();
                $('.js-login').show();
            }
            $('.js-user_ctx_menu').hide();
            $('.js-profile_picture').empty().hide();
            $('.js-user_name').text('');
            $('.js-authorization_status').text('Not logged');
        }
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

    /**
     * Запросить шаблоны пользователя
     *
     * @param {function} onTemplateListLoaded
     * @param {function} onTemplateInfoLoaded
     */
    function requestUserTemplates(onTemplateListLoaded, onTemplateInfoLoaded) {
        if (App.getUserData() !== null) {
            userTemplateCollection = new TemplateCollection({
                // каталог с шаблонами который надо загружать
                folder: 'facebook-'+App.getUserData().id+'/app'
            });
            userTemplateCollection.loadTemplateList(function() {
                if (onTemplateListLoaded) {
                    onTemplateListLoaded(userTemplateCollection.templates);
                }
                // небольшая пауза - даем отрисовать список шаблонов
                setTimeout(function(){
                    userTemplateCollection.loadTemplatesInfo(function(template) {
                        // получена информация по одному шаблоны
                        if (onTemplateInfoLoaded) {
                            onTemplateInfoLoaded(template);
                        }
                    });
                }, 200);
            });
        }
        else {
            App.showLogin();
        }
    }

    /**
     * Удалить шаблон с сервера и из коллекции локально
     *
     * @param {function} callback
     * @param {string} templateId
     */
    function deleteTemplate(callback, templateId) {
        //запрос на амазон на удаление
        //плюс локально удалить из коллекции
        if (userTemplateCollection) {
            userTemplateCollection.delete(function(result){
                callback(result);
            }, templateId);
        }
    }

    /**
     * Запуск редактора с параметрами
     *
     * @param param.appName
     * @param param.templateUrl
     * @param param.needNewId
     * @param param.clone
     */
    function openEditor(param) {
        // доступен ли редактор для запуска или только по прямой ссылке
        if (config.common.editorIsUnderConstruction === false ||
            (userData !== null && config.common.editorIsUnderConstructionWhitelist.indexOf(userData.id) >= 0)) {
            var url = 'editor.html?';
            if (param.appName) {
                url += 'app='+param.appName;
            }
            else {
                if (param.templateUrl) {
                    url += config.common.templateUrlParamName+'='+param.templateUrl+'&';
                }
                if (typeof param.needNewId === 'boolean') {
                    url += config.common.needNewIdParamName+'='+param.needNewId+'&';
                }
                if (typeof param.clone === 'boolean') {
                    url += config.common.cloneParamName+'='+param.clone+'&';
                }
            }
            window.location.href = url;
        }
        else {
            Modal.showMessage({text: 'Редактор пока что в разработке, напишите нам.'});
        }
    }

//    /**
//     * Вернуть анонимный ид пользователя рассчитанный на основе его FB ид
//     * @return {string}
//     */
//    function getUserAnonimId() {
//        if (userData) {
//            return MD5.calc('fb-'+userData.id).substr(0,8);
//        }
//        return null;
//    }

    // public methoods below
    global.start = start;
    // global.getUserAnonimId = getUserAnonimId;
    global.getUserData = function() { return userData; };
    global.getAWSBucket = function() { return bucket; };
    global.getAWSBucketForPublishedProjects = function() { return bucketForPublishedProjects; };
    global.getDict = function() { return dict; };
    global.on = on;
    global.getFriends = getFriends;
    global.requestLogin = requestLogin;
    global.openEditor = openEditor;

    // шаблоны. Получить
    global.getUserTemplates = function() { return (userTemplateCollection !== null) ? userTemplateCollection.templates: null; }
    // шаблоны. Запросить с колбеком
    global.requestUserTemplates = requestUserTemplates;
    global.deleteTemplate = deleteTemplate;
})(App);