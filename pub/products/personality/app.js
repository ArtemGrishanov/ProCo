/**
 * Created by artyom.grishanov on 04.07.16.
 *
 */
var PersonalityApp = MutApp.extend({

    type: 'personality',
    model: null,
    screenRoot: $('#id-mutapp_screens'),
    questionScreens: [],
    resultsScreens: [],
    /**
     * Схема свойств MutAppProperty в этом приложении
     */
    mutAppSchema: new MutAppSchema({
        "id=pm randomizeQuestions": {
            label: {RU: 'Случайный порядок вопросов', EN: 'Randomize questions'},
            controls: 'OnOff',
            controlFilter: 'always'
        },
        "id=pm showBackgroundImage": {
            label: {RU: 'Показывать фоновую картинку', EN: 'Show background image'},
        },
        "id=pm quiz": {
            label: {RU:'Вопросы теста',EN:'Personality quiz'},
            prototypes: [{
                protoFunction: 'id=pm quizProto1', // функция в приложении, которая вернет новый объект
                label: {RU:'Текстовый вопрос',EN:'Text question'},
                img: 'products/test_new/i/editor/Icon-text-vopros.png'
            }],
            children: {
                "id=pm quiz.{{number}}.question.text": {
                    controls: "TextQuickInput"
                },
                "id=pm quiz.{{number}}.question.backgroundImage": {
                    label: {RU:'Фоновая картинка',EN:'Background image'},
                    controls: 'StringControl',
                    controlFilter: 'onclick'
                },
                "id=pm quiz.{{number}}.answer.options.{{number}}.text": {
                    controls: "TextQuickInput"
                }
            }
        },
        "id=pm results": {
            label: {RU:'Результаты теста',EN:'Personality results'},
            prototypes: [{
                protoFunction:'id=pm resultProto1',
                label: {RU:'Результат',EN:'Result'},
                img: null
            }],
            children: {
                "id=pm results.{{number}}.title": {
                    controls: "TextQuickInput"
                },
                "id=pm results.{{number}}.description": {
                    controls: "TextQuickInput"
                },
                "id=pm results.{{number}}.backgroundImage": {

                }
            }
        },
        // селекторы можно группировать
//        "id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText": {
//        },
        "id=startScr startHeaderText": {
            label: {RU: 'Заголовок', EN: 'Header'},
            controls: "TextQuickInput"
        },
        "id=startScr startDescription": {
            label: {RU:'Описание', EN:'Description'},
            controls: "TextQuickInput"
        },
        "id=startScr startButtonText": {
            label: {RU:'Текст кнопки', EN:'Start button text'},
            controls: "TextQuickInput"
        },
        "id=startScr shadowEnable": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(id=startScr)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "type=questions shadowEnable": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=pm startScreenBackgroundImg": {
            label: {RU:'Фоновая картинка стартового экрана',EN:'Start screen Background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(id=startScr)'
        },
        "id=pm showLogoOnStartScreen": {
            label: {RU:'Показывать лого на начальном экране',EN:'Show logo on start screen'},
            controls: 'OnOff',
            controlFilter: 'screen(id=startScr)'
        },
        "id=startScr logoPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=pm showLogoInQuestions": {
            label: {RU:'Показывать лого в вопросах',EN:'Show logo on question screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)'
        },
        "id=pm test1": { label: {RU: 'Тест', EN: 'Test1'} },
        "id=pm test2": { label: {RU: 'Тест', EN: 'Test2'} },
        "id=pm test3": { label: {RU: 'Тест', EN: 'Test3'} },
        "id=pm logoUrl": {
            label: {RU: 'Логотип', EN: 'Logo'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        ".js-start_header color": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Цвет шрифта',EN:'Font color'},
            controlFilter: 'onclick',
            controls: {
                name: "StringControl",
                view: 'ColorPicker',
                param: {
                    key1: '123',
                    key2: 'abc'
                }
            }
        },
        ".js-start_header font-size": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Размер шрифта',EN:'Font size'},
            controls: "StringControl",
            controlFilter: 'onclick'
        },
        ".js-start_header padding-top, .js-start_description padding-top": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Отступ сверху',EN:'Padding top'},
            controls: "StringControl",
            controlFilter: 'onclick'
        },
        ".js-start_header text-align, .js-start_description text-align": {
            label: {RU:'Выравнивание текста',EN:'Text-align'},
            controlFilter: 'onclick',
            controls: {
                name:"Alternative",
                view: 'altbuttons',
                param: {
                    possibleValues: [
                        {value:"left",icon:{
                            normal:"i/altern/align-left.png", selected:"i/altern/align-left-selected.png"
                        }},
                        {value:"center",icon:{
                            normal:"i/altern/align-center.png", selected:"i/altern/align-center-selected.png"
                        }},
                        {value:"right",icon:{
                            normal:"i/altern/align-right.png", selected:"i/altern/align-right-selected.png"
                        }}
                    ],
                }
            }
        },
        ".js-start_header font-family, .js-start_description font-family": {
            label: {RU:'Шрифт',EN:'Font family'},
            controlFilter: 'onclick',
            controls: {
                name:"Alternative",
                view: 'dropdown',
                param: {
                    possibleValues: ["Arial","Times New Roman"]
                }
            }
        },
        ".js-start_btn background-color": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Цвет фона кнопки',EN:'Button background color'},
            controlFilter: 'onclick',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        }

//        ".js-start_header .js-start_description .js-question_text .js-result_title .js-result_description": {
//            // TODO
//            // перечислил все классы к которым применять правила
//            // можно прописать сразу несколько правил, получается отношение "многие ко многим"
//            // это позволит делать наборы правил
//            rules: 'fontFamily fontColor fontSize textAlign paddingTop paddingBottom paddingLeft',
//        }
    }),
    /**
     * Конструктор приложения: создание моделей и экранов
     * @param param
     */
    initialize: function(param) {
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

        this.model.bind('change:results', function() {
            this.updateResultsScreens();
        }, this);

        // начальное создание экранов.
        // при десериализации нет событий change
        this.updateQuestionScreens();
        this.updateResultsScreens();

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
        this.title = this.getPropertiesBySelector('id=startScr startHeaderText')[0].value.getValue();
        this.description = this.getPropertiesBySelector('id=startScr startDescription')[0].value.getValue();

    },

    /**
     * Создать экраны вопросов на основе this.model.get('quiz')
     */
    updateQuestionScreens: function() {
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
            this.hideScreen(qs);
            this.questionScreens.push(qs);
        }
    },

    /**
     * Создать экраны вопросов на основе this.model.get('results')
     */
    updateResultsScreens: function() {
        for (var i = 0; i < this.resultsScreens.length; i++) {
            this.deleteScreen(this.resultsScreens[i]);
        }
        var sEntities = [];
        this.resultsScreens = [];
        var resultsValue = this.model.get('results').getValue();
        var rs = null;
        var id = null;
        for (var i = 0; i < resultsValue.length; i++) {
            id = 'resultScreen'+i;
            rs = new ResultScreen({
                id: id,
                model: this.model,
                resultId: resultsValue[i].id,
                screenRoot: this.screenRoot
            });
            this.addScreen(rs);
            this.hideScreen(rs);
            this.resultsScreens.push(rs);

            // выравнивание заголовка и пояснения по вертикали
            var viewForShare = MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']);
            var titleView = viewForShare.find('.info_title').css('padding','0 50px 0 50px').css('margin','0');
            var th = titleView.outerHeight(false);
            var descView = viewForShare.find('.info_tx').css('padding','0 50px 0 50px').css('margin','0');
            var dh = descView.outerHeight(false);
            var ind = (this.height-dh-th)/4;
            titleView.css('padding-top',ind+'px');
            descView.css('padding-top',ind+'px');

            // создать сущности для публикации
            // в тесте это количество результатов
            sEntities.push({
                id: id,
                title: this.startHeaderText,
                description: this.startDescription,
                // удалить элементы, оставить только те которые в whitelist
                view: viewForShare,
                imgUrl: null
            });
        }
        this.setShareEntities(sEntities);
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    }
});