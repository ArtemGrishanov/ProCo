/**
 * Created by artyom.grishanov on 28.12.15.
 */

var Editor = {};

(function(global) {
    /**
     * Приложение MutApp которое редактируется в редакторе
     * @type {MutApp}
     */
    var editedApp = null;
    /**
     * Приложение для предпросмотра
     * @type {MutApp}
     */
    var previewApp = null;
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
     * Урл на iframe для разработки проекта, можно открыть любой iframe в редакторе
     * @type {string}
     */
    var devIframeUrl = null;
    /**
     * Имя конструктора. Для разработчиков
     * @type {string}
     */
    var devConstructorName = null;
    /**
     * Разработчик может задать размер приложения
     * @type {Number}
     */
    var devWidth = undefined;
    /**
     * Разработчик может задать размер приложения
     * @type {Number}
     */
    var devHeight = undefined;
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
     * Сериализованные свойства приложения.
     * При старте получаем из шаблона или из localStorage
     *
     * @type {string}
     */
    var serializedProperties = null;
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
     * Диалог с выбором ресурсов (картинки). Можно зааплоадить, запросить список с сервера и выбрать картинку
     * @type {object}
     */
    var resourceManager = null;
    /**
     * Ид экрана который показан в данный момент в рабочем поле
     * @type {string}
     */
    var activeScreen = null;
    /**
     * Все зарегистрированные DOM элементы с атрибутами data-app-property,
     * которые есть на всех activeScreens
     *
     * @type {Array}
     */
    var registeredElements = [];
    /**
     * Строка data-app-property соответствующие элементы которой выделены на activeScreens
     * @type {string}
     */
    var selectedDataAppProperty = null;
    /**
     * Подсказки для текущего экрана продукта
     * @type {Array}
     */
    var activeScreenHints = [];
    /**
     * Объект с информации о координатах рабочего поля.
     * Другими словами: промо-продукта
     * Нужен для позиционирования рамок selections
     * @type {left: 0, top: 0}
     */
    var WorkspaceOffset = null;
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
     * При сохранении шаблона синхронизируется с MutApp.getOperationsCount()
     * если этот четчик меньше чем в MutApp.getOperationsCount() то будет блокировка при закрытии страницы
     * @type {number}
     */
    var operationsCountForWindowExit = 0;
    /**
     * У автосейвера свой счетчик операций, он его обновляет по таймеру во время сохранения
     * Если MutApp.getOperationsCount() больше чем operationCountForAutosaver то надо сделать автосохранение
     *
     * @type {number}
     */
    var operationCountForAutosaver = 0;
    /**
     * Функция колбек на запуск редактора
     * @type {function}
     */
    var startCallback = null;
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
     * Ид таймера, который используется для автосохранения
     * Раз в несколько секунд срабатывает таймер, который сериализует текущий editedApp в localStorage
     *
     * @type {null}
     */
    var autoSaverTimerId = null;

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
        handleInspector();
        appId = getUniqId().substr(22);
        appTemplate = null;
        appName = null;
        $('#id-app_preview_img').change(function() {
            // загрузка пользовательского превью для шаблона
            // сразу без превью - аплоад
            uploadUserCustomTemplatePreview();
        });
        Workspace.init({
            onWorkspaceEvents: onWorkspaceEvents
        });
        ControlManager.init({
            onControlEvents: onControlEvents
        });
        AssistentPopup.init({
            continueCallback: onAssistenContinue
        });
        resourceManager = new ResourceManager();
        window.onbeforeunload = confirmExit;
        $('.js-app_preview').click(onPreviewClick);
        $('.js-app_publish').click(onPublishClick.bind(this));
        $('.js-app_save_template').click(onSaveTemplateClick.bind(this));
        $('.js-back_to_editor').click(onBackToEditorClick);
        $('#id-to_mob_preview').click(toMobPreview);
        $('#id-to_desktop_preview').click(toDesktopPreview);
        // установка placeholder по особому, так как это атрибут
        $('.js-proj_name').attr('placeholder', App.getText('enter_project_name'));

        // начало загрузки директив для всех контролов
        directiveLoader.load(function(){
            // сначала смотрим, есть ли ссылка на шаблон
            var t = getQueryParams(document.location.search)[config.common.templateUrlParamName] || param[config.common.templateUrlParamName];
            if (t) {
                cloneTemplate = getQueryParams(document.location.search)[config.common.cloneParamName] === 'true' || param[config.common.cloneParamName] === 'true';
                openTemplate({
                    templateUrl: t,
                    clone: cloneTemplate,
                    callback: loadApps
                });
            }
            else {
                // если ссылки на шаблон нет, то открываем по имени промо-проекта, если оно есть
                var n = getQueryParams(document.location.search)[config.common.appNameParamName] || param[config.common.appNameParamName];
                var dfr = getQueryParams(document.location.search)[config.common.devIframeParamName] || param[config.common.devIframeParamName];
                var dcn = getQueryParams(document.location.search)[config.common.devConstructorParamName] || param[config.common.devConstructorParamName];
                if (n) {
                    appName = n;
                    loadApps();
                }
                else if (dfr && dcn) {
                    devIframeUrl = dfr;
                    devConstructorName = dcn;
                    devWidth = getQueryParams(document.location.search)[config.common.devWidthParamName] || param[config.common.devWidthParamName];
                    devHeight = getQueryParams(document.location.search)[config.common.devHeightParamName] || param[config.common.devHeightParamName];
                    loadApps();
                }
                else {
                    Modal.showMessage({text: App.getText('select_template')});
                }
            }
        });
        autoSaverTimerId = setInterval(autoSaverTick, config.editor.ui.autoSaverTimerInterval);
    }

    /**
     * Загрузить пару приложений: для редактирования и предпросмотра
     */
    function loadApps() {
        editorLoader.load({
            containerId: 'id-product_iframe_cnt',
            appName: appName,
            devIframeUrl: devIframeUrl,
            devConstructorName: devConstructorName,
            devWidth: devWidth,
            devHeight: devHeight,
            onload: onProductIframeLoaded.bind(this)
        });
        editorLoader.load({
            containerId: 'id-app_preview',
            appName: appName,
            devIframeUrl: devIframeUrl,
            devConstructorName: devConstructorName,
            devWidth: devWidth,
            devHeight: devHeight
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
        var pp = editedApp.getProperty('appConstructor=mutapp shareLink');
        if (pp) {
            if (forceChange === true || pp.getValue() == config.common.defaultShareLinkToChange) {
                pp.setValue(Publisher.getAnonymLink(appId));
            }
        }
        else {
            log('setDefaultShareLink: can not find shareLink property', true);
        }
    }

    /**
     * Поднять версию приложения на единицу
     *
     * @param {boolean} setZero
     */
    function bumpAppVersion(setZero) {
        var pp = editedApp.getProperty('appConstructor=mutapp publishVersion');
        if (pp) {
            if (setZero === true) {
                pp.setValue(0);
            }
            else {
                pp.setValue(parseInt(pp.getValue()) + 1);
            }
        }
        else {
            log('Editor.bumpAppVersion: can not find publishVersion property', true);
        }
    }

    /**
     * Предупреждение случайный закрытий страницы без сохранения
     * @returns {string}
     */
    function confirmExit() {
        if (config.common.awsEnabled === true && editedApp && editedApp.getOperationsCount() > operationsCountForWindowExit) {
            return App.getText('unsaved_changes');
        }
    }

    /**
     * Вызывается раз в несколько секунд
     * Проверяет, если есть несохраненные операции, то делает сериализацию editedApp в localStorage
     */
    function autoSaverTick() {
        // автосохранение работает в открытыми шаблонами, а в нормальной ситуации пользователь всегда работает с шаблоном
        if (appTemplate && editedApp && editedApp.getOperationsCount() > operationCountForAutosaver) {
            var appState = null;
            try {
                appState = editedApp.serialize();
                // при сохранении ключом является урл шаблона
                window.localStorage.setItem(appTemplate.url, editedApp.serialize());
                window.localStorage.setItem('status__' + appTemplate.url, 'unsaved');
                operationCountForAutosaver = editedApp.getOperationsCount();
                console.log('Template saved: '+appTemplate.url);
            }
            catch(e) {
                console.error('Editor.autoSaverTick: Could not save app state. Details: ' + e.message);
            }
        }
    }

    /**
     * Проверить локально в localStorage, есть ли несохраненное состояние у шаблона
     *
     * @param {string} templateUrl - ссылка на шаблон (это может быть витринный шаблон или пользовательский)
     * @return {boolean}
     */
    function templateHasUnsavedLocalStorageState(templateUrl) {
        return window.localStorage.getItem('status__'+templateUrl) === 'unsaved' && !!window.localStorage.getItem(templateUrl);
    }

    /**
     * iFrame промо проекта был загружен. Получаем из него document и window
     */
    function onProductIframeLoaded() {
        // скрыть контролы экранов для некоторых проектов. Например для панорам они не нужны
        if (appName && config.products[appName].hideScreenControls === true) {
            $('#id-screen_controls_cnt').hide();
        }
        if (appName && config.products[appName].mobPreviewEnabled === false) {
            $('#id-to_mob_preview').hide();
        }
        ScreenManager.init({
            onScreenEvents: onScreenEvents,
            appType: appName
        });
        // запуск движка с передачей информации о шаблоне
//        var params = {
//            appName: appName,
//            appStorageString: getQueryParams(document.location.search)[config.common.appStorageParamName]
//        };

        // установить хуки которые есть в дескрипторе. Может не быть вовсе
        //hookRunner.setHooks(iframeWindow.descriptor.hooks);

        if (config.common.editorUiEnable === true) {
            restartEditedApp();
            showEditor();
            showScreen();
            WorkspaceOffset = $('#id-product_iframe_cnt').offset();

            // для установки ссылки шаринга требуются данные пользователя, ответ от апи возможно надо подождать
            if (cloneTemplate) {
                // при клонировании сменить ссылку на проект и версию публикаиции обнулить
                trySetDefaultShareLink(true);
                bumpAppVersion(true);
            }
            // показ кнопки загрузки превью картинки для проекта. Только для админов
//            if (Auth.getUser() && config.common.excludeUsersFromStatistic.indexOf(Auth.getUser().id) >= 0) {
//                $('#id-app_prevew_img_wr').show();
//            }
            setTariffPolicy();

            if (typeof startCallback === 'function') {
                startCallback();
            }
            Modal.hideLoading();
        }
        else {
            // не грузить контролы в этом режиме. Сразу колбек на старт
            if (typeof startCallback === 'function') {
                startCallback();
            }
        }

        //TODO refactor button name setting
        if (appName === 'fbPanorama') {
            if (editedApp.model.attributes.photoViewerMode !== true) {
                $('.js-app_publish').text(App.getText('publish_to_fb'));
            }
        }

        // в начале работы редактора запоминаем начальное количество операций/действий
        // затем, если оно будет увеличено, будем определять несохраненные изменения
        operationsCountForWindowExit = editedApp.getOperationsCount();
        operationCountForAutosaver = editedApp.getOperationsCount();
    }

//    /**
//     * Сделать последние проверки
//     * Например, дождаться загрузки критичных контролов управления экранами
//     */
//    function checkEditorIsReady() {
//        checkScreenGroupsArrowsState();
//        Modal.hideLoading();
//        if (typeof startCallback === 'function') {
//            startCallback();
//        }
//        var intervalId = setInterval(function() {
//            // дожидаемся загрузки контролов управления экранами
//            // так как они управляют апдейтом экрана
//            var slideGroupControlIsLoaded = false;
//            if (slideGroupControls) {
//                slideGroupControlIsLoaded = true;
//                for (var n = 0; n < slideGroupControls.length; n++) {
//                    if (slideGroupControls[n].loaded === false) {
//                        slideGroupControlIsLoaded = false;
//                        break;
//                    }
//                }
//            }
//            if (slideGroupControlIsLoaded===true) {
//                checkScreenGroupsArrowsState();
//                clearInterval(intervalId);
//                // даем еще чуть повиесеть
//                setTimeout(function() {
//                    Modal.hideLoading();
//                }, 1000);
//
//                // специальная возможность для панорам: сразу открыть окно выбора картинки с помощью передами параметра с витрины
//                setTimeout(function() {
//                    try {
//                        var pn = getQueryParams(document.location.search)['pano_open_rm'];
//                        if (pn) {
//                            Editor.findControlInfo('id=mm panoramaImgSrc')[0].control.onDirectiveClick();
//                        }
//                    }
//                    catch(err) { log (err.message, true) }
//                }, 1200);
//
//                if (typeof startCallback === 'function') {
//                    startCallback();
//                }
//            }
//        }, 200);
//    }

    /**
     * Применение политик тарифа к текущему пользователю
     */
    function setTariffPolicy() {
        if (Auth.isTariff('basic') === true) {
            updateProductPageBackgroungImage();
        }
        else {
            var cntr = ControlManager.getControls({propertyString:'appConstructor=mutapp projectPageBackgroundImageUrl'})[0];
            if (cntr) {
                cntr.disable();
            }
            else {
                console.error('Editor.setTariffPolicy: Control not created yet for \'appConstructor=mutapp projectPageBackgroundImageUrl\'');
            }
        }
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

    ///**
    // * Показать подсказки для экрана
    // * @param appScreen
    // */
    //function showAppScreenHints(appScreen) {
    //    if (appScreen.hints) {
    //        for (var i = 0; i < appScreen.hints.length; i++) {
    //            var h = appScreen.hints[i];
    //            if (h.isShown === false) {
    //                h.hintElement = showWorkspaceHint(h.domElement, h.text);
    //                h.isShown = true;
    //                activeScreenHints.push(h);
    //            }
    //        }
    //    }
    //}

    function onSaveTemplateClick() {
        saveTemplate({
            showLoadingPopup: true
        });
    }

    function onPublishClick() {
        if (Auth.getUser() !== null) {
            var appMsg = editedApp.getStatus();
            if (appMsg && appMsg.length > 0) {
                // если у приложения есть какая-то важная информация, то надо показать ее перед публикацией
                AssistentPopup.setMessages(editedApp.getStatus());
                AssistentPopup.show({
                    showContinueButton: true
                });
            }
            else {
                publish();
            }
        }
        else {
            Modal.showSignin({canClose: false});
        }
    }

    function onAssistenContinue() {
        if (Auth.getUser() !== null) {
            publish();
        }
        else {
            Modal.showSignin({canClose: false});
        }
    }

    function publish() {
        if (config.common.home === 'http://localhost:63342/ProCo/pub/') {
            // только сбилденный проект может публиковать
            // так как стилшком сложно поддерживать публикацию из каталога /pub, где структура проекта другая
            Modal.showMessage({text: 'Publishing is only available for builded Editor'});
        }
        else {
            Modal.showLoading();
            // сначала создать превью-картинки для шаринга, записать ссылки на них в приложение
            // и уже потом выкатывать приложение
            shareImageService.generateAndUploadSharingImages({
                // внутри сервис shareImageService получает shareEntities из приложения editedApp
                // если надо создает canvas и аплоадит его на s3, затем устанавливает imgUrl's внутри shareEntities
                app: editedApp,
                callback: (function() {

                    // далее может начать работать publisher
                    if (config.products[appName].customPublisherObject) {
                        activePublisher = window[config.products[appName].customPublisherObject];
                    }
                    else {
                        activePublisher = Publisher;
                    }
                    // в приложение записывается ссылка на проект
                    var anonymUrl = 'https://p.testix.me/'+Auth.getUser().short_id+'/'+appId+'/';
                    var ap = editedApp.getProperty('appConstructor=mutapp projectPageUrl');
                    ap.setValue(anonymUrl);
                    var appTitle = clearHtmlSymbols(editedApp.title || 'Set title for product');
                    var appDescription = clearHtmlSymbols(editedApp.description || 'Set description for product');

                    // накрутить версию проекта при новой сборке, поможет сбросу кеша шаринга
                    bumpAppVersion();

                    // для анонимной страницы anonymPage/index.html (не для шаринговой страницы share_result)
                    var shareEntArr = editedApp.shareEntities.toArray();
                    // ставится автокартинка для корневой страницы проекта вида: "p.testix.me/127867420975996/4b48efef0f"
                    var ogImage = shareImageService.getAppAutogeneratedImage() ? shareImageService.getAppAutogeneratedImage(): editedApp.shareDefaultImgUrl;

                    var appStr = editedApp.serialize();
                    activePublisher.publish({
                        locale: App.getLang(),
                        appId: appId,
                        appName: appName,
                        width: editedApp.getSize().width,
                        height: editedApp.getSize().height,
                        appStr: appStr,
                        cssStr: editedApp.getCssRulesString(),
                        promoIframe: editorLoader.getIframe('id-product_iframe_cnt'),
                        baseProductUrl: config.products[appName].baseProductUrl,
                        callback: showEmbedDialog,
                        fbAppId: editedApp.fbAppId, // og tag
                        ogTitle: appTitle, // og tag
                        ogDescription: appDescription, // og tag
                        ogUrl: anonymUrl, // og url
                        ogImage: ogImage,
                        shareEntities: editedApp.shareEntities.toArray(),
                        shareLink: editedApp.shareLink.getValue() || editedApp.projectPageUrl.getValue(),
                        projectBackgroundImageUrl: editedApp.getProperty('appConstructor=mutapp projectPageBackgroundImageUrl').getValue(),
                        tariffIsBasic: Auth.isTariff('basic'),
                        callback: function(publishResult) {
                            // после каждой публикации автоматически сохраняем шаблон
                            saveTemplate({
                                callback: function() {
                                    showEmbedDialog(publishResult);
                                }
                            });
                        }
                    });

                }).bind(this)
            });
        }
    }

    /**
     * Сохранение проекта над которым работает пользователь
     * Сохраняет текущее состояние app+desc в сторадж
     *
     * @param {boolean} [param.showResultMessage] - показывать ли сообщение после сохранения. Например при фоновом сохранении не надо
     * @param {boolean} [param.showLoadingPopup] - показывать ли всплывающую "крутилку"
     * @param {function} [param.callback]
     */
    function saveTemplate(param) {
        param = param || {};
        param.showResultMessage = (typeof param.showResultMessage === 'boolean') ? param.showResultMessage: false;
        param.showLoadingPopup = (typeof param.showLoadingPopup === 'boolean') ? param.showLoadingPopup: false;

        if (App.getAWSBucket() !== null && Auth.getUser() !== null) {
            if (param.showLoadingPopup === true) {
                Modal.showLoading();
            }
            // параметры сохраняемого шаблона
            var templParam = {
                id: appId,
                appName: appName,
                propertyValues: editedApp.serialize(),
                title: $('.js-proj_name').val(),
                url: config.common.awsHostName+'/'+config.common.awsBucketName+'/'+Auth.getUser().id+'/app/'+Editor.getAppId()+'.txt'
            };
            if (sessionPublishDate) {
                // если в процессе сессии была сделана публикация, то сохраняем дату
                // иначе сохранять дату не надо
                templParam.publishDate = sessionPublishDate;
            }
            // если пользовательское - перезаписать урл и ничего не аплоадить (аплоадил пользователь раньше)
            // если не пользовательское то в любом случае запустить таску на генерацию а sessionPreviewUrl перезаписать путем
            if (sessionPreviewUrl && sessionPreviewUrl.indexOf(config.common.userCustomPreviewFileNamePrefix) >= 0) {
                // превью пользовательское и было изменено в этой сессии, обновляем урл для записи
                templParam.previewUrl = sessionPreviewUrl;
            } else if (appTemplate && appTemplate.previewUrl && appTemplate.previewUrl.indexOf(config.common.userCustomPreviewFileNamePrefix) >= 0) {
                // превью пользовательское уже сохранено в шаблоне, то ничего делать не надо
                // не предусмотрено удаление картинки превью, которое пользователь сам привязал к тесту
            }
            else {
                // превью автоматическое
                // будет возвращен урл картинки, а сама таска на генерацию и аплоад сделана позже
                sessionPreviewUrl = generateAppAutoPreview();
                if (sessionPreviewUrl) {
                    // если появился новый урл превью картинки то сохраняем его
                    templParam.previewUrl = sessionPreviewUrl;
                }
            }
            var storingTempl = openedTemplateCollection.getById(appId);
            if (storingTempl === null) {
                // это новый шаблон (даже и в том случае когда из витрины склонировали, ведь appId новый)
                // мы не открывали из своих шаблонов что-то, и не сохранили ранее ничего
                storingTempl = new Template(templParam);
                openedTemplateCollection.add(storingTempl);
                // создали новый объект Template для нового appId, так как проект быо клонирован
                appTemplate = storingTempl;
            }
            storingTempl.set(templParam);
            openedTemplateCollection.saveTemplate(function(result) {
                if (result === 'ok') {
                    if (appTemplate) {
                        // поставить статус что шаблон сохранен
                        // templateHasUnsavedLocalStorageState начнет возвращать false
                        window.localStorage.setItem('status__' + appTemplate.url, 'saved');
                    }
                    operationsCountForWindowExit = editedApp.getOperationsCount();

                    if (param.showResultMessage === true) {
                        alert('Сохранено');
                    }
                    App.stat('Testix.me', 'Template_saved');
                    // Важно: если проект клонирован с витрины, надо заменить ссылку на шаблон после сохранении
                    // теперь templateUrl будет ссылаться на сохраненный и открытый шаблон пользователя
                    // пользователь дальше может смело делать рефреш
                    _updateEditorUrl();
                }
                else {
                    if (param.showResultMessage === true) {
                        alert('Не удалось сохранить проект');
                    }
                    App.stat('Testix.me', 'Template_save_error');
                }
                if (param.callback) {
                    param.callback();
                }
                if (!activePublisher || activePublisher.isPublishing() !== true) {
                    if (param.showLoadingPopup === true) {
                        Modal.hideLoading();
                    }
                }
            }, appId);
        }
        else {
            Modal.showSignin({canClose: false});
        }
    }

    /**
     * Обновить урл редактора
     * После перехода с витрины урл надо заменить при первом же сохранении (убрать id клонируемого проекта и параметр clone)
     *
     * @private
     */
    function _updateEditorUrl() {
        var baseEditorUrl = window.location.href.substr(0, window.location.href.indexOf('?'));
        var newParamString = baseEditorUrl+'?'+config.common.templateUrlParamName+'='+config.common.awsHostName+'/'+config.common.awsBucketName+'/'+Auth.getUser().id+'/app/'+Editor.getAppId()+'.txt';
        window.history.replaceState(Editor.getAppId(), "Title", newParamString);
    }

    function uploadUserCustomTemplatePreview() {
        if (App.getAWSBucket() !== null) {
            var file = $('#id-app_preview_img')[0].files[0];
            if (file) {
                var objKey = Auth.getUser().id+'/app/'+config.common.userCustomPreviewFileNamePrefix+appId+'.jpg';
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
                        saveTemplate();
                    }
                }).bind(this));
            }
        }
        else {
            Modal.showSignin({canClose: false});
        }
    }

    /**
     * Создать таск на генерацию картинки превью
     * Генерация и аплоад будут сделаны позже, хотя урл возвращается сразу
     *
     * @param {MutApp} [param.app] - опционально, будет использован editedApp по умолчанию
     * @return {string} - урл на превью картинки
     */
    function generateAppAutoPreview(param) {
        param = param || {};
        param = param.app || editedApp;
        // проверяем что надо генерить првеью для проекта если только пользователь ранее не установил свое кастомное превью
        // его не надо перезаписывать
        if (config.common.previewAutoGeneration === true) {
            var url = Auth.getUser().id+'/app/'+appId+'.jpg';

            shareImageService.generateAppAutoPreviewCanvas({
                app: editedApp,
                callback: function(canvas) {
                    s3util.uploadCanvas(App.getAWSBucket(), null, url, canvas);
                }
            });

            return url;
        }
        return null;
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
     * Включить обработчик для проверки
     * При клике Ctrl + i будет запускаться проверка
     */
    function handleInspector() {
        $(window).keypress(function(event) {
            //todo blocks test input 'i'. Make cmd+i
//            if (event.which == 105) {
//                inspector.isOK();
//                event.preventDefault();
//            }
            //return false;
        });
    }

    /**
     * Открыть в редакторе на редактирование проект
     * ид пользователя мы уже знаем в этот момент, пользователь должен быть авторизован
     * По сути это функция "Открыть шаблон" из витрины или "Открыть мой ранее сохраненный проект". В этих случаях проект открывается на основе файла шаблона
     * сохраненных app+desc+appName
     *
     * @param {function} param.callback
     * @param {string} param.templateUrl
     * @param {boolean} param.clone - клонировать ли открываемый шаблон. Технически это просто смена appId
     */
    function openTemplate(param) {
        param = param || {};
        param.clone = typeof param.clone === 'boolean' ? param.clone: false;
        if (typeof param.templateUrl !== 'string') {
            throw new Error('Editor.openTemplate: templateUrl not set');
        }
        openedTemplateCollection = new TemplateCollection({
            // в ручную добавили в коллекцию один шаблон, останется только получить инфо о нем
            templateUrls: [param.templateUrl]
        });
        openedTemplateCollection.loadTemplatesInfo(function(template) {
            if (template.isValid() === true) {
                appTemplate = template;
                appName = template.appName;
                if (param.clone !== true) {
                    appId = template.id;
                    if (template.title) {
                        $('.js-proj_name').val(template.title);
                    }
                }
                else {
                    // appId уже был сгенерирован при старте редактора start
                    // title не указываем, это новый проект-клон
                    appTemplate.title = null;
                }

                var openLocalState = false;
                if (templateHasUnsavedLocalStorageState(appTemplate.url) === true) {
                    if (window.confirm(App.getText('do_you_want_restore_tempate')) === true) {
                        openLocalState = true;
                        // Переменная serializedProperties затем передается в restartEditApp() при старте приложения
                        serializedProperties = window.localStorage.getItem(appTemplate.url);
                        appTemplate.propertyValues = serializedProperties;
                    }
                }

                // нет локально сохраненного шаблона, открывает с шаблона с сервера
                if (openLocalState === false) {
                    serializedProperties = appTemplate.propertyValues;
                }

                // после загрузки шаблона надо загрузить код самого промо проекта
                if (param.callback) {
                    // можем передавать в колбек все загруженные свойства для консистентности. Автотесты используют это
                    param.callback(template);
                }
            }
            else {
                log('Data not valid. Template url: \''+templateUrl+'\'', true);
            }
        });
    }

    /**
     * Запустить редактируемое MutApp приложение
     */
    function restartEditedApp() {
        if (editedApp) {
            serializedProperties = editedApp.serialize();
        }
        editedApp = editorLoader.startApp({
            containerId: 'id-product_iframe_cnt',
            mode: 'edit',
            locale: App.getLang(),
            defaults: serializedProperties,
            appChangeCallbacks: [onAppChanged]
        });
        $(editedApp.screenRoot).click(function() {
            // клик на приложение (не контрол) должен приводить к сбросу выделения элемента
            // как следствие: закрытию quickPanel и т.п.
            Workspace.selectElementOnAppScreen(null);
        });
    }

    /**
     * Запустить превью MutApp приложение
     */
    function restartPreviewApp() {
        previewApp = editorLoader.startApp({
            containerId: 'id-app_preview',
            mode: 'preview',
            locale: App.getLang(),
            defaults: editedApp.serialize(), // передача значений mutappproperty в от редактируемого приложения
            appChangeCallbacks: [onPreviewAppChanged]
        });
    }

    /**
     * Обработчик событий в превью-приложении
     *
     * @param {string} event
     * @param {object} data
     */
    function onPreviewAppChanged(event, data) {
        var app = data.application;
        var MutApp = editorLoader.getIframe('id-product_iframe_cnt').contentWindow.MutApp;
        switch (event) {
            case MutApp.EVENT_APP_SIZE_CHANGED: {
                log('Editor.onPreviewAppChanged: MutApp.EVENT_APP_SIZE_CHANGED \''+data.width+'x'+data.height+'\'');
                $('#id-app_preview').find('iframe').css('max-width', app.getSize().width);
                break;
            }
        }
    }

    /**
     * Обработчик событий в приложении
     *
     * @param {string} event
     * @param {object} data
     */
    function onAppChanged(event, data) {
        var app = data.application;
        var MutApp = editorLoader.getIframe('id-product_iframe_cnt').contentWindow.MutApp;
        switch (event) {
            case MutApp.EVENT_APP_SIZE_CHANGED: {
                // log('Editor.onAppChanged: MutApp.EVENT_APP_SIZE_CHANGED \''+data.width+'x'+data.height+'\'');
                appContainerSize = {
                    width: data.width,
                    height: data.height
                };
                Workspace.setAppSize({
                    width: data.width,
                    height: data.height
                });
                break;
            }
            case MutApp.EVENT_SCREEN_CREATED: {
                // log('Editor.onAppChanged: MutApp.EVENT_SCREEN_CREATED \''+data.screenId+'\'');
                if (activeScreen === data.screenId) {

                }
                ScreenManager.update({
                    created: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                // log('Editor.onAppChanged: MutApp.EVENT_SCREEN_RENDERED \''+data.screenId+'\'');
                Workspace.handleRenderScreen({
                    screen: data.screen
                });
                if (activeScreen === data.screenId) {
                    // элементы на экране сменились после рендера для активного экрана, надо апдейтить контролы и Workspace
                    var scr = app.getScreenById(activeScreen);
                    Workspace.handleShowScreen({
                        screen: scr
                    });
                    ControlManager.handleShowScreen({
                        screen: scr
                    });
                    ControlManager.filter({
                        screen: scr,
                        propertyStrings: null,
                        selectedElement: Workspace.getSelectedElement()
                    });
                    // todo? Workspace.selectElementOnAppScreen( prev selected element );
                }
                // апдейтить в любом случае, не только для активного экрана
                ScreenManager.update({
                    rendered: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_DELETED: {
                // log('Editor.onAppChanged: MutApp.EVENT_SCREEN_DELETED \''+data.screenId+'\'');
                ScreenManager.update({
                    deleted: data.screen
                });
                Workspace.handleDeleteScreen({
                    screen: data.screen
                });
                if (activeScreen === data.screenId) {
                    // если экран activeScreen был удален, то вместо него надо показать другой, "ближайший" по индексу
                    var newActiveScreenIndex = data.screenIndex;
                    if (newActiveScreenIndex >= app._screens.length) {
                        //data.screenIndex - это индекс удаленного экрана
                        newActiveScreenIndex = app._screens.length - 1;
                    }
                    showScreen(app._screens[newActiveScreenIndex].id);
                }
                break;
            }
            case MutApp.EVENT_SCREEN_SELECTION_REQUESTED: {
                // приложение попросило выделить в редакторе нужный скрин
                showScreen(data.screenId);
                break;
            }
            case MutApp.EVENT_PROPERTY_CREATED: {
                var ctrl = ControlManager.createControl({
                    mutAppProperty: data.property,
                    appIframe: editorLoader.getIframe('id-product_iframe_cnt')
                });
                break;
            }
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {
                var ctrls = ControlManager.getControls({propertyString:data.propertyString});
                if (ctrls && ctrls.length > 0) {
                    //TODO разве тут не должен быть for по всем контролам? Контролов же может быть несколько для одного mutAppProperty
                    ctrls[0].setValue(data.property.getValue());
                }
                else {
                    // for example id=pm quiz has no controls, and some hidden properties
                    //console.error('onAppChanged: there is no control for appProperty: \'' + data.propertyString + '\'');
                }

                if (data.propertyString === 'appConstructor=mutapp projectPageBackgroundImageUrl') {
                    // специальное премиум свойство для смены фона проекта
                    updateProductPageBackgroungImage();
                }

                if (MutApp.Util.matchPropertyString(data.propertyString, 'appConstructor=mutapp shareEntities.{{id}}.imgUrl') === true) {
                    // перехватили измемение картинки для шаринга, запрашиваем вычисление ее размеров
                    // будет произведена запись размеров в скрытые mutAppProperty "appConstructor=mutapp shareEntities.{{id}}.imageWidth"
                    requestCalculationSizeOfShareImage(data.property.getValue());
                }
                break;
            }
            case MutApp.EVENT_PROPERTY_DELETED: {
                var ctrls = ControlManager.deleteControl({
                    mutAppProperty: data.property
                });
                break;
            }
        }
    }

    /**
     * надо определить размеры выбранной картинки и записать их в shareEntities,
     * размеры нужны при публикации - поставить их в og теги
     *
     * @param {string} shareImageUrl
     */
    function requestCalculationSizeOfShareImage(shareImageUrl) {
        if (shareImageUrl) {
            var img = new Image();
            img.addEventListener("load", function() {
                console.log('share image: '+this.naturalWidth +' '+ this.naturalHeight);
                var app = Editor.getEditedApp();
                var shareEntitiesArr = app.shareEntities.toArray();
                for (var i = 0; i < shareEntitiesArr.length; i++) {
                    var e = shareEntitiesArr[i];
                    if (e.imgUrl.getValue() === shareImageUrl) {
                        e.imageWidth = this.naturalWidth;
                        e.imageHeight = this.naturalHeight;
                        console.log('size has been written');
                    }
                }
            });
            img.src = shareImageUrl;
        }
        else {
            // если урл не задан, то размеры картинки тоже надо сбросить, поставить undefined
            var app = Editor.getEditedApp();
            var shareEntitiesArr = app.shareEntities.toArray();
            for (var i = 0; i < shareEntitiesArr.length; i++) {
                var e = shareEntitiesArr[i];
                if (!e.imgUrl.getValue()) {
                    e.imageWidth = undefined;
                    e.imageHeight = undefined;
                }
            }
        }
    }

    /**
     * Колбек из worspace о клике по элементу
     *
     * @param {string} event
     * @param {object} data.dataAppPropertyString (can be null to reset selection)
     */
    function onWorkspaceEvents(event, data) {
        // console.log('onWorkspaceEvents: event=' + event + ' dataAppPropertyString=' + data.dataAppPropertyString);
        switch (event) {
            case Workspace.EVENET_CONTROL_POPUP_HIDED: {
                // Так как EVENET_CONTROL_POPUP_HIDED - это событие о скрытии панели popupControlPanel.js внутри Workspace
                // а нам теперь нужно сделать логическое действие - скрыть контрол по правилам. Для этого надо обновить фильтр.
                ControlManager.filter({
                    propertyStrings: null,
                    screen: editedApp.getScreenById(activeScreen)
                });
                break;
            }
            case Workspace.EVENET_SELECT_ELEMENT: {
                var ps = data.dataAppPropertyString ? data.dataAppPropertyString.split(',') : null;
                if (ps) {
                    // надо обязательно затримить пробелы по краям
                    for (var i = 0; i < ps.length; i++) {
                        ps[i] = ps[i].trim();
                    }
                }
                ControlManager.filter({
                    propertyStrings: ps,
                    selectedElement: Workspace.getSelectedElement(),
                    // если есть propertyStrings для фильтрации то ставим их, элемент выделен
                    // если их нет, значит элемент никакой не выделен и фильтруем по экрану текущему
                    screen: (ps === null) ? editedApp.getScreenById(activeScreen): null
                });
                break;
            }
            case Workspace.EVENET_CONTROL_POPUP_SHOWED: {

                break;
            }
            case Workspace.EVENET_QUICK_PANEL_SHOWED: {
                // do nothing
                break;
            }
            case Workspace.EVENET_QUICK_PANEL_HIDED: {
                // do nothing
                break;
            }
        }
    }

    /**
     * Событие присланное из ControlManager
     *
     * @param {string} event
     * @param {*} data
     */
    function onControlEvents(event, data) {
        data = data || {};
        switch (event) {
            case ControlManager.EVENT_CONTROL_CREATED: {
                // панелька не имеет своего списка контролов и не имеет кобеков на изменения свойств контролов
                // но quickpanel в своем отображении учитывает некоторые свойства контролов. Поэтому передаем ей информацию о создании и изменении
                if (data.control.type === 'quickcontrolpanel') {
                    Workspace.handleQuickControlPropertiesChanged(data.control);
                }
                break;
            }
            case ControlManager.EVENT_CONTROL_DELETED: {

                break;
            }
            case ControlManager.EVENT_CONTROL_PROPERTIES_CHANGED: {
                if (data.control.type === 'quickcontrolpanel') {
                    Workspace.handleQuickControlPropertiesChanged(data.control);
                }
                break;
            }
            case ControlManager.EVENT_QUICK_PANEL_BUTTON_FOR_POPUP_CONTROL_ADDED: {
                // тип data.control.type === popup в данном случае, просто он создал для себя кнопку в quickpanel
                Workspace.handleQuickControlPropertiesChanged(data.control);
                break;
            }
            case ControlManager.EVENT_CHANGE_VALUE: {
                editedApp.getProperty(data.propertyString).setValue(data.value);
                Workspace.updateSelection();
                break;
            }
            case ControlManager.EVENT_FILTER_CHANGED: {
                // {MutApp.Screen} data.screen
                // {Array<string>} data.propertyStrings
                // {boolean} data.quickControlsFiltered
                // {boolean} data.controlPopupFiltered
                if (data.quickControlsFiltered === true) {
                    // был зафильтрован контрол с типом quickcontrolpanel, говорим Workspace показать панель с контролами quickcontrolpanel
                    Workspace.showQuickControlPanel();
                }
                else {
                    Workspace.hideQuickControlPanel();
                }
                if (data.controlPopupFiltered === true) {
                    // был зафильтрован контрол с типом popup, говорим Workspace показать popup контейнер
                    Workspace.showPopupControlsContainer();
                }
                else {
                    Workspace.hidePopupControlsContainer();
                }
                break;
            }
            case ControlManager.EVENT_DICTIONARY_ADD_REQUESTED: {
                // может потребоваться участие пользователя
                var ap = editedApp.getProperty(data.propertyString);
                // по умолчанию добавляем в конец
                var position = ap.getValue().length;
                // может быть прислан контролом уже имя прототипа, чтобы не приходилось выбирать
                if (typeof data.prototypeName === 'string') {
                    // берется из атрибута data-prototype-name если имеется такой атрибут
                    ap.addElementByPrototype(data.prototypeName, position);
                }
                else {
                    if (ap.prototypes.length > 1) {
                        // требуется участие пользователя чтобы сделать выбор прототипа
                        throw new Error('Editor.onControlEvents(EVENT_DICTIONARY_ADD_REQUESTED): not developed yet');
                    }
                    else {
                        // прототип один сразу добавляем
                        ap.addElementByPrototype(ap.prototypes[0].protoFunction, position);
                    }
                }
                break;
            }
            case ControlManager.EVENT_DICTIONARY_DELETING_REQUESTED: {
                var $elem = Workspace.getSelectedElement();
                // у контрола DeleteArrayElement нет информации о выделенном элементе, то есть какой из вариантов ответа (options) пользователь выбрал
                // У DeleteArrayElement есть несколько productDomElements, и какой-то из них Workspace.getSelectedElement(), но какой он не знает.
                if ($elem) {
                    var ap = editedApp.getProperty(data.propertyString);
                    var optionDictionaryId = $elem.attr('data-dictionary-id');
                    if (typeof optionDictionaryId !== 'string') {
                        throw new Error('Editor.onControlEvents(EVENT_DICTIONARY_DELETING_REQUESTED): data-dictionary-id attribute must be specified in productDomElement');
                    }
                    ap.deleteElementById(optionDictionaryId);
                }
                break;
            }
            default: {
                throw new Error('Editor.onControlEvents: event \'' + event + '\' is not supported.');
            }
        }
    }

    /**
     * Показать экран приложения в редакторе
     * Будут применены филтрации контролов
     *
     * @param {string} screenId - id экрана в приложении
     */
    function showScreen(screenId) {
        if (!screenId) {
            if (editedApp._screens && editedApp._screens.length > 0) {
                // если не указан ид экрана показываем первый по умолчанию
                screenId = editedApp._screens[0].id;
            }
            else {
                throw new Error('Editor.showScreen: mutapp has no screens.');
            }
        }
        if (activeScreen !== screenId) {
            var scr = editedApp.getScreenById(screenId);
            editedApp.showScreen(scr);
            Workspace.selectElementOnAppScreen(null);
            Workspace.handleShowScreen({
                screen: scr
            });
            ControlManager.handleShowScreen({
                screen: scr
            });
            ControlManager.filter({
                screen: scr,
                propertyStrings: null,
                selectedElement: Workspace.getSelectedElement()
            });
            ScreenManager.showSelectionOnScreen(scr);
            activeScreen = screenId;
        }
    }

    /**
     * Колбек об изменении в ScreenManager
     *
     * @param {string} event
     * @param {object} data
     */
    function onScreenEvents(event, data) {
        data = data || {};
        var arrayProperty = editedApp.getProperty(data.arrayPropertyString);
        switch (event) {
            case ScreenManager.EVENT_SCREEN_SELECT: {
                showScreen(data.screenId);
                break;
            }
            case ScreenManager.EVENT_ADD_SCREEN: {
                var ap = editedApp.getProperty(data.propertyString);
                if (isNumeric(data.clonedElementId) === true) {
                    // добавление путем клонирования.
                    // был указан элемент который пользователь хочет склонировать
                    if (data.clonedElementId >= ap.getValue().length) {
                        throw new Error('onScreenEvents.EVENT_ADD_SCREEN: There is no prototypes for \''+data.propertyString+'\'');
                    }
                    throw new Error('onScreenEvents.EVENT_ADD_SCREEN: not realized yet. Autotests for clone adding.');
                }
                else {
                    var pp = ap.prototypes;
                    if (!pp || pp.length === 0) {
                        throw new Error('onScreenEvents.EVENT_ADD_SCREEN: There is no prototypes for \''+data.propertyString+'\'');
                    }
                    if (pp.length > 1) {
                        // нужно выбрать прототип для нового элемента, так как возможно несколько вариантов
                        var selectOptions = [];
                        for (var i = 0; i < pp.length; i++) {
                            selectOptions.push({
                                id: pp[i].protoFunction, // имя функции прототипа в виде ключа используется
                                label: pp[i].label,
                                icon: pp[i].img
                            });
                        }
                        // иногда надо дать возможность пользователю выбрать какой именно прототип использовать для нового элемента
                        Editor.showSelectDialog({
                            caption: App.getText('new_slide'),
                            options: selectOptions,
                            callback: (function(selectedOptionId) {
                                if (selectedOptionId) {
                                    // имя функции прототипа в виде ключа (selectedOptionId) используется
                                    for (var j = 0; j < pp.length; j++) {
                                        if (pp[j].protoFunction == selectedOptionId) {
                                            ap.addElementByPrototype(pp[j].protoFunction, data.position);
                                        }
                                    }
                                }
                            }).bind(this)
                        });
                    }
                    else {
                        ap.addElementByPrototype(pp[0].protoFunction, data.position);
                    }
                }
                break;
            }
            case ScreenManager.EVENT_DELETE_SCREEN: {
                // удалить элемент с позиции
                if (isNumeric(data.position) === false) {
                    throw new Error('onScreenEvents.EVENT_DELETE_SCREEN: position must be specified when deleting');
                }
                var ap = editedApp.getProperty(data.propertyString);
                ap.deleteElement(data.position);
                break;
            }
            case ScreenManager.EVENT_CHANGE_POSITION: {
                if (isNumeric(data.elementIndex) === false || isNumeric(data.newElementIndex) === false) {
                    throw new Error('onScreenEvents.EVENY_CHANGE_POSITION: invalid params');
                }
                var ap = editedApp.getProperty(data.propertyString);
                ap.changePosition(data.elementIndex, data.newElementIndex);
                break;
            }
            case ScreenManager.EVENT_CLONE_SCREEN: {
                throw new Error('Editor.onScreenEvents(EVENT_CLONE_SCREEN): not implemented');
//                todo были трудности, решил отложить
//                var ap = editedApp.getProperty(data.propertyString);
//                // копируем указанный элемент массива
//                var newItem = ap.getElementCopy(data.elementIndex);
//                // далее обычное добавление, но без выбора прототипа
//                ap.addElement(newItem, clonedItemIndex+1);
                break;
            }
        }
    }

    function showEditor() {
//        $('#id-product_iframe_cnt').removeClass('__mob');
//        var appIframe = editorLoader.getIframe('id-product_iframe_cnt');
//        $(appIframe).css('border','0')
//            .css('width',appContainerSize.width+'px')
//            .css('height',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
//            .css('maxWidth',appContainerSize.width+'px')
//            .css('maxHeight',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
        $('#id-editor_view').show();
        $('#id-preview_view').hide();
    }

    function showPreview() {
        $('#id-editor_view').hide();
        //todo need for panoramas (in descriptor)
//        hookRunner.on('beforePreview',getEditorEnvironment(),function(e) {
        restartPreviewApp();
        $('#id-preview_view').show();
//        });
    }

    /**
     * Показать окно для вставки со ссылкой
     */
    function showEmbedDialog(result, data) {
        Modal.hideLoading();
        if (result === 'success') {

            showPublishDialog({
                link: activePublisher.getAnonymLink(),
                embedCode: activePublisher.getEmbedCode(),
                embedCodeIframe: activePublisher.getEmbedCodeIframe()
            });
            // надо сохранить статус публикации
            sessionPublishDate = new Date().toString();
        }
        else {
            Modal.showMessage({text: App.getText('publish_error')});
        }
    }

    /**
     * Показать подсказку на любой элемент в редакторе
     * @param elem
     * @param text
     */
    function showWorkspaceHint(elem, text) {
        var $elem = $(elem);
        var $hint = $($('#id-hint_template').html());
        $hint.find('.js-text').html(text);
        var eo = $elem.offset();
        // сначала элемент надо добавить в дерево, чтобв рассчитать его размеры
        $(document.body).append($hint);
        // выравнивание слева от элемента, учитывая актуальный размер элемента и подсказки
        $hint.css('top',eo.top+WorkspaceOffset.top+($elem.outerHeight(false)-$hint.outerHeight(false))/2+'px');
        $hint.css('left',eo.left+WorkspaceOffset.left-$hint.outerWidth(false)-config.editor.ui.hintRightMargin+'px');
        //TODO добавить треугольный указатель
        activeScreenHints.push($hint);
        return $hint;
    }

    function hideWorkspaceHints() {
        while (activeScreenHints.length>0) {
            $(activeScreenHints.pop()).remove();
        }
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
        $('#id-app_preview').removeClass('__mob');
//        var appIframe = editorLoader.getIframe('id-app_preview');
//        $(appIframe).css('border','0')
//            .css('width',appContainerSize.width+'px')
//            .css('height',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
//            .css('maxWidth',appContainerSize.width+'px')
//            .css('maxHeight',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px'); //так как у панорам например гориз скролл и не умещается по высоте он
        // нужно перезапустить приложение чтобы оно корректно обработало свой новый размер
        restartPreviewApp();
    }

    function toMobPreview() {
        previewMode = 'mobile';
        $('#id-app_preview').addClass('__mob');
//        var appIframe = editorLoader.getIframe('id-app_preview');
//        $(appIframe).css('border','0')
//            .css('width','100%')
//            .css('height','100%')
//            .css('maxWidth',appContainerSize.width)
//            .css('maxHeight',appContainerSize.height);
        // нужно перезапустить приложение чтобы оно корректно обработало свой новый размер
        restartPreviewApp();
    }

    function showSelectDialog(params) {
        Workspace.selectElementOnAppScreen(null);
        hideWorkspaceHints();
        var dialog = new SelectDialog(params);
        $('#id-dialogs_view').empty().append(dialog.view).show();
    }

    function showPublishDialog(params) {
        Workspace.selectElementOnAppScreen(null);
        hideWorkspaceHints();
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
     * Функция реализующую предпросмотр платной фичи смены фона для страницы.
     * Картинка ставится и в редактировании и в предпросмотре
     */
    function updateProductPageBackgroungImage() {
        // проверка что фича соответствует тарифу
        if (Auth.isTariff('basic') === true) {
            var ppBackUrl = editedApp.getProperty('appConstructor=mutapp projectPageBackgroundImageUrl').getValue();
            $('#id-workspace').css('background-image', (ppBackUrl) ? 'url('+ppBackUrl+')': 'none')
                .css('background-repeat','no-repeat')
                .css('background-size','cover');
            $('#id-preview_background-image').css('background-image', (ppBackUrl) ? 'url('+ppBackUrl+')': 'none')
                .css('background-repeat','no-repeat')
                .css('background-size','cover');
        }
    }

    /**
     * В редактируемом приложении получить значение по селектору, например 'id=mm previewScale'
     * Использование:
     *  - В контролах, которым нужны данные из приложения (например Drag запрашивает масштаб)
     *
     */
    function getEditedAppValueBySelector(selector) {
        var MutApp = editorLoader.getIframe('id-product_iframe_cnt').contentWindow.MutApp;
        if (editedApp && MutApp.Util.isMutAppPropertySelector(selector) === true) {
            // нашйли в параметрах контрола селектор, получить по нему значение и переписать параметр
            var v = editedApp.getPropertiesBySelector(selector);
            if (v && v.length > 0) {
                return v[0].value;
            }
        }
        return null;
    }

    // public methods
    global.start = start;
    global.showScreen = showScreen;
    global.getAppContainerSize = function() { return appContainerSize; };
    //global.createPreviewsForShare = createPreviewsForShare;
    global.testPreviewsForShare = testPreviewsForShare;
    global.hideWorkspaceHints = hideWorkspaceHints;
    global.getResourceManager = function() { return resourceManager; }
    global.showSelectDialog = showSelectDialog;
    global.getAppId = function() { return appId; };
    global.getEditorEnvironment = getEditorEnvironment;
    global.getEditedApp = function() { return editedApp; }
    global.getPreviewApp = function() { return previewApp; }
    global.showEditor = showEditor;
    global.getActiveScreen = function() { return activeScreen; }
    global.openTemplate = openTemplate;
    global.getEditedAppValueBySelector = getEditedAppValueBySelector;
    global.getAppTemplate = function() { return appTemplate; }
    global.showPublishDialog = showPublishDialog;

})(Editor);