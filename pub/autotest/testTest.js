/**
 * Created by artyom.grishanov on 20.07.16.
 */

QUnit.test("Specproject Test", function( assert ) {

    var SwimmingTest = MutApp.extend({

        //TODO пока для отладки использую готовые тесты
        // верстка разумеется будет новая
        screenRoot: $('#id-swimming_test'),

        initialize: function(param) {
            console.log('Swimming test created');

            // связь модели с приложением swimming test
            var tm = this.addModel(new TestModel({
                application: this
            }));

            this.addScreen(new StartScreen({
                model: tm,
                screenRoot: this.screenRoot
            }));

            // для всех вопросов создается по отдельному экрану
            var quiz = tm.get('quiz');
            var qs = null;
            var id = null;
            for (var i = 0; i < quiz.length; i++) {
                id = 'questionScreen'+i;
                qs = new QuestionScreen({
                    id: id,
                    model: tm,
                    questionId: quiz[i].id,
                    screenRoot: this.screenRoot
                });
                this.addScreen(qs);
            }

            // для всех результатов по отдельному экрану
            var results = tm.get('results');
            var rs = null;
            for (var i = 0; i < results.length; i++) {
                id = 'resultScreen'+i;
                rs = new ResultScreen({
                    id: id,
                    model: tm,
                    resultId: results[i].id,
                    screenRoot: this.screenRoot
                });
                this.addScreen(rs);
            }
        },

        start: function() {
            this._models[0].start();
        }
    });

    var testApp = new SwimmingTest({
        width: 1000,
        height: 500,
        defaults: {}
    });
    var model = testApp._models[0];
    assert.ok(!!testApp === true, 'app exists');
    assert.ok(!!model === true, 'model exists');

    var quiz = model.get('quiz');
    checkUnicQuestionsId(assert, quiz);
    checkUnicOptionsId(assert, quiz);

    var results = model.get('results');
    checkResults(assert, quiz, results);
});

function checkUnicQuestionsId(assert, quiz) {
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
    }
}

function checkUnicOptionsId(assert, quiz) {
    var optionIds = [];
    for (var i = 0; i < quiz.length; i++) {
        if (quiz[i].answer.options) {
            for (var k = 0; k < quiz[i].answer.options.length; k++) {
                var curId = quiz[i].answer.options[k].id;
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
            }
        }
    }
}

function checkResults(assert, quiz, results) {
    assert.ok(results.length === quiz.length + 1, 'Result count');

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        assert.ok(!!r.title === true, 'Result title');
        assert.ok(!!r.description === true, 'Result description');

        for (var k = 0; k < results.length; k++) {
            var r2 = results[k];
            if (k != i && (
                // пересечение результатов - два способа
                (r2.minPoints<=r.minPoints && r.minPoints<=r2.maxPoints) || (r2.minPoints<=r.maxPoints && r.maxPoints<=r2.maxPoints)
                )) {
                assert.ok(false, 'Points conflict in '+ r.title+' and '+r2.title);
            }
        }
    }
}