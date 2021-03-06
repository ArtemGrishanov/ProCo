/**
 * Created by artyom.grishanov on 09.01.17.
 */
var FbPanoramaApp = MutApp.extend({

    type: 'fbPanorama',
    model: null,
    screenRoot: $('#id-mutapp_screens'),
    editScr: null,
    canvasScr: null,
    /**
     * Схема свойств MutAppProperty в этом приложении
     */
    mutAppSchema: new MutAppSchema({
        "appConstructor=mutapp shareLink": {
            // скрываем стандартное свойство, не нужно оно здесь
            controlFilter: 'hidden'
        },
        "appConstructor=mutapp gaId": {
            // скрываем стандартное свойство, не нужно оно здесь
            controlFilter: 'hidden'
        },
        /**
         * это скрытое свойства для переключение между facebook и универсальной панорамой в плеере
         */
        "id=mm photoViewerMode": {

        },
        /**
         * Скомпилированная картинка для плеера photo-sphere-viewer
         * устанавливается в fbPanoramaPublisher
         */
        "id=mm panoCompiledImage": {

        },
        "id=mm pins": {
            label: {RU:'Метки на панораме',EN:'Panorama pins'},
            controls: [{
                name: "PanoramaAddSticker",
                param: {
                    scale: 'id=mm previewScale'
                }
            }, "DeleteDictionaryElementControl"],
            prototypes: [{
                protoFunction:'id=mm pinProto1',
                label: {RU:'Метка',EN:'Pin'},
                img: null
            }],
            children: {
                "id=mm pins.{{id}}.position": {
                    controls: {
                        name: 'Drag',
                        param: {
                            scale: 'id=mm previewScale',
                            onMouseDownStopPropagation: false,
                            draggableParentSelector: '.js-pins_cnt'
                        }
                    }
                },
                "id=mm pins.{{id}}.data.text": {
                    controls: "TextQuickInput"
                },
                "id=mm pins.{{id}}.modArrow": {
                    label: {RU:'Форма стикера',EN:'Sticker form'},
                    controls: {
                        name: "Alternative",
                        view: 'altbuttons',
                        param: {
                            possibleValues: [
                                {value:"ar_bottom_left",icon:{normal:"i/altern/sticker_1.png",selected:"i/altern/sticker_1_selected.png"}},
                                {value:"ar_bottom",icon:{normal:"i/altern/sticker_2.png",selected:"i/altern/sticker_2_selected.png"}},
                                {value:"ar_bottom_right",icon:{normal:"i/altern/sticker_3.png",selected:"i/altern/sticker_3_selected.png"}},
                                {value:"ar_top_left",icon:{normal:"i/altern/sticker_4.png",selected:"i/altern/sticker_4_selected.png"}},
                                {value:"ar_top",icon:{normal:"i/altern/sticker_5.png",selected:"i/altern/sticker_5_selected.png"}},
                                {value:"ar_top_right",icon:{normal:"i/altern/sticker_6.png",selected:"i/altern/sticker_6_selected.png"}}
                            ]
                        }
                    },
                    controlFilter: 'onclick'
                }
            }
        },
        "id=mm pinsBackgroundColor": {
            label: {RU:'Цвет стикера',EN:'Background color'},
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            },
            controlFilter: 'screen(id=panoramaEditScr)'
        },
        "id=mm pinsFontColor": {
            label: {RU:'Цвет шрифта',EN:'Font color'},
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            },
            controlFilter: 'screen(id=panoramaEditScr)'
        },
        "id=mm panoramaImgSrc": {
            label: {
                RU:'<div style="margin-top:30px;text-align:center;"><img src="//p.testix.me/images/products/fbPanorama/icon-picture.png"/><p style="padding-left: 11px;margin-top: 20px;font-size: 14px;text-align: left;line-height: 1.2em;">Загрузить другое изображение</p><p style="padding-left: 11px;text-align: left;line-height: 1.2em;">Рекомендуемый размер - более 1600x1200 px</p></div>',
                EN:'<div style="margin-top:30px;text-align:center;"><img src="//p.testix.me/images/products/fbPanorama/icon-picture.png"/><p style="padding-left: 11px;margin-top: 20px;font-size: 14px;text-align: left;line-height: 1.2em;">Load panorama image</p><p style="padding-left: 11px;text-align: left;line-height: 1.2em;">Recommended size - more then 1600x1200 px</p></div>'
            },
            controls: 'ChooseImage',
            controlFilter: "always"
        }
    }),

    initialize: function(param) {
        var mm = this.addModel(new FbPanoramaModel({
            application: this
        }));
        this.model = mm;

        this.editScr = new PanoramaEditScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.editScr);

        this.canvasScr = new CanvasScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.canvasScr);

        this.panoViewerScr = new PanoViewerScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.panoViewerScr);

        this.title = 'Facebook Panorama';
        this.description = 'Create Facebook panorama on Testix.me';
    },

    start: function() {
        this._models[0].start();
    },

    showEdit: function() {
        this.showScreen(this.editScr);
    },

    showCanvas: function() {
        this.showScreen(this.canvasScr);
    },

    /**
     * Вернуть фрагмен html из которго будет сгенерирована картинка
     *
     * @returns {*}
     */
    getAutoPreviewHtml: function() {
        return '<img src="' + this.model.attributes.panoramaImgSrc.getValue() + '" width="400px"/>';
    }
});