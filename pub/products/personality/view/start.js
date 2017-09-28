/**
 * Created by artyom.grishanov on 04.07.17.
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
    name: {EN:'Start screen',RU:'Стартовый экран'},
    /**
     *
     */
    logoPosition: null,
    /**
     *
     */
    startHeaderText: null,
    startDescription: null,
    startButtonText: null,
    shadowEnable: false,

    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,

    template: {
        "default": _.template($('#id-welcome_template').html())
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
                this.model.application.stat('Personality', 'logoclick');
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
        this.startHeaderText = new MutAppProperty({
            application: this.model.application,
            value: 'Test',
            propertyString: 'id=startScr startHeaderText'
        });
        this.startDescription = new MutAppProperty({
            application: this.model.application,
            value: 'Check your knowledge',
            propertyString: 'id=startScr startDescription'
        });
        this.startButtonText = new MutAppProperty({
            application: this.model.application,
            value: 'Start',
            propertyString: 'id=startScr startButtonText'
        });
        this.shadowEnable = new MutAppProperty({
            application: this.model.application,
            value: false,
            propertyString: 'id=startScr shadowEnable'
        });
        this.logoPosition = new MutAppPropertyPosition({
            application: this.model.application,
            value: {top: 200, left: 200},
            propertyString: 'id=startScr logoPosition'
        });
        this.model.bind("change:state", function () {
            if ('welcome' === this.model.get('state')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
        this.model.bind("change:backgroundImg", function () {
            this.render();
        }, this);
        this.model.bind("change:showLogoOnStartScreen", function () {
            this.render();
        }, this);
        this.model.bind("change:startScreenBackgroundImg", function() {
            this.render();
        }, this);
        this.shadowEnable.bind('change', function() {
            this.render();
        }, this);
    },

    render: function() {
        this.$el.html(this.template['default']());

        // установка свойств логотипа
        var $l = this.$el.find('.js-start_logo');
        if (this.model.get('showLogoOnStartScreen').getValue() === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top',this.logoPosition.getValue().top+'px').css('left',this.logoPosition.getValue().left+'px');
        }
        else {
            $l.hide();
        }

        if (this.model.get('startScreenBackgroundImg').getValue()) {
            this.$el.find('.js-start_back_img').css('backgroundImage','url('+this.model.get('startScreenBackgroundImg').getValue()+')');
        }
        else {
            this.$el.find('.js-start_back_img').css('backgroundImage','none');
        }

        var sbt = this.startButtonText.getValue();
        var sht = this.startHeaderText.getValue();
        var sd = this.startDescription.getValue();
        if (this.model.application.isSmallWidth() === true) {
            sbt = sbt.replace(/<br>/g,' ');
            sht = sht.replace(/<br>/g,' ');
            sd = sd.replace(/<br>/g,' ');
        }
        this.$el.find('.js-start_btn').html(sbt);
        this.$el.find('.js-start_header').html(sht);
        this.$el.find('.js-start_description').html(sd);

        if (this.shadowEnable.getValue() === true) {
            this.$el.find('.js-back_shadow').css('background-color','rgba(0,0,0,0.4)');
        }
        else {
            this.$el.find('.js-back_shadow').css('background-color','');
        }

        this.renderCompleted();
        return this;
    }
});