/**
 * Created by alex on 12.08.17.
 */
QUnit.test("MutApp test: Css customization", function( assert ) {
    var done = assert.async(1);

    var app = new PersonalityApp({
        defaults: null
    });
    app.start();

    var customCss1 = '.js-test_btn{font-size:29px;important!}';
    app.customCssStyles.setValue(customCss1);
    assert.ok(app._cssRules[0].selector === 'appConstructor=mutapp customCssStyles');
    assert.ok(app._cssRules[0].rules === customCss1);
    assert.ok(app._getCssRulesString().indexOf(customCss1) >= 0);

    setTimeout(function() {
        assert.ok(app._screens[0].$el.find('.js-test_btn').css('font-size')==='29px');

        var customCss2 = '.js-test_btn{font-size:29px;important!}.js-btn_wr{background-color:rgb(238, 238, 0)}';
        app.customCssStyles.setValue(customCss2);
        assert.ok(app._cssRules[0].selector === 'appConstructor=mutapp customCssStyles');
        assert.ok(app._cssRules[0].rules === customCss2);

        setTimeout(function() {
            assert.ok(app._screens[0].$el.find('.js-test_btn').css('font-size')==='29px');
            assert.ok(app._screens[0].$el.find('.js-btn_wr').css('background-color')==='rgb(238, 238, 0)');
            done();
        }, 500);

    }, 500);

});

QUnit.test("MutApp test: Css properties", function( assert ) {
    var done = assert.async(1);

    var app = new PersonalityApp({
        defaults: null,
        mode: 'edit'
    });
    app.start();

    var ap1 = app.getProperty('.js-start_header color');
    ap1.setValue('rgb(255, 0, 0)');
    var r = app._getCssRule('.js-start_header');
    assert.ok(r.selector === '.js-start_header');
    assert.ok(r.rules[0].value === 'rgb(255, 0, 0)');
    assert.ok(app._getCssRulesString().indexOf('rgb(255, 0, 0)') >= 0);
    assert.ok(app.screenRoot.find('#id-custom_styles').html().indexOf(ap1.getValue()) >= 0 );

    var ap2 = app.getProperty('.js-start_header font-size');
    ap2.setValue('66px');
    var r = app._getCssRule('.js-start_header')
    assert.ok(r.selector === '.js-start_header');
    assert.ok(r.rules[1].value === '66px');
    assert.ok(app._getCssRulesString().indexOf('66px') >= 0);
    assert.ok(app.screenRoot.find('#id-custom_styles').html().indexOf(ap2.getValue()) >= 0 );

    setTimeout(function() {
        assert.ok(app._screens[0].$el.find('.js-start_header').css('font-size')==='66px', '.js-start_header font-size');
        assert.ok(app._screens[0].$el.find('.js-start_header').css('color')==='rgb(255, 0, 0)', '.js-start_header color');

        var serString = app.serialize();
        assert.ok(serString.indexOf(ap1.propertyString) >= 0);
        assert.ok(serString.indexOf(ap1.getValue()) >= 0);
        assert.ok(serString.indexOf(ap2.propertyString) >= 0);
        assert.ok(serString.indexOf(ap2.getValue()) >= 0);

        var app2 = new PersonalityApp({
            defaults: serString,
            mode: 'edit'
        });
        app2.start();
        setTimeout(function() {
            assert.ok(app2._screens[0].$el.find('.js-start_header').css('font-size')==='66px', '.js-start_header font-size');
            assert.ok(app2._screens[0].$el.find('.js-start_header').css('color')==='rgb(255, 0, 0)', '.js-start_header color');
            done();
        }, 500);

    }, 500);

});

// todo обнуление уже установленных свойств null

QUnit.test("MutApp test: Css properties deserialization", function( assert ) {
    // десериализация, посмотреть что css свойства применились после нее

    var done = assert.async(1);

    var app = new PersonalityApp({
        defaults: null
    });
    app.start();

    setTimeout(function() {
        assert.ok(false);
        done();
    }, 500);
});