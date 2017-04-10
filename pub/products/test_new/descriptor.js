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
        // кнопка "скачать", чтобы можно было отдельный стиль задать
        selector: '.js-download_btn',
        rules: 'backgroundColor fontColor fontSize fontFamily borderColor borderRadius borderWidth paddingTop paddingBottom'
    },
    {
        selector: '.js-test_btn',
        applyCssTo: '.js-btn_wr',
        rules: 'textAlign marginTop marginBottom paddingLeft'
    },
    {
        selector: '.js-download_btn',
        applyCssTo: '.js-download_btn_wr',
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
        label: {RU:'Цвет фона теста',EN:'Quiz background color'},
        filter: false,
        rules: 'backgroundColor'
    }
];

descriptor.app = [
    {
        selector: 'id=startScr logoPosition, type=questions logoPosition, type=result logoPosition, type=result fbSharePosition, type=result vkSharePosition',
        rules: 'drag'
    },
    {
        selector: 'id=tm questionProgressPosition',
        updateScreens: true, // потому что в рамках одной сессии надо менять позицию этого элемента на нескольких экранах
        rules: 'drag'
    },
    {
        selector: 'type=result showDownload, type=questions showExplanation, id=startScr showLogo, type=questions showLogo, type=result showLogo, id=tm fbShareEnabled, id=tm vkShareEnabled, id=tm showQuestionProgress, id=tm showBullits, id=tm showTopColontitle, id=tm showBackgroundImage, id=tm randomizeQuestions, id=startScr shadowEnable, type=questions shadowEnable, type=result shadowEnable',
        rules: 'trueFalse'
    },
            {
                selector: 'type=questions showExplanation',
                label: {RU:'Показывать фидбек',EN:'Show feedback'}
            },
            {
                selector: 'id=startScr showLogo',
                label: {RU:'Логотип на стартовой',EN:'Logo on start screen'}
            },
            {
                selector: 'type=questions showLogo',
                label: {RU:'Логотип в вопросах',EN:'Logo on question screens'}
            },
            {
                selector: 'type=result showLogo',
                label: {RU:'Логотип в результатах',EN:'Logo on result screens'}
            },
            {
                selector: 'type=result showDownload',
                label: {RU: 'Кнопка "Скачать" на экране результата', EN: '"Download" button on result screen'}
            },
            {
                selector: 'id=tm showBackgroundImage',
                label: {RU:'Показывать фоновую картинку',EN:'Show background image'},
                rules: 'trueFalse'
            },
            {
                selector: 'id=tm showBullits',
                label: {RU:'Показывать буллиты вариантов ответа',EN:'Show option bullits'}
            },
            {
                selector: 'id=tm fbShareEnabled',
                label: {RU:'Поделиться результатом в Facebook',EN:'Facebook sharing'}
            },
            {
                selector: 'id=tm vkShareEnabled',
                label: {RU:'Поделиться результатом во ВКонтакте',EN:'VK sharing'}
            },
            {
                selector: 'id=tm showQuestionProgress',
                label: {RU:'Показывать прогресс вопросов',EN:'Show question progress'}
            },
            {
                selector: 'id=tm showTopColontitle',
                label: {RU:'Верхний колонтитул',EN:'Show colontitle'}
            },
            {
                selector: 'id=tm randomizeQuestions',
                label: {RU:'Перемешивать вопросы',EN:'Random question order'}
            },
            {
                selector: 'id=startScr shadowEnable',
                label: {RU:'Затемнение фона',EN:'Background shadow'},
                filter: true,
                showWhileScreenIsActive: 'startScr'
            },
            {
                selector: 'type=questions shadowEnable',
                label: {RU:'Затемнение фона',EN:'Background shadow'},
                filter: true,
                showWhileScreenIsActive: 'questionScreen'
            },
            {
                selector: 'type=result shadowEnable',
                label: {RU:'Затемнение фона',EN:'Background shadow'},
                filter: true,
                showWhileScreenIsActive: 'resultScreen'
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
                selector: 'id=startScr backgroundImg',
                label: {RU:'Фон стартовой страницы',EN:'Start page background'},
                showWhileScreenIsActive: 'startScr'
            },
            {
                selector: 'type=questions backgroundImg',
                label: {RU:'Фон страниц вопросов',EN:'Question pages background'},
                showWhileScreenIsActive: 'questionScreen'
            },
            {
                selector: 'type=result backgroundImg',
                label: {RU:'Фон страниц результатов',EN:'Result pages background'},
                showWhileScreenIsActive: 'resultScreen'
            },
            {
                selector: 'id=tm logoUrl',
                label: {RU:'Logo image',EN:'Картинка логотипа'}
            },
    {
        selector: 'id=tm quiz.{{number}}.question.text, id=tm quiz.{{number}}.answer.options.{{number}}.text, id=tm results.{{number}}.title, id=tm results.{{number}}.description, id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText, type=result restartButtonText, type=result downloadButtonText, type=questions topColontitleText',
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
        label: {RU:'Ссылка для поста в социальной сети',EN:'Link for post in social network'},
        filter: false
    },
    {
        selector: 'id=tm logoLink',
        rules: 'url',
        label: {RU:'Ссылка при клике на логотип',EN:'Logo link'},
        filter: false
    },
    {
        selector: 'id=tm downloadLink',
        rules: 'url',
        label: {RU:'Ссылка по кнопке "Скачать"',EN:'"Download" button link'},
        filter: false
    },
    {
        // свойство для настройки кастомного урла картинки для публикации
        selector: 'appConstructor=mutapp _shareEntities.{{number}}.imgUrl',
        rules: 'imgForShare',
        updateScreens: false,
        label: {RU:'Картинка для публикации в соцсеть',EN:'Result image for sharing'},
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
            {value:"left",icon:"i/align-left.png"},
            {value:"center",icon:"i/align-center.png"},
            {value:"right",icon:"i/align-right.png"}
        ],
        label: {RU:'Выравнивание',EN:'Align'},
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
    showQuestionProgress: {
        updateScreens: true,
        runTests: false,
        controls: "OnOff",
        controlParams: {
            viewName: "OnOffSwitcher"
        },
        label: {RU:'Показывать номер вопроса',EN:'Show question number'},
    },
    //TODO не придумал как объединить borderWidth+hoverBorderWidth
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
        label: {RU:'Толщина бордера',EN:'Border width'},
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
        label: {RU:'Толщина бордера при наведении',EN:'Hover border width'},
        filter: true
    },
    topColontitleBottomBorderColor: {
        updateScreens: true,
        runTests: false,
        controls: "StringControl",
        controlParams: {
            viewName: "ColorPicker"
        },
        label: {RU:'Цвет линии',EN:'Line color'},
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
                        var activeStyle = 'background-color:#1cbf61;';
                        var style = 'height:24px;border-radius:4px;padding:0px 4px 4px;font-size:14px;';
                        // получаем ид опции
                        var optionId = $(this.$productDomElement).attr('data-id');
                        if (optionId) {
                            this.setView('<div style="'+activeStyle+style+'"><img style="padding-bottom:2px" src="controls/i/Panel-set-as-right.png"><span class="pts_string pts_correct_answer">Верный ответ</span></div>');
                            param.app._models[0].setCorrectAnswer(optionId);
                        }
                        else {
                            log('Descriptor.setCorrectAnswer: option data-id is not set');
                        }
                    },
                    onShow: function(param) {
                        var activeStyle = 'background-color:#1cbf61;';
                        var style = 'height:24px;border-radius:4px;padding:0px 4px 4px;font-size:14px;';
                        var optionId = $(this.$productDomElement).attr('data-id');
                        var questionIndex = $(this.$productDomElement).attr('data-question-index');
                        if (optionId && questionIndex) {
                            var correctId = param.app._models[0].getCorrectAnswerId(questionIndex);
                            if (correctId===optionId) {
                                this.setView('<div style="'+activeStyle+style+'"><img style="padding-bottom:2px" src="controls/i/Panel-set-as-right.png"><span class="pts_string pts_correct_answer">Верный ответ</span></div>');
                            }
                            else {
                                this.setView('<div style="'+style+'cursor:pointer"><img style="padding-bottom:2px" src="controls/i/Panel-set-as-right.png"><span class="pts_string pts_correct_answer">Верный ответ</span></div>');
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
        label: {RU:'Вкл/Откл',EN:'On/Off'},
    },
    paddingTop: {
        label: {RU:'Отступ сверху',EN:'Padding top'},
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
        label: {RU:'Отступ снизу',EN:'Padding bottom'},
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
        label: {RU:'Отступ слева',EN:'Padding left'},
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
        label: {RU:'Внешний отступ сверху',EN:'Margin top'},
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
        label: {RU:'Внешний отступ снизу',EN:'Margin bottom'},
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
        label: {RU:'Внешний отступ слева',EN:'Margin left'},
        controls: 'StringControl',
        updateScreens: true,
        cssProperty: 'margin-left',
        cssValuePattern: '{{number}}px',
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
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
        label: {RU:'Текстовый вопрос',EN:'Text question'},
        img: 'products/test_new/i/editor/Icon-text-vopros.png', // +devPrototypesHostName
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
        label: {RU:'Фото вопрос',EN:'Photo question'},
        img: 'products/test_new/i/editor/Icon-fotovopros.png', // +devPrototypesHostName,
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
        label: {RU:'Фотоответы',EN:'Question with photo options'},
        img: 'products/test_new/i/editor/Icon-fotootvet.png',
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