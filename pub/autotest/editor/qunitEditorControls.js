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
QUnit.test("Editor.Controls: create controls, check their values", function( assert ) {
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

/**
 * pre: устанавливать productDomelement, без этого фильтрация по элементу не будет работать
 *
 * 1) часть контролов видна сразу и всегда. Без всякой фильтрации.
 * 2) показ экрана - фильтрация по экрану
 * 3) показ экрана - фильтрация по экрану - клик по uiElement - фильтрация по элементу (точнее propertyString)
 *
 */
QUnit.test("Editor.Controls: ControlManager filtering, uiElement linking", function( assert ) {
    assert.ok(window.app1, 'app exist');
    var app1 = window.app1;

    function onSelectElementCallback(dataAppPropertyString) {
        console.log('onSelectElementCallback: ' + dataAppPropertyString);
        ControlManager.filter({
            propertyStrings: dataAppPropertyString.split(',')
        });
    }
    workspace.init({
        onSelectElementCallback: onSelectElementCallback
    });
    // имитируем показ первого экрана
    workspace.showScreen({
        screen: app1.getScreenById('startScr')
    });


    // слинковать элементы uiElement и проверить что линковка прошла
    ControlManager.handleShowScreen({
        screen: app1.getScreenById('startScr')
    });
    var ctrls = ControlManager.getControls({
        propertyString: 'id=startScr startHeaderText'
    });
    assert.ok(ctrls[0].$productDomElement);


    // check some controlFilter values in app properties
    assert.ok(app1.getProperty('id=pm showLogoOnStartScreen')._controlFilter === 'screen');
    var cr = app1.getProperty('id=pm showLogoOnStartScreen')._controlFilterScreenCriteria;
    assert.ok(cr.key === 'id' && cr.value === 'startScr');
    assert.ok(app1.getProperty('id=startScr shadowEnable')._controlFilter === 'screen');
    var cr = app1.getProperty('id=startScr shadowEnable')._controlFilterScreenCriteria;
    assert.ok(cr.key === 'id' && cr.value === 'startScr');
    assert.ok(app1.getProperty('.js-start_btn background-color')._controlFilter === 'onclick');
    assert.ok(app1.getProperty('id=pm randomizeQuestions')._controlFilter === 'always');
    // assert.ok(app1.getProperty('id=pm test1').controlFilter === 'hidden');

    // фильтр стоит по умолчанию
    // проверить несколько контролов 'always'
    var ctrls = ControlManager.getControls({
        propertyString: 'id=pm randomizeQuestions'
    });
    assert.ok(ctrls[0].controlFilter === 'always');
    for (var i = 0; i < ctrls.length; i++) {
        assert.ok(ctrls[i].isShown() === true);
    }
    var ctrls = ControlManager.getControls({
        propertyString: 'id=startScr shadowEnable'
    });
    assert.ok(ctrls[0].controlFilter === 'screen');
    assert.ok(ctrls[0].controlFilterScreenCriteria.key === 'id');
    assert.ok(ctrls[0].controlFilterScreenCriteria.value === 'startScr');
    for (var i = 0; i < ctrls.length; i++) {
        assert.ok(ctrls[i].isShown() === false);
    }

    // применить фильтрацию по экрану
    ControlManager.filter({
        screen: app1.getScreenById('startScr'),
        propertyStrings: null
    });
    // проверяем только пару контролов для примера, что видны. Проверка всех контролов это чистое дублирование логики проверки критерия экрана внутри filter
    var ctrls = ControlManager.getControls({
        propertyString: 'id=startScr shadowEnable'
    });
    for (var i = 0; i < ctrls.length; i++) {
        assert.ok(ctrls[i].isShown() === true);
    }
    var ctrls = ControlManager.getControls({
        propertyString: 'id=pm showLogoOnStartScreen'
    });
    for (var i = 0; i < ctrls.length; i++) {
        assert.ok(ctrls[i].isShown() === true);
    }

    // симитировать клик по элементу и проверить фильтрацию по каждому элементу, причем должна сохраняться фильтрация и по экрану
    // эти строки будут получены из workspace, который обработает клик на uiElement и возьмет у него атрибут data-app-property
    var filterPropStrings = ['.js-start_header padding-top','.js-start_header color','id=startScr startHeaderText'];
    ControlManager.filter({
        // на uiElement в продукте есть атрибут data-app-property, в котором несколько propertyString
        propertyStrings: filterPropStrings,
        screen: null
    });
    var ctrls = ControlManager.getControls();
    for (var i = 0; i < ctrls.length; i++) {
        if (filterPropStrings.indexOf(ctrls[i].propertyString) >= 0 || ctrls[i].controlFilter === 'always') {
            assert.ok(ctrls[i].isShown() === true, 'control \''+ctrls[i].propertyString+'\' must be shown');
        }
        else {
            assert.ok(ctrls[i].isShown() === false, 'control \''+ctrls[i].propertyString+'\' must be hidden');
        }
    }

    // todo одновременно когда экран и клик по элементу
//    ControlManager.filter({
//        propertyStrings: filterPropStrings
//        screen: app1.getScreenById('startScr')
//    });

    // todo при клике на uiElement иногда надо показывать quick_control_panel как workspace узнает о типе контрола

    // скрыть все контролы
    ControlManager.clearFilter(null);
    var ctrls = ControlManager.getControls();
    for (var i = 0; i < ctrls.length; i++) {
        assert.ok(ctrls[i].controlFilter === 'always' || ctrls[i].isShown() === false, 'all nonalways controls and control must be hidden');
    }
});



QUnit.test("Editor.Controls: SlideGroupControl", function( assert ) {
    var done = assert.async();

    directiveLoader.load(function() {
        assert.ok(directiveLoader.getDirective('colorpicker'));

        editorLoader.load({

            appName: 'personality',
            container: $('#id-product_iframe_cnt_screens_qunittest'),
            onload: function() {
                var appIframe = editorLoader.getIframe();
                var appWindow = appIframe.contentWindow;
                window.MutApp = appWindow.MutApp;
                $('#id-product_iframe_cnt_screens_qunittest').show();

                ScreenManager.init({
                    onScreenEvents: onScreenEvents,
                    appType: 'personality'
                });

                var app2 = editorLoader.startApp({
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

                //todo serialization/deserialization

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