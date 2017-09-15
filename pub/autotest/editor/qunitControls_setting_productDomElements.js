/**
 * Created by artyom.grishanov on 15.09.17.
 */

var qunitControls_setting_productDomElements_ContainerId = 'id-qunitControls_setting_productDomElements';

/**
 * 1) Создать пару новых экранов динамически
 * 2) вызвать линковку uiElements ControlManager.handleShowScreen
 * 3.1) Проверить, что нужные контролы получили productDomElement
 * 3.2) Проверить, productDomElement находятся на нужном экране
 */
QUnit.test("Editor.Controls: ControlManager linking after new question screen creation", function( assert ) {
    var done = assert.async();

    directiveLoader.load(function() {

        editorLoader.load({

            appName: 'personality',
            containerId: qunitControls_setting_productDomElements_ContainerId,
            onload: function() {
                var appIframe = editorLoader.getIframe(qunitControls_setting_productDomElements_ContainerId);
                var appWindow = appIframe.contentWindow;
                window.MutApp = appWindow.MutApp;
                $('#'+qunitControls_setting_productDomElements_ContainerId).show();

                var app = editorLoader.startApp({
                    containerId: qunitControls_setting_productDomElements_ContainerId,
                    defaults: null,
                    mode: 'edit',
                    appChangeCallbacks: onAppChanged
                });

                // добавить первый вопрос
                app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

                // слинковать элементы uiElement и проверить что линковка прошла
                var scrQuestion0 = app.getScreenById('questionScreen0');
                ControlManager.handleShowScreen({screen: scrQuestion0});
                var ctrls = ControlManager.getControls({
                    propertyString: "id=pm quiz.0.question.text"
                });
                assert.ok(ctrls.length === 1 && ctrls[0].$productDomElement);
                assert.ok($.contains(scrQuestion0.$el[0], ctrls[0].$productDomElement[0]) === true);

                // еще один вопрос добавить
                app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

                var scrQuestion0 = app.getScreenById('questionScreen0');
                ControlManager.handleShowScreen({screen: scrQuestion0});
                var ctrls = ControlManager.getControls({
                    propertyString: "id=pm quiz.0.question.text"
                });
                assert.ok(ctrls.length === 1 && ctrls[0].$productDomElement);
                assert.ok($.contains(scrQuestion0.$el[0], ctrls[0].$productDomElement[0]) === true);
                var scrQuestion1 = app.getScreenById('questionScreen1');
                ControlManager.handleShowScreen({screen: scrQuestion1});
                var ctrls = ControlManager.getControls({
                    propertyString: "id=pm quiz.1.question.text"
                });
                assert.ok(ctrls.length === 1 && ctrls[0].$productDomElement);
                assert.ok($.contains(scrQuestion1.$el[0], ctrls[0].$productDomElement[0]) === true);

                done();

            } // editorLoader.onload
        });
    });

    function onAppChanged(event, data) {
        switch (event) {
            case MutApp.EVENT_PROPERTY_CREATED: {
                var ctrl = ControlManager.createControl({
                    mutAppProperty: data.property,
                    appIframe: editorLoader.getIframe(qunitControls_setting_productDomElements_ContainerId)
                });
                break;
            }
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {
                // должен сам контрол обработать это сообщение
                var ctrls = ControlManager.getControls({propertyString:data.propertyString});
                if (ctrls && ctrls.length > 0) {
                    ctrls[0].setValue(data.property.getValue());
                }
                else {
                    console.error('onAppChanged: there is no control for appProperty: \'' + data.propertyString + '\'');
                }
                break;
            }
            case MutApp.EVENT_PROPERTY_DELETED: {
                // должен сам контрол обработать это сообщение
                ControlFactory.getControls(data.propertyString)[0].handleEvent(event, data);
                // фабрика удалить этот контрол
                var ctrl = ControlManager.deleteControl();
                break;
            }
        }
    }
});