/**
 * Created by artyom.grishanov on 01.06.16.
 *
 */
var TestApp = MutApp.extend({

    type: 'test',

    screenRoot: $('#id-mutapp_screens'),

    /**
     * Ширина меньше которой приложение начинает адаптироваться под узкий экран
     */
    smallWidthPx: 600,

    initialize: function(param) {
        console.log('TestApp initialize');
        this.isSmallWidth = $(window).width() < this.smallWidthPx;

        // связь модели с приложением swimming test
        var tm = this.addModel(new TestModel({
            application: this
        }));

        var startScr = new StartScreen({
            model: tm,
            screenRoot: this.screenRoot
        });
        this.addScreen(startScr);

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
        var sEntities = [];
        for (var i = 0; i < results.length; i++) {
            var r = results[i];

            id = 'resultScreen'+i;
            rs = new ResultScreen({
                id: id,
                model: tm,
                resultId: r.id,
                screenRoot: this.screenRoot
            });
            this.addScreen(rs);

            // создать сущности для публикации
            // в тесте это количество результатов
            sEntities.push({
                id: id,
                title: startScr.startHeaderText,
                description: startScr.startDescription,
                // удалить элементы, оставить только те которые в whitelist
                view: MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']),
                imgUrl: null
            });
        }

        this.setShareEntities(sEntities);

        // способ указания этих атрибутов уникален для каждого проекта
        this.title = this.getPropertiesBySelector('id=startScr startHeaderText');
        this.description = this.getPropertiesBySelector('id=startScr startDescription');

    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    }
});