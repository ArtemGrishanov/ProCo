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
    name: 'Вопрос',

    /**
     * @see MutApp
     */
    doWhenInDOM: function() {
        applyStyles();
    },

    /**
     * Id вопроса, за показ которого отвечает этот экран
     */
    questionId: null,

    showBullits: true,
    showTopColontitle: true,
    showQuestionProgress: true,
    questionProgressPosition: {top:30, left:30},
    topColontitleText: 'Текст колонтитула',
    backgroundImg: null,

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: null,

    template: {
        "default": _.template($('#id-slide_template').html()),
        //TODO это сабвью по сути, возможно выделить в отдельные вью?
        //TODO возможно эти шаблоны надо создать автоматически на основании quiz и прототипов в модели?
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
        "click .js-next": "onNextClick"
    },

    onNextClick: function(e) {
        this.model.next();
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('height','100%'));
        param.screenRoot.append(this.$el);
        this.questionId = param.questionId;
        this.model.bind("change:currentQuestionId", function () {
            if ('question' === this.model.get('state') &&
                this.questionId === this.model.get('currentQuestionId')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    render: function() {
        var q = this.model.getQuestionById(this.questionId);
        this.$el.html(this.template['default'](q));

        q.question.currentQuestionIndex = this.model.get('quiz').indexOf(q);
        this.renderQuestion(q.question);

        this.renderAnswers(q.answer);

        if (this.showBullits === true) {
            this.$el.find('.bullit').show();
        }
        else {
            this.$el.find('.bullit').hide();
        }
        if (this.showTopColontitle === true) {
            var $c = this.$el.find('.js-topColontitleText').show();
            if (this.topColontitleText) {
                $c.text(this.topColontitleText);
            }
        }
        else {
            this.$el.find('.js-topColontitleText').hide();
        }
        if (this.showQuestionProgress === true) {
            this.$el.find('.js-question_progress').show();
        }
        else {
            this.$el.find('.js-question_progress').hide();
        }
        this.$el.find('.js-question_progress').
            css('top',this.questionProgressPosition.top+'px').
            css('left',this.questionProgressPosition.left+'px');

        if (this.backgroundImg) {
            this.$el.find('.js-back_img').css('backgroundImage','url('+this.backgroundImg+')');
        }

        return this;
    },

    renderQuestion: function(questionData) {
        var q = this.model.getQuestionById(this.questionId);
        this.$el.find('.js-question_cnt').html(this.template[questionData.uiTemplate](questionData));
    },

    renderAnswers: function(answerData) {
        switch(answerData.type) {
            case 'radiobutton': {
                //сначала нужно отрендерить контейнер опций ответа
                //в нем могут быть заложены разные опции расположения элементов, поэтому реализоан в виде отдельного шаблона
                var $ea = $(this.template[answerData.uiTemplate](answerData));
                this.$el.find('.js-answer_cnt').append($ea);
                for (var i = 0; i < answerData.options.length; i++) {
                    var o = answerData.options[i];
                    if (o.uiTemplate) {
                        o.currentOption = i;
                        var $e = $(this.template[o.uiTemplate](o));
                        $e.click((function(e) {
                            var oId = $(e.currentTarget).attr('data-id');
                            var success = this.model.answer(oId);
                            //TODO showExplanation через модель
                            this.renderExplanation(
                                success,
                                this.model.get('quiz')[this.model.get('currentQuestionIndex')].explanation
                            );
                        }).bind(this));
                        $ea.append($e); // ea is js-options_cnt
                    }
                    else {
                        throw new Error('Option does not have uiTemplate attribute');
                    }
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
     * @param success - верно ли ответил пользователь
     * @param {object} explanationData
     */
    renderExplanation: function(success, explanationData) {
        //TODO можно это вынести в отдельный сабвью, если хоти его тдельно редактировать и показывать.

        // сейчас показывается блок js-explain с модификатором верно/неверно и кнопкой дальше.
        // текст пояснения не показывается, так как пока не понятно как его редактировать в редакторе

        // var $e = $(this.template[explanationData.uiTemplate](explanationData));
        // this.$el.find('.js-explain').append($e).show();

        this.$el.find('.js-explain').show();
        // обработчик на js-next уже установлен через backbone events
        if (success === true) {
            this.$el.find('.js-explanation_text').text('Верно');
            this.$el.find('.explain_blk').removeClass('__err');
        }
        else {
            this.$el.find('.js-explanation_text').text('Неверно');
            this.$el.find('.explain_blk').addClass('__err');
        }
    }
});