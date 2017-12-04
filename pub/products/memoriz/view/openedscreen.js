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
    name: {RU:'Пояснения',EN:'Feedback'},
    /**
     * Ид пары к которой привязан этот экран пояснения
     */
    pairId: null,
    /**
     * Ид элемента словаря в котором хранится пара
     */
    dictionaryId: null,
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
        if (this.model.application.mode !== 'edit') {
            this.model.application.hideScreen(this);
            this.model.next();
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('height','100%'));
        param.screenRoot.append(this.$el);
        this.dictionaryId = param.dictionaryId;
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
        var pairArr = this.model.attributes.pairs.toArray();
        var pairIndex = pairArr.indexOf(pair);
        pair.explanation.pairIndex = pairIndex;
        this.$el.html(this.template['default'](pair.explanation));

        var $cc = this.$el.find('.js-opened_cards');
        var gameCard1 = this.model.getGameCardById(pair.card1.id);
        var gameCard2 = this.model.getGameCardById(pair.card2.id);
        $cc.append(this.template[gameCard1.uiTemplate](MutApp.Util.getObjectForRender(gameCard1)));
        $cc.append(this.template[gameCard2.uiTemplate](MutApp.Util.getObjectForRender(gameCard2)));
        // надо добавить атрибут data-app-property="id=mm pairs.<%=dictionaryId%>.card1.img" вручную, так как разне значения: "card1" и "card2"
        $cc.find('.js-card').addClass('__opened');

        this.$el.find('.js-close_opened_layer').html(this.model.get('nextButtonText').getValue());

        // установка свойств логотипа
        var $l = this.$el.find('.js-opened_logo');
        if (this.model.get('showLogoInOpened').getValue() === true) {
            var pos = this.model.get('logoPositionInOpened').getValue();
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top', pos.top+'px').css('left', pos.left+'px');
        }
        else {
            $l.hide();
        }

        var bImg = this.model.get('openedBackgroundImg').getValue();
        if (bImg) {
            this.$el.find('.js-back_img').css('backgroundImage','url('+bImg+')');
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
        }

        this.renderCompleted();

        return this;
    }
});