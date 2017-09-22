/**
 * Created by artyom.grishanov on 05.07.16.
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
    arrayAppPropertyString: 'id=pm quiz',
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
     * Id вопроса, за показ которого отвечает этот экран
     */
    questionId: null,
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
        "id-option_img_template": _.template($('#id-option_img_template').html())
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
            var ll = this.model.get('logoLink');
            if (ll) {
                var win = window.open(ll, '_blank');
                win.focus();
                this.model.application.stat('Test', 'logoclick');
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
        var q = this.model.getQuestionById(this.questionId);
        this.currentQuestionIndex = this.model.get('quiz').getValue().indexOf(q);

        this.model.bind("change:currentQuestionId", function () {
            if ('question' === this.model.get('state') &&
                this.questionId === this.model.get('currentQuestionId')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);

        this.model.bind("change:logoPositionInQuestions", function () {
            // спорно, можно рендерить а можно и нет. Есть плюсы и минусы у обоих подходов
            //this.render();
        }, this);

        this.model.bind("change:showLogoInQuestions", function () {
            this.render();
        }, this);

        this.model.bind("change:shadowEnableInQuestions", function () {
            this.render();
        }, this);

        this.model.bind("change:shadowEnableInQuestions", function () {
            this.render();
        }, this);

        // Подписка с помощью backbone не получится
        // возможно подписаться только вот так на само MutAppPropertyArray свойство
        q.answer.options.bind('change', function() {
            var q = this.model.getQuestionById(this.questionId);
            console.log('Options changed for question: ' + q.id);
            this.renderAnswers(q.answer);
        }, this);
    },

    render: function() {
        var q = this.model.getQuestionById(this.questionId);
        this.$el.html(this.template['default'](q));

        q.question.currentQuestionIndex = this.currentQuestionIndex;
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
        if (this.model.get('showQuestionProgress') === true) {
            $qp.show()
               .text('Вопрос '+(this.currentQuestionIndex+1)+'/'+this.model.get('quiz').getValue().length);
            $qp.css('top',this.model.get('questionProgressPosition').top+'px')
               .css('left',this.model.get('questionProgressPosition').left+'px');
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
        this.$el.find('.js-question_back_color').css('backgroundColor','url(' + q.backgroundColor + ')');

        // фоновая картинка
        if (this.model.get('showBackgroundImage')===true) {
            if (q.backgroundImage) {
                this.$el.find('.js-back_img').css('backgroundImage','url('+q.backgroundImage+')');
            }
            else {
                this.$el.find('.js-back_img').css('backgroundImage','none');
            }
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
        }

        // затемнение фона, чтобы сделать стильно
        if (this.model.get('shadowEnableInQuestions').getValue() === true) {
            this.$el.find('.js-back_shadow').css('background-color','rgba(0,0,0,0.4)');
        }
        else {
            this.$el.find('.js-back_shadow').css('background-color','');
        }

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
                for (var i = 0; i < answerData.options.getValue().length; i++) {
                    var o = MutApp.Util.getObjectForRender(answerData.options.getValue()[i]);
                    if (o.uiTemplate) {
                        o.currentQuestionIndex = this.currentQuestionIndex;
                        o.currentOptionIndex = i;
                        var $e = $(this.template[o.uiTemplate](o));
                        $e.click((function(e) {
                            if (this.model.application.mode !== 'edit') {
                                var oId = $(e.currentTarget).attr('data-id');
                                this.model.answer(oId);
                                this.model.next();
                            }
                        }).bind(this));
                        $ea.append($e); // ea is js-options_cnt
                    }
                    else {
                        throw new Error('Option does not have uiTemplate attribute');
                    }
                }

                if (this.model.get('showBullits') === true) {
                    this.$el.find('.bullit').show();
                }
                else {
                    this.$el.find('.bullit').hide();
                }

                break;
            }
            case 'input': {
                //TODO
            }
        }
    }
});