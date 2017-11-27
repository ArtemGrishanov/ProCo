/**
 * Created by artyom.grishanov on 09.07.16.
 */
/**
 * Экран вопроса теста
 * @type {*|void|Object|extend|extend|extend}
 */
var QuestionScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'questionScr',
    type: 'questions',
    /**
     * Для контрола SlideGroupControl, который управляет порядком группы экранов
     *
     * Это свойство надо понимать так:
     * Порядок этой вот группы экранов questions зависит от этого массива 'id=tm quiz'
     */
    arrayAppPropertyString: 'id=tm quiz',
    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'questions',
    draggable: true,
    canAdd: true,
    canDelete: true,
    canClone: true,
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {RU:'Вопрос',EN:'Questions'},
    /**
     * индекс вопроса за который отвечает этот экран
     */
    currentQuestionIndex: undefined,
    /**
     * Уникальный id этого вопроса в dictionary quiz
     */
    dictionaryId: undefined,
    /**
     * Id вопроса, за показ которого отвечает этот экран
     */
    questionId: null,
    /**
     * Ид таймера для отложенного рендера
     */
    delayedRenderTimerId: null,
    /**
     * Задержка для показа explanation
     */
    explanationPauseDelay: 1100,
    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: null,

    template: {
        "default": _.template($('#id-slide_template').html()),
        "id-question_text_template": _.template($('#id-question_text_template').html()),
        "id-question_text_photo_template": _.template($('#id-question_text_photo_template').html()),

        "id-answer_question_lst": _.template($('#id-answer_question_lst').html()),
        "id-answer_question_lst_2": _.template($('#id-answer_question_lst_2').html()),
        "id-answer_question_grid_2": _.template($('#id-answer_question_grid_2').html()),
        "id-answer_question_grid_3": _.template($('#id-answer_question_grid_3').html()),

        "id-option_text_template": _.template($('#id-option_text_template').html()),
        "id-option_img_template": _.template($('#id-option_img_template').html()),
//        "id-answer_input_btn_template": _.template($('#id-answer_input_btn_template').html()),

        "id-explanation_text_template": _.template($('#id-explanation_text_template').html())
    },

    events: {
        "click .js-next": "onNextClick",
        "click .js-logo": "onLogoClick"
    },

    onNextClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            this.model.next();
        }
    },

    onLogoClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            var ll = this.model.get('logoLink').getValue();
            if (ll) {
                var win = window.open(ll, '_blank');
                win.focus();
                this.model.application.stat('Trivia', 'logoclick');
            }
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);
        this.questionId = param.questionId;
        // определяем индекс вопроса, за который отвечает этот экран
        this.quizElement = this.model.getQuestionById(this.questionId);
        // порядковый индекс вопрса в dictionary quiz
        this.currentQuestionIndex = this.model.get('quiz').toArray().indexOf(this.quizElement);
        if (this.currentQuestionIndex < 0) {
            throw new Error('QuestionsScreen.initialize: can not find this question in quiz dictionary');
        }
        // уникальный id этого вопросв в dictionary quiz
        this.dictionaryId = this.model.get('quiz').getIdFromPosition(this.currentQuestionIndex);
        if (typeof this.dictionaryId !== 'string') {
            throw new Error('QuestionsScreen.initialize: can not find dictionary id for this question');
        }

        this.model.bind("change:currentQuestionId", this.onCurrentQuestionIdChanged, this);
        // спорно, можно рендерить а можно и нет. Есть плюсы и минусы у обоих подходов
        // this.model.bind("change:logoPositionInQuestions", onMutAppPropertyChanged, this);
        // this.model.bind("change:questionProgressPosition", onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoInQuestions", this.onMutAppPropertyChanged, this);
        this.model.bind("change:shadowEnableInQuestions", this.onMutAppPropertyChanged, this);
        this.model.bind("change:shadowEnableInQuestions", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showQuestionProgress", this.onMutAppPropertyChanged, this);
        this.model.bind("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.bind("change:logoPositionInQuestions", this.onMutAppPropertyChangedDelayed, this);
        this.model.bind("change:questionProgressPosition", this.onMutAppPropertyChangedDelayed, this);
        this.quizElement.question.backgroundImage.bind('change', this.onMutAppPropertyChanged, this);
        this.quizElement.question.backgroundColor.bind('change', this.onMutAppPropertyChanged, this);
        if (this.quizElement.question.questionImage) {
            this.quizElement.question.questionImage.bind('change', this.onMutAppPropertyChanged, this);
        }
        this.quizElement.answer.options.bind('change', this.onOptionsChanged, this); // нужно делать полный рендер, потому что в конце renderCompleted()

        // обновление галочек верных ответов
        this.model.bind("change:optionPoints", this.updateCorrectOptionsLabels, this);

        // на изменение опций картинок надо подписаться
        var optionsArr = this.quizElement.answer.options.toArray();
        for (var i = 0; i < optionsArr.length; i++) {
            if (optionsArr[i].img) {
                optionsArr[i].img.bind('change', this.onMutAppPropertyChanged, this);
            }
            if (optionsArr[i].feedbackText) {
                optionsArr[i].feedbackText.bind('change', this.updateFeedbackLabels, this);
            }
        }
    },

    onCurrentQuestionIdChanged: function() {
        if ('question' === this.model.get('state') &&
            this.questionId === this.model.get('currentQuestionId')) {
            this.render();
            this.model.application.showScreen(this);
        }
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    /**
     * Запланировать рендер через какое то время
     * Применяется когда как например при перетаскивании свойтво изменяется слишком часто
     * И нужно сделать рендер только в конце перемещения
     */
    onMutAppPropertyChangedDelayed: function() {
        if (this.delayedRenderTimerId) {
            clearTimeout(this.delayedRenderTimerId);
            this.delayedRenderTimerId = null;
        }
        this.delayedRenderTimerId = setTimeout((function() {
            this.render();
        }).bind(this), 999);
    },

    onOptionsChanged: function() {
        // в новых (возможно добавленных) опциях подписаться на свойства
        var optionsArr = this.quizElement.answer.options.toArray();
        for (var i = 0; i < optionsArr.length; i++) {
            if (optionsArr[i].img) {
                optionsArr[i].img.bind('change', this.onMutAppPropertyChanged, this);
            }
            if (optionsArr[i].feedbackText) {
                optionsArr[i].feedbackText.bind('change', this.updateFeedbackLabels, this);
            }
        }
        // нужно делать полный рендер, потому что в конце renderCompleted()
        this.onMutAppPropertyChanged();
    },

    render: function() {
        var q = this.model.getQuestionById(this.questionId);
        this.$el.html(this.template['default'](q));

        q.question.currentQuestionIndex = this.dictionaryId;
        this.renderQuestion(MutApp.Util.getObjectForRender(q.question));

        this.renderAnswers(q.answer);

        // поработать над верхним колонтитулом
        if (this.showTopColontitle === true) {
            var $c = this.$el.find('.js-topColontitleText').show();
            if (this.topColontitleText) {
                $c.text(this.topColontitleText);
            }
        }
        else {
            this.$el.find('.js-topColontitleText').hide();
        }

        // счетчик текущего номера вопроса
        var $qp = this.$el.find('.js-question_progress');
        if (this.model.get('showQuestionProgress').getValue() === true) {
            $qp.show()
                .text('Вопрос '+(this.currentQuestionIndex+1)+'/'+this.model.get('quiz').toArray().length);
            $qp.css('top',this.model.get('questionProgressPosition').getValue().top+'px')
                .css('left',this.model.get('questionProgressPosition').getValue().left+'px');
        }
        else {
            $qp.hide();
        }

        // установка свойств логотипа на экране вопросов
        var $l = this.$el.find('.js-question_logo');
        if (this.model.get('showLogoInQuestions').getValue() === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top',this.model.get('logoPositionInQuestions').getValue().top+'px')
                .css('left',this.model.get('logoPositionInQuestions').getValue().left+'px');
        }
        else {
            $l.hide();
        }

        // цвет фона
        this.$el.find('.js-question_back_color')
            .css('background-color', q.question.backgroundColor.getValue());

        // фоновая картинка
        if (q.question.backgroundImage.getValue()) {
            this.$el.find('.js-question_back_img')
                .css('backgroundImage','url('+q.question.backgroundImage.getValue()+')');
        }
        else {
            this.$el.find('.js-question_back_img')
                .css('backgroundImage','none');
        }

        // затемнение фона, чтобы сделать стильно
        if (this.model.get('shadowEnableInQuestions').getValue() === true) {
            this.$el.find('.js-back_shadow').css('background-color','rgba(0,0,0,0.4)');
        }
        else {
            this.$el.find('.js-back_shadow').css('background-color','');
        }

        // установка атрибута для фильтрации
        this.$el.attr('data-filter', q.question.backgroundImage.propertyString+','+q.question.backgroundColor.propertyString);

        this.updateCorrectOptionsLabels();
        this.updateFeedbackLabels();

        this.renderCompleted();
        return this;
    },

    renderQuestion: function(questionData) {
        this.$el.find('.js-question_cnt').html(this.template[questionData.uiTemplate](questionData));
    },

    renderAnswers: function(answerData) {
        switch(answerData.type) {
            case 'radiobutton': {
                //сначала нужно отрендерить контейнер опций ответа
                //в нем могут быть заложены разные опции расположения элементов, поэтому реализоан в виде отдельного шаблона
                var $ea = $(this.template[answerData.uiTemplate](answerData));
                this.$el.find('.js-answer_cnt').empty().append($ea);
                var optionsArr = answerData.options.toArray();
                for (var i = 0; i < optionsArr.length; i++) {

                    var o = MutApp.Util.getObjectForRender(optionsArr[i]);
                    if (o.uiTemplate) {
                        o.currentQuestionIndex = this.dictionaryId;
                        o.currentOptionIndex = answerData.options.getIdFromPosition(i);
                        if (typeof o.currentOptionIndex !== 'string') {
                            throw new Error('QuestionsScreen.renderAnswers: can not find current option in dictionary');
                        }
                        var $e = $(this.template[o.uiTemplate](o));
                        $e.click((function(e) {
                            if (this.model.application.mode !== 'edit') {
                                var oId = $(e.currentTarget).attr('data-id');
                                var success = this.model.answer(oId);
                                var option = this.model.getOptionById(oId);
                                var feedbackText = option.feedbackText.getValue();

                                if (feedbackText) {
                                    this.renderFeedback(
                                        success,
                                        feedbackText
                                    );
                                }
                                else {
                                    // текст не задан: показ обычных галочек верно/неверно
                                    if (this.model.get('showExplanation').getValue() === true) {
                                        this.renderExplanation(
                                            success
                                        );
                                        // автоматически скрываем explanation блок через пару секунд
                                        setTimeout((function(){
                                            this.model.next();
                                        }).bind(this), this.explanationPauseDelay);
                                    }
                                    else {
                                        // не показывать объяснение верного-неверного ответа, сразу к следующему вопросу
                                        this.model.next();
                                    }
                                }

                            }
                        }).bind(this));
                        $ea.append($e); // ea is js-options_cnt
                    }
                    else {
                        throw new Error('Option does not have uiTemplate attribute');
                    }
                }

                if (optionsArr.length > 3) {
                    // когда опций много начинаем компоновать их в табличку в 2 колонки
                    // модификатор на элемент js-options_cnt вешается
                    $ea.addClass('__2');
                }

                break;
            }
            case 'input': {
                //TODO
//                var $e = $(this.template[answerData.uiTemplate](answerData));
//                $e.find('js-make_answer').click((function(e) {
//                    //TODO showExplanation через модель если это будет сабвью
//                    this.renderExplanation();
//                }).bind(this));
//                this.$el.find('.js-answers_cnt').append($e);
//                break;
            }
        }
    },

    /**
     * Показать верен ли был ответ или нет
     * Также появляется кнопка Далее, чтобы перейти к следующему вопросу
     *
     * @param {boolean} success - верно ли ответил пользователь
     */
    renderExplanation: function(success) {
        this.$el.find('.js-explain').show();
        this.$el.find('.js-explain_block').show();
        // обработчик на js-next уже установлен через backbone events
        if (success === true) {
            this.$el.find('.explain_blk').removeClass('__err');
        }
        else {
            this.$el.find('.explain_blk').addClass('__err');
        }
    },

    /**
     * Отрендерить леер с текстом-комментарием к выбранной опции
     *
     * @param {boolean} success
     * @param {strinf} feedbackText
     */
    renderFeedback: function(success, feedbackText) {
        // обработчик на js-next уже установлен через backbone events
        this.$el.find('.js-explain').show();
        this.$el.find('.js-feedback').show();
        this.$el.find('.js-feedback_text').html(feedbackText);
        if (success === true) {
            this.$el.find('.js-feedback_icon').removeClass('__wrong');
        }
        else {
            this.$el.find('.js-feedback_icon').addClass('__wrong');
        }
    },

    /**
     * Поставить галочки напротив верных ответов.
     *
     * Это сделано отдельным методом, а не в рендере специально
     *
     * 1) Пользователь редактирует правильность ответов, экран не должен рендерится, а контрол пропадать ил рефрешиться
     *
     * Можно вызвать вручную где-то изменение: app.model.trigger('change:optionPoints', app.model);
     */
    updateCorrectOptionsLabels: function() {
        if (this.model.application.mode === 'edit') {
            var q = this.model.getQuestionById(this.questionId);
            var optionsArr = q.answer.options.toArray();
            for (var i = 0; i < optionsArr.length; i++) {
                var o = optionsArr[i];
                var $e = $('[data-id="'+o.id+'"]');
                // в режиме редактирования показывать если ответ является верным (голубую галочку в углу показывать)
                var oInfo = this.model.getOptionPointsInfo(o.id);
                if (oInfo && oInfo.points > 0) {
                    $e.find('.js-icon_correct').show();
                }
                else {
                    $e.find('.js-icon_correct').hide();
                }
                if (o.feedbackText.getValue()) {
                    $e.find('.js-icon_feedback').show();
                }
                else {
                    $e.find('.js-icon_feedback').hide();
                }
            }
        }
    },

    /**
     * Обновить показать или скрыть иконки опций у которых есть комментарий фидбека
     */
    updateFeedbackLabels: function() {
        if (this.model.application.mode === 'edit') {
            var q = this.model.getQuestionById(this.questionId);
            var optionsArr = q.answer.options.toArray();
            for (var i = 0; i < optionsArr.length; i++) {
                var o = optionsArr[i];
                var $e = $('[data-id="'+o.id+'"]');
                if (o.feedbackText.getValue()) {
                    $e.find('.js-icon_feedback').show();
                }
                else {
                    $e.find('.js-icon_feedback').hide();
                }
            }
        }
    },

    /**
     * Функция будет вызвана перед удалением экрана
     * Надо позаботиться об удалении всех обработчиков
     *
     */
    destroy: function() {
        this.model.off("change:currentQuestionId", this.onCurrentQuestionIdChanged, this);
        // спорно, можно рендерить а можно и нет. Есть плюсы и минусы у обоих подходов
        // this.model.off("change:logoPositionInQuestions", onMutAppPropertyChanged, this);
        // this.model.off("change:questionProgressPosition", onMutAppPropertyChanged, this);
        this.model.off("change:showLogoInQuestions", this.onMutAppPropertyChanged, this);
        this.model.off("change:shadowEnableInQuestions", this.onMutAppPropertyChanged, this);
        this.model.off("change:shadowEnableInQuestions", this.onMutAppPropertyChanged, this);
        this.model.off("change:showQuestionProgress", this.onMutAppPropertyChanged, this);
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.off("change:logoPositionInQuestions", this.onMutAppPropertyChangedDelayed, this);
        this.model.off("change:questionProgressPosition", this.onMutAppPropertyChangedDelayed, this);
        this.quizElement.question.backgroundImage.unbind('change', this.onMutAppPropertyChanged, this);
        this.quizElement.question.backgroundColor.unbind('change', this.onMutAppPropertyChanged, this);
        if (this.quizElement.question.questionImage) {
            this.quizElement.question.questionImage.unbind('change', this.onMutAppPropertyChanged, this);
        }
        this.quizElement.answer.options.unbind('change', this.onOptionsChanged, this);

        this.model.off("change:optionPoints", this.updateCorrectOptionsLabels, this);

        // на изменение опций картинок надо подписаться
        var optionsArr = this.quizElement.answer.options.toArray();
        for (var i = 0; i < optionsArr.length; i++) {
            if (optionsArr[i].img) {
                optionsArr[i].img.unbind('change', this.onMutAppPropertyChanged, this);
            }
            if (optionsArr[i].feedbackText) {
                optionsArr[i].feedbackText.unbind('change', this.updateFeedbackLabels, this);
            }
        }
    }
});