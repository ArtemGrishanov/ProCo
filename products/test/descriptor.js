/**
 * Created by artyom.grishanov on 17.02.16.
 */
var descriptor = {
    startHeaderText: {
        editable: true,
        controls: "TextQuickInput"
    },
    startHeaderTextFontSize: {
        editable: true,
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'textinput'
        },
        view: 'js-startHeader',
        label: 'Размер шрифта'
    },
    startDescription: {
        editable: true,
        controls: "TextQuickInput"
    },
    restartButtonText: {
        editable: true,
        controls: "TextQuickInput"
    },
    randomizeQuestions: {
        editable: true,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Перемешать вопросы"
    },
    backgroundColor: {
        editable: true,
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет фона",
        filter: true
    },
    fontColor: {
        editable: true,
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет шрифта"
    },
    fontFamily: {
        editable: true,
        controls: "Alternative",
        controlParams: {
            viewName: "Dropdown"
        },
        //TODO standart font names source?
        possibleValues: ["Arial","Times New Roman"],
        static: true,
        updateScreens: true,
        label: "Шрифт"
    },
    showBackgroundImage: {
        editable: true,
        updateScreens: true,
        controls: "OnOff",
        controlParams: {
        },
        label: "Картинка",
        filter: true
    },

    /**
     * Кнопки
     *
     */
    buttonBackgroundColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет фона кнопок',
        cssSelector: '.t_btn',
        cssProperty: 'background-color',
        filter: true
    },
    buttonHoverBackgroundColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет фона кнопок при наведении',
        // значение свойства app.buttonHoverBackgroundColor будет записано вот в это css-правило
        // потом эти правила будут дописаны в кастомные стили для body промо-проекта при сериализации
        cssSelector: '.t_btn:hover',
        cssProperty: 'background-color',
        filter: true
    },
    buttonFontColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет шрифта кнопок',
        cssSelector: '.t_btn',
        cssProperty: 'color',
        filter: true
    },
    buttonHoverFontColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет шрифта кнопок',
        cssSelector: '.t_btn:hover',
        cssProperty: 'color',
        filter: true
    },
    buttonBorderColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет бордера кнопок',
        cssSelector: '.t_btn',
        cssProperty: 'border-color',
        filter: true
    },
    buttonHoverBorderColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет бордера кнопок при наведении',
        cssSelector: '.t_btn:hover',
        cssProperty: 'border-color',
        filter: true
    },
    buttonBorderRadius: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
        },
        label: 'Радиус бордера кнопок',
        filter: true
    },
    buttonFontSize: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
        },
        label: 'Размер шрифта кнопок',
        filter: true
    },
    buttonFontFamily: {
        editable: true,
        updateScreens: true,
        controls: "Alternative",
        controlParams: {
            viewName: "Dropdown"
        },
        //TODO standart font names source?
        possibleValues: ["Arial","Times New Roman"],
        label: 'Шрифт кнопок',
        filter: true
    },

    /**
     * Прогресс вопросов
     *
     */
    showQuestionProgress: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Показывать номер вопроса"
    },
    questionProgressPosition: {
        editable: true,
        updateScreens: false,
        // updateAppProperties: false, - тогда не перетаскивается
        //TODO при перетаскивании все равно пересоздаются свойства appProperties
        runTests: false,
        controls: "Drag",
        controlParams: {
        }
    },
    questionProgressFontColor: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: 'Цвет номера вопроса',
        cssSelector: '.js-question_progress',
        cssProperty: 'color'
    },
    questionProgressFontFamily: {
        editable: true,
        updateScreens: true,
        controls: "Alternative",
        controlParams: {
            viewName: "Dropdown"
        },
        //TODO standart font names source?
        possibleValues: ["Arial","Times New Roman"],
        label: 'Шрифт номера вопроса'
    },
    questionProgressFontSize: {
        editable: true,
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
        },
        label: 'Размер шрифта номера вопроса'
    },

    /**
     * Буллиты опций ответа
     *
     */
    showBullits: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Показывать буллит варианта ответа"
    },
    bullitsBorderWidth: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput"
        },
        //TODO format cssValue: '{value}px' чтобы было понятно как формировать проперти
        cssSelector: '.bullit',
        cssProperty: 'border-width',
        cssValuePattern: '{{value}}px',
        label: "Толщина буллита"
    },
    bullitHoverBorderWidth: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput"
        },
        cssSelector: '.a_wr:hover .bullit',
        cssProperty: 'border-width',
        cssValuePattern: '{{value}}px',
        label: "Толщина буллита при наведении на вопрос"
    },
    bullitsBorderColor: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет обводки буллита",
        cssSelector: '.bullit',
        cssProperty: 'border-color'
    },

    /**
     * Верхний колонтитул
     *
     */
    showTopColontitle: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Верхний колонтитул"
    },
    topColontitleLineColor: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет линии колонтитула",
        cssSelector: '.topColontitle',
        cssProperty: 'border-bottom-color'
    },
    topColontitleBackgroundColor: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет фона колонтитула",
        cssSelector: '.topColontitle',
        cssProperty: 'background-color'
    },
    topColontitleFontColor: {
        editable: true,
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет шрифта колонтитула",
        cssSelector: '.topColontitle',
        cssProperty: 'color'
    },
    topColontitleText: {
        editable: true,
        controls: 'TextQuickInput'
    },

    /**
     * Логотипы
     *
     */
    logoUrl: {
        editable: true,
        controls: "ChooseImage",
        controlParams: {
            maxWidth: 100,
            maxHeight: 50
        }
    },
    logoStartPosition: {
        editable: true,
        updateScreens: false,
        runTests: false,
        controls: "Drag",
        controlParams: {
        }
    },
    logoResultPosition: {
        editable: true,
        updateScreens: false,
        runTests: false,
        controls: "Drag",
        controlParams: {
        }
    },
    showExplanation: {
        editable: true
    },
    quiz: {
        editable: true,
        updateScreens: true,
        canAdd: ["proto__text_slide","proto__photo_question_slide"],
        controls: [
            {
                name: "AddArrayElementControl",
                params: {
                    viewName: "AddScreenButton",
                    screenGroup: "questions",
                    prototypeIndex: 0
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
    "quiz.{{number}}.text": {
        editable: true,
        controls: "TextQuickInput"
    },
    "quiz.{{number}}.options": {
        editable: true,
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
        //TODO по идее это разное: апдейтить один активный скрин или все...
        updateScreens: true,
        canAdd: ["proto__option_text"]
    },
    "quiz.{{number}}.options.{{number}}.text": {
        editable: true,
        controls: "TextQuickInput"
    },
    "quiz.{{number}}.options.{{number}}": {
        // для каждого элемента массива, а не самого массива
    },
    "results.{{number}}.title": {
        editable: true,
        controls: "TextQuickInput"
    },
    "results.{{number}}.description": {
        editable: true,
        controls: "TextQuickInput"
    },
    stylePresets: {
        isPreset: true,
        editable: true,
        updateScreens: true,
        //TODO можно расширить типы. "final" Это свойство надо создать только один раз при старте и никогда не пересоздавать
        static: true,
        label: 'Тема',
        possibleValues: [
            {
                label: 'Деловой стиль',
                fontColor: "#333",
                fontFamily: "Arial",
                backgroundColor: "#eee",
                logoStartPosition: {
                    left: 340,
                    top: 320
                }
            },
            {
                label: 'Романтика',
                fontColor: "#3а0303",
                fontFamily: "Times New Roman",
                backgroundColor: "#888",
                logoStartPosition: {
                    left: 340,
                    top: 320
                }
            }
        ],
        controls: "Alternative",
        controlParams: {
            viewName: "Dropdown"
        }
    }
};