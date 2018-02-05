/**
 * Created by artyom.grishanov on 19.12.16.
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
    name: {RU:'Стартовый экран',EN:'Start page'},
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
                this.model.application.stat(this.model.application.type, 'logoclick');
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

        this.model.bind("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoOnStartScreen", this.onMutAppPropertyChanged, this);
        this.model.bind("change:startScreenBackgroundImg", this.onMutAppPropertyChanged, this);

        this.model.bind("change:state", function () {
            if ('welcome' === this.model.get('state')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    render: function() {
        this.$el.html(this.template['default']());

        // установка свойств логотипа
        var $l = this.$el.find('.js-start_logo');
        if (this.model.get('showLogoOnStartScreen').getValue() === true && this.model.get('logoUrl').getValue()) {
            var pos = this.model.get('logoPositionInStartScreen').getValue();
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top', pos.top+'px').css('left', pos.left+'px');
        }
        else {
            $l.hide();
        }

        var bImg = this.model.get('startScreenBackgroundImg').getValue();
        if (bImg) {
            this.$el.find('.js-back_img').css('backgroundImage','url('+bImg+')');
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
        }

        var sbt = this.model.get('startButtonText').getValue();
        var sht = this.model.get('startHeaderText').getValue();
        var sd = this.model.get('startDescription').getValue();
        if (this.model.application.isSmallWidth() === true) {
            sbt = sbt.replace(/<br>/g,' ');
            sht = sht.replace(/<br>/g,' ');
            sd = sd.replace(/<br>/g,' ');
        }
        this.$el.find('.js-start_btn').html(sbt);
        this.$el.find('.js-start_header').html(sht);
        this.$el.find('.js-start_description').html(sd);

        this.renderCompleted();

        return this;
    },

    destroy: function() {
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.off("change:showLogoOnStartScreen", this.onMutAppPropertyChanged, this);
        this.model.off("change:startScreenBackgroundImg", this.onMutAppPropertyChanged, this);
    }

});