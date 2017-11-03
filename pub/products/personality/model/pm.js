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
        /**
         *
         */
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
        logoLink: null,
        downloadLink: null,
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
        });
        this.bind('change:results', function() {
            this.start();
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
        this.normalizeResults(); // проверить что всех атрибутов результата хватает, если что дописать новые

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
        this.attributes.showQuestionProgress = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm showQuestionProgress',
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
        this.attributes.logoLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm logoLink',
            value: 'http://testix.me'
        });
        this.attributes.downloadLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=pm downloadLink',
            value: 'http://testix.me'
        });
        this.attributes.questionProgressPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 30, left: 209},
            propertyString: 'id=pm questionProgressPosition'
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
     * Обновление сущностей для публикации
     * В этой механике они зависят от результата теста
     * Этот метод вызывается при любом изменении id=pm results
     */
    updateShareEntities: function() {
        var shareEntitiesArr = this.application.shareEntities.toArray();
        var idsToDelete = [];
        // первый проход, удаление сущностей, для которых результата более не существует
        for (var i = 0; i < shareEntitiesArr.length; i++) {
            var entDictId = this.application.shareEntities.getIdFromPosition(i);
            if (this.attributes.results.getPosition(entDictId) >= 0) {
                // результат такой есть, ентити актуальна
                i++;
            }
            else {
                idsToDelete.push(entDictId);
            }
        }
        for (var i = 0; i < idsToDelete.length; i++) {
            this.application.shareEntities.deleteElementById(idsToDelete[i]);
        }

        // теперь добавление новых ентити
        var resultsArr = this.attributes.results.toArray();
        for (var i = 0; i < resultsArr.length; i++) {
            var resDictId = this.attributes.results.getIdFromPosition(i);
            if (this.application.shareEntities.getPosition(resDictId) < 0) {
                this.application.shareEntities.addElement({
                    id: resultsArr[i].id, // именно этот id будет передаваться при шаринге app.share(id)
                    title: resultsArr[i].title.getValue(),
                    description: resultsArr[i].description.getValue(),
                    imgUrl: null
                }, null, resDictId);
            }
        }
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

        var optionDictionaryIdsToDelete = [];
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
                    for (var k = 0; k < larr.length;) {
                        var resultId = larr[k];
                        var res = this.getResultById(resultId);
                        if (res) {
                            k++;
                        }
                        else {
                            // проверить будет ли такое удаление работать (это же результат вызова toArray)
                            // проверил - работает!
                            larr.splice(k, 1); // larr - либо rl.strongLinks, либо rl.weakLinks
                        }
                    }
                }
            }
            else {
                // опции такой не существует
                // запомнить этот dictionaryId для удаления, удалять в этом проходе нельзя, чтобы не нарушить индексацию по массиву
                optionDictionaryIdsToDelete.push(this.attributes.resultLinking.getIdFromPosition(i));
            }
        }

        // сначала только собрали идишки для удаления
        // теперь можно пройти и удалить какие надо опции
        for (var i = 0; i < optionDictionaryIdsToDelete.length; i++) {
            this.attributes.resultLinking.deleteElementById(optionDictionaryIdsToDelete[i]);
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
                if (this.attributes.randomizeQuestions.getValue() === true) {
                    this.attributes.quiz.shuffle();
                }
                this.set({
                    currentQuestionIndex: 0,
                    currentQuestionId: this.attributes.quiz.toArray()[0].id,
                    state: 'question'
                });
                this.application.stat('Personality', 'start', 'First question');
                this.application.stat('Personality', 'next', 'question', 1);
                break;
            }
            case 'question': {
                if (this.attributes.currentQuestionIndex < this.attributes.quiz.toArray().length-1) {
                    var ni = this.attributes.currentQuestionIndex+1;
                    this.set({
                        currentQuestionIndex: ni,
                        currentQuestionId: this.attributes.quiz.toArray()[ni].id
                    });
                    this.application.stat('Personality', 'next', 'question', ni+1);
                }
                else {
                    // конец теста, финальный скрин
                    this.set({
                        currentResult: this.getPersonalityResultByPoints(this.attributes.resultPoints),
                        state: 'result',
                        currentQuestionId: null,
                        currentQuestionIndex: undefined
                    });
                    this.application.stat('Personality', 'result', this.attributes.currentResult.title.getValue());
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
     *
     * Текстовый вопрос: текстовые ответы
     *
     */
    quizProto1: function() {

        var questionDictionaryId = MutApp.Util.getUniqId(6);

        var qText = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite music?'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.answer.options'
        });

        options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});

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
            id: questionDictionaryId,
            element: element
        };
    },

    /**
     * Фото+текст вопрос, текстовые ответы
     * Шаблон id-question_text_photo_template
     *
     * @returns {}
     */
    quizProto2: function() {

        var questionDictionaryId = MutApp.Util.getUniqId(6);

        var qText = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite music?'
        });
        var qImage = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.questionImage',
            model: this,
            application: this.application,
            value: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/ocean.jpg'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.answer.options'
        });

        options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=pm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});

        // теперь из подготовленных объектов собираем целый объект-слайд
        var element = {
            // id for question will be generated
            question: {
                // атрибуты внутри используются для рендера uiTemplate
                uiTemplate: 'id-question_text_photo_template',
                text: qText,
                questionImage: qImage,
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
            id: questionDictionaryId,
            element: element
        };
    },

    /**
     * Текст вопрос, фото-ответы
     * Шаблон id-question_text_template
     *
     * @returns {}
     */
    quizProto3: function() {

        var questionDictionaryId = MutApp.Util.getUniqId(6);

        var qText = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite picture?'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=pm quiz.'+questionDictionaryId+'.answer.options'
        });

        options.addElementByPrototype('id=pm proto_optionPhoto', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=pm proto_optionPhoto', -1, {questionDictionaryId: questionDictionaryId});

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
                uiTemplate: 'id-answer_question_grid_2',
                options: options
            }
        };
        this._makeUidForQuizElement(element);

        return {
            id: questionDictionaryId,
            element: element
        };
    },

    /**
     * Функция прототип для генерации нового результата
     *
     * @returns {{id: string, title: MutAppProperty}}
     */
    resultProto1: function() {
        var resultDictionaryId = MutApp.Util.getUniqId(6);

        var resultTitle = new MutAppProperty({
            propertyString: 'id=pm results.'+resultDictionaryId+'.title',
            model: this,
            application: this.application,
            value: 'Result title'
        });
        var resultDescription = new MutAppProperty({
            propertyString: 'id=pm results.'+resultDictionaryId+'.description',
            model: this,
            application: this.application,
            value: 'Result description'
        });
        var backgroundImage = new MutAppProperty({
            propertyString: 'id=pm results.'+resultDictionaryId+'.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var backgroundColor = new MutAppProperty({
            propertyString: 'id=pm results.'+resultDictionaryId+'.backgroundColor',
            model: this,
            application: this.application,
            value: null
        });
        var titleColor = new MutAppProperty({
            propertyString: 'id=pm results.'+resultDictionaryId+'.titleColor',
            model: this,
            application: this.application,
            value: null
        });
        var descriptionColor = new MutAppProperty({
            propertyString: 'id=pm results.'+resultDictionaryId+'.descriptionColor',
            model: this,
            application: this.application,
            value: null
        });

        var result = {
            id: 'result_'+MutApp.Util.getUniqId(6),
            title: resultTitle,
            description: resultDescription,
            backgroundImage: backgroundImage,
            backgroundColor: backgroundColor,
            titleColor: titleColor,
            descriptionColor: descriptionColor
        };

        return {
            id: resultDictionaryId,
            element: result
        };
    },

    /**
     * Функция прототип для генерации текстовых опций ответа
     * Надо указать questionDictionaryId, чтобы было понятно в какой именно вопрос теста добавляется опция
     *
     * @param {string} param.questionDictionaryId - например, 'fe1341a'
     */
    proto_optionText: function(param) {
        param = param || {};

        // не удалось придумать нормально как передавать param.questionDictionaryId
        // решил что будет определять по тому какой именно экран вопроса сейчас показан в редакторе
        param.questionDictionaryId = param.questionDictionaryId || this.application.getCurrentQuestionDictionaryId();

        if (!param.questionDictionaryId) {
            throw new Error('PersonalityModel.proto_optionText: questionDictionaryId does not specified');
        }

        var optionId = MutApp.Util.getUniqId(6);

        var optionText = new MutAppProperty({
            propertyString: 'id=pm quiz.'+param.questionDictionaryId+'.answer.options.'+optionId+'.text',
            model: this,
            application: this.application,
            value: 'New option'
        });

        var option = {
            id: 'option_' + MutApp.Util.getUniqId(6),
            type: 'text',
            uiTemplate: 'id-option_text_template',
            text: optionText,
            prototypeName: 'id=pm proto_optionText'
        };
        return {
            id: optionId,
            element: option
        };
    },

    /**
     * Функция прототип для генерации фото опций
     * Надо указать questionDictionaryId, чтобы было понятно в какой именно вопрос теста добавляется опция
     *
     * @param {string} param.questionDictionaryId - например, 'fe1341a'
     */
    proto_optionPhoto: function(param) {
        param = param || {};

        // не удалось придумать нормально как передавать param.questionDictionaryId
        // решил что будет определять по тому какой именно экран вопроса сейчас показан в редакторе
        param.questionDictionaryId = param.questionDictionaryId || this.application.getCurrentQuestionDictionaryId();

        if (!param.questionDictionaryId) {
            throw new Error('PersonalityModel.proto_optionPhoto: questionDictionaryId does not specified');
        }

        var optionId = MutApp.Util.getUniqId(6);

        var optionImg = new MutAppProperty({
            propertyString: 'id=pm quiz.'+param.questionDictionaryId+'.answer.options.'+optionId+'.img',
            model: this,
            application: this.application,
            value: '//p.testix.me/images/products/common/i/image-sample1.jpg'
        });

        var option = {
            id: 'option_' + MutApp.Util.getUniqId(6),
            type: 'img',
            uiTemplate: 'id-option_img_template',
            img: optionImg,
            prototypeName: 'id=pm proto_optionPhoto'
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

        if (sum === 0) {
            // если sum == 0, то привязок нет совсем, надо сделать равнозначные вероятности искусственно
            for (var i = 0; i < resultsValue.length; i++) {
                res[resultsValue[i].id] = 1;
                sum += res[resultsValue[i].id];
            }
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

        var resultsArr = this.attributes.results.toArray();
        // проверка, что количество результатов и shareEntites совпадает (а выше в цикле проверяли наличие всех идишек)
        assert.ok(this.application.shareEntities.toArray().length === resultsArr.length, 'shareEntities and results have the same length');
        for (var i = 0; i < resultsArr.length; i++) {
            // проверка что существует элемент shareEntity для такоо результата
            var resDictId = this.attributes.results.getIdFromPosition(i);
            assert.ok(this.application.shareEntities.getPosition(resDictId) >= 0, 'Share entity exists for result \''+resDictId+'\'');
        }

        // вероятность распределения ответов getResultProbabilities нормальная
        var prps = this.getResultProbabilities();

        console.log('PersonalityModel.isOK: Checking finished. See qunit log or console for details.');
    },

    /**
     * Проверить что у всех результатов имеются необходимые атрибуты
     *
     * Решает такие проблемы как:
     * - Шаблон был сохранен. А после добавили новое mutAppProperty titleColor в элемент результата. При открытии шаблона надо добавить свойство, если не существует
     *
     */
    normalizeResults: function() {
        var results = this.attributes.results.toArray();
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            var dictionaryId = this.attributes.results.getIdFromPosition(i);
            if (!r.titleColor) {
                r.titleColor = new MutAppProperty({
                    propertyString: 'id=pm results.'+dictionaryId+'.titleColor',
                    model: this,
                    application: this.application,
                    value: null
                });
            }
            if (!r.descriptionColor) {
                r.descriptionColor = new MutAppProperty({
                    propertyString: 'id=pm results.'+dictionaryId+'.descriptionColor',
                    model: this,
                    application: this.application,
                    value: null
                });
            }
        }
    }
});