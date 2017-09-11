/**
 * Created by artyom.grishanov on 11.09.17.
 *
 * Искусственные тесты ScreenManager в отрыве от реального проекта.
 * Чтобы сгенерировать большее количество ситуация
 */
QUnit.test("ScreenManager: syntetic test 1", function( assert ) {
    var done = assert.async()

    ScreenManager.init({
        $('#id-slides_cnt_syntetictest')
        onScreenSelect: onScreenSelect
    });

    operations = [
        create:g1, create:g2, update:s2
    ];

    var s1 = createScreen({
        group: 'g1'
    });
    var s2 = createScreen({
        group: 'g1'
    });
    ScreenManager.update({
        created: s1
    });
    ScreenManager.update({
        created: s2
    });
    ScreenManager.rendered({
        created: s2
    });



    function onScreenSelect(screenId) {
        assert.ok(screenId);
    }

    function createScreen(param) {

        param.id = uniqId();
        param.group

        var startScr = new MutApp.Screen.extend({
            id: paramm.id,
            group: param.group,
            model: tm,
            screenRoot: this.screenRoot
        });

    }

    done();
});