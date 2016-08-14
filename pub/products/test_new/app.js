/**
 * Created by artyom.grishanov on 01.06.16.
 *
 */
var TestApp = MutApp.extend({

    type: 'test',

    //TODO пока для отладки использую готовые тесты
    // верстка разумеется будет новая
    screenRoot: $('#id-swimming_test'),

    initialize: function(param) {
        console.log('TestApp initialize');
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