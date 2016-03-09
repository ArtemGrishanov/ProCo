/**
 * Created by artyom.grishanov on 28.12.15.
 */
//TODO подумать над форматом, где должны храниться продукты всегда. Какое-то одно хранилище?
var baseProductUrl = '../products/test/';
var indexHtml = 'index.html';

//TODO ид каждого проекта должен быть уникален {id, name, author ....}
var promoAppName = 'test1';
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
    initProduct();
}

function initProduct() {
    var src = getQueryParams(document.location.search)[config.common.productSrcParamName];
    if (!src) {
        src = config.common.defaultProductPrototype;
    }
    if (src) {
        appIframe = document.createElement('iframe');
        appIframe.onload = onProductIframeLoaded;
        $(appIframe).addClass('proto_cnt');
        var host = config.common.devPrototypesHostName || (config.common.awsHostName+config.common.awsBucketName);
        appIframe.src = host+src;
        $('#id-product_iframe_cnt').append(appIframe);
    }
    else {
        alert('Выберите шаблон для редактирования');
    }
}

/**
 * iFrame промо проекта был загружен. Получаем из него document и window
 */
function onProductIframeLoaded() {
    iframeWindow = appIframe.contentWindow;
    Engine.startEngine(iframeWindow);
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
    for (var i = 0; i < elems.length; i++) {
        var pAtt = $(elems[i]).attr('data-app-property');
        //TODO этот поиск никогда не сработает, сейчас всегда чистим все контролы при переулючении экранов
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
                if (ap.static === true) {
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
                        parent = $cc.find('.js-control_cnt');
                    }
                    var newControl = createControl(ps, c.params.viewName, c.name, c.params, parent);
                    if (newControl) {
                        uiControlsInfo.push({
                            appPropertyString: ps,
                            control: newControl
                        });
                    }
                    else {
                        log('Can not create control for appProperty: \'' + ps, true);
                    }

                    //TODO здесь же будут добавлены другие постоянные контролы, например на правой панели
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
 * @param domElement
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
        // для контрола могут быть прописаны форсированные параметры, которые приоритетнее клиентских установок
        if (config.controls[name] && config.controls[name].overrideProductParams) {
            for (var key in config.controls[name].overrideProductParams) {
                params[key] = config.controls[name].overrideProductParams[key];
            }
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

/**
 * Клик по кнопке Назад в предпросмотре
 */
function onBackToEditorClick() {
    showEditor();
}

function listObjs() {
    var prefix = 'facebook-' + fbUserId;
    bucket.listObjects({
        Prefix: prefix
    }, function (err, data) {
        if (err) {
            log('ERROR: ' + err, true);
        } else {
            var objKeys = "";
            data.Contents.forEach(function (obj) {
                objKeys += obj.Key + "<br>";
            });
            log('listObjects...');
            log(objKeys);
        }
    });
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

if (config.common.facebookAuthEnable === true) {
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

function showSelectDialog(params) {
    var dialog = new SelectDialog(params);
    $('#id-dialogs_view').empty().append(dialog.view).show();
}

/**
 * Универсальный диалог для выбора чего-то
 * Например, используется для выбор какой вопрос в тест добавить (их несколько видов)
 *
 * @param params
 * @param {string} params.caption - заголовок леера
 * @param {Array.<object>} params.options - {icon, label, id} список вариантов для выбора.
 * @param {function} params.callback - вызывается, когда выбор сделан. Передается либо id выбранного итема, либо null если пользователь просто закрыл диалог
 */
function SelectDialog(params) {
    this.selectedOptionId = null;
    this.view = null;

    var html = $('#id-select_dialog_template').html();
    this.view = $(html);
    this.view.find('.js-caption').text(params.caption);
    var optionHtml = $('#id-select_dialog_option_template').html();
    var $cnt = this.view.find('.js-options_cnt');
    for (var i = 0; i < params.options.length; i++) {
        var $e = $(optionHtml).click((function(e){
            $('.js-option').removeClass('__active');
            // оборачиваем элемент по которому кликнули
            var $t = $(e.currentTarget);
            $t.addClass('__active');
            this.selectedOptionId = $t.attr('data-id');
        }).bind(this));
        $e.attr('data-id',params.options[i].id).find('.js-option_label').text(params.options[i].label);
        $cnt.append($e);
    }

    this.view.find('.js-confirm').click((function(e) {
        params.callback(this.selectedOptionId);
        $('#id-dialogs_view').empty().hide();
    }).bind(this));
    this.view.find('.js-cancel').click((function(e) {
        params.callback(null);
        $('#id-dialogs_view').empty().hide();
    }).bind(this));
}