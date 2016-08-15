/**
 * Created by artyom.grishanov on 09.07.16.
 */
var ResultScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'resultScr',

    type: 'result',
    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'result',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Результат',

    /**
     * @see MutApp
     */
    doWhenInDOM: function() {
        applyStyles();
    },

    /**
     * Это appProperty
     * Сам logo не является отдельным вью, так как не имеет своей логики
     */
    showLogo: true,
    logoPosition: {top: 100, left: 20},
    logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',
    restartButtonText: 'Заново',

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: $('#id-result_scr_cnt').hide(),

    template: {
        "default": _.template($('#id-result_template').html())
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
        this.model.bind("change:state", function () {
            if ('result' === this.model.get('state')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    render: function() {
        //renderResult(currentResult);
        this.$el.html(this.template['default'](this.model.get('currentResult')));
        $('.js-logo').
            css('backgroundImage','url('+this.logoUrl+')');
        $('.js-result_logo').
            css('top',this.logoPosition.top+'px').
            css('left',this.logoPosition.left+'px');
        this.$el.find('.js-restart').text(this.restartButtonText);
        if (this.showLogo === true) {
            this.$el.find('.js-result_logo').show();
        }
        else {
            this.$el.find('.js-result_logo').hide();
        }
        return this;
    }
});