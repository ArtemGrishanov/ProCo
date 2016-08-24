/**
 * Created by artyom.grishanov on 09.07.16.
 */
var StartScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'startScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'start',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Стартовый экран',

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
    logoPosition: {top: 200, left: 200},
    logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',
    showLogo: false,
    startHeaderText: 'Тест',
    startDescription: 'Проверь свои знания',
    startButtonText: 'Начать',
    backgroundImg: null,


    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,//$('#id-start_scr_cnt').hide(),

    template: {
        "default": _.template($('#id-welcome_template').html())
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
            if ('welcome' === this.model.get('state')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    render: function() {
        this.$el.html(this.template['default']());
        this.$el.find('.js-logo').
            css('backgroundImage','url('+this.logoUrl+')');
        this.$el.find('.js-start_logo').
            css('top',this.logoPosition.top+'px').
            css('left',this.logoPosition.left+'px');

        if (this.backgroundImg) {
            this.$el.find('.js-back_img').css('backgroundImage','url('+this.backgroundImg+')');
        }

        this.$el.find('.js-start_btn').text(this.startButtonText);
        this.$el.find('.js-start_header').text(this.startHeaderText);
        this.$el.find('.js-start_description').text(this.startDescription);

        if (this.showLogo === true) {
            this.$el.find('.js-start_logo').show();
        }
        else {
            this.$el.find('.js-start_logo').hide();
        }
        return this;
    }
});