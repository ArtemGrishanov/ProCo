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
        /*
         * Единая настройка для всех экранов, пожтому здесь
         */
        showBackgroundImage: true,
        logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',
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
            {
                //id: null, set programmatically
                cards: [
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 1',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o1.jpg'
                    },
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 1',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o1.jpg'
                    }
                ],
                guessed: false,
                explanation: {
                    title: 'Заголовок',
                    text: 'Пояснение к правильному ответу'
                }
            },
            {
                //id: null, set programmatically
                cards: [
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o2.jpg'
                    },
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o2.jpg'
                    }
                ],
                guessed: false,
                explanation: {
                    title: 'Заголовок',
                    text: 'Пояснение к правильному ответу'
                }
            },
            {
                //id: null, set programmatically
                cards: [
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o3.jpg'
                    },
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o3.jpg'
                    }
                ],
                guessed: false,
                explanation: {
                    title: 'Заголовок',
                    text: 'Пояснение к правильному ответу'
                }
            },
            {
                //id: null, set programmatically
                cards: [
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o4.jpg'
                    },
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2',
                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o4.jpg'
                    }
                ],
                guessed: false,
                explanation: {
                    title: 'Заголовок',
                    text: 'Пояснение к правильному ответу'
                }
            }
//            ,{
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o5.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o5.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Заголовок',
//                    text: 'Пояснение к правильному ответу'
//                }
//            },
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o6.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o6.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Заголовок',
//                    text: 'Пояснение к правильному ответу'
//                }
//            },
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o7.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o7.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Заголовок',
//                    text: 'Пояснение к правильному ответу'
//                }
//            },
//            {
//                //id: null, set programmatically
//                cards: [
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o8.jpg'
//                    },
//                    {
//                        uiTemplate: 'id-card_text_template',
//                        text: 'Ответ 2',
//                        img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/res/o8.jpg'
//                    }
//                ],
//                guessed: false,
//                explanation: {
//                    title: 'Заголовок',
//                    text: 'Пояснение к правильному ответу'
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
         * Описание результатов, которые можно получить
         */
        RESULTS_COUNT: 1,
        results: [
            {
                title: 'Заголовок результата',
                description: 'Описание результата'
            }
        ],
        /**
         * Признак того, что пользователь угадал или нет при последнем вскрытии карт
         */
        guessed: false
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);
        this._makeIdsForPairsAndCards();
        this._initPairsAndCards();
//        this.updateResults();
    },

    start: function() {
        this.next();
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
                this._initPairsAndCards();
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
        for (var i = 0; i < this.attributes.pairs.length; i++) {
            if (id === this.attributes.pairs[i].id) {
                return this.attributes.pairs[i];
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
        for (var j = 0; j < this.attributes.pairs.length; j++) {
            var p = this.attributes.pairs[j];
            for (var i = 0; i < p.cards.length; i++) {
                var c = p.cards[i];
                if (c.id === cardId) {
                    return p;
                }
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
     * Найти результат в массиве app.results для указанного количества баллов.
     * @param points - количество баллов, для которых найти результат
     */
    getResultByPoints: function(points) {
        for (var i = 0; i < this.attributes.results.length; i++) {
            var r = this.attributes.results[i];
            if (r.minPoints <= points && points <=r.maxPoints) {
                return r;
            }
        }
        return null;
    },

    /**
     * Найти результат по ид
     * Нужно потому, что каждый экран отвечает за свой результат
     * @param {string} id - уник ид результата
     */
    getResultById: function(id) {
        for (var i = 0; i < this.attributes.results.length; i++) {
            var r = this.attributes.results[i];
            if (r.id === id) {
                return r;
            }
        }
        return null;
    },

    /**
     * Сгенерировать уникальные идишки для пар и карт
     */
    _makeIdsForPairsAndCards: function() {
        for (var j = 0; j < this.attributes.pairs.length; j++) {
            var p = this.attributes.pairs[j];
            p.id = MutApp.Util.getUniqId(6);
            for (var i = 0; i < p.cards.length; i++) {
                var c = p.cards[i];
                c.id = MutApp.Util.getUniqId(6);
            }
        }
    },

    /**
     * Подгтовить карточки для начла игры
     * @private
     */
    _initPairsAndCards: function() {
        var result = [];
        for (var j = 0; j < this.attributes.pairs.length; j++) {
            var p = this.attributes.pairs[j];
            p.guessed = false;
            for (var i = 0; i < p.cards.length; i++) {
                p.cards[i].mod = '';
                result.push(p.cards[i]);
            }
        }
        this._shuffle(result);
        this.set({"gameCards": result});
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
    }

});