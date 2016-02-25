/**
 * Created by artyom.grishanov on 17.02.16.
 */
var descriptor = {
    startHeaderText: {
        editable: true,
        controls: "TextQuickInput"
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
        static: true,
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Перемешать вопросы"
    },
    backgroundColor: {
        editable: true,
        updateScreens: true,
        static: true,
        controls: "TextInput",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет фона"
    },
    fontColor: {
        editable: true,
        updateScreens: true,
        static: true,
        controls: "TextInput",
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
        static: true,
        controls: "OnOff",
        controlParams: {
        },
        label: "Картинка"
    },
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
        static: true,
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
//    proto__text_slide: {
//        // прототип, значит свойтво используется для клонирования и создания новых элементов в массиве
//        isPrototype: true
//    },
//    proto__photo_question_slide: {
//        isPrototype: true
//    },
//    proto__option_text: {
//        isPrototype: true
//    },
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