/**
 * Created by artyom.grishanov on 08.07.16.
 */
var TestModel = MutApp.Model.extend({

    defaults: {
        id: 'tm',
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

        showBullits: true,

        showTopColontitle: true,

        showQuestionProgress: true,
        questionProgressPosition: {top:30, left:30},

        currentQuestionId: null,
        currentQuestionIndex: undefined,
        /**
         * Структура вопросов с ответами
         */
        quiz: [
            {
                // id: '23434536645'; id for question will be generated
                question: {
                    // атрибуты внутри используются для рендера uiTemplate
                    uiTemplate: 'id-question_text_template',
                    text: 'Сколько будет дважды два?'
                },
                explanation: {
                    // блок, который будет показан после ответа, в отдельном экране поверх вопроса
                    uiTemplate: 'id-explanation_text_template',
                    text: 'Конечно же 4!'
                },
                answer: {
                    // тип механики ответа: выбор только одной опции, и сразу происходит обработка ответа
                    type: 'radiobutton',
                    uiTemplate: 'id-answer_question_lst',
                    options: [
                        {
                            // атрибуты внутри используются для рендера uiTemplate
                            uiTemplate: 'id-option_text_template',
                            text: '1',
                            type: 'text'
                        },
                        {
                            uiTemplate: 'id-option_text_template',
                            text: '4',
                            type: 'text',
                            points: 1
                        },
                        {
                            uiTemplate: 'id-option_text_template',
                            text: '3',
                            type: 'text'
                        },
                        {
                            uiTemplate: 'id-option_text_template',
                            text: 'Неизвестно',
                            type: 'text'
                        }
                    ]
                }
            },
            {
                question: {
                    uiTemplate: 'id-question_text_template',
                    text: 'Где муравьед?'
                },
                explanation: {
                    uiTemplate: 'id-explanation_text_template',
                    text: 'Муравьед слева, а справа это россомаха'
                },
                answer: {
                    type: 'radiobutton',
                    uiTemplate: 'id-answer_question_grid_2',
                    options: [
                        {
                            uiTemplate: 'id-option_img_template',
                            img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/mur1.jpg',
                            points: 1
                        },
                        {
                            uiTemplate: 'id-option_img_template',
                            img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/mur2.jpg'
                        }
                    ]
                }
            },
            {
                question: {
                    uiTemplate: 'id-question_text_photo_template',
                    text: 'Самый большой океан в мире?',
                    img: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/ocean.jpg'
                },
                explanation: {
                    uiTemplate: 'id-explanation_text_template',
                    text: 'Тихий океан — самый большой по площади и глубине океан на Земле'
                },
                answer: {
                    type: 'radiobutton',
                    uiTemplate: 'id-answer_question_lst_2',
                    options: [
                        {
                            // атрибуты внутри используются для рендера uiTemplate
                            uiTemplate: 'id-option_text_template',
                            text: 'Атлантический',
                            type: 'text'
                        },
                        {
                            uiTemplate: 'id-option_text_template',
                            text: 'Индийский',
                            type: 'text'
                        },
                        {
                            uiTemplate: 'id-option_text_template',
                            text: 'Тихий',
                            type: 'text',
                            points: 1
                        },
                        {
                            uiTemplate: 'id-option_text_template',
                            text: 'Северный Ледовитый',
                            type: 'text'
                        }
                    ]
                }
            }
        ],

        /**
         * Описание результатов, которые можно получить
         * Результаты рассчитываются динамически. Сколько вопросов столько и результатов
         */
        results: []
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);
        this._makeUidForQuiz();
        this.updateResults();
    },

    start: function() {
        // проверить что существует верный ответ, если нет, то поставить первый
        // пользователь или автотесты могут удалить верный ответ, тогда состояние приложения будет неконсистентно
        for (var i = 0; i < this.attributes.quiz.length; i++) {
            var aid = this.getCorrectAnswerId(i);
            if (aid === null) {
                // есть как минимум одна опция ответа
                this.setCorrectAnswer(this.attributes.quiz[i].answer.options[0].id);
            }
        }

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
     * Ответить на текущий вопрос
     * @param id - идентификатор выбранного ответа
     * @returns {boolean}
     */
    answer: function(id) {
        //TODO верный ответ для произвольного ввода значения
        //TODO верный ответ для мультивыбора
        if (this.attributes.quiz[this.attributes.currentQuestionIndex].answer.options) {
            this.set({currentOptionId: id});
            for (var i = 0; i < this.attributes.quiz[this.attributes.currentQuestionIndex].answer.options.length; i++) {
                var o = this.attributes.quiz[this.attributes.currentQuestionIndex].answer.options[i];
                if (o.id === id) {
                    if (o.points !== undefined && o.points > 0) {
                        this.set({'resultPoints': this.attributes.resultPoints+o.points});
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     * Вернуть ид верного ответа
     * @param questionIndex - индекс вопроса
     * @return {string} ид верного ответа
     */
    getCorrectAnswerId: function(questionIndex) {
        //TODO верный ответ для произвольного ввода значения
        //TODO верный ответ для мультивыбора
        if (this.attributes.quiz[questionIndex].answer.options) {
            for (var i = 0; i < this.attributes.quiz[questionIndex].answer.options.length; i++) {
                var o = this.attributes.quiz[questionIndex].answer.options[i];
                if (o.points > 0) {
                    return o.id;
                }
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
        //TODO верный ответ для произвольного ввода значения
        //TODO верный ответ для мультивыбора
        for (var i = 0; i < this.attributes.quiz.length; i++) {
            var q = this.attributes.quiz[i];
            var isActualQuestion = false;
            if (q.answer.options) {
                // если вопрос имеет опции для ответа
                for (var j = 0; j < q.answer.options.length; j++) {
                    var o = q.answer.options[j];
                    if (o.id === id) {
                        // это вопрос с индексом i
                        isActualQuestion = true;
                        break;
                    }
                }
            }
            if (isActualQuestion === true) {
                // теперь для найденного вопроса правим верные ответы
                for (var j = 0; j < q.answer.options.length; j++) {
                    var o = q.answer.options[j];
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
        if (this.attributes.quiz[currentQuestionIndex].answer.options) {
            // если вопрос имеет опции ответа, некоторые могут не иметь
            for (var i = 0; i < this.attributes.quiz[currentQuestionIndex].answer.options.length; i++) {
                var o = this.attributes.quiz[currentQuestionIndex].answer.options[i];
                if (o.id === id) {
                    return o;
                }
            }
        }
        return null;
    },

    /**
     * Сейчас принцип формирования результатов жестко определен
     * Например: если 3 вопроса, то 4 результата - так как на все можно неправильно ответить.
     */
    updateResults: function() {
        var resultsCount = this.attributes.quiz.length+1; // +1 надо, так как можно отвтеить неверно на все вопросы
        for (var i = 0; i < resultsCount; i++) { //+1
            // если такого результата не существует, то создать.
            // это может случиться после добавления нового вопроса в тест
            if (!this.attributes.results[i]) {
                // этот результат значит "ответил правильно на i вопросов"
                this.attributes.results[i] = {
                    minPoints: i,
                    maxPoints: i,
                    title: 'Название результата ' + i,
                    description: 'Неплохо для начала.'
                };
                this.attributes.results[i].id = MD5.calc(this.attributes.results[i].title + this.attributes.results[i].description + i).substr(0,6);;
            }
        }
        if (this.attributes.results.length > resultsCount) {
            //при удалении соответственно надо уменьшить количество результатов ровно столько сколько ответов
            this.attributes.results.splice(resultsCount, this.attributes.results.length)
        }
    },

    /**
     * Сгенерировать уникальные идишки для вопросов и ответов
     */
    _makeUidForQuiz: function() {
        for (var j = 0; j < this.attributes.quiz.length; j++) {
            var q = this.attributes.quiz[j];
            q.id = MD5.calc(q.question.text + j);
            if (this.attributes.quiz[j].answer.options) {
                // опций ответа может и не быть
                for (var i = 0; i < this.attributes.quiz[j].answer.options.length; i++) {
                    var o = q.answer.options[i];
                    o.id = MD5.calc(o.text + o.img + j + i).substr(0,6);
                }
            }
        }
    }

});