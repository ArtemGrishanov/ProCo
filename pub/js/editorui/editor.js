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
    var activeScreens = [];
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
    var workspaceOffset = null;
    /**
     * Массив контролов и свойств AppProperty продукта
     * @type {Array.<object>}
     */
    var uiControlsInfo = [
        // Контрол определяется парой: appProperty+domElement
        //   - одного appProperty не достаточно, так как для одного и того же appProperty на экранах или даже одном экране могут быть дублирующие элементы
        // control
        // appProperty
        // domElement
    ];
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
     * Элемент внутри айФрейма куда добавляем экраны промо приложения
     * @type {null}
     */
    var previewScreensIframeBody = null;
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
     * Html объект, рамка выделения
     * @type {Array}
     */
    var $selectionBorder = null;
    /**
     * Выделенный элемент, вокруг которого рисуется рамка выделения $selectionBorder
     * @type {null}
     */
    var selectedElem = null;
    /**
     * Функция колбек на запуск редактора
     * @type {function}
     */
    var startCallback = null;
    /**
     * Панелька с контролами, которая всплывает рядом с элементом и указывает на него
     * @type {QuickControlPanel}
     */
    var quickControlPanel = null;
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
        $('#id-workspace').click(function(){
            // любой клик по документу сбрасывает фильтр контролов
            selectElementOnAppScreen(null);
        });
        $('#id-app_preview_img').change(function() {
            // загрузка пользовательского превью для шаблона
            // сразу без превью - аплоад
            uploadUserCustomTemplatePreview();
        });
        workspace.init();
        resourceManager = new ResourceManager();
        quickControlPanel = new QuickControlPanel();
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
        if (config.common.awsEnabled === true && editedApp.getOperationsCount() > operationsCount) {
            return App.getText('unsaved_changes');
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
            // скрыть контролы экранов для некоторых проектов. Например для панорам они не нужны
            if (config.products[appName].hideScreenControls === true) {
                $('#id-screen_controls_cnt').hide();
            }
            iframeWindow = null;
            appIframe = document.createElement('iframe');
            appIframe.onload = onProductIframeLoaded;
            $(appIframe).addClass('proto_cnt').addClass('__hidden');
            var host = config.common.home;
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
        editedApp = iframeWindow.app;
        // запуск движка с передачей информации о шаблоне
        var params = {
            appName: appName,
            appStorageString: getQueryParams(document.location.search)[config.common.appStorageParamName]
        };
        if (appTemplate) {
            params.values = appTemplate.propertyValues;
        }
        //Engine.startEngine(iframeWindow, params);

        // установить хуки которые есть в дескрипторе. Может не быть вовсе
        //hookRunner.setHooks(iframeWindow.descriptor.hooks);

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

        updateAppContainerSize();

        // нужна ширина для горизонтального выравнивания
//        $('#id-product_cnt')
//            //ширина по умолчанию всегда 800 (стили editor.css->.proto_cnt) содержимое если больше то будет прокручиваться
//            //.width(appContainerSize.width+2*config.editor.ui.screen_blocks_border_width)
//            // высота нужна для задания размеров id-workspace чтобы он был "кликабелен". Сбрасывание фильтра контролов при клике на него
//            .height(appContainerSize.height+2*config.editor.ui.screen_blocks_border_width+config.editor.ui.id_product_cnt_additional_height);
        // в поле для редактирования подтягиваем стили продукта
        var $h = $("#id-product_screens_cnt").contents().find('head');
        $h.append(config.products.common.styles);
        $h.append(config.products[editedApp.type].stylesForEmbed);
        $h = $(appIframe).contents().find('head');
        $h.append(config.products.common.styles);

        if (config.common.editorUiEnable === true) {
            showEditor();
            createScreenControls();
            syncUIControlsToAppProperties();
            workspaceOffset = $('#id-product_screens_cnt').offset();
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

                // специальная возможность для панорам: сразу открыть окно выбора картинки с помощью передами параметра с витрины
                setTimeout(function() {
                    try {
                        var pn = getQueryParams(document.location.search)['pano_open_rm'];
                        if (pn) {
                            Editor.findControlInfo('id=mm panoramaImgSrc')[0].control.onDirectiveClick();
                        }
                    }
                    catch(err) { log (err.message, true) }
                }, 1200);

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
    function showScreen(ids) {
        if (Array.isArray(ids) === false) {
            ids = [ids];
        }
        // запоминаем, если потребуется восстановление показа экранов.
        // Например, произойдет пересборка экранов и надо будет вернуться к показу последних активных
        activeScreens = ids;
        registeredElements = [];
        // надо скрыть все активные подсказки, если таковые есть. На новом экране будут новые подсказки
        hideWorkspaceHints();
        updateAppContainerSize();
        activeScreenHints = [];
        activeTriggers = [];
        // каждый раз удаляем quick-контролы и создаем их заново. Не слишком эффективно, но просто и надежно
        // то что контролы привязаны к одному экрану определяется только на основании контейнера, в который они помещены
        var $controlCnt = $('#id-control_cnt').empty();
        for (var i = 0; i < uiControlsInfo.length;) {
            var c = uiControlsInfo[i].control;
            if (c.$parent.selector === $controlCnt.selector) {
                uiControlsInfo.splice(i,1);
            }
            else {
                i++;
            }
        }

        $(previewScreensIframeBody).empty();
        // в превью контейнер дописать кастомные стили, которые получились в результате редактирования css appProperties
        //Engine.writeCssRulesTo(previewScreensIframeBody);
        var appScreen = null;
        var previewHeight = 0;
        for (var i = 0; i < ids.length; i++) {
            appScreen = editedApp.getScreenById(ids[i]);
            if (appScreen) {
                var b = createPreviewScreenBlock(appScreen.$el)
                $(previewScreensIframeBody).append(b);
                previewHeight += appContainerSize.height;
                previewHeight += config.editor.ui.screen_blocks_padding+2*config.editor.ui.screen_blocks_border_width; // 20 - паддинг в стиле product_cnt.css/screen_block
                bindControlsForAppPropertiesOnScreen(appScreen.view, ids[i]);
                applyTriggers('screen_show');
            }
            else {
                log('Editor.showScreen: appScreen not found '+ids[i]);
            }
        }
        //ширина по умолчанию всегда 800 (стили editor.css->.proto_cnt) содержимое если больше то будет прокручиваться
        // высота нужна для задания размеров id-workspace чтобы он был "кликабелен". Сбрасывание фильтра контролов при клике на него
        $('#id-product_cnt, #id-product_wr').height(previewHeight + config.editor.ui.id_product_cnt_additional_height);
        // надо выставить вручную высоту для айфрема. Сам он не может установить свой размер, это будет только overflow с прокруткой
        $('#id-product_screens_cnt, #id-control_cnt').width(appContainerSize.width + 2*config.editor.ui.screen_blocks_border_width).height(previewHeight);
        // боковые панели вытягиваем также вслед за экранами
        $('.js-setting_panel').height(previewHeight);
        $('#id-workspace').height(previewHeight);

        //TODO отложенная инициализация, так как директивы контролов загружаются не сразу
        // подсветка контрола Slide по которому кликнули
        setActiveScreen(activeScreens.join(','));
        // восстановление фильтрации элементов, которые были выделены до этого
        selectElementOnAppScreen({dataAppPropertyString: selectedDataAppProperty});

        $($("#id-product_screens_cnt").contents()).click(function(){
            // любой клик по промо-проекту сбрасывает подсказки
            hideWorkspaceHints();
        });
    }

    function updateAppContainerSize() {
        // выставляем первоначальный размер приложения, возможно, оно будет меняться
        appContainerSize = {
            width: editedApp.width,
            height: editedApp.height
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
     * Выделить активный экран в контроле с экранами
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
        for (var i = 0; i < activeScreens.length; i++) {
            var s = Engine.getAppScreen(activeScreens[i]);
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
        for (var i = 0; i < activeScreens.length; i++) {
            var appScreen = Engine.getAppScreen(activeScreens[i]);
            for (var k = 0; k < appScreen.appPropertyElements.length; k++) {
                iterator(appScreen.appPropertyElements[k]);
            }
        }
    }

    /**
     * На добавленном view экрана скорее всего есть какие dom-элементы связанные с appProperties
     * Найдем их и свяжем с контролами редактирования
     *
     * @param {HTMLElement} $view
     * @param {string} scrId
     *
     */
    function bindControlsForAppPropertiesOnScreen($view, scrId) {
        var appScreen = editedApp.getScreenById(scrId);

        // найти и удалить эти типы контролов
        // при показе экрана они пересоздаются заново
        clearControls(['workspace', 'quickcontrolpanel']);

        for (var k = 0; k < appScreen.getLinkedMutAppProperties().length; k++) {
            var appProperty = appScreen.getLinkedMutAppProperties()[k];
            // для всех элементов связанных с appProperty надо создать событие по клику.
            // в этот момент будет происходить фильтрация контролов на боковой панели
            // элемент, конечно, может быть привязан к нескольким appProperty, ведь содержит несколько значений в data-app-property
            // надо избежать создания дублирующихся обработчиков
            var de = appProperty.uiElement;
            if (registeredElements.indexOf(de) < 0) {
                $(de).click(function(e) {
                    selectElementOnAppScreen({
                        $elementOnAppScreen: $(e.currentTarget)
                    });
                    e.preventDefault();
                    e.stopPropagation();
                });
                registeredElements.push(de);
            }
            // контрола пока ещё не существует для настройки, надо создать
            var propertyString = appProperty.propertyString;
            // может быть несколько контролов для appProperty (например, кнопка доб ответа и кнопка удал ответа в одном и том же массиве)
            var controlsInfo = appProperty.controls;
            for (var j = 0; j < controlsInfo.length; j++) {
                var cn = controlsInfo[j].name;
                // здесь надо создавать только контролы которые находятся на рабочем поле, например textquickinput
                // они пересоздаются каждый раз при переключении экрана
                // "обычные" контролы создаются иначе
                if (config.controls[cn].type === 'workspace' || config.controls[cn].type === 'quickcontrolpanel') {

                    // на домэлемент можно повесить фильтр data-control-filter и в descriptor в параметрах также его указать
                    if (checkControlFilter(de, controlsInfo[j].params)===true) {
                        // имя вью для контрола
                        var viewName = controlsInfo[j].params.viewName;
                        // простейшая обертка для контрола, пока помещаем туда
                        var wrapper = (config.controls[cn].type === 'quickcontrolpanel') ? $('<div></div>'): null;
                        var newControl = createControl(appProperty.propertyString,
                            viewName,
                            controlsInfo[j].name,
                            controlsInfo[j].params,
                            wrapper,
                            de);
                        if (newControl) {
                            // только если действительно получилось создать ui для настройки
                            // не все контролы могут быть реализованы или некорректно указаны
                            uiControlsInfo.push({
                                propertyString: appProperty.propertyString,
                                control: newControl,
                                domElement: de,
                                type: config.controls[cn].type,
                                wrapper: wrapper
                            });
                        }
                        else {
                            log('Can not create control \''+controlsInfo[j].name+'\' for appProperty: \''+appProperty.propertyString+ '\' on the screen '+scrId, true);
                        }
                    }

                }
            }
        }
    }

    /**
     * Выделить dom-элемент на экране приложения
     * Подразумевается, что у него есть атрибут data-app-property
     *
     * @param {DOMElement} params.$elementOnAppScreen
     * @param {string} params.dataAppPropertyString
     */
    function selectElementOnAppScreen(params) {
        params = params || {};
        if (!params.$elementOnAppScreen && !params.dataAppPropertyString) {
            // снятие рамки выделения
            workspace.selectElementOnAppScreen(null);
            filterControls(null, null, getActiveScreens());
            selectedDataAppProperty = null;
        }
        else {
            if (params.$elementOnAppScreen) {
                params.dataAppPropertyString = params.$elementOnAppScreen.attr('data-app-property');
            }
            else if (typeof params.dataAppPropertyString === 'string') {
                for (var i = 0; i < registeredElements.length; i++) {
                    // не важно сколько propertyStrings через запятую содержится внутри атрибута на самом деле
                    if ($(registeredElements[i]).attr('data-app-property') === params.dataAppPropertyString) {
                        params.$elementOnAppScreen = $(registeredElements[i]);
                        break;
                    }
                }
            }
            // после нормализации значений устанавливаем выделение и применяем фильтрацию контролов
            if (params.$elementOnAppScreen && params.dataAppPropertyString) {
                // кликнули по элементу в промо приложении, который имеет атрибут data-app-property
                // задача: отфильтровать настройки на правой панели
                workspace.selectElementOnAppScreen(params.$elementOnAppScreen);
                // [0] - должны передать DOMElement а не jQuery-обертку
                filterControls(params.dataAppPropertyString, params.$elementOnAppScreen[0], getActiveScreens());
                selectedDataAppProperty = params.dataAppPropertyString;
            }
            else {
                selectedDataAppProperty = null;
            }
        }
    }

    /**
     * Контролы извне могут попросить редактор проапдейтить рамку выделения у текущего элемента
     */
    function updateSelection() {
        workspace.updateSelectionPosition();
    }

    /**
     * Удалить контролы по типам
     * @param {array} types
     */
    function clearControls(types) {
        for (var i = 0; i < uiControlsInfo.length;/*no increment*/) {
            var deleted = false;
            for (var j = 0; j < types.length; j++) {
                if (uiControlsInfo[i].type === types[j]) {
                    uiControlsInfo[i].control.destroy();
                    uiControlsInfo.splice(i, 1);
                    deleted = true;
                    break;
                }
            }
            if (deleted===false) {
                i++;
            }
        }
    }

    /**
     * Проверяет что для этого domElement можно создать контрол с параметрами
     * Если никаких фильтров не задано, значит можно.
     * Этот механизм используется при различных опциях ответов, для них нужны разные немного контролы. Хотя и описанные одним правилом в descriptor
     *
     * @param domElement
     * @param controlParam
     */
    function checkControlFilter(domElement, controlParam) {
        var filterAttr = $(domElement).attr('data-control-filter');
        if (filterAttr) {
            filterAttr = filterAttr.replace(new RegExp(/\s/, 'g'), '');
            var filters = filterAttr.split(',')
            for (var m = 0; m < filters.length; m++) {
                // ожидаем выражение вида key=value
                var pairs = filters[m].split('=');
                if (pairs.length==2) {
                    if (controlParam[pairs[0]]==pairs[1]) { //0=='0' должно быть равно
                        return true;
                    }
                }
            }
            // атрибут задан, но подходящего условия не нашли
            return false;
        }
        // если фильтр не указан вообще значит считаем что контрол подходит
        return true;
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


    /**
     * TODO
     * РЕФАКТОРИНГ КОНТРОЛОВ
     *
     * - массив uiControlsInfo конфюзит и очень не прозрачный
     * - Выделение панелей с контролами в самостоятельные MVC сервисы для организации кода
     * - Более экономные сортировки и операции показа/скрытия и создания. Без дублирования операций
     * - Контролы должны быть максимально отделены от редактора по логике и окружению. Чтобы их можно было даже автоматически тестировать
     * - то что каждый раз контролы пересоздаются и директивы перезагружаются
     * -
     *
     *
     * РАБОЧЕЕ ПОЛЕ workspace
     * - тоже отделить от редактора как компонент
     * -
     *
     */



    /**
     * Отфильтровать и показать только те контролы, appPropertyString которых есть в dataAppPropertyString
     * Это могут быть контролы на боковой панели или во всплывающей панели quickControlPanel
     *
     * @param {string} dataAppPropertyString например 'backgroundColor,showBackgroundImage'
     * @param {domElement} element на который кликнул пользователь
     * @param {Array} activeScreenIds экраны активные в данный момент. Есть такой тип фильтрации showWhileScreenIsActive
     */
    function filterControls(dataAppPropertyString, element, activeScreenIds) {
        var quickControlPanelControls = [];
        if (dataAppPropertyString) {
            $('#id-static_controls_cnt').children().hide();
            // может быть несколько свойств через запятую: фон кнопки, ее бордер, цвет шрифта кнопки и так далее
            var keys = dataAppPropertyString.split(',');
            for (var i = 0; i < keys.length; i++) {
                var cArr = findControlInfo(keys[i].trim(), element);

                // результатов поиска может быть несколько
                // например по id=tm quiz.0.answer.options - контрол добавлени и удаления
                for (var j = 0; j < cArr.length; j++) {
                    var c = cArr[j];
                    // контролы которые должны показаться на всплывающей панели quickControlPanel
                    if (c && c.type === 'quickcontrolpanel') {
                        // событие _onShow будет вызвано позже для этого типа 'quickcontrolpanel'
                        quickControlPanelControls.push(c);
                    }
                    else {
                        if (c && c.wrapper) {
                            c.wrapper.show();
                            if (c.control._onShow) {
                                c.control._onShow();
                            }
                        }
                    }

                    //TODO test
                    // refactor
                    // $productDOMElement не устанавливается для контролов controlpanel при создании
                    // а он оказался нужен для Alternative
                    if (c.type === 'controlpanel') {
                        c.control.$productDOMElement = $(element);
                    }
                }
            }
        }
        else {
            // сбрасываем фильтр - показываем всё что не имеет filter=true
            for (var i = 0; i < uiControlsInfo.length; i++) {
                var c = uiControlsInfo[i];
                if (c.type && c.type === 'controlpanel') {
                    if (c.filter === true) {
                        c.wrapper.hide();
                    }
                    else {
                        c.wrapper.show();
                        if (c.control._onShow) {
                            c.control._onShow();
                        }
                    }
                }
            }
        }

        // Фильтрация контролов которые должны быть показаны во время показа экрана
        for (var i = 0; i < uiControlsInfo.length; i++) {
            var c = uiControlsInfo[i];
            if (c.type && c.type === 'controlpanel') {
                var found = false;
                for (var n = 0; n < activeScreenIds.length; n++) {
                    if (activeScreenIds[n].indexOf(c.showWhileScreenIsActive) >= 0) {
                        found = true;
                        break;
                    }
                }
                if (c.showWhileScreenIsActive !== undefined && found === true) {
                    // пока активен экран c.showWhileScreenIsActive надо показывать контрол, такой тип фильтрации по экрану
                    c.wrapper.show();
                    $('#id-static_controls_cnt').prepend(c.wrapper); // контроля фильтруемые по экрану должны быть выше, у них более высокий приоритет
                    if (c.control._onShow) {
                        c.control._onShow();
                    }
                }
            }
        }

        // есть несколько контролов для всплывашки, которые надо показать
        if (quickControlPanelControls.length > 0) {
            quickControlPanel.show(element, quickControlPanelControls);
            for (var n = 0; n < quickControlPanelControls.length; n++) {
                var c = quickControlPanelControls[n];
                if (c.control._onShow) {
                    c.control._onShow();
                }
            }
        }
        else {
            quickControlPanel.hide();
        }
    }

    /**
     * полное пересоздание всех контролов
     * Привязать элементы управления к Engine.getAppProperties
     * Создаются только новые элементы управления, которые необходимы.
     * Может быть добавлен/удален слайд, поэтому надо только для него сделать обновление.
     *
     * Это могут быть следующие действия:
     * 1) Добавление контролов на панель справа.
     * 2) Обновление контрола слайдов (страниц) (один большой контрол)
     * 3) Привязка контролов к dom-элементам в продукте, Для быстрого редактирования.
     *
     * @param {array} [startActiveScreens] - стартовые экраны для показа
     */
    function syncUIControlsToAppProperties(startActiveScreens) {
        clearControls(['workspace', 'quickcontrolpanel', 'controlpanel']);
        uiControlsInfo = [];
        $('#id-static-no_filter_controls').empty();
        $('#id-static_controls_cnt').empty();
        $('#id-control_cnt').empty();

        // задача здесь: создать постоянные контролы, которые не будут меняться при переключении экранов
        var appPropertiesStrings = Engine.getAppPropertiesObjectPathes();
        for (var i = 0; i < appPropertiesStrings.length; i++) {
            var ps = appPropertiesStrings[i];
            var ap = Engine.getAppProperty(ps);
            if (ap.controls) {
                // у свойства может быть несколько контролов
                for (var j = 0; j < ap.controls.length; j++) {
                    var c = ap.controls[j];
                    if (config.controls[c.name]) {
                        if (config.controls[c.name].type === 'controlpanel') {
                            // контрол помечен как постоянный в дескрипторе, то есть его надо создать сразу и навсегда (пересоздастся только вместе с экранами)
                            var parent = null;
                            var sg = c.params.screenGroup;
                            if (sg) {
                                // контрол привязан в группе экранов, а значит его родитель другой, так себе решение.
                                parent = $('[data-screen-group-name=\"'+sg+'\"]').find('.js-slide_group_controls');
                            }
                            else {
                                // выбираем панель по принципу: фильтруется контрол или нет (фильтр по клику или по экрану)
                                var parentPanelId = (ap.filter === true || ap.showWhileScreenIsActive) ? '#id-static_controls_cnt': '#id-static-no_filter_controls';

                                // каждый контрол предварительно помещаем в отдельную обертку, а потом уже на панель настроек
                                var $cc = $($('#id-static_control_cnt_template').html()).appendTo(parentPanelId);
                                if (ap.label) {
                                    var textLabel = (typeof ap.label==='string')? ap.label: ap.label[App.getLang()];
                                    if (config.controls[c.name].labelInControl === true) {
                                        // метка находится внутри самого контрола а не вовне как обычно
                                        // UI контрола будет загружен после, поэтому пробрасываем внутрь контрола label
                                        c.params.__label = textLabel;
                                        $cc.find('.js-label').remove();
                                    }
                                    else {
                                        $cc.find('.js-label').html(textLabel);
                                    }
                                }
                                if (ap.filter === true) {
                                    // свойства с этим атрибутом filter=true показываются только при клике на соответствующих элемент в промо-приложении
                                    // который помечен data-app-property
                                    $cc.hide();
                                }
                                parent = $cc.find('.js-control_cnt');
                            }
                            var newControl = createControl(ps, c.params.viewName, c.name, c.params, parent);
                            if (ps === 'id=startScr backgroundImg') {
                                var stopHere = 0;
                            }
                            if (newControl) {
                                uiControlsInfo.push({
                                    propertyString: ps,
                                    control: newControl,
                                    wrapper: $cc, // контейнер, в котором контрол находится на боковой панели контролов
                                    filter: ap.filter, // чтобы потом не искать этот признак во время фильтрации
                                    showWhileScreenIsActive: ap.showWhileScreenIsActive,
                                    type: config.controls[c.name].type // также для быстрого поиска
                                });
                            }
                            else {
                                log('Can not create control for appProperty: \'' + ps, true);
                            }
                        }
                    }
                    else {
                        log('Control: \'' + c.name + '\' isn\'t descripted in config.js' , true);
                    }
                }
            }
        }

        //TODO жесткий хак: данная инициализация не поддерживается на нескольких колорпикерах
        // надо отследить загружку всех директив колорпикеров и тогда инициализировать их
        setTimeout(function() {
            initColorpickers();
            setTimeout(function() {
                initColorpickers();
            }, 10000);
        }, 6000);

        if (startActiveScreens) {
            activeScreens = startActiveScreens;
        }
        if (activeScreens.length > 0) {
            // восстановить показ экранов, которые видели ранее
            showScreen(activeScreens);
        }
        else {
            // первый экран показать по умолчанию
            //TODO первый старт: надо дождаться загрузки этого айфрема и нормально проинициализировать после
            setTimeout(function() {
                previewScreensIframeBody = $("#id-product_screens_cnt").contents().find('body');
                showScreen(Editor.getEditedApp().getScreenIds()[0]);
            }, 1000);
        }

        // стрелки управления прокруткой, нормализация
        checkScreenGroupsArrowsState();
    }

    function initColorpickers() {
        // стараемся выполнить после загрузки всех колорпикеров
        try {
            $('.colorpicker').colorpicker();
            $('.colorpicker input').click(function() {
                $(this).parents('.colorpicker').colorpicker('show');
            })
        }
        catch (e) {
            // strange thing here
            //bootstrap-colorpicker.min.js:19 Uncaught TypeError: Cannot read property 'toLowerCase' of undefined
            log(e,true);
        }
    }

    /**
     * Модель управления экранами:
     * Сейчас предполагается что группы экранов постоянные
     *
     * Конролы управления экранами специфичные, поэтому существует отдельная функция для их создания
     *
     * Упрвления отдельными Slide спрятана внутрь одного SlideGroupControl
     */
    function createScreenControls() {
        $('#id-slides_cnt').empty();
        //TODO конечно не надо пересоздавать каждый раз всё при добавл-удал экрана. Но так пока проще
        var appScreenIds = editedApp.getScreenIds();
        // экраны могут быть поделены на группы
        var groups = {};
        var sGroups = [];
        if (appScreenIds.length > 0) {
            // подготовительная часть: разобъем экраны на группы
            // groups - просто временный вспомогательный объект
            for (var i = 0; i < appScreenIds.length; i++) {
                var s = appScreenIds[i];
                var screen = editedApp.getScreenById(s);
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
                var firstScrInGroup = editedApp.getScreenById(curG[0]);
                var sgc = findSlideGroupByGroupName(groupName);
                if (sgc === null) {
                    // группой экранов может управлять массив.
                    // в случае вопросов теста: эта группа привязана к quiz, передается в промо проекте при создании экранов
                    // для остальных undefined
                    sgc = createControl(firstScrInGroup.arrayAppPropertyString, 'SlideGroupControl', 'SlideGroupControl', {}, $('#id-slides_cnt'));
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

    /**
     * Найти информацию об элементе управления
     * @param {string} propertyString свойство для которого ищем элемент управления
     * @param [domElement]
     * @returns {array}
     */
    function findControlInfo(propertyString, domElement) {
        var results = [];
        for (var j = 0; j < uiControlsInfo.length; j++) {
            // TODO для контролов типа controlpanel я не сохранял элементы domElement, и в эту функцию передается undefined
            // поэтому такая заточка
            if (domElement && uiControlsInfo[j].type!=='controlpanel') {
                // если важен domElem
                if (propertyString === uiControlsInfo[j].propertyString && domElement === uiControlsInfo[j].domElement) {
                    results.push(uiControlsInfo[j]);
                }
            }
            else {
                // если domElem не важен
                if (propertyString === uiControlsInfo[j].propertyString) {
                    results.push(uiControlsInfo[j]);
                }
            }
        }
        return results;
    }

    /**
     * Создать контрол для свойства промо приложения или его экрана
     * На основе информации appProperty будет выбран ui компонент и создан его экземпляр
     *
     * @param {string} propertyString
     * @param {string} viewName - имя вью, который будет использован для контрола
     * @param {string} name
     * @param {object} params
     * @param [controlParentView] для некоторых контролов место выбирается динамически. Например для групп слайдов
     * @param {HTMLElement} [productDOMElement] элемент на экране продукта к которому будет привязан контрол
     * @returns {*}
     */
    function createControl(propertyString, viewName, name, params, controlParentView, productDOMElement) {
        var ctrl = null;
        params = params || {};
        params.iFrame = $('#id-product_screens_cnt')[0];
//        try {
            // существует ли такой вью, если нет, берем по умолчанию
            if (viewName) {
                // в случае с вью регистр важен, в конфиге директивы прописаны малым регистром
                viewName = viewName.toLowerCase();
            }
            if (!viewName || config.controls[name].directives.indexOf(viewName) < 0) {
                var dirIndex = config.controls[name].defaultDirectiveIndex;
                if (dirIndex>=0) {
                    // некоторые контролы могут не иметь визуальной части
                    viewName = config.controls[name].directives[dirIndex];
                }
            }
            // задается по параметру или по дефолту из конфига
            var cpv = null;
            if (controlParentView) {
                cpv = $(controlParentView);
            }
            else {
                cpv = $('#'+config.controls[name].parentId);
            }
            // свойств может быть несколько, передаем массив
            var propertyStrArg = (propertyString && propertyString.indexOf(',')>=0)?propertyString.split(','):propertyString;
            ctrl = new window[name](propertyStrArg, viewName, cpv, productDOMElement, params);
//        }
//        catch(e) {
//            log(e, true);
//        }
//        log('Creating UI control for appProperty='+propertyString+' ui='+name);
        return ctrl;
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
                    appName: appName,
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

    /**
     * Рестартануть приложение
     * Применяется при переходе из режиме редактирования и режим предпросмотра и обратно
     *
     * @param {string} params.mode
     */
    function restartApp(params) {
        params = params || {};
        delete editedApp;
        params.mode = params.mode || 'none';
        var cfg = config.products[appName];
        editedApp = new appIframe.contentWindow[cfg.constructorName]({
            width: cfg.defaultWidth,
            height: cfg.defaultHeight,
            defaults: null,
            appChangeCallbacks: [onAppChanged]
            //engineStorage: JSON.parse(JSON.stringify(appStorage)) todo?
        });
        editedApp.start();
    }

    /**
     * Обработчик событий в приложении
     *
     * @param event
     */
    function onAppChanged(event, data) {
        var app = data.application;
        var MutApp = Editor.getAppIframe().contentWindow.MutApp;
        switch (event) {
            case MutApp.EVENT_SCREEN_CREATED: {
                log('Editor.onAppChanged: MutApp.EVENT_SCREEN_CREATED \''+data.screenId+'\'');
                // передать информацию в slideGroupControls который занимается экранами
                if (slideGroupControls) slideGroupControls[0].screenUpdate(event, data);
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                log('Editor.onAppChanged: MutApp.EVENT_SCREEN_RENDERED \''+data.screenId+'\'');
                // передать информацию в slideGroupControls который занимается экранами
                if (slideGroupControls) slideGroupControls[0].screenUpdate(event, data);
                break;
            }
            case MutApp.EVENT_SCREEN_DELETED: {
                log('Editor.onAppChanged: MutApp.EVENT_SCREEN_DELETED \''+data.screenId+'\'');
                // передать информацию в slideGroupControls который занимается экранами
                if (slideGroupControls) slideGroupControls[0].screenUpdate(event, data);
                break;
            }
        }
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
        restartApp({
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
            restartApp({
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
        $hint.css('top',eo.top+workspaceOffset.top+($elem.outerHeight(false)-$hint.outerHeight(false))/2+'px');
        $hint.css('left',eo.left+workspaceOffset.left-$hint.outerWidth(false)-config.editor.ui.hintRightMargin+'px');
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
        $('#id-product_iframe_cnt').removeClass('__mob');
        $(appIframe).css('border','0')
            .css('width',appContainerSize.width+'px')
            .css('height',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px') //так как у панорам например гориз скролл и не умещается по высоте он
            .css('maxWidth',appContainerSize.width+'px')
            .css('maxHeight',appContainerSize.height+config.editor.ui.screen_blocks_padding+'px'); //так как у панорам например гориз скролл и не умещается по высоте он
        // нужно перезапустить приложение чтобы оно корректно обработало свой новый размер
        restartApp({
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
        restartApp({
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
        return activeScreens;
    }

    function showSelectDialog(params) {
        selectElementOnAppScreen(null);
        hideWorkspaceHints();
        $('#id-control_cnt').empty();
        var dialog = new SelectDialog(params);
        $('#id-dialogs_view').empty().append(dialog.view).show();
    }

    function showPublishDialog(params) {
        selectElementOnAppScreen(null);
        hideWorkspaceHints();
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

    // public methods
    global.start = start;
    global.forEachElementOnScreen = forEachElementOnScreen;
    global.getAppIframe = getAppIframe;
    global.createControl = createControl;
    global.getActiveScreens = getActiveScreens;
    global.showScreen = showScreen;
    global.getAppContainerSize = function() { return appContainerSize; };
    global.getSlideGroupControls = function() { return slideGroupControls; };
    global.createPreviewsForShare = createPreviewsForShare;
    global.testPreviewsForShare = testPreviewsForShare;
    global.selectElementOnAppScreen = selectElementOnAppScreen;
    global.hideWorkspaceHints = hideWorkspaceHints;
    global.getResourceManager = function() { return resourceManager; }
    global.showSelectDialog = showSelectDialog;
    global.syncUIControlsToAppProperties = syncUIControlsToAppProperties;
    global.findControl = findControl;
    global.findControlInfo = findControlInfo; // need for autotests
    global.getAppId = function() { return appId; };
    global.updateSelection = updateSelection;
    global.getQuickControlPanel = function() { return quickControlPanel; }
    global.getEditorEnvironment = getEditorEnvironment;
    global.getEditedApp = function() { return editedApp; }

})(Editor);