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
        /*
         * Единая настройка для всех экранов, пожтому здесь
         */
        showBackgroundImage: true,
        logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',

        showTopColontitle: true,

        /**
         * Открываемые пользователем карты, первая и вторая
         */
        openedCard1: null,
        openedCard2: null,
        /**
         * Структура вопросов с ответами
         */
        pairs: [
            {
                //id: null, set programmatically
                cards: [
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 1'
                    },
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 1'
                    }
                ],
                guessed: false,
                explanation: {
                    text: 'Пояснение к правильному ответу 1'
                }
            },
            {
                //id: null, set programmatically
                cards: [
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2'
                    },
                    {
                        uiTemplate: 'id-card_text_template',
                        text: 'Ответ 2'
                    }
                ],
                guessed: false,
                explanation: {
                    text: 'Пояснение к правильному ответу 2'
                }
            }
        ],

        /**
         * Карточки для игрового поля.
         * Рандомизированные
         * Без данных о парах
         */
        gameCards: [],

        /**
         * Описание результатов, которые можно получить
         * Результаты рассчитываются динамически. Сколько вопросов столько и результатов
         */
        results: [],
        /**
         * Признак того, что пользователь угадал или нет при последнем вскрытии карт
         */
        guessed: false
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);
        this._makeUidForPairsAndCards();
        this._makeGameCards();
//        this.updateResults();
    },

    start: function() {
        this.set({state: 'game'});
//        this.next();
    },

    /**
     * Попытаться открыть карту с ид
     *
     * @param {string} cardId
     */
    touchCard: function(cardId) {
        var c = this.getGameCardById(cardId);
        if (this.attributes.openedCard1 === null) {
            // первый раз кликнули в карту
            this.set({'openedCard1': c});
        }
        else {
            // второй раз кликнули в карту: либо ошибка, либо пара отгадана
            this.set({'openedCard2': c});
            var p1 = this.getPairForCardId(this.attributes.openedCard1.id);
            var p2 = this.getPairForCardId(c.id);
            if (p1 === p2) {
                // угадал
                this.set({'guessed':true});
                p1.guessed = true;
                // проверить закончена игра или нет
                var upc = this.getUnguessedPairsCount();
                if (upc === 0) {
                    // показать объяснение, а дальше конец
                    console.log('Конец игры');
                }
                else {
                    // показать объяснение и дальше игра
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
    },

    /**
     * Перейти к следующему игровому состоянию, если это возможно
     */
    next: function() {
        switch (this.attributes.state) {
            case 'welcome': {
                this.set({
                    resultPoints: 0,
                    currentResult: null
                });
                // перемещать вопросы при переходе к тесту
                if (this.attributes.randomizeQuestions === true) {
                    this.attributes.quiz = _.shuffle(this.attributes.quiz);
                }
                this.set({
                    currentQuestionIndex: 0,
                    currentQuestionId: this.attributes.quiz[0].id,
                    state: 'question'
                });
                break;
            }
            case 'game': {
                if (this.attributes.currentQuestionIndex < this.attributes.quiz.length-1) {
                    var ni = this.attributes.currentQuestionIndex+1;
                    this.set({
                        currentQuestionIndex: ni,
                        currentQuestionId: this.attributes.quiz[ni].id
                    });
                }
                else {
                    // конец теста, финальный скрин
                    this.set({
                        currentResult: this.getResultByPoints(this.attributes.resultPoints),
                        state: 'result',
                        currentQuestionId: null,
                        currentQuestionIndex: undefined
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
     * Вернуть ид пары по карте.
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
     * Сгенерировать уникальные идишки для пар и карт
     */
    _makeUidForPairsAndCards: function() {
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
     * Собрать карточки для игры
     * @private
     */
    _makeGameCards: function() {
        var result = [];
        for (var j = 0; j < this.attributes.pairs.length; j++) {
            var p = this.attributes.pairs[j];
            for (var i = 0; i < p.cards.length; i++) {
                result.push(p.cards[i]);
            }
        }
        //TODO перемешать массив
        this.set({"gameCards": result});
    }

});