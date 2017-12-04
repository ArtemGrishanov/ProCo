/**
 * Created by artyom.grishanov on 11.09.16.
 *
 * Нужна найти пару на игровом поле.
 * Пары не обязательно должны иметь одинаковый контент (например, писатель-герой)
 * Это значит, что это фактически разные объекты.
 *
 * Экраны пояснения:
 * В редакторе коллекция экранов пояснения определяет количество карт.
 * Именно массив экранов пояснения является определяющим, из них строится потом игровое поле.
 * Внешний вид карты будет задаваться на экране пояснения.
 * Значит новый экран - это элемент (один!) в массив pairs
 *
 *
 */
var MemorizModel = MutApp.Model.extend({

    defaults: {
        id: 'mm',
        state: null,
        currentResult: null,
        resultPoints: 0,
        /**
         * Показывать ли экран пояснения или нет при отгадывании каждой пары
         */
        showExplanation: true,
        logoUrl: null,
        logoLink: null,
        downloadLink: null,
        backCardTexture: null,
        showBackCardTexture: true,
        showTopColontitle: true,
        fbShareEnabled: true,
        vkShareEnabled: true,

        /**
         * Открываемые пользователем карты, первая и вторая
         */
        openedCard1: null,
        openedCard2: null,
        lastOpenedPair: null,
        /**
         * Структура вопросов с ответами
         */
        pairs: [
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 1',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o1.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 1',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o1.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Feedback header',
//                    text: 'Input feedback text here'
//                }
//            },
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o2.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o2.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Feedback header',
//                    text: 'Input feedback text here'
//                }
//            },
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o3.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o3.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Feedback header',
//                    text: 'Input feedback text here'
//                }
//            },
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o4.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Option 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o4.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Feedback header',
//                    text: 'Input feedback text here'
//                }
//            }
        ],
        /**
         * Карточки для игрового поля.
         * Рандомизированные
         * Без данных о парах
         */
        gameCards: [],
        /**
         * В этой механике предусмотрен только один результат
         * @type MutAppProperty
         */
        resultTitle: null,
        /**
         * В этой механике предусмотрен только один результат
         * @type MutAppProperty
         */
        resultDescription: null,
        /**
         * Признак того, что пользователь угадал или нет при последнем вскрытии карт
         */
        guessed: false,
        /**
         * Последняя добавленная пара, идишка в словаре pairs
         */
        lastAddedPairDictinatyId: null,

        startScreenBackgroundImg: null,
        gamescreenBackgroundImg: null,
        resultsBackgroundImg: null,
        restartButtonText: null,
        downloadButtonText: null,
        fbSharingPosition: null,
        vkSharingPosition: null,
        showDownload: null,
        startHeaderText: null,
        startDescription: null,
        startButtonText: null,
        fbSharingEnabled: null,
        vkSharingEnabled: null,
        logoPositionInStartScreen: null,
        logoPositionInGamescreen: null,
        logoPositionInResults: null,
        logoPositionInOpened: null,
        showLogoOnStartScreen: null,
        showLogoOnGameScreen: null,
        showLogoInOpened: null,
        showLogoInResults: null,
        showBackCardTexture: null,
        showExplanation: null

    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);

        this.attributes.logoUrl = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm logoUrl',
            value: '//s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg'
        });
        this.attributes.logoLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm logoLink',
            value: 'http://testix.me'
        });
        this.attributes.downloadLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm downloadLink',
            value: 'http://testix.me'
        });
        this.attributes.backCardTexture = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm backCardTexture',
            value: null
        });

        // ===================================================
        // texts
        // ===================================================
        this.attributes.startHeaderText = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm startHeaderText',
            value: 'Start Header'
        });
        this.attributes.startDescription = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm startDescription',
            value: 'Description'
        });
        this.attributes.startButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm startButtonText',
            value: 'Start'
        });
        this.attributes.resultTitle = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm resultTitle',
            value: 'Result title'
        });
        this.attributes.resultDescription = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm resultDescription',
            value: 'Result description'
        });
        this.attributes.restartButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Заново',
            propertyString: 'id=mm restartButtonText'
        });
        this.attributes.downloadButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Download',
            propertyString: 'id=mm downloadButtonText'
        });
        this.attributes.nextButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Next',
            propertyString: 'id=mm nextButtonText'
        });

        // ===================================================
        // images
        // ===================================================
        this.attributes.startScreenBackgroundImg = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm startScreenBackgroundImg',
            value: null
        });
        this.attributes.resultsBackgroundImg = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm resultsBackgroundImg',
            value: null
        });
        this.attributes.gamescreenBackgroundImg = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm gamescreenBackgroundImg',
            value: null
        });
        this.attributes.openedBackgroundImg = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm openedBackgroundImg',
            value: null
        });


        // ===================================================
        // boolean
        // ===================================================
        this.attributes.showDownload = new MutAppProperty({
            application: this.application,
            model: this,
            value: false,
            propertyString: 'id=mm showDownload'
        });
        this.attributes.fbSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=mm fbSharingEnabled'
        });
        this.attributes.vkSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=mm vkSharingEnabled'
        });
        this.attributes.showLogoOnStartScreen = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm showLogoOnStartScreen',
            value: true
        });
        this.attributes.showLogoOnGamescreen = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm showLogoOnGamescreen',
            value: true
        });
        this.attributes.showLogoInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm showLogoInResults',
            value: true
        });
        this.attributes.showLogoInOpened = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm showLogoInOpened',
            value: true
        });
        this.attributes.showBackCardTexture = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm showBackCardTexture',
            value: true
        });
        this.attributes.showExplanation = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm showExplanation',
            value: true
        });


        // ===================================================
        // position
        // ===================================================
        this.attributes.fbSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 219, left: 294},
            propertyString: 'id=mm fbSharingPosition'
        });
        this.attributes.vkSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 270, left: 294},
            propertyString: 'id=mm vkSharingPosition'
        });
        this.attributes.logoPositionInStartScreen = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=mm logoPositionInStartScreen'
        });
        this.attributes.logoPositionInGamescreen = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=mm logoPositionInGamescreen'
        });
        this.attributes.logoPositionInOpened = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=mm logoPositionInOpened'
        });
        this.attributes.logoPositionInResults = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=mm logoPositionInResults'
        });


        this.attributes.pairs = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=mm pairs',
            value: []
        });

        this.updateShareEntities();
        this.updateGameCards();
    },

    start: function() {
        this.next();
    },

    /**
     * Обновить ентити для шаринга
     * Создать или обновить тексты
     */
    updateShareEntities: function() {
        var shareEntitiesArr = this.application.shareEntities.toArray();

        var titleText = this.attributes.resultTitle.getValue() || '';
        var descriptionText = this.attributes.resultDescription.getValue() || '';
        if (!shareEntitiesArr || shareEntitiesArr.length === 0) {
            var dictId = MutApp.Util.getUniqId(6);
            this.application.shareEntities.addElement({
                id: 'result0',
                title: titleText,
                description: descriptionText,
                imgUrl: new MutAppProperty({
                    propertyString: 'appConstructor=mutapp shareEntities.'+dictId+'.imgUrl',
                    model: this,
                    application: this.application,
                    value: null
                })
            });
        }
        else {
            var oneEntity = shareEntitiesArr[0];
            oneEntity.title = titleText;
            oneEntity.description = descriptionText;
        }
    },

    /**
     * Попытаться открыть карту с ид
     *
     * @param {string} cardId
     */
    touchCard: function(cardId) {
        var p = this.getPairForCardId(cardId);
        if (p.guessed === true) {
            // клик по уже отгаданной карте
            return;
        }
        var c = this.getGameCardById(cardId);
        if (this.attributes.openedCard1 === null) {
            // первый раз кликнули в карту
            this.set({'openedCard1': c});
        }
        else if (this.attributes.openedCard2 === null && this.attributes.openedCard1.id !== cardId) {
            // второй раз кликнули в карту: либо ошибка, либо пара отгадана
            this.set({'openedCard2': c});
            var p1 = this.getPairForCardId(this.attributes.openedCard1.id);
            var p2 = this.getPairForCardId(c.id);
            // проверяем, что объект-пара из массива pairs один и тот же для карточек
            if (p1 === p2) {
                // угадал
                this.set({'guessed':true});
                p1.guessed = true;
                if (this.attributes.showExplanation === true) {
                    this.set({
                        state: 'opened',
                        lastOpenedPair: p1
                    });
                }
                else {
                    // проверка что игра закончена есть только внутри next
                    this.next();
                }
            }
            else {
                // закрываем карту обратно
                this.set({'guessed':false});
            }
            // сразу сбрасываем, а вью может показать ошибочную пару с задержкой если ему надо
            this.set({
                'openedCard1': null,
                'openedCard2': null
            });
        }
        else {

        }
    },

    /**
     * Перейти к следующему игровому состоянию, если это возможно
     */
    next: function() {
        switch (this.attributes.state) {
            case 'welcome': {
                this.updateGameCards();
                this.set({
                    resultPoints: 0,
                    currentResult: null,
                    state: 'game'
                });
                break;
            }
            case 'game': {
                var upc = this.getUnguessedPairsCount();
                if (upc === 0) {
                    // показать объяснение, а дальше конец
                    console.log('Конец игры из game');
                    this.set({
                        //TODO select res from timer
                        currentResult: this.attributes.results[0],
                        state: 'result'
                    });
                }
                else {

                }
                break;
            }
            case 'opened': {
                // экран показывающий пояснения после вскрытия карт
                var upc = this.getUnguessedPairsCount();
                if (upc === 0) {
                    // показать объяснение, а дальше конец
                    console.log('Конец игры с opened');
                    this.set({
                        //TODO select res from timer
                        currentResult: this.attributes.results[0],
                        state: 'result'
                    });
                }
                else {
                    // показать объяснение и дальше игра
                    this.set({
                        state: 'game'
                    });
                }
                break;
            }
            case 'result': {
                this.set({
                    state: 'welcome',
                    resultPoints: 0,
                    currentResult: null
                });
                break;
            }
            default: {
                this.set({
                    state: 'welcome',
                    resultPoints: 0,
                    currentResult: null
                });
            }
        }
        return this.attributes.state;
    },

    /**
     * Найти пару по Id
     * @param {string} id
     * @returns {*}
     */
    getPairById: function(id) {
        var pairsArr = this.attributes.pairs.toArray();
        for (var i = 0; i < pairsArr.length; i++) {
            if (id === pairsArr[i].id) {
                return pairsArr[i];
            }
        }
        return null;
    },

    /**
     * Найти карту по Id
     * @param {string} id
     * @returns {*}
     */
    getGameCardById: function(id) {
        for (var i = 0; i < this.attributes.gameCards.length; i++) {
            if (id === this.attributes.gameCards[i].id) {
                return this.attributes.gameCards[i];
            }
        }
        return null;
    },


    /**
     * Вернуть пару из массива pairs по ид карты.
     *
     * @param {string} cardId
     * @returns {*}
     */
    getPairForCardId: function(cardId) {
        var pairsArr = this.attributes.pairs.toArray();
        for (var j = 0; j < pairsArr.length; j++) {
            var p = pairsArr[j];
            if (p.card1.id === cardId || p.card2.id === cardId) {
                return p;
            }
        }
        return null;
    },

    /**
     * Посчитать количество неразгаданных пар
     *
     * @return {number}
     */
    getUnguessedPairsCount: function() {
        var result = 0;
        for (var i = 0; i < this.attributes.pairs.length; i++) {
            if (this.attributes.pairs[i].guessed === false) {
                result++;
            }
        }
        return result;
    },

    /**
     * Сгенерировать уникальные идишки для пар и карт
     */
    _makeIdsForPairsAndCards: function() {
        var pairsArr = this.attributes.pairs.toArray();
        for (var j = 0; j < pairsArr.length; j++) {
            var p = pairsArr[j];
            p.id = 'pair_' + MutApp.Util.getUniqId(6);
            p.card1.id = 'card_' + MutApp.Util.getUniqId(6);
            p.card2.id = 'card_' + MutApp.Util.getUniqId(6);
        }
    },

    /**
     * Подгтовить карточки для начала игры
     * @private
     */
    updateGameCards: function() {
        this._makeIdsForPairsAndCards();
        var result = [];
        var pairsArr = this.attributes.pairs.toArray();
        for (var j = 0; j < pairsArr.length; j++) {
            var p = pairsArr[j];
            p.guessed = false;
            result.push({
                id: p.card1.id,
                mod: '',
                uiTemplate: p.card1.uiTemplate,
                img: p.card1.img
            });
            result.push({
                id: p.card2.id,
                mod: '',
                uiTemplate: p.card2.uiTemplate,
                img: p.card2.img
            });
        }
        this._shuffle(result);
        this.set({
            gameCards: result
        });
    },

    /**
     * Перемешать массив
     *
     * @param a
     * @private
     */
    _shuffle: function(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    },

    /**
     * Объект-Прототип для добавления в массив
     *
     */
    protoPair1: function() {
        var pairDictionaryId = MutApp.Util.getUniqId(6);
        this.set({
            lastAddedPairDictinatyId: pairDictionaryId
        });

        var img1 = new MutAppProperty({
            propertyString: 'id=mm pairs.'+pairDictionaryId+'.card1.img',
            model: this,
            application: this.application,
            value: null
        });
        var img2 = new MutAppProperty({
            propertyString: 'id=mm pairs.'+pairDictionaryId+'.card2.img',
            model: this,
            application: this.application,
            value: null
        });
        var element = {
            card1: {
                uiTemplate: 'id-card_text_template',
                img: img1
            },
            card2: {
                uiTemplate: 'id-card_text_template',
                img: img2
            },
            explanation: {
                title: 'Title',
                text: 'Feedback text'
            }
        };

        this._makeIdsForPairsAndCards();

        return {
            id: pairDictionaryId,
            element: element
        };
    }

});