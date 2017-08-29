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

        var app1 = new PersonalityApp({
            defaults: null,
            appChangeCallbacks: onAppChanged
        });
        window.app1 = app1; // make it global
        app1.start();
        assert.ok(createdEventsCount === app1._mutappProperties.length, 'createdEventsCount');
        assert.ok(changeValueEventsCount > 0, 'changeValueEventsCount');
        // для всех созданных mutAppProperty параллельно создаются контролы
        assert.ok(ControlManager.getControlsCount() === app1.getExpectedControlsCount(), 'controls count');

        var controls = ControlManager.getControls();
        for (var i = 0; i < controls.length; i++) {
            var c = controls[i];
            assert.ok(c.propertyString, 'controlcheck.propertyString: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.controlName, 'controlcheck.controlName: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.id, 'controlcheck.id: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.$directive && c.$directive.length > 0, 'controlcheck.$directive: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.directiveName, 'controlcheck.directiveName: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.$wrapper, 'controlcheck.$wrapper: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.$productDomElement === null, 'controlcheck.productDOMElement: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
            assert.ok(c.getValue() === app1.getProperty(c.propertyString).getValue(), 'controlcheck.value: propertyString=\'' + c.propertyString + '\' directiveName=\'' + c.directiveName + '\'');
        }

        done();
    });


    function onAppChanged(event, data) {
        switch (event) {
            case MutApp.EVENT_PROPERTY_CREATED: {
                createdEventsCount++
                var ctrl = ControlManager.createControl({
                    mutAppProperty: data.property
                });
                for (var i = 0; i < ctrl.length; i++) {
                    // убедиться что элементы добавились на страницу
                    assert.ok($.contains($('body')[0], ctrl[i].$container[0]), 'body contains container');
                    assert.ok($.contains(ctrl[i].$container[0], ctrl[i].$wrapper[0]), 'container contains wrapper');
                    assert.ok($.contains(ctrl[i].$wrapper[0], ctrl[i].$directive[0]), 'wrapper contains directive');
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
        app1.getProperty(propertyString).setValue(value);
    }

});