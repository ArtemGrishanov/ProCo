/**
 * Created by artyom.grishanov on 13.08.16.
 */

var TEditor = {};

(function(global) {

    function checkApp(assert) {

        // скрытый контейнер, в нем находится и работает реальное приложение
        var $iframeCnt = $('#id-product_iframe_cnt');
        assert.ok($iframeCnt.length > 0, 'App cnt exist');
        var $appIframe = $iframeCnt.find('iframe');
        assert.ok($appIframe.length > 0, 'appIframe exist');
        assert.ok(Editor.getAppIframe() !== null, 'Editor.getAppIframe');

        // контейнер на воркспейсе, там внутри еще превью
        var $workspaceCnt = $('#id-product_cnt');
        assert.ok($workspaceCnt.length > 0, 'Workspace cnt exist');
        assert.ok($workspaceCnt.width() > 0, 'Workspace cnt width');
        assert.ok($workspaceCnt.height() > 0, 'Workspace cnt height > 0');
    }

    function checkSlides(assert) {
//        assert.ok(false, 'checkSlides');
    }

    function checkControls(assert) {
//        assert.ok(false, 'checkControls');
    }

    /**
     * Проверить представление всех экранов приложения, экраны на рабочем поле в приложении.
     * @param assert
     */
    function checkPreview(assert) {

        var screensIds = Engine.getAppScreenIds();
        for (var i = 0; i < screensIds.length; i++) {
//            var sId = screensIds[i];
//            Editor.showScreen([sId]);

        }

        assert.ok(false, 'checkPreview');
    }

    /**
     * Проверить активный экран в редакторе
     *
     * @param assert
     * @param screenId
     */
    function checkActiveScreen(assert, screenId) {
        // проверить что экран действительно активный
        var activeScreens = Editor.getActiveScreens();
        assert.ok(activeScreens.indexOf(screenId) >= 0, 'checkActiveScreen: '+screenId+' is active');
        var previewScreensIframeBody = $("#id-product_screens_cnt").contents().find('body');
        assert.ok(previewScreensIframeBody!==null && previewScreensIframeBody.length>0, 'checkPreview: #id-product_screens_cnt contains iframe');

        var appScreen = Engine.getAppScreen(screenId);
        assert.ok(appScreen !== null, 'checkActiveScreen: screen found with id='+screenId);
        var bodyHtml = previewScreensIframeBody.html();
        // посмотреть что в айфрейме действительно находится вью экрана
        assert.ok(bodyHtml.indexOf(appScreen.view.html()) >= 0, 'checkPreview: #id-product_screens_cnt contains screen \''+screenId+'\'');

        // на активном экране найти appProperties
        var dataAppElements = $(previewScreensIframeBody).find('[data-app-property]');
        assert.ok(appScreen !== null, 'checkActiveScreen: there are some data-app-properties elements on screen id='+screenId);

        for (var i = 0; i < dataAppElements.length; i++) {
            var e = dataAppElements[i];
            var attr = $(e).attr('data-app-property');
            var keys = attr.split(',');
            for (var j = 0; j < keys.length; j++) {
                var ap = Engine.getAppProperty(keys[j]);
                assert.ok(ap!==null, 'checkActiveScreen: AppProperty found='+ap.propertyString);
                // формальная проверка каждого appProperty
                // у каждого appProperty есть контрол
                TEngine.checkAppProperty(assert, ap);
            }
        }
    }

    function checkSavingTemplate(assert) {
//        assert.ok(false, 'checkSavingTemplate');
    }

    function checkPublish(assert) {
//        assert.ok(false, 'checkPublish');
    }

    /**
     * Сменить значение контрола, который инициирует смену значение в движке
     * Внутри appPropety есть ссылка на контрол.
     *
     * @param {AppProperty} ap
     * @param {AbstractControl} control
     *
     * @return {*} новое значение
     */
    function changeControlValue(ap, control) {
        // задать в контрол новое значение
        //TODO возможно ли более одного контрола у свойства
        var c = ap.controls[0];
        var newValue = generateValue(ap);
        switch(c.name) {
            case 'TextQuickInput': {
                control.setControlValue(newValue);
            }
            case 'StringControl': {
                control.setControlValue(newValue);
            }
        }
        // определить тип значения appProperty
        return newValue;
    }

    global.checkApp = checkApp;
    global.checkSlides = checkSlides;
    global.checkControls = checkControls;
    global.changeControlValue = changeControlValue;
    global.checkControls = checkControls;
    global.checkSlides = checkSlides;
    global.checkPreview = checkPreview;
    global.checkSavingTemplate = checkSavingTemplate;
    global.checkPublish = checkPublish;
    global.checkActiveScreen = checkActiveScreen;

})(TEditor);