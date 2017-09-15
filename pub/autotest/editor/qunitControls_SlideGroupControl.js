/**
 * Created by artyom.grishanov on 15.09.17.
 */

var qunitControls_SlideGroupContrl_ContainerId = 'id-qunitControls_SlideGroupContrl';

/**
 * Продвинутый тест, близкий к реальной работе в редакторе
 * Поддержка событий от ScreenManager (onScreenEvents function)
 */
QUnit.test("Editor.Controls: SlideGroupControl", function( assert ) {
    var done = assert.async();

    directiveLoader.load(function() {
        assert.ok(directiveLoader.getDirective('colorpicker'));

        editorLoader.load({

            appName: 'personality',
            containerId: qunitControls_SlideGroupContrl_ContainerId,
            onload: function() {
                var appIframe = editorLoader.getIframe(qunitControls_SlideGroupContrl_ContainerId);
                var appWindow = appIframe.contentWindow;
                window.MutApp = appWindow.MutApp;
                $('#'+qunitControls_SlideGroupContrl_ContainerId).show();

                ScreenManager.init({
                    onScreenEvents: onScreenEvents,
                    appType: 'personality'
                });

                var app2 = editorLoader.startApp({
                    containerId: qunitControls_SlideGroupContrl_ContainerId,
                    defaults: null,
                    mode: 'edit',
                    appChangeCallbacks: onAppChanged
                });
                $(appIframe).width(app2.width).height(app2.height);
                window.app2 = app2; // make it global for test

                var gn = app2.getScreenById('startScr').group;
                assert.ok(ScreenManager._test_getSlideGroupControlsCount()===1);
                assert.ok(ScreenManager._test_getSlideGroupControl(gn).groupName === 'start');
                assert.ok(ScreenManager._test_getScreens(gn).length === 1);

                app2.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

                var gn = app2.getScreenById('questionScreen0').group;
                assert.ok(ScreenManager._test_getSlideGroupControlsCount()===2); // +1 slide group
                assert.ok(ScreenManager._test_getSlideGroupControl(gn).groupName === 'questions');
                assert.ok(ScreenManager._test_getScreens(gn).length === 1);

                app2.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
                var gn = app2.getScreenById('questionScreen1').group;
                assert.ok(ScreenManager._test_getSlideGroupControlsCount()===2);
                assert.ok(ScreenManager._test_getSlideGroupControl(gn).groupName === 'questions');
                assert.ok(ScreenManager._test_getScreens(gn).length === 2); // +1 screen

                app2.model.attributes.quiz.deleteElement(1);
                assert.ok(app2.getScreenById('questionScreen1')===null);
                var gn = app2.getScreenById('questionScreen0').group;
                assert.ok(ScreenManager._test_getSlideGroupControlsCount()===2);
                assert.ok(ScreenManager._test_getSlideGroupControl(gn).groupName === 'questions');
                assert.ok(ScreenManager._test_getScreens(gn).length === 1); // -1 screen

                done();

            } // editorLoader.onload
        });
    });

//    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
//    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');

    /**
     * Обработчик событий о смене экранов
     *
     * @param event
     */
    function onAppChanged(event, data) {
        var app = data.application;
        switch (event) {
            case MutApp.EVENT_SCREEN_CREATED: {
                ScreenManager.update({
                    created: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                ScreenManager.update({
                    rendered: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_DELETED: {
                ScreenManager.update({
                    deleted: data.application.getScreenById(data.screenId)
                });
                break;
            }
        }
    }

    function onScreenEvents(event, data) {
        data = data || {};
        var arrayProperty = app2.getProperty(data.arrayPropertyString);
        switch (event) {
            case ScreenManager.EVENT_SCREEN_SELECT: {
                app2.showScreen(app2.getScreenById(data.screenId));
                break;
            }
            case ScreenManager.EVENT_ADD_SCREEN: {
                var ap = app2.getProperty(data.propertyString);
                if (isNumeric(data.clonedElementId) === true) {
                    // добавление путем клонирования.
                    // был указан элемент который пользователь хочет склонировать
                    if (data.clonedElementId >= ap.getValue().length) {
                        throw new Error('onScreenEvents.EVENT_ADD_SCREEN: There is no prototypes for \''+data.propertyString+'\'');
                    }
                    throw new Error('onScreenEvents.EVENT_ADD_SCREEN: not realized yet. Autotests for clone adding.');
                }
                else {
                    var pp = ap.prototypes;
                    if (!pp || pp.length === 0) {
                        throw new Error('onScreenEvents.EVENT_ADD_SCREEN: There is no prototypes for \''+data.propertyString+'\'');
                    }
                    if (pp.length > 1) {
                        // нужно выбрать прототип для нового элемента, так как возможно несколько вариантов
                        var selectOptions = [];
                        for (var i = 0; i < pp.length; i++) {
                            selectOptions.push({
                                id: pp[i].key,
                                label: pp[i].label,
                                icon: pp[i].img
                            });
                        }
                        // иногда надо дать возможность пользователю выбрать какой именно прототип использовать для нового элемента
                        Editor.showSelectDialog({
                            caption: App.getText('new_slide'),
                            options: selectOptions,
                            callback: (function(selectedOptionId) {
                                if (selectedOptionId) {
                                    for (var j = 0; j < pp.length; j++) {
                                        if (pp[j].key == selectedOptionId) {
                                            ap.addElementByPrototype(pp[j].getValue(), data.position);
                                        }
                                    }
                                }
                            }).bind(this)
                        });
                    }
                    else {
                        ap.addElementByPrototype(pp[0].protoFunction, data.position);
                    }
                }
                break;
            }
            case ScreenManager.EVENT_DELETE_SCREEN: {
                // удалить элемент с позиции
                if (isNumeric(data.position) === false) {
                    throw new Error('onScreenEvents.EVENT_DELETE_SCREEN: position must be specified when deleting');
                }
                var ap = app2.getProperty(data.propertyString);
                ap.deleteElement(data.position);
                break;
            }
            case ScreenManager.EVENY_CHANGE_POSITION: {
                if (isNumeric(data.elementIndex) === false || isNumeric(data.newElementIndex) === false) {
                    throw new Error('onScreenEvents.EVENY_CHANGE_POSITION: invalid params');
                }
                var ap = app2.getProperty(data.propertyString);
                ap.changePosition(data.elementIndex, data.newElementIndex);
                break;
            }
        }
    }

});


/**
 * Снова тест с контролами экранов.
 * приложение десериализуется и проверяется как контрол показывает экраны
 *
 */
QUnit.test("Editor.Controls: SlideGroupControl deserialization", function( assert ) {
    var done = assert.async();

    directiveLoader.load(function() {
        assert.ok(directiveLoader.getDirective('colorpicker'));

        editorLoader.load({

            appName: 'personality',
            containerId: qunitControls_SlideGroupContrl_ContainerId,
            onload: function() {
                var appIframe = editorLoader.getIframe(qunitControls_SlideGroupContrl_ContainerId);
                var appWindow = appIframe.contentWindow;
                window.MutApp = appWindow.MutApp;
                $('#'+qunitControls_SlideGroupContrl_ContainerId).show();

                var app2 = editorLoader.startApp({
                    containerId: qunitControls_SlideGroupContrl_ContainerId,
                    defaults: null,
                    mode: 'edit'
                    // appChangeCallbacks: not needed
                });
                $(appIframe).width(app2.width).height(app2.height);
                window.app2 = app2; // make it global for test
                app2.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
                app2.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

                setTimeout(function() {
                    // serialization/deserialization
                    var strApp2Serialized = app2.serialize();

                    ScreenManager.init({
                        onScreenEvents: function() {
                            // do nothing
                        },
                        appType: 'personality'
                    });

                    var app3 = editorLoader.startApp({
                        containerId: qunitControls_SlideGroupContrl_ContainerId,
                        defaults: strApp2Serialized,
                        mode: 'edit',
                        appChangeCallbacks: onAppChanged
                    });
                    window.app3 = app3; // make it global for test
                    var gn = app2.getScreenById('questionScreen1').group;
                    assert.ok(ScreenManager._test_getSlideGroupControlsCount()===2);
                    assert.ok(ScreenManager._test_getSlideGroupControl(gn).groupName === 'questions');
                    assert.ok(ScreenManager._test_getScreens(gn).length === 2); // +1 screen

                    done();
                }, 2000);

            } // editorLoader.onload
        });
    });

    /**
     * Обработчик событий о смене экранов
     *
     * @param event
     */
    function onAppChanged(event, data) {
        var app = data.application;
        switch (event) {
            case MutApp.EVENT_SCREEN_CREATED: {
                ScreenManager.update({
                    created: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                ScreenManager.update({
                    rendered: data.application.getScreenById(data.screenId),
                    cssString: data.application.getCssRulesString()
                });
                break;
            }
            case MutApp.EVENT_SCREEN_DELETED: {
                ScreenManager.update({
                    deleted: data.application.getScreenById(data.screenId)
                });
                break;
            }
        }
    }

});