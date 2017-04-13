/**
 * Created by artyom.grishanov on 11.09.16.
 */
var GameScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'gamescreen',
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {RU:'Игровое поле',EN:'Gameboard'},
    group: 'gamescreen',
    topColontitleText: 'Colontitle text',
    backgroundImg: null,
    logoPosition: {top: 200, left: 200},
    showLogo: true,
    shadowEnable: false,

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: null,
    canTouch: true,

    template: {
        "default": _.template($('#id-game_screen_template').html()),
        "id-card_text_template": _.template($('#id-card_text_template').html())
    },

    events: {
        "click .js-card": "onCardClick"
    },

    onCardClick: function(e) {
        if (this.canTouch === true) {
            var cardId = $(e.currentTarget).attr('data-card-id');
            this.model.touchCard(cardId);
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('height','100%'));
        param.screenRoot.append(this.$el);

        this.model.bind("change:state", function() {
            if ('game' === this.model.get('state')) {
                this.canTouch = true;
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);

        this.model.bind("change:openedCard1", function() {
            // открыть одну карту или закрыть все
            var c1 = this.model.get('openedCard1');
            if (c1 !== null) {
                this.openCard(c1);
            }
            else {
                if (this.model.get('guessed') === false) {
                    this.closeCard(this.model.previous('openedCard1'));
                }
            }
        }, this);

        this.model.bind("change:openedCard2", function() {
            // открыть вторую карту или закрыть все
            var c2 = this.model.get('openedCard2');
            if (c2 !== null) {
                this.canTouch = false;
                this.openCard(c2);
            }
            else {
                if (this.model.get('guessed') === false) {
                    this.closeCard(this.model.previous('openedCard2'));
                }
            }
        }, this);
    },

    render: function() {
        this.$el.html(this.template['default']());

        var $cardField = this.$el.find('.js-card-field');
        var cards = this.model.get('gameCards');
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            // проверить открыта ли уже эта карта или нет. Если открыта, ставим класс открытия
            var p = this.model.getPairForCardId(c.id);
            if (p.guessed === true) {
                c.mod = '__opened';
            }
            else {
                c.mod = '';
            }
            c.pairIndex = '-';
            c.cardIndex = '-';
            $cardField.append(this.template[c.uiTemplate](c));
        }

        if (this.model.get('showBackCardTexture')===true) {
            var textureUrl = this.model.get('backCardTexture');
            if (textureUrl) {
                $cardField.find('.js-card_front').css('backgroundImage','url('+textureUrl+')');
            }
        }
        //this.attributes.pairs[i].guessed

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
        var $l = this.$el.find('.js-gamescreen_logo');
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
    },

    openCard: function(card) {
        $('[data-card-id='+card.id+']').addClass('__opened');
    },

    closeCard: function(card) {
        setTimeout((function() {
            this.canTouch = true;
            $('[data-card-id='+card.id+']').removeClass('__opened');
        }).bind(this), 1000);
    }
});