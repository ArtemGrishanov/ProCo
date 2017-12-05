/**
 * Created by artyom.grishanov on 19.12.16.
 */
var ResultScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'resultScr',

    type: 'result',
    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'result',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {RU:'Результат',EN:'Result'},
    /**
     * Схлопываем результаты в один
     */
    collapse: true,
    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: $('#id-result_scr_cnt').hide(),

    template: {
        "default": _.template($('#id-result_template').html())
    },

    events: {
        "click .js-next": "onNextClick",
        "click .js-mutapp_share_fb": "onFBShareClick",
        "click .js-mutapp_share_vk": "onVKShareClick",
        "click .js-logo": "onLogoClick",
        "click .js-download_btn": "onDownloadClick"
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

    onDownloadClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            var dl = this.model.get('downloadLink');
            if (dl) {
                var win = window.open(dl, '_blank');
                win.focus();
                this.model.application.stat('Test', 'downloadclick');
            }
        }
    },

    onFBShareClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            // ид экрана выступает также и в роли идентификатора для постинга
            // это определили при создании приложения в app.js
            this.model.application.share(this.id);
        }
    },

    onVKShareClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            // ид экрана выступает также и в роли идентификатора для постинга
            // это определили при создании приложения в app.js
            this.model.application.share(this.id, 'vk');
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        this.resultId = param.resultId;
        param.screenRoot.append(this.$el);
        this.model.bind("change:state", function () {
            // у каждого экрана-результата есть уже свой ид связанный с результатом в модели
            if ('result'===this.model.get('state')) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);

        this.model.bind("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoInResults", this.onMutAppPropertyChanged, this);
        this.model.bind("change:resultsBackgroundImg", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showDownload", this.onMutAppPropertyChanged, this);
        this.model.bind("change:fbSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.bind("change:vkSharingEnabled", this.onMutAppPropertyChanged, this);
    },

    onMutAppPropertyChanged: function() {
        this.render();
    },

    render: function() {
        var r = {
            title: this.model.get('resultTitle').getValue(),
            description: this.model.get('resultDescription').getValue()
        };
        if (this.model.application.isSmallWidth() === true) {
            //description title
            r = JSON.parse(JSON.stringify(r));
            if (r.title) r.title = r.title.replace(/<br>/g,' ');
            if (r.description) r.description = r.description.replace(/<br>/g,' ');
        }
        this.$el.html(this.template['default'](r));

        // установка свойств логотипа
        var $l = this.$el.find('.js-result_logo');
        var pos = this.model.get('logoPositionInResults').getValue();
        if (this.model.get('showLogoInResults').getValue() === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl').getValue()+')');
            $l.css('top', pos.top+'px').css('left', pos.left+'px');
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
        var fbPos = this.model.get('fbSharingPosition').getValue();
        $('.js-mutapp_share_fb').
            css('top', fbPos.top+'px').
            css('left', fbPos.left+'px');
        var vkPos = this.model.get('vkSharingPosition').getValue();
        $('.js-mutapp_share_vk').
            css('top', vkPos.top+'px').
            css('left', vkPos.left+'px');

        this.$el.find('.js-restart').html(this.model.get('restartButtonText').getValue());

        this.$el.find('.js-download_btn').html(this.model.get('downloadButtonText').getValue());

        var backImg = this.model.get('resultsBackgroundImg').getValue();
        if (backImg) {
            this.$el.find('.js-back_img').css('backgroundImage','url('+backImg+')');
        }
        else {
            this.$el.find('.js-back_img').css('backgroundImage','none');
        }

        this.renderCompleted();

        return this;
    },

    destroy: function() {
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);
        this.model.off("change:showLogoInResults", this.onMutAppPropertyChanged, this);
        this.model.off("change:resultsBackgroundImg", this.onMutAppPropertyChanged, this);
        this.model.off("change:showDownload", this.onMutAppPropertyChanged, this);
        this.model.off("change:fbSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.off("change:vkSharingEnabled", this.onMutAppPropertyChanged, this);
    }
});