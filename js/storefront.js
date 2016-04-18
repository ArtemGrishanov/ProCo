/**
 * Created by artyom.grishanov on 18.04.16.
 */

var Storefront = {};
(function (global) {

    var templates = [
    ];

    function init() {
        $('.js_app-preview').click(function(e) {
            //TODO template id or url
            loadApp('test');
            $('#id-app_preview').show();
        });
        $('.js-close').click(function(e) {
            $('#id-app_preview').hide();
        });
        loadTemplate('https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/app/609a0db43a.txt');
    }

    function getTemplate(index) {
        //TODO
        return {};
    }

    function loadTemplate(templateUrl) {
        //TODO
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(e) {
            if (e.target.readyState == 4) {
                if(e.target.status == 200) {
                    var newId = null;
//                    var reg = new RegExp('facebook-'+fbUserId+'\/app\/([A-z0-9]+)\.txt','g');
//                    var match = reg.exec(templateUrl);
//                    if (match && match[1]) {
//                        newId = match[1];
//                    }
                    var obj = JSON.parse(e.target.responseText);
                    if (obj.appName && obj.propertyValues && obj.descriptor /*&& newId*/) {
                        appName = obj.appName;
                        appTemplate = obj;
                        appId = newId;
                        // после загрузки шаблона надо загрузить код самого промо проекта
                        // там далее в колбеке на загрузку iframe есть запуск движка
                        //TODO после при превью
                        //loadAppSrc(appName);
                        templates.push(obj);
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
     * Загрузить код промо проекта
     * @param appName - одно из множества доступных имен промопроектов
     */
    function loadApp(appName) {
        // по имени промо приложения получаем ссылку на его код
        var src = config.products[appName].src;
        if (src) {
            appName = appName;
            iframeWindow = null;
            appIframe = document.createElement('iframe');
            appIframe.onload = onProductIframeLoaded;
            //TODO size
            $(appIframe).addClass('st_app_iframe').css('width',800).css('height',600);
//            $(appIframe).addClass('proto_cnt');
            var host = config.common.devPrototypesHostName || (config.common.awsHostName+config.common.awsBucketName);
            appIframe.src = host+src;
            $('#id-app_iframe_cnt').append(appIframe);
            //TODO надо точно знать размеры продукта в этот момент
            // $('#id-app_iframe_cnt').width(600).height(400);
        }
        else {
            log('Cannot find src for: \''+appName+'\'', true);
        }
    }

    /**
     * iFrame промо проекта был загружен. Получаем из него document и window
     */
    function onProductIframeLoaded() {
//        iframeWindow = appIframe.contentWindow;
//        // запуск движка с передачей информации о шаблоне
//        var params = null;
//        if (appTemplate) {
//            params = {
//                values: appTemplate.propertyValues,
//                descriptor: appTemplate.descriptor
//            };
//        }
//        Engine.startEngine(iframeWindow, params);
//        showEditor();
//        syncUIControlsToAppProperties();
//        workspaceOffset = $('#id-product_cnt').offset();
    }

    init();

    global.init = init;
    global.getTemplates = function () { return templates; };
    global.loadApp = loadApp;

})(Storefront);