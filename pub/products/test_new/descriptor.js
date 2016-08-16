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
        // на самом деле тут больше appProperty: .js-startHeader_fontFamily .js-startHeader_fontColor .js-startHeader_fontSize .js-startHeader_textAlign
        //   .js-startDescription_fontFamily .js-startDescription_fontColor .js-startDescription_fontSize .js-startDescription_textAlign
        // перечислил все классы к которым применять правила
        selector: '.js-startHeader .js-start_description .js-question_text .js-result_title .js-result_description',
        // можно прописать сразу несколько правил, получается отношение "многие ко многим"
        // это позволит делать наборы правил
        rules: 'fontFamily fontColor fontSize textAlign paddingTop paddingBottom paddingLeft'
    },
    {
        selector: '.js-answers_wr',
        rules: 'textAlign fontFamily fontColor fontSize marginTop marginBottom paddingLeft'
    },
    {
        // не объединяем с остальными текстами, так как нельзя выравнивать
        selector: '.js-question_progress',
        rules: 'fontFamily fontColor fontSize'
    },
    {
        // все кнопки
        selector: '.t_btn',
        rules: 'backgroundColor fontColor fontSize fontFamily borderColor borderRadius paddingTop paddingBottom'
    },
    {
        selector: '.t_btn',
        applyCssTo: '.js-btn_wr',
        rules: 'textAlign marginTop marginBottom paddingLeft'
    },
    {
        //TODO подумать
        selector: '.t_btn',
        rules: 'textAlign'
    },
    {
        selector: '.js-photo',
        rules: 'textAlign marginTop marginBottom',
        // выделяться будет .js-photo, пользователь работает как-бы с ним
        // но на самом деле свойства применяются к .js-photo_cnt
        applyCssTo: '.js-photo_cnt'
    },
    {
        // все кнопки в состоянии навеения
        selector: '.t_btn:hover',
        rules: 'hoverBackgroundColor hoverFontColor hoverBorderColor',
    },
    {
        selector: '.bullit',
        rules: 'borderWidth borderColor'
    },
    {
        selector: '.a_wr:hover .bullit',
        rules: 'hoverBorderWidth hoverBorderColor'
    },
    {
        selector: '.topColontitle',
        rules: 'topColontitleBottomBorderColor fontColor fontSize fontFamily textAlign backgroundColor paddingTop paddingBottom'
    },
    {
        selector: '.wrapper',
        applyCssTo: '.js-back_color',
        label: 'Цвет фона теста',
        filter: false,
        rules: 'backgroundColor'
    }
];

descriptor.app = [
    {
        selector: 'id=startScr logoPosition, type=result logoPosition',
        rules: 'drag'
    },
    {
        selector: 'type=questions questionProgressPosition',
        updateScreens: true, // потому что в рамках одной сессии надо менять позицию этого элемента на нескольких экранах
        rules: 'drag'
    },
    {
        selector: 'id=tm logoUrl, id=tm quiz.{{number}}.question.img',
        rules: 'imgUrl'
    },
    {
        selector: 'id=startScr backgroundStart, type=questions backgroundQuestions, type=result backgroundResult',
        updateScreens: true,
        rules: 'imgUrl'
    },
    {
        selector: 'type=questions showQuestionProgress, type=questions showBullits, type=questions showTopColontitle, id=tm showBackgroundImage, id=tm randomizeQuestions',
        rules: 'trueFalse'
    },
            {
                selector: 'id=tm showBackgroundImage',
                label: 'Показывать фоновую картинку',
                rules: 'trueFalse'
            },
            {
                selector: 'type=questions showBullits',
                label: 'Показывать буллиты вариантов ответа'
            },
            {
                selector: 'type=questions showQuestionProgress',
                label: 'Показывать прогресс вопросов'
            },
            {
                selector: 'type=questions showTopColontitle',
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
];

// правила, как редактировать свойства
descriptor.rules = {
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
        controls: "ChooseImageQuick",
        updateScreens: true,
        controlParams: {
        }
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
        canAdd: ["proto__text_slide","proto__photo_question_slide"],
        controls: [
            {
                name: "AddArrayElementControl",
                params: {
                    viewName: "AddScreenButton",
                    screenGroup: "questions",
                    prototypeIndex: 0,
                }
            },
            {
                name: "AddArrayElementControl",
                params: {
                    viewName: "AddScreenButton",
                    screenGroup: "questions",
                    prototypeIndex: 1
                }
            }
        ]
    },
    /**
     * Правила добавления опции ответа
     * сейчас текстовой
     */
    quizOptionEditRule: {
        // несколько контролов, альтернативная форма объявления
        controls: [
            {
                name: "AddArrayElementControl",
                params: {
                    // params here
                }
            },
            {
                name: "DeleteQuickButton",
                params: {
                    // params here
                }
            }
        ],
        updateScreens: true,
        canAdd: ["proto__option_text"]
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
 * имя свойства - это также и имя значения в productIFrame.app
 * - лабел
 * - иконка
 * -
 *
 * @type {{}}
 */
descriptor.prototypes = {
    proto__text_slide: {
        label: 'Текстовый вопрос',
        img: '/products/test/i/editor/t1.jpg' // +devPrototypesHostName
    },
    proto__photo_question_slide: {
        label: 'Фото вопрос',
        img: '/products/test/i/editor/t2.jpg' // +devPrototypesHostName
    },
    proto__option_text: {

    }
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
            var selector = '.bullit';
            var activeClass = 'bullit_active';
            var result = false;
            for (var j = 0; j < params.appScreens.length; j++) {
                var as = params.appScreens[j];
                // сейчас находимся на каком-то экране, мы должны знать индекс вопроса
                var qi = as.data.currentQuestion;
                if (Number.isInteger(qi)) {
                    // должен остаться только один элемент с классом activeClass
                    var elements = $(as.view).find(selector);
                    elements.remove(activeClass);
                    // и только элементу с корректным ответом ставим activeClass
                    var correntAnswerId = params.appWindow.getCorrectAnswerId(qi);
                    if (correntAnswerId) {
                        for (var i = 0; i < elements.length; i++) {
                            if ($(elements[i]).attr('data-id') === correntAnswerId) {
                                $(elements[i]).addClass(activeClass);
                            }
                        }
                    }
                    result = true;
                }
            }
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