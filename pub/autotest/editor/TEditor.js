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
        // высоту выставлять необязательно, только ширина для горизонтального выравнивания
        assert.ok($workspaceCnt.height() === 0, 'Workspace cnt height==0');
    }

    function checkSlides(assert) {
//        assert.ok(false, 'checkSlides');
    }

    function checkControls(assert) {
//        assert.ok(false, 'checkControls');
    }

    function changeValue(assert) {
//        assert.ok(false, 'checkValue');
        //TODO generator
    }

    function checkPreview(assert) {
//        assert.ok(false, 'checkPreview');
    }

    function checkSavingTemplate(assert) {
//        assert.ok(false, 'checkSavingTemplate');
    }

    function checkPublish(assert) {
//        assert.ok(false, 'checkPublish');
    }


    global.checkApp = checkApp;
    global.checkSlides = checkSlides;
    global.checkControls = checkControls;
    global.changeValue = changeValue;
    global.checkControls = checkControls;
    global.checkSlides = checkSlides;
    global.checkPreview = checkPreview;
    global.checkSavingTemplate = checkSavingTemplate;
    global.checkPublish = checkPublish;

})(TEditor);