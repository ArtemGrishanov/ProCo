/**
 * Created by artyom.grishanov on 11.09.16.
 */
var MemorizApp = MutApp.extend({

    type: 'memoriz',
    id: MutApp.Util.getUniqId(6),
    screenRoot: $('#id-mutapp_screens'),
    model: null,
    openedScreens: [],

    /**
     * Схема свойств MutAppProperty в этом приложении
     */
    mutAppSchema: new MutAppSchema({
        "appConstructor=mutapp shareEntities.{{id}}.imgUrl": {
            // это свойство описано в клиентской части а не в mutapp.js так как фильтр по экрану может указать только клиент
            label: {RU: 'Картинка для шаринга', EN: 'Sharing image'},
            controls: 'ChooseSharingImage',
            controlFilter: 'screenPropertyString' // клиент знает какие экраны есть в приложении
        },
        "id=mm logoLink": {
            label: {RU: 'Ссылка по клику на лого', EN: 'Logo click link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=mm downloadLink": {
            label: {RU: 'Ссылка по кнопке "Скачать"', EN: 'Download button link'},
            controls: 'StringControl',
            controlFilter: 'always'
        },
        "id=mm startHeaderText": {
            label: {RU: 'Заголовок', EN: 'Header'},
            controls: "TextQuickInput"
        },
        "id=mm startDescription": {
            label: {RU:'Описание', EN:'Description'},
            controls: "TextQuickInput"
        },
        "id=mm startButtonText": {
            label: {RU:'Текст кнопки', EN:'Start button text'},
            controls: "TextQuickInput"
        },
        "id=mm restartButtonText": {
            controls: "TextQuickInput"
        },
        "id=mm downloadButtonText": {
            controls: "TextQuickInput"
        },
        "id=mm showDownload": {
            label: {RU:'Кнопка "Скачать"', EN:'Download button'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=mm showLogoOnStartScreen": {
            label: {RU:'Показывать лого на начальном экране',EN:'Show logo on start screen'},
            controls: 'OnOff',
            controlFilter: 'screen(id=startScr)'
        },
        "id=mm showLogoOnGamescreen": {
            label: {RU:'Показывать лого в результатах',EN:'Show logo on result screens'},
            controls: 'OnOff',
            controlFilter: 'screen(id=gamescreen)'
        },
        "id=mm showLogoInOpened": {
            label: {RU:'Показывать лого в результатах',EN:'Show logo on result screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=opened)'
        },
        "id=mm showLogoInResults": {
            label: {RU:'Показывать лого в результатах',EN:'Show logo on result screens'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=mm logoPositionInStartScreen": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=mm logoPositionInGamescreen": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=mm logoPositionInOpened": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=mm logoPositionInResults": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=mm showBackCardTexture": {
            label: {RU:'Показывать "рубашку" карточки',EN:'Show back card image'},
            controls: 'OnOff',
            controlFilter: 'screen(id=gamescreen)'
        },
        "id=mm showExplanation": {
            label: {RU:'Показывать леер объяснения ответа',EN:'Show feedback'},
            controls: 'OnOff',
            controlFilter: 'screen(id=gamescreen)'
        },
        "id=mm fbSharingEnabled": {
            label: {RU:'Шаринг в Facebook',EN:'Facebook sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=mm vkSharingEnabled": {
            label: {RU:'Шаринг во ВКонтакте',EN:'Vk.com sharing'},
            controls: 'OnOff',
            controlFilter: 'screen(type=results)'
        },
        "id=mm fbSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=mm vkSharingPosition": {
            label: {},
            controls: {
                name: 'Drag',
                param: {
                    // контейнер в котором будет происходить перетаскивание
                    draggableParentSelector: '.js-logo_cnt'
                }
            }
        },
        "id=mm logoUrl": {
            label: {RU: 'Логотип', EN: 'Logo'},
            controls: 'ChooseImage',
            controlFilter: 'always'
        },
        "id=mm nextButtonText": {
            controls: "TextQuickInput"
        },
        "id=mm pairs": {
            prototypes: [
                {
                    protoFunction: 'id=mm protoPair1'
                }
            ],
            children: {
                "id=mm pairs.{{id}}.explanation.title": {
                    controls: "TextQuickInput"
                },
                "id=mm pairs.{{id}}.explanation.text": {
                    controls: "TextQuickInput"
                },
                "id=mm pairs.{{id}}.card1.img": {
                    control: "ChooseImage",
                    controlFilter: "onclick"
                },
                "id=mm pairs.{{id}}.card2.img": {
                    control: "ChooseImage",
                    controlFilter: "onclick"
                }
            }
        },
        "id=mm startScreenBackgroundImg": {
            label: {RU:'Фоновая картинка',EN:'Screen background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(id=startScr)'
        },
        "id=mm gamescreenBackgroundImg": {
            label: {RU:'Фоновая картинка',EN:'Screen background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(id=gamescreen)'
        },
        "id=mm openedBackgroundImg": {
            label: {RU:'Фоновая картинка',EN:'Screen background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(type=opened)'
        },
        "id=mm resultsBackgroundImg": {
            label: {RU:'Фоновая картинка',EN:'Screen background image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(type=results)'
        },
        "id=mm backCardTexture": {
            label: {RU:'Тектура карточки',EN:'Card texture image'},
            controls: 'ChooseImage',
            controlFilter: 'screen(type=gamescreen)'
        },
        "id=mm resultTitle": {
            controls: "TextQuickInput"
        },
        "id=mm resultDescription": {
            controls: "TextQuickInput"
        }
    }),

    /**
     * Конструктор
     * @param param
     */
    initialize: function(param) {
        console.log('MemorizApp initialize');
        var mm = this.addModel(new MemorizModel({
            application: this
        }));
        this.model = mm;

        var startScr = new StartScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(startScr);

        var gs = new GameScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(gs);

        this.model.bind('change:pairs', function() {
            this.updateOpenedScreens();
        }, this);

        this.updateOpenedScreens();

        var rs = new ResultScreen({
            id: 'result0',
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(rs);
    },

    /**
     *
     */
    updateOpenedScreens: function() {
        // до пересборки экранов запоминаем ид показанного экрана, чтобы потом его восстановить
        var shownScreenId = this.getShownScreenId();

        for (var i = 0; i < this.openedScreens.length; i++) {
            this.deleteScreen(this.openedScreens[i]);
        }
        this.openedScreens = [];
        var pairsArr = this.model.get('pairs').toArray();
        var os = null;
        var id = null;
        for (var i = 0; i < pairsArr.length; i++) {
            id = 'openedScreen'+i;
            os = new OpenedScreen({
                id: id,
                model: this.model,
                pairId: pairsArr[i].id,
                dictionaryId: this.model.get('pairs').getIdFromPosition(i),
                screenRoot: this.screenRoot
            });
            this.addScreen(os);
            this.hideScreen(os);
            this.openedScreens.push(os);
        }

        if (this.model.attributes.lastAddedPairDictinatyId) {
            var scrId = this.getScreenIdByDictionaryId(this.model.attributes.lastAddedQuestionDictinatyId);
            if (scrId) {
                this.requestScreenSelection(scrId);
                this.model.set({
                    lastAddedPairDictinatyId: null
                });
            }
            else {
                throw new Error('MemorizApp.updateOpenedScreens: can not find screen with dictionaryId \''+this.model.attributes.lastAddedPairDictinatyId+'\'');
            }
        }
        else if (shownScreenId) {
            this.requestScreenSelection(shownScreenId);
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
     * Обработчик событий приложения MutApp
     * Любое клиентское приложение может определить такую функцию
     *
     * @param {string} event
     * @param {object} data
     */
    onAppEvent: function(event, data) {
        switch(event) {
            case MutApp.EVENT_PROPERTY_CREATED:
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED:
            case MutApp.EVENT_PROPERTY_DELETED: {
                if (MutApp.Util.matchPropertyString(data.propertyString, 'id=mm pairs') === true) {
                    if (this.model) {
                        this.model.updateGameCards();
                    }
                }
                if (data.propertyString == 'id=mm resultTitle' || data.propertyString == 'id=mm resultDescription') {
                    if (this.model) {
                        this.model.updateShareEntities();
                    }
                }
                break;
            }
        }
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    },

    /**
     * Вернуть фрагмен html из которго будет сгенерирована картинка
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