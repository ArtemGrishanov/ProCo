/**
 * Created by artyom.grishanov on 04.07.17.
 * Personality test
 */
var PersonalityModel = MutApp.Model.extend({

    defaults: {
        /**
         * Количество баллов даваемое за ответ с сильной привязкой
         */
        STRONG_LINK_POINTS: 1,
        /**
         * Количество баллов даваемое за ответ со слабой привязкой
         */
        WEAK_LINK_POINTS: 0.3,
        /**
         *
         */
        id: 'pm',
        /**
         * Простое свойство
         */
        state: null,
        currentQuestionIndex: undefined,
        currentQuestionId: undefined,
        randomizeQuestions: false,
        /**
         * Вопросы теста Personality
         */
        quiz: null,
        /**
         * Специальное свойство
         * MutAppProperty доступное для редактирования вовне приложения
         */
        showBackgroundImage: null,
        /**
         * Показывать ли логотип на эйране с вопросами
         */
        showLogoInQuestions: null,
        /**
         * Personality текущие набранные результаты
         * Map
         * 'result1_id': number,
         * 'result2_id': number
         * ...
         *
         * Для каждого результата собираются баллы, в итоге какой результат больше набрал баллов, тот и выпадает
         */
        resultPoints: {},
        /**
         * Ссылка на последний выпавший результат Personality
         * Один из массива results
         */
        currentResult: null,
        /**
         * Все возможные результаты теста Personality
         */
        results: null,
        /**
         * url logo один на все экраны
         */
        logoUrl: null
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);
        this._updateResults();

        this.bind('change:quiz', function() {
            this.start();
        });
        this.bind('change:results', function() {
            this.start();
        });
        this.attributes.results = new MutAppPropertyArray({
            application: this.application,
            model: this,
            propertyString: 'id=pm results',
            propertyName: 'results',
            value: []
        });
        this.attributes.quiz = new MutAppPropertyArray({
            application: this.application,
            model: this,
            propertyString: 'id=pm quiz',
            propertyName: 'quiz',
            value: []
        });
        this.attributes.showBackgroundImage = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm showBackgroundImage',
            propertyName: 'showBackgroundImage', // дублирование имени
            value: true
        });
        // свойство одно на все экраны с вопросами
        this.attributes.showLogoInQuestions = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm showLogoInQuestions',
            value: true
        });
        this.attributes.logoUrl = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm logoUrl',
            value: '//s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg'
        });
    },

    /**
     * Перевести приложение в начальное состояние
     */
    start: function() {
        this._clearResult();
        this.set({
            state: 'welcome',
            currentResult: null,
            currentQuestionId: null
        });
    },

    /**
     * Найти вопрос по Id
     * @param id
     * @returns {*}
     */
    getQuestionById: function(id) {
        var quizValue = this.attributes.quiz.getValue();
        for (var i = 0; i < quizValue.length; i++) {
            if (id === quizValue[i].id) {
                return quizValue[i];
            }
        }
        return null;
    },

    /**
     * Найти опцию по идишнику
     *
     * @param {string} id
     * @returns {*}
     */
    getOptionById: function(id) {
        var quizValue = this.attributes.quiz.getValue();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options;
            for (var n = 0; n < options.length; n++) {
                if (id === options[n].id) {
                    return options[n];
                }
            }
        }
        return null;
    },

    /**
     * Задать сильную связь между опцией и результатом
     *
     * @param {string} optionId
     * @param {string} resultId
     */
    setStrongConnection: function(optionId, resultId) {
        var o = this.getOptionById(optionId);
        if (!o) {
            throw new Error('PersonalityModel.setStrongConnection: option \''+optionId+' does not exist');
        }
        var r = this.getResultById(resultId);
        if (!r) {
            throw new Error('PersonalityModel.setStrongConnection: option \''+optionId+' does not exist');
        }
        if (o.strongLink.indexOf(resultId) >= 0) {
            // уже привязано
        }
        else {
            o.strongLink.push(resultId);
        }
    },

    /**
     * Сгенерировать идишки для вопроса и опций ответа
     *
     * @param question
     * @private
     */
    _makeUidForQuizElement: function(quizElement) {
        quizElement.id = MD5.calc(quizElement.question.text + j).substr(0,6);
        if (quizElement.answer.options) {
            // опций ответа может и не быть
            for (var i = 0; i < quizElement.answer.options.length; i++) {
                var o = quizElement.answer.options[i];
                o.id = MD5.calc(o.text + o.img + j + i).substr(0,6);
            }
        }
    },

    /**
     * Смена состояния
     *
     * @returns
     */
    next: function() {
        if (this.attributes.quiz.getValue().length === 0) {
            console.error('Personality Model.next: no quiz elements');
            return;
        }
        if (this.attributes.results.getValue().length === 0) {
            console.error('Personality Model.next: no results');
            return;
        }
        switch (this.attributes.state) {
            case 'welcome': {
                this._clearResult();
                this.set({
                    currentResult: null
                });
                // перемещать вопросы при переходе к тесту
                if (this.attributes.randomizeQuestions === true) {
                    this.attributes.quiz = _.shuffle(this.attributes.quiz);
                }
                this.set({
                    currentQuestionIndex: 0,
                    currentQuestionId: this.attributes.quiz.getValue()[0].id,
                    state: 'question'
                });
                this.application.stat('Test', 'start', 'First question');
                this.application.stat('Test', 'next', 'question', 1);
                break;
            }
            case 'question': {
                if (this.attributes.currentQuestionIndex < this.attributes.quiz.getValue().length-1) {
                    var ni = this.attributes.currentQuestionIndex+1;
                    this.set({
                        currentQuestionIndex: ni,
                        currentQuestionId: this.attributes.quiz.getValue()[ni].id
                    });
                    this.application.stat('Test', 'next', 'question', ni+1);
                }
                else {
                    // конец теста, финальный скрин
                    this.set({
                        currentResult: this.getPersonalityResultByPoints(this.attributes.resultPoints),
                        state: 'result',
                        currentQuestionId: null,
                        currentQuestionIndex: undefined
                    });
                    this.application.stat('Test', 'result', this.attributes.currentResult.title, this.attributes.resultPoints);
                    // показать рекомендации с небольшой задержкой
                    var a = this.application;
                    setTimeout(function() {
                        a.showRecommendations();
                    }, 2000);
                }
                break;
            }
            case 'result': {
                this.application.hideRecommendations();
                this._clearResult();
                this.set({
                    state: 'welcome',
                    currentResult: null,
                    currentQuestionId: null
                });
                break;
            }
            default: {
                this.application.hideRecommendations();
                this._clearResult();
                this.set({
                    state: 'welcome',
                    currentResult: null,
                    currentQuestionId: null
                });
            }
        }
        return this.attributes.state;
    },

    _updateResults: function() {
        //TODO
    },

    /**
     * Найти результат с наибольшим числом балло
     * Если баллов одиноково у нескольких результатов, то будет рандомный выбор среди них
     *
     * @param {object} resultPoints
     * @result {string} идишка выбранного результата
     */
    getPersonalityResultByPoints: function(resultPoints) {
        var maxSum = -1;
        var resultIds = [];
        for (var resId in this.attributes.resultPoints) {
            if (maxSum < this.attributes.resultPoints[resId]) {
                maxSum = this.attributes.resultPoints[resId];
                resultIds = [resId];
            }
            else if (maxSum == this.attributes.resultPoints[resId]) {
                resultIds.push(resId);
            }
        }
        return this.getResultById(resultIds[Math.round(Math.random() * (resultIds.length-1))]);
    },

    /**
     * Найти результат по ид
     * Нужно потому, что каждый экран отвечает за свой результат
     * @param {string} id - уник ид результата
     */
    getResultById: function(id) {
        for (var i = 0; i < this.attributes.results.getValue().length; i++) {
            var r = this.attributes.results.getValue()[i];
            if (r.id === id) {
                return r;
            }
        }
        return null;
    },

    /**
     * Сбросить результаты
     *
     * @private
     */
    _clearResult: function() {
        var rp = {};
        for (var i = 0; i < this.attributes.results.getValue().length; i++) {
            rp[this.attributes.results.getValue()[i].id] = 0;
        }
        this.set({
            resultPoints: rp
        });
    },

    /**
     * Ответить на текущий вопрос
     *
     * @param {string} id - идентификатор выбранного ответа
     * @returns {boolean}
     */
    answer: function(id) {
        if (this.attributes.quiz.getValue()[this.attributes.currentQuestionIndex].answer.options) {
            this.set({
                currentOptionId: id
            });
            for (var i = 0; i < this.attributes.quiz.getValue()[this.attributes.currentQuestionIndex].answer.options.length; i++) {
                var o = this.attributes.quiz.getValue()[this.attributes.currentQuestionIndex].answer.options[i];
                if (o.id === id) {
                    // забираем из опции все привязки которые там есть, сильные и слабые
                    for (var n = 0; n < o.weakLink.length; n++) {
                        var resultId = o.weakLink[n];
                        this.attributes.resultPoints[resultId] += this.attributes.WEAK_LINK_POINTS;
                    }
                    for (var n = 0; n < o.strongLink.length; n++) {
                        var resultId = o.strongLink[n];
                        this.attributes.resultPoints[resultId] += this.attributes.STRONG_LINK_POINTS;
                    }
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Объект-Прототип для добавления в массив
     * Возможно нужна функция
     */
    quizProto1: function() {
        var result = {
            // id: '23434536645'; id for question will be generated
            question: {
                // атрибуты внутри используются для рендера uiTemplate
                uiTemplate: 'id-question_text_template',
                text: new MutAppProperty({
                    model: this,
                    application: this.application,
                    propertyName: null,
                    propertyString: 'id=pm quiz.'+this.attributes.quiz.getValue().length+'.question.text',
                    value: 'Your favourite music?'
                })
            },
            answer: {
                // тип механики ответа: выбор только одной опции, и сразу происходит обработка ответа
                type: 'radiobutton',
                uiTemplate: 'id-answer_question_lst',
                options: [
                    {
                        // атрибуты внутри используются для рендера uiTemplate
                        uiTemplate: 'id-option_text_template',
                        text: 'Rock',
                        type: 'text',
                        // через запятую идишки результатов, привязки
                        strongLink: [],
                        weakLink: []
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Techno',
                        type: 'text',
                        strongLink: [],
                        weakLink: []
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Pop',
                        type: 'text',
                        strongLink: [],
                        weakLink: []
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Jazz',
                        type: 'text',
                        strongLink: [],
                        weakLink: []
                    }
                ]
            }
        };
        this._makeUidForQuizElement(result);
        return result;
    },

    /**
     * Функция прототип для генерации нового результата
     *
     * @returns {{id: string, title: MutAppProperty}}
     */
    resultProto1: function() {
        var result = {
            id: MutApp.Util.getUniqId(6),
            title: new MutAppProperty({
                model: this,
                application: this.application,
                propertyName: null,
                propertyString: 'id=pm results.'+this.attributes.results.getValue().length+'.title',
                value: 'Result title'
            }),
            description: new MutAppProperty({
                model: this,
                application: this.application,
                propertyName: null,
                propertyString: 'id=pm results.'+this.attributes.results.getValue().length+'.description',
                value: 'Result description'
            })
        };
        return result;
    }
});