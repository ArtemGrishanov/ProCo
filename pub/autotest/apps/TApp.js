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
//        else if (appObject._models) {
//            app = appObject;
//        }
//        else {
//            assert.ok(false, 'checkApp: unknown app object');
//        }
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
        };
        var host = config.common.home;
        appIframe.src = host+src;
        $('#id-product_iframe_cnt').append(appIframe);
    }

    global.checkApp = checkApp;
    global.createApp = createApp;

})(TApp);