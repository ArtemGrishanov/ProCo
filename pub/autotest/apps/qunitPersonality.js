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

    var optionId1 = app.model.attributes.quiz.getValue()[0].answer.options[0].id;
    var resultId1 = app.model.attributes.results.getValue()[0].id;
    app.model.setStrongConnection(optionId1, resultId1);
    assert.ok(app.model.isStrongConnection(optionId1, resultId1) === true, 'isStrongConnection');
    assert.ok(app.model.isWeakConnection(optionId1, resultId1) === false, 'isStrongConnection');

    var optionId2 = app.model.attributes.quiz.getValue()[0].answer.options[1].id;
    var resultId2 = app.model.attributes.results.getValue()[1].id;
    app.model.setWeakConnection(optionId2, resultId2);
    assert.ok(app.model.isWeakConnection(optionId2, resultId2) === true, 'isWeakConnection');
    assert.ok(app.model.isStrongConnection(optionId2, resultId2) === false, 'isWeakConnection');

    app.model.deleteStrongConnection(optionId1, resultId1);
    assert.ok(app.model.isStrongConnection(optionId1, resultId1) === false, 'deleteStrongConnection');
    assert.ok(app.model.isWeakConnection(optionId1, resultId1) === false, 'deleteStrongConnection');

    app.model.deleteWeakConnection(optionId2, resultId2);
    assert.ok(app.model.isStrongConnection(optionId2, resultId2) === false, 'deleteWeakConnection');
    assert.ok(app.model.isWeakConnection(optionId2, resultId2) === false, 'deleteWeakConnection');

    // проверить что нельзя одновременно поставить два типа связи
    app.model.setWeakConnection(optionId2, resultId2);
    app.model.setStrongConnection(optionId2, resultId2);
    assert.ok(app.model.isStrongConnection(optionId2, resultId2) === true);
    assert.ok(app.model.isWeakConnection(optionId2, resultId2) === false);
});

QUnit.test("Personality: game 1", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    // первый вопрос
    var optionId1_1 = app.model.attributes.quiz.getValue()[0].answer.options[0].id;
    var optionId1_2 = app.model.attributes.quiz.getValue()[0].answer.options[1].id;
    var optionId1_3 = app.model.attributes.quiz.getValue()[0].answer.options[2].id;
    var optionId1_4 = app.model.attributes.quiz.getValue()[0].answer.options[3].id;

    /// второй вопрос
    var optionId2_1 = app.model.attributes.quiz.getValue()[1].answer.options[0].id;
    var optionId2_2 = app.model.attributes.quiz.getValue()[1].answer.options[1].id;
    var optionId2_3 = app.model.attributes.quiz.getValue()[1].answer.options[2].id;
    var optionId2_4 = app.model.attributes.quiz.getValue()[1].answer.options[3].id;

    var resultId1 = app.model.attributes.results.getValue()[0].id;
    var resultId2 = app.model.attributes.results.getValue()[1].id;

    app.model.setStrongConnection(optionId1_1, resultId1);
    app.model.setStrongConnection(optionId1_3, resultId1);
    app.model.setStrongConnection(optionId1_2, resultId2);
    app.model.setStrongConnection(optionId1_4, resultId2);

    app.model.setWeakConnection(optionId2_1, resultId1);
    app.model.setWeakConnection(optionId2_3, resultId1);
    app.model.setWeakConnection(optionId2_2, resultId2);
    app.model.setWeakConnection(optionId2_4, resultId2);

    app.model.next();
    app.model.answer(optionId1_1);
    app.model.next();
    app.model.answer(optionId2_2);
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.getValue()[0]);

    app.model.next();
    assert.ok(app.model.attributes.state === 'welcome');

    app.model.next();
    app.model.answer(optionId1_4);
    app.model.next();
    app.model.answer(optionId2_3);
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.getValue()[1]);

});

QUnit.test("Personality: game 2", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    for (var i = 0; i < 50; i++) {
        initApp(app);
        round(app);
    }

    function initApp(app) {
        while (app.model.attributes.results.getValue().length > 0) {
            app.model.attributes.results.deleteElement(0);
        }
        while (app.model.attributes.quiz.getValue().length > 0) {
            app.model.attributes.quiz.deleteElement(0);
        }

        // максимум 4 результата
        var rc = getRandomArbitrary(1,4);
        for (var i = 0; i < rc; i++) {
            app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
        }

        // максимум 10 вопросов
        assert.ok(rc === app.model.attributes.results.getValue().length);
        var qc = getRandomArbitrary(1,10);
        for (var i = 0; i < qc; i++) {
            app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
        }
        assert.ok(qc === app.model.attributes.quiz.getValue().length);

        // случайные привязки ответов
        var quizValue = app.model.attributes.quiz.getValue();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options;
            for (var n = 0; n < options.length; n++) {

                var randomResultId = app.model.attributes.results.getValue()[getRandomArbitrary(0,rc-1)].id;
                if (getRandomArbitrary(0,1) === 1) {
                    app.model.setStrongConnection(options[n].id, randomResultId);
                }
                else {
                    app.model.setWeakConnection(options[n].id, randomResultId);
                }

            }
        }

        // распределение результатов посмотрим
        var resultValue = app.model.attributes.results.getValue();
        var resultsPercentProbabilities = app.model.getResultProbabilities();
        var sum = 0;
        for (var resultId in resultsPercentProbabilities) {
            assert.ok(app.model.getResultById(resultId));
            sum += resultsPercentProbabilities[resultId];
        }
        assert.ok(0.99 < sum && sum < 1.01); // иногда из-за погрешности бывает 0.9(9) или типа того
    }

    function round(app) {
        assert.ok(app.model.attributes.state === 'welcome');
        app.model.next();
        var quizValue = app.model.attributes.quiz.getValue();
        for (var i = 0; i < quizValue.length; i++) {
            assert.ok(app.model.attributes.state === 'question');
            var options = quizValue[i].answer.options;
            app.model.answer(options[getRandomArbitrary(0,options.length-1)].id);
            app.model.next();
        }
        assert.ok(app.model.attributes.state === 'result');
        assert.ok(app.model.get('currentResult'));
        app.model.next();
    }
});