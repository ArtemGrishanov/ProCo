/**
 * Created by artyom.grishanov on 21.08.17.
 *
 * Проверки определяют работоспособность теста, как отдельного приложения
 */
QUnit.test("Personality: getOption, getQuestion, getResult", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    // добавить один результат, один ответ
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    assert.ok(app.model.getOptionById(app.model.attributes.quiz.getValue()[0].answer.options[0].id) === app.model.attributes.quiz.getValue()[0].answer.options[0]);
    assert.ok(app.model.getOptionById('1234ac') === null);

    assert.ok(app.model.getQuestionById(app.model.attributes.quiz.getValue()[0].id) === app.model.attributes.quiz.getValue()[0]);
    assert.ok(app.model.getQuestionById('1234ac') === null);

    assert.ok(app.model.getResultById(app.model.attributes.results.getValue()[0].id) === app.model.attributes.results.getValue()[0]);
    assert.ok(app.model.getResultById('1234ac') === null);
});

QUnit.test("Personality: 1 question, 1 result", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    // добавить один результат, один ответ
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    app.model.next();
    // ответ на первую опцию
    app.model.answer(app.model.attributes.quiz.getValue()[0].answer.options[0].id);
    app.model.next();
    // проверить что единственный результат выпал
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.getValue()[0]);
});

QUnit.test("Personality: 1 question, 2 results", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    // добавить один результат, один ответ
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    assert.ok(false, 'setStrongConnection');
    assert.ok(false, 'setWeakConnection');
    assert.ok(false, 'deleteStrongConnection');
    assert.ok(false, 'deleteWeakConnection');
});