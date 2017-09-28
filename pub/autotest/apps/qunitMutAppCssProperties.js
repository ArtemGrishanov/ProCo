/**
 * Created by alex on 12.08.17.
 */
QUnit.test("MutApp test: Css customization", function( assert ) {
    var done = assert.async(1);

    var app = new PersonalityApp({
        defaults: null,
        mode: 'edit'
    });
    app.start();

    var customCss1 = '.js-test_btn{font-size:29px;important!}';
    app.customCssStyles.setValue(customCss1);
    var r = app._getCssRule('appConstructor=mutapp customCssStyles');
    assert.ok(r.selector === 'appConstructor=mutapp customCssStyles');
    assert.ok(r.rules === customCss1);
    assert.ok(app.getCssRulesString().indexOf(customCss1) >= 0);

    setTimeout(function() {
        assert.ok(app._screens[0].$el.find('.js-test_btn').css('font-size')==='29px');

        var customCss2 = '.js-test_btn{font-size:29px;important!}.js-btn_wr{background-color:rgb(238, 238, 0)}';
        app.customCssStyles.setValue(customCss2);
        var r = app._getCssRule('appConstructor=mutapp customCssStyles');
        assert.ok(r.selector === 'appConstructor=mutapp customCssStyles');
        assert.ok(r.rules === customCss2);

        setTimeout(function() {
            assert.ok(app._screens[0].$el.find('.js-test_btn').css('font-size')==='29px');
            assert.ok(app._screens[0].$el.find('.js-btn_wr').css('background-color')==='rgb(238, 238, 0)');
            done();
        }, 500);

    }, 500);

});

QUnit.test("MutApp test: Css properties and deserialization in edit mode", function( assert ) {
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
    assert.ok(app.getCssRulesString().indexOf('rgb(255, 0, 0)') >= 0);
    assert.ok(app.screenRoot.find('#id-custom_styles').html().indexOf(ap1.getValue()) >= 0 );

    var ap2 = app.getProperty('.js-start_header font-size');
    ap2.setValue('66px');
    var r = app._getCssRule('.js-start_header');
    assert.ok(r.selector === '.js-start_header');
    assert.ok(r.rules[1].value === '66px');
    assert.ok(app.getCssRulesString().indexOf('66px') >= 0);
    assert.ok(app.screenRoot.find('#id-custom_styles').html().indexOf(ap2.getValue()) >= 0 );

    var ap3 = app.getProperty('.js-start_header padding-top');
    ap3.setValue('22px');
    var r = app._getCssRule('.js-start_header');
    assert.ok(r.selector === '.js-start_header');
    assert.ok(r.rules[2].value === '22px');
    assert.ok(app.getCssRulesString().indexOf('22px') >= 0);
    assert.ok(app.screenRoot.find('#id-custom_styles').html().indexOf(ap3.getValue()) >= 0 );

    var ap4 = app.getProperty('.js-start_description padding-top');
    ap4.setValue('33px');
    var r = app._getCssRule('.js-start_description');
    assert.ok(r.selector === '.js-start_description');
    assert.ok(findRuleByCssProperty(r.rules, 'padding-top').value === '33px');
    assert.ok(app.getCssRulesString().indexOf('33px') >= 0);
    assert.ok(app.screenRoot.find('#id-custom_styles').html().indexOf(ap4.getValue()) >= 0 );

    setTimeout(function() {
        assert.ok(app._screens[0].$el.find('.js-start_header').css('font-size')==='66px', '.js-start_header font-size');
        assert.ok(app._screens[0].$el.find('.js-start_header').css('color')==='rgb(255, 0, 0)', '.js-start_header color');
        assert.ok(app._screens[0].$el.find('.js-start_header').css('padding-top')==='22px', '.js-start_header padding-top');
        assert.ok(app._screens[0].$el.find('.js-start_description').css('padding-top')==='33px', '.js-start_description padding-top');

        var serString = app.serialize();
        assert.ok(serString.indexOf(ap1.propertyString) >= 0);
        assert.ok(serString.indexOf(ap1.getValue()) >= 0);
        assert.ok(serString.indexOf(ap2.propertyString) >= 0);
        assert.ok(serString.indexOf(ap2.getValue()) >= 0);
        assert.ok(serString.indexOf(ap3.propertyString) >= 0);
        assert.ok(serString.indexOf(ap3.getValue()) >= 0);
        assert.ok(serString.indexOf(ap4.propertyString) >= 0);
        assert.ok(serString.indexOf(ap4.getValue()) >= 0);

        var app2 = new PersonalityApp({
            defaults: serString,
            mode: 'edit'
        });
        app2.start();
        setTimeout(function() {
            assert.ok(app2._screens[0].$el.find('.js-start_header').css('font-size')==='66px', '.js-start_header font-size');
            assert.ok(app2._screens[0].$el.find('.js-start_header').css('color')==='rgb(255, 0, 0)', '.js-start_header color');
            assert.ok(app2._screens[0].$el.find('.js-start_header').css('padding-top')==='22px', '.js-start_header padding-top');
            assert.ok(app2._screens[0].$el.find('.js-start_description').css('padding-top')==='33px', '.js-start_description padding-top');
            done();
        }, 500);

    }, 500);

    /**
     * локальная функция для тестов
     *
     * @param rules
     * @param propertyName
     * @returns {*}
     */
    function findRuleByCssProperty(rules, propertyName) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].property === propertyName) {
                return rules[i];
            }
        }
        return null;
    }

});

// todo обнуление уже установленных свойств null

/**
 * Тест с проверкой применения стилей при старте в режиме 'published'
 */
QUnit.test("MutApp test: Css properties deserialization in published mode", function( assert ) {
    // десериализация, посмотреть что css свойства применились после нее
    var done = assert.async(1);

    var app = new PersonalityApp({
        defaults: null,
        mode: 'edit'
    });
    app.start();
    var ap1 = app.getProperty('.js-start_header color');
    ap1.setValue('rgb(255, 255, 0)');
    var ap4 = app.getProperty('.js-start_description padding-top');
    ap4.setValue('33px');
    var serString = app.serialize();

    // второе приложение не в режиме разработки
    var app2 = new PersonalityApp({
        defaults: serString,
        mode: 'published'
    });
    app2.start();

    setTimeout(function() {
        assert.ok(app2._screens[0].$el.find('.js-start_header').css('color')==='rgb(255, 255, 0)', '.js-start_header color');
        assert.ok(app2._screens[0].$el.find('.js-start_description').css('padding-top')==='33px', '.js-start_description padding-top');

        done();
    }, 500);
});

QUnit.test("MutApp test: Css properties 2", function( assert ) {
    var done = assert.async(1);
    var app = new PersonalityApp({
        defaults: null,
        mode: 'edit'
    });
    app.start();

    var ap1 = app.getProperty('.js-start_header color');
    ap1.setValue('rgb(255, 255, 0)');
    assert.ok(app.getCssRulesString().indexOf('rgb(255, 255, 0)') >= 0);
    var ap4 = app.getProperty('.js-start_description padding-top');
    ap4.setValue('33px');

    setTimeout(function() {
        assert.ok(app._screens[0].$el.find('.js-start_header').css('color')==='rgb(255, 255, 0)', '.js-start_header color');
        assert.ok(app._screens[0].$el.find('.js-start_description').css('padding-top')==='33px', '.js-start_description padding-top');

        // попробовать обнулить свойства
        var ap1 = app.getProperty('.js-start_header color');
        ap1.setValue(null);
        var ap4 = app.getProperty('.js-start_description padding-top');
        ap4.setValue(null);

        var r = app._getCssRule('.js-start_header');
        assert.ok(r.selector === '.js-start_header');
        // обнуленное ранее свойство .js-start_description padding-top
        assert.ok(findRuleByCssProperty(r.rules, 'color').value === null);
        assert.ok(app.getCssRulesString().indexOf('rgb(255, 255, 0)') < 0);

        var r = app._getCssRule('.js-start_description');
        assert.ok(r.selector === '.js-start_description');
        // обнуленное ранее свойство .js-start_description padding-top
        assert.ok(findRuleByCssProperty(r.rules, 'padding-top').value === null);
        assert.ok(app.getCssRulesString().indexOf('33px') < 0);

        setTimeout(function() {
            // при обнулении значений ==null, значения css сбросились на стандартные для useragent
            assert.ok(app._screens[0].$el.find('.js-start_header').css('color')==='rgb(0, 0, 0)', '.js-start_header color');
            assert.ok(app._screens[0].$el.find('.js-start_description').css('padding-top')==='0px', '.js-start_description padding-top');

            done();
        }, 500);

    }, 500);

    /**
     * локальная функция для тестов
     *
     * @param rules
     * @param propertyName
     * @returns {*}
     */
    function findRuleByCssProperty(rules, propertyName) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].property === propertyName) {
                return rules[i];
            }
        }
        return null;
    }

});