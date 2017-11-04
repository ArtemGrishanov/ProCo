/**
 * Created by artyom.grishanov on 08.07.16.
 */
var TriviaModel = MutApp.Model.extend({

    defaults: {
        /**
         * Обычные свойства приложения
         */
        id: 'tm',
        state: null,
        currentResult: null,
        points: 0,
        currentQuestionId: null,
        currentQuestionIndex: undefined,
        /**
         * Распределение набранных баллов и резульатов.
         * Это не MutAppProperty. Его нельзя задать руками.
         * Распределение обновляется автоматически в зависимости от количества результатов
         *
         * {0: 'result1',
         * 1: 'result1',
         * 2: 'result2',
         * ...}
         */
        resulPointsAllocation: {},
        /**
         *
         * @type {MutAppProperty}
         */
        randomizeQuestions: false,
        /**
         *
         * @type {MutAppProperty}
         */
        startScreenBackgroundImg: null,
        /**
         * ссылка одна на все экраны
         * @type {MutAppProperty}
         */
        logoUrl: null,
        /**
         * Переход по ссылке на лого на этот урл
         * @type {MutAppProperty}
         */
        logoLink: null,
        /**
         * Кнопка Скачать в конце теста. По сути тоже кнопка со ссылкой
         * @type {MutAppProperty}
         */
        downloadLink: null,
        /**
         * Показывать ли лого на стартовом экране
         * @type {MutAppProperty}
         */
        showLogoOnStartScreen: null,
        /**
         * Показывать ли логотип на эйране с вопросами
         * @type {MutAppProperty}
         */
        showLogoInQuestions: null,
        /**
         * Показывать ли лого в результатах
         * @type {MutAppProperty}
         */
        showLogoInResults: null,
        /**
         *
         * @type {MutAppProperty}
         */
        questionProgressPosition: null,
        /**
         *
         * @type {MutAppProperty}
         */
        fbSharingEnabled: true,
        /**
         *
         * @type {MutAppProperty}
         */
        vkSharingEnabled: true,
        /**
         *
         * @type {MutAppProperty}
         */
        showExplanation: null,
        /**
         * Структура вопросов с ответами
         * @type {MutAppPropertyDictionary}
         */
        quiz: null,
        /**
         * Описание результатов, которые можно получить
         * Результаты рассчитываются динамически. Сколько вопросов столько и результатов
         * @type {MutAppPropertyDictionary}
         */
        results: null,
        /**
         * Сложное кастомное свойство отвечающее за верность ответов
         * Пользователь вручную назначает верные ответы, В одном вопросе может быть только один верный ответ
         *
         * [ {optionId: optionId1, points: 1} , {optionId: optionId2, points: 0}, {optionId: optionId3, points: 0} .... ]
         * @type {MutAppPropertyDictionary}
         */
        optionPoints: null
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
            propertyString: 'id=tm randomizeQuestions',
            value: false
        });
        this.attributes.results = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=tm results',
            value: []
        });
        this.attributes.optionPoints = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            value: [],
            propertyString: 'id=tm optionPoints'
        });
        
        this.normalizeResults(); // проверить что всех атрибутов результата хватает, если что дописать новые

        this.attributes.quiz = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=tm quiz',
            value: []
        });
        this.attributes.startScreenBackgroundImg = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm startScreenBackgroundImg',
            value: null // 'http://cdn0.redkassa.ru/live/sitenew/picture/871de92e-2b5f-4a3f-be16-8e2b6031bd66',
        });
        this.attributes.showLogoOnStartScreen = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm showLogoOnStartScreen',
            value: true
        });
        // свойство одно на все экраны с вопросами
        this.attributes.showLogoInQuestions = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm showLogoInQuestions',
            value: true
        });
        this.attributes.showLogoInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm showLogoInResults',
            value: true
        });
        this.attributes.showQuestionProgress = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm showQuestionProgress',
            value: true
        });
        // свойство одно на все экраны с вопросами
        this.attributes.shadowEnableInQuestions = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm shadowEnableInQuestions',
            value: false
        });
        // свойство одно на все экраны с результатами
        this.attributes.shadowEnableInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm shadowEnableInResults',
            value: false
        });
        this.attributes.logoUrl = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm logoUrl',
            value: '//s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg'
        });
        this.attributes.logoLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm logoLink',
            value: 'http://testix.me'
        });
        this.attributes.downloadLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=tm downloadLink',
            value: 'http://testix.me'
        });
        this.attributes.questionProgressPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 30, left: 209},
            propertyString: 'id=tm questionProgressPosition'
        });
        this.attributes.logoPositionInQuestions = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=tm logoPositionInQuestions'
        });
        this.attributes.logoPositionInResults = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=tm logoPositionInResults'
        });
        this.attributes.fbSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=tm fbSharingEnabled'
        });
        this.attributes.vkSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=tm vkSharingEnabled'
        });
        this.attributes.fbSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 219, left: 294},
            propertyString: 'id=tm fbSharingPosition'
        });
        this.attributes.vkSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 270, left: 294},
            propertyString: 'id=tm vkSharingPosition'
        });
        this.attributes.showDownload = new MutAppProperty({
            application: this.application,
            model: this,
            value: false,
            propertyString: 'id=tm showDownload'
        });
        this.attributes.showExplanation = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=tm showExplanation'
        });
        this.attributes.restartButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Заново',
            propertyString: 'id=tm restartButtonText'
        });
        this.attributes.downloadButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Download',
            propertyString: 'id=tm downloadButtonText'
        });

        this.updateResultPointsAllocation();
    },

    start: function() {
        this.set({
            state: 'welcome',
            currentResult: null,
            currentQuestionId: null,
            points: 0
        });
        // проверить что существует верный ответ, если нет, то поставить первый
        // пользователь или автотесты могут удалить верный ответ, тогда состояние приложения будет неконсистентно
//        for (var i = 0; i < this.attributes.quiz.length; i++) {
//            var aid = this.getCorrectAnswerId(i);
//            if (aid === null) {
//                // есть как минимум одна опция ответа
//                this.setCorrectAnswer(this.attributes.quiz[i].answer.options[0].id);
//            }
//        }
//
//        this.next();
    },

    next: function() {
        if (this.attributes.quiz.toArray().length === 0) {
            console.error('Trivia Model.next: no quiz elements');
            return;
        }
        if (this.attributes.results.toArray().length === 0) {
            console.error('Trivia Model.next: no results');
            return;
        }
        switch (this.attributes.state) {
            case 'welcome': {
                this.set({
                    points: 0,
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
                this.application.stat('Trivia', 'start', 'First question');
                this.application.stat('Trivia', 'next', 'question', 1);
                break;
            }
            case 'question': {
                if (this.attributes.currentQuestionIndex < this.attributes.quiz.toArray().length-1) {
                    var ni = this.attributes.currentQuestionIndex+1;
                    this.set({
                        currentQuestionIndex: ni,
                        currentQuestionId: this.attributes.quiz.toArray()[ni].id
                    });
                    this.application.stat('Trivia', 'next', 'question', ni+1);
                }
                else {
                    // конец теста, финальный скрин
                    this.set({
                        currentResult: this.getResultByPoints(this.attributes.points),
                        state: 'result',
                        currentQuestionId: null,
                        currentQuestionIndex: undefined
                    });
                    this.application.stat('Trivia', 'result', this.attributes.currentResult.title, this.attributes.points);
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
                this.set({
                    state: 'welcome',
                    points: 0,
                    currentResult: null,
                    currentQuestionId: null
                });
                break;
            }
            default: {
                this.application.hideRecommendations();
                this.set({
                    state: 'welcome',
                    points: 0,
                    currentResult: null,
                    currentQuestionId: null
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
        var quizArr = this.attributes.quiz.toArray();
        for (var i = 0; i < quizArr.length; i++) {
            if (id === quizArr[i].id) {
                return quizArr[i];
            }
        }
        return null;
    },

    /**
     * Найти результат в массиве app.results для указанного количества баллов.
     * @param {number} points - количество баллов, для которых найти результат
     */
    getResultByPoints: function(points) {
        // resulPointsAllocation - распределение баллов по результатам
        // 0: 'result1',
        // 1: 'result1',
        // 2: 'result2',
        // ...
        var resultId = this.attributes.resulPointsAllocation[points];
        if (resultId) {
            var result = this.getResultById(resultId);
            if (result) {
                return result;
            }
            else {
                throw new Error('TriviaModel.getResultByPoints: result \''+resultId+'\' does not exist');
            }
        }
        else {
            throw new Error('TriviaModel.getResultByPoints: no result id for points \''+points+'\'');
        }
        return null;
    },

    /**
     * Найти результат по ид
     * Нужно потому, что каждый экран отвечает за свой результат
     * @param {string} id - уник ид результата
     */
    getResultById: function(id) {
        var resultsArr = this.attributes.results.toArray();
        for (var i = 0; i < resultsArr.length; i++) {
            var r = resultsArr[i];
            if (r.id === id) {
                return r;
            }
        }
        return null;
    },

    /**
     * Ответить на текущий вопрос
     *
     * @param {string} id - идентификатор выбранного ответа
     * @returns {boolean}
     */
    answer: function(id) {
        var quizArr = this.attributes.quiz.toArray();
        var option = this.getOptionById(id);
        if (option) {
            var oInfo = this.getOptionPointsInfo(id);
            if (oInfo) {
                this.set({
                    currentOptionId: id
                });
                if (oInfo.points > 0) {
                    this.set({
                        'points': this.attributes.points + oInfo.points
                    });
                    return true;
                }
                return false;
            }
            throw Error('TriviaModel.answer: no info in optionPoints dictionary about option \''+id+'\'');
        }
        throw Error('TriviaModel.answer: option \''+id+'\' does not exist');
    },

    /**
     * Вернуть ид верного ответа
     * @param questionIndex - индекс вопроса
     * @return {string} ид верного ответа
     */
    getCorrectAnswerId: function(questionIndex) {
        var quizArr = this.attributes.quiz.toArray();
        if (quizArr[questionIndex].answer.options) {
            var optionsArr = quizArr[questionIndex].answer.options.toArray();
            for (var i = 0; i < optionsArr.length; i++) {
                var o = optionsArr[i];
                var oInfo = this.getOptionPointsInfo(o.id);
                if (oInfo) {
                    if (oInfo.points > 0) {
                        return o.id;
                    }
                }
                else {
                    throw Error('TriviaModel.getCorrectAnswerId: no info in optionPoints dictionary about option \''+o.id+'\'');
                }
            }
        }
        else {
            throw Error('TriviaModel.getCorrectAnswerId: no options in question \''+questionIndex+'\'');
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
     * Найти информацию в словаре optionPoints
     * @param {string} optionId
     */
    getOptionPointsInfo: function(optionId) {
        var optionPointsArr = this.attributes.optionPoints.toArray();
        for (var i = 0; i < optionPointsArr.length; i++) {
            if (optionPointsArr[i].optionId === optionId) {
                return optionPointsArr[i];
            }
        }
        return null;
    },

    /**
     * Обновить словарь, который хранит соответствие опций и баллов за выбор опции.
     * Обновление вызывается каждый раз при изменении опций (добавление/удаление)
     *
     * - Удалить несуществующие опции
     * - Добавить новые опции с нулевым значением
     */
    updateOptionPoints: function() {
        var optionPointsArr = this.attributes.optionPoints.toArray();
        var dictIdsToDelete = [];

        // найти и удалить несуществующие опции
        for (var i = 0; i < optionPointsArr.length; i++) {
            if (this.getOptionById(optionPointsArr[i].optionId) === null) {
                dictIdsToDelete.push(this.attributes.optionPoints.getIdFromPosition(i));
            }
        }
        for (var i = 0; i < dictIdsToDelete.length; i++) {
            this.attributes.optionPoints.deleteElementById(dictIdsToDelete[i]);
        }

        // добавить новые опции которых еще нет в optionPoints
        var quizValue = this.attributes.quiz.toArray();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options.toArray();
            for (var n = 0; n < options.length; n++) {
                if (this.getOptionPointsInfo(options[n].id) === null) {
                    this.attributes.optionPoints.addElement({
                        optionId: options[n].id,
                        points: 0 // по умолчанию ответ неверный. Ноль баллов
                    });
                }
            }
        }

        var endstop = 0;
    },

    /**
     * Апдейт соответствия набранных баллов и результатов
     * resulPointsAllocation
     *
     */
    updateResultPointsAllocation: function() {
        var maxPoints = 0;
        var optionPointsArr = this.attributes.optionPoints.toArray();
        var maxPoints = 0;
        for (var i = 0; i < optionPointsArr.length; i++) {
            // столько баллов можно набрать максимально, все вопросы приносят по 1
            maxPoints += optionPointsArr[i].points;
        }
        var resultsArr = this.attributes.results.toArray();
        var quizArr = this.attributes.quiz.toArray();
        this.attributes.resulPointsAllocation = {};
        var resGap = Math.floor(quizArr.length / resultsArr.length); // длина промежутка на шкале распределения, которая приходится на один результат
        if (resGap < 1) {
            resGap = 1;
        }
        var g = 1;
        var resIndex = resultsArr.length-1; // начинаем распределять с конца
        if (resIndex >= 0) {
            var currentResultId = resultsArr[resIndex].id;
            for (var i = maxPoints; i >= 0; i--) { // >= важно!
                this.attributes.resulPointsAllocation[i] = currentResultId;
                g++;
                if (g > resGap) {
                    g = 1;
                    if (resIndex) {
                        resIndex--;
                        currentResultId = resultsArr[resIndex].id;
                    }
                }
            }
        }
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
                    propertyString: 'id=tm results.'+dictionaryId+'.titleColor',
                    model: this,
                    application: this.application,
                    value: null
                });
            }
            if (!r.descriptionColor) {
                r.descriptionColor = new MutAppProperty({
                    propertyString: 'id=tm results.'+dictionaryId+'.descriptionColor',
                    model: this,
                    application: this.application,
                    value: null
                });
            }
        }
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
     * Объект-Прототип для добавления в массив
     * Возможно нужна функция
     *
     * Текстовый вопрос: текстовые ответы
     *
     */
    quizProto1: function() {

        var questionDictionaryId = MutApp.Util.getUniqId(6);

        var qText = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite music?'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.answer.options'
        });

        options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});

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
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite music?'
        });
        var qImage = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.questionImage',
            model: this,
            application: this.application,
            value: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/ocean.jpg'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.answer.options'
        });

        options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=tm proto_optionText', -1, {questionDictionaryId: questionDictionaryId});

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
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.text',
            model: this,
            application: this.application,
            value: 'Your favourite picture?'
        });
        var qBackgroundImage = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var qBackgroundColor = new MutAppProperty({
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.question.backgroundColor',
            model: this,
            application: this.application,
            value: '#ffffff'
        });

        var options = new MutAppPropertyDictionary({
            model: this,
            application: this.application,
            propertyString: 'id=tm quiz.'+questionDictionaryId+'.answer.options'
        });

        options.addElementByPrototype('id=tm proto_optionPhoto', -1, {questionDictionaryId: questionDictionaryId});
        options.addElementByPrototype('id=tm proto_optionPhoto', -1, {questionDictionaryId: questionDictionaryId});

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
            propertyString: 'id=tm results.'+resultDictionaryId+'.title',
            model: this,
            application: this.application,
            value: 'Result title'
        });
        var resultDescription = new MutAppProperty({
            propertyString: 'id=tm results.'+resultDictionaryId+'.description',
            model: this,
            application: this.application,
            value: 'Result description'
        });
        var backgroundImage = new MutAppProperty({
            propertyString: 'id=tm results.'+resultDictionaryId+'.backgroundImage',
            model: this,
            application: this.application,
            value: null
        });
        var backgroundColor = new MutAppProperty({
            propertyString: 'id=tm results.'+resultDictionaryId+'.backgroundColor',
            model: this,
            application: this.application,
            value: null
        });
        var titleColor = new MutAppProperty({
            propertyString: 'id=tm results.'+resultDictionaryId+'.titleColor',
            model: this,
            application: this.application,
            value: null
        });
        var descriptionColor = new MutAppProperty({
            propertyString: 'id=tm results.'+resultDictionaryId+'.descriptionColor',
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
            throw new Error('TriviaModel.proto_optionText: questionDictionaryId does not specified');
        }

        var optionId = MutApp.Util.getUniqId(6);

        var optionText = new MutAppProperty({
            propertyString: 'id=tm quiz.'+param.questionDictionaryId+'.answer.options.'+optionId+'.text',
            model: this,
            application: this.application,
            value: 'New option'
        });

        var option = {
            id: 'option_' + MutApp.Util.getUniqId(6),
            type: 'text',
            uiTemplate: 'id-option_text_template',
            text: optionText,
            prototypeName: 'id=tm proto_optionText'
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
            throw new Error('TriviaModel.proto_optionPhoto: questionDictionaryId does not specified');
        }

        var optionId = MutApp.Util.getUniqId(6);

        var optionImg = new MutAppProperty({
            propertyString: 'id=tm quiz.'+param.questionDictionaryId+'.answer.options.'+optionId+'.img',
            model: this,
            application: this.application,
            value: '//p.testix.me/images/products/common/i/image-sample1.jpg'
        });

        var option = {
            id: 'option_' + MutApp.Util.getUniqId(6),
            type: 'img',
            uiTemplate: 'id-option_img_template',
            img: optionImg,
            prototypeName: 'id=tm proto_optionPhoto'
        };
        return {
            id: optionId,
            element: option
        };
    },

    isOK: function(assert) {
        // проверить что в optionPoints есть все опции и нет старых
        var optionPointsArr = this.attributes.optionPoints.toArray();
        for (var i = 0; i < optionPointsArr.length; i++) {
            assert.ok(this.getOptionById(optionPointsArr[i].optionId), 'TriviaModel.isOK: option \''+optionPointsArr[i].optionId+'\' exist');
        }
        // еще раз проверить с другой стороны
        var quizValue = this.attributes.quiz.toArray();
        for (var i = 0; i < quizValue.length; i++) {
            var options = quizValue[i].answer.options.toArray();
            for (var n = 0; n < options.length; n++) {
                assert.ok(this.getOptionPointsInfo(options[n].id), 'TriviaModel.isOK: info in optionPoints about option \''+options[n].id+'\' exist');
            }
        }

        // проверить resultAllocation
        var maxPoints = 0;
        var optionPointsArr = this.attributes.optionPoints.toArray();
        var maxPoints = 0;
        for (var i = 0; i < optionPointsArr.length; i++) {
            // столько баллов можно набрать максимально, все вопросы приносят по 1
            maxPoints += optionPointsArr[i].points;
        }
        assert.ok(this.attributes.resulPointsAllocation[maxPoints], 'TriviaModel.isOK: Result for max points');

        var resultsArr = this.attributes.results.toArray();
        var quizArr = this.attributes.quiz.toArray();
        // если вопросов больше или равно результатов, то хотя бы по одному баллу должно быть на каждый результат
        if (quizArr.length >= resultsArr.length) {
            var resInAlloc = [];
            for (var i = maxPoints; i >= 0; i--) {
                var resId = this.attributes.resulPointsAllocation[i];
                if (resInAlloc.indexOf(resId) < 0) {
                    resInAlloc.push(resId);
                }
            }
            assert.ok(resInAlloc.length === resultsArr.length, 'TriviaModel.isOK: Every result exist in resulPointsAllocation');
        }
        else {
            // todo ?
        }

        // проверить что стейт валидный и атрибуты соответствуют стейту
        switch (this.attributes.state) {
            case 'welcome': {
                assert.ok(this.attributes.points === 0);
                assert.ok(this.attributes.currentResult === null);
                assert.ok(this.attributes.currentQuestionId === null);
                break;
            }
            case 'question': {
                assert.ok(this.attributes.points >= 0);
                assert.ok(this.attributes.currentResult === null);
                var ni = this.attributes.currentQuestionIndex;
                assert.ok(this.attributes.currentQuestionId === this.attributes.quiz.toArray()[ni].id);
                break;
            }
            case 'result': {
                assert.ok(this.attributes.points >= 0);
                assert.ok(this.attributes.currentResult === this.getResultByPoints(this.attributes.points));
                assert.ok(this.attributes.currentQuestionId === null);
                break;
            }
            default: {
                assert.ok(false, 'TriviaModel.isOK: invalid state');
            }
        }
    }

});