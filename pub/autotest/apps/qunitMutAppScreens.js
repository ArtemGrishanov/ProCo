/**
 * Created by alex on 16.08.17.
 */
QUnit.test("MutApp test: Screens and events", function( assert ) {
    var renderHistory = {'startScr':0,'questionScreen0':0,'resultScreen0':0};
    var createHistory = {'startScr':0,'questionScreen0':0,'resultScreen0':0};
    var destroyHistory = {'startScr':0,'questionScreen0':0,'resultScreen0':0};

    var app = new PersonalityApp({
        defaults: null,
        appChangeCallbacks: [onAppChanged],
    });
    app.start();

    assert.ok(app._screens.length == 1);
    assert.ok(app.getScreenIds().length === app._screens.length);

    assert.ok(createHistory['startScr'] == 1);
    assert.ok(renderHistory['startScr'] == 1);
    assert.ok(destroyHistory['startScr'] == 0);
    assert.ok(createHistory['questionScreen0'] == 0);
    assert.ok(renderHistory['questionScreen0'] == 0);
    assert.ok(destroyHistory['questionScreen0'] == 0);
    assert.ok(createHistory['resultScreen0'] == 0);
    assert.ok(renderHistory['resultScreen0'] == 0);
    assert.ok(destroyHistory['resultScreen0'] == 0);

    var screenIds = app.getScreenIds();
    for (var i = 0; i < screenIds.length; i++) {
        assert.ok(app.getScreenById(screenIds[i]));
    }

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    assert.ok(app._screens.length == 3);
    assert.ok(app.getScreenIds().length === app._screens.length);

    assert.ok(createHistory['startScr'] == 1);
    assert.ok(renderHistory['startScr'] == 1);
    assert.ok(destroyHistory['startScr'] == 0);
    assert.ok(createHistory['questionScreen0'] == 1);
    assert.ok(renderHistory['questionScreen0'] == 0);
    assert.ok(destroyHistory['questionScreen0'] == 0);
    assert.ok(createHistory['resultScreen0'] == 1);
    assert.ok(renderHistory['resultScreen0'] == 0);
    assert.ok(destroyHistory['resultScreen0'] == 0);

    // к экрану вопроса
    app.model.next();

    assert.ok(createHistory['startScr'] == 1);
    assert.ok(renderHistory['startScr'] == 1);
    assert.ok(destroyHistory['startScr'] == 0);
    assert.ok(createHistory['questionScreen0'] == 1);
    assert.ok(renderHistory['questionScreen0'] == 1);
    assert.ok(destroyHistory['questionScreen0'] == 0);
    assert.ok(createHistory['resultScreen0'] == 1);
    assert.ok(renderHistory['resultScreen0'] == 0);
    assert.ok(destroyHistory['resultScreen0'] == 0);

    // к экрану результата
    app.model.next();

    assert.ok(createHistory['startScr'] == 1);
    assert.ok(renderHistory['startScr'] == 1);
    assert.ok(destroyHistory['startScr'] == 0);
    assert.ok(createHistory['questionScreen0'] == 1);
    assert.ok(renderHistory['questionScreen0'] == 1);
    assert.ok(destroyHistory['questionScreen0'] == 0);
    assert.ok(createHistory['resultScreen0'] == 1);
    assert.ok(renderHistory['resultScreen0'] == 1);
    assert.ok(destroyHistory['resultScreen0'] == 0);

    // снова к экрану старта
    app.model.next();

    assert.ok(createHistory['startScr'] == 1);
    assert.ok(renderHistory['startScr'] == 2);
    assert.ok(destroyHistory['startScr'] == 0);
    assert.ok(createHistory['questionScreen0'] == 1);
    assert.ok(renderHistory['questionScreen0'] == 1);
    assert.ok(destroyHistory['questionScreen0'] == 0);
    assert.ok(createHistory['resultScreen0'] == 1);
    assert.ok(renderHistory['resultScreen0'] == 1);
    assert.ok(destroyHistory['resultScreen0'] == 0);

    // удаление экрана
    app.model.attributes.results.deleteElement(0);
    assert.ok(app._screens.length == 2);
    assert.ok(app.getScreenIds().length === app._screens.length);

    assert.ok(createHistory['startScr'] == 1);
    assert.ok(renderHistory['startScr'] == 2);
    assert.ok(destroyHistory['startScr'] == 0);
    assert.ok(createHistory['questionScreen0'] == 1);
    assert.ok(renderHistory['questionScreen0'] == 1);
    assert.ok(destroyHistory['questionScreen0'] == 0);
    assert.ok(createHistory['resultScreen0'] == 1);
    assert.ok(renderHistory['resultScreen0'] == 1);
    assert.ok(destroyHistory['resultScreen0'] == 1);

    /**
     * Обработчик событий о смене экранов
     *
     * @param event
     */
    function onAppChanged(event, data) {
        var app = data.application;
        switch (event) {
            case MutApp.EVENT_SCREEN_CREATED: {
                assert.ok(app.getScreenById(data.screenId));
                createHistory[data.screenId]++;
                // создать контролы
                // ...
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                assert.ok(app.getScreenById(data.screenId));
                renderHistory[data.screenId]++;
                break;
            }
            case MutApp.EVENT_SCREEN_DELETED: {
                assert.ok(app.getScreenById(data.screenId));
                destroyHistory[data.screenId]++;
                // удалить контролы и листенеры
                // ...
                break;
            }
        }
    }

});

/**
 * У многих mutappproperty есть ассоциированный dom-элемент для редактирования
 */
QUnit.test("MutApp test: Screens in edit mode. data-app-property attribute", function( assert ) {

    var app = new PersonalityApp({
        defaults: null,
        mode: 'edit'
    });
    app.start();

    assert.ok(app.mode == 'edit');
    assert.ok(app._screens.length == 1);
    assert.ok(app.getScreenIds().length === app._screens.length);
    assert.ok(app.getScreenById('startScr'));

    // после рендера экрана должна произойти связь элемента на экране и MutAppProperty
    var startScr = app.getScreenById('startScr');
    var ap1 = app.getProperty('id=startScr startButtonText');
    assert.ok(ap1.uiElement, 'uiElement connected');
    assert.ok($(ap1.uiElement).attr('data-app-property').indexOf('id=startScr startButtonText') >= 0, 'data-app-property connected');
    assert.ok(ap1.uiElement === startScr.$el.find('.js-start_btn')[0]);

    var ap2 = app.getProperty('.js-start_header color');
    assert.ok(ap2.uiElement, 'uiElement connected');
    assert.ok($(ap2.uiElement).attr('data-app-property').indexOf('.js-start_header color') >= 0, 'data-app-property connected');
    assert.ok(ap2.uiElement === startScr.$el.find(ap2.cssSelector)[0]);

    // также после ренденра в режиме edit в экране будет список всех MutAppProperty, которые к нему привязаны
    // то есть на этом экране есть data-app-property от нескольких MutAppProperty
    var linkedMutAppProperties = startScr.getLinkedMutAppProperties()
    assert.ok(linkedMutAppProperties.length >= 1, 'there are linked MutAppProperties on the screen');
    for (var i = 0; i < linkedMutAppProperties.length; i++) {
        var lp = linkedMutAppProperties[i];
        assert.ok(lp.uiElement);
        assert.ok($.contains(startScr.$el[0], lp.uiElement));
    }


    // добавить первый вопрос
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    var scrQuestion0 = app.getScreenById('questionScreen0');
    var ap3 = app.getProperty('id=pm quiz.0.question.text');
    assert.ok(ap3.uiElement, 'uiElement connected');
    assert.ok($(ap3.uiElement).attr('data-app-property').indexOf('id=pm quiz.0.question.text') >= 0, 'data-app-property connected');
    assert.ok($.contains(scrQuestion0.$el[0], ap3.uiElement));

    // добавить второй вопрос
    // и снова проверить нулевой экран
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    var scrQuestion0 = app.getScreenById('questionScreen0');
    var ap3 = app.getProperty('id=pm quiz.0.question.text');
    assert.ok(ap3.uiElement, 'uiElement connected');
    assert.ok($(ap3.uiElement).attr('data-app-property').indexOf('id=pm quiz.0.question.text') >= 0, 'data-app-property connected');
    assert.ok($.contains(scrQuestion0.$el[0], ap3.uiElement));

    var scrQuestion1 = app.getScreenById('questionScreen1');
    var ap4 = app.getProperty('id=pm quiz.1.question.text');
    assert.ok(ap4.uiElement, 'uiElement connected');
    assert.ok($(ap4.uiElement).attr('data-app-property').indexOf('id=pm quiz.1.question.text') >= 0, 'data-app-property connected');
    assert.ok($.contains(scrQuestion1.$el[0], ap4.uiElement));

});

/**
 * Контроль количества экранов сразу же после десериализации
 */
QUnit.test("MutApp test: Screens after deserialization", function( assert ) {
    var app2 = new PersonalityApp({
        defaults: null,
        mode: 'edit'
    });
    app2.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    app2.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    var strApp2Serialized = app2.serialize();

    var app3 = new PersonalityApp({
        defaults: null,
        mode: 'edit',
        defaults: strApp2Serialized
    });

    assert.ok(app3.model.attributes.quiz.getValue().length === 2);
    assert.ok(app3._screens.length === 3);

});