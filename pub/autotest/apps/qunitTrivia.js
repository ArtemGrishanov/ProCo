/**
 * Created by artyom.grishanov on 21.08.17.
 *
 * Проверки определяют работоспособность теста, как отдельного приложения
 */
QUnit.test("Trivia: getOption, getQuestion, getResult", function( assert ) {
    var app = new TriviaApp({
    });
    app.start();

    // добавить один результат, один ответ
    app.model.attributes.results.addElementByPrototype('id=tm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=tm quizProto1');

    assert.ok(app.model.getOptionById(app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0].id) === app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0]);
    assert.ok(app.model.getOptionById('1234ac') === null);

    assert.ok(app.model.getQuestionById(app.model.attributes.quiz.toArray()[0].id) === app.model.attributes.quiz.toArray()[0]);
    assert.ok(app.model.getQuestionById('1234ac') === null);

    assert.ok(app.model.getResultById(app.model.attributes.results.toArray()[0].id) === app.model.attributes.results.toArray()[0]);
    assert.ok(app.model.getResultById('1234ac') === null);

    app.isOK({assert: assert});
});

QUnit.test("Trivia: 1 question, 1 result", function( assert ) {
    var app = new TriviaApp({
    });
    app.start();

    // добавить один результат, один ответ
    app.model.attributes.results.addElementByPrototype('id=tm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=tm quizProto1');

    app.model.next();
    // ответ на первую опцию
    app.model.answer(app.model.attributes.quiz.toArray()[0].answer.options.toArray()[0].id);
    app.model.next();
    // проверить что единственный результат выпал
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[0]);

    app.isOK({assert: assert});
});

QUnit.test("Trivia: game 1", function( assert ) {
    var app = new TriviaApp({
    });
    app.start();

    app.model.attributes.results.addElementByPrototype('id=tm resultProto1');
    app.model.attributes.results.addElementByPrototype('id=tm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=tm quizProto1');
    app.model.attributes.quiz.addElementByPrototype('id=tm quizProto1');

    var qId = app.model.attributes.quiz.getIdFromPosition(0);
    app.model.attributes.quiz.toArray()[0].answer.options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId:qId});
    var qId = app.model.attributes.quiz.getIdFromPosition(1);
    app.model.attributes.quiz.toArray()[1].answer.options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId:qId});

    assert.ok(app.model.attributes.optionPoints.toArray().length === 8); // всего 8 опций во всем приложении

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

    // установка верного результата для первого вопроса
    app.model.getOptionPointsInfo(optionId1_1).points = 1;
    // установка верного результата для второго вопроса
    app.model.getOptionPointsInfo(optionId2_4).points = 1;
    // ВАЖНО: посла установки верных/неверных ответов надо обновить распределение. Это должен сделать контрол
    app.model.updateResultPointsAllocation();

    app.isOK({assert: assert});

    app.model.next();
    app.model.answer(optionId1_1); // верный ответ
    app.model.next();
    app.model.answer(optionId2_2); // неверный ответ
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[0]); // первый резалт выпал

    app.model.next();
    app.isOK({assert: assert});
    assert.ok(app.model.attributes.state === 'welcome');

    app.model.next();
    app.model.answer(optionId1_1); // верный ответ
    app.model.next();
    app.model.answer(optionId2_4); // верный ответ
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[1]); // второй резалт выпал

    app.model.next();
    app.isOK({assert: assert});
    assert.ok(app.model.attributes.state === 'welcome');

    app.model.next();
    app.model.answer(optionId1_2); // неверный ответ
    app.model.next();
    app.model.answer(optionId2_3); // неверный ответ
    app.model.next();
    assert.ok(app.model.attributes.state === 'result');
    assert.ok(app.model.get('currentResult') === app.model.attributes.results.toArray()[0]); // первый резалт выпал

    app.isOK({assert: assert});
});

QUnit.test("Trivia: game 2", function( assert ) {
    var app = new TriviaApp({
    });
    app.start();

    for (var i = 0; i < 5; i++) {
        initApp(app);
        app.isOK({assert: assert});
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
            app.model.attributes.results.addElementByPrototype('id=tm resultProto1');
        }

        // максимум 10 вопросов
        assert.ok(rc === app.model.attributes.results.toArray().length);
        var qc = getRandomArbitrary(1,10);
        for (var i = 0; i < qc; i++) {
            app.model.attributes.quiz.addElementByPrototype('id=tm quizProto1');
        }
        assert.ok(qc === app.model.attributes.quiz.toArray().length);

        // случайное назначение одного ответа верным
        var quizValue = app.model.attributes.quiz.toArray();
        var maxPoints = 0;
        for (var i = 0; i < quizValue.length; i++) {
            var optionArr = quizValue[i].answer.options.toArray();
            // случайный ответ выбираем в качестве верного
            var correctOptionId = optionArr[getRandomArbitrary(0,optionArr.length-1)].id;
            var option = app.model.getOptionById(correctOptionId);
            assert.ok(option);
            var oi = app.model.getOptionPointsInfo(option.id);
            assert.ok(oi);
            oi.points = 1;
            // ВАЖНО: посла установки верных/неверных ответов надо обновить распределение. Это должен сделать контрол
            app.model.updateResultPointsAllocation();
            maxPoints += oi.points;
        }

        // проверить что с установкой корректных ответов произошло распределение результатов по баллам
        assert.ok(typeof app.model.attributes.resulPointsAllocation[maxPoints] === 'string');
        // более полная проверка resulPointsAllocation внутри model.isOK
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