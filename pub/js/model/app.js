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
     * Был получен при авторизации в ФБ
     * @type {null}
     */
    var accessToken = null;
    /**
     * Время последнего создания бакета
     * Нужно для контроля при пересоздании бакетов, если сессия устарела
     * @type {null}
     */
    var loginTime = null;
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
     * Мобильное устройство или нет
     * @type {undefined}
     */
    var isMob = undefined;
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
            main_desc: 'Interactive content builder',
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
            create_spec: 'Create project for free',
            how_it_helps_to_business: 'Learn how special project<br>can support your business',
            menu_gallery: 'Template gallery',
            my_projects: 'My projects',
            how_it_works: 'How it works',
            contacts: 'Contacts',
            faq: 'FAQ',
            tests: 'Quizes',
            mini_games: 'Mini games',
            fbPanorama: 'Facebook 360°',
            design_your_test: 'Design your nice test based on our templates',
            format_card_test: 'Add your content - and quiz is ready! Set up social networks sharing and statistics.',
            design_your_minigame: 'Create your own games right in browser',
            format_card_minigame: 'Just pick the images and you will get a mini game «Memory»!',
            design_your_pano: 'Surprise your users offering them unique formats',
            format_card_fbpano: 'Upload photo, add marks and post to your Facebook timeline!'
        }
    },
    /**
     * Статус мобильного меню: открыт или закрыт
     * @type {boolean}
     */
    mobileMenuOpened = false;

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
        if (isTouchMobile() === true) {
            document.documentElement.className += " touch";
        }
        else {
            document.documentElement.className += " no-touch";
        }
        if (config.common.facebookAuthEnabled === true) {
            initFB();
        }
        initScripts();
        initUIHandlers();
        initLang('RU');
    }

    /**
     * В зависимости от конфига добавить на страницу доп скрипты типа GA или плагинов для обратной связи
     */
    function initScripts() {
        for (var key in config.scripts) {
            if (config.scripts.hasOwnProperty(key)) {
                var sc = config.scripts[key];
                if (sc.enable === true) {
                    $('body').append(sc.code);
                }
            }
        }
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
        $('.js-mob_menu_switcher').click(function(e) {
            toggleMobileMenu();
        });
    }

    function toggleMobileMenu(e) {
        mobileMenuOpened = !mobileMenuOpened;
        if (mobileMenuOpened === true) {
            $('.js-mob_menu_switcher').addClass('__opened');
            $('#id-mob_menu').show();
            $('#id-page_content').hide();
        }
        else {
            $('.js-mob_menu_switcher').removeClass('__opened');
            $('#id-mob_menu').hide();
            $('#id-page_content').show();
        }
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
     * @param {string} token - fb access token, that was got after authorization
     */
    function initAWS(token) {
        if (config.common.awsEnabled === true) {
            AWS.config.region = config.common.awsRegion;
            bucket = new AWS.S3({
                params: {
                    Bucket: config.common.awsBucketName,
                    CacheControl: 'no-cache'
                }
            });
            bucket.config.credentials = new AWS.WebIdentityCredentials({
                ProviderId: 'graph.facebook.com',
                RoleArn: config.common.awsRoleArn,
                WebIdentityToken: token
            });

            bucketForPublishedProjects = new AWS.S3({
                params: {
                    Bucket: config.common.awsPublishedProjectsBucketName,
                    CacheControl: 'no-cache'
                }
            });
            bucketForPublishedProjects.config.credentials = new AWS.WebIdentityCredentials({
                ProviderId: 'graph.facebook.com',
                RoleArn: config.common.awsRoleArn,
                WebIdentityToken: token
            });

            if (typeof callbacks[AWS_INIT_EVENT] === 'function') {
                callbacks[AWS_INIT_EVENT]();
            }
        }
    }

    /**
     * Создать заново интерфейс для работы с s3, так как сессия может истечь при долгом простое
     * Будет получена ошибка IDPRejectedClaim: Missing credentials in config
     * Тогда нужно вызвать этот метод и попробовать снова
     */
    function relogin() {
        bucket = null;
        bucketForPublishedProjects = null;
        if (new Date().getTime() - loginTime < config.common.RELOGIN_DELAY) {
            // чтобы нельзя было слишком часто перелогиниваться
            return false;
        }
        // fb accessToken надо также пересоздать чтобы заново создать aws buckets
        requestLogin();
        return true;
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
            accessToken = response.authResponse.accessToken;
            // Первый раз должны проинициализировать апи для aws
            if (config.common.awsEnabled === true && bucket === null && bucketForPublishedProjects === null) {
                initAWS(accessToken);
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
            loginTime = new Date().getTime();
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
                    userData = response;
                    updateUI();
                    if (typeof callbacks[USER_DATA_RECEIVED] === 'function') {
                        callbacks[USER_DATA_RECEIVED]('ok');
                    }
                    stat('Testix.me', 'Login', 'Facebook_login', userData.id);
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
            Modal.hideLogin();
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
                Modal.hideLogin();
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
     * @param param.clone
     */
    function openEditor(param) {
        // доступен ли редактор для запуска или только по прямой ссылке
        if (config.common.editorIsUnderConstruction === false ||
            (userData !== null && config.common.editorIsUnderConstructionWhitelist.indexOf(userData.id) >= 0)) {
            if (isMobile() !== true) {
                var url = 'editor.html?';
                if (param.appName) {
                    url += 'app='+param.appName;
                }
                else {
                    if (param.templateUrl) {
                        url += config.common.templateUrlParamName+'='+param.templateUrl+'&';
                    }
                    if (typeof param.clone === 'boolean') {
                        url += config.common.cloneParamName+'='+param.clone+'&';
                    }
                }
                window.location.href = url;
            }
            else {
                // на мобе не запускаем редактор а показываем отдельный экран
                window.location.href = 'blockeditor.html';
            }
        }
        else {
            Modal.showMessage({text: 'Редактор пока что в разработке, напишите нам.'});
        }
    }

    /**
     * Программно открыть линк в новом окне
     *
     * @param {string} url
     */
    function openUrl(url) {
        var win = window.open(url, '_blank');
        win.focus();
    }

    /**
     * Проверка на мобильное устройство по юзер агенту
     * regexp from http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
     *
     * @returns {boolean}
     */
    function isMobile() {
        if (typeof isMob === 'boolean') {
            return isMob;
        }
        isMob = false;
        (function(a){if(/(android|bb\d+|meego|iPad|iPod|iPhone|Windows Phone|BlackBerry|webOS).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))){isMob = true;}})(navigator.userAgent||navigator.vendor||window.opera);
        return isMob;
    };

    /**
     * Устройство с редимом touch чтобы в некоторых местах по другому реализовать взаимодействие
     * @returns {boolean}
     */
    function isTouchMobile() {
        return ("ontouchstart" in document.documentElement) && isMobile()===true;
    }

    /**
     * Отправить событие в систему сбора статистики
     * В html уже включен код инициализации
     *
     * @param {string} category, например Videos
     * @param {string} action, например Play
     * @param {string} [label], например 'Fall Campaign' название клипа
     * @param {number} [value], например 10 - длительность
     */
    function stat(category, action, label, value) {
        if (window.ga) {
            var statData = {
                hitType: 'event',
                eventCategory: category,
                eventAction: action,
            };
            if (label) {
                statData.eventLabel = label;
            }
            if (value) {
                statData.eventValue = value
            }
            window.ga('send', statData);
        }
    };

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
    global.openUrl = openUrl;
    global.relogin = relogin;
    global.isMobile = isMobile;
    global.isTouchMobile = isTouchMobile;
    global.stat = stat;

    // шаблоны. Получить
    global.getUserTemplates = function() { return (userTemplateCollection !== null) ? userTemplateCollection.templates: null; }
    // шаблоны. Запросить с колбеком
    global.requestUserTemplates = requestUserTemplates;
    global.deleteTemplate = deleteTemplate;
})(App);