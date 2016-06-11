/**
 * Created by artyom.grishanov on 28.12.15.
 */
//TODO подумать над форматом, где должны храниться продукты всегда. Какое-то одно хранилище?
var baseProductUrl = '../products/test/';
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
 * Массив контролов типа slide
 * @type {Array}
 */
var slides = [];
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
var productScreensCnt = null;
//TODO calculate appSize
/**
 *
 * @type {{width: number}}
 */
var appSize = {width: 800, height: 600};
/**
 * Количество сделанный операция по редактированию пользователем
 * При сохранении шаблона синхронизируется с таким же счетччиком engine
 * если этот четчик меньше чем в engine то будет блокировка при закрытии страницы
 * @type {number}
 */
var operationsCount = 0;
/**
 * Единый для всех контролов angular модуль
 * @type {*}
 */
var myApp = angular.module(config.common.angularAppName, []);
function initControls() {
    'use strict';
    // создадим директивы для всех контролов
    for (var controlName in config.controls) {
        if (config.controls.hasOwnProperty(controlName)) {
            for (var i = 0; i < config.controls[controlName].directives.length; i++) {
                var directiveName = config.controls[controlName].directives[i];
                (function (dn) {
                    myApp.directive(dn, function($compile) {
                        return {
                            restrict: 'A',
                            templateUrl: 'controls/view/'+dn+'.html',
                            scope: {
                                myScope: '=info'
                            }
                        };
                    });
                })(directiveName);
            }
            // регистрируем angular-контроллер с именем контрола
            myApp.controller(controlName, ['$scope', '$attrs', window[controlName+'Controller']]);
        }
    }
}
//TODO remove
initControls();

/**
 * Функция запуска редактора
 */
function start() {
    appId = getUniqId().substr(22);
    appTemplate = null;
    appName = null;
    // сначала смотрим, есть ли ссылка на шаблон
    var t = getQueryParams(document.location.search)[config.common.templateUrlParamName];
    if (t) {
        var clone = getQueryParams(document.location.search)[config.common.cloneParamName] === 'true';
        openTemplate(t, clone);
    }
    else {
        // если ссылки на шаблон нет, то открываем по имени промо-проекта, если оно есть
        var n = getQueryParams(document.location.search)[config.common.appNameParamName];
        if (n) {
            loadAppSrc(n);
        }
        else {
            alert('Выберите шаблон для открытия');
        }
    }
    $('#id-workspace').click(function(){
        // любой клик по документу сбрасывает фильтр контролов
        filterControls();
    });
    resourceManager = new ResourceManager();
    function _initPublisher() {
        Publisher.init({
            awsBucket: App.getAWSBucket(),
            callback: showEmbedDialog
        });
    }
    if (App.getAWSBucket() !== null) {
        _initPublisher();
    }
    else {
        App.on(AWS_INIT_EVENT, function() {
            _initPublisher();
        });
    }
    window.onbeforeunload = confirmExit;
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
        $(appIframe).addClass('proto_cnt');
        var host = config.common.devPrototypesHostName || (config.common.awsHostName+config.common.awsBucketName);
        appIframe.src = host+src;
        $('#id-product_iframe_cnt').append(appIframe);
        //TODO надо точно знать размеры продукта в этот момент
        //TODO когда то будет динамический размер
        $('#id-product_cnt').width(800).height(600);
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
    var params = null;
    if (appTemplate) {
        params = {
            values: appTemplate.propertyValues,
            descriptor: appTemplate.descriptor
        };
    }
    Engine.startEngine(iframeWindow, params);
    showEditor();
    syncUIControlsToAppProperties();
    workspaceOffset = $('#id-product_screens_cnt').offset();
}

/**
 * Показать экран(ы) промо приложения в редакторе.
 * На экране нужно элементы с атрибутами data-app-property и проинициализировать контролы
 *
 * @param {Array.<string>} ids - массив ид экранов
 */
function showScreen(ids) {
    // запоминаем, если потребуется восстановление показа экранов.
    // Например, произойдет пересборка экранов и надо будет вернуться к показу последних активных
    activeScreens = ids;
    // надо скрыть все активные подсказки, если таковые есть. На новом экране будут новые подсказки
    hideWorkspaceHints();
    activeScreenHints = [];
    activeTriggers = [];
    // каждый раз удаляем quick-контролы и создаем их заново. Не слишком эффективно мб но просто и надежно
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

    $(productScreensCnt).empty();
    var appScreen = null;
    var previewHeight = 0;
    for (var i = 0; i < ids.length; i++) {
        appScreen = Engine.getAppScreen(ids[i]);
        if (appScreen) {
            $(productScreensCnt).append(appScreen.view).append('<br>');
            previewHeight += appSize.height+20; // 20 - <br>
            if (typeof appScreen.doWhenInDOM === 'function') {
                appScreen.doWhenInDOM(iframeWindow.app, appScreen.view);
            }
            bindControlsForAppPropertiesOnScreen(appScreen.view, ids[i]);
            applyTriggers('screen_show');
//            showAppScreenHints(appScreen);
        }
        else {
            //TODO показать ошибку наверное
        }
    }
    // надо выставить вручную высоту для айфрема. Сам он не может установить свой размер, это будет только overflow с прокруткой
    $('#id-product_screens_cnt').width(appSize.width).height(previewHeight);
    // боковые панели вытягиваем также
    $('.js-setting_panel').height(previewHeight);

    //TODO отложенная инициализация, так как директивы контролов загружаются не сразу
    // подсветка контрола Slide по которому кликнули
    $('#id-slides_cnt').find('.slide_selection').removeClass('__active');
    $('#id-slides_cnt').find('[data-app-property=\"'+activeScreens.join(' ')+'\"]').find('.slide_selection').addClass('__active');

    $($("#id-product_screens_cnt").contents()).click(function(){
        // любой клик по промо-проекту сбрасывает подсказки
        hideWorkspaceHints();
    });
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
                log('Error in trigger action: '+ e.message, true);
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
 * На добавленном view экрана скорее всего есть какие dom-элементы связанные с appProperties
 * Найдем их и свяжем с контролами редактирования
 *
 * @param {HTMLElement} $view
 * @param {string} scrId
 *
 */
function bindControlsForAppPropertiesOnScreen($view, scrId) {
    var appScreen = Engine.getAppScreen(scrId);
    for (var k = 0; k < appScreen.appPropertyElements.length; k++) {
        // для всех элементов связанных с appProperty надо создать событие по клику.
        // в этот момент будет происходить фильтрация контролов на боковой панели
        $(appScreen.appPropertyElements[k].domElement).click(function(e){
            // сейчас для простоты удаляются все выделения перед показом следующего
            deleteSelections();
            // кликнули по элементу в промо приложении, который имеет атрибут data-app-property
            // задача - отфильтровать настройки на правой панели
            var dataAppPropertyString = $(e.currentTarget).attr('data-app-property');
            log(dataAppPropertyString + ' clicked');
            showSelection($(e.currentTarget));
            filterControls(dataAppPropertyString);
            e.preventDefault();
            e.stopPropagation();
        });
        // контрола пока ещё не существует для настройки, надо создать
        var propertyString = appScreen.appPropertyElements[k].propertyString;
        var appProperty = Engine.getAppProperty(propertyString);
        //TODO объяснение снизу не понятно
        //TODO remove иногда в атрибуте data-app-property содержится несколько ссылок на appProperty через запятую
        //TODO remove в этом случае берем описание из дескриптора первого элемента [0]. Свойства должны быть идентичными, иначе это не имеет смысла
        if (appProperty) {
            // не забыть что может быть несколько контролов для appProperty (например, кнопка доб ответа и кнопка удал ответа в одном и том же массиве)
            var controlsInfo = appProperty.controls;
            for (var j = 0; j < controlsInfo.length; j++) {
                var cn = controlsInfo[j].name;
                // здесь надо создавать только контролы которые находятся на рабочем поле, например textquickinput
                // они пересоздаются каждый раз при переключении экрана
                // "обычные" контролы создаются иначе
                if (config.controls[cn].type === 'workspace') {
                    // имя вью для контрола
                    var viewName = controlsInfo[j].params.viewName;
                    var newControl = createControl(appProperty.propertyString,
                        viewName,
                        controlsInfo[j].name,
                        controlsInfo[j].params,
                        null,
                        appScreen.appPropertyElements[k].domElement);
                    if (newControl) {
                        // только если действительно получилось создать ui для настройки
                        // не все контролы могут быть реализованы или некорректно указаны
                        uiControlsInfo.push({
                            appPropertyString: propertyString,
                            control: newControl,
                            domElement: appScreen.appPropertyElements[k].domElement
                        });
                    }
                    else {
                        log('Can not create control \''+controlsInfo[j].name+'\' for appProperty: \''+propertyString+ '\' on the screen '+scrId, true);
                    }
                }
            }
        }
        else {
            // нет свойства appProperty в Engine хотя во вью есть элемент с таким атрибутом data-app-property
            // это значит ошибку в промо-продукте
            log('AppProperty \''+propertyString+'\' not exist. But such attribute exists on the screen: \''+scrId+'\'', true);
        }
    }

    //TODO пока как-то выглядит запутанным управление контролами

    // скомпилировать новые angular derictives (которые соответствуют контролам)
    var $injector = angular.injector(['ng', 'procoApp']);
    $injector.invoke(function ($rootScope, $compile) {
        $compile($('#id-control_cnt')[0])($rootScope);
        $rootScope.$digest();
    });
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
 * Показать на боковой панели только те контролы, appPropertyString которых есть в dataAppPropertyString
 *
 * @param {string} dataAppPropertyString например 'backgroundColor,showBackgroundImage'
 */
function filterControls(dataAppPropertyString) {
    if (dataAppPropertyString) {
        $('#id-static_controls_cnt').children().hide();
        // может быть несколько свойств через запятую: фон кнопки, ее бордер, цвет шрифта кнопки и так далее
        var keys = dataAppPropertyString.split(' ');
        for (var i = 0; i < keys.length; i++) {
            var c = findControlInfo(keys[i].trim());
            // wrapper - это обертка в которой находится контрол на боковой панели
            // надо скрыть его целиком, включая label
            if (c && c.wrapper) {
                c.wrapper.show();
            }
        }
    }
    else {
        // сбрасываем фильтр - показываем всё что не имеет filter=true
        for (var i = 0; i < uiControlsInfo.length; i++) {
            if (uiControlsInfo[i].type && uiControlsInfo[i].type === 'controlpanel') {
                if (uiControlsInfo[i].filter === true) {
                    uiControlsInfo[i].wrapper.hide();
                }
                else {
                    uiControlsInfo[i].wrapper.show();
                }
            }
        }
    }
}

/**
 * Привязать элементы управления к Engine.getAppProperties
 * Создаются только новые элементы управления, которые необходимы.
 * Может быть добавлен/удален слайд, поэтому надо только для него сделать обновление.
 *
 * Это могут быть следующие действия:
 * 1) Добавление контролов на панель справа.
 * 2) Обновление контрола слайдов (страниц) (один большой контрол)
 * 3) Привязка контролов к dom-элементам в продукте, Для быстрого редактирования.
 */
function syncUIControlsToAppProperties() {
    //TODO название метода не соответствует тому что здесь: полное пересоздание всех контролов
    uiControlsInfo = [];
    $('#id-slides_cnt').empty();
    $('#id-static_controls_cnt').empty();
    $('#id-control_cnt').empty();

    // теперь контролы для экранов
    createScreenControls();

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
                            // каждый контрол предварительно помещаем в отдельную обертку, а потом уже на правую панель
                            var $cc = $($('#id-static_control_cnt_template').html()).appendTo('#id-static_controls_cnt');
                            if (ap.label) {
                                $cc.find('.js-label').text(ap.label);
                            }
                            if (ap.filter === true) {
                                // свойства с этим атрибутом filter=true показываются только при клике на соответствующих элемент в промо-приложении
                                // который помечен data-app-property
                                $cc.hide();
                            }
                            parent = $cc.find('.js-control_cnt');
                        }
                        var newControl = createControl(ps, c.params.viewName, c.name, c.params, parent);
                        if (newControl) {
                            uiControlsInfo.push({
                                appPropertyString: ps,
                                control: newControl,
                                wrapper: $cc, // контейнер, в котором контрол находится на боковой панели контролов
                                filter: ap.filter, // чтобы потом не искать этот признак во время фильтрации
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
    setTimeout(function() {
        // стараемся выполнить после загрузки всех колорпикеров
        $('.colorpicker').colorpicker();
        $('.colorpicker input').click(function() {
            $(this).parents('.colorpicker').colorpicker('show');
        })
    }, 2000);

    // скомпилировать новые angular derictives (которые соответствуют контролам)
    var $injector = angular.injector(['ng', 'procoApp']);
    $injector.invoke(function ($rootScope, $compile) {
        $compile($('#id-slides_cnt')[0])($rootScope);
        $rootScope.$digest();
    });
    $injector.invoke(function ($rootScope, $compile) {
        $compile($('#id-static_controls_cnt')[0])($rootScope);
        $rootScope.$digest();
    });

    if (activeScreens.length > 0) {
        // восстановить показ экранов, которые видели ранее
        showScreen(activeScreens);
    }
    else {
        // первый экран показать по умолчанию
        //TODO первый старт: надо дождаться загрузки этого айфрема и нормально проинициализировать после
        setTimeout(function(){
            productScreensCnt = $("#id-product_screens_cnt").contents().find('body');
            showScreen([Engine.getAppScreenIds()[0]]);
        },1000);
    }
}

/**
 * Конролы управления экранами специфичные, поэтому существует отдельная функция для их создания
 */
function createScreenControls() {
    //TODO конечно не надо пересоздавать каждый раз всё при добавл-удал экрана. Но так пока проще
    var appScreenIds = Engine.getAppScreenIds();
    // экраны могут быть поделены на группы
    var groups = {};
    slides = [];
    if (appScreenIds.length > 0) {
        // подготовительная часть: разобъем экраны на группы
        for (var i = 0; i < appScreenIds.length; i++) {
            var s = appScreenIds[i];
            var screen = Engine.getAppScreen(s);
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
        // далее начнем создать контролы и вью для групп экранов
        for (var groupName in groups) {
            var slidesParents = [];
            for (var i = 0; i < groups[groupName].length; i++) {
                var s = groups[groupName][i];
                var screen = Engine.getAppScreen(s);
                var slideId = null;
                if (screen.collapse === true) {
                    // экраны представлены на левой панели одной единой иконкой и при клике на нее отображаются все вместе
                    // например, результаты в тесте
                    slideId = groups[groupName].join(' ');
                }
                else {
                    slideId = s;
                }
                var $d = $('<div></div>');
                slidesParents.push($d);
                // контрол никуда не сохраняется ?! Но он нужен для использования в ArrayControl
                var newControl = createControl(slideId, null, 'Slide', {}, $d, null);
                if (screen.collapse === true) {
                    // выходим, так как добавили всю группу разом в один контрол
                    break;
                }
                slides.push(newControl);
            }

            //TODO есть группа экранов и непонятно к какому appProperty надо ее привязать. Надо quiz для questions
            // нужно сделать createControl для пустого aps для экрана старт и результат только чтоы показалось группы экранов
            // коряво!
            // а для questions надо делать контрол - тут логично
            var aps = (groupName == 'questions') ? 'quiz': '';
            var arrayControl = createControl(aps, 'ArrayControl', 'ArrayControl', {
                // имя забираем у первого экрана группы, в группе минимум один экран, а все имена одинаковые конечно
                groupLabel: Engine.getAppScreen(groups[groupName][0]).name,
                // это массив html-элементов, которые служат хранилищем например для Slide
                items: slidesParents,
                allowDragY: true,
                showAddButton: true
            }, $('#id-slides_cnt'));
        }
    }
}

/**
 * Найти информацию об элементе управления
 * @param propertyString свойство для которого ищем элемент управления
 * @param [domElement]
 * @returns {object|null}
 */
function findControlInfo(propertyString, domElement) {
    for (var j = 0; j < uiControlsInfo.length; j++) {
        if (domElement) {
            // если важен domElem
            if (propertyString === uiControlsInfo[j].appPropertyString && domElement === uiControlsInfo[j].domElement) {
                return uiControlsInfo[j];
            }
        }
        else {
            // если domElem не важен
            if (propertyString === uiControlsInfo[j].appPropertyString) {
                return uiControlsInfo[j];
            }
        }
    }
    return null;
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
    try {
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
        var propertyStrArg = (propertyString.indexOf(' ')>=0)?propertyString.split(' '):propertyString;
        ctrl = new window[name](propertyStrArg, viewName, cpv, productDOMElement, params);
    }
    catch(e) {
        log(e, true);
    }
//    log('Creating UI control for appProperty='+propertyString+' ui='+name);
    return ctrl;
}

function onEditClick() {
    //TODO смотреть по engine AppProperties что можно редактировать
    var fontColors = config.products.tests.fontColors;
    var fontFamilies = config.products.tests.fontFamilies;
    var backgrounds = config.products.tests.backgrounds;
    Engine.setValue('fontColor',fontColors[getRandomArbitrary(0,fontColors.length-1)]);
    Engine.setValue('fontFamily',fontFamilies[getRandomArbitrary(0,fontFamilies.length-1)]);
    Engine.setValue('background',backgrounds[getRandomArbitrary(0,backgrounds.length-1)]);
}

function onPublishClick() {
    if (App.getUserData() !== null) {
        //TODO отделить пользовательскую зону для сохранения. другой домен например
        //TODO прототипы для витрины и прочие ресы лежат в нашей доверенной зоне
        if (Publisher.isInited() === true) {
            // appId - уникальный ид проекта, например appId
            Publisher.publish({
                appId: appId,
                appStr: Engine.getAppString(),
                cssStr: Engine.getCustomStylesString(),
                promoIframe: appIframe //TODO возможно айрейм спрятать в engine тоже
            });
        }
    }
    else {
        App.showLogin();
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
        // параметры сохраняемого шаблона
        var param = {
            appId: appId,
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
        if (sessionPreviewUrl && sessionPreviewUrl.indexOf(config.common.userCustomPreviewFileName) >= 0) {
            // превью пользовательское и было изменено в этой сессии, обновляем урл для записи
            param.previewUrl = sessionPreviewUrl;
        } else if (appTemplate && appTemplate.previewUrl && appTemplate.previewUrl.indexOf(config.common.userCustomPreviewFileName) >= 0) {
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
            storingTempl = new Template();
            openedTemplateCollection.add(storingTempl);
        }
        storingTempl.set(param);
        openedTemplateCollection.saveTemplate(function(result){
            if (result === 'ok') {
                operationsCount = Engine.getOperationsCount();
                if (showResultMessage === true) {
                    alert('Сохранено');
                }
            }
            else {
                if (showResultMessage === true) {
                    alert('Не удалось сохранить проект');
                }
            }
        }, appId);
    }
    else {
        App.showLogin();
    }
}

$('#id-app_preview_img').change((function() {
    // сразу без превью - аплоад
    this.uploadUserCustomTemplatePreview();
}).bind(this));

function uploadUserCustomTemplatePreview() {
    if (App.getAWSBucket() !== null) {
        var file = $('#id-app_preview_img')[0].files[0];
        if (file) {
            var objKey = 'facebook-'+App.getUserData().id+'/app/'+config.common.userCustomPreviewFileName+'.jpg';
            var params = {
                Key: objKey,
                ContentType: file.type,
                Body: file,
                ACL: 'public-read'
            };
            App.getAWSBucket().putObject(params, (function (err, data) {
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
        App.showLogin();
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
    if (appTemplate && config.common.previewAutoGeneration === true) {
        var url = 'facebook-'+App.getUserData().id+'/app/'+appId+'.jpg';

        function uplCnv(canvas) {
            JPEGEncoder(100);
            var theImgData = (canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
            // Encode the image and get a URI back, set toRaw to true
            var rawData = encode(theImgData, 100, true);
            var blob = new Blob([rawData.buffer], {type: 'image/jpeg'});
            var params = {
                Key: url,
                ContentType: 'image/jpeg',
                Body: blob,
                ACL: 'public-read'
            };
            App.getAWSBucket().putObject(params, (function (err, data) {
                if (err) {
                    //Not authorized to perform sts:AssumeRoleWithWebIdentity
                    log('ERROR: ' + err, true);
                } else {
                    alert('Превью промки загружено');
                }
            }).bind(this));
        }

        previewService.create(productScreensCnt, function(canvas) {
            uplCnv(canvas);
        });

        return url;
    }
    return null;
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
    if (App.getUserData() !== null) {
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
                    // appId уже был сгенерирован при старте редактора start()
                    // title не указываем, это новый проект-клон
                    appTemplate.title = null;
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
    else {
        App.showLogin();
    }

//    if (App.getUserData() !== null) {
//        var xhr = new XMLHttpRequest();
//        xhr.onreadystatechange = function(e) {
//            if (e.target.readyState == 4) {
//                if(e.target.status == 200) {
//                    var myAppId = null;
//                    //TODO надо уметь открывать из моих проектов с требуемым user id
//                    var reg = new RegExp('facebook-'+App.getUserData().id+'\/app\/([A-z0-9]+)\.txt','g');
//                    var match = reg.exec(templateUrl);
//                    if (match && match[1]) {
//                        myAppId = match[1];
//                    }
//                    var obj = JSON.parse(e.target.responseText);
//                    if (obj.appName && obj.propertyValues && obj.descriptor) {
//                        appName = obj.appName;
//                        appTemplate = obj;
//                        if (myAppId) {
//                            // если шаблон мой, то используем предыдущий ид для редактирования.
//                            // если чужой (из витрины), то сгенерированный при старте редактора
//                            appId = myAppId;
//                        }
//                        if (obj.title) {
//                            $('.js-proj_name').val(obj.title);
//                        }
//                        // после загрузки шаблона надо загрузить код самого промо проекта
//                        // там далее в колбеке на загрузку iframe есть запуск движка
//                        loadAppSrc(appName);
//                    }
//                    else {
//                        log('Data not valid. Template url: \''+templateUrl+'\'', true);
//                    }
//                }
//                else {
//                    log('Resource request failed: '+ e.target.statusText, true);
//                }
//            }
//        };
//        xhr.open('GET',templateUrl);
//        xhr.send();
//    }
//    else {
//        App.showLogin();
//    }
}

function showEditor() {
    $(appIframe).css('top','-9999px');
    $('#id-editor_view').show();
    $('#id-preview_view').hide();
}

function showPreview() {
    $(appIframe).css('top',0);
    $('#id-editor_view').hide();
    $('#id-preview_view').show();
}

/**
 * Показать окно для вставки со ссылкой
 */
function showEmbedDialog(result, data) {
    if (result === 'success') {
        var iframeUrl = data.src;
        var ec = '<iframe src="'+iframeUrl+'" style="display:block;width:800px;height:600px;padding:0;border:none;"></iframe>';
        showPublishDialog({
            link: iframeUrl,
            embedCode: ec
        });
        // надо сохранить статус публикации
        sessionPublishDate = new Date().toString();
        saveTemplate(false);
    }
    else {
        alert('Publishing Error');
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
 * Запустить промо приложение в iframe
 */
function onPreviewClick() {
    showPreview();
}

function onMyTemplatesClick() {
    showMyTemplates();
}

/**
 * Клик по кнопке Назад в предпросмотре
 */
function onBackToEditorClick() {
    showEditor();
}

var selectionBorders = [];
var selectedElem = null;
function deleteSelections() {
    selectedElem = null;
    selectionBorders.forEach(function(e){
        e.remove();
    });
}
function showSelection($elem) {
    selectedElem = $elem;
    var $seletionBorder = $($('#id-elem_selection_template').html());
    var eo = $elem.offset(); // position() не подходит в данном случае
    $seletionBorder.css('top',eo.top+'px');
    $seletionBorder.css('left',eo.left+'px');
    $seletionBorder.css('width',$elem.outerWidth(false)-1+'px'); // false - not including margins
    $seletionBorder.css('height',$elem.outerHeight(false)-1+'px');
    $seletionBorder.css('zIndex', config.editor.ui.selectionBorderZIndex);
    $('#id-control_cnt').append($seletionBorder);
    selectionBorders.push($seletionBorder);
}

function showSelectDialog(params) {
    var dialog = new SelectDialog(params);
    $('#id-dialogs_view').empty().append(dialog.view).show();
}

function showPublishDialog(params) {
    var dialog = new PublishDialog(params);
    $('#id-dialogs_view').empty().append(dialog.view).show();
}

/**
 * В зависимости от открытого промо проекта надо уметь вот так возвращать ссылку на его стили, чтобы встроить их в ifrmae
 * Нужно для превью в контроле Slide
 * @returns {string}
 */
function getProjectStandartCssLink() {
    //TODO
    return '<link href="../products/test/style.css" rel="stylesheet"/>';
}