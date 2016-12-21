/**
 * Created by artyom.grishanov on 19.12.16.
 */
var OpenedScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    type: 'opened',
    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'opened',
    draggable: false,
    canAdd: true,
    canDelete: true,
    canClone: true,
    /**
     * Для контрола SlideGroupControl, который управляет порядком группы экранов
     *
     * Это свойство надо понимать так:
     * Порядок этой вот группы экранов questions зависит от этого массива 'id=mm pairs'
     */
    arrayAppPropertyString: 'id=mm pairs',
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Пояснения',
    /**
     * Ид пары к которой привязан этот экран пояснения
     */
    pairId: null,

    topColontitleText: 'Текст колонтитула',
    backgroundImg: null,
    shadowEnable: false,
    logoPosition: {top: 200, left: 200},
    showLogo: true,
    nextButtonText: 'Далее',

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: null,

    template: {
        "default": _.template($('#id-opened_screen_template').html()),
        "id-card_text_template": _.template($('#id-card_text_template').html())
    },

    events: {
        "click .js-close_opened_layer": "onCloseOpenedLayerClick"
    },

    /**
     * Закрыть леер пояснения
     *
     * @param e
     */
    onCloseOpenedLayerClick: function(e) {
        this.model.application.hideScreen(this);
        this.model.next();
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('height','100%'));
        param.screenRoot.append(this.$el);
        this.pairId = param.pairId;

        this.model.bind("change:state", function() {
            if ('opened' === this.model.get('state') && this.model.get('lastOpenedPair').id === this.pairId) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    render: function() {
        var pair = this.model.getPairById(this.pairId);
        var pairIndex = this.model.attributes.pairs.indexOf(pair);
        pair.explanation.pairIndex = pairIndex;
        this.$el.html(this.template['default'](pair.explanation));

        var $cc = this.$el.find('.js-opened_cards');
        for (var i = 0; i < pair.cards.length; i++) {
            pair.cards[i].cardIndex = i;
            pair.cards[i].pairIndex = pairIndex;
            $cc.append(this.template[pair.cards[i].uiTemplate](pair.cards[i]));
        }
        $cc.find('.js-card').addClass('__opened');

        this.$el.find('.js-close_opened_layer').html(this.nextButtonText);

        if (this.showTopColontitle === true) {
            var $c = this.$el.find('.js-topColontitleText').show();
            if (this.topColontitleText) {
                $c.text(this.topColontitleText);
            }
        }
        else {
            this.$el.find('.js-topColontitleText').hide();
        }

        // установка свойств логотипа
        var $l = this.$el.find('.js-opened_logo');
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

        if (this.shadowEnable === true) {
            this.$el.find('.js-back_shadow').css('background-color','rgba(0,0,0,0.4)');
        }
        else {
            this.$el.find('.js-back_shadow').css('background-color','');
        }

        return this;
    }
});