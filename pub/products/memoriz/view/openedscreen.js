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
     *
     */
    pair: null,
    /**
     * Ид элемента словаря в котором хранится пара
     */
    dictionaryId: null,
    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: null,
    /**
     * Ид таймера для отложенного рендера
     */
    delayedRenderTimerId: null,

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
        this.pair = this.model.getPairById(this.pairId);

        this.model.bind("change:state", function() {
            if ('opened' === this.model.get('state') && this.model.get('lastOpenedPair').id === this.pairId) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);

        this.model.bind("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoInOpened", this.onMutAppPropertyChanged, this);
        this.model.bind("change:openedBackgroundImg", this.onMutAppPropertyChanged, this);
        this.model.bind("change:logoPositionInOpened", this.onMutAppPropertyChangedDelayed, this);
        this.pair.card1.img.bind('change', this.onMutAppPropertyChanged, this);
        this.pair.card2.img.bind('change', this.onMutAppPropertyChanged, this);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    /**
     * Запланировать рендер через какое то время
     * Применяется когда как например при перетаскивании свойтво изменяется слишком часто
     * И нужно сделать рендер только в конце перемещения
     */
    onMutAppPropertyChangedDelayed: function() {
        if (this.delayedRenderTimerId) {
            clearTimeout(this.delayedRenderTimerId);
            this.delayedRenderTimerId = null;
        }
        this.delayedRenderTimerId = setTimeout((function() {
            this.render();
        }).bind(this), 999);
    },

    render: function() {
        var pair = this.model.getPairById(this.pairId);
        var pairArr = this.model.attributes.pairs.toArray();
        pair.explanation.dictionaryId = this.dictionaryId;
        this.$el.html(this.template['default'](MutApp.Util.getObjectForRender(pair.explanation)));

        var $cc = this.$el.find('.js-opened_cards');
        var gameCard1 = this.model.getGameCardById(pair.card1.id);
        gameCard1.card_index = 1;
        var gameCard2 = this.model.getGameCardById(pair.card2.id);
        gameCard2.card_index = 2;
        $cc.append(this.template[gameCard1.uiTemplate](MutApp.Util.getObjectForRender(gameCard1)));
        $cc.append(this.template[gameCard2.uiTemplate](MutApp.Util.getObjectForRender(gameCard2)));
        // надо добавить атрибут data-app-property="id=mm pairs.<%=dictionaryId%>.card1.img" вручную, так как разне значения: "card1" и "card2"
        $cc.find('[data-index=1]').attr('data-app-property', 'id=mm pairs.'+this.dictionaryId+'.card1.img');
        $cc.find('[data-index=2]').attr('data-app-property', 'id=mm pairs.'+this.dictionaryId+'.card2.img');
        $cc.find('.js-card').addClass('__opened');

        this.$el.find('.js-close_opened_layer').html(this.model.get('nextButtonText').getValue());

        // установка свойств логотипа
        var $l = this.$el.find('.js-opened_logo');
        if (this.model.get('showLogoInOpened').getValue() === true && this.model.get('logoUrl').getValue()) {
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
    },

    destroy: function() {
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.off("change:showLogoInOpened", this.onMutAppPropertyChanged, this);
        this.model.off("change:openedBackgroundImg", this.onMutAppPropertyChanged, this);
        this.model.off("change:logoPositionInOpened", this.onMutAppPropertyChangedDelayed, this);
        this.pair.card1.img.unbind('change', this.onMutAppPropertyChanged, this);
        this.pair.card2.img.unbind('change', this.onMutAppPropertyChanged, this);
    }
});