/**
 * Created by artyom.grishanov on 28.12.15.
 */

var Editor = {};

(function(global) {
    /**
     * Приложение MutApp которое редактируется в редакторе
     * @type {null}
     */
    var editedApp = null;
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
     * Сериализованные значени mutappproeprty свойств в приложении
     * Сначала получаются из шаблона
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
     * При сохранении шаблона синхронизируется с MutApp.getOperationsCount()
     * если этот четчик меньше чем в MutApp.getOperationsCount() то будет блокировка при закрытии страницы
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
        resourceManager = new ResourceManager();
        window.onbeforeunload = confirmExit;
        $('.js-app_preview').click(onPreviewClick);
        $('.js-app_publish').click(onPublishClick.bind(this));
        $('.js-app_save_template').click(onSaveTemplateClick.bind(this));
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
                openTemplate({
                    templateUrl: t,
                    clone: cloneTemplate,
                    callback: loadApps
                });
            }
            else {
                // если ссылки на шаблон нет, то открываем по имени промо-проекта, если оно есть
                var n = getQueryParams(document.location.search)[config.common.appNameParamName] || param[config.common.appNameParamName];
                if (n) {
                    appName = n;
                    loadApps();
                }
                else {
                    Modal.showMessage({text: App.getText('select_template')});
                }
            }
        });
    }

    /**
     * Загрузить пару приложений: для редактирования и предпросмотра
     */
    function loadApps() {
        editorLoader.load({
            containerId: 'id-product_iframe_cnt',
            appName: appName,
            onload: onProductIframeLoaded.bind(this)
        });
        editorLoader.load({
            containerId: 'id-app_preview',
            appName: appName
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
        var pp = editedApp.find('shareLink');
        if (pp && pp.length > 0) {
            if (forceChange === true || pp[0].propertyValue == config.common.defaultShareLinkToChange) {
                pp[0].setValue(Publisher.getAnonymLink(appId));
            }
        }
        else {
            log('setDefaultShareLink: can not find shareLink property', true);
        }
    }

    /**
     * Предупреждение случайный закрытий страницы без сохранения
     * @returns {string}
     */
    function confirmExit() {
        if (config.common.awsEnabled === true && editedApp.getOperationsCount() > operationsCount) {
            return App.getText('unsaved_changes');
        }
    }


    /**
     * iFrame промо проекта был загружен. Получаем из него document и window
     */
    function onProductIframeLoaded() {
        // скрыть контролы экранов для некоторых проектов. Например для панорам они не нужны
        if (config.products[appName].hideScreenControls === true) {
            $('#id-screen_controls_cnt').hide();
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

        // нужна ширина для горизонтального выравнивания
//        $('#id-product_cnt')
//            //ширина по умолчанию всегда 800 (стили editor.css->.proto_cnt) содержимое если больше то будет прокручиваться
//            //.width(appContainerSize.width+2*config.editor.ui.screen_blocks_border_width)
//            // высота нужна для задания размеров id-Workspace чтобы он был "кликабелен". Сбрасывание фильтра контролов при клике на него
//            .height(appContainerSize.height+2*config.editor.ui.screen_blocks_border_width+config.editor.ui.id_product_cnt_additional_height);
        // в поле для редактирования подтягиваем стили продукта

//        var $h = $("#id-product_screens_cnt").contents().find('head');
//        $h.append(config.products.common.styles);
//        $h.append(config.products[editedApp.type].stylesForEmbed);
//        $h = $(editorLoader.getIframe()).contents().find('head');
//        $h.append(config.products.common.styles);

        if (config.common.editorUiEnable === true) {
            restartEditedApp();
            showEditor();
            showScreen();
            updateAppContainerSize();
            WorkspaceOffset = $('#id-product_iframe_cnt').offset();
            // проверить что редактор готов, и вызвать колбек
            checkEditorIsReady();

            // для установки ссылки шаринга требуются данные пользователя, ответ от апи возможно надо подождать
            if (App.getUserData()) {
                trySetDefaultShareLink(cloneTemplate === true);
                // показ кнопки загрузки превью картинки для проекта. Только для админов
                if (App.getUserData() && config.common.excludeUsersFromStatistic.indexOf(App.getUserData().id) >= 0) {
                    $('#id-app_prevew_img_wr').show();
                }
            }
            else {
                App.on(USER_DATA_RECEIVED, function() {
                    trySetDefaultShareLink(cloneTemplate === true);
                    // показ кнопки загрузки превью картинки для проекта. Только для админов
                    if (App.getUserData() && config.common.excludeUsersFromStatistic.indexOf(App.getUserData().id) >= 0) {
                        $('#id-app_prevew_img_wr').show();
                    }
                });
            }
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
        checkScreenGroupsArrowsState();
        Modal.hideLoading();
        if (typeof startCallback === 'function') {
            startCallback();
        }

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
    }

//    /**
//     * Показать экран(ы) промо приложения в редакторе.
//     * На экране нужно элементы с атрибутами data-app-property и проинициализировать контролы
//     *
//     * @param {Array.<string>} ids - массив ид экранов
//     */
//    function showScreen(ids) {
//        if (Array.isArray(ids) === false) {
//            ids = [ids];
//        }
//        // запоминаем, если потребуется восстановление показа экранов.
//        // Например, произойдет пересборка экранов и надо будет вернуться к показу последних активных
//        activeScreens = ids;
//        registeredElements = [];
//        // надо скрыть все активные подсказки, если таковые есть. На новом экране будут новые подсказки
//        hideWorkspaceHints();
//        updateAppContainerSize();
//        activeScreenHints = [];
//        activeTriggers = [];
//        // каждый раз удаляем quick-контролы и создаем их заново. Не слишком эффективно, но просто и надежно
//        // то что контролы привязаны к одному экрану определяется только на основании контейнера, в который они помещены
//        var $controlCnt = $('#id-control_cnt').empty();
//        for (var i = 0; i < uiControlsInfo.length;) {
//            var c = uiControlsInfo[i].control;
//            if (c.$parent.selector === $controlCnt.selector) {
//                uiControlsInfo.splice(i,1);
//            }
//            else {
//                i++;
//            }
//        }
//
//        $(previewScreensIframeBody).empty();
//        // в превью контейнер дописать кастомные стили, которые получились в результате редактирования css appProperties
//        //Engine.writeCssRulesTo(previewScreensIframeBody);
//        var appScreen = null;
//        var previewHeight = 0;
//        for (var i = 0; i < ids.length; i++) {
//            appScreen = editedApp.getScreenById(ids[i]);
//            if (appScreen) {
//                var b = createPreviewScreenBlock(appScreen.$el)
//                $(previewScreensIframeBody).append(b);
//                previewHeight += appContainerSize.height;
//                previewHeight += config.editor.ui.screen_blocks_padding+2*config.editor.ui.screen_blocks_border_width; // 20 - паддинг в стиле product_cnt.css/screen_block
//                bindControlsForAppPropertiesOnScreen(appScreen.view, ids[i]);
//                applyTriggers('screen_show');
//            }
//            else {
//                log('Editor.showScreen: appScreen not found '+ids[i]);
//            }
//        }
//        //ширина по умолчанию всегда 800 (стили editor.css->.proto_cnt) содержимое если больше то будет прокручиваться
//        // высота нужна для задания размеров id-Workspace чтобы он был "кликабелен". Сбрасывание фильтра контролов при клике на него
//        $('#id-product_cnt, #id-product_wr').height(previewHeight + config.editor.ui.id_product_cnt_additional_height);
//        // надо выставить вручную высоту для айфрема. Сам он не может установить свой размер, это будет только overflow с прокруткой
//        $('#id-product_iframe_cnt, #id-control_cnt').width(appContainerSize.width + 2*config.editor.ui.screen_blocks_border_width).height(previewHeight);
//        // боковые панели вытягиваем также вслед за экранами
//        $('.js-setting_panel').height(previewHeight);
//        $('#id-Workspace').height(previewHeight);
//
//        //TODO отложенная инициализация, так как директивы контролов загружаются не сразу
//        // подсветка контрола Slide по которому кликнули
////        setActiveScreen(activeScreens.join(','));
//        // восстановление фильтрации элементов, которые были выделены до этого
////        selectElementOnAppScreen({dataAppPropertyString: selectedDataAppProperty});
//
////        $($("#id-product_screens_cnt").contents()).click(function(){
////            // любой клик по промо-проекту сбрасывает подсказки
////            hideWorkspaceHints();
////        });
//    }

    /**
     * В зависимости от режиме превью: моб или веб а также истинного размера приложения
     * выставляется размер iframe в котором загружено приложение
     */
    function updateAppContainerSize() {
        // выставляем первоначальный размер приложения, возможно, оно будет меняться
        appContainerSize = {
            width: editedApp.width,
            height: editedApp.height
        };
//        var appIframe = editorLoader.getIframe('');
//        if (previewMode === 'mobile') {
//            $(appIframe).css('border','0')
//                .css('width','100%')
//                .css('height','100%')
//                .css('maxWidth',appContainerSize.width)
//                .css('maxHeight',appContainerSize.height);
//        }
//        else if (previewMode === 'desktop') {
//            $(appIframe).css('border','0')
//                .css('width',appContainerSize.width+'px')
//                .css('height',appContainerSize.height+'px') //так как у панорам гориз скролл и не умещается по высоте он
//                //.css('maxWidth',appContainerSize.width)
//                .css('maxWidth','100%')
//                .css('maxHeight',appContainerSize.height+'px') //так как у панорам гориз скролл и не умещается по высоте он
//        }
    }

//    function createPreviewScreenBlock(view) {
//        var d = $('<div></div>')
//            .css('width',appContainerSize.width)
//            .css('height',appContainerSize.height)
//            .addClass('screen_block'); // product_cnt.css
//        d.append(view);
//        return d;
//    }

//    /**
//     * Выделить активный экран в контроле с экранами
//     *
//     * @param
//     */
//    function setActiveScreen(dataAppProperty) {
//        $('#id-slides_cnt').find('.slide_selection').removeClass('__active');
//        $('#id-slides_cnt').find('[data-app-property=\"'+dataAppProperty+'\"]').find('.slide_selection').addClass('__active');
//    }

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

//    /**
//     * Вернуть активные экраны. Те которые показаны в текущий момент.
//     *
//     * @returns {Array}
//     */
//    function getActiveScreens() {
//        var result = []
//        for (var i = 0; i < activeScreens.length; i++) {
//            var s = Engine.getAppScreen(activeScreens[i]);
//            if (s) {
//                result.push(s);
//            }
//        }
//        return result;
//    }

    /**
     * Перебрать все элементы на активном экране
     * Нужно для автотестирования в TProduct
     *
     * @param {function} iterator
     */
    function forEachElementOnScreen(iterator) {
        for (var i = 0; i < activeScreens.length; i++) {
            var appScreen = Engine.getAppScreen(activeScreens[i]);
            for (var k = 0; k < appScreen.appPropertyElements.length; k++) {
                iterator(appScreen.appPropertyElements[k]);
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
        if (App.getUserData() !== null) {
            Modal.showLoading();
            // сначала создать превью-картинки для шаринга, записать ссылки на них в приложение
            // и уже потом выкатывать приложение
            //createPreviewsForShare(function() {
                if (config.products[appName].customPublisherObject) {
                    activePublisher = window[config.products[appName].customPublisherObject];
                }
                else {
                    activePublisher = Publisher;
                }
                // нужно дописать свойство "опубликованности" именно в опубликованное приложение
                var appStr = editedApp.serialize();
                activePublisher.publish({
                    appId: appId,
                    appName: appName,
                    width: editedApp.width,
                    height: editedApp.height,
                    appStr: appStr,
                    cssStr: editedApp.getCssRulesString(),
                    promoIframe: editorLoader.getIframe('id-product_iframe_cnt'),
                    baseProductUrl: config.products[appName].baseProductUrl,
                    //awsBucket: App.getAWSBucketForPublishedProjects(),
                    callback: function(publishResult) {
                        // после каждой публикации автоматически сохраняем шаблон
                        saveTemplate({
                            callback: function() {
                                showEmbedDialog(publishResult);
                            }
                        });
                    }
                });
            //});
        }
        else {
            Modal.showLogin();
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

        if (App.getAWSBucket() !== null && App.getUserData() !== null) {
            if (param.showLoadingPopup === true) {
                Modal.showLoading();
            }
            // параметры сохраняемого шаблона
            var templParam = {
                id: appId,
                appName: appName,
                propertyValues: editedApp.serialize(),
                title: $('.js-proj_name').val()
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
                // это новый шаблон
                // мы не открывали из своих шаблонов что-то, и не сохранили ранее ничего
                storingTempl = new Template(templParam);
                openedTemplateCollection.add(storingTempl);
            }
            storingTempl.set(templParam);
            openedTemplateCollection.saveTemplate(function(result){
                if (result === 'ok') {
                    operationsCount = editedApp.getOperationsCount();
                    if (param.showResultMessage === true) {
                        alert('Сохранено');
                    }
                    App.stat('Testix.me', 'Template_saved');
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
                        saveTemplate();
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
     * @param {MutApp} [param.app] - опционально, будет использован editedApp по умолчанию
     * @return {string} - урл на превью картинки
     */
    function generateAppAutoPreview(param) {
        param = param || {};
        param = param.app || editedApp;
        // проверяем что надо генерить првеью для проекта если только пользователь ранее не установил свое кастомное превью
        // его не надо перезаписывать
        if (config.common.previewAutoGeneration === true) {
            var url = 'facebook-'+App.getUserData().id+'/app/'+appId+'.jpg';

            previewService.createInIframe({
                html: editedApp.getAutoPreviewHtml(),
                stylesToEmbed: [config.products.common.styles, config.products[appName].stylesForEmbed],
                cssString: editedApp.getCssRulesString(),
                width: appContainerSize.width,
                height: appContainerSize.height,
                callback: function(canvas) {
                    s3util.uploadCanvas(App.getAWSBucket(), null, url, canvas);
                }
            });

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

            if (editedApp._shareEntities && editedApp._shareEntities.length > 0) {
                // генерация канвасов заново и аплоад их с получением урла
                shareImageService.requestImageUrls((function(){
                    // перед публикацией переустановка всех урлов картинок для публикации
                    for (var i = 0; i < app._shareEntities.length; i++) {
                        var url = shareImageService.findImageInfo(editedApp._shareEntities[i].id).imgUrl;
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
     * Включить обработчик для проверки
     * При клике Ctrl + i будет запускаться проверка
     */
    function handleInspector() {
        $(window).keypress(function(event) {
            if (event.which == 105) {
                inspector.isOK();
                event.preventDefault();
            }
            return false;
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
                serializedProperties = appTemplate.propertyValues;
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
            defaults: serializedProperties,
            appChangeCallbacks: [onAppChanged]
        });
    }

    /**
     * Запустить превью MutApp приложение
     */
    function restartPreviewApp() {
        previewApp = editorLoader.startApp({
            containerId: 'id-app_preview',
            mode: 'preview',
            defaults: editedApp.serialize() // передача значений mutappproperty в от редактируемого приложения
        });
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
            case MutApp.EVENT_SCREEN_CREATED: {
                log('Editor.onAppChanged: MutApp.EVENT_SCREEN_CREATED \''+data.screenId+'\'');
                if (activeScreen === data.screenId) {

                }
                ScreenManager.update({
                    created: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                log('Editor.onAppChanged: MutApp.EVENT_SCREEN_RENDERED \''+data.screenId+'\'');
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
                        propertyStrings: null
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
                log('Editor.onAppChanged: MutApp.EVENT_SCREEN_DELETED \''+data.screenId+'\'');
                ScreenManager.update({
                    deleted: data.screen
                });
                Workspace.handleDeleteScreen({
                    screen: data.screen
                });
                if (activeScreen === data.screenId) {
                    // если экран activeScreen был удален, то вмето него надо показать другой, "ближайший" по индексу
                    var newActiveScreenIndex = data.screenIndex;
                    if (newActiveScreenIndex >= app._screens.length) {
                        //data.screenIndex - это индекс удаленного экрана
                        newActiveScreenIndex = app._screens.length - 1;
                    }
                    showScreen(app._screens[newActiveScreenIndex].id);
                }
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
                    ctrls[0].setValue(data.property.getValue());
                }
                else {
                    // for example id=pm quiz has no controls, and some hidden properties
                    //console.error('onAppChanged: there is no control for appProperty: \'' + data.propertyString + '\'');
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
     * Колбек из worspace о клике по элементу
     *
     * @param {string} event
     * @param {object} data.dataAppPropertyString (can be null to reset selection)
     */
    function onWorkspaceEvents(event, data) {
        console.log('onWorkspaceEvents: event=' + event + ' dataAppPropertyString=' + data.dataAppPropertyString);
        switch (event) {
            case Workspace.EVENET_SELECT_ELEMENT: {
                var ps = data.dataAppPropertyString ? data.dataAppPropertyString.split(',') : null;
                if (ps) {
                    // надо обязательно затримить пробелы по краям
                    for (var i = 0; i < ps.length; i++) {
                        ps[i] = ps[i].trim();
                    }
                }
                ControlManager.filter({
                    propertyStrings: ps
                });
                break;
            }
            case Workspace.EVENET_CONTROL_POPUP_SHOWED: {

                break;
            }
            case Workspace.EVENET_CONTROL_POPUP_HIDED: {

                break;
            }
            case Workspace.EVENET_QUICK_PANEL_SHOWED: {

                break;
            }
            case Workspace.EVENET_QUICK_PANEL_HIDED: {

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
                if (ap.prototypes.length > 1) {
                    // требуется участие пользователя чтобы сделать выбор прототипа
                    throw new Error('Editor.onControlEvents(EVENT_DICTIONARY_ADD_REQUESTED): not developed yet');
                }
                else {
                    // прототип один сразу добавляем
                    ap.addElementByPrototype(ap.prototypes[0].protoFunction, position);
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
            // если не указан ид экрана показываем первый по умолчанию
            screenId = editedApp._screens[0].id;
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
                propertyStrings: null
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
                embedCode: activePublisher.getEmbedCode()
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

    // public methods
    global.start = start;
    global.forEachElementOnScreen = forEachElementOnScreen;
    global.showScreen = showScreen;
    global.getAppContainerSize = function() { return appContainerSize; };
    global.getSlideGroupControls = function() { return slideGroupControls; };
    global.createPreviewsForShare = createPreviewsForShare;
    global.testPreviewsForShare = testPreviewsForShare;
    global.hideWorkspaceHints = hideWorkspaceHints;
    global.getResourceManager = function() { return resourceManager; }
    global.showSelectDialog = showSelectDialog;
    global.getAppId = function() { return appId; };
    global.getEditorEnvironment = getEditorEnvironment;
    global.getEditedApp = function() { return editedApp; }
    global.showEditor = showEditor;
    global.getActiveScreen = function() { return activeScreen; }
    global.openTemplate = openTemplate;

})(Editor);