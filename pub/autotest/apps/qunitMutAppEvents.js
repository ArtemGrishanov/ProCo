/**
 * Created by artyom.grishanov on 07.07.16.
 */
QUnit.test("MutApp test: MutApp Events", function( assert ) {
    var createdEventsCount = 0;
    var deletedEventsCount = 0;
    var changedEventsCount = 0;
    var prevCreatedEventsCount = 0;
    var prevChangedEventsCount = 0;
    var initialPropertyCount = 0;

    var screenCreatedCount = 0;
    var screenRenderedCount = 0;
    var screenDeletedCount = 0;

    var app = new PersonalityApp({
        defaults: null,
        mode: 'edit',
        appChangeCallbacks: [onAppChanged]
    });
    app.start();
    assert.ok(createdEventsCount === app._mutappProperties.length);
    assert.ok(screenCreatedCount === 1, 'screenCreatedCount');
    assert.ok(screenRenderedCount === 2, 'screenRenderedCount');
    initialPropertyCount = app._mutappProperties.length;

    prevCreatedEventsCount = createdEventsCount;
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // + id=pm quiz.{{id}}.question.text
    // + id=pm quiz.{{id}}.question.backgroundImage
    // + id=pm quiz.{{id}}.question.backgroundColor
    // + id=pm quiz.{{id}}.answer.options
    // + id=pm quiz.{{id}}.answer.options.{{id}}.text
    // + id=pm quiz.{{id}}.answer.options.{{id}}.text
    // + id=pm quiz.{{id}}.answer.options.{{id}}.text

    var quiz0Id = app.model.attributes.quiz.getIdFromPosition(0);
    assert.ok(PROPETIES_IN_ONE_QUIZ_ELEM + prevCreatedEventsCount === createdEventsCount, 'Some properties created');
    assert.ok(deletedEventsCount === 0, 'nothing deleted');
    assert.ok(app.getProperty('id=pm quiz.'+quiz0Id+'.question.text'));
    assert.ok(screenCreatedCount === 2, 'screenCreatedCount');
    assert.ok(screenRenderedCount === 3, 'screenRenderedCount');
    assert.ok(screenDeletedCount === 0, 'screenDeletedCount');

    prevChangedEventsCount = changedEventsCount;
    app.getProperty('id=pm quiz.'+quiz0Id+'.question.text').setValue('new value');
    assert.ok(1+prevChangedEventsCount === changedEventsCount);

    prevCreatedEventsCount = createdEventsCount;
    app.model.attributes.quiz.deleteElement(0);
    assert.ok(prevCreatedEventsCount === createdEventsCount, 'nothing created');
    assert.ok(deletedEventsCount === PROPETIES_IN_ONE_QUIZ_ELEM, 'deletedEventsCount');
    assert.ok(initialPropertyCount === app._mutappProperties.length, 'initialPropertyCount');
    assert.ok(app.getProperty('id=pm quiz.'+quiz0Id+'.question.text') === null);
    assert.ok(screenCreatedCount === 2, 'screenCreatedCount');
    assert.ok(screenRenderedCount === 3, 'screenRenderedCount');
    assert.ok(screenDeletedCount === 1, 'screenDeletedCount');

    prevCreatedEventsCount = createdEventsCount;
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    assert.ok(PROPETIES_IN_ONE_QUIZ_ELEM + prevCreatedEventsCount === createdEventsCount, 'Some properties created');

    //todo свойства которые были инстанцированы внутри экрана также, их удалять?

    function onAppChanged(event, data) {
        switch(event) {
            case MutApp.EVENT_PROPERTY_CREATED: {
                createdEventsCount++;
                break;
            }
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {
                changedEventsCount++;
                break;
            }
            case MutApp.EVENT_PROPERTY_DELETED: {
                deletedEventsCount++;
                break;
            }

            case MutApp.EVENT_SCREEN_CREATED: {
                screenCreatedCount++;
                break;
            }
            case MutApp.EVENT_SCREEN_RENDERED: {
                screenRenderedCount++;
                break;
            }
            case MutApp.EVENT_SCREEN_DELETED: {
                screenDeletedCount++;
                break;
            }
        }
    }
});