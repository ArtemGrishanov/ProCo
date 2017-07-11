/**
 * Created by artyom.grishanov on 04.07.16.
 *
 */
var PersonalityApp = MutApp.extend({

    type: 'personality',
    model: null,
    screenRoot: $('#id-mutapp_screens'),
    questionScreens: [],
    /**
     * Схема свойств MutAppProperty в этом приложении
     */
    mutAppSchema: new MutAppSchema({
        "id=pm showBackgroundImage": {
            label: {RU: 'Показывать фоновую картинку', EN: 'Show background image'}
        },
        "id=pm quiz": {
            prototypes: ['id=pm quizProto1'],
            children: {
                "id=pm quiz.{{number}}.question.text": {

                }
            }
        },
        // селекторы можно группировать
        "id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText": {

        },
        "id=startScr backgroundImg": {

        }
    }),
    /**
     * Конструктор приложения: создание моделей и экранов
     * @param param
     */
    initialize: function(param) {
        console.log('PersonalityApp initialize');

        var tm = this.addModel(new PersonalityModel({
            application: this
        }));
        this.model = tm;

        var startScr = new StartScreen({
            model: tm,
            screenRoot: this.screenRoot
        });
        this.addScreen(startScr);

        this.model.bind('change:quiz', function() {
            this.updateQuestionScreens();
        }, this);

//        // для всех вопросов создается по отдельному экрану
//        var quiz = tm.get('quiz').value;
//        var qs = null;
//        var id = null;
//        for (var i = 0; i < quiz.length; i++) {
//            id = 'questionScreen'+i;
//            qs = new QuestionScreen({
//                id: id,
//                model: tm,
//                questionId: quiz[i].id,
//                screenRoot: this.screenRoot
//            });
//            this.addScreen(qs);
//        }
//
//        // для всех результатов по отдельному экрану
//        var results = tm.get('results');
//        var rs = null;
//        var sEntities = [];
//        for (var i = 0; i < results.length; i++) {
//            var r = results[i];
//
//            id = 'resultScreen'+i;
//            rs = new ResultScreen({
//                id: id,
//                model: tm,
//                resultId: r.id,
//                screenRoot: this.screenRoot
//            });
//            this.addScreen(rs);
//
//            // выравнивание заголовка и пояснения по вертикали
//            var viewForShare = MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']);
//            var titleView = viewForShare.find('.info_title').css('padding','0 50px 0 50px').css('margin','0');
//            var th = titleView.outerHeight(false);
//            var descView = viewForShare.find('.info_tx').css('padding','0 50px 0 50px').css('margin','0');
//            var dh = descView.outerHeight(false);
//            var ind = (this.height-dh-th)/4;
//            titleView.css('padding-top',ind+'px');
//            descView.css('padding-top',ind+'px');
//
//            // создать сущности для публикации
//            // в тесте это количество результатов
//            sEntities.push({
//                id: id,
//                title: startScr.startHeaderText,
//                description: startScr.startDescription,
//                // удалить элементы, оставить только те которые в whitelist
//                view: viewForShare,
//                imgUrl: null
//            });
//        }
//
//        this.setShareEntities(sEntities);

        // способ указания этих атрибутов уникален для каждого проекта
        this.title = this.getPropertiesBySelector('id=startScr startHeaderText');
        this.description = this.getPropertiesBySelector('id=startScr startDescription');

    },

    /**
     * Создать экраны вопросов на основе this.model.get('quiz')
     */
    updateQuestionScreens: function() {
        console.log('Question screen rendered');
        for (var i = 0; i < this.questionScreens.length; i++) {
            this.deleteScreen(this.questionScreens[i]);
        }
        this.questionScreens = [];
        var quizValue = this.model.get('quiz').getValue();
        var qs = null;
        var id = null;
        for (var i = 0; i < quizValue.length; i++) {
            id = 'questionScreen'+i;
            qs = new QuestionScreen({
                id: id,
                model: this.model,
                questionId: quizValue[i].id,
                screenRoot: this.screenRoot
            });
            this.addScreen(qs);
            this.questionScreens.push(qs);
        }
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    }
});