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
     * Создать тестовое приложение
     * Все тестовые приложения собираются в едином месте id-autotest_iframes
     *
     * @param appName
     * @param width
     * @param height
     * @param defaults
     * @returns {*}
     * @constructor
     */
    function createApp(appName, callback, width, height, defaults) {
        // iframe для загрузки приложения
        var src = config.products[appName].src;
        var appIframe = document.createElement('iframe');
        $(appIframe).addClass('autotest_iframe __small');

        // у айфрема есть обертка для доп информации и позиционирования
        var $iframeWr = $('<div class="autotest_iframe_wr"></div>').width('1px').height('1px');
        $('#id-autotest_iframes').append($iframeWr);
        $iframeWr.append(appIframe);

        appIframe.onload = function() {
            callback(appIframe);
            // у приложения всегда есть какие то дефолтные размеры
            var w = width || appIframe.contentWindow.app.width;
            var h = height || appIframe.contentWindow.app.height;
            // айфрейм необходимо увеличить до размеров приложения чтобы видеть его полностью.
            $(appIframe).width(w+'px').height(h+'px');
            $iframeWr.width(w+'px').height(h+'px');
            var idLabel = $('<div class="aif_app_id">'+appIframe.contentWindow.app.id+'</div>');
            $iframeWr.append(idLabel);
        };
        var host = config.common.home;
        appIframe.src = host+src;
    }

    global.checkApp = checkApp;
    global.createApp = createApp;

})(TApp);