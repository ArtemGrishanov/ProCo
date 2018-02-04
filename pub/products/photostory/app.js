/**
 * Created by artyom.grishanov on 14.01.18.
 *
 */
var PhotostoryApp = MutApp.extend({

    type: 'photostory',
    model: null,
    slider: null,
    screenRoot: $('#id-mutapp_screens'),
    slidesEditScreens: [],
    /**
     * Схема свойств MutAppProperty в этом приложении
     */
    mutAppSchema: new MutAppSchema({
        "appConstructor=mutapp shareEntities.{{id}}.imgUrl": {
            // это свойство описано в клиентской части а не в mutapp.js так как фильтр по экрану может указать только клиент
            label: {RU: 'Картинка для шаринга', EN: 'Sharing image'},
            controls: 'ChooseSharingImage',
            controlFilter: 'screen(type=result)' // клиент знает какие экраны есть в приложении. А в мемори только один экран результата
        },
        "id=psm slides": {
            label: {RU:'Вопросы теста',EN:'Photostory quiz'},
            prototypes: [
                {
                    protoFunction: 'id=psm slideProto1', // функция в приложении, которая вернет новый объект
                    label: {RU:'Слайд 1',EN:'Slide 1'},
                    imgSrc: '//p.testix.me/images/products/photostory/editor/Icon-text-vopros.png'
                }
//                {
//                    protoFunction: 'id=psm slideProto2', // функция в приложении, которая вернет новый объект
//                    label: {RU:'Фото вопрос',EN:'Photo question'},
//                    img: '//p.testix.me/images/products/photostory/editor/Icon-fotovopros.png'
//                }
            ],
            children: {
                "id=psm slides.{{id}}.text": {
                    controls: "TextQuickInput"
                },
                "id=psm slides.{{id}}.imgSrc": {
                    label: {RU:'Картинка слайда',EN:'Slide image'},
                    controls: 'ChooseImage',
                    controlFilter: 'screenPropertyString'
                }
            }
        },
        "id=psm resultTitle": {
            controls: "TextQuickInput"
        },
        "id=psm resultDescription": {
            controls: "TextQuickInput"
        },
        "id=psm restartButtonText": {
            controls: "TextQuickInput"
        },
        "id=psm downloadButtonText": {
            controls: "TextQuickInput"
        },
        "id=psm showDownload": {
            label: {RU:'Кнопка "Скачать"', EN:'Download button'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=psm shadowEnableInResults": {
            label: {RU:'Включить тень', EN:'Shadow enable'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)' // 'always', 'screen(startScr)', 'onclick', 'hidden'
        },
        "id=psm logoPositionInResults": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=psm showLogoInResults": {
            label: {RU:'Показывать лого в результатах',EN:'Show logo on result screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=psm fbSharingEnabled": {
            label: {RU:'Шаринг в Facebook',EN:'Facebook sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=psm vkSharingEnabled": {
            label: {RU:'Шаринг во ВКонтакте',EN:'Vk.com sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=psm fbSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=psm vkSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=psm logoUrl": {
            label: {RU: 'Логотип', EN: 'Logo'},
            controls: 'ChooseImage',
            controlFilter: 'always'
        },
        "id=psm logoLink": {
            label: {RU: 'Ссылка по клику на лого', EN: 'Logo click link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=psm downloadLink": {
            label: {RU: 'Ссылка по кнопке "Скачать"', EN: 'Download button link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=psm resultBackgroundImage": {
            label: {RU: 'Фоновая картинка', EN: 'Background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(type=results)'
        },
        ".js-result_title color, .js-result_description color, .js-download_btn color, .js-restart color, .js-slide_text color, .js-slide_num color": {
            label: {RU:'Цвет шрифта',EN:'Font color'},
            controlFilter: 'onclick',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        },
        ".js-result_back_color background-color": {
            label: {RU:'Цвет фона экрана',EN:'Screen background color'},
            controlFilter: 'screen(id=resultScr)',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        },
        ".js-slide_back_color background-color": {
            label: {RU:'Цвет фона',EN:'Background color'},
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            },
            controlFilter: 'screen(type=slideEdit)'
        },
        ".js-slider_item background-color": {
            label: {RU:'Фон под картинкой',EN:'Background color under image'},
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            },
            controlFilter: 'screen(type=slideEdit)'
        },
        ".js-result_title font-size, .js-result_description font-size, .js-download_btn font-size, .js-restart font-size, .js-slide_text font-size, .js-slide_num font-size": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Размер шрифта',EN:'Font size'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 8,
            maxValue: 50
        },
        ".js-result_title padding-top, .js-result_description padding-top, js-download_btn_wr padding-top, .js-restart_btn_wr padding-top, js-result_collage_wr padding-top, .js-slide_text padding-top": {
            label: {RU:'Отступ сверху',EN:'Padding top'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 0,
            maxValue: 200
        },
        ".js-result_title padding-bottom, .js-result_description padding-bottom, js-download_btn_wr padding-bottom, .js-restart_btn_wr padding-bottom, js-result_collage_wr padding-bottom, .js-slide_text padding-bottom": {
            label: {RU:'Отступ снизу',EN:'Padding bottom'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 0,
            maxValue: 200
        },
        ".js-result_title padding-left, .js-result_description padding-left, .js-slide_text padding-left": {
            label: {RU:'Отступ слева',EN:'Padding left'},
            controls: "StringControl",
            controlFilter: 'onclick',
            valuePattern: '{{number}}px',
            minValue: 0,
            maxValue: 200
        },
        ".js-result_title text-align, .js-result_description text-align, .js-slide_text text-align": {
            label: {RU:'Выравнивание текста',EN:'Text-align'},
            controlFilter: 'onclick',
            controls: {
                name:"Alternative",
                view: 'altbuttons',
                param: {
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
                }
            }
        },
        ".js-result_title font-family, .js-result_description font-family, .js-download_btn font-family, .js-restart font-family, .js-slide_text font-family, .js-slide_num font-family": {
            label: {RU:'Шрифт',EN:'Font family'},
            controlFilter: 'onclick',
            controls: {
                name:"Alternative",
                view: 'dropdown',
                param: {
                    possibleValues: ["Arial","Times New Roman"]
                }
            }
        },
        ".js-download_btn background-color, .js-restart background-color": {
            // css mutAppProperty описываются только схемой
            label: {RU:'Цвет фона кнопки',EN:'Button background color'},
            controlFilter: 'onclick',
            controls: {
                name: "StringControl",
                view: 'ColorPicker'
            }
        }
    }),
    /**
     * Конструктор приложения: создание моделей и экранов
     * @param param
     */
    initialize: function(param) {
        var psm = this.addModel(new PhotostoryModel({
            application: this
        }));
        this.model = psm;

        if (this.model.application.mode !== 'edit') {
            this.slider = new SliderScreen({
                model: psm,
                screenRoot: this.screenRoot
            });
            this.addScreen(this.slider);
        }

        this.model.bind('change:slides', function() {
            this.updateEditSlideScreens();
        }, this);

        if (this.mode === 'edit') {
            // начальное создание экранов.
            // при десериализации нет событий change
            this.updateEditSlideScreens();
        }

        // экран результата создается во вторую очередь, чтобы быть в конце списка в редакторе
        this.result = new ResultScreen({
            model: psm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.result);

        // способ указания этих атрибутов уникален для каждого проекта
        this.title = this.model.get('resultTitle').getValue();
        this.description = this.model.get('resultDescription').getValue();

    },

    /**
     * Создать экраны слайдов для редактирования
     */
    updateEditSlideScreens: function() {
        // до пересборки экранов запоминаем ид показанного экрана, чтобы потом его восстановить
        var shownScreenId = this.getShownScreenId();
//
        for (var i = 0; i < this.slidesEditScreens.length; i++) {
            this.deleteScreen(this.slidesEditScreens[i]);
        }
        this.slidesEditScreens = [];
        var slidesValue = this.model.get('slides').toArray();
        var qs = null;
        var id = null;
        for (var i = 0; i < slidesValue.length; i++) {
            id = 'slideEditScreen'+i;
            qs = new SlideEditScreen({
                id: id,
                model: this.model,
                slideDictionaryId: this.model.get('slides').getIdFromPosition(i),
                screenRoot: this.screenRoot
            });
            this.addScreen(qs);
            this.hideScreen(qs);
            this.slidesEditScreens.push(qs);
        }
//
//        if (this.model.attributes.lastAddedQuestionDictinatyId) {
//            var scrId = this.getScreenIdByDictionaryId(this.model.attributes.lastAddedQuestionDictinatyId);
//            if (scrId) {
//                this.requestScreenSelection(scrId);
//                this.model.set({
//                    lastAddedQuestionDictinatyId: null
//                });
//            }
//            else {
//                throw new Error('TriviaApp.updateQuestionScreens: can not find screen with dictionaryId \''+this.model.attributes.lastAddedQuestionDictinatyId+'\'');
//            }
//        }
//        else if (shownScreenId) {
//            this.requestScreenSelection(shownScreenId);
//        }
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    },

    /**
     * Обработчик событий приложения MutApp
     * Любое клиентское приложение может определить такую функцию
     *
     * @param {string} event
     * @param {object} data
     */
    onAppEvent: function(event, data) {
        switch(event) {
            case MutApp.EVENT_LOADER_INITED: {
                // когда происходит связь с контейнером loader.js
                // приложение просит его установить нужный размер по высоте
                var sliderScrHeight = app.slider ? app.slider.measureHeight(): 0;
                var resultScrHeight = app.result.measureHeight();
                app.setSize({
                    height: Math.max(sliderScrHeight, resultScrHeight)
                });
                break;
            }
            case MutApp.EVENT_PROPERTY_CREATED:
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED:
            case MutApp.EVENT_PROPERTY_DELETED: {
                if (data.propertyString == 'id=psm resultTitle' || data.propertyString == 'id=psm resultDescription') {
                    if (this.model) {
                        this.model.updateShareEntities();
                    }
                }
                break;
            }
        }
    },

    /**
     * Вернуть ид экрана который показан в данный момент
     * Будет возвращен первый найденный показанный экран
     *
     * @returns {string}
     */
    getShownScreenId: function() {
        for (var i = 0; i < this._screens.length; i++) {
            var scr = this._screens[i];
            if (scr.isShowed === true) {
                return scr.id;
            }
        }
        return null;
    },

    /**
     * Найти экран по dictionaryId
     * Можно и типа question и result
     *
     * @param dictionaryId
     * @returns {*}
     */
    getScreenIdByDictionaryId: function(dictionaryId) {
        for (var i = 0; i < this._screens.length; i++) {
            var scr = this._screens[i];
            if (scr.dictionaryId === dictionaryId) {
                return scr.id;
            }
        }
        return null;
    },

    /**
     * Определить dictionaryId вопроса, который пользователь в данный момент видит на экране
     *
     * @returns {string}
     */
    getCurrentQuestionDictionaryId: function() {
        var pos = -1;
        for (var i = 0; i < this._screens.length; i++) {
            var scr = this._screens[i];
            if (scr.isShowed === true && scr.dictionaryId) {
                return scr.dictionaryId;
            }
        }
        if (this.autotesting === false) {
            throw new Error('Photostory.getCurrentQuestionDictionaryId: can not detect question dictionaryId');
        }
    },

    /**
     * Информация о приложении
     *
     * Для локализации слежует использовать конструкции вида:
     * {EN: '', RU: ''}
     */
    getStatus: function() {
        return null;
    },

    /**
     * Вернуть фрагмент html из которго будет сгенерирована картинка
     *
     * @returns {*}
     */
    getAutoPreviewHtml: function() {
        if (this._screens.length > 0) {
            var v = this.getScreenById('resultScr').$el;
            // выравнивание заголовка и пояснения по вертикали
            var viewForShare = MutApp.Util.clarifyElement(v, ['modal','modal_cnt','info_title','info_tx','b_title']);
            var titleView = viewForShare.find('.info_title').css('padding','0 50px 0 50px').css('margin','0');
            var th = titleView.outerHeight(false);
            var descView = viewForShare.find('.info_tx').css('padding','0 50px 0 50px').css('margin','0');
            var dh = descView.outerHeight(false);
            var freeVertSpace = (this.getSize().height-dh-th);
            titleView.css('padding-top',freeVertSpace*0.35+'px');
            descView.css('padding-top',freeVertSpace*0.1+'px');
            return viewForShare.html();
        }
        return '';
    }
});