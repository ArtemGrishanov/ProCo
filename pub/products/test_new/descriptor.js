/**
 * Created by artyom.grishanov on 17.02.16.
 *
 */
var descriptor = {};

descriptor.css = [
    /*{
        // такая конструкция не имеет смысла
        selector: '.js-startHeader',
        label: 'Верхний заголовок',
    },
    {
        //  так можно, определять свойства сразу здесь
        selector: '.js-startHeader',
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
        },
        label: 'Скругление углов',
        cssProperty: 'border-radius',
        filter: true
    },*/
    {
        // перечислил все классы к которым применять правила
        selector: '.js-start_header .js-start_description .js-question_text .js-result_title .js-result_description',
        // можно прописать сразу несколько правил, получается отношение "многие ко многим"
        // это позволит делать наборы правил
        rules: 'fontFamily fontColor fontSize textAlign paddingTop paddingBottom paddingLeft'
    },
    {
        selector: '.js-option_text',
        rules: 'fontFamily fontColor fontSize'
    },
    {
        selector: '.js-option_text',
        rules: 'textAlign',
        applyCssTo: '.js-a_wr'
    },
//    сомнительные настройки js-answers_wr: неконсистентно, кривое выделение, дублирование с тем что внутри
//    {
//        selector: '.js-answers_wr',
//        rules: 'textAlign fontFamily fontColor fontSize marginTop marginBottom paddingLeft'
//    },
    {
        // не объединяем с остальными текстами, так как нельзя выравнивать
        selector: '.js-question_progress',
        rules: 'fontFamily fontColor fontSize'
    },
    {
        // все кнопки
        selector: '.js-test_btn',
        rules: 'backgroundColor fontColor fontSize fontFamily borderColor borderRadius borderWidth paddingTop paddingBottom'
    },
    {
        selector: '.js-test_btn',
        applyCssTo: '.js-btn_wr',
        rules: 'textAlign marginTop marginBottom paddingLeft'
    },
    {
        selector: '.js-photo',
        rules: 'textAlign marginTop marginBottom',
        // выделяться будет .js-photo, пользователь работает как-бы с ним
        // но на самом деле свойства применяются к .js-photo_cnt
        applyCssTo: '.js-photo_cnt'
    },
//    {
//        // все кнопки в состоянии наведения
//        selector: '.js-test_btn',
//        rules: 'hoverBackgroundColor hoverFontColor hoverBorderColor',
//        applyCssTo: '.js-test_btn:hover'
//    },
    {
        selector: '.bullit',
        rules: 'borderWidth borderColor'
    },
//    {js-a_wr
//    {
//        selector: '.js-a_wr:hover',
//        rules: 'hoverBorderWidth hoverBorderColor',
//        applyCssTo: '.js-a_wr'
//    },
    {
        selector: '.js-a_wr',
        rules: 'borderWidth borderColor backgroundColor borderRadius'
    },
    {
        selector: '.topColontitle',
        rules: 'topColontitleBottomBorderColor fontColor fontSize fontFamily textAlign backgroundColor paddingTop paddingBottom'
    },
    {
        selector: '.js-back_color',
        label: 'Цвет фона теста',
        filter: false,
        rules: 'backgroundColor'
    }
];

descriptor.app = [
    {
        selector: 'id=startScr logoPosition, type=questions logoPosition, type=result logoPosition, type=result fbSharePosition',
        rules: 'drag'
    },
    {
        selector: 'id=tm questionProgressPosition',
        updateScreens: true, // потому что в рамках одной сессии надо менять позицию этого элемента на нескольких экранах
        rules: 'drag'
    },
    {
        selector: 'id=tm logoUrl, id=tm quiz.{{number}}.question.img, id=tm quiz.{{number}}.answer.options.{{number}}.img',
        rules: 'imgUrl'
    },
    {
        selector: 'id=startScr backgroundImg, type=questions backgroundImg, type=result backgroundImg',
        updateScreens: true,
        rules: 'imgUrl'
    },
    {
        selector: 'id=startScr showLogo, type=questions showLogo, type=result showLogo, id=tm showQuestionProgress, id=tm showBullits, id=tm showTopColontitle, id=tm showBackgroundImage, id=tm randomizeQuestions',
        rules: 'trueFalse'
    },
            {
                selector: 'id=startScr showLogo',
                label: 'Лого на стартовой'
            },
            {
                selector: 'type=questions showLogo',
                label: 'Лого в вопросах'
            },
            {
                selector: 'type=result showLogo',
                label: 'Лого в результатах'
            },
            {
                selector: 'id=tm showBackgroundImage',
                label: 'Показывать фоновую картинку',
                rules: 'trueFalse'
            },
            {
                selector: 'id=tm showBullits',
                label: 'Показывать буллиты вариантов ответа'
            },
            {
                selector: 'id=tm showQuestionProgress',
                label: 'Показывать прогресс вопросов'
            },
            {
                selector: 'id=tm showTopColontitle',
                label: 'Верхний колонтитул'
            },
            {
                selector: 'id=tm randomizeQuestions',
                label: 'Перемешивать вопросы'
            },
    {
        selector: 'id=tm quiz.{{number}}.question.text, id=tm quiz.{{number}}.answer.options.{{number}}.text, id=tm results.{{number}}.title, id=tm results.{{number}}.description, id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText, type=result restartButtonText, type=questions topColontitleText',
        rules: 'text'
    },
    {
        selector: 'id=tm quiz',
        rules: 'quizAddRule'
    },
    {
        selector: "id=tm quiz.{{number}}.answer.options",
        rules: 'quizOptionEditRule'
    },
    {
        // TODO
        // в реальности конструкция rules: 'quizOptionEditRule setCorrectAnswer' не поддерживается, наверное лень было сделать нормально
        // В engine это вроде заложено, в AppProperty точно нет
        selector: "id=tm quiz.{{number}}.answer.options.{{number}}",
        rules: 'setCorrectAnswer'
    },
    {
        selector: 'type=test shareLink',
        rules: 'url',
        label: 'Шаринг в facebook',
        filter: false
    }
];

// правила, как редактировать свойства
descriptor.rules = {
    url: {
        updateScreens: false,
        controls: "StringControl",
        controlParams: {
            viewName: 'textinput'
        },
        label: 'Url',
        filter: true
    },
    text: {
        controls: 'TextQuickInput'
    },
    textAlign: {
        updateScreens: true,
        controls: "Alternative",
        controlParams: {
            viewName: "AltButtons"
        },
        cssProperty: 'text-align',
        possibleValues: [
            {value:"left",icon:"i/align-left.png"},
            {value:"center",icon:"i/align-center.png"},
            {value:"right",icon:"i/align-right.png"}
        ],
        label: "Выравнивание",
        filter: true
    },
    fontSize: {
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'textinput'
        },
        label: 'Размер шрифта',
        cssProperty: 'font-size',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    fontFamily: {
        updateScreens: true,
        controls: "Alternative",
        controlParams: {
            viewName: "Dropdown"
        },
        //TODO standart font names source?
        possibleValues: ["Arial","Times New Roman"],
        cssProperty: 'font-family',
        label: 'Шрифт',
        filter: true
    },
    fontColor: {
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет шрифта',
        cssProperty: 'color',
        filter: true
    },
    hoverFontColor: {
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет шрифта при наведении',
        cssProperty: 'color',
        filter: true
    },
    drag: {
        updateScreens: false,
        runTests: false,
        controls: "Drag",
        controlParams: {
        }
    },
    imgUrl: {
        editable: true,
        controls: "ChooseImage",
        updateScreens: true,
        controlParams: {
        },
        label: 'Картинка',
        filter: true
    },
    backgroundColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет фона',
        cssProperty: 'background-color',
        filter: true
    },
    // TODO не придумал как объединить с backgroundColor
    hoverBackgroundColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет фона при наведении',
        cssProperty: 'background-color',
        filter: true
    },
    borderColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет бордера',
        cssProperty: 'border-color',
        filter: true
    },
    hoverBorderColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет бордера при наведении',
        cssProperty: 'border-color',
        filter: true
    },
    // TODO эти стандартные правила можно вынести в движок
    borderRadius: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
        },
        label: 'Скругление углов',
        cssProperty: 'border-radius',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    showQuestionProgress: {
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Показывать номер вопроса"
    },
    //TODO не придумал как объединить borderWidth+hoverBorderWidth
    borderWidth: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput"
        },
        //TODO format cssValue: '{value}px' чтобы было понятно как формировать проперти
        cssProperty: 'border-width',
        cssValuePattern: '{{number}}px',
        label: "Толщина бордера",
        filter: true
    },
    hoverBorderWidth: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput"
        },
        cssProperty: 'border-width',
        cssValuePattern: '{{number}}px',
        label: "Толщина бордера при наведении",
        filter: true
    },
    topColontitleBottomBorderColor: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет линии",
        cssProperty: 'border-bottom-color',
        filter: true
    },
    quizAddRule: {
        updateScreens: true,
        canAdd: ["proto__q-text_a-text","proto__q-text_a-img","proto__q-text-img_a-text"],
        // добавлением слайдов занимается SlideGroupControl
        controls: [
            {
                name: "SlideGroupControl",
                params: {
                }
            }
        ]
    },
    /**
     * Правила добавления опции ответа
     * сейчас текстовой
     */
    quizOptionEditRule: {
        canAdd: ["proto__option_text","proto__option_img"],
        controls: [
            {
                name: "AddArrayElementControl",
                params: {
//                    viewName: "addquickbutton",
                    prototypeIndex: 0,
                    controlFilter: 'text'
                }
            },
            {
                name: "AddArrayElementControl",
                params: {
//                    viewName: "addquickbutton",
                    prototypeIndex: 1,
                    controlFilter: 'img'
                }
            },
            {
                name: "DeleteQuickButton",
                params: {
                    filter: "ok"
                }
            }
        ],
        updateScreens: true
    },
    setCorrectAnswer: {
        controls: [
            {
                name: "CustomQuickPanelControl",
                params: {
                    filter: 'ok',
                    onClick: function(param) {
                        // получаем ид опции
                        var optionId = $(this.$productDomElement).attr('data-id');
                        if (optionId) {
                            this.setView('<div style="background-color:green;"><img src="controls/i/Panel-set-as-right.png"></div>');
                            param.app._models[0].setCorrectAnswer(optionId);
                        }
                        else {
                            log('Descriptor.setCorrectAnswer: option data-id is not set');
                        }
                    },
                    onShow: function(param) {
                        var optionId = $(this.$productDomElement).attr('data-id');
                        var questionIndex = $(this.$productDomElement).attr('data-question-index');
                        if (optionId && questionIndex) {
                            var correctId = param.app._models[0].getCorrectAnswerId(questionIndex);
                            if (correctId===optionId) {
                                this.setView('<div style="background-color:green;"><img src="controls/i/Panel-set-as-right.png"></div>');
                            }
                            else {
                                this.setView('<div style="cursor:pointer"><img src="controls/i/Panel-set-as-right.png"></div>');
                            }
                        }
                        else {
                            log('Descriptor.setCorrectAnswer: option data-id or data-question-index is not set');
                        }
                    }
                }
            }
        ]
    },
    trueFalse: {
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Вкл/Откл"
    },
    paddingTop: {
        label: 'Паддинг сверху',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding-top',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    paddingBottom: {
        label: 'Паддинг снизу',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding-bottom',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    paddingLeft: {
        label: 'Паддинг слева',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding-left',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    marginTop: {
        label: 'Маргин сверху',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-top',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    marginBottom: {
        label: 'Маргин снизу',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-bottom',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    marginLeft: {
        label: 'Маргин слева',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-left',
        cssValuePattern: '{{number}}px',
        filter: true
    }
};

/**
 * Описание прототипов
 * - лабел
 * - иконка
 * - данные прототипа для клоинрования и использования
 *
 * @type {{}}
 */
descriptor.prototypes = {
    // шаблон текстового вопроса
    "proto__q-text_a-text": {
        label: 'Текстовый вопрос',
        img: '/products/test_new/i/editor/t1.jpg', // +devPrototypesHostName
        data: {
            question: {
                uiTemplate: 'id-question_text_template',
                text: 'Простой текстовый вопрос'
            },
            explanation: {
                uiTemplate: 'id-explanation_text_template',
                text: 'Объяснение ответа'
            },
            answer: {
                type: 'radiobutton',
                uiTemplate: 'id-answer_question_lst',
                options: [
                    {
                        // атрибуты внутри используются для рендера uiTemplate
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 1'
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 2',
                        points: 1
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 3'
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 4'
                    }
                ]
            }
        }
    },

    // шаблон фото вопроса
    "proto__q-text-img_a-text": {
        label: 'Фото вопрос',
        img: '/products/test_new/i/editor/t2.jpg', // +devPrototypesHostName,
        data: {
            question: {
                uiTemplate: 'id-question_text_photo_template',
                text: 'Текст фото вопроса',
                img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/ocean.jpg'
            },
            explanation: {
                uiTemplate: 'id-explanation_text_template',
                text: 'Объяснение ответв'
            },
            answer: {
                type: 'radiobutton',
                uiTemplate: 'id-answer_question_lst_2',
                options: [
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 1'
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 2'
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 3',
                        points: 1
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Вариант 4'
                    }
                ]
            }
        }
    },

    // шаблон с фотоответами
    "proto__q-text_a-img": {
        label: 'Фотоответы',
        img: '/products/test_new/i/editor/t2.jpg',
        data: {
            question: {
                uiTemplate: 'id-question_text_template',
                text: 'Выберите верный ответ?'
            },
            explanation: {
                uiTemplate: 'id-explanation_text_template',
                text: 'Объяснение ответа'
            },
            answer: {
                type: 'radiobutton',
                uiTemplate: 'id-answer_question_grid_2',
                options: [
                    {
                        uiTemplate: 'id-option_img_template',
                        img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/mur1.jpg',
                        points: 1
                    },
                    {
                        uiTemplate: 'id-option_img_template',
                        img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/mur2.jpg'
                    }
                ]
            }
        }
    },

    proto__option_text: {
        label: 'Текстовый вариант ответа',
        data: {
            uiTemplate: 'id-option_text_template',
            text: 'Вариант ответа'
        }
    },

    proto__option_img: {
        label: 'Ответ картинка',
        data: {
            uiTemplate: 'id-option_img_template',
            img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/ocean.jpg'
        }
    },
};

/**
 * Это действия, которые должны происходить при редактировании промо проекта
 * - Показать подсказку
 * - Подсветить верные ответы
 * - Установить верный ответ в тесте (это не appProperty так как меняются несколько свойств по определенным зависимостям)
 * - ...
 *
 * Любой триггер применяется при показе экрана?..
 *
 * Это индивидуальная логика по управлению промо-проектом.
 * Именно по управлению, написанная тут, в дескрипторе. А не относится к механике самого промо проекта.
 *
 * @type {object}
 */
descriptor.triggers = {
    hintToSetCorrectAnswer: {
        event: 'screen_show',
        repeat: 1, // number | 'infinity',
        action: function(params) {
            var selector = '.bullit';
            var result = false;
            var txt = 'Кликните для установки<br>верного ответа';
            for (var j = 0; j < params.appScreens.length; j++) {
                var as = params.appScreens[j];
                var elements = $(as.view).find(selector);
                if (elements.length > 0) {
                    params.editor.showWorkspaceHint(elements[0],txt);
                    result = true;
                }
            }
            return result;
        }
    },
    /**
     * Выполнить действие на показ экрана
     *
     */
    showCorrectAnswer: {
        event: 'screen_show',
        repeat: 'infinity', // number | 'infinity'
        /**
         *
         * @param {object} params.appScreen - текущий экран в редакторе. Можно получить данные
         * @param {object} params.appWindow - промо-приложение. Можно вызвать любой метод
         * @param {object} params.editor - ссылка на редактор
         * @return {boolean} - был выполнен триггер или нет
         */
        action: function(params) {
//            var selector = '.bullit';
//            var activeClass = 'bullit_active';
            var result = false;
//            for (var j = 0; j < params.appScreens.length; j++) {
//                var as = params.appScreens[j];
//                // сейчас находимся на каком-то экране, мы должны знать индекс вопроса
//                var qi = as.currentQuestionIndex;
//                if (Number.isInteger(qi)) {
//                    // должен остаться только один элемент с классом activeClass
//                    var elements = $(as.view).find(selector);
//                    elements.remove(activeClass);
//                    // и только элементу с корректным ответом ставим activeClass
//                    var correntAnswerId = params.app._models[0].getCorrectAnswerId(qi);
//                    if (correntAnswerId) {
//                        for (var i = 0; i < elements.length; i++) {
//                            if ($(elements[i]).attr('data-id') === correntAnswerId) {
//                                $(elements[i]).addClass(activeClass);
//                            }
//                        }
//                    }
//                    result = true;
//                }
//            }

            // control.onShow
            // найти на экране атрибуты по id=tm quiz.{{number}}.answer.options

            // создать доп контрол для каждой опции id=tm quiz.{{number}}.answer.options.{{number}}
            // во всплывающей панели quickpanel

            // custom control
            // img свой
            // и выставлять стейт-картинку, запрашивая у модели по data-option-id

            // control.onClick
            // обработчик соответственно по клику - ставить в модель верный ответ
            // это кастомная логика и должна быть в descriptor

            // и это получается не триггер в кастомный контрол

            return result;
        }
    },
    /**
     * Триггер для смены правильного ответа в вопросе
     * Клик по элементам с указанным классом приводит в вызову метода промо проекта с указанными параметрами
     */
    bullitClick: {
        event: 'screen_show',
        repeat: 'infinity',
        /**
         *
         * @param {object} params.appScreen
         * @param {object} params.appWindow
         * @param {object} params.editor - ссылка на редактор
         *
         * @return {boolean} - был выполнен триггер или нет
         */
        action: function(params) {
            var selector = '.bullit';
            var activeClass = 'bullit_active';
            var result = false;
            for (var j = 0; j < params.appScreens.length; j++) {
                var as = params.appScreens[j];
                var elements = $(as.view).find(selector).click(function(e) {
                    // data-id - в этом элементе хранится ид верного ответа
                    var attr = $(e.currentTarget).attr('data-id');
                    $(elements).removeClass(activeClass);
                    $(e.currentTarget).addClass(activeClass);
                    // установка верного ответа. Метод setCorrectAnswer в промо-проекте служит для этой цели
                    params.appWindow.setCorrectAnswer(attr);
                });
                if (elements.length > 0) {
                    result = true;
                }
            }
            return result;
        }
    }
};

//var descriptor = {
//    stylePresets: {
//        isPreset: true,
//        editable: true,
//        updateScreens: true,
//        //TODO можно расширить типы. "final" Это свойство надо создать только один раз при старте и никогда не пересоздавать
//        label: 'Тема',
//        possibleValues: [
//            {
//                label: 'Деловой стиль',
//                fontColor: "#333",
//                fontFamily: "Arial",
//                backgroundColor: "#eee",
//                logoStartPosition: {
//                    left: 340,
//                    top: 320
//                }
//            },
//            {
//                label: 'Романтика',
//                fontColor: "#3а0303",
//                fontFamily: "Times New Roman",
//                backgroundColor: "#888",
//                logoStartPosition: {
//                    left: 340,
//                    top: 320
//                }
//            }
//        ],
//        controls: "Alternative",
//        controlParams: {
//            viewName: "Dropdown"
//        }
//    }
//};