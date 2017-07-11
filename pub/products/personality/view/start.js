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

    logoPosition: {top: 200, left: 200},
    showLogo: true,
    /**
     *
     */
    startHeaderText: new MutAppProperty({
        value: 'Test',
        propertyString: 'id=startScr startHeaderText',
        label: {RU: 'Заголовок', EN: 'Header'}
    }),
    startDescription: new MutAppProperty({
        value: 'Check your knowledge',
        propertyString: 'id=startScr startDescription',
        label: {RU:'Описание', EN:'Description'}
    }),
    startButtonText: new MutAppProperty({
        value: 'Start',
        propertyString: 'id=startScr startButtonText',
        label: {RU:'Текст кнопки', EN:'Start button text'}
    }),
    /**
     * Как подписаться на изменения значения? Это не модель
     * Раньше был перезапуск приложения и рендер при старте
     */
    backgroundImg: new MutAppProperty({
        propertyString: 'id=startScr backgroundImg',
        value: null, // 'http://cdn0.redkassa.ru/live/sitenew/picture/871de92e-2b5f-4a3f-be16-8e2b6031bd66',
        propertyName: 'backgroundImg',
        label: {RU:'Фоновая картинка', EN:'Background image'}
    }),

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
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);

        this.model.bind("change:state", function () {
            if ('welcome' === this.model.get('state')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);

        this.model.bind("change:showBackgroundImage", function () {
            this.render();
        }, this);

        this.backgroundImg.bind("change", function() {
            this.render();
        }, this);
    },

    render: function() {
        console.log('Start Screen render()');

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

        if (this.model.get('showBackgroundImage').getValue() === true) {
            if (this.backgroundImg.getValue()) {
                this.$el.find('.js-back_img').css('backgroundImage','url('+this.backgroundImg.getValue()+')');
            }
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
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

        if (this.shadowEnable === true) {
            this.$el.find('.js-back_shadow').css('background-color','rgba(0,0,0,0.4)');
        }
        else {
            this.$el.find('.js-back_shadow').css('background-color','');
        }

        return this;
    }
});