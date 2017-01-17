/**
 * Created by artyom.grishanov on 13.09.16.
 *
 */
var descriptor = {};

descriptor.css = [

];

descriptor.app = [
    {
        selector: 'id=mm pins(createPin)',
        rules: 'createPin'
    },
    {
        selector: 'id=mm pins(deletePin)',
        rules: 'deletePin'
    },
    {
        selector: 'id=mm panoramaImgSrc',
        rules: 'imgUrl',
        filter: false
    },
    {
        selector: 'id=mm pins.{{number}}.position',
        rules: 'drag',
        controlParams: {
            scale: 'id=panoramaEditScr previewScale'
        },
        updateScreens: false,
        updateAppProperties: false,
        restartApp: false
    },
    {
        selector: 'id=mm pins.{{number}}.data.text',
        rules: 'text',
        restartApp: false
    }
];

// правила, как редактировать свойства
descriptor.rules = {
    // с помощью клика по dom-елементу добавляется элемент в массив
    createPin: {
        updateScreens: false,
        controls: 'ClickAndAddToArray',
        canAdd: ["proto__pin_text"],
        controlParams: {
            scale: 'id=panoramaEditScr previewScale'
        },
    },
    deletePin: {
        controls: [
            {
                name: "DeleteQuickButton",
                params: {
                    //filter: ""
                }
            }
        ],
        updateScreens: true
    },
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
        controls: 'TextQuickInput',
        updateScreens: false,
        createAppProperties: false
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
    trueFalse: {
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: "Вкл/Откл"
    },
    padding: {
        label: 'Паддинг',
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding',
        cssValuePattern: '{{number}}px',
        filter: true
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
    },
    imgForShare: {
        editable: true,
        controls: "ChooseImage",
        updateScreens: true,
        controlParams: {
            // контрол для настройки картинки публикации
            usePreviewShareImageModal: true,
            viewName: 'ChooseImagePreview'
        },
        label: 'Картинка',
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
    // шаблон простой фото-карточки
    "proto__pin_text": {
        label: 'Текстовый пин',
        img: null, // картинка для мультивыбора в диалоге
        data: {
            id: '12345678',
            data: {
                text: 'Пример метки<br>на панораме'
            },
            position: {
                left: 400,
                top: 280
            },
            uiTemplate: 'id-text_pin_template'
        }
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

};