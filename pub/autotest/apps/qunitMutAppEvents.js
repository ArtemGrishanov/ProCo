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
    // + id=pm quiz.0.question.text
    // + id=pm quiz.0.question.backgroundImage
    // + id=pm quiz.0.answer.options.0.text
    // + id=pm quiz.0.answer.options.1.text
    // + id=pm quiz.0.answer.options.2.text
    // + id=pm quiz.0.answer.options.3.text
    assert.ok(6+prevCreatedEventsCount === createdEventsCount, 'Some properties created');
    assert.ok(deletedEventsCount === 0, 'nothing deleted');
    assert.ok(app.getProperty('id=pm quiz.0.question.text'));
    assert.ok(screenCreatedCount === 2, 'screenCreatedCount');
    assert.ok(screenRenderedCount === 3, 'screenRenderedCount');
    assert.ok(screenDeletedCount === 0, 'screenDeletedCount');

    prevChangedEventsCount = changedEventsCount;
    app.getProperty('id=pm quiz.0.question.text').setValue('new value');
    assert.ok(1+prevChangedEventsCount === changedEventsCount);

    prevCreatedEventsCount = createdEventsCount;
    app.model.attributes.quiz.deleteElement(0);
    assert.ok(prevCreatedEventsCount === createdEventsCount, 'nothing created');
    assert.ok(deletedEventsCount === 6, 'deletedEventsCount');
    assert.ok(initialPropertyCount === app._mutappProperties.length, 'initialPropertyCount');
    assert.ok(app.getProperty('id=pm quiz.0.question.text') === null);
    assert.ok(screenCreatedCount === 2, 'screenCreatedCount');
    assert.ok(screenRenderedCount === 3, 'screenRenderedCount');
    assert.ok(screenDeletedCount === 1, 'screenDeletedCount');

    prevCreatedEventsCount = createdEventsCount;
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    assert.ok(6+prevCreatedEventsCount === createdEventsCount, 'Some properties created');

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