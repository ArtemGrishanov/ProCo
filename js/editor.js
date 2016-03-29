/**
 * Created by artyom.grishanov on 28.12.15.
 */
//TODO подумать над форматом, где должны храниться продукты всегда. Какое-то одно хранилище?
var baseProductUrl = '../products/test/';
var indexHtml = 'index.html';
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
 * Список проектов текущего пользователя. Запрашивается когда пользователь заходит в "Мои Проекты"
 * null - список еще не был запрошен.
 * [] - запрошен, и у пользователя нет проектов
 * @type {Array.<object>}
 */
var userTemplates = null;
/**
 * Создание и сохранение шаблонов. Запуск автотестов.
 * @type {boolean}
 */
//TODO
var devMode = true;
/**
 * Статические ресурсы (скрипты, стили, картинки и прочее), которые надо зааплоадить при сохранении продукта
 */
var productResources = [];
var appIframe = null;
var iframeWindow = null;
var fbUserId;
var bucket = null;

// инициализация апи для работы с хранилищем Amazon
if (config.common.awsEnabled === true) {
    AWS.config.region = config.common.awsRegion;
    bucket = new AWS.S3({
        params: {
            Bucket: config.common.awsBucketName
        }
    });
}
/**
 * Ид экранов которые показаны в данный момент в рабочем поле
 * @type {Array.<string>}
 */
var activeScreens = [];
/**
 * Контролы Slide экранов, которые показаны в данный момент
 * @type {Array}
 */
//var activeScreensControls = [];
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
 * Единый для всех контролов angular модуль
 * @type {*}
 */
//var angUiControllers = angular.module('procoApp', []);
//angular.module('procoApp', []).directive('TextQuickInput', function(){
//    return {
//        restrict: 'E',
//        scope: false,
//        templateUrl: 'controls/TextQuickInput.html'
//    }
//});
//var procoApp = angular.module('procoApp', []);
//procoApp.controller('editorController', function($scope) {
//    $scope.test = {description: 'sdhgsgfhgfjhw eh'}
//})
//.directive('my-customer', function() {
//    return {
//        templateUrl: 'TextQuickInput.html'
//    }
//});
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
//TODO
initControls();
//var fileChooser = document.getElementById('file-chooser');
/**
 * Указывает, была ли публикация продукта успешной или нет
 * @type {boolean}
 */
var errorInPublish = false;

function getDistribUrl() {
    return config.common.awsHostName+config.common.awsBucketName+'/facebook-'+fbUserId+'/'+promoAppName+'/';
}

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
        openTemplate(t);
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
        // любой клик по документы сбрасывает фильтр контролов
        filterControls();
    });
//    $('#id-workspace').mousedown(function(){
//        // сейчас для простоты удаляются все выделения перед показом следующего
//        deleteSelections();
//    });
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
            app: appTemplate.app,
            descriptor: appTemplate.descriptor
        };
    }
    Engine.startEngine(iframeWindow, params);
    showEditor();
    syncUIControlsToAppProperties();
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

    var $screensCnt = $('#id-product_screens_cnt');
    $screensCnt.empty();
    var appScreen = null;
    for (var i = 0; i < ids.length; i++) {
        appScreen = Engine.getAppScreen(ids[i]);
        if (appScreen) {
            // каждый экран ещё оборачиваем в контейнер .screen_cnt
            $('<div class="screen_cnt"></div>').append(appScreen.view).appendTo($screensCnt);
            //TODO это временное решения проблемы, как применять настройки ко вью которые ещё не были добавлены
            if (typeof appScreen.doWhenInDOM === 'function') {
                appScreen.doWhenInDOM(iframeWindow.app, appScreen.view);
            }
            bindControlsForAppPropertiesOnScreen(appScreen.view, ids[i]);
        }
        else {
            //TODO показать ошибку наверное
        }
    }

    //TODO отложенная инициализация, так как директивы контролов загружаются не сразу
    // подсветка контрола Slide по которому кликнули
    $('#id-slides_cnt').find('.slide_thumb').removeClass('__active');
    $('#id-slides_cnt').find('[data-app-property=\"'+activeScreens.join(',')+'\"]').addClass('__active');
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
    var elems = $view.find('[data-app-property]');
    // для всех элементов data-app-property надо создать событие по клику.
    // в этот момент будет происходить фильтрация контролов на боковой панели
    elems.click(function(e){
        //TODO надо сделать объект выделение прозрачным для событий мыши и тп
        // сейчас для простоты удаляются все выделения перед показом следующего
        deleteSelections();
        // кликнули по элементу в промо приложении, который имеет атрибут data-app-property
        // задача - отфильтровать настройки на правой панели
        var dataAppProperty = $(e.currentTarget).attr('data-app-property');
        log(dataAppProperty + ' clicked');
        showSelection($(e.currentTarget));
        filterControls(dataAppProperty);
        e.preventDefault();
        e.stopPropagation();
    });
    for (var i = 0; i < elems.length; i++) {
        var pAtt = $(elems[i]).attr('data-app-property');
        //TODO этот поиск никогда не сработает, сейчас всегда чистим все контролы при переключении экранов
        var c = findControlInfo(pAtt, elems[i]);
        if (c) {
            c.control.setProductDomElement(elems[i]);
            $('#id-control_cnt').append(c.control.$directive);
        }
        else {
            // контрола пока ещё не существует для настройки, надо создать
            var appProperty = Engine.getAppProperty(pAtt.split(',')[0]);
            // иногда в атрибуте data-app-property содержится несколько ссылок на appProperty через запятую
            // в этом случае берем описание из дескриптора первого элемента [0]. Свойства должны быть идентичными, иначе это не имеет смысла
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
                        var newControl = createControl(pAtt, viewName, controlsInfo[j].name, controlsInfo[j].params, null, elems[i]);
                        if (newControl) {
                            // только если действительно получилось создать ui для настройки
                            // не все контролы могут быть реализованы или некорректно указаны
                            uiControlsInfo.push({
                                appPropertyString: pAtt,
                                control: newControl,
                                domElement: elems[i]
                            });
                        }
                        else {
                            log('Can not create control \''+controlsInfo[j].name+'\' for appProperty: \''+pAtt+ '\' on the screen '+scrId, true);
                        }
                    }
                }
            }
            else {
                // нет свойства appProperty в Engine хотя во вью есть элемент с таким атрибутом data-app-property
                // это значит ошибку в промо-продукте
                log('AppProperty \''+pAtt+'\' not exist. But such attribute exists on the screen: \''+scrId+'\'', true);
            }
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

/**
 * Показать на боковой панели только те контролы, appPropertyString которых есть в dataAppPropertyString
 *
 * @param {string} dataAppPropertyString например 'backgroundColor,showBackgroundImage'
 */
function filterControls(dataAppPropertyString) {
    if (dataAppPropertyString) {
        $('#id-static_controls_cnt').children().hide();
        // может быть несколько свойств через запятую: фон кнопки, ее бордер, цвет шрифта кнопки и так далее
        var keys = dataAppPropertyString.split(',');
        for (var i = 0; i < keys.length; i++) {
            var c = findControlInfo(keys[i]);
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

                        //TODO здесь же будут добавлены другие постоянные контролы, например на правой панели
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
        showScreen([Engine.getAppScreenIds()[0]]);
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
            // создаем вью для группы экранов
//            var $groupView = $($('#id-slide_group_template').html()).attr('data-screen-group-name', groupName);
            for (var i = 0; i < groups[groupName].length; i++) {
                var s = groups[groupName][i];
                var screen = Engine.getAppScreen(s);
                var slideId = null;
                if (screen.collapse === true) {
                    // экраны представлены на левой панели одной единой иконкой и при клике на нее отображаются все вместе
                    // например, результаты в тесте
                    slideId = groups[groupName].join(',');
                }
                else {
                    slideId = s;
                }
//                var ci = findControlInfo(slideId);
//                if (ci === null) {
//                    // каждый контрол помещаем в inline-block обертку slide_directive_wr для показа в одну линию
//                    var $d = $('<div></div>').addClass('slide_directive_wr');
//                    $groupView.find('.js-slides_cnt').append($d);
                var $d = $('<div></div>');
                slidesParents.push($d);
                var newControl = createControl(slideId, null, 'Slide', {}, $d, null);
//                    if (newControl) {
//                        uiControlsInfo.push({
//                            appPropertyString: slideId,
//                            control: newControl
//                        });
//                    }
//                    else {
//                        log('Can not create control for appScreen: \'' + slideId, true);
//                    }
//                }
                if (screen.collapse === true) {
                    // выходим, так как добавили всю группу разом в один контрол
                    break;
                }
            }

            //TODO непонятно к какому appProperty привязать. Надо quiz
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
        var propertyStrArg = (propertyString.indexOf(',')>=0)?propertyString.split(','):propertyString;
        ctrl = new window[name](propertyStrArg, viewName, cpv, productDOMElement, params);
    }
    catch(e) {
        log(e, true);
    }
    log('Creating UI control for appProperty='+propertyString+' ui='+name);
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
    //TODO отделить пользовательскую зону для сохранения. другой домен например
    //TODO прототипы для витрины и прочие ресу лежат в нашей доверенной зоне
    publish();
}

/**
 * Для указанного имени ресурса задать загруженные данные
 */
function setDataToResource(url, data) {
    for (var i = 0; i < productResources.length; i++) {
        if (productResources[i].url === url) {
            productResources[i].data = data;
        }
    }
}

/**
 * Вернуть объект-ресурс по его url
 */
function getResourceByUrl(url) {
    for (var i = 0; i < productResources.length; i++) {
        if (productResources[i].url === url) {
            return productResources[i];
        }
    }
    return null;
}

/**
 * Найти все ресурсы, используемые в продукте, и подготовиться к их загрузке
 */
function buildProductResourceList(codeStr) {
    productResources = [];
    //TODO поиск предполагает что ресурсы находятся рядом с html в baseUrl
    var scriptExp = /src=(?:\"|\')((?:\w)+\.js)(?:\"|\')/ig;
    var jsMatch = null;
    while ( (jsMatch = scriptExp.exec(codeStr)) !== null) {
        productResources.push({
            type: 'text/javascript',
            url: jsMatch[1]
        });
    }
    var cssExp = /href=(?:\"|')((?:\w)+.css)(?:\"|')/ig;
    var cssMatch = null;
    while ( (cssMatch = cssExp.exec(codeStr)) !== null) {
        productResources.push({
            type: 'text/css',
            url: cssMatch[1]
        });
    }
    //TODO img (только "свои" картинки) Из инетов пока не рассматриваем варианты

    // добавляем главный html файл
    productResources.push({
        url: indexHtml,
        type: 'text/html'
    });
}

/**
 * Собрать все ресурсы промо-проекта и положить их в productResources
 * Ресурсы загружаются в помощью XMLHttpRequest
 *
 * @param param
 */
function grabProductResources(param) {
    for (var i = 0; i < productResources.length; i++) {
        if (!productResources[i].data) {
            var t = {
                // клонируем данные для задачи, так как иначе индекс i сбиндится, будет браться последний из цикла
                data: JSON.parse(JSON.stringify(productResources[i])),
                run: function() {
                    log('Grab task run:' + baseProductUrl + this.data.url);
                    var client = new XMLHttpRequest();
                    client.open('GET', baseProductUrl + this.data.url);
                    client.onreadystatechange = (function(e) {
                        if (e.target.readyState == 4) {
                            if(e.target.status == 200) {
                                // task context
                                log('Grab task done:' + this.data.url);
                                setDataToResource(this.data.url, e.target.responseText);
                            }
                            else {
                                log('Resource request failed: '+ myRequest.statusText, true);
                            }
                            // даем понять, что таск завершен
                            Queue.release(this);
                        }
                    }).bind(this);
                    client.send();
                },
                done: function(e) {
                }
            };
            if (param.taskType) {
                t.type = param.taskType;
            }
            if (param.priority) {
                t.priority = param.priority;
            }
            Queue.push(t);
        }
    }
}

/**
 * Удаляет из промо проекта перезаписанные параметры, если они там есть
 */
function deleteOverridedAppParams(str) {
    var tags = config.common.tagsForOverridingParams;
    var p1 = str.indexOf(tags[0]);
    var p2 = str.indexOf(tags[1]);
    if (p1 >= 0 && p2 >= 0) {
        return str.replace(str.substring(p1,p2+tags[1].length),'');
    }
    return str;
}

/**
 * Переписать параметры промо-приложения прототипа на новые, которые получились в результате редактирования
 *
 * @param param
 */
function overrideAppParams(param) {
    var t = {
        data: '',
        run: function() {
            // здесь происходит подмена параметров промо приложения на новые. Те, которые были настроены пользователем.
            var indexResource = getResourceByUrl(indexHtml);
            var startFuncReg = /(function(?:\s)+start(?:\s)*\((?:\w)*\)(?:\s)*\{)/ig;
            var match = startFuncReg.exec(indexResource.data);
            var positionToInsert = match.index+match[1].length;
            var strAppProperties = JSON.stringify(iframeWindow.app);
            var overrideParamsStr = '\n'+config.common.tagsForOverridingParams[0]+'var o='+strAppProperties+';'+'for(var key in o)if(o.hasOwnProperty(key))app[key]=o[key];'+config.common.tagsForOverridingParams[1]+'\n'
            indexResource.data = indexResource.data.slice(0,positionToInsert) + overrideParamsStr + indexResource.data.slice(positionToInsert);
            Queue.release(this);
        }
    };
    if (param.taskType) {
        t.type = param.taskType;
    }
    if (param.priority) {
        t.priority = param.priority;
    }
    Queue.push(t);
}

/**
 * Сохранить все статические ресурсы проекта в хранилище
 *
 * @param param
 */
function uploadProductResources(param) {
    for (var i = 0; i < productResources.length; i++) {
        var t = {
            // клонируем данные для задачи, так как иначе индекс i сбиндится, будет браться последний из цикла
            data: JSON.parse(JSON.stringify(productResources[i])),
            run: function() {
                log('Upload task run:' + this.data.url);
                var objKey = 'facebook-'+fbUserId+'/'+promoAppName+'/'+this.data.url;
                var params = {
                    Key: objKey,
                    ContentType: this.data.type,
                    Body: this.data.data,
                    ACL: 'public-read'
                };
                bucket.putObject(params, (function (err, data) {
                    // task object context
                    if (err) {
                        errorInPublish = true;
                        log('ERROR: ' + err, true);
                    }
                    log('Upload task done:' + this.data.url);
                    Queue.release(this);
                }).bind(this));
            }
        };
        if (param.taskType) {
            t.type = param.taskType;
        }
        if (param.priority) {
            t.priority = param.priority;
        }
        Queue.push(t);
    }
}

/**
 * Сохранить промо проект на сервере
 * 1) Для этого сначала составляется список всех ресурсов проекта: css, js, картинки
 * 2) Затем они скачиваются
 * 3) Загружаются в хранилище в персональный каталог пользователя
 */
function publish() {
    errorInPublish = false;
    //TODO собираем ресурсы в несколько проходов
    // например, для того чтобы забрать картинку, сначала надо скачать и распарсить файл css
    var iframeDocument = appIframe.contentDocument || appIframe.contentWindow.document;
    buildProductResourceList(iframeDocument.documentElement.innerHTML);
    //подписка на окончания задач по сбору ресурсов для проекта
    Queue.onComplete('grabResTask', function(){
        log('All resources grabbed.');

        //TODO меняем ссылки на картинки
//            var imgReg = /((?:\w)+\/(?:\w)+\.(?:jpg|jpeg|png))/ig;
//            for (var i = 0; i < productResources.length; i++) {
//                var imgMatch = null;
//                while ( (imgMatch = imgReg.exec(productResources.data)) !== null) {
//                    //imgMatch[1]
//                }
//            }

        // удалим лишние параметры внутри приложения если они там есть
        var indexRes = getResourceByUrl(indexHtml);
        indexRes.data = deleteOverridedAppParams(indexRes.data);

        Queue.onComplete('overrideApp', function(){
            log('Apps were overrided.');

            Queue.onComplete('uploadRes', function(){
                if (errorInPublish === true) {
                    alert('Ошибка')
                }
                else {
                    log('All resources were uploaded.');
                    showEmbedDialog();
                }
            });
            uploadProductResources({
                taskType:'uploadRes',
                priority:8
            });
        });
        overrideAppParams({
            taskType:'overrideApp',
            priority:9
        });

    });
    grabProductResources({
        taskType:'grabResTask',
        priority:10
    });
}

/**
 * Сохранение проекта над которым работает пользователь
 * Сохраняет текущее состояние app+desc в сторадж
 */
function saveTemplate() {
    //TODO автосохранение
    //TODO name
    //TODO возможно шифрование
    var data = {
        appName: appName,
        app: iframeWindow.app,
        descriptor: iframeWindow.descriptor
    };
    log('Saving project:' + appId);
    var objKey = 'facebook-'+fbUserId+'/app/'+appId+'.txt';
    var params = {
        Key: objKey,
        ContentType: 'text/plain',
        Body: JSON.stringify(data),
        ACL: 'public-read'
    };
    bucket.putObject(params, (function (err, data) {
        // task object context
        if (err) {
            log('ERROR: ' + err, true);
        }
        log('Saving task done:' + appId);
    }).bind(this));
}

/**
 * Открыть в редакторе на редактирование проект
 * ид пользователя мы уже знаем в этот момент, пользователь должен быть авторизован
 * По сути это функция "Открыть шаблон" из витрины или "Открыть мой ранее сохраненный проект". В этих случаях проект открывается на основе файла шаблона
 * сохраненных app+desc+appName
 *
 * @param templateUrl
 */
function openTemplate(templateUrl) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(e) {
        if (e.target.readyState == 4) {
            if(e.target.status == 200) {
                var newId = null;
                var reg = new RegExp('facebook-'+fbUserId+'\/app\/([A-z0-9]+)\.txt','g');
                var match = reg.exec(templateUrl);
                if (match && match[1]) {
                    newId = match[1];
                }
                var obj = JSON.parse(e.target.responseText);
                if (obj.appName && obj.app && obj.descriptor && newId) {
                    appName = obj.appName;
                    appTemplate = obj;
                    appId = newId;
                    // после загрузки шаблона надо загрузить код самого промо проекта
                    // там далее в колбеке на загрузку iframe есть запуск движка
                    loadAppSrc(appName);
                }
                else {
                    log('Data not valid. Template url: \''+templateUrl+'\'', true);
                }
            }
            else {
                log('Resource request failed: '+ e.target.statusText, true);
            }
        }
    };
    xhr.open('GET',templateUrl);
    xhr.send();
}

/**
 * Получить список проектов авторизованного пользователя
 *
 * @param {function} [callback] - функция для обратного вызова, когда шаблоны будут загружены
 */
function requestUserTemplates(callback) {
    if (fbUserId) {
        var prefix = 'facebook-' + fbUserId + '/app';
        bucket.listObjects({
            Prefix: prefix
        }, function (err, data) {
            if (err) {
                log('ERROR: ' + err, true);
            } else {
                userTemplates = [];
                data.Contents.forEach(function (obj) {
                    var reg = new RegExp('facebook-'+fbUserId+'\/app\/([A-z0-9]+)\.txt','g');
                    var match = reg.exec(obj.Key);
                    if (match && match[1]) {
                        var id = match[1];
                        userTemplates.push({
                            // key example facebook-902609146442342/app/abc123.txt
                            key: obj.Key,
                            id: id,
                            lastModified: obj.LastModified
                        });
                    }
                });
                log('Objects in dir '+prefix+':');
            }
            callback();
        });
    }
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
function showEmbedDialog() {
    var iframeUrl =  getDistribUrl()+indexHtml;
    var embedLink = '<iframe src="'+iframeUrl+'" style="display:block;width:600px;height:600px;padding:0;border:none;"></iframe>';
    alert(embedLink);
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

//            var file = fileChooser.files[0];
//            if (file) {
//                var objKey = 'facebook-' + fbUserId + '/' + file.name;
//                var params = {
//                    Key: objKey,
//                    ContentType: file.type,
//                    Body: file,
//                    ACL: 'public-read'
//                };
//                bucket.putObject(params, function (err, data) {
//                    if (err) {
//                        //Not authorized to perform sts:AssumeRoleWithWebIdentity
//                        log('ERROR: ' + err, true);
//                    } else {
//                        listObjs();
//                    }
//                });
//            }

if (config.common.facebookAutoAuthEnable === true) {
    /*!
     * Login to your application using Facebook.
     * Uses the Facebook SDK for JavaScript available here:
     * https://developers.facebook.com/docs/javascript/gettingstarted/
     */
    window.fbAsyncInit = function () {
        FB.init({
            appId: config.common.facebookAppId
        });
        FB.login(function (response) {
            bucket.config.credentials = new AWS.WebIdentityCredentials({
                ProviderId: 'graph.facebook.com',
                RoleArn: config.common.awsRoleArn,
                WebIdentityToken: response.authResponse.accessToken
            });
            fbUserId = response.authResponse.userID;
        });
    };
    // Load the Facebook SDK asynchronously
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
}

var selectionBorders = [];
function deleteSelections() {
    selectionBorders.forEach(function(e){
        e.remove();
    });
}
function showSelection($elem) {
    var $seletionBorder = $($('#id-elem_selection_template').html());
    var position = $elem.position();
    $seletionBorder.css('top',position.top+'px');
    $seletionBorder.css('left',position.left+'px');
    $seletionBorder.css('width',$elem.width()+'px');
    $seletionBorder.css('height',$elem.height()+'px');
    $seletionBorder.css('zIndex', config.editor.ui.selectionBorderZIndex);
    $('#id-control_cnt').append($seletionBorder);
    selectionBorders.push($seletionBorder);
}

function showSelectDialog(params) {
    var dialog = new SelectDialog(params);
    $('#id-dialogs_view').empty().append(dialog.view).show();
}

/**
 * Показать диалог с выбором своих сохраненных проектов
 *
 * @param params
 */
function showMyTemplates() {
    if (!userTemplates) {
        requestUserTemplates(function(){
            var selectOptions = [];
            for (var i = 0; i < userTemplates.length; i++) {
                selectOptions.push({
                    id: userTemplates[i].key,
                    label: userTemplates[i].id
                });
            }
            var params = {};
            params.options = selectOptions;
            params.callback = function(selectedOptionId) {
                if (selectedOptionId) {
                    //TODO open saved template
                    // в качестве ид передавали сразу ссылку на проект
                    var tUrl = config.common.awsHostName+config.common.awsBucketName+'/'+selectedOptionId;
                    openTemplate(tUrl);
                }
            };
            var dialog = new SelectUserTemplateDialog(params);
            $('#id-dialogs_view').empty().append(dialog.view).show();
        });
    }
}