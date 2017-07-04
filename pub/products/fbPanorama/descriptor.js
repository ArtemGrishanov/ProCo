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
        label: '<div style="margin-top:30px;text-align:center;"><img src="controls/i/icon-picture.png"/><p style="padding-left: 11px;margin-top: 20px;font-size: 14px;text-align: left;line-height: 1.2em;">Загрузить другое изображение</p><p style="padding-left: 11px;text-align: left;line-height: 1.2em;">Рекомендуемый размер - более 1600x1200 px</p></div>',
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
    },
    {
        selector: 'id=mm pins.{{number}}.backgroundColor',
        rules: 'backgroundColor',
        updateScreens: false,
        restartApp: false,
        renderScreens: ['panoramaEditScr'],
        label: {RU:'Цвет стикера',EN:'Background color'}
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
    // с помощью клика по dom-елементу добавляется элемент в массив
    createPin: {
        updateScreens: false,
        restartApp: false,
        renderScreens: ['panoramaEditScr'],
        controls: 'ClickAndAddToArray',
        canAdd: ["proto__pin_text"],
        controlParams: {
            scale: 'id=mm previewScale'
        },
    },
//    createPin: {
//        canAdd: ["proto__pin_text"],
//        controls: [
//            {
//                name: "CustomQControl",
//                params: {
//                    /**
//                     *
//                     * @param param.cursorPosition
//                     * @param param.app
//                     * @param param.appScreens
//                     * @param param.engine
//                     * @param param.propertyString
//                     */
//                    onProductDOMElementClick: function(param) {
//                        // добавление пинов чтобы избежать перезагрузки приложения.
//                        var prototypeName = 'proto__pin_text';
//                        var Engine = param.engine;
//                        var Editor = param.editor;
////                        var pinWr = param.app._screens[0].$el.find('.js-pins_cnt')
//                        var newIndex = param.app.model.attributes.pins.length;
//                        var previewScale = param.app.model.attributes.previewScale;
//                        var ap = Engine.getAppProperty(param.propertyString);
//                        var proto = Engine.getPrototypeForAppProperty(ap, prototypeName);
//                        if (proto) {
//                            var value = proto.getValue({position:{
//                                left: Math.round(param.cursorPosition.left / previewScale),
//                                top: Math.round(param.cursorPosition.top / previewScale)
//                            }});
////                            pinWr.append('<div class="pin_wr ar_bottom" data-option-index="'+newIndex+'" data-app-property="id=mm pins.'+newIndex+'.backgroundColor, id=mm pins.'+newIndex+'.position, id=mm pins.'+newIndex+'.data.text, id=mm pins(deletePin), id=mm pins.'+newIndex+'.modArrow " style="textAlign:center;top: '+param.cursorPosition.top+'px; left: '+param.cursorPosition.left+'px; outline: none;" contenteditable="true">Введите текст</div>')
//
//                            //UPD снова не надо
//                            // отдельно добавить напрямую в приложение. Так как перезапуска приложения с передачей параметров избегаем
//                            //param.app.model.attributes.pins.push(value);
//
//                            // установка как бы обычным способом, но без перезапуска приложения
//                            Engine.addArrayElement(ap, value, -1, {
//                                restartApp: false,
//                                // надо апдейтить чтобы создались новые контролы для нового элемента
//                                updateScreens: true
//                            });
//
//                            // но в самом скрине не происходит render() так как не хотим перезапускать приложение
//                            // а значит клонируется старый экран со старым же положением меток и старым неактуальным текстом
//                            // поэтому вот тут руками апдейтим, жесть
////                            var appScrPinWr = Engine.getAppScreen('panoramaEditScr').view.find('.js-pins_cnt');
////                            for (var i = 0; i < param.app.model.attributes.pins.length; i++) {
////                                var p = param.app.model.attributes.pins[i];
////                                var pv = appScrPinWr.find('.pin_wr[data-option-index='+i+']');
////                                pv.css('top', (p.position.top*previewScale)+'px').css('left', (p.position.left*previewScale)+'px');
////                                pv.html(p.data.text);
////                            }
//
//                            Editor.syncUIControlsToAppProperties();
//                        }
//                    },
//                    onShow: function(param) {
//                    }
//                }
//            }
//        ]
//    },
    pinArrowForm: {
        controls: "Alternative",
        controlParams: {
            viewName: "AltButtons",
            useCustomFunctionForSetValue: false, //true,
            onSetValue: function(params) {
                // experiment

                console.log('fbPanorama.descriptor: pinArrowForm.onSetValue');
                var Engine = params.engine;

                // эмуляция установки одного свойства без перезапуска в engine.setValue
                //TODO конечно надо использовать propertyString для установки, центрально через mutapp
                //TODO использовать set в модели чтобы срабатывали обработчики... иногда можно иногда нельзя
//                var pinIndex = this.$productDOMElement.attr('data-option-index');
//                params.app.model.attributes.pins[pinIndex].modArrow = params.value;

                params.app.setPropertyByAppString(params.propertyString, params.value);

                //TODO должна ли автоматически срабатывать зависимость на render экрана? или по старинке по дескриптору определяем
                //updateScreens можно прописывать идишки экранов рендера
                var scr = params.app._screens[0];
                scr.render();
                // это будет в движке происходить нормальным образом
                var ap = Engine.getAppProperty(params.propertyString);
                Engine.setValue(ap, params.value, {
                    // перерисовали ранее экран руками, теперь обновить AppScreen
                    updateScreens: false
                });


//                var Engine = params.engine;
//                var Editor = params.editor;
//                var pinIndex = this.$productDOMElement.attr('data-option-index');
//                var pinData = params.app.model.attributes.pins[pinIndex];
//                pinData.modArrow = params.value;
//                var ap = Engine.getAppProperty(params.propertyString);
//                Engine.setValue(ap, params.value);
//                var textAlign = 'left';
//                switch(params.value) {
//                    case 'ar_top':
//                    case 'ar_bottom': {
//                        textAlign = 'center';
//                        break;
//                    }
//                    case 'ar_top_right':
//                    case 'ar_bottom_right': {
//                        textAlign = 'right';
//                        break;
//                    }
//                }
//
//                var $pin = params.app._screens[0].$el.find('.js-pins_cnt').find('.pin_wr[data-option-index='+pinIndex+']').attr('class','pin_wr '+params.value).css('text-align',textAlign);
//                this.$productDOMElement.attr('class','pin_wr '+params.value).css('text-align',textAlign);
//
//                var scr = params.app._screens[0];
//                scr.setPinAfterColor($pin, pinIndex, params.value, pinData.backgroundColor, params.appScreens[0].view);
            }
        },
        possibleValues: [
            {value:"ar_bottom_left",icon:{normal:"i/altern/sticker_1.png",selected:"i/altern/sticker_1_selected.png"}},
            {value:"ar_bottom",icon:{normal:"i/altern/sticker_2.png",selected:"i/altern/sticker_2_selected.png"}},
            {value:"ar_bottom_right",icon:{normal:"i/altern/sticker_3.png",selected:"i/altern/sticker_3_selected.png"}},
            {value:"ar_top_left",icon:{normal:"i/altern/sticker_4.png",selected:"i/altern/sticker_4_selected.png"}},
            {value:"ar_top",icon:{normal:"i/altern/sticker_5.png",selected:"i/altern/sticker_5_selected.png"}},
            {value:"ar_top_right",icon:{normal:"i/altern/sticker_6.png",selected:"i/altern/sticker_6_selected.png"}}
        ],
        label: {RU:'Форма стикера',EN:'Sticker form'},
        filter: true,
        updateAppProperties: false, // важно!
        restartApp: false, // важно!
        updateScreens: false,
        renderScreens: ['panoramaEditScr']
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
            backgroundColor: '#33bbed', // цвет фона
            color: '#fff', // цвет текста
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