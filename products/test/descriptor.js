/**
 * Created by artyom.grishanov on 17.02.16.
 *
 *
 * // selector как задать? То есть надо указать элемент к которому применять стили
 // если по атрибуту data-app-property найти то все равно не удобно
 // но можно классы навесить самому js-{appPropname}! Вот что! если нет selector
 // а selector оставить как вариант
 */
var descriptor = {};
//    [
//    {
//        // сюда добавляем все свойства, для которых надо задать верхний отступ
//        selector: 'startHeaderPaddingTop startDescriptionPaddingTop startButtonPaddingTop quizQuestionPaddingTop resultTitlePaddingTop',
//        label: 'Отступ сверху',
//        controls: 'StringControl',
//        updateScreens: true,
//        cssProperty: 'padding-top',
//        cssValuePattern: '{{value}}px',
//        filter: true
//    },
//    // не нравится что есть повторение: padding-bottom, padding-left и так далее
//    // это можно решить разделением, только название отдельно описать
//    {
//        selector: 'startHeaderPaddingBottom startDescriptionPaddingBottom startButtonPaddingBottom quizQuestionPaddingBottom resultTitlePaddingBottom',
//        label: 'Отступ снизу',
//        controls: 'StringControl',
//        updateScreens: true,
//        cssProperty: 'padding-bottom',
//        cssValuePattern: '{{value}}px',
//        filter: true
//    },
//    {
//        selector: 'startHeaderAlign startDescriptionAlign startButtonAlign quizQuestionTextAlign resultTitleAlign',
//        editable: true,
//        controls: "Alternative",
//        controlParams: {
//            viewName: "Dropdown"
//        },
//        cssProperty: 'text-align',
//        possibleValues: ["left","center","right"],
//        updateScreens: true,
//        label: "Выравнивание",
//        filter: true
//    },
//    {
//        selector: 'randomizeQuestions',
//        editable: true,
//        controls: "OnOff",
//        controlParams: {
//            viewName: "OnOffSwitcher"
//        },
//        label: "Перемешать вопросы"
//    },
//    {
//        selector: 'startHeaderText startDescription startButtonText restartButtonText quiz.{{number}}.text topColontitleText',
//        controls: "TextQuickInput"
//    },
//    {
//        selector: 'showBackgroundImage',
//        editable: true,
//        updateScreens: true,
//        controls: "OnOff",
//        controlParams: {
//        },
//        label: "Картинка"
//    },
//    {
//        selector: 'startHeaderTextFontSize startDescriptionTextFontSize',
//        editable: true,
//        updateScreens: true,
//        controls: "StringControl",
//        controlParams: {
//            viewName: 'textinput'
//        },
//        label: 'Размер шрифта',
//        cssProperty: 'font-size',
//        cssValuePattern: '{{value}}px',
//        filter: true
//    },
//    {
//        selector: 'startHeaderTextFontColor startDescriptionTextFontColor buttonFontColor quizQuestionTextColor resultTitleFontColor resultDescriptionFontColor',
//        editable: true,
//        updateScreens: true,
//        controls: "StringControl",
//        controlParams: {
//            viewName: "ColorPicker"
//        },
//        cssProperty: 'color',
//        label: "Цвет шрифта",
//        filter: true
//    },
//    {
//        selector: 'backgroundColor',
//        editable: true,
//        updateScreens: true,
//        controls: "StringControl",
//        controlParams: {
//            viewName: "ColorPicker"
//        },
//        label: "Цвет фона",
//        cssProperty: 'background-color',
//    }
//];


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
        selector: '.js-startHeader .js-startDescription',
        // можно прописать сразу несколько правил, получается отношение "многие ко многим"
        // это позволит делать наборы правил
        rules: 'fontFamily fontColor fontSize textAlign'
    },
    {
        // не объединяем с остальными текстами, так как нельзя выравнивать
        selector: '.js-question_progress',
        rules: 'fontFamily fontColor fontSize'
    },
    {
        // все кнопки
        selector: '.t_btn',
        rules: 'backgroundColor textalign fontColor fontSize fontFamily borderColor borderRadius'
    },
    {
        // все кнопки в состоянии навеения
        selector: '.t_btn:hover',
        rules: 'hoverBackgroundColor hoverFontColor hoverBorderColor'
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
        rules: 'text topColontitleBottomBorderColor fontColor fontSize fontFamily textAlign backgroundColor'
    }
];

descriptor.app = [
    {
        selector: 'showBackgroundImage',
        rules: 'showBackgroundImage'
    },
    {
        selector: 'logoStartPosition logoResultPosition questionProgressPosition',
        rules: 'drag'
    },
    {
        selector: 'logoUrl quiz.{{number}}.img',
        rules: 'imgUrl'
    },
    {
        selector: 'showQuestionProgress showBullits showTopColontitle showBackgroundImage',
        rules: 'trueFalse'
    },
    {
        selector: 'showBackgroundImage',
        label: 'Показывать фоновую картинку'
    },
    {
        selector: 'showBullits',
        label: 'Показывать буллиты вариантов ответа'
    },
    {
        selector: 'showQuestionProgress',
        label: 'Показывать прогресс вопросов'
    },
    {
        selector: 'showTopColontitle',
        label: 'Верхний колонтитул'
    },
    {
        selector: 'quiz.{{number}}.text quiz.{{number}}.options.{{number}}.text results.{{number}}.title results.{{number}}.description startHeaderText startDescription startButtonText restartButtonText topColontitleText',
        rules: 'text'
    },
    {
        selector: 'quiz',
        rules: 'quizAddRule'
    },
    {
        selector: "quiz.{{number}}.options",
        rules: 'quizOptionEditRule'
    }
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
            viewName: "Dropdown"
        },
        cssProperty: 'text-align',
        possibleValues: ["left","center","right"],
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
        cssValuePattern: '{{value}}px',
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
        cssValuePattern: '{{value}}px',
        label: "Толщина бордера"
    },
    hoverBorderWidth: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput"
        },
        cssProperty: 'border-width',
        cssValuePattern: '{{value}}px',
        label: "Толщина бордера при наведении"
    },
    topColontitleBottomBorderColor: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: "Цвет линии",
        cssProperty: 'border-bottom-color'
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