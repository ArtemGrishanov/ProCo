/**
 * Created by artyom.grishanov on 13.09.16.
 *
 */
var descriptor = {};

descriptor.css = [
    {
        selector: '.js-back_color',
        label: {RU:'Цвет фона',EN:'Background color'},
        filter: false,
        rules: 'backgroundColor'
    },
    {
        selector: '.js-card-field',
        label: {RU:'Отступ до края',EN:'Gameboard padding'},
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
            label: {RU:'Показывать "рубашку" карточки',EN:'Show back card image'}
        },
        {
            selector: 'id=mm showExplanation',
            label: {RU:'Показывать леер объяснения ответа',EN:'Show feedback'}
        },
        {
            selector: 'id=startScr showLogo',
            label: {RU:'Логотип на стартовой',EN:'Logo on start page'},
            filter: true,
            showWhileScreenIsActive: 'startScr'
        },
        {
            selector: 'type=opened showLogo',
            label: {RU:'Логотип на странице пояснения',EN:'Logo on feedback page'},
            filter: true,
            showWhileScreenIsActive: 'opened'
        },
        {
            selector: 'id=gamescreen showLogo',
            label: {RU:'Логотип на игровом поле',EN:'Logo on gameboard'},
            filter: true,
            showWhileScreenIsActive: 'gamescreen'
        },
        {
            selector: 'type=result showLogo',
            label: {RU:'Логотип в результатах',EN:'Logo on result page'},
            filter: true,
            showWhileScreenIsActive: 'result'
        },
        {
            selector: 'type=result showDownload',
            label: {RU:'Кнопка "Скачать" на экране результата',EN:'"Download" button on result screen'}
        },
        {
            selector: 'id=mm showBackgroundImage',
            label: {RU:'Показывать фоновую картинку',EN:'Show background image'},
            rules: 'trueFalse'
        },
        {
            selector: 'id=mm fbShareEnabled',
            label: {RU:'Поделиться результатом в Facebook',EN:'Enable Facebook sharing'}
        },
        {
            selector: 'id=mm vkShareEnabled',
            label: {RU:'Поделиться результатом во ВКонтакте',EN:'Enable VK sharing'}
        },
        {
            selector: 'id=mm showTopColontitle',
            label: {RU:'Верхний колонтитул',EN:'Enable top colontitle'}
        },
        {
            selector: 'id=startScr shadowEnable',
            label: {RU:'Затемнение фона',EN:'Background shadow'},
            filter: true,
            showWhileScreenIsActive: 'startScr'
        },
        {
            selector: 'id=gamescreen shadowEnable',
            label: {RU:'Затемнение фона',EN:'Background shadow'},
            filter: true,
            showWhileScreenIsActive: 'gamescreen'
        },
        {
            selector: 'type=opened shadowEnable',
            label: {RU:'Затемнение фона',EN:'Background shadow'},
            filter: true,
            showWhileScreenIsActive: 'opened'
        },
        {
            selector: 'type=result shadowEnable',
            label: {RU:'Затемнение фона',EN:'Background shadow'},
            filter: true,
            showWhileScreenIsActive: 'result'
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
                selector: 'id=startScr backgroundImg',
                label: {RU:'Фон стартовой страницы',EN:'Start page background'},
                filter: true,
                showWhileScreenIsActive: 'startScr'
            },
            {
                selector: 'id=gamescreen backgroundImg',
                label: {RU:'Фон игрового экрана',EN:'Gameboard background'},
                filter: true,
                showWhileScreenIsActive: 'gamescreen'
            },
            {
                selector: 'type=opened backgroundImg',
                label: {RU:'Фон страниц с парами',EN:'Feedback page background'},
                filter: true,
                showWhileScreenIsActive: 'openedScreen'
            },
            {
                selector: 'type=result backgroundImg',
                label: {RU:'Фон страниц результатов',EN:'Result page background'},
                filter: true,
                showWhileScreenIsActive: 'result'
            },

    {
        selector: 'id=mm backCardTexture',
        label: {RU:'Картинка для "рубашки" карточки',EN:'Card\'s back image'}
    },
    {
        selector: 'type=memoriz shareLink',
        rules: 'url',
        label: {RU:'Ссылка для поста в социальных сетях',EN:'Social post link'},
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
        selector: 'id=mm logoLink',
        rules: 'url',
        label: {RU:'Ссылка при клике на логотип',EN:'Logo link'},
        filter: false
    },
    {
        selector: 'id=mm downloadLink',
        rules: 'url',
        label: {RU:'Ссылка по кнопке "Скачать"',EN:'Download link'},
        filter: false
    },
    {
        // свойство для настройки кастомного урла картинки для публикации
        selector: 'appConstructor=mutapp _shareEntities.{{number}}.imgUrl',
        rules: 'imgForShare',
        updateScreens: false,
        label: {RU:'Картинка для публикации в соцсеть',EN:'Image for sharing'},
        filter: true
    },
    {
        // свойство для настройки урла на анонимку проекта
        selector: 'appConstructor=mutapp _anonymPageLink',
        rules: 'url',
        updateScreens: false,
        label: {RU:'_anonymPageLink',EN:'_anonymPageLink'},
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
            viewName: 'textinput',
            changeOnTimer: false
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
        label: {RU:"Выравнивание",EN:'Align'},
        filter: true
    },
    fontSize: {
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'textinput',
            changeOnTimer: false
        },
        label: {RU:'Размер шрифта',EN:'Font size'},
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
        label: {RU:'Шрифт',EN:'Font family'},
        filter: true
    },
    fontColor: {
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: {RU:'Цвет шрифта',EN:'Font color'},
        cssProperty: 'color',
        filter: true
    },
    hoverFontColor: {
        updateScreens: true,
        controls: "StringControl",
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: {RU:'Цвет шрифта при наведении',EN:'Hover font color'},
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
        label: {RU:'Картинка',EN:'Image'},
        filter: true
    },
    backgroundColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: {RU:'Цвет фона',EN:'Background color'},
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
        label: {RU:'Цвет фона при наведении',EN:'Hover background color'},
        cssProperty: 'background-color',
        filter: true
    },
    borderColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: {RU:'Цвет границы',EN:'Border color'},
        cssProperty: 'border-color',
        filter: true
    },
    hoverBorderColor: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            viewName: 'ColorPicker'
        },
        label: {RU:'Цвет бордера при наведении',EN:'Hover border color'},
        cssProperty: 'border-color',
        filter: true
    },
    // TODO эти стандартные правила можно вынести в движок
    borderRadius: {
        updateScreens: true,
        controls: 'StringControl',
        controlParams: {
            changeOnTimer: false
        },
        label: {RU:'Скругление углов',EN:'Corner radius'},
        cssProperty: 'border-radius',
        cssValuePattern: '{{number}}px',
        filter: true
    },
    borderWidth: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput",
            changeOnTimer: false
        },
        //TODO format cssValue: '{value}px' чтобы было понятно как формировать проперти
        cssProperty: 'border-width',
        cssValuePattern: '{{number}}px',
        label: {RU:"Толщина бордера",EN:'Border width'},
        filter: true
    },
    hoverBorderWidth: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "textinput",
            changeOnTimer: false
        },
        cssProperty: 'border-width',
        cssValuePattern: '{{number}}px',
        label: {RU:"Толщина бордера при наведении",EN:'Hover border width'},
        filter: true
    },
    topColontitleBottomBorderColor: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: {RU:"Цвет линии",EN:'Line color'},
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
        label: {RU:"Вкл/Откл",EN:'On/Off'}
    },
    padding: {
        label: {RU:'Отступ',EN:'Padding'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    paddingTop: {
        label: {RU:'Отступ сверху',EN:'Top padding'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding-top',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    paddingBottom: {
        label: {RU:'Отступ снизу',EN:'Bottom padding'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding-bottom',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    paddingLeft: {
        label: {RU:'Отступ слева',EN:'Left padding'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'padding-left',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    marginTop: {
        label: {RU:'Внешний отступ сверху',EN:'Top margin'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-top',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    marginBottom: {
        label: {RU:'Внешний отступ снизу',EN:'Bottom margin'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-bottom',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    marginLeft: {
        label: {RU:'Внешний отступ слева',EN:'Left margin'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-left',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
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
        label: {RU:'Картинка',EN:'Image'},
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
        label: {RU:'Фото-пара',EN:'Photo pair'},
        img: 'products/test_new/i/editor/Icon-text-vopros.png', // +devPrototypesHostName
        data: {
            //id: null, set programmatically
            cards: [
                {
                    uiTemplate: 'id-card_text_template',
                    text: 'Option 1',
                    img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/ocean.jpg'
                },
                {
                    uiTemplate: 'id-card_text_template',
                    text: 'Option 1',
                    img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/ocean.jpg'
                }
            ],
            guessed: false,
            explanation: {
                title: 'Header',
                text: 'Input feedback text here'
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