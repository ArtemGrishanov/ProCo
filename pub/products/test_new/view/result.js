/**
 * Created by artyom.grishanov on 09.07.16.
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
    name: 'Результат',
    /**
     * Схлопываем результаты в один
     */
    collapse: true,
    /**
     * @see MutApp
     */
    doWhenInDOM: function() {
        applyStyles();
    },

    /**
     * Это appProperty
     * Сам logo не является отдельным вью, так как не имеет своей логики
     */
    showLogo: true,
    logoPosition: {top: 100, left: 20},
    restartButtonText: 'Заново',
    backgroundImg: null,
    shadowEnable: false,
    showDownload: false,
    downloadButtonText: 'Скачать',
    /**
     * Позиция кнопки для шаринга результата в фб
     */
    fbSharePosition: {top: 219, left: 294},
    /**
     * Позиция кнопки для шаринга результата в ВКонтакте
     */
    vkSharePosition: {top: 270, left: 294},

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

    onDownloadClick: function(e) {
        var dl = this.model.get('downloadLink');
        if (dl) {
            var win = window.open(dl, '_blank');
            win.focus();
            this.model.application.stat('Test', 'downloadclick');
        }
    },

    onFBShareClick: function(e) {
        // ид экрана выступает также и в роли идентификатора для постинга
        // это определили при создании приложения в app.js
        this.model.application.share(this.id);
    },

    onVKShareClick: function(e) {
        // ид экрана выступает также и в роли идентификатора для постинга
        // это определили при создании приложения в app.js
        this.model.application.share(this.id, 'vk');
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
            if ('result'===this.model.get('state') && this.resultId===this.model.get('currentResult').id) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    render: function() {
        var r = this.model.getResultById(this.resultId);
        r.currentResultIndex = this.model.get('results').indexOf(r);
        this.$el.html(this.template['default'](r));

        // установка свойств логотипа
        var $l = this.$el.find('.js-result_logo');
        if (this.showLogo === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl')+')');
            $l.css('top',this.logoPosition.top+'px').css('left',this.logoPosition.left+'px');
        }
        else {
            $l.hide();
        }

        var $dl = this.$el.find('.js-download_btn_wr');
        if (this.showDownload === true) {
            $dl.show();
        }
        else {
            $dl.hide();
        }

        // кнопка шаринга
        $('.js-mutapp_share_fb').
            css('top',this.fbSharePosition.top+'px').
            css('left',this.fbSharePosition.left+'px');
        $('.js-mutapp_share_vk').
            css('top',this.vkSharePosition.top+'px').
            css('left',this.vkSharePosition.left+'px');

        this.$el.find('.js-restart').html(this.restartButtonText);

        this.$el.find('.js-download_btn').html(this.downloadButtonText);

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