/**
 * Created by artyom.grishanov on 11.08.16.
 */
function checkTestInStatic(assert, appIFrame) {
    var app = appIFrame.contentWindow.app;
    var model = app._models[0];
    assert.ok(!!app === true, 'app exists');
    assert.ok(!!app.type === true, 'app type exists');
    assert.ok(!!app.width === true, 'app width exists');
    assert.ok(!!app.height === true, 'app height exists');
    assert.ok(!!model === true, 'model exists');
    checkQuizFormat(assert, model);
    checkUnicQuestionsId(assert, model);
    checkUnicOptionsId(assert, model);
    checkResults(assert, model);
    checkSetGetRightAnswers(assert, model);
    checkAppScreens(assert, app, appIFrame.contentDocument);
}

function checkTestInAction(assert, appIFrame) {
    var app = appIFrame.contentWindow.app;
    var model = app._models[0];

    // пройти тест успешно
    for (var i = 0; i < 5; i++) {
        doToStart(assert, model);
        doOnePass(assert, model, {success: true});
    }

    // пройти тест рандомно
    for (var i = 0; i < 5; i++) {
        doToStart(assert, model);
        doOnePass(assert, model);
    }
}

function doToStart(assert, model) {
    // не можут быть больше 100 вопросов в тесте ))
    var suitableIterationsCount = 100;
    var i = 0;
    while(model.get('state') !== 'welcome' && i < suitableIterationsCount) {
        model.next();
        i++;
    }
    assert.ok(model.get('state') === 'welcome', 'Test in welcome state');
}

function doOnePass(assert, model, param) {
    assert.ok(model.get('state') === 'welcome', 'State welcome');
    assert.ok(model.get('resultPoints') === 0, 'result points');
    assert.ok(model.get('currentResult') === null, 'current result');
    model.next();
    var quiz = model.attributes.quiz;
    for (var i = 0; i < quiz.length; i++) {
        assert.ok(model.get('state') === 'question', 'State question');
        assert.ok(model.get('currentQuestionIndex') === i, 'Current question index is correct');
        assert.ok(model.get('currentQuestionId') === quiz[i].id, 'Current questionid is correct');
        var cId = model.getCorrectAnswerId(i);
        // всегда верно отвечать
        if (param && param.success === true) {
            var success = model.answer(cId);
            assert.ok(success === true, 'Answer is correct');
        }
        else {
            var randomIndex = getRandomArbitrary(0,quiz[i].answer.options.length-1);
            var rId = quiz[i].answer.options[randomIndex].id;
            var success = model.answer(rId);
            if (cId === rId) {
                assert.ok(success === true, 'Random answer was correct');
            }
            else {
                assert.ok(success === false, 'Random answer was incorrect');
            }
        }
        model.next();
    }
    assert.ok(model.get('state') === 'result', 'State result');
    var r = model.get('currentResult');
    assert.ok(!!r === true, 'final result');
    assert.ok(r.minPoints<=model.get('resultPoints') && model.get('resultPoints')<= r.maxPoints, 'final result points');
}

function checkQuizFormat(assert, model) {
    var quiz = model.attributes.quiz;
    for (var i = 0; i < quiz.length; i++) {
        var r = quiz[i];
        assert.ok(!!r.question === true, 'question');
        assert.ok(!!r.question.uiTemplate === true, 'question.uiTemplate');
        assert.ok(!!r.answer === true, 'answer');
        assert.ok(!!r.answer.uiTemplate === true, 'answer.uiTemplate');
        assert.ok(!!r.answer.type === true, 'answer.type');
        if (r.answer.type === 'radiobutton') {
            assert.ok($.isArray(r.answer.options) === true, 'answer.options is array');

            var oneOptionIsCorrect = undefined;
            for (var n = 0; n < r.answer.options.length; n++) {
                var opt = r.answer.options[n];
                assert.ok(!!opt.uiTemplate === true, 'answer.options.uiTemplate');
                if (opt.points > 0) {
                    if (oneOptionIsCorrect === undefined) {
                        oneOptionIsCorrect = true;
                    }
                    else {
                        assert.ok(false, 'Another option has points. Question=' + i);
                    }
                }
            }
            assert.ok(oneOptionIsCorrect === true, 'one option is correct');
        }
        else if (r.answer.type === 'type new type here') {
            //TODO
        }
        else {
            assert.ok(false, 'Unknown answer type');
        }
        assert.ok(!!r.explanation === true, 'explanation');
        assert.ok(!!r.explanation.uiTemplate === true, 'explanation.uiTemplate');
    }
}

function checkUnicQuestionsId(assert, model) {
    var quiz = model.attributes.quiz;
    for (var i = 0; i < quiz.length; i++) {
        if (!!quiz[i].id === true) {
            // проверим что ид не повторяются
            for (var k = 0; k < quiz.length; k++) {
                if (k!==i && quiz[i].id===quiz[k].id) {
                    assert.ok(false, 'checkUnicQuestionsId: question id must be unic');
                }
            }
        }
        else {
            assert.ok(false, 'checkUnicQuestionsId: id is not set for question');
        }

        // проверка поиска по ид
        assert.ok(!!model.getQuestionById(quiz[i].id) === true, 'getQuestionById works');
    }
}

function checkUnicOptionsId(assert, model) {
    var optionIds = [];
    for (var i = 0; i < model.attributes.quiz.length; i++) {
        if (model.attributes.quiz[i].answer.options) {
            for (var k = 0; k < model.attributes.quiz[i].answer.options.length; k++) {
                var curId = model.attributes.quiz[i].answer.options[k].id;
                if (!!curId === true) {
                    if (optionIds.indexOf(curId) < 0) {
                        optionIds.push(curId);
                    }
                    else {
                        assert.ok(false, 'checkUnicOptionsId: option id must be unic. Question index='+i);
                    }
                }
                else {
                    assert.ok(false, 'checkUnicOptionsId: id is not set for option');
                }

                // проверим что все опции возвращаются по ид
                assert.ok(!!model.getOptionById(curId, i) === true, 'getOptionById works');
            }
        }
    }
}

function checkResults(assert, model) {
    assert.ok(model.attributes.results.length === model.attributes.quiz.length + 1, 'Result count');

    // посчитаем количество очков которые можно набрать в тесте
    var maxPoints = 0;

    for (var i = 0; i < model.attributes.results.length; i++) {
        var r = model.attributes.results[i];
        assert.ok(!!r.id === true, 'Result id');
        assert.ok(!!r.title === true, 'Result title');
        assert.ok(!!r.description === true, 'Result description');
        assert.ok($.isNumeric(r.minPoints) === true, 'minpoints is numeric');
        assert.ok($.isNumeric(r.maxPoints) === true, 'maxpoints is numeric');

        if (maxPoints < r.maxPoints) {
            maxPoints = r.maxPoints;
        }

        for (var k = 0; k < model.attributes.results.length; k++) {
            var r2 = model.attributes.results[k];
            if (k != i && (
                // пересечение результатов - два способа
                (r2.minPoints<=r.minPoints && r.minPoints<=r2.maxPoints) || (r2.minPoints<=r.maxPoints && r.maxPoints<=r2.maxPoints)
                )) {
                assert.ok(false, 'Points conflict in '+ r.title+' and '+r2.title);
            }
        }

        if (!!r.id === true) {
            // проверим что ид не повторяются
            for (var k = 0; k < model.attributes.results.length; k++) {
                if (k!==i && r.id===model.attributes.results[k].id) {
                    assert.ok(false, 'checkResults: result id must be unic');
                }
            }
        }
        else {
            assert.ok(false, 'checkResults: id is not set for result');
        }

        assert.ok(model.getResultById(r.id)===r, 'getResultById');
    }

    // проверяем что для каждого значения есть результат
    for (var point = 0; point <= maxPoints; point++) {
        var r = model.getResultByPoints(point);
        assert.ok(!!r === true, 'getResultByPoints works for points='+point);
    }
}

function checkSetGetRightAnswers(assert, model) {
    var quiz = model.attributes.quiz;
    // все опции всех вопросов будут собраны а потом ставятся как верные по очереди
    var optionIds = [];

    for (var i = 0; i < quiz.length; i++) {
        assert.ok(!!model.getCorrectAnswerId(i) === true, 'Right answer exists in question='+i);
        optionIds[i] = [];

        if (quiz[i].answer.options) {
            for (var k = 0; k < quiz[i].answer.options.length; k++) {
                optionIds[i].push(quiz[i].answer.options[k].id);
            }
        }
    }

    // опции ставятся по очереди как верные ответы
    for (var i = 0; i < quiz.length; i++) {
        for (var k = 0; k < quiz[i].answer.options.length; k++) {
            var curOptionId = optionIds[i][k];
            model.setCorrectAnswer(curOptionId);
            assert.ok(model.getCorrectAnswerId(i) === curOptionId, 'Option set as correct='+curOptionId);
        }
    }
}

function checkAppScreens(assert, app, document) {
    var screens = app._screens;
    assert.ok(app.screenRoot !== null, 'checkScreens: screenRoot not null');
    assert.ok(screens.length > 0, 'checkScreens: At least one screen exist');
    assert.ok($(document).find(app.screenRoot).length > 0, 'checkScreens: Document has screenRoot='+app.screenRoot.selector);

    for (var i = 0; i < screens.length; i++) {
        checkScreen(assert, screens[i], app.screenRoot);
    }
}

function checkScreen(assert, screen, screenRoot) {
    assert.ok(screen.$el !== null, 'checkScreen: screen.$el');

    assert.ok($(screenRoot).find(screen.$el).length > 0, 'checkScreen: screen.$el in screenRoot');
}