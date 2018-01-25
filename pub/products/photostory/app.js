/**
 * Created by artyom.grishanov on 14.01.18.
 *
 */
var PhotostoryApp = MutApp.extend({

    type: 'photostory',
    model: null,
    slider: null,
    screenRoot: $('#id-mutapp_screens'),
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
                    protoFunction: 'id=psm quizProto1', // функция в приложении, которая вернет новый объект
                    label: {RU:'Текстовый вопрос',EN:'Text question'},
                    img: '//p.testix.me/images/products/photostory/editor/Icon-text-vopros.png'
                },
                {
                    protoFunction: 'id=psm quizProto2', // функция в приложении, которая вернет новый объект
                    label: {RU:'Фото вопрос',EN:'Photo question'},
                    img: '//p.testix.me/images/products/photostory/editor/Icon-fotovopros.png'
                },
                {
                    protoFunction: 'id=psm quizProto3', // функция в приложении, которая вернет новый объект
                    label: {RU:'Фото ответы',EN:'Photo answers'},
                    img: '//p.testix.me/images/products/photostory/editor/Icon-fotootvet.png'
                }
            ],
            children: {
                "id=psm slides.{{id}}.text": {
                    controls: "TextQuickInput"
                },
                "id=psm slides.{{id}}.img": {
                    label: {RU:'Картинка вопроса',EN:'Question image'},
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
        }

        //.js-result_title .js-result_description .js-result_back_color
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

        this.slider = new SliderScreen({
            model: psm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.slider);

        this.result = new ResultScreen({
            model: psm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.result);

        this.model.bind('change:slides', function() {
            this.updateEditSlideScreens();
        }, this);

        // начальное создание экранов.
        // при десериализации нет событий change
        this.updateEditSlideScreens();

        // способ указания этих атрибутов уникален для каждого проекта
//        this.title = this.getPropertiesBySelector('id=startScr startHeaderText')[0].value.getValue();
//        this.description = this.getPropertiesBySelector('id=startScr startDescription')[0].value.getValue();

    },

    /**
     * Создать экраны слайдов для редактирования
     */
    updateEditSlideScreens: function() {
//        // до пересборки экранов запоминаем ид показанного экрана, чтобы потом его восстановить
//        var shownScreenId = this.getShownScreenId();
//
//        for (var i = 0; i < this.questionScreens.length; i++) {
//            this.deleteScreen(this.questionScreens[i]);
//        }
//        this.questionScreens = [];
//        var quizValue = this.model.get('quiz').toArray();
//        var qs = null;
//        var id = null;
//        for (var i = 0; i < quizValue.length; i++) {
//            id = 'questionScreen'+i;
//            qs = new QuestionScreen({
//                id: id,
//                model: this.model,
//                questionId: quizValue[i].id,
//                screenRoot: this.screenRoot
//            });
//            this.addScreen(qs);
//            this.hideScreen(qs);
//            this.questionScreens.push(qs);
//        }
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
                var sliderScrHeight = app.slider.measureHeight();
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
            var v = this.getScreenById('startScr').$el;
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