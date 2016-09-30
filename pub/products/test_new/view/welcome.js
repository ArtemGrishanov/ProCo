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

    logoPosition: {top: 200, left: 200},
    showLogo: true,
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
        "click .js-next": "onNextClick",
        "click .js-logo": "onLogoClick"
    },

    onNextClick: function(e) {
        this.model.next();
    },

    onLogoClick: function(e) {
        var ll = this.model.get('logoLink');
        if (ll) {
            var win = window.open(ll, '_blank');
            win.focus();
            this.model.application.stat('Test', 'logoclick');
        }
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

        // установка свойств логотипа
        var $l = this.$el.find('.js-start_logo');
        if (this.showLogo === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl')+')');
            $l.css('top',this.logoPosition.top+'px').css('left',this.logoPosition.left+'px');
        }
        else {
            $l.hide();
        }

        if (this.model.get('showBackgroundImage')===true) {
            if (this.backgroundImg) {
                this.$el.find('.js-back_img').css('backgroundImage','url('+this.backgroundImg+')');
            }
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
        }

        this.$el.find('.js-start_btn').html(this.startButtonText);
        this.$el.find('.js-start_header').html(this.startHeaderText);
        this.$el.find('.js-start_description').html(this.startDescription);

        return this;
    }
});