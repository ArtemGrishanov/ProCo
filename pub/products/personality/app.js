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
        "appConstructor=mutapp shareEntities.{{id}}.imgUrl": {
            // это свойство описано в клиентской части а не в mutapp.js так как фильтр по экрану может указать только клиент
            label: {RU: 'Картинка для шаринга', EN: 'Sharing image'},
            controls: 'ChooseSharingImage',
            controlFilter: 'screenPropertyString' // клиент знает какие экраны есть в приложении
        },
        "id=pm logoLink": {
            label: {RU: 'Ссылка по клику на лого', EN: 'Logo click link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=pm downloadLink": {
            label: {RU: 'Ссылка по кнопке "Скачать"', EN: 'Download button link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=pm randomizeQuestions": {
            label: {RU: 'Случайный порядок вопросов', EN: 'Randomize questions'},
            controls: 'OnOff',
            controlFilter: 'always'
        },
        "id=pm resultLinking": {
            label: {RU: 'Привязка результатов к ответам', EN: 'Linking results'},
            controls: 'PersonalityResultLinking',
            controlFilter: 'onclick'
        },
        "id=pm quiz": {
            label: {RU:'Вопросы теста',EN:'Personality quiz'},
            prototypes: [
                {
                    protoFunction: 'id=pm quizProto1', // функция в приложении, которая вернет новый объект
                    label: {RU:'Текстовый вопрос',EN:'Text question'},
                    img: '//p.testix.me/images/products/personality/editor/Icon-text-vopros.png'
                },
                {
                    protoFunction: 'id=pm quizProto2', // функция в приложении, которая вернет новый объект
                    label: {RU:'Фото вопрос',EN:'Photo question'},
                    img: '//p.testix.me/images/products/personality/editor/Icon-fotovopros.png'
                },
                {
                    protoFunction: 'id=pm quizProto3', // функция в приложении, которая вернет новый объект
                    label: {RU:'Фото ответы',EN:'Photo answers'},
                    img: '//p.testix.me/images/products/personality/editor/Icon-fotootvet.png'
                }
            ],
            children: {
                "id=pm quiz.{{id}}.question.text": {
                    controls: "TextQuickInput"
                },
                "id=pm quiz.{{id}}.question.questionImage": {
                    label: {RU:'Картинка вопроса',EN:'Question image'},
                    controls: 'ChooseImage',
                    controlFilter: 'screenPropertyString'
                },
                "id=pm quiz.{{id}}.question.backgroundImage": {
                    label: {RU:'Фоновая картинка',EN:'Background image'},
                    controls: 'ChooseImage',
                    controlFilter: 'screenPropertyString'
                },
                "id=pm quiz.{{id}}.question.backgroundColor": {
                    label: {RU:'Цвет фона экрана',EN:'Screen background color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'screenPropertyString'
                },
                "id=pm quiz.{{id}}.answer.options": {
                    controls: ["AddDictionaryElementControl","DeleteDictionaryElementControl"],
                    prototypes: [
                        {
                            protoFunction: 'id=pm proto_optionText',
                            label: '',
                            img: ''
                        },
                        {
                            protoFunction: 'id=pm proto_optionPhoto',
                            label: '',
                            img: ''
                        }
                    ]
                },
                "id=pm quiz.{{id}}.answer.options.{{id}}.text": {
                    controls: "TextQuickInput"
                },
                "id=pm quiz.{{id}}.answer.options.{{id}}.img": {
                    label: {RU:'Картинка вопроса',EN:'Question image'},
                    controls: 'ChooseImage',
                    controlFilter: "onclick"
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
                "id=pm results.{{id}}.title": {
                    controls: "TextQuickInput"
                },
                "id=pm results.{{id}}.description": {
                    controls: "TextQuickInput"
                },
                "id=pm results.{{id}}.backgroundImage": {
                    label: {RU:'Фоновая картинка',EN:'Background image'},
                    controls: 'ChooseImage',
                    controlFilter: 'screenPropertyString'
                },
                "id=pm results.{{id}}.backgroundColor": {
                    label: {RU:'Цвет фона',EN:'Background Color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'screenPropertyString'
                },
                "id=pm results.{{id}}.titleColor": {
                    label: {RU:'Цвет заголовка',EN:'Title color'},
                    controls: {
                        name: "StringControl",
                        view: 'ColorPicker'
                    },
                    controlFilter: 'onclick'
                },
                "id=pm results.{{id}}.descriptionColor": {
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
        "id=pm restartButtonText": {
            controls: "TextQuickInput"
        },
        "id=pm downloadButtonText": {
            controls: "TextQuickInput"
        },
        "id=pm showDownload": {
            label: {RU:'Кнопка "Скачать"', EN:'Download button'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=startScr shadowEnable": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(id=startScr)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=pm shadowEnableInQuestions": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=pm shadowEnableInResults": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=pm startScreenBackgroundImg": {
            label: {RU:'Фоновая картинка стартового экрана',EN:'Start screen background image'},
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
        "id=pm logoPositionInQuestions": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=pm questionProgressPosition": {
            label: {},
            controls: {
                name: 'Drag',
                    param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=pm logoPositionInResults": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=pm showQuestionProgress": {
            label: {RU:'Счетчик вопросов',EN:'Question number'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)'
        },
        "id=pm showLogoInQuestions": {
            label: {RU:'Показывать лого в вопросах',EN:'Show logo on question screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=questions)'
        },
        "id=pm showLogoInResults": {
            label: {RU:'Показывать лого в результатах',EN:'Show logo on result screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=pm fbSharingEnabled": {
            label: {RU:'Шаринг в Facebook',EN:'Facebook sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=pm vkSharingEnabled": {
            label: {RU:'Шаринг во ВКонтакте',EN:'Vk.com sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=pm fbSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=pm vkSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=pm logoUrl": {
            label: {RU: 'Логотип', EN: 'Logo'},
            controls: 'ChooseImage',
            controlFilter: 'always'
        },

        "id=pm test1": { label: {RU: 'Тест', EN: 'Test1'} },
        "id=pm test2": { label: {RU: 'Тест', EN: 'Test2'} },
        "id=pm test3": { label: {RU: 'Тест', EN: 'Test3'} },

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
            valuePattern: '{{number}}px'
        },
        ".js-start_header padding-top, .js-start_description padding-top, .js-question_text padding-top, .js-result_title padding-top, .js-result_description padding-top, .js-btn_wr padding-top": {
            label: {RU:'Отступ сверху',EN:'Padding top'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px'
        },
        ".js-start_header padding-bottom, .js-start_description padding-bottom, .js-question_text padding-bottom, .js-result_title padding-bottom, .js-result_description padding-bottom": {
            label: {RU:'Отступ снизу',EN:'Padding bottom'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px'
        },
        ".js-photo padding-top": {
            label: {RU:'Отступ сверху',EN:'Padding top'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            applyCssToSelector: '.js-photo_cnt' // опционально: применить стиль padding-top к другому элементу, в данном случае к родителю
        },
        ".js-photo padding-bottom": {
            label: {RU:'Отступ снизу',EN:'Padding bottom'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            applyCssToSelector: '.js-photo_cnt' // опционально: применить стиль padding-bottom к другому элементу, в данном случае к родителю
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
                if (MutApp.Util.matchPropertyString(data.propertyString, 'id=pm quiz.{{id}}.answer.options') === true ||
                    data.propertyString === 'id=pm quiz' ||
                    data.propertyString === 'id=pm results') {
                    // при изменении любых свойств которые влияют на привязки нужно делать апдейт
                    if (this.model) this.model.updateResultLinking();
                }
                if (data.propertyString === 'id=pm results') {
                    if (this.model) this.model.updateShareEntities();
                }
                if (MutApp.Util.matchPropertyString(data.propertyString, 'id=pm results.{{id}}.title') === true ||
                    MutApp.Util.matchPropertyString(data.propertyString, 'id=pm results.{{id}}.description') === true) {
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
        var prbs = this.model.getResultProbabilities();
        // специальный табличный формат данных требуемый по https://developers.google.com/chart/interactive/docs/gallery/piechart
        var visualizationData = [
            ['Result', 'Probability']
            // ['Work',     11],
            // ['Eat',      2],
        ];
        for (var resultId in prbs) {
            if (prbs.hasOwnProperty(resultId) === true) {
                var r = this.model.getResultById(resultId);
                //msg += 'Результат: \''+ r.title.getValue()+'\': '+Math.round(prbs[resultId]*100)+'%<br>';
                visualizationData.push([r.title.getValue(), Math.round(prbs[resultId]*100)]);
            }
        }
        //var visualizationTitle = '{EN:\'Result propabilities\',RU:\'Вероятности результатов\'}';
        var visualizationTitle = 'Result propabilities';
        var visualizationType = 'PieChart';
        res.push({
            type: 'info',
            message: 'Below you can see result probabilities based on your option links',
            html: null,
            visualization: {
                data: visualizationData,
                title: visualizationTitle,
                type: visualizationType
            }
        });

        // ==========================================
        // Информация о не связанных ни с чем опций
        // ==========================================
        var resultLinkingArr = this.model.attributes.resultLinking.toArray();
        for (var k = 0; k < resultLinkingArr.length; k++) {
            var rl = resultLinkingArr[k];
            if (rl.strongLinks.length === 0 && rl.weakLinks.length === 0) {
                var opt = this.model.getOptionById(rl.optionId);
                if (opt.text) {
                    res.push({
                        type: 'warning',
                        message: 'Option \''+opt.text.getValue()+'\' has no result links. Perhaps, you forgot to link it to result.'
                    });
                }
                else if (opt.img) {
                    res.push({
                        type: 'warning',
                        message: 'Image option has no result links. Perhaps, you forgot to link it to result.',
                        html: '<img src="'+opt.img.getValue()+'" width="200px" height="200px"/>'
                    });
                }
            }
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