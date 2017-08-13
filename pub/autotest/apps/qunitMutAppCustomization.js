/**
 * Created by alex on 12.08.17.
 */
QUnit.test("MutApp test: Customization", function( assert ) {
    var done = assert.async(1);

    var app = new PersonalityApp({
        defaults: null
    });
    app.start();

    app.customCssStyles.setValue('.js-test_btn{font-size:29px;important!}');

    setTimeout(function() {
        assert.ok(app._screens[0].$el.find('.js-test_btn').css('font-size')==='29px');
        app.customCssStyles.setValue('.js-test_btn{font-size:29px;important!}.js-btn_wr{background-color:rgb(238, 238, 238)}');

        setTimeout(function() {
            assert.ok(app._screens[0].$el.find('.js-test_btn').css('font-size')==='29px');
            assert.ok(app._screens[0].$el.find('.js-btn_wr').css('background-color')==='rgb(238, 238, 238)');
            done();
        }, 500);

    }, 500);

});