/**
 * Created by artyom.grishanov on 08.07.16.
 */
var TestModel = Backbone.Model.extend({

    defaults: {
        state: null,
        currentResult: null,
        resultPoints: 0,
        randomizeQuestions: false,
        randomizeOptions: false,
        /**
         * Единая настройка для всех экранов, пожтому здесь
         */
        showBackgroundImage: false,
        logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',
        showQuestionProgress: true,

        currentQuestionId: null,
        currentQuestionIndex: undefined,
        /**
         * Структура вопросов с ответами
         */
        quiz: [
            {
                uiTemplate: 'id-slide_text_template',
                text: 'Мадагаскар -- это где?',
                options: [
                    {
                        text: 'Страна на западе Африки',
                        type: 'text',
                        explanation: ''
                    },
                    {
                        text: 'Остров в Атлантическом океане',
                        type: 'text',
                        explanation: ''
                    },
                    {
                        text: 'Остров на юге Африки',
                        type: 'text',
                        points: 1,
                        explanation: 'Да, верно'
                    }
                ],
                explanation: ''
            },
            {
                uiTemplate: 'id-slide_photo_template',
                text: 'Текст фото вопроса?',
                //TODO base64 data
                img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/picture1.jpg',
                options: [
                    {
                        text: 'Вариант ответа 1',
                        points: 1
                    },
                    {
                        text: 'Вариант ответа 2'
                    }
                ],
                explanation: ''
            },
            {
                uiTemplate: 'id-slide_text_template',
                text: 'Какая самая большая страна?',
                options: [
                    {
                        text: 'Гренландия'
                    },
                    {
                        text: 'Россия',
                        points: 1
                    },
                    {
                        text: 'Австралия'
                    }
                ],
                explanation: ''
            },
            {
                uiTemplate: 'id-slide_text_template',
                text: 'Какого моря не существует?',
                options: [
                    {
                        text: 'Черное море'
                    },
                    {
                        text: 'Синее море',
                        points: 1
                    },
                    {
                        text: 'Красное море'
                    },
                    {
                        text: 'Желтое море'
                    }
                ]
            }
        ],

        /**
         * Описание результатов, которые можно получить
         * Результаты рассчитываются динамически. Сколько вопросов столько и результатов
         */
        results: [],

        // шаблон текстового вопроса
        proto__text_slide: {
            uiTemplate: 'id-slide_text_template',
            text: 'Текст вопроса?',
            options: [
                {
                    text: 'Вариант ответа 1',
                    points: 1
                },
                {
                    text: 'Вариант ответа 2'
                }
            ],
            explanation: ''
        },

        // шаблон фото вопроса
        proto__photo_question_slide: {
            uiTemplate: 'id-slide_photo_template',
            text: 'Текст фото вопроса?',
            img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/picture1.jpg',
            options: [
                {
                    text: 'Вариант ответа 1',
                    points: 1
                },
                {
                    text: 'Вариант ответа 2'
                }
            ],
            explanation: '' // пояснение к ответу
        },

        proto__option_text: {
            text: 'Вариант ответа'
        }
    },

    initialize: function() {
        console.log('model initialize');
        this._makeUidForQuiz();
        this.updateResults();
    },

    start: function() {
        this.next();
    },

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
            case 'question': {
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
                this.set({state: 'welcome'});
                break;
            }
            default: {
                this.set({state: 'welcome'});
            }
        }
        return this.attributes.state;
    },

    /**
     * Найти вопрос ио Id
     * @param id
     * @returns {*}
     */
    getQuestionById: function(id) {
        for (var i = 0; i < this.attributes.quiz.length; i++) {
            if (id === this.attributes.quiz[i].id) {
                return this.attributes.quiz[i];
            }
        }
        return null;
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
     * Ответить на текущий вопрос
     * @param id - идентификатор выбранного ответа
     * @returns {boolean}
     */
    answer: function(id) {
        this.set({currentOptionId: id});
        for (var i = 0; i < this.attributes.quiz[this.attributes.currentQuestionIndex].options.length; i++) {
            var o = this.attributes.quiz[this.attributes.currentQuestionIndex].options[i];
            if (o.id === id) {
                if (o.points !== undefined && o.points > 0) {
                    this.set({'resultPoints': this.attributes.resultPoints+o.points});
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Вернуть ид верного ответа
     * @param questionIndex - индекс вопроса
     */
    getCorrectAnswerId: function(questionIndex) {
        for (var i = 0; i < this.attributes.quiz[questionIndex].options.length; i++) {
            var o = this.attributes.quiz[questionIndex].options[i];
            if (o.points > 0) {
                return o.id;
            }
        }
        return null;
    },

    /**
     * Установить опцию ответа как верную.
     * Номер вопроса необязателен. Так как по ид опции мы определим к какому вопросу она относится.
     * @param {string} id - ид опции, все опции в тесте имеют уникальные идентификаторы
     */
    setCorrectAnswer: function(id) {
        for (var i = 0; i < this.attributes.quiz.length; i++) {
            var q = this.attributes.quiz[i];
            var isActualQuestion = false;
            for (var j = 0; j < q.options.length; j++) {
                var o = q.options[j];
                if (o.id === id) {
                    // это вопрос с индексом i
                    isActualQuestion = true;
                    break;
                }
            }
            if (isActualQuestion === true) {
                // теперь для найденного вопроса правим верные ответы
                for (var j = 0; j < q.options.length; j++) {
                    var o = q.options[j];
                    if (o.id === id) {
                        o.points = 1;
                    }
                    else {
                        o.points = 0;
                    }
                }
                break;
            }
        }
    },

    /**
     * Вернуть по идентификатору опцию ответа
     *
     * @param {string} id - идентификатор опции
     * @param {number} currentQuestionIndex - индекс вопроса
     */
    getOptionById: function(id, currentQuestionIndex) {
        for (var i = 0; i < this.attributes.quiz[currentQuestionIndex].options.length; i++) {
            var o = this.attributes.quiz[currentQuestionIndex].options[i];
            if (o.id === id) {
                return o;
            }
        }
        return null;
    },

    /**
     *
     */
    updateResults: function() {
        for (var i = 0; i < this.attributes.quiz.length; i++) {
            // если такого результата не существует, то создать.
            // это может случиться после добавления нового вопроса в тест
            if (!this.attributes.results[i]) {
                // этот результат значит "ответил правильно на i вопросов"
                this.attributes.results[i] = {
                    minPoints: i,
                    maxPoints: i+1,
                    title: 'Название результата ' + (i+1),
                    description: 'Неплохо для начала.'
                };
            }
        }
        if (this.attributes.results.length > this.attributes.quiz.length) {
            //при удалении соответственно надо уменьшить количество результатов ровно столько сколько ответов
            this.attributes.results.splice(this.attributes.quiz.length, this.attributes.results.length)
        }
    },

    /**
     * Сгенерировать уникальные идишки для вопросов и ответов
     */
    _makeUidForQuiz: function() {
        for (var j = 0; j < this.attributes.quiz.length; j++) {
            var q = this.attributes.quiz[j];
            q.id = MD5.calc(q.text + i);
            for (var i = 0; i < this.attributes.quiz[j].options.length; i++) {
                var o = q.options[i];
                o.id = MD5.calc(o.text + j + i).substr(0,6);
            }
        }
    }

});