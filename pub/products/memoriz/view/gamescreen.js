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
        if (this.model.application.mode !== 'edit') {
            if (this.canTouch === true) {
                var cardId = $(e.currentTarget).attr('data-card-id');
                this.model.touchCard(cardId);
            }
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

        this.model.bind("change:gameCards", function() {
            this.render();
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

        this.model.bind("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoOnGamescreen", this.onMutAppPropertyChanged, this);
        this.model.bind("change:gamescreenBackgroundImg", this.onMutAppPropertyChanged, this);
        this.model.bind("change:isHorizontalCards", this.onMutAppPropertyChanged, this);
        this.model.bind("change:cardsInRow", this.onMutAppPropertyChanged, this);
        this.model.bind("change:backCardTexture", this.onMutAppPropertyChanged, this);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    render: function() {
        this.$el.html(this.template['default']());

        var $cardField = this.$el.find('.js-card-field');
        var cards = this.model.get('gameCards');
        var cardsInRow = parseInt(this.model.get('cardsInRow').getValue()) || 5;
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
            c.card_index = '-';
            if (this.model.get('isHorizontalCards').getValue() === true) {
                c.orientationMod = '__horizontal';
            }
            else {
                c.orientationMod = '';
            }
            $cardField.append(this.template[c.uiTemplate](MutApp.Util.getObjectForRender(c)));


            if (this.model.application.isSmallWidth() !== true && ((i+1) % cardsInRow === 0)) {
                // соблюдаем количество карточек в одном ряду согласно настройке
                // но на мобе не соблюдаем
                $cardField.append('<br/>');
            }
        }

        var textureUrl = this.model.get('backCardTexture').getValue();
        if (textureUrl) {
            $cardField.find('.js-card_front').css('backgroundImage','url('+textureUrl+')');
        }

        // установка свойств логотипа
        var $l = this.$el.find('.js-gamescreen_logo');
        if (this.model.get('showLogoOnGamescreen').getValue() === true) {
            var pos = this.model.get('logoPositionInGamescreen').getValue();
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top', pos.top+'px').css('left', pos.left+'px');
        }
        else {
            $l.hide();
        }

        var bImg = this.model.get('gamescreenBackgroundImg').getValue();
        if (bImg) {
            this.$el.find('.js-back_img').css('backgroundImage','url('+bImg+')');
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
        }

        this.renderCompleted();
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
    },

    destroy: function() {
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.off("change:showLogoOnGamescreen", this.onMutAppPropertyChanged, this);
        this.model.off("change:gamescreenBackgroundImg", this.onMutAppPropertyChanged, this);
        this.model.off("change:isHorizontalCards", this.onMutAppPropertyChanged, this);
        this.model.off("change:cardsInRow", this.onMutAppPropertyChanged, this);
        this.model.off("change:backCardTexture", this.onMutAppPropertyChanged, this);
    }
});