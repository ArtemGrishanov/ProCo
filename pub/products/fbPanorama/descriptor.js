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
            scale: 'id=mm previewScale',
            onMouseDownStopPropagation: false
        },
        updateScreens: false,
        updateAppProperties: false, // важно!
        restartApp: false // важно!
    },
    {
        selector: 'id=mm pins.{{number}}.data.text',
        rules: 'text',
        updateAppProperties: false, // важно!
        restartApp: false // важно!
    }
];

// правила, как редактировать свойства
descriptor.rules = {
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
            viewName: 'textinput',
            changeOnTimer: false
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
            viewName: 'textinput',
            changeOnTimer: false
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
            changeOnTimer: false
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
            viewName: "textinput",
            changeOnTimer: false
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
            viewName: "textinput",
            changeOnTimer: false
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
        filter: true,
        controlParams: {
            changeOnTimer: false
        }
    },
    paddingTop: {
        label: 'Паддинг сверху',
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
        label: 'Паддинг снизу',
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
        label: 'Паддинг слева',
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
        label: 'Маргин сверху',
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
        label: 'Маргин снизу',
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
        label: 'Маргин слева',
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
        label: 'Картинка',
        filter: true
    },
//    // с помощью клика по dom-елементу добавляется элемент в массив
//    createPin: {
//        updateScreens: false,
//        controls: 'ClickAndAddToArray',
//        canAdd: ["proto__pin_text"],
//        controlParams: {
//            scale: 'id=mm previewScale'
//        },
//    },
    createPin: {
        canAdd: ["proto__pin_text"],
        controls: [
            {
                name: "CustomQControl",
                params: {
                    /**
                     *
                     * @param param.cursorPosition
                     * @param param.app
                     * @param param.appScreens
                     * @param param.engine
                     * @param param.propertyString
                     */
                    onProductDOMElementClick: function(param) {
                        // добавление пинов чтобы избежать перезагрузки приложения.
                        var prototypeName = 'proto__pin_text';
                        var Engine = param.engine;
                        var Editor = param.editor;
                        //var pinWr = param.appScreens[0].view.find('.js-pins_cnt');
                        var pinWr = param.app._screens[0].$el.find('.js-pins_cnt')
                        var newIndex = param.app.model.attributes.pins.length;
                        var previewScale = param.app.model.attributes.previewScale;
                        var ap = Engine.getAppProperty(param.propertyString);
                        var proto = Engine.getPrototypeForAppProperty(ap, prototypeName);
                        if (proto) {
                            var value = proto.getValue({position:{
                                left: Math.round(param.cursorPosition.left / previewScale),
                                top: Math.round(param.cursorPosition.top / previewScale)
                            }});
                            pinWr.append('<div class="pin_wr" data-option-index="'+newIndex+'" data-app-property="id=mm pins.'+newIndex+'.position, id=mm pins.'+newIndex+'.data.text, id=mm pins(deletePin)" style="top: '+param.cursorPosition.top+'px; left: '+param.cursorPosition.left+'px; outline: none;" contenteditable="true">Пример метки<br>на панораме</div>')

                            //UPD снова не надо
                            // отдельно добавить напрямую в приложение. Так как перезапуска приложения с передачей параметров избегаем
                            //param.app.model.attributes.pins.push(value);

                            // установка как бы обычным способом, но без перезапуска приложения
                            Engine.addArrayElement(ap, value, -1, {
                                restartApp: false,
                                // надо апдейтить чтобы создались новые контролы для нового элемента
                                updateScreens: true
                            });

                            // но в самом скрине не происходит render() так как не хотим перезапускать приложение
                            // а значит клонируется старый экран со старым же положением меток и старым неактуальным текстом
                            // поэтому вот тут руками апдейтим, жесть
                            var appScrPinWr = Engine.getAppScreen('panoramaEditScr').view.find('.js-pins_cnt');
                            for (var i = 0; i < param.app.model.attributes.pins.length; i++) {
                                var p = param.app.model.attributes.pins[i];
                                var pv = appScrPinWr.find('.pin_wr[data-option-index='+i+']');
                                pv.css('top', (p.position.top*previewScale)+'px').css('left', (p.position.left*previewScale)+'px');
                                pv.html(p.data.text);
                            }

                            Editor.syncUIControlsToAppProperties();
                        }
                    },
                    onShow: function(param) {
//                        var optionId = $(this.$productDomElement).attr('data-id');
//                        var questionIndex = $(this.$productDomElement).attr('data-question-index');
//                        if (optionId && questionIndex) {
//                            var correctId = param.app._models[0].getCorrectAnswerId(questionIndex);
//                            if (correctId===optionId) {
//                                this.setView('<div style="background-color:green;"><img src="controls/i/Panel-set-as-right.png"></div>');
//                            }
//                            else {
//                                this.setView('<div style="cursor:pointer"><img src="controls/i/Panel-set-as-right.png"></div>');
//                            }
//                        }
//                        else {
//                            log('Descriptor.setCorrectAnswer: option data-id or data-question-index is not set');
//                        }
                    }
                }
            }
        ]
    },
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
                text: 'Введите текст'
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