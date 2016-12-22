/**
 * Created by artyom.grishanov on 13.09.16.
 *
 */
var descriptor = {};

descriptor.css = [
    {
        selector: '.js-back_color',
        label: 'Цвет фона',
        filter: false,
        rules: 'backgroundColor'
    },
    {
        selector: '.js-card-field',
        label: 'Отступ до края',
        filter: true,
        rules: 'padding'
    },
    {
        // перечислил все классы к которым применять правила
        selector: '.js-start_header .js-start_description .js-result_title .js-result_description .js-explanation_text .js-explanation_title',
        // можно прописать сразу несколько правил, получается отношение "многие ко многим"
        // это позволит делать наборы правил
        rules: 'fontFamily fontColor fontSize textAlign paddingTop paddingBottom paddingLeft'
    },
    {
        // все кнопки
        selector: '.js-test_btn',
        rules: 'backgroundColor fontColor fontSize fontFamily borderColor borderRadius borderWidth paddingTop paddingBottom'
    },
    {
        // кнопка "скачать", чтобы можно было отдельный стиль задать
        selector: '.js-download_btn',
        rules: 'backgroundColor fontColor fontSize fontFamily borderColor borderRadius borderWidth paddingTop paddingBottom'
    },
    {
        selector: '.js-test_btn',
        applyCssTo: '.js-btn_wr',
        rules: 'textAlign marginTop marginBottom paddingLeft'
    },
];

descriptor.app = [
    {
        selector: 'id=startScr logoPosition, type=opened logoPosition, id=gamescreen logoPosition, type=result logoPosition, type=result fbSharePosition, type=result vkSharePosition',
        rules: 'drag'
    },
    {
        selector: 'id=mm showBackCardTexture, type=result showDownload, id=mm showExplanation, id=gamescreen showLogo, id=startScr showLogo, type=opened showLogo, type=result showLogo, id=mm fbShareEnabled, id=mm vkShareEnabled, id=mm showTopColontitle, id=mm showBackgroundImage, id=startScr shadowEnable, type=opened shadowEnable, id=gamescreen shadowEnable, type=result shadowEnable',
        rules: 'trueFalse'
    },
        {
            selector: 'id=mm showBackCardTexture',
            label: 'Показывать "рубашку" карточки'
        },
        {
            selector: 'id=mm showExplanation',
            label: 'Показывать леер объяснения ответа'
        },
        {
            selector: 'id=startScr showLogo',
            label: 'Лого на стартовой'
        },
        {
            selector: 'type=opened showLogo',
            label: 'Лого в вопросах'
        },
        {
            selector: 'id=gamescreen showLogo',
            label: 'Лого на игровом поле'
        },
        {
            selector: 'type=result showLogo',
            label: 'Лого в результатах'
        },
        {
            selector: 'type=result showDownload',
            label: 'Кнопка "Скачать" на экране результата'
        },
        {
            selector: 'id=mm showBackgroundImage',
            label: 'Показывать фоновую картинку',
            rules: 'trueFalse'
        },
        {
            selector: 'id=mm fbShareEnabled',
            label: 'Включить шаринг результата в Facebook'
        },
        {
            selector: 'id=mm vkShareEnabled',
            label: 'Включить шаринг результата во ВКонтакте'
        },
        {
            selector: 'id=mm showTopColontitle',
            label: 'Верхний колонтитул'
        },
        {
            selector: 'id=startScr shadowEnable',
            label: 'Затемнение фона',
            filter: true
        },
        {
            selector: 'id=gamescreen shadowEnable',
            label: 'Затемнение фона',
            filter: true
        },
        {
            selector: 'type=opened shadowEnable',
            label: 'Затемнение фона',
            filter: true
        },
        {
            selector: 'type=result shadowEnable',
            label: 'Затемнение фона',
            filter: true
        },


    {
        selector: 'type=opened nextButtonText, id=mm pairs.{{number}}.explanation.text, id=mm pairs.{{number}}.explanation.title, id=mm results.{{number}}.title, id=mm results.{{number}}.description, id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText, type=result restartButtonText, type=result downloadButtonText, type=opened topColontitleText',
        rules: 'text'
    },
    {
        selector: 'id=startScr backgroundImg, id=gamescreen backgroundImg, type=opened backgroundImg, type=result backgroundImg, id=mm backCardTexture',
        updateScreens: true,
        rules: 'imgUrl'
    },
    {
        selector: 'id=mm backCardTexture',
        label: 'Картинка для "рубашки" карточки',
    },
    {
        selector: 'type=memoriz shareLink',
        rules: 'url',
        label: 'Шаринг в facebook',
        filter: false
    },
    {
        selector: 'id=mm pairs',
        rules: 'pairAddRule'
    },
    {
        selector: 'id=mm pairs.{{number}}.cards.{{number}}.img, id=mm logoUrl',
        updateScreen: true,
        rules: 'imgUrl'
    },
    {
        selector: 'type=memoriz shareLink',
        rules: 'url',
        label: 'Шаринг в facebook',
        filter: false
    },
    {
        selector: 'id=mm logoLink',
        rules: 'url',
        label: 'Лого ссылка',
        filter: false
    },
    {
        selector: 'id=mm downloadLink',
        rules: 'url',
        label: 'Ссылка по кнопке "Скачать"',
        filter: false
    },
    {
        // свойство для настройки кастомного урла картинки для публикации
        selector: 'appConstructor=mutapp _shareEntities.{{number}}.imgUrl',
        rules: 'imgForShare',
        updateScreens: false,
        label: 'Картинка для публикации в соцсеть',
        filter: true
    },
    {
        // Google Analytics id
        selector: 'appConstructor=mutapp gaId',
        updateScreens: false,
        label: 'Google Analytics Id',
        filter: false,
        rules: 'url'
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
    pairAddRule: {
        updateScreens: true,
        canAdd: ["proto__сard-photo"],
        // добавлением слайдов занимается SlideGroupControl
        controls: [
            {
                name: "SlideGroupControl",
                params: {
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
    "proto__сard-photo": {
        label: 'Фото-пара',
        img: 'products/test_new/i/editor/Icon-text-vopros.png', // +devPrototypesHostName
        data: {
            //id: null, set programmatically
            cards: [
                {
                    uiTemplate: 'id-card_text_template',
                    text: 'Ответ 1',
                    img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/ocean.jpg'
                },
                {
                    uiTemplate: 'id-card_text_template',
                    text: 'Ответ 1',
                    img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/ocean.jpg'
                }
            ],
            guessed: false,
            explanation: {
                title: 'Заголовок',
                text: 'Пояснение к правильному ответу'
            }
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