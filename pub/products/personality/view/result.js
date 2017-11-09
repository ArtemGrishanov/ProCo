/**
 * Created by artyom.grishanov on 09.07.16.
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
     * Для контрола SlideGroupControl, который управляет порядком группы экранов
     */
    arrayAppPropertyString: 'id=pm results',
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {EN:'Results',RU:'Результат'},
    collapse: false,
    draggable: false,
    canAdd: true,
    canDelete: true,
    canClone: true,
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
            var ll = this.model.get('logoLink').getValue();
            if (ll) {
                var win = window.open(ll, '_blank');
                win.focus();
                this.model.application.stat('Personality', 'logoclick');
            }
        }
    },

    onDownloadClick: function(e) {
        if (this.model.application.mode !== 'edit') {
            var dl = this.model.get('downloadLink').getValue();
            if (dl) {
                var win = window.open(dl, '_blank');
                win.focus();
                this.model.application.stat('Personality', 'downloadclick');
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
        this.resultId = param.resultId;
        this.result = this.model.getResultById(this.resultId);

        param.screenRoot.append(this.$el);
        this.model.bind("change:state", function () {
            // у каждого экрана-результата есть уже свой ид связанный с результатом в модели
            if ('result'===this.model.get('state') && this.resultId===this.model.get('currentResult').id) {
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);

        this.result.backgroundImage.bind('change', this.onMutAppPropertyChanged, this);
        this.result.backgroundColor.bind('change', this.onMutAppPropertyChanged, this);
        this.result.titleColor.bind('change', this.onMutAppPropertyChanged, this);
        this.result.descriptionColor.bind('change', this.onMutAppPropertyChanged, this);
        this.model.bind("change:showLogoInResults", this.onMutAppPropertyChanged, this);
        this.model.bind("change:shadowEnableInResults", this.onMutAppPropertyChanged, this);
        this.model.bind("change:showDownload", this.onMutAppPropertyChanged, this);
        this.model.bind("change:fbSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.bind("change:vkSharingEnabled", this.onMutAppPropertyChanged, this);
        this.model.bind("change:restartButtonText", function() {
            //this.onMutAppPropertyChanged
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

    render: function() {
        var r = this.result;
        var resIndex = this.model.get('results').toArray().indexOf(r);
        var dictionaryId = this.model.get('results').getIdFromPosition(resIndex);
        var renderObject = MutApp.Util.getObjectForRender(r);
        renderObject.currentResultIndex = dictionaryId;
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

        // цвет фона
        this.$el.find('.js-result_back_color')
            .css('background-color', r.backgroundColor.getValue());
        // цвет описания
        this.$el.find('.js-result_description')
            .css('color', r.descriptionColor.getValue());
        // цвет заголовка
        this.$el.find('.js-result_title')
            .css('color', r.titleColor.getValue());

        // фоновая картинка
        if (r.backgroundImage.getValue()) {
            this.$el.find('.js-result_back_img')
                .css('backgroundImage','url('+r.backgroundImage.getValue()+')');
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

        this.$el.attr('data-filter', r.backgroundImage.propertyString+','+r.backgroundColor.propertyString+',appConstructor=mutapp shareEntities.'+dictionaryId+'.imgUrl');

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
        this.model.off("change:restartButtonText", this.onMutAppPropertyChanged, this);
        this.model.off("change:downloadButtonText", this.onMutAppPropertyChanged, this);
        this.model.off("change:logoUrl", this.onMutAppPropertyChanged, this);

        this.result.backgroundImage.unbind('change', this.onMutAppPropertyChanged, this);
        this.result.backgroundColor.unbind('change', this.onMutAppPropertyChanged, this);
        this.result.titleColor.unbind('change', this.onMutAppPropertyChanged, this);
        this.result.descriptionColor.unbind('change', this.onMutAppPropertyChanged, this);
    }
});