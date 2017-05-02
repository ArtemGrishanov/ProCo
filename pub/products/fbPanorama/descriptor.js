/**
 * Created by artyom.grishanov on 13.09.16.
 *
 */
var descriptor = {};

descriptor.css = [

];

descriptor.app = [
    {
        selector: 'id=mm photoViewerMode',
        // контролы не нужны
        // это скрытое свойства для переключение между facebook и универсальной панорамой в плеере
    },
    {
        // Скомпилированная картинка для плеера photo-sphere-viewer
        // устанавливается в fbPanoramaPublisher
        selector: 'id=mm panoCompiledImage'
    },
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
    },
    {
        selector: 'id=mm pins.{{number}}.modArrow',
        rules: 'pinArrowForm'
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
                            pinWr.append('<div class="pin_wr ar_bottom" data-option-index="'+newIndex+'" data-app-property="id=mm pins.'+newIndex+'.position, id=mm pins.'+newIndex+'.data.text, id=mm pins(deletePin), id=mm pins.'+newIndex+'.modArrow " style="top: '+param.cursorPosition.top+'px; left: '+param.cursorPosition.left+'px; outline: none;" contenteditable="true">Введите текст</div>')

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
                    }
                }
            }
        ]
    },
    pinArrowForm: {
        updateScreens: true,
        controls: "Alternative",
        controlParams: {
            viewName: "AltButtons",
            useCustomFunctionForSetValue: true,
            onSetValue: function(params) {
                var Engine = params.engine;
                var Editor = params.editor;
                var pinIndex = this.$productDOMElement.attr('data-option-index');
                params.app.model.attributes.pins[pinIndex].modArrow = params.value;
                var ap = Engine.getAppProperty(params.propertyString);
                Engine.setValue(ap, params.value);
                params.app._screens[0].$el.find('.js-pins_cnt').find('.pin_wr[data-option-index='+pinIndex+']').attr('class','pin_wr '+params.value);
                this.$productDOMElement.attr('class','pin_wr '+params.value);
            }
        },
        possibleValues: [
            {value:"ar_bottom_left",icon:"i/altern/ar_btm_l.png"},
            {value:"ar_bottom",icon:"i/altern/ar_btm.png"},
            {value:"ar_bottom_right",icon:"i/altern/ar_btm_r.png"},
            {value:"ar_top_left",icon:"i/altern/ar_top_l.png"},
            {value:"ar_top",icon:"i/altern/ar_top.png"},
            {value:"ar_top_right",icon:"i/altern/ar_top_r.png"}
        ],
        label: {RU:'Форма стикера',EN:'Sticker form'},
        filter: true,
        updateAppProperties: false, // важно!
        restartApp: false, // важно!
        updateScreens: false
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
        label: {RU:'Текстовая метка',EN:'Text sticker'},
        img: null, // картинка для мультивыбора в диалоге
        data: {
            id: '12345678',
            data: {
                text: 'Input text'
            },
            position: {
                left: 400,
                top: 280
            },
            uiTemplate: 'id-text_pin_template',
            modArrow: 'ar_bottom'
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

descriptor.hooks = {
    /**
     * Вызывается перед показом превью проекта
     * Для панорамы необходимо создать и заапоадить на сервер новую картинку перед показом
     *
     * @param {Object} param.editorEnvironment основные объекты для работы в Editor
     * @param {function} callback - вызвать когда хук завершился
     */
    beforePreview: function(param, callback) {
        var Modal = param.editorEnvironment.Modal;
        Modal.showLoading();
        var App = param.editorEnvironment.App;
        var config = param.editorEnvironment.config;
        var Editor = param.editorEnvironment.Editor;
        var Engine = param.editorEnvironment.Engine;
        var appIframe = Editor.getAppIframe();
        var appModel = appIframe.contentWindow.app.model;
        var photoViewerMode = appModel.attributes.photoViewerMode;
        var panoCanvas = appModel.createPanoCanvas();

        var awsImageUrl = App.getUserData().id+'/'+Editor.getAppId()+'/forFBUpload.jpg';
        param.editorEnvironment.s3util.uploadCanvas(App.getAWSBucketForPublishedProjects(), function(result) {
            if (result === 'ok') {
                var uploadedPanoUrl = 'http:'+config.common.publishedProjectsHostName + awsImageUrl;
                if (photoViewerMode === true) {
                    // установить зааплоденную картинку в пирложение
                    var apPanoImg = Engine.getAppProperty('id=mm panoCompiledImage');
                    Engine.setValue(apPanoImg, uploadedPanoUrl, {
                        updateAppProperties: false,
                        updateScreens: false
                    });
                }
                callback('ok', null);
                Modal.hideLoading();
            }
            else {
                callback('error', null);
                Modal.hideLoading();
            }
        }, awsImageUrl, panoCanvas);
    }
};