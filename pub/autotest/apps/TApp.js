/**
 * Created by artyom.grishanov on 11.08.16.
 *
 * Первый уровень: уровень проверки отдельного приложения
 */

var TApp = {};

(function(global){

    /**
     * Проверка приложения на работоспособность и корректность
     *
     * @param assert
     * @param {iframe|MutApp} appObject
     * @constructor
     */
    function checkApp(assert, appIFrame) {
        var app = null;
        if (appIFrame.contentWindow) {
            app = appIFrame.contentWindow.app;
            assert.ok(app !== null, 'checkApp: app found in iframe');
        }
        if (app.type === 'test') {
            // тип приложения - тест
            checkTestInStatic(assert, appIFrame);
            checkTestInAction(assert, appIFrame);
        }
        else {
            assert.ok(false, 'checkApp: unknown app type '+app.constructor);
        }
    }

    /**
     *
     * @param appName
     * @param width
     * @param height
     * @param defaults
     * @returns {*}
     * @constructor
     */
    function createApp(appName, callback, width, height, defaults) {
        var src = config.products[appName].src;
        var appIframe = document.createElement('iframe');
        appIframe.onload = function() {
            callback(appIframe);
            // у приложения всегда есть какие то дефолтные размеры
            var w = width || appIframe.contentWindow.app.width;
            var h = height || appIframe.contentWindow.app.height;
            // айфрейм необходимо увеличить до размеров приложения чтобы видеть его полностью.
            $(appIframe).width(w+'px').height(h+'px');
            var d = $('<div class="aif_app_id">'+appIframe.contentWindow.app.id+'</div>');
            //$(appIframe).contents().find('body').append(d);
            //TODO контейнер для iframe
            $('#id-product_iframe_cnt').css('position','relative').append(d);
        };
        var host = config.common.home;
        $(appIframe).addClass('autotest_iframe __small');
        appIframe.src = host+src;
        $('#id-product_iframe_cnt').append(appIframe).show();
    }

    global.checkApp = checkApp;
    global.createApp = createApp;

})(TApp);