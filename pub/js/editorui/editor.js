/**
 * Created by artyom.grishanov on 28.12.15.
 */

var Editor = {};

(function(global) {
    /**
     * Уникальный ид проекта
     * Также это имя файла, которое будет использовано при сохранении
     * @type {string}
     */
    var appId = null;
    /**
     * Строковый идентификатор открытого проекта: test, timeline и тд
     * @type {string}
     */
    var appName = null;
    /**
     * текущий шаблон, который открыт. Шаблона может не быть, тогда используются свойства из кода проекта
     * @type {object} {appName: <string>, app: <object>, descriptor: <object>}
     */
    var appTemplate = null;
    /**
     * Коллекция для управления открытыми шаблонами
     * На самом деле в ней один шаблон
     * @type {null}
     */
    var openedTemplateCollection = new TemplateCollection();
    /**
     * Дата публикации во время сессии
     * Если публикации не было во время сесии - остается null
     * @type {string}
     */
    var sessionPublishDate = null;
    /**
     * Картинка для проекта, которая была загружена во время сессии
     * Если ничего нового не было загружено, то null
     * @type {string}
     */
    var sessionPreviewUrl = null;
    /**
     * Создание и сохранение шаблонов. Запуск автотестов.
     * @type {boolean}
     */
    //TODO
    var devMode = true;
    var appIframe = null;
    var iframeWindow = null;
    /**
     * Диалог с выбором ресурсов (картинки). Можно зааплоадить, запросить список с сервера и выбрать картинку
     * @type {object}
     */
    var resourceManager = null;
    /**
     * Ид экранов которые показаны в данный момент в рабочем поле
     * @type {Array.<string>}
     */
    var activeScreenIds = [];
    /**
     * Один контрол для управления экранами промо приложения
     * превью, управления порядком, добавление и удаление
     * @type {Array.<SlideGroupControl>}
     */
    var slideGroupControls = null;
    /**
     * При показе экрана инициализируется набор триггеров.
     * В массиве собраны триггеры, активные на данный момент.
     * Триггеры могут быть в нескольких состояниях.
     *
     * @type {Array}
     */
    var activeTriggers = [];
    /**
     *
     * @type {{width: number}}
     */
    var appContainerSize = {width: 800, height: 600};
    /**
     * Режим предпросмотра проекта
     * @type {string} desktop || mobile
     */
    var previewMode = 'desktop';
    /**
     * Количество сделанный операция по редактированию пользователем
     * При сохранении шаблона синхронизируется с таким же счетччиком engine
     * если этот четчик меньше чем в engine то будет блокировка при закрытии страницы
     * @type {number}
     */
    var operationsCount = 0;
    /**
     * Функция колбек на запуск редактора
     * @type {function}
     */
    var startCallback = null;
    /**
     * Таймер для запуска проверки на показ стрелок прокрутки при изменении размеров окна
     * @type {null}
     */
    var resizeWindowTimerId = null;
    /**
     * Признак того, что вошли в редактор с указанием клонировать шаблон
     * @type {boolean}
     */
    var cloneTemplate = false;
    /**
     * Активный паблишер который используетсмя в данный момент
     * Обыно это дефолтный Publisher, но у проектов есть и кастомные
     * @type {null}
     */
    var activePublisher = null;

    /**
     * Функция запуска редактора
     *
     * @param {string} param.template - ссылка на шаблон, например, в автотестах передается принудительно. Это первый вариант запуска, приоритетный.
     * @param {string} param.app - имя интерактивного формата, который надо открыть. Это второй вариант запуска.
     * @param {string} param.clone
     * @param {string} param.newId
     * @param {function} param.callback
     */
    function start(param) {
        Modal.showLoading();
        param = param || {};
        startCallback = param.callback;
        appId = getUniqId().substr(22);
        appTemplate = null;
        appName = null;
        $('#id-app_preview_img').change(function() {
            // загрузка пользовательского превью для шаблона
            // сразу без превью - аплоад
            uploadUserCustomTemplatePreview();
        });
        workspace.init();
        resourceManager = new ResourceManager();
        window.onbeforeunload = confirmExit;
        $('.js-app_preview').click(onPreviewClick);
        $('.js-app_publish').click(onPublishClick);
        $('.js-app_save_template').click(saveTemplate);
        $('.js-back_to_editor').click(onBackToEditorClick);
        $('#id-to_mob_preview').click(toMobPreview);
        $('#id-to_desktop_preview').click(toDesktopPreview);
        $(window).resize(onWindowResize);
        $('.js-slide_arr_left').mousedown(toLeftArrSlideClick);
        $('.js-slide_arr_right').mousedown(toRightArrSlideClick);
        setInterval(slidesArrowControlInterval, 30);

        // установка placeholder по особому, так как это атрибут
        $('.js-proj_name').attr('placeholder', App.getText('enter_project_name'));

        // начало загрузки директив для всех контролов
        directiveLoader.load(function(){
            // сначала смотрим, есть ли ссылка на шаблон
            var t = getQueryParams(document.location.search)[config.common.templateUrlParamName] || param[config.common.templateUrlParamName];
            if (t) {
                cloneTemplate = getQueryParams(document.location.search)[config.common.cloneParamName] === 'true' || param[config.common.cloneParamName] === 'true';
                openTemplate(t, cloneTemplate);
            }
            else {
                // если ссылки на шаблон нет, то открываем по имени промо-проекта, если оно есть
                var n = getQueryParams(document.location.search)[config.common.appNameParamName] || param[config.common.appNameParamName];
                if (n) {
                    loadAppSrc(n);
                }
                else {
                    alert('Выберите шаблон для открытия');
                }
            }
        });
    }

    /**
     * Попробовать установить ссылку для шаринга автоматически
     * По умолчанию в mutapp стоит ссылка на testix.me при шаринге
     * Если это так, то сменяем на ссылку этого проекта, например "http://p.testix.me/121947341568004/da3b379c56"
     * Если же проект былл клонирован, или открыт с витрины, то тоже надо сменить
     *
     * @param {boolean} forceChange сменить в любом случае (с витрины или клонирование)
     */
    function trySetDefaultShareLink(forceChange) {
        var pp = Engine.find('shareLink');
        if (pp && pp.length > 0) {
            if (forceChange === true || pp[0].propertyValue == config.common.defaultShareLinkToChange) {
                Engine.setValue(pp[0], Publisher.getAnonymLink(appId));
            }
        }
        else {
            log('setDefaultShareLink: can not find shareLink property', true);
        }
    }

    /**
     * Вернуть iframe приложения
     * @returns {iframe}
     */
    function getAppIframe() {
        return appIframe;
    }

    /**
     * Предупреждение случайный закрытий страницы без сохранения
     * @returns {string}
     */
    function confirmExit() {
        if (config.common.awsEnabled === true && Engine.getOperationsCount() > operationsCount) {
            return "У вас есть несохраненные изменения.";
        }
    }

    /**
     * Загрузить код промо проекта
     * @param loadedAppName - одно из множества доступных имен промопроектов
     */
    function loadAppSrc(loadedAppName) {
        // по имени промо приложения получаем ссылку на его код
        var src = config.products[loadedAppName].src;
        if (src) {
            appName = loadedAppName;
            iframeWindow = null;
            appIframe = document.createElement('iframe');
            appIframe.onload = onProductIframeLoaded;
            $(appIframe).addClass('proto_cnt').addClass('__hidden');
            var host = config.common.home;// || (config.common.awsHostName+config.common.awsBucketName);
            appIframe.src = host+src;
            $('#id-product_iframe_cnt').append(appIframe);
        }
        else {
            log('Cannot find src for: \''+loadedAppName+'\'', true);
        }
    }

    /**
     * iFrame промо проекта был загружен. Получаем из него document и window
     */
    function onProductIframeLoaded() {
        iframeWindow = appIframe.contentWindow;
        // запуск движка с передачей информации о шаблоне
        var params = {
            appName: appName,
            appStorageString: getQueryParams(document.location.search)[config.common.appStorageParamName]
        };
        if (appTemplate) {
            params.values = appTemplate.propertyValues;
            // не переписываем дескриптор, как плнировал изначально, а берем из материнского приложения всегда
            //descriptor: appTemplate.descriptor
        }
        Engine.startEngine(iframeWindow, params);

        // установить хуки которые есть в дескрипторе. Может не быть вовсе
        hookRunner.setHooks(iframeWindow.descriptor.hooks);

        // для установки ссылки шаринга требуются данные пользователя, ответ от апи возможно надо подождать
        if (App.getUserData()) {
            trySetDefaultShareLink(cloneTemplate === true);
        }
        else {
            App.on(USER_DATA_RECEIVED, function() {
                trySetDefaultShareLink(cloneTemplate === true);
            });
        }

        //updateAppContainerSize();

        // в поле для редактирования подтягиваем стили продукта
        var app = Engine.getApp();
        var $h = $("#id-product_screens_cnt").contents().find('head');
        $h.append(config.products.common.styles);
        $h.append(config.products[app.type].stylesForEmbed);
        $h = $(appIframe).contents().find('head');
        $h.append(config.products.common.styles);

        if (config.common.editorUiEnable === true) {
            showEditor();
            createScreenControls();
            workspace.syncUIControlsToAppProperties();
            // стрелки управления прокруткой, нормализация
            checkScreenGroupsArrowsState();
            // проверить что редактор готов, и вызвать колбек
            checkEditorIsReady();
        }
        else {
            // не грузить контролы в этом режиме. Сразу колбек на старт
            if (typeof startCallback === 'function') {
                startCallback();
            }
        }

        //TODO refactor button name setting
        if (appName === 'fbPanorama') {
            if (app.model.attributes.photoViewerMode !== true) {
                $('.js-app_publish').text(App.getText('publish_to_fb'));
            }
        }
    }

    /**
     * Сделать последние проверки
     * Например, дождаться загрузки критичных контролов управления экранами
     */
    function checkEditorIsReady() {
        var intervalId = setInterval(function() {
            // дожидаемся загрузки контролов управления экранами
            // так как они управляют апдейтом экрана
            var slideGroupControlIsLoaded = false;
            if (slideGroupControls) {
                slideGroupControlIsLoaded = true;
                for (var n = 0; n < slideGroupControls.length; n++) {
                    if (slideGroupControls[n].loaded === false) {
                        slideGroupControlIsLoaded = false;
                        break;
                    }
                }
            }
            if (slideGroupControlIsLoaded===true) {
                checkScreenGroupsArrowsState();
                clearInterval(intervalId);
                // даем еще чуть повиесеть
                setTimeout(function() {
                    Modal.hideLoading();
                }, 1000);
                if (typeof startCallback === 'function') {
                    startCallback();
                }
            }
        }, 200);
    }

    /**
     * Показать экран(ы) промо приложения в редакторе.
     * На экране нужно элементы с атрибутами data-app-property и проинициализировать контролы
     *
     * @param {Array.<string>} ids - массив ид экранов
     */
    function showScreen(screenIds) {
        activeScreenIds = screenIds;
        updateAppContainerSize();
        activeTriggers = [];
        workspace.showScreen(screenIds);
        applyTriggers('screen_show');
        // подсветка контрола Slide по которому кликнули
        setActiveScreen(activeScreenIds.join(','));
    }

    function updateAppContainerSize() {
        var app = Engine.getApp();
        // выставляем первоначальный размер приложения, возможно, оно будет меняться
        appContainerSize = {
            width: app.width,
            height: app.height
        };
        //TODO данная установка свойств размерности аналогична loader.js
        // можно провести унификацию
        if (previewMode === 'mobile') {
            $(appIframe).css('border','0')
                .css('width','100%')
                .css('height','100%')
                .css('maxWidth',appContainerSize.width)
                .css('maxHeight',appContainerSize.height);
        }
        else if (previewMode === 'desktop') {
            $(appIframe).css('border','0')
                .css('width',appContainerSize.width+'px')
                .css('height',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
                //.css('maxWidth',appContainerSize.width)
                .css('maxWidth','100%')
                .css('maxHeight',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
        }
    }

    function createPreviewScreenBlock(view) {
        var d = $('<div></div>')
            .css('width',appContainerSize.width)
            .css('height',appContainerSize.height)
            .addClass('screen_block'); // product_cnt.css
        d.append(view);
        return d;
    }

    /**
     * Добавить оформление к одному из экранов
     *
     * @param
     */
    function setActiveScreen(dataAppProperty) {
        $('#id-slides_cnt').find('.slide_selection').removeClass('__active');
        $('#id-slides_cnt').find('[data-app-property=\"'+dataAppProperty+'\"]').find('.slide_selection').addClass('__active');
    }

    /**
     * Запустить триггеры для определенного события
     *
     * @param {string} event
     */
    function applyTriggers(event) {
        //TODO возможно не очищать вот так сразу...
        var scrns = getActiveScreens();
        var triggers = Engine.getAppTriggers();
        for (var i = 0; i < triggers.length; i++) {
            if (triggers[i].status !== AppTrigger.STATUS_RESOLVED && triggers[i].event === event) {
                try {
                    triggers[i].do({
                        appScreens: scrns,
                        appWindow: iframeWindow,
                        editor: this
                    });
                    activeTriggers.push(triggers[i]);
                }
                catch (e)
                {
                    log('Editor.applyTriggers: error in trigger action: '+ e.message, true);
                }
            }
        }
    }

    /**
     * Вернуть активные экраны. Те которые показаны в текущий момент.
     *
     * @returns {Array}
     */
    function getActiveScreens() {
        var result = []
        for (var i = 0; i < activeScreenIds.length; i++) {
            var s = Engine.getAppScreen(activeScreenIds[i]);
            if (s) {
                result.push(s);
            }
        }
        return result;
    }

    /**
     * Перебрать все элементы на активном экране
     * Нужно для автотестирования в TProduct
     *
     * @param {function} iterator
     */
    function forEachElementOnScreen(iterator) {
        for (var i = 0; i < activeScreenIds.length; i++) {
            var appScreen = Engine.getAppScreen(activeScreenIds[i]);
            for (var k = 0; k < appScreen.appPropertyElements.length; k++) {
                iterator(appScreen.appPropertyElements[k]);
            }
        }
    }

    /**
     * Контролы извне могут попросить редактор проапдейтить рамку выделения у текущего элемента
     */
    function updateSelection() {
        workspace.updateSelectionPosition();
    }

    function onPublishClick() {
        if (App.getUserData() !== null) {
            Modal.showLoading();
            // appId - уникальный ид проекта, например appId
            var app = Engine.getApp();
            // сначала создать превью-картинки для шаринга, записать ссылки на них в приложение
            // и уже потом выкатывать приложение
            createPreviewsForShare(function() {
                if (config.products[appName].customPublisherObject) {
                    activePublisher = window[config.products[appName].customPublisherObject];
                }
                else {
                    activePublisher = Publisher;
                }
                // нужно дописать свойство "опубликованности" именно в опубликованное приложение
                var appStr = Engine.serializeAppValues({
                    addIsPublishedParam: true
                });
                activePublisher.publish({
                    appId: appId,
                    width: app.width,
                    height: app.height,
                    appStr: appStr,
                    cssStr: Engine.getCustomStylesString(),
                    promoIframe: appIframe, //TODO возможно айрейм спрятать в engine тоже
                    baseProductUrl: config.products[appName].baseProductUrl,
                    //awsBucket: App.getAWSBucketForPublishedProjects(),
                    callback: showEmbedDialog
                });
            });
        }
        else {
            Modal.showLogin();
        }
    }

    /**
     * Сохранение проекта над которым работает пользователь
     * Сохраняет текущее состояние app+desc в сторадж
     *
     * @param {boolean} showResultMessage - показывать ли сообщение после сохранения. Например при фоновом сохранении не надо
     */
    function saveTemplate(showResultMessage) {
        if (showResultMessage === undefined) {
            showResultMessage = true;
        }
        //TODO автосохранение
        //TODO возможно шифрование
        if (App.getAWSBucket() !== null && App.getUserData() !== null) {
            Modal.showLoading();
            // параметры сохраняемого шаблона
            var param = {
                id: appId,
                appName: appName,
                propertyValues: Engine.getAppPropertiesValues(),
                descriptor: iframeWindow.descriptor,
                title: $('.js-proj_name').val()
            };
            if (sessionPublishDate) {
                // если в процессе сессии была сделана публикация, то сохраняем дату
                // иначе сохранять дату не надо
                param.publishDate = sessionPublishDate;
            }
            // если пользовательское - перезаписать урл и ничего не аплоадить (аплоадил пользователь раньше)
            // если не пользовательское то в любом случае запустить таску на генерацию а sessionPreviewUrl перезаписать путем
            if (sessionPreviewUrl && sessionPreviewUrl.indexOf(config.common.userCustomPreviewFileNamePrefix) >= 0) {
                // превью пользовательское и было изменено в этой сессии, обновляем урл для записи
                param.previewUrl = sessionPreviewUrl;
            } else if (appTemplate && appTemplate.previewUrl && appTemplate.previewUrl.indexOf(config.common.userCustomPreviewFileNamePrefix) >= 0) {
                // превью пользовательское уже сохранено в шаблоне, то ничего делать не надо
                // не предусмотрено удаление картинки превью, которое пользователь сам привязал к тесту
            }
            else {
                // превью автоматическое
                // будет возвращен урл картинки, а сама таска на генерацию и аплоад сделана позже
                sessionPreviewUrl = generateAutoPreview();
                if (sessionPreviewUrl) {
                    // если появился новый урл превью картинки то сохраняем его
                    param.previewUrl = sessionPreviewUrl;
                }
            }
            var storingTempl = openedTemplateCollection.getById(appId);
            if (storingTempl === null) {
                // это новый шаблон
                // мы не открывали из своих шаблонов что-то, и не сохранили ранее ничего
                storingTempl = new Template(param);
                openedTemplateCollection.add(storingTempl);
            }
            storingTempl.set(param);
            openedTemplateCollection.saveTemplate(function(result){
                if (result === 'ok') {
                    operationsCount = Engine.getOperationsCount();
                    if (showResultMessage === true) {
                        alert('Сохранено');
                    }
                    App.stat('Testix.me', 'Template_saved');
                }
                else {
                    if (showResultMessage === true) {
                        alert('Не удалось сохранить проект');
                    }
                }
                if (!activePublisher || activePublisher.isPublishing() !== true) {
                    Modal.hideLoading();
                }
            }, appId);
        }
        else {
            Modal.showLogin();
        }
    }

    function uploadUserCustomTemplatePreview() {
        if (App.getAWSBucket() !== null) {
            var file = $('#id-app_preview_img')[0].files[0];
            if (file) {
                var objKey = 'facebook-'+App.getUserData().id+'/app/'+config.common.userCustomPreviewFileNamePrefix+appId+'.jpg';
                var params = {
                    Key: objKey,
                    ContentType: file.type,
                    Body: file,
                    ACL: 'public-read'
                };
                s3util.requestStorage('putObject', params, (function (err, data) {
                    if (err) {
                        //Not authorized to perform sts:AssumeRoleWithWebIdentity
                        log('ERROR: ' + err, true);
                    } else {
                        alert('Превью для промки загружена');
                        sessionPreviewUrl = objKey;
                        saveTemplate(false);
                    }
                }).bind(this));
            }
        }
        else {
            Modal.showLogin();
        }
    }

    /**
     * Создать таск на генерацию картинки превью
     * Генерация и аплоад будут сделаны позже, хотя урл возвращается сразу
     *
     * @return {string} - урл на превью картинки
     */
    function generateAutoPreview() {
        // проверяем что надо генеритьб првеью для проекта если только пользователь ранее не установил свое кастомное превью
        // его не надо перезаписывать
        if (config.common.previewAutoGeneration === true) {
            var app = Engine.getApp();
            var url = 'facebook-'+App.getUserData().id+'/app/'+appId+'.jpg';

            previewService.createInIframe(previewScreensIframeBody, function(canvas) {
                s3util.uploadCanvas(App.getAWSBucket(), null, url, canvas);
            }, null, [config.products.common.styles, config.products[app.type].stylesForEmbed], appContainerSize.width, appContainerSize.height);

            return url;
        }
        return null;
    }

    /**
     * Создать картинки для публикации для ВСЕХ результатов если они: null или автоматически сгенерены (то есть пересоздать).
     * А если картинка кастомная то не трогаем
     * Вызывается при публикации проекта и при автотестах
     *
     * Забираем view и приложения, конвертируем в картинки и аплоадим
     * Затем обратно полученные урлы ставим в приложение
     *
     * @param {function} previewsReadyCallback
     * @param {boolean} options.upload - если true, то на самом деле не отправлять картинки на сервер
     */
    var preparedShareEntities = [];
    function createPreviewsForShare(previewsReadyCallback, options) {
        options = options || {};
        if (options.hasOwnProperty('upload')===false) {
            options.upload = true;
        }

        preparedShareEntities = [];

        if (App.getUserData() !== null) {

            var app = Engine.getApp();
            if (app._shareEntities && app._shareEntities.length > 0) {
                // генерация канвасов заново и аплоад их с получением урла
                shareImageService.requestImageUrls((function(){
                    // перед публикацией переустановка всех урлов картинок для публикации
                    var app = Engine.getApp();
                    for (var i = 0; i < app._shareEntities.length; i++) {
                        var url = shareImageService.findImageInfo(app._shareEntities[i].id).imgUrl;
                        var ps = config.common.shareImagesAppPropertyString.replace('{{number}}',i);
                        var ap = Engine.getAppProperty(ps);
                        Engine.setValue(ap, url);
                    }

                    // далее может начать работать publisher
                    previewsReadyCallback('ok');

                }).bind(this));
            }
            else {
                // не из чего делать предпросмотр
                previewsReadyCallback('ok');
            }

        }
        else {
            Modal.showLogin();
        }
    }

    /**
     * Сгенерировать превьюшки для шаринга и вывести их в DOM чтобы оценить их корректность
     * Для ручного тестирования
     *
     * @param {boolean} upload - загружать ли картинки на сервер. По умолчанию не загружать
     */
    function testPreviewsForShare(upload) {
        createPreviewsForShare(function(result, entities) {
                for (var i = 0; i < entities.length; i++) {
                    var $e = $('<div></div>').append(entities[i].canvas).css('border','4px dashed gray');
                    $('#id-share_previews_test').append($e);
                }
                $('#id-share_previews_test').show();
            },
            {upload: upload});
    }

    /**
     * Открыть в редакторе на редактирование проект
     * ид пользователя мы уже знаем в этот момент, пользователь должен быть авторизован
     * По сути это функция "Открыть шаблон" из витрины или "Открыть мой ранее сохраненный проект". В этих случаях проект открывается на основе файла шаблона
     * сохраненных app+desc+appName
     *
     * @param {string} templateUrl
     * @param {boolean} clone - клонировать ли открываемый шаблон. Технически это просто смена appId
     */
    function openTemplate(templateUrl, clone) {
        openedTemplateCollection = new TemplateCollection({
            // в ручную добавили в коллекцию один шаблон, останется только получить инфо о нем
            templateUrls: [templateUrl]
        });
        openedTemplateCollection.loadTemplatesInfo(function(template) {
            if (template.isValid() === true) {
                appTemplate = template;
                appName = template.appName;
                if (clone !== true) {
                    appId = template.id;
                    if (template.title) {
                        $('.js-proj_name').val(template.title);
                    }
                }
                else {
                    // appId уже был сгенерирован при старте редактора start
                    // title не указываем, это новый проект-клон
                    appTemplate.title = null;
                    //appId = getUniqId().substr(22);
                }
                // после загрузки шаблона надо загрузить код самого промо проекта
                // там далее в колбеке на загрузку iframe есть запуск движка
                loadAppSrc(appName);
            }
            else {
                log('Data not valid. Template url: \''+templateUrl+'\'', true);
            }
        });
    }

    function showEditor() {
        // когда видим редактор, должен быть включен режим предпросмотра 'desktop', так как пользователь работает (редактирует) с десктоп версией приложения
        previewMode = 'desktop';
        $('#id-product_iframe_cnt').removeClass('__mob');
        $(appIframe).css('border','0')
            .css('width',appContainerSize.width+'px')
            .css('height',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
            .css('maxWidth',appContainerSize.width+'px')
            .css('maxHeight',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
        // нужно перезапустить приложение чтобы оно корректно обработало свой новый размер
        Engine.restartApp({
            mode: 'edit'
        });
        $(appIframe).addClass('__hidden');
        $('#id-editor_view').show();
        $('#id-preview_view').hide();
    }

    function showPreview() {
        $(appIframe).removeClass('__hidden');
        $('#id-editor_view').hide();

        hookRunner.on('beforePreview',getEditorEnvironment(),function(e) {
            Engine.restartApp({
                mode: 'preview'
            });
            $('#id-preview_view').show();
        });
    }

    /**
     * Показать окно для вставки со ссылкой
     */
    function showEmbedDialog(result, data) {
        Modal.hideLoading();
        if (result === 'success') {

            showPublishDialog({
                link: activePublisher.getAnonymLink(),
                embedCode: activePublisher.getEmbedCode()
            });
            // надо сохранить статус публикации
            sessionPublishDate = new Date().toString();
            saveTemplate(false);
        }
        else {
            Modal.showMessage({text: 'Ошибка: Не удалось опубликовать проект.'});
        }
    }

    /**
     * Изменение окна браузера
     */
    function onWindowResize() {
        if (resizeWindowTimerId) {
            clearTimeout(resizeWindowTimerId);
            resizeWindowTimerId = null;
        }
        // при изменении размеров окна не надо делать проверку слишком часто
        resizeWindowTimerId = setTimeout(function() {
            checkScreenGroupsArrowsState();
            resizeWindowTimerId = null;
        }, 1000)
    }

    /**
     * Запустить промо приложение в iframe
     */
    function onPreviewClick() {
        showPreview();
    }

    /**
     * Клик по кнопке Назад в предпросмотре
     */
    function onBackToEditorClick() {
        showEditor();
    }

    function toDesktopPreview() {
        previewMode = 'desktop';
        $('#id-product_iframe_cnt').removeClass('__mob');
        $(appIframe).css('border','0')
            .css('width',appContainerSize.width+'px')
            .css('height',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
            .css('maxWidth',appContainerSize.width+'px')
            .css('maxHeight',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px'); //так как у панорам например гориз скролл и не умещается по высоте он
        // нужно перезапустить приложение чтобы оно корректно обработало свой новый размер
        Engine.restartApp({
            mode: 'preview'
        });
    }

    function toMobPreview() {
        previewMode = 'mobile';
        $('#id-product_iframe_cnt').addClass('__mob');
        $(appIframe).css('border','0')
            .css('width','100%')
            .css('height','100%')
            .css('maxWidth',appContainerSize.width)
            .css('maxHeight',appContainerSize.height);
        // нужно перезапустить приложение чтобы оно корректно обработало свой новый размер
        Engine.restartApp({
            mode: 'preview'
        });
    }

    var $slidesCnt = null;
    var slidesCntSpeed = 0;
    function slidesArrowControlInterval() {
        if ($slidesCnt === null) {
            $slidesCnt = $('#id-slides_cnt');
        }
        if (slidesCntSpeed > 0) {
            // левая стрелка
            $slidesCnt.scrollLeft($slidesCnt.scrollLeft()+slidesCntSpeed);
            --slidesCntSpeed;
        } else if (slidesCntSpeed < 0) {
            // правая стрелка
            $slidesCnt.scrollLeft($slidesCnt.scrollLeft()+slidesCntSpeed);
            ++slidesCntSpeed;
        }
    }

    function toLeftArrSlideClick() {
        slidesCntSpeed = -config.editor.ui.slidesScrollSpeed;
//        var sc = $('#id-slides_cnt');
//        sc.scrollLeft(sc.scrollLeft()-config.editor.ui.slidesScrollStep);
    }

    function toRightArrSlideClick() {
        slidesCntSpeed = config.editor.ui.slidesScrollSpeed;
//        var sc = $('#id-slides_cnt');
//        sc.scrollLeft(sc.scrollLeft()+config.editor.ui.slidesScrollStep);
    }

    function getActiveScreens() {
        return activeScreenIds;
    }

    function showSelectDialog(params) {
        workspace.selectElementOnAppScreen(null);
        $('#id-control_cnt').empty();
        var dialog = new SelectDialog(params);
        $('#id-dialogs_view').empty().append(dialog.view).show();
    }

    function showPublishDialog(params) {
        workspace.selectElementOnAppScreen(null);
        $('#id-control_cnt').empty();
        var dialog = new PublishDialog(params);
        $('#id-dialogs_view').empty().append(dialog.view).show();
    }

    /**
     * Найти контрол по строке, поиск будет производиться по нескольким полям.
     * Надо для отладки
     *
     * @param {string} str
     */
    function findControl(str) {
        var results1 = [];
        var results2 = [];
        var results3 = [];
        for (var i = 0; i < uiControlsInfo.length; i++) {
            var ci = uiControlsInfo[i];
            if (ci.propertyString.indexOf(str) >= 0) {
                // самый релевантный поиск по ключу: propertyString
                results1.push(ci);
            }
            else {
                if (ci.control.directiveName && ci.control.directiveName.toLowerCase().indexOf(str.toLowerCase()) >= 0) {
                    // вторая степерь релевантности: имя директивы
                    results2.push(ci);
                }
                else {
                    if (ci.type && ci.type.indexOf(str) >= 0) {
                        // менее релевантный поиск - тип
                        results3.push(ci);
                    }
                }
            }
        }
        return results1.concat(results2).concat(results3);
    }

    /**
     * Сделать проверку на показ стрелок прокрутки панели экранов
     */
    function checkScreenGroupsArrowsState() {
        if (slideGroupControls) {
            var sumW = 0;
            for (var i = 0; i < slideGroupControls.length; i++) {
                if (slideGroupControls[i].$directive) {
                    sumW += slideGroupControls[i].$directive.width();
                }
                else {
                    // директивы слайдов могут быть еще не загружены
                    return;
                }
            }
            if ($('#id-slides_cnt').width() < sumW) {
                $('.js-slide_arr_left').show();
                $('.js-slide_arr_right').show();
            }
            else {
                $('.js-slide_arr_left').hide();
                $('.js-slide_arr_right').hide();
            }
        }
    }

    /**
     * Собрать кдючевые объекты среды для передачи в различные обработчики вне контекста редактора.
     *
     * @returns {object}
     */
    function getEditorEnvironment() {
        return {
            Editor: Editor,
            Engine: Engine,
            config: config,
            Modal: Modal,
            App: App,
            s3util: s3util
        }
    }

    /**
     * Модель управления экранами:
     * Сейчас предполагается что группы экранов постоянные, поэтому createScreenControls зовется один раз при старте редактора
     * Если будут меняться группы, то надо формировать группы в движке и следить за их изменением и делать события с обработкой
     * TODO А пока здесь один раз создаются все контролы SlideGroupControl один раз и управление слайдами идет внутри них
     *
     * Конролы управления экранами специфичные, поэтому существует отдельная функция для их создания
     * Задача не пересоздавать контролы управления экранами - это дорого
     *
     * Нет контрола управления группами, который включал бы управления несколькими SlideGroupControl
     * По сути это вот эта функция ниже.
     * А упрвления отдельными Slide спрятана внутрь одного SlideGroupControl
     */
    function createScreenControls() {
        $('#id-slides_cnt').empty();
        //TODO конечно не надо пересоздавать каждый раз всё при добавл-удал экрана. Но так пока проще
        var appScreenIds = Engine.getAppScreenIds();
        // экраны могут быть поделены на группы
        var groups = {};
        var sGroups = [];
        if (appScreenIds.length > 0) {
            // подготовительная часть: разобъем экраны на группы
            // groups - просто временный вспомогательный объект
            for (var i = 0; i < appScreenIds.length; i++) {
                var s = appScreenIds[i];
                var screen = Engine.getAppScreen(s);
                if (screen.hideScreen === false) {
                    if (typeof screen.group !== "string") {
                        // если группа не указана, экран будет один в своей группе
                        screen.group = screen.id;
                    }
                    if (groups.hasOwnProperty(screen.group) === false) {
                        // группа новая, создаем
                        groups[screen.group] = [];
                    }
                    groups[screen.group].push(s);
                }
            }

            // далее начнем создать контролы и вью для групп экранов
            for (var groupName in groups) {
                var curG = groups[groupName];
                var firstScrInGroup = Engine.getAppScreen(curG[0]);
                var sgc = findSlideGroupByGroupName(groupName);
                if (sgc === null) {
                    // группой экранов может управлять массив.
                    // в случае вопросов теста: эта группа привязана к quiz, передается в промо проекте при создании экранов
                    // для остальных undefined
                    sgc = workspace.createControl(firstScrInGroup.arrayAppPropertyString, 'SlideGroupControl', 'SlideGroupControl', {}, $('#id-slides_cnt'));
                }
                else {
                    // подходящий контрол SlideGroupControl создавался ранее для управления этой группой экранов
                }
                // устанавливаем все атрибуты, не один раз при создании, а сколько угодно раз
                sgc.set({
                    // идентификатор группы
                    groupName: groupName,
                    // имя забираем у первого экрана группы, в группе минимум один экран, а все имена одинаковые конечно
                    groupLabel: firstScrInGroup.name,
                    // это массив экранов
                    //screens: curG,
                    //allowDragY: true,
                    showAddButton: true
                });
                sGroups.push(sgc);
            }
            // если при обновлении какие-то группы пропали в промо приложении, то они не попадут более в slideGroupControls
            // например для теста будет три группы: стартовый, вопросы, результаты
            slideGroupControls = sGroups;
        }

        /**
         * Найти контрол SlideGroupControl по имени группы экранов
         * Задача не пересоздавать контролы управления экранами - это дорого
         * @param groupName
         * @returns {null}
         */
        function findSlideGroupByGroupName(groupName) {
            if (slideGroupControls !== null && groupName) {
                for (var i = 0; i < slideGroupControls.length; i++) {
                    if (slideGroupControls[i].groupName == groupName) {
                        return slideGroupControls[i];
                    }
                }
            }
            return null;
        }
    }

    // public methods
    global.start = start;
    global.forEachElementOnScreen = forEachElementOnScreen;
    global.getAppIframe = getAppIframe;
    //TODO
    global.createControl = function(p1,p2,p3,p4,p5,p6,p7,p8) {
        return workspace.createControl(p1,p2,p3,p4,p5,p6,p7,p8);
    };
    global.getActiveScreens = getActiveScreens;
    global.showScreen = showScreen;
    global.getAppContainerSize = function() { return appContainerSize; };
    global.getSlideGroupControls = function() { return slideGroupControls; };
    global.createPreviewsForShare = createPreviewsForShare;
    global.testPreviewsForShare = testPreviewsForShare;
//    global.selectElementOnAppScreen = selectElementOnAppScreen;
//    global.hideWorkspaceHints = hideWorkspaceHints;
    global.getResourceManager = function() { return resourceManager; }
    global.showSelectDialog = showSelectDialog;
    global.syncUIControlsToAppProperties = function () {
        workspace.syncUIControlsToAppProperties();
    };
    global.findControl = findControl;
//    global.findControlInfo = findControlInfo; // need for autotests
    global.getAppId = function() { return appId; };
    global.updateSelection = updateSelection;
    global.getQuickControlPanel = function() {
        //TODO
        return workspace.getQuickControlPanel();
    }
    global.getEditorEnvironment = getEditorEnvironment;

})(Editor);