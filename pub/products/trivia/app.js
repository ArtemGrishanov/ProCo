/**
 * Created by artyom.grishanov on 01.06.16.
 *
 */
var TriviaApp = MutApp.extend({

    type: 'trivia',
    model: null,
    screenRoot: $('#id-mutapp_screens'),
    questionScreens: [],
    resultsScreens: [],
    /**
     * Схема свойств MutAppProperty в этом приложении
     */
    mutAppSchema: new MutAppSchema({
        "appConstructor=mutapp shareEntities.{{id}}.imgUrl": {
            // Важно: это свойство описано в клиентской части а не в mutapp.js так как фильтр по экрану может указать только клиент
            label: {RU: 'Картинка для шаринга', EN: 'Sharing image'},
            controls: 'ChooseSharingImage',
            controlFilter: 'screenPropertyString' // клиент знает какие экраны есть в приложении
        },
        "id=tm logoLink": {
            label: {RU: 'Ссылка по клику на лого', EN: 'Logo click link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=tm downloadLink": {
            label: {RU: 'Ссылка по кнопке "Скачать"', EN: 'Download button link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=tm randomizeQuestions": {
            label: {RU: 'Случайный порядок вопросов', EN: 'Randomize questions'},
            controls: 'OnOff',
            controlFilter: 'always'
        },
        "id=tm optionPoints": {
            label: {RU: 'Назначение верных ответов', EN: 'Option Points'},
            controls: 'TriviaOptionPoints'
        },
        "id=tm quiz": {
            label: {RU:'Вопросы теста',EN:'Trivia quiz'},
            prototypes: [
                {
                    protoFunction: 'id=tm quizProto1', // функция в приложении, которая вернет новый объект
                    label: {RU:'Текстовый вопрос',EN:'Text question'},
                    img: '//p.testix.me/images/products/trivia/editor/Icon-text-vopros.png'
                },
                {
                    protoFunction: 'id=tm quizProto2', // функция в приложении, которая вернет новый объект
                    label: {RU:'Фото вопрос',EN:'Photo question'},
                    img: '//p.testix.me/images/products/trivia/editor/Icon-fotovopros.png'
                },
                {
                    protoFunction: 'id=tm quizProto3', // функция в приложении, которая вернет новый объект
                    label: {RU:'Фото ответы',EN:'Photo answers'},
                    img: '//p.testix.me/images/products/trivia/editor/Icon-fotootvet.png'
                }
            ],
            children: {
                "id=tm quiz.{{id}}.question.text": {
                    controls: "TextQuickInput"
                },
                "id=tm quiz.{{id}}.question.questionImage": {
                    label: {RU:'Картинка вопроса',EN:'Question image'},
                    controls: {
                        name: 'ChooseImage',
                        param: {
                            deleteEnable: false
                        }
                    },
                    controlFilter: 'screenPropertyString'
                },
                "id=tm quiz.{{id}}.question.backgroundImage": {
                    label: {RU:'Фоновая картинка',EN:'Background image'},
                    controls: 'ChooseImage',
                    controlFilter: 'screenPropertyString'
                },
                "id=tm quiz.{{id}}.question.backgroundColor": {
                    label: {RU:'Цвет фона экрана',EN:'Screen background color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'screenPropertyString'
                },
                "id=tm quiz.{{id}}.answer.options": {
                    controls: ["AddDictionaryElementControl","DeleteDictionaryElementControl"],
                    prototypes: [
                        {
                            protoFunction: 'id=tm proto_optionText',
                            label: '',
                            img: ''
                        },
                        {
                            protoFunction: 'id=tm proto_optionPhoto',
                            label: '',
                            img: ''
                        }
                    ]
                },
                "id=tm quiz.{{id}}.answer.options.{{id}}.text": {
                    controls: "TextQuickInput"
                },
                "id=tm quiz.{{id}}.answer.options.{{id}}.img": {
                    label: {RU:'Картинка вопроса',EN:'Question image'},
                    controls: {
                        name: 'ChooseImage',
                        param: {
                            deleteEnable: false
                        }
                    },
                    controlFilter: "onclick"
                },
                "id=tm quiz.{{id}}.answer.options.{{id}}.feedbackText": {
                    // в отличие от PersonalityResultLinking (custom popup) это разные свойства, а не одно, но визуально леер popup один и тот же
                    controls: "TriviaTextFeedback"
                }
            }
        },
        "id=tm results": {
            label: {RU:'Результаты теста',EN:'Trivia results'},
            prototypes: [{
                protoFunction:'id=tm resultProto1',
                label: {RU:'Результат',EN:'Result'},
                img: null
            }],
            children: {
                "id=tm results.{{id}}.title": {
                    controls: "TextQuickInput"
                },
                "id=tm results.{{id}}.description": {
                    controls: "TextQuickInput"
                },
                "id=tm results.{{id}}.backgroundImage": {
                    label: {RU:'Фоновая картинка',EN:'Background image'},
                    controls: 'ChooseImage',
                    controlFilter: 'screenPropertyString'
                },
                "id=tm results.{{id}}.backgroundColor": {
                    label: {RU:'Цвет фона',EN:'Background Color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'screenPropertyString'
                },
                "id=tm results.{{id}}.titleColor": {
                    label: {RU:'Цвет заголовка',EN:'Title color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'onclick'
                },
                "id=tm results.{{id}}.descriptionColor": {
                    label: {RU:'Цвет пояснения',EN:'Description color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'onclick'
                }
            }
        },
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
        "id=tm restartButtonText": {
            controls: "TextQuickInput"
        },
        "id=tm downloadButtonText": {
            controls: "TextQuickInput"
        },
        "id=tm showExplanation": {
            label: {RU:'Показывать верный был дан ответ или нет', EN:'Show answer was correct or not'},
            controls: 'OnOff',
            controlFilter: 'always'
        },
        "id=tm showDownload": {
            label: {RU:'Кнопка "Скачать"', EN:'Download button'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=startScr shadowEnable": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(id=startScr)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=tm shadowEnableInQuestions": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=tm shadowEnableInResults": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=tm startScreenBackgroundImg": {
            label: {RU:'Фоновая картинка стартового экрана',EN:'Start screen background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(id=startScr)'
        },
        "id=tm showLogoOnStartScreen": {
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
        "id=tm logoPositionInQuestions": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=tm questionProgressPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=tm logoPositionInResults": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=tm showQuestionProgress": {
            label: {RU:'Счетчик вопросов',EN:'Question number'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)'
        },
        "id=tm showLogoInQuestions": {
            label: {RU:'Показывать лого в вопросах',EN:'Show logo on question screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)'
        },
        "id=tm showLogoInResults": {
            label: {RU:'Показывать лого в результатах',EN:'Show logo on result screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=tm fbSharingEnabled": {
            label: {RU:'Шаринг в Facebook',EN:'Facebook sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=tm vkSharingEnabled": {
            label: {RU:'Шаринг во ВКонтакте',EN:'Vk.com sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=tm fbSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=tm vkSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=tm logoUrl": {
            label: {RU: 'Логотип', EN: 'Logo'},
            controls: {
                name: 'ChooseImage',
                param: {
                    deleteEnable: false
                }
            },
            controlFilter: 'always'
        },

        "id=tm test1": { label: {RU: 'Тест', EN: 'Test1'} },
        "id=tm test2": { label: {RU: 'Тест', EN: 'Test2'} },
        "id=tm test3": { label: {RU: 'Тест', EN: 'Test3'} },

        ".js-start_header color, .js-start_description color, .js-start_btn color, .js-download_btn color, .js-restart color, .js-question_text color, .js-option_text color, .js-question_progress color": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Цвет шрифта',EN:'Font color'},
            controlFilter: 'onclick',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        },
        ".js-start_back_color background-color": {
            label: {RU:'Цвет фона экрана',EN:'Screen background color'},
            controlFilter: 'screen(id=startScr)',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        },
        ".js-start_header font-size, .js-start_description font-size, .js-question_text font-size, .js-result_title font-size, .js-result_description font-size, .js-option_text font-size, .js-question_progress font-size": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Размер шрифта',EN:'Font size'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 8,
            maxValue: 80
        },
        ".js-start_header padding-top, .js-start_description padding-top, .js-question_text padding-top, .js-result_title padding-top, .js-result_description padding-top, .js-btn_wr padding-top": {
            label: {RU:'Отступ сверху',EN:'Padding top'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 0,
            maxValue: 500
        },
        ".js-start_header padding-bottom, .js-start_description padding-bottom, .js-question_text padding-bottom, .js-result_title padding-bottom, .js-result_description padding-bottom": {
            label: {RU:'Отступ снизу',EN:'Padding bottom'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 0,
            maxValue: 500
        },
        ".js-photo padding-top": {
            label: {RU:'Отступ сверху',EN:'Padding top'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            applyCssToSelector: '.js-photo_cnt', // опционально: применить стиль padding-top к другому элементу, в данном случае к родителю
            minValue: 0,
            maxValue: 500
        },
        ".js-photo padding-bottom": {
            label: {RU:'Отступ снизу',EN:'Padding bottom'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            applyCssToSelector: '.js-photo_cnt', // опционально: применить стиль padding-bottom к другому элементу, в данном случае к родителю

        },
        ".js-start_header text-align, .js-start_description text-align, .js-question_text text-align, .js-result_title text-align, .js-result_description text-align": {
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
        ".js-start_header font-family, .js-start_description font-family, .js-question_progress font-family, .js-question_text font-family, .js-result_title font-family, .js-result_description font-family": {
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
        ".js-start_btn background-color, .js-download_btn background-color, .js-restart background-color": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Цвет фона кнопки',EN:'Button background color'},
            controlFilter: 'onclick',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        },
        ".js-a_wr border-width": {
            label: {RU:'Толщина обводки',EN:'Border width'},
            controls: "StringControl",
            controlFilter: 'onclick'
        },
        ".js-a_wr border-color": {
            label: {RU:'Цвет обводки',EN:'Border color'},
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            },
            controlFilter: 'onclick'
        },
        ".js-a_wr border-radius": {
            label: {RU:'Радиус угла',EN:'Border radius'},
            controls: "StringControl",
            controlFilter: 'onclick'
        },
        ".js-a_wr background-color": {
            label: {RU:'Цвет фона опции',EN:'Option background color'},
            controls: "StringControl",controls: {
                name: "StringControl",
                view: 'ColorPicker'
            },
            controlFilter: 'onclick'
        }
    }),

    /**
     * Конструктор приложения
     * @param param
     */
    initialize: function(param) {
        var tm = this.addModel(new TriviaModel({
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
            this.model.updateShareEntities();
            this.updateResultsScreens();
        }, this);

        // начальное создание экранов.
        // при десериализации нет событий change
        this.updateQuestionScreens();
        this.model.updateShareEntities();
        this.updateResultsScreens();

        // способ указания этих атрибутов уникален для каждого проекта
        this.title = this.getPropertiesBySelector('id=startScr startHeaderText')[0].value.getValue();
        this.description = this.getPropertiesBySelector('id=startScr startDescription')[0].value.getValue();

    },

    /**
     * Создать экраны вопросов на основе this.model.get('quiz')
     */
    updateQuestionScreens: function() {
        // до пересборки экранов запоминаем ид показанного экрана, чтобы потом его восстановить
        var shownScreenId = this.getShownScreenId();

        for (var i = 0; i < this.questionScreens.length; i++) {
            this.deleteScreen(this.questionScreens[i]);
        }
        this.questionScreens = [];
        var quizValue = this.model.get('quiz').toArray();
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

        if (this.model.attributes.lastAddedQuestionDictinatyId) {
            var scrId = this.getScreenIdByDictionaryId(this.model.attributes.lastAddedQuestionDictinatyId);
            if (scrId) {
                this.requestScreenSelection(scrId);
                this.model.set({
                    lastAddedQuestionDictinatyId: null
                });
            }
            else {
                throw new Error('TriviaApp.updateQuestionScreens: can not find screen with dictionaryId \''+this.model.attributes.lastAddedQuestionDictinatyId+'\'');
            }
        }
        else if (shownScreenId) {
            this.requestScreenSelection(shownScreenId);
        }
    },

    /**
     * Создать экраны вопросов на основе this.model.get('results')
     */
    updateResultsScreens: function() {
        // до пересборки экранов запоминаем ид показанного экрана, чтобы потом его восстановить
        var shownScreenId = this.getShownScreenId();

        for (var i = 0; i < this.resultsScreens.length; i++) {
            this.deleteScreen(this.resultsScreens[i]);
        }
        var sEntities = [];
        this.resultsScreens = [];
        var resultsValue = this.model.get('results').toArray();
        var rs = null;
        var id = null;
        var resDictId = null;
        for (var i = 0; i < resultsValue.length; i++) {
            resDictId = this.model.get('results').getIdFromPosition(i);
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
        }

        if (this.model.attributes.lastAddedResultDictinatyId) {
            var scrId = this.getScreenIdByDictionaryId(this.model.attributes.lastAddedResultDictinatyId);
            if (scrId) {
                this.requestScreenSelection(scrId);
                this.model.set({
                    lastAddedResultDictinatyId: null
                });
            }
            else {
                throw new Error('TriviaApp.updateResultsScreens: can not find screen with dictionaryId \''+this.model.attributes.lastAddedResultDictinatyId+'\'');
            }
        }
        else if (shownScreenId) {
            this.requestScreenSelection(shownScreenId);
        }
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    },

    /**
     * Обработчик событий приложения MutApp
     * Любое клиентское приложение может определить такую функцию
     *
     * @param {string} event
     * @param {object} data
     */
    onAppEvent: function(event, data) {
        switch(event) {
            case MutApp.EVENT_PROPERTY_CREATED:
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED:
            case MutApp.EVENT_PROPERTY_DELETED: {
                if (MutApp.Util.matchPropertyString(data.propertyString, 'id=tm quiz.{{id}}.answer.options') === true ||
                    data.propertyString === 'id=tm quiz') {
                    // при изменении любых свойств которые влияют на распределение результатов нужно делать апдейт
                    if (this.model) {
                        this.model.updateOptionPoints();
                    }
                }
                if (data.propertyString === 'id=tm optionPoints' ||
                    data.propertyString === 'id=tm results') {
                    // распределение результатов по баллам. Зависит вот от эти двух свойств
                    if (this.model) {
                        this.model.updateResultPointsAllocation();
                    }
                }
                if (data.propertyString === 'id=tm results') {
                    // это событие вызывается позже чем от модели (где идет updateResultScreens())
                    // перенес рядом с вызовом updateResultScreens
                    // if (this.model) this.model.updateShareEntities();
                }
                if (MutApp.Util.matchPropertyString(data.propertyString, 'id=tm results.{{id}}.title') === true ||
                    MutApp.Util.matchPropertyString(data.propertyString, 'id=tm results.{{id}}.description') === true) {
                    // при изменении текстов результата обновляем тексты в словаре shareEntity
                    if (this.model) {
                        this.model.updateShareEntities();
                    }
                }
                break;
            }
        }
    },

    /**
     * Вернуть ид экрана который показан в данный момент
     * Будет возвращен первый найденный показанный экран
     *
     * @returns {string}
     */
    getShownScreenId: function() {
        for (var i = 0; i < this._screens.length; i++) {
            var scr = this._screens[i];
            if (scr.isShowed === true) {
                return scr.id;
            }
        }
        return null;
    },

    /**
     * Найти экран по dictionaryId
     * Можно и типа question и result
     *
     * @param dictionaryId
     * @returns {*}
     */
    getScreenIdByDictionaryId: function(dictionaryId) {
        for (var i = 0; i < this._screens.length; i++) {
            var scr = this._screens[i];
            if (scr.dictionaryId === dictionaryId) {
                return scr.id;
            }
        }
        return null;
    },

    /**
     * Определить dictionaryId вопроса, который пользователь в данный момент видит на экране
     *
     * @returns {string}
     */
    getCurrentQuestionDictionaryId: function() {
        var pos = -1;
        for (var i = 0; i < this._screens.length; i++) {
            var scr = this._screens[i];
            if (scr.isShowed === true && scr.dictionaryId) {
                return scr.dictionaryId;
            }
        }
        if (this.autotesting === false) {
            throw new Error('Personality.getCurrentQuestionDictionaryId: can not detect question dictionaryId');
        }
    },

    /**
     * Информация о приложении
     *
     * Для локализации слежует использовать конструкции вида:
     * {EN: '', RU: ''}
     */
    getStatus: function() {
        var res = [];

        // ==========================================
        // Информация о распределении результатов
        // ==========================================
        var visualizationData = [
            // [points, resultId]
        ];
        var visualizationType = 'TriviaChart';
        for (var points in this.model.attributes.resultPointsAllocation) {
            var resultId = this.model.attributes.resultPointsAllocation[points];
            var result = this.model.getResultById(resultId);
            visualizationData.push([
                points,
                MutApp.Util.clearHtmlSymbols(result.title.getValue())
            ]);
        }
        res.push({
            type: 'info',
            title: {RU:'Диаграмма результатов',EN:'Result diagram'},
            message: {RU:'На диаграмме показано соответствие количества правильных ответов и результатов',EN:'Number of correct answers and results'},
            html: null,
            visualization: {
                data: visualizationData,
                title: 'title',
                type: visualizationType
            }
        });

        // ==========================================
        // не назначенные верными ответы
        // ==========================================
        var noCorrectOptionsHtml = '';
        var quizValue = this.model.attributes.quiz.toArray();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options.toArray();
            var correctOptionFound = false;
            // найти опцию и поставить ей балл
            for (var n = 0; n < options.length; n++) {
                if (this.model.getOptionPointsInfo(options[n].id).points > 0) {
                    correctOptionFound = true;
                    break;
                }
            }
            if (correctOptionFound === false) {
                noCorrectOptionsHtml += '<li>«'+quizValue[i].question.text.getValue().substr(0, 15)+'»</li>';
            }
        }
        if (noCorrectOptionsHtml.length > 0) {
            noCorrectOptionsHtml = '<ul>'+noCorrectOptionsHtml+'</ul>';
            res.push({
                type: 'warning',
                message: {RU:'Для этих вопросов не указан верный ответ:',EN:'No correct options in these questions:'},
                html: noCorrectOptionsHtml
            });
        }

        return res;
    },

    /**
     * Вернуть фрагмен html из которго будет сгенерирована картинка
     *
     * @returns {*}
     */
    getAutoPreviewHtml: function() {
        if (this._screens.length > 0) {
            var v = this.getScreenById('startScr').$el;
            // выравнивание заголовка и пояснения по вертикали
            var viewForShare = MutApp.Util.clarifyElement(v, ['modal','modal_cnt','info_title','info_tx','b_title']);
            var titleView = viewForShare.find('.info_title').css('padding','0 50px 0 50px').css('margin','0');
            var th = titleView.outerHeight(false);
            var descView = viewForShare.find('.info_tx').css('padding','0 50px 0 50px').css('margin','0');
            var dh = descView.outerHeight(false);
            var freeVertSpace = (this.getSize().height-dh-th);
            titleView.css('padding-top',freeVertSpace*0.35+'px');
            descView.css('padding-top',freeVertSpace*0.1+'px');
            return viewForShare.html();
        }
        return '';
    }
});