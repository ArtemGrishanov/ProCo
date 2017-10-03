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
        /**
         * случайный порядок вопросов
         */
        randomizeQuestions: null,
        /**
         * Вопросы теста Personality
         */
        quiz: null,

        startScreenBackgroundImg: null,
        /**
         * Показывать ли лого на стартовом экране
         */
        showLogoOnStartScreen: null,
        /**
         * Показывать ли логотип на эйране с вопросами
         */
        showLogoInQuestions: null,
        /**
         * Показывать ли лого в результатах
         */
        showLogoInResults: null,
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
        logoUrl: null,
        /**
         * MutAppPropertyDictionary
         * Сложное свойство, которое задает соответствие между опциями и результатами
         *
         * [
         * {optionId_n, strongLinks: [resultId_m], weakLinks: []},
         * {optionId_x, strongLinks: [resultId_y], weakLinks: [resultId_u]},
         *  ...
         * ]
         */
        resultLinking: null
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);

        this.bind('change:quiz', function() {
            this.start();
            this.updateResultLinking();
        });
        this.bind('change:results', function() {
            this.start();
            this.updateResultLinking();
        });
        this.attributes.randomizeQuestions = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm randomizeQuestions',
            value: false
        });
        this.attributes.results = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=pm results',
            value: []
        });
        this.attributes.quiz = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=pm quiz',
            value: []
        });
        this.attributes.startScreenBackgroundImg = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm startScreenBackgroundImg',
            value: null // 'http://cdn0.redkassa.ru/live/sitenew/picture/871de92e-2b5f-4a3f-be16-8e2b6031bd66',
        });
        this.attributes.showLogoOnStartScreen = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm showLogoOnStartScreen',
            value: true
        });
        // свойство одно на все экраны с вопросами
        this.attributes.showLogoInQuestions = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm showLogoInQuestions',
            value: true
        });
        this.attributes.showLogoInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm showLogoInResults',
            value: true
        });
        // свойство одно на все экраны с вопросами
        this.attributes.shadowEnableInQuestions = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm shadowEnableInQuestions',
            value: false
        });
        // свойство одно на все экраны с результатами
        this.attributes.shadowEnableInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm shadowEnableInResults',
            value: false
        });
        this.attributes.logoUrl = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm logoUrl',
            value: '//s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg'
        });
        this.attributes.logoPositionInQuestions = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=pm logoPositionInQuestions'
        });
        this.attributes.logoPositionInResults = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=pm logoPositionInResults'
        });
        this.attributes.fbSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=pm fbSharingEnabled'
        });
        this.attributes.vkSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=pm vkSharingEnabled'
        });
        this.attributes.fbSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 219, left: 294},
            propertyString: 'id=pm fbSharingPosition'
        });
        this.attributes.vkSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 270, left: 294},
            propertyString: 'id=pm vkSharingPosition'
        });
        this.attributes.showDownload = new MutAppProperty({
            application: this.application,
            model: this,
            value: false,
            propertyString: 'id=pm showDownload'
        });
        this.attributes.resultLinking = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            value: [],
            propertyString: 'id=pm resultLinking'
        });
        this.attributes.restartButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Заново',
            propertyString: 'id=pm restartButtonText'
        });
        this.attributes.downloadButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Download',
            propertyString: 'id=pm downloadButtonText'
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
     *
     * Обновить структуру 'id=pm resultLinking'
     * 1) Удалить опции которых не существует более
     * 2) Удалить id результатов которых больше не существует
     * 3) Добавить новые опции которых нет в resultLinking
     *
     * Вызывается когда:
     * - изменение quiz
     * - dictionary options одного из вопросов
     * - results
     */
    updateResultLinking: function() {
        //[
          //{optionId_n, strongLinks: [resultId_m], weakLinks: []},
          //{optionId_x, strongLinks: [resultId_y], weakLinks: [resultId_u]},
        //  ]

        var resultLinkingArr = this.attributes.resultLinking.toArray();
        // первый проход на удаление несуществующих
        for (var i = 0; i < resultLinkingArr.length; i++) {
            var rl = resultLinkingArr[i];
            var opt = this.getOptionById(rl.optionId);
            if (opt) {
                // чтобы не дублировать код для каждого массива strongLinks и weakLinks
                var linksArrays = [rl.strongLinks, rl.weakLinks];
                while (linksArrays.length > 0) {
                    var larr = linksArrays.shift();
                    for (var k = 0; k < larr;) {
                        var resultId = larr[k];
                        var res = this.getResultById(resultId)
                        if (res) {
                            k++;
                        }
                        else {
                            // todo проверить будет ли такое удаление работать (это же результат вызова toArray)
                            rl.strongLinks.splice(k, 1)
                        }
                    }
                }
            }
            else {
                // опции такой не существует
                this.attributes.resultLinking.deleteElement(i); // deleting in dictionary by position
            }
        }

        // второй проход на добавление новых опций
        // даже если нет привязок к опции, то элемент с такой опцией всё равно должен быть
        var quizArr = this.attributes.quiz.toArray();
        for (var i = 0; i < quizArr.length; i++) {
            var options = quizArr[i].answer.options.toArray();
            for (var k = 0; k < options.length; k++) {
                if (this.getResultLinkingOption(options[k].id) === null) {
                    // новая опция, например добавли новый экран или ответ
                    this.attributes.resultLinking.addElement({
                        optionId: options[k].id,
                        strongLinks: [],
                        weakLinks: []
                    });
                }
            }
        }

        var stophrr = 0;
    },

    /**
     * Найти опцию в словаре resultLinking
     * @param {string} optionId
     */
    getResultLinkingOption: function(optionId) {
        var resultLinkingArr = this.attributes.resultLinking.toArray();
        for (var i = 0; i < resultLinkingArr.length; i++) {
            if (resultLinkingArr[i].optionId == optionId) {
                return resultLinkingArr[i];
            }
        }
        return null;
    },

    /**
     * Найти вопрос по Id
     * @param id
     * @returns {*}
     */
    getQuestionById: function(id) {
        var quizValue = this.attributes.quiz.toArray();
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
        var quizValue = this.attributes.quiz.toArray();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options.toArray();
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
//    setStrongConnection: function(optionId, resultId) {
//        var o = this.getOptionById(optionId);
//        if (!o) {
//            throw new Error('PersonalityModel.setStrongConnection: option \''+optionId+' does not exist');
//        }
//        var r = this.getResultById(resultId);
//        if (!r) {
//            throw new Error('PersonalityModel.setStrongConnection: option \''+optionId+' does not exist');
//        }
//        if (o.strongLink.indexOf(resultId) >= 0) {
//            // уже привязано
//        }
//        else {
//            // удалить слабую связь если она есть, одновременно сильная и слабая связь не могут существовать
//            this.deleteWeakConnection(optionId, resultId);
//            o.strongLink.push(resultId);
//        }
//    },

    /**
     * Проверить наличие сильной связи между опцией и результатом
     *
     * @param {string} optionId
     * @param {string} resultId
     * @returns {boolean}
     */
//    isStrongConnection: function(optionId, resultId) {
//        var o = this.getOptionById(optionId);
//        if (!o) {
//            throw new Error('PersonalityModel.isStrongConnection: option \''+optionId+' does not exist');
//        }
//        var r = this.getResultById(resultId);
//        if (!r) {
//            throw new Error('PersonalityModel.isStrongConnection: option \''+optionId+' does not exist');
//        }
//        return o.strongLink.indexOf(resultId) >= 0;
//    },

    /**
     * Удалить сильную связь между опцией и резальтатом
     *
     * @param {string} optionId
     * @param {string} resultId
     */
//    deleteStrongConnection: function(optionId, resultId) {
//        var o = this.getOptionById(optionId);
//        if (!o) {
//            throw new Error('PersonalityModel.deleteStrongConnection: option \''+optionId+' does not exist');
//        }
//        var r = this.getResultById(resultId);
//        if (!r) {
//            throw new Error('PersonalityModel.deleteStrongConnection: option \''+optionId+' does not exist');
//        }
//        var delIndex = o.strongLink.indexOf(resultId);
//        if (delIndex >= 0) {
//            o.strongLink.splice(delIndex, 1);
//        }
//    },

    /**
     * Задать слабую связь между опцией и результатом
     *
     * @param {string} optionId
     * @param {string} resultId
     */
//    setWeakConnection: function(optionId, resultId) {
//        var o = this.getOptionById(optionId);
//        if (!o) {
//            throw new Error('PersonalityModel.setWeakConnection: option \''+optionId+' does not exist');
//        }
//        var r = this.getResultById(resultId);
//        if (!r) {
//            throw new Error('PersonalityModel.setWeakConnection: option \''+optionId+' does not exist');
//        }
//        if (o.weakLink.indexOf(resultId) >= 0) {
//            // уже привязано
//        }
//        else {
//            // удалить сильную связь если она есть, одновременно сильная и слабая связь не могут существовать
//            this.deleteStrongConnection(optionId, resultId);
//            o.weakLink.push(resultId);
//        }
//    },

    /**
     * Проверить наличие слабой связи между опцией и результатом
     *
     * @param {string} optionId
     * @param {string} resultId
     * @returns {boolean}
     */
//    isWeakConnection: function(optionId, resultId) {
//        var o = this.getOptionById(optionId);
//        if (!o) {
//            throw new Error('PersonalityModel.isWeakConnection: option \''+optionId+' does not exist');
//        }
//        var r = this.getResultById(resultId);
//        if (!r) {
//            throw new Error('PersonalityModel.isWeakConnection: option \''+optionId+' does not exist');
//        }
//        return o.weakLink.indexOf(resultId) >= 0;
//    },

    /**
     * Удалить слабую связь между опцией и резальтатом
     *
     * @param {string} optionId
     * @param {string} resultId
     */
//    deleteWeakConnection: function(optionId, resultId) {
//        var o = this.getOptionById(optionId);
//        if (!o) {
//            throw new Error('PersonalityModel.deleteWeakConnection: option \''+optionId+' does not exist');
//        }
//        var r = this.getResultById(resultId);
//        if (!r) {
//            throw new Error('PersonalityModel.deleteWeakConnection: option \''+optionId+' does not exist');
//        }
//        var delIndex = o.weakLink.indexOf(resultId);
//        if (delIndex >= 0) {
//            o.weakLink.splice(delIndex, 1);
//        }
//    },

    /**
     * Сгенерировать идишки для вопроса и опций ответа
     *
     * @param question
     * @private
     */
    _makeUidForQuizElement: function(quizElement) {
        quizElement.id = 'question_'+MutApp.Util.getUniqId(6);
        var options = quizElement.answer.options.toArray();
        if (options) {
            // опций ответа может и не быть
            for (var i = 0; i < options.length; i++) {
                var o = options[i];
                o.id = 'option_'+MutApp.Util.getUniqId(6);
            }
        }
    },

    /**
     * Смена состояния
     *
     * @returns
     */
    next: function() {
        if (this.attributes.quiz.toArray().length === 0) {
            console.error('Personality Model.next: no quiz elements');
            return;
        }
        if (this.attributes.results.toArray().length === 0) {
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
                    currentQuestionId: this.attributes.quiz.toArray()[0].id,
                    state: 'question'
                });
                this.application.stat('Test', 'start', 'First question');
                this.application.stat('Test', 'next', 'question', 1);
                break;
            }
            case 'question': {
                if (this.attributes.currentQuestionIndex < this.attributes.quiz.toArray().length-1) {
                    var ni = this.attributes.currentQuestionIndex+1;
                    this.set({
                        currentQuestionIndex: ni,
                        currentQuestionId: this.attributes.quiz.toArray()[ni].id
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

    /**
     * Найти результат с наибольшим числом баллов
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
        var results = this.attributes.results.toArray();
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
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
        var results = this.attributes.results.toArray();
        for (var i = 0; i < results.length; i++) {
            rp[results[i].id] = 0;
        }
        this.set({
            resultPoints: rp
        });
    },

    /**
     * Ответить на текущий вопрос
     *
     * @param {string} optionId - id выбранного ответа
     */
    answer: function(optionId) {
        if (this.getOptionById(optionId) === null) {
            throw new Error('PersonalityModel.answer: option \''+optionId+'\' does not exist in model');
        }
        this.set({
            currentOptionId: optionId
        });
        var resLinksArr = this.attributes.resultLinking.toArray();
        for (var i = 0; i < resLinksArr.length; i++) {
            var o = resLinksArr[i];
            if (o.optionId === optionId) {
                // забираем из опции все привязки которые там есть, сильные и слабые
                for (var n = 0; n < o.weakLinks.length; n++) {
                    var resultId = o.weakLinks[n];
                    this.attributes.resultPoints[resultId] += this.attributes.WEAK_LINK_POINTS;
                }
                for (var n = 0; n < o.strongLinks.length; n++) {
                    var resultId = o.strongLinks[n];
                    this.attributes.resultPoints[resultId] += this.attributes.STRONG_LINK_POINTS;
                }
                return;
            }
        }
        throw new Error('PersonalityModel.answer: option \''+optionId+'\' not found in resultLinking dictionary');
    },

    /**
     * Объект-Прототип для добавления в массив
     * Возможно нужна функция
     */
    quizProto1: function() {

        var quizElemId = MutApp.Util.getUniqId(6);

        var qText = new MutAppProperty({
            propertyString: 'id=pm quiz.'+quizElemId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite music?'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=pm quiz.'+quizElemId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=pm quiz.'+quizElemId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=pm quiz.'+quizElemId+'.answer.options'
        });

        options.addElementByPrototype('id=pm proto_optionText', -1, {questionId: quizElemId});
        options.addElementByPrototype('id=pm proto_optionText', -1, {questionId: quizElemId});
        options.addElementByPrototype('id=pm proto_optionText', -1, {questionId: quizElemId});

        // теперь из подготовленных объектов собираем целый объект-слайд
        var element = {
            // id for question will be generated
            question: {
                // атрибуты внутри используются для рендера uiTemplate
                uiTemplate: 'id-question_text_template',
                text: qText,
                backgroundImage: qBackgroundImage,
                backgroundColor: qBackgroundColor
            },
            answer: {
                // тип механики ответа: выбор только одной опции, и сразу происходит обработка ответа
                type: 'radiobutton',
                uiTemplate: 'id-answer_question_lst',
                options: options
            }
        };
        this._makeUidForQuizElement(element);

        return {
            id: quizElemId,
            element: element
        };
    },

    /**
     * Функция прототип для генерации нового результата
     *
     * @returns {{id: string, title: MutAppProperty}}
     */
    resultProto1: function() {
        var resultId = MutApp.Util.getUniqId(6);

        var resultTitle = new MutAppProperty({
            propertyString: 'id=pm results.'+resultId+'.title',
            model: this,
            application: this.application,
            value: 'Result title'
        });
        var resultDescription = new MutAppProperty({
            propertyString: 'id=pm results.'+resultId+'.description',
            model: this,
            application: this.application,
            value: 'Result description'
        });
        var backgroundImage = new MutAppProperty({
            propertyString: 'id=pm results.'+resultId+'.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var backgroundColor = new MutAppProperty({
            propertyString: 'id=pm results.'+resultId+'.backgroundColor',
            model: this,
            application: this.application,
            value: null
        });

        var result = {
            id: 'result_'+MutApp.Util.getUniqId(6),
            title: resultTitle,
            description: resultDescription,
            backgroundImage: backgroundImage,
            backgroundColor: backgroundColor
        };

        return {
            id: resultId,
            element: result
        };
    },

    /**
     * Функция прототип для генерации текстовых опций ответа
     */
    proto_optionText: function(param) {

        if (!param.questionId) {
            throw new Error('PersonalityModel.proto_optionText: questionId does not specified');
        }

        var optionId = MutApp.Util.getUniqId(6);

        var optionText = new MutAppProperty({
            propertyString: 'id=pm quiz.'+param.questionId+'.answer.options.'+optionId+'.text',
            model: this,
            application: this.application,
            value: 'New option'
        });

        var option = {
            id: MutApp.Util.getUniqId(6),
            type: 'text',
            uiTemplate: 'id-option_text_template',
            text: optionText
        };
        return {
            id: optionId,
            element: option
        };
    },

    /**
     * Посчитать вероятност выпадения каждого результата на основе привязок
     * Условимся что пользователь отвечает случайным образом
     *
     */
    getResultProbabilities: function() {
        var res = {};
        var resultsValue = this.attributes.results.toArray();
        for (var i = 0; i < resultsValue.length; i++) {
            res[resultsValue[i].id] = 0;
        }

        var resLinksArr = this.attributes.resultLinking.toArray();
        // по всем привязкам складываем суммы: STRONG_LINK_POINTS за 1 сильную привязку, WEAK_LINK_POINTS за одну слабую
        for (var i = 0; i < resLinksArr.length; i++) {
            for (var k = 0; k < resLinksArr[i].strongLinks.length; k++) {
                var resultId = resLinksArr[i].strongLinks[k];
                if (res.hasOwnProperty(resultId) === false) {
                    throw new Error('PersonalityModel.getResultProbabilities: result \'' + resultId + '\' in resultLinking dictionary does not exist in model');
                }
                else {
                    res[resultId] += this.attributes.STRONG_LINK_POINTS;
                }
            }
            for (var k = 0; k < resLinksArr[i].weakLinks.length; k++) {
                var resultId = resLinksArr[i].weakLinks[k];
                if (res.hasOwnProperty(resultId) === false) {
                    throw new Error('PersonalityModel.getResultProbabilities: result \'' + resultId + '\' in resultLinking dictionary does not exist in model');
                }
                else {
                    res[resultId] += this.attributes.WEAK_LINK_POINTS;
                }
            }
        }

        // общая сумма баллов на все результаты
        var sum = 0;
        for (var i = 0; i < resultsValue.length; i++) {
            sum += res[resultsValue[i].id];
        }

        // процентное соотношение баллов результата от всех возможных баллов в тесте
        for (var i = 0; i < resultsValue.length; i++) {
            res[resultsValue[i].id] = res[resultsValue[i].id] / sum;
        }

        return res;
    },

    /**
     * Функция проверки модели
     *
     * @param assert
     * @returns {boolean}
     */
    isOK: function(assert) {
        assert = assert || MutApp.Util.getMockAssert();

        var resLinksArr = this.attributes.resultLinking.toArray();
        var foundOptionIds = [];

        for (var i = 0; i < resLinksArr.length; i++) {
            var optionId = resLinksArr[i].optionId;
            // проверка что все опции в resultLinking существуют
            assert.ok(this.getOptionById(optionId), 'Option exist');
            // проверка что опции не дублируются
            if (foundOptionIds.indexOf(optionId) >= 0) {
                assert.ok(false, 'Duplicate option \''+optionId+'\' in resultLinking dictionary');
            }
            else {
                foundOptionIds.push(optionId);
            }

            var foundResultIds = [];
            // все результаты в resultLinking.strongLinks существуют
            for (var k = 0; k < resLinksArr[i].strongLinks.length; k++) {
                var resultId = resLinksArr[i].strongLinks[k];
                assert.ok(this.getResultById(resultId), 'Result exist in model');

                // один resultId встречается для одной опции только один раз: либо в weakLinks, либо в strongLinks
                if (foundResultIds.indexOf(resultId) >= 0) {
                    assert.ok(false, 'Duplicate result \''+resultId+'\' in strongLinks for option \''+optionId+'\'');
                }
                else {
                    foundResultIds.push(resultId);
                }
            }
            // все результаты в resultLinking.weakLinks существуют
            for (var k = 0; k < resLinksArr[i].weakLinks.length; k++) {
                var resultId = resLinksArr[i].weakLinks[k];
                assert.ok(this.getResultById(resultId), 'Result exist in model');

                // один resultId встречается для одной опции только один раз: либо в weakLinks, либо в strongLinks
                if (foundResultIds.indexOf(resultId) >= 0) {
                    assert.ok(false, 'Duplicate result \''+resultId+'\' in strongLinks for option \''+optionId+'\'');
                }
                else {
                    foundResultIds.push(resultId);
                }
            }
        }

        // вероятность распределения ответов getResultProbabilities нормальная
        var prps = this.getResultProbabilities();

        console.log('PersonalityModel.isOK: Checking finished. See qunit log or console for details.');
    }
});