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
var devMode = true;
/**
 * Статические ресурсы (скрипты, стили, картинки и прочее), которые надо зааплоадить при сохранении продукта
 */
var productResources = [];
var appIframe = null;
var iframeWindow = null;
var fbUserId;
AWS.config.region = config.common.awsRegion;
var bucket = new AWS.S3({
    params: {
        Bucket: config.common.awsBucketName
    }
});
/**
 * Массив контролов и свойств AppProperty продукта
 * @type {Array.<object>}
 */
var uiControlsInfo = [
    // control
    // appProperty
    // isUsed
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
        //TODO добавляем html c директивой и запускаем compile

        //TODO как экземпляры класса делать с нужным appProperty?

        if (config.controls.hasOwnProperty(controlName)) {
            myApp.directive(config.controls[controlName].angularDirectiveName, function($compile) {
                return {
                    restrict: 'A',
                    templateUrl: 'controls/'+controlName+'.html',
                    scope: {
                        myScope: '=info'
                    }
//                    link: function (scope, ele, attrs) {
//                        scope.$watch(attrs.dynamic, function(html) {
//                            ele.html(html);
//                            $compile(ele.contents())(scope);
//                        });
//                    }
//                    ,
//                    scope: {
//                        customer: '='
//                    },
//                    link: function(scope, element, attr, controller) {
//                        var startX = 0, startY = 0, x = 0, y = 0;
//                    }
//                    ,controller: ['$scope', function() {
//                        var startX = 0, startY = 0, x = 0, y = 0;
//                    }]
                };
            });

            // регистрируем angular-контроллер с именем контрола
            myApp.controller(controlName, ['$scope', '$attrs', window[controlName+'Controller']]);
        }
    }
}
//TODO при переносе в start - ошибка. Разобраться!
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
//    initControls();
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
    $(appIframe.contentDocument).click(onProductIframeClick);
    Engine.startEngine(iframeWindow);
    syncUIControlsToAppProperties();
    //TODO редактирование становится доступным показать в интерфейсе
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
    // подготовка к тому, чтобы удалить неиспользуемые контролы
    for (var j = 0; j < uiControlsInfo.length; j++) {
        uiControlsInfo[j].isUsed = false;
    }
    var appProperties = Engine.getAppProperties();
    for (var i = 0; i < appProperties.length; i++) {
        var ci = findControlInfo(appProperties[i]);
        if (ci === null) {
            // контрола пока ещё не существует для настройки, надо создать
            var newControl = createControlForAppProperty(appProperties[i]);
            uiControlsInfo.push({
                appProperty: appProperties[i],
                control: newControl,
                isUsed: true
            });
        }
        else {
            // пересоздавать не надо. Просто помечаем, что контрол используется
            ci.isUsed = true;
        }
    }

    // скомпилировать новые angular derictives (которые соответствуют контролам)
    var $injector = angular.injector(['ng', 'procoApp']);
    $injector.invoke(function ($rootScope, $compile) {
        $compile($('#id-control_cnt')[0])($rootScope);
        $rootScope.$digest();
    });

    // неиспользуемые контролы надо удалить
    for (var j = 0; j < uiControlsInfo.length;) {
        if (uiControlsInfo[j].isUsed === false) {
            deleteUIControl(j);
        }
        else {
            j++;
        }
    }
}

/**
 * Найти информацию об элементе управления
 * @param appProperty свойство для которого ищем элемент управления
 * @returns {object|null}
 */
function findControlInfo(appProperty) {
    for (var j = 0; j < uiControlsInfo.length; j++) {
        if (appProperty.propertyString === uiControlsInfo[j].propertyString) {
            return uiControlsInfo[j];
        }
    }
    return null;
}

function createControlForAppProperty(appProperty) {
    //TODO для ui=TextQuick(id-start_header_text) надо связать dom элемент
    if (appProperty.descriptor.ui) {
        switch(appProperty.descriptor.ui) {
            case 'TextQuickInput': {
                var controlName = 'TextQuickInput';
//                // регистрируем angular-контроллер с именем контрола
                var ctrl = new TextQuickInput(appProperty, $('#id-control_cnt'), config.controls[controlName]);
//                myApp.controller(controlName, ['$scope', ctrl.angularViewController]);

                //angUiControllers.controller('TextQuickInput', ['$scope','$http', function($scope, $http) {
//                    $http.get('controls/TextQuickInput.html').success(function(data) {
                    // текст для редактирования
//                        $scope.text = data;

//                    });
//                }]);
                break;
            }
        }
        log('Creating UI control for appProperty=' + appProperty.propertyString + ' ui=' + appProperty.descriptor.ui);
    }
}

function deleteUIControl(index) {
    //TODO removw from dom tree
    uiControlsInfo.splice(j, 1);
}

/**
 * Был клик по айфрейму продукта. Это может привести к началу операции редактирования.
 *
 * @param {MouseEvent} e
 */
function onProductIframeClick(e) {
    var elem = e.target;

    console.log(e.clientX + ' ' + e.clientY);
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
 * Показать окно для вставки со ссылкой
 */
function showEmbedDialog() {
    var iframeUrl =  getDistribUrl()+indexHtml;
    var embedLink = '<iframe src="'+iframeUrl+'" style="display:block;width:600px;height:600px;padding:0;border:none;"></iframe>';
    alert(embedLink);
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