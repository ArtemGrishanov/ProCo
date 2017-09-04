/**
 * Created by artyom.grishanov on 01.06.16.
 *
 */
var TestApp = MutApp.extend({

    type: 'test',

    screenRoot: $('#id-mutapp_screens'),

    initialize: function(param) {
        console.log('TestApp initialize');

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

            // выравнивание заголовка и пояснения по вертикали
            var viewForShare = MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']);
            var titleView = viewForShare.find('.info_title').css('padding','0 75px 0 10px').css('margin','0');
            var th = titleView.outerHeight(false);
            var descView = viewForShare.find('.info_tx').css('padding','0 10px 0 75px').css('margin','0');
            var dh = descView.outerHeight(false);
            var ind = (this.height-dh-th)/4;
            titleView.css('padding-top',ind+'px');
            descView.css('padding-top',ind+'px');

            // создать сущности для публикации
            // в тесте это количество результатов
            sEntities.push({
                id: id,
                title: startScr.startHeaderText,
                description: startScr.startDescription,
                // удалить элементы, оставить только те которые в whitelist
                view: viewForShare,
                imgUrl: null
            });
        }

        this.setShareEntities(sEntities);

        // способ указания этих атрибутов уникален для каждого проекта
        this.title = this.getPropertiesBySelector('id=startScr startHeaderText')[0].value;
        this.description = this.getPropertiesBySelector('id=startScr startDescription')[0].value;

    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    }
});