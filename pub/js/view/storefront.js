/**
 * Created by artyom.grishanov on 18.04.16.
 */

var storefrontView = {};
(function (global) {

    // TODO держать все шаблоны в памяти
    var templates = [
    ];
    /**
     * Iframe для предпросмотра шаблона
     * @type {iframe}
     */
    var appIframe = null;

    var activeTemplateUrl = null;

    function init() {
        $('.js_app-preview').click(function(e) {
            var d = $(e.currentTarget).parent().parent().parent().parent().attr('data-template-url');
            if (d) {
                //loadTemplate('https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/app/609a0db43a.txt');
                //loadApp('test');
                activeTemplateUrl = d;
                templates = [];
                loadTemplate(d);
                $('.scr_wr').addClass('__shadow');
                $('#id-app_preview').show();
            }
        });
        $('.js-close').click(function(e) {
            $('#id-app_preview').hide();
            $('.scr_wr').removeClass('__shadow');
        });
        $('.js-edit').click(function(e) {
            var d = $(e.currentTarget).parent().parent().parent().parent().attr('data-template-url');
            if (d) {
                activeTemplateUrl = d;
                window.location.href = 'editor.html?'+config.common.templateUrlParamName+'='+activeTemplateUrl;
            }
        });
        $('.js-edit_active').click(function(e) {
            if (activeTemplateUrl) {
                window.location.href = 'editor.html?'+config.common.templateUrlParamName+'='+activeTemplateUrl;
            }
        });
    }

    /**
     * Возвращает шаблон который был выбран для предпросмотра
     * @returns {*}
     */
    function getActiveTemplate() {
        return templates[0];
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
                        loadApp('test');
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
            $('#id-app_iframe_cnt').empty().append(appIframe);
            //TODO надо точно знать размеры продукта в этот момент
            // $('#id-app_iframe_cnt').width(600).height(400);
        }
        else {
            log('Cannot find src for: \''+appName+'\'', true);
        }
    }

    /**
     * iFrame промо проекта был загружен.
     * Далее устанавливаем в него свойства из шаблона
     */
    function onProductIframeLoaded() {
        // запуск движка с передачей информации о шаблоне
        var t = getActiveTemplate()
        if (t) {
            var params = {
                values: t.propertyValues,
                descriptor: t.descriptor
            };
            // движок используется только для установки свойств промо приложение
            Engine.startEngine(appIframe.contentWindow, params);
        }
    }

    init();

    global.init = init;
    global.getTemplates = function () { return templates; };
    global.loadApp = loadApp;

})(storefrontView);