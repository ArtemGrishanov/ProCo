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

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'questions',

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

    /**
     * Это appProperty
     * Сам logo не является отдельным вью, так как не имеет своей логики
     */
    logoPosition: {top: 0, left: 0},

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: $('#id-questions_cnt').hide(),

    template: {
        "id-slide_text_template": _.template($('#id-slide_text_template').html()),
        "id-slide_photo_template": _.template($('#id-slide_photo_template').html())
    },

    events: {
        "click .js-next": "onNextClick"
    },

    onNextClick: function(e) {
        this.model.next();
    },

    initialize: function (param) {
        this.questionId = param.questionId;
//        this.model.bind("change:state", function () {
//            if ('question' === this.model.get('state')) {
//                this.render();
//                app.showScreen(this);
//            }
//        }, this);

        this.model.bind("change:currentQuestionId", function () {
            if ('question' === this.model.get('state') &&
                this.questionId === this.model.get('currentQuestionId')) {
                this.render();
                app.showScreen(this);
            }
        }, this);

    },

    render: function() {
        var q = this.model.getQuestionById(this.questionId);
        this.$el.html(this.template[q.uiTemplate](q));
        this.renderAnswers();
        return this;
    },

    renderAnswers: function() {
        var q = this.model.getQuestionById(this.questionId);
        for (var i = 0; i < q.options.length; i++) {
            var o = q.options[i];
            var templStr = $('#id-answer_template').html();
            //TODO важно, костыль: пока нет возможности сделать это в движке, сформировать атрибуты при parseView
            // потому что это надо заменять при рендере ответа
            var re = new RegExp('{{currentOption}}','g');
            templStr = templStr.replace(re, i);

            templStr = templStr.replace('{{answer_options_text}}', o.text);
            var $e = $(templStr);
            $e.attr('data-id', o.id);
            // для буллита тоже добавим, так как с его помощью будет переключаться верный ответ
            $e.find('.bullit').attr('data-id', o.id);
            $e.click((function(e) {
                var oId = $(e.currentTarget).attr('data-id');
                var success = this.model.answer(oId);
                this.showExplanation(success);
            }).bind(this));
            this.$el.find('.js-answers_cnt').append($e);
        }
    },

    /**
     * Показать верен ли был ответ или нет
     * Также появляется кнопка Далее, чтобы перейти к следующему вопросу
     *
     * @param success - верно ли ответил пользователь
     */
    showExplanation: function(success) {
        var $ex = this.$el.find('.js-explain');
        // add __err modifier if wrong
        if ($ex) {
            if (success !== true) {
                $ex.addClass('__err');
            }
            $ex.show();
            var $explText = this.$el.find('.js-explanation_text');
            var cqi = this.model.get('currentQuestionIndex');
            var option = this.model.getOptionById(
                this.model.get('currentOptionId'),
                cqi
            );
            if (option.explanation) {
                // показать объяснение если есть в варианте ответа
                $explText.text(option.explanation);
            }
            else if (this.model.attributes.quiz[cqi].explanation) {
                // показать объяснение если есть в вопросе
                $explText.text(this.model.attributes.quiz[cqi].explanation);
            }
        }
    }
});