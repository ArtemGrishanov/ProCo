/**
 * Created by artyom.grishanov on 22.01.18.
 */
var ResultScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'resultScr',

    type: 'results',
    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'result',
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {EN:'Results',RU:'Результат'},
    collapse: false,
    draggable: false,
    canAdd: false,
    canDelete: false,
    canClone: false,
    /**
     * Ид таймера для отложенного рендера
     */
    delayedRenderTimerId: null,
    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: null,

    template: {
        "default": _.template($('#id-result_template').html())
    },

    events: {
        "click .js-restart": "onRestartClick",
        "click .js-mutapp_share_fb": "onFBShareClick",
        "click .js-mutapp_share_vk": "onVKShareClick",
        "click .js-logo": "onLogoClick",
        "click .js-download_btn": "onDownloadClick"
    },

    onRestartClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            this.model.restart();
        }
    },

    onLogoClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            var ll = this.model.get('logoLink').getValue();
            if (ll) {
                var win = window.open(ll, '_blank');
                win.focus();
                this.model.application.stat('Photostory', 'logoclick');
            }
        }
    },

    onDownloadClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            var dl = this.model.get('downloadLink').getValue();
            if (dl) {
                var win = window.open(dl, '_blank');
                win.focus();
                this.model.application.stat('Photostory', 'downloadclick');
            }
        }
    },

    onFBShareClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            // ид экрана выступает также и в роли идентификатора для постинга
            // это определили при создании приложения в app.js
            this.model.application.share(this.resultId);
        }
    },

    onVKShareClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            // ид экрана выступает также и в роли идентификатора для постинга
            // это определили при создании приложения в app.js
            this.model.application.share(this.resultId, 'vk');
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
            if ('slider'===this.model.get('state')) {
                // подготовить экран к анимации, отрендерить его заранее
                this.render();
                // TODO
//                var transform = 'translate3d('+(i*this.slideWidth)+'px,0,0)';
//                this.$el.css('transform', transform);
            }
            if ('result'===this.model.get('state')) {
                this.render();
                // 2: false - не скрывать slider, он участвует в анимации
                this.model.application.showScreen(this, false);
            }
        }, this);

        this.model.bind('change:resultBackgroundImage', this.onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoInResults", this.onMutAppPropertyChanged, this);
        this.model.bind("change:shadowEnableInResults", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showDownload", this.onMutAppPropertyChanged, this);
        this.model.bind("change:fbSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.bind("change:vkSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.bind("change:fbSharingPosition", this.onMutAppPropertyChangedDelayed, this);
        this.model.bind("change:vkSharingPosition", this.onMutAppPropertyChangedDelayed, this);
        this.model.bind("change:logoPositionInResults", this.onMutAppPropertyChangedDelayed, this);
        this.model.bind("change:restartButtonText", function() {
            // чтобы другие экраны результата обновлялись. Но текущий экран не надо рефрешить так как это ломает ввод пользователя
            // гибкость новой платформы в действии. Такие моменты должны реализовываться руками, силами разработчика
            // а не "декларативными правилами" или "автоматически"
            if (this.$el.find('.js-restart').html() !== this.model.get('restartButtonText').getValue()) {
                // рендерим только если текст отличается
                this.render();
            }
        }, this);
        this.model.bind("change:downloadButtonText", function() {
            // чтобы другие экраны результата обновлялись. Но текущий экран не надо рефрешить так как это ломает ввод пользователя
            // гибкость новой платформы в действии. Такие моменты должны реализовываться руками, силами разработчика
            // а не "декларативными правилами" или "автоматически"
            if (this.$el.find('.js-restart').html() !== this.model.get('restartButtonText').getValue()) {
                // рендерим только если текст отличается
                this.render();
            }
        }, this);
        this.model.bind("change:logoUrl", this.onMutAppPropertyChanged, this);
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
        var renderObject = {
            title: this.model.get('resultTitle').getValue(),
            description: this.model.get('resultDescription').getValue()
        };
        if (this.model.application.isSmallWidth() === true) {
            if (renderObject.title) renderObject.title = renderObject.title.replace(/<br>/g,' ');
            if (renderObject.description) renderObject.description = renderObject.description.replace(/<br>/g,' ');
        }
        this.$el.html(this.template['default'](MutApp.Util.getObjectForRender(renderObject)));

        // установка свойств логотипа
        var $l = this.$el.find('.js-result_logo');
        if (this.model.get('showLogoInResults').getValue() === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top',this.model.get('logoPositionInResults').getValue().top+'px')
                .css('left',this.model.get('logoPositionInResults').getValue().left+'px');
        }
        else {
            $l.hide();
        }

        var $dl = this.$el.find('.js-download_btn_wr');
        if (this.model.get('showDownload').getValue() === true) {
            $dl.show();
        }
        else {
            $dl.hide();
        }

        if (this.model.get('fbSharingEnabled').getValue()===true) {
            this.$el.find('.js-mutapp_share_fb').show();
        }
        else {
            this.$el.find('.js-mutapp_share_fb').hide();
        }
        if (this.model.get('vkSharingEnabled').getValue()===true) {
            this.$el.find('.js-mutapp_share_vk').show();
        }
        else {
            this.$el.find('.js-mutapp_share_vk').hide();
        }

        // кнопка шаринга
        $('.js-mutapp_share_fb').
            css('top', this.model.get('fbSharingPosition').getValue().top+'px').
            css('left', this.model.get('fbSharingPosition').getValue().left+'px');
        $('.js-mutapp_share_vk').
            css('top', this.model.get('vkSharingPosition').getValue().top+'px').
            css('left', this.model.get('vkSharingPosition').getValue().left+'px');

        this.$el.find('.js-restart').html(this.model.get('restartButtonText').getValue());

        this.$el.find('.js-download_btn').html(this.model.get('downloadButtonText').getValue());

        // фоновая картинка
        if (this.model.get('resultBackgroundImage').getValue()) {
            this.$el.find('.js-result_back_img')
                .css('backgroundImage','url('+this.model.get('resultBackgroundImage').getValue()+')');
        }
        else {
            this.$el.find('.js-result_back_img')
                .css('backgroundImage','none');
        }

        if (this.model.get('shadowEnableInResults').getValue() === true) {
            this.$el.find('.js-back_shadow').css('background-color','rgba(0,0,0,0.4)');
        }
        else {
            this.$el.find('.js-back_shadow').css('background-color','');
        }

        this.renderCompleted();
        return this;
    },

    /**
     * Функция будет вызвана перед удалением экрана
     * Надо позаботиться об удалении всех обработчиков
     *
     */
    destroy: function() {
        this.model.off("change:showLogoInResults", this.onMutAppPropertyChanged, this);
        this.model.off("change:shadowEnableInResults", this.onMutAppPropertyChanged, this);
        this.model.off("change:showDownload", this.onMutAppPropertyChanged, this);
        this.model.off("change:fbSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.off("change:vkSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.off("change:fbSharingPosition", this.onMutAppPropertyChangedDelayed, this);
        this.model.off("change:vkSharingPosition", this.onMutAppPropertyChangedDelayed, this);
        this.model.off("change:logoPositionInResults", this.onMutAppPropertyChangedDelayed, this);
        this.model.off("change:restartButtonText", this.onMutAppPropertyChanged, this);
        this.model.off("change:downloadButtonText", this.onMutAppPropertyChanged, this);
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.off("change:resultBackgroundImage", this.onMutAppPropertyChanged, this);
    }
});