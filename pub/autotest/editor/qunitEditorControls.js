/**
 * Created by alex on 10.08.17.
 */
QUnit.test("Editor.Controls: prerequisites", function( assert ) {
    // для этой группы тестов необходимы такие условия, наличия контейнеров
    assert.ok($('#id-static_controls_cnt').length > 0);
    assert.ok($('#id-control_cnt').length > 0);
});

QUnit.test("Editor.Controls: 1", function( assert ) {
    var createdEventsCount = 0;

    var app = new PersonalityApp({
        defaults: null,
        appChangeCallbacks: onAppChanged
    });
    app.start();
    assert.ok(createdEventsCount === app._mutappProperties.length, 'createdEventsCount');


    function onAppChanged(event, data) {
        switch (event) {
            case MutApp.EVENT_PROPERTY_CREATED: {
                для одного MutAppProperty может быть несколько контролов!!
                createdEventsCount++;
                var ctrl = ControlManager.createControl({
                    data.propertyString
                });
                assert.ok(ctrl);
                break;
            }
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {
                // должен сам контрол обработать это сообщение
                ControlManager.getControl(data.propertyString).handleEvent(event, data);
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

});