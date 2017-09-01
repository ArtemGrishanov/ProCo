/**
 * Created by alex on 10.08.17.
 */
QUnit.test("Editor.Controls: prerequisites", function( assert ) {
    // для этой группы тестов необходимы такие условия, наличия контейнеров
    assert.ok($('#id-static_controls_cnt').length > 0);
    assert.ok($('#id-control_cnt').length > 0);
    assert.ok($('#id-static_control_cnt_template').length > 0);
});

/**
 * 1) Создать приложение и подписаться на события
 * 2) Создать в событии EVENT_PROPERTY_CREATED контролы для каждого свойства
 * 3) Проверить созданные контролы и их свойства
 */
QUnit.test("Editor.Controls: 1", function( assert ) {
    var done = assert.async();
    var createdEventsCount = 0;
    var changeValueEventsCount = 0;

    ControlManager.setChangeValueCallback(onControlValueChanged);

    directiveLoader.load(function() {
        assert.ok(directiveLoader.getDirective('colorpicker'));

        editorLoader.load({

            appName: 'personality',
            container: $('#id-product_iframe_cnt'),
            onload: function() {
                var appIframe = editorLoader.getIframe();
                var appWindow = appIframe.contentWindow;
                window.MutApp = appWindow.MutApp;
                $('#id-product_iframe_cnt').show();

                var app1 = editorLoader.startApp({
                    defaults: null,
                    mode: 'edit',
                    appChangeCallbacks: onAppChanged
                });
                $('#id-control_cnt').width(app1.width).height(app1.height);
                $(appIframe).width(app1.width).height(app1.height);

                window.app1 = app1; // make it global for test
                assert.ok(createdEventsCount === app1._mutappProperties.length, 'createdEventsCount');
                assert.ok(changeValueEventsCount > 0, 'changeValueEventsCount');
                // для всех созданных mutAppProperty параллельно создаются контролы
                assert.ok(ControlManager.getControlsCount() === app1.getExpectedControlsCount(), 'controls count');

                checkControls(app1);

                done();

            } // editorLoader.onload
        });
    });


    function onAppChanged(event, data) {
        switch (event) {
            case MutApp.EVENT_PROPERTY_CREATED: {
                createdEventsCount++
                var ctrl = ControlManager.createControl({
                    mutAppProperty: data.property,
                    appIframe: editorLoader.getIframe()
                });
                for (var i = 0; i < ctrl.length; i++) {
                    // убедиться что элементы добавились на страницу
                    assert.ok($.contains($('body')[0], ctrl[i].$container[0]), 'body contains container');
                    assert.ok($.contains(ctrl[i].$container[0], ctrl[i].$wrapper[0]), 'container contains wrapper');
                    if (ctrl[i].controlName !== 'TextQuickInput') {
                        // для TextQuickInput нет директив
                        assert.ok($.contains(ctrl[i].$wrapper[0], ctrl[i].$directive[0]), 'wrapper contains directive');
                    }
                }
                break;
            }
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {
                changeValueEventsCount++
                // должен сам контрол обработать это сообщение
                ControlManager.getControl(data.propertyString).setValue(data.property.getValue());
                break;
            }
            case MutApp.EVENT_PROPERTY_DELETED: {
                // должен сам контрол обработать это сообщение
                ControlFactory.getControl(data.propertyString).handleEvent(event, data);
                // фабрика удалить этот контрол
                var ctrl = ControlManager.deleteControl();
                break;
            }
        }
    }

    /**
     * Сообщение об изменении присланное из ControlManager
     *
     * @param propertyString
     * @param value
     */
    function onControlValueChanged(propertyString, value) {
        window.app1.getProperty(propertyString).setValue(value);
    }

    function checkControls(app) {
        var controls = ControlManager.getControls();
        for (var i = 0; i < controls.length; i++) {
            var c = controls[i];
            assert.ok(c.propertyString, 'controlcheck.propertyString: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            assert.ok(c.controlName, 'controlcheck.controlName: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            assert.ok(c.id, 'controlcheck.id: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            if (c.controlName !== 'TextQuickInput') {
                assert.ok(c.$directive && c.$directive.length > 0, 'controlcheck.$directive: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
                assert.ok(c.directiveName, 'controlcheck.directiveName: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            }
            assert.ok(c.$wrapper, 'controlcheck.$wrapper: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            assert.ok(c.$productDomElement === null, 'controlcheck.productDOMElement: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');

            var pVal = app.getProperty(c.propertyString).getValue();
            if (c.getValue() === '') {
                // приравнять сравнение пустой строки '' и null/undefined
                // внутри MutApp строка == null но внутри контрола при установке null, все равно окажется в значении пустая строка ''
                assert.ok(pVal === '' || pVal === undefined || pVal === null, 'controlcheck.value: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            }
            else {
                assert.ok(c.getValue() === pVal, 'controlcheck.value: propertyString=\'' + c.propertyString + '\' control=\'' + c.controlName + '\'');
            }
        }
    }

});