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

    assert.ok(app.model.getOptionById(app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0].id) === app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0]);
    assert.ok(app.model.getOptionById('1234ac') === null);

    assert.ok(app.model.getQuestionById(app.model.attributes.quiz.toArray()[0].id) === app.model.attributes.quiz.toArray()[0]);
    assert.ok(app.model.getQuestionById('1234ac') === null);

    assert.ok(app.model.getResultById(app.model.attributes.results.toArray()[0].id) === app.model.attributes.results.toArray()[0]);
    assert.ok(app.model.getResultById('1234ac') === null);

    app.isOK({assert: assert});
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
    app.model.answer(app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0].id);
    app.model.next();
    // проверить что единственный результат выпал
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[0]);

    app.isOK({assert: assert});
});

QUnit.test("Personality: game 1", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    var qId = app.model.attributes.quiz.getIdFromPosition(0);
    app.model.attributes.quiz.toArray()[0].answer.options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId:qId});
    var qId = app.model.attributes.quiz.getIdFromPosition(1);
    app.model.attributes.quiz.toArray()[1].answer.options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId:qId});

    assert.ok(app.model.attributes.resultLinking.toArray().length === 8); // всего 8 опций в приложении

    // первый вопрос
    var optionId1_1 = app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0].id;
    var optionId1_2 = app.model.attributes.quiz.toArray()[0].answer.options.toArray()[1].id;
    var optionId1_3 = app.model.attributes.quiz.toArray()[0].answer.options.toArray()[2].id;
    var optionId1_4 = app.model.attributes.quiz.toArray()[0].answer.options.toArray()[3].id;

    /// второй вопрос
    var optionId2_1 = app.model.attributes.quiz.toArray()[1].answer.options.toArray()[0].id;
    var optionId2_2 = app.model.attributes.quiz.toArray()[1].answer.options.toArray()[1].id;
    var optionId2_3 = app.model.attributes.quiz.toArray()[1].answer.options.toArray()[2].id;
    var optionId2_4 = app.model.attributes.quiz.toArray()[1].answer.options.toArray()[3].id;

    var resultId1 = app.model.attributes.results.toArray()[0].id;
    var resultId2 = app.model.attributes.results.toArray()[1].id;

    qunitPersonality_setConnection({
        app: app,
        optionId: optionId1_1,
        strongResultId: resultId1
    });
    qunitPersonality_setConnection({
        app: app,
        optionId: optionId1_3,
        strongResultId: resultId1
    });
    qunitPersonality_setConnection({
        app: app,
        optionId: optionId1_2,
        strongResultId: resultId2
    });
    qunitPersonality_setConnection({
        app: app,
        optionId: optionId1_4,
        strongResultId: resultId2
    });

    qunitPersonality_setConnection({
        app: app,
        optionId: optionId2_1,
        weakResultId: resultId1
    });
    qunitPersonality_setConnection({
        app: app,
        optionId: optionId2_3,
        weakResultId: resultId1
    });
    qunitPersonality_setConnection({
        app: app,
        optionId: optionId2_2,
        weakResultId: resultId2
    });
    qunitPersonality_setConnection({
        app: app,
        optionId: optionId2_4,
        weakResultId: resultId2
    });

    app.model.next();
    app.model.answer(optionId1_1);
    app.model.next();
    app.model.answer(optionId2_2);
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[0]);

    app.model.next();
    assert.ok(app.model.attributes.state === 'welcome');

    app.model.next();
    app.model.answer(optionId1_4);
    app.model.next();
    app.model.answer(optionId2_3);
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[1]);

    app.isOK({assert: assert});
});

QUnit.test("Personality: game 2", function( assert ) {
    var app = new PersonalityApp({
    });
    app.start();

    for (var i = 0; i < 5; i++) {
        initApp(app);
        round(app);
        app.isOK({assert: assert});
    }

    function initApp(app) {
        while (app.model.attributes.results.toArray().length > 0) {
            app.model.attributes.results.deleteElement(0);
        }
        while (app.model.attributes.quiz.toArray().length > 0) {
            app.model.attributes.quiz.deleteElement(0);
        }

        // максимум 4 результата
        var rc = getRandomArbitrary(1,4);
        for (var i = 0; i < rc; i++) {
            app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
        }

        // максимум 10 вопросов
        assert.ok(rc === app.model.attributes.results.toArray().length);
        var qc = getRandomArbitrary(1,10);
        for (var i = 0; i < qc; i++) {
            app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
        }
        assert.ok(qc === app.model.attributes.quiz.toArray().length);

        // случайные привязки ответов
        var quizValue = app.model.attributes.quiz.toArray();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options.toArray();
            for (var n = 0; n < options.length; n++) {

                var randomResultId = app.model.attributes.results.toArray()[getRandomArbitrary(0,rc-1)].id;
                if (getRandomArbitrary(0,1) === 1) {
                    qunitPersonality_setConnection({
                        app: app,
                        optionId: options[n].id,
                        strongResultId: randomResultId
                    });
                }
                else {
                    qunitPersonality_setConnection({
                        app: app,
                        optionId: options[n].id,
                        weakResultId: randomResultId
                    });
                }

            }
        }

        // распределение результатов посмотрим
        var resultValue = app.model.attributes.results.toArray();
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
        var quizValue = app.model.attributes.quiz.toArray();
        for (var i = 0; i < quizValue.length; i++) {
            assert.ok(app.model.attributes.state === 'question');
            var options = quizValue[i].answer.options.toArray();
            app.model.answer(options[getRandomArbitrary(0,options.length-1)].id);
            app.model.next();
        }
        assert.ok(app.model.attributes.state === 'result');
        assert.ok(app.model.get('currentResult'));
        app.model.next();
    }
});

/**
 * Связать опцию с результатом
 * В модели PersonalityModel этих функций нет, так как контрол кастомный это делает
 *
 * @param param.app
 * @param param.optionId
 * @param param.weakResultId
 * @param param.strongResultId
 */
function qunitPersonality_setConnection(param) {
    param = param || {};
    var optionValue = null;
    for (var key in param.app.model.attributes.resultLinking.getValue()) {
        if (param.app.model.attributes.resultLinking.getValue().hasOwnProperty(key) === true &&
            param.app.model.attributes.resultLinking.getValue()[key].optionId === param.optionId) {
            optionValue = param.app.model.attributes.resultLinking.getValue()[key];
        }
    }
    if (optionValue === null) {
        assert.ok(optionValue, 'Option not found');
    }
    if (param.weakResultId) {
        optionValue.weakLinks.push(param.weakResultId);
    }
    if (param.strongResultId) {
        optionValue.strongLinks.push(param.strongResultId);
    }
}