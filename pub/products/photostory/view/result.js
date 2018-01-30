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
    /**
     * Признак "нажатости" кнопки мыши либо тача
     */
    pressed: false,

    movex: undefined,
    verticalSwipe: undefined,
    touchmovex: undefined,
    touchmovey: undefined,
    longTouch: undefined,
    longTouchTimeoutId: null,

    template: {
        "default": _.template($('#id-result_template').html()),
        "id-result_collage_item_template": _.template($('#id-result_collage_item_template').html())
    },

    events: {
        "click .js-restart": "onRestartClick",
        "click .js-mutapp_share_fb": "onFBShareClick",
        "click .js-mutapp_share_vk": "onVKShareClick",
        "click .js-logo": "onLogoClick",
        "click .js-download_btn": "onDownloadClick",
        "touchstart .js-logo_cnt": "onSlidesCntTouchStart",
        "touchmove .js-logo_cnt": "onSlidesCntTouchMove",
        "touchend .js-logo_cnt": "onSlidesCntTouchEnd",
        "mousedown .js-logo_cnt": "onMouseDown",
        "mousemove .js-logo_cnt": "onMouseMove",
        "mouseup .js-logo_cnt": "onMouseUp",
        "mouseleave .js-logo_cnt": "onMouseLeave"
    },

    onMouseDown: function(event) {
        if (this.model.application.mode !== 'edit') {
            this.onSlidesCntTouchStart(event);
        }
    },

    onMouseMove: function(event) {
        if (this.model.application.mode !== 'edit') {
            this.onSlidesCntTouchMove(event);
        }
    },

    onMouseUp: function(event) {
        if (this.model.application.mode !== 'edit') {
            this.onSlidesCntTouchEnd(event);
        }
    },

    onMouseLeave: function(event) {
        if (this.model.application.mode !== 'edit') {
            console.log('mouseleave');
            this.onSlidesCntTouchEnd(event);
        }
    },

    onSlidesCntTouchStart: function(event) {
        this.longTouch = false;
        this.verticalSwipe = false;
        this.movex = 0;
        if (this.longTouchTimeoutId) {
            clearTimeout(this.longTouchTimeoutId);
        }
        this.longTouchTimeoutId = setTimeout((function() {
            if (this.pressed === true) {
                // определяем долгий "уверенный" тач, исключая случайные касания
                // в нативном исполнении это тоже так: легкие краткие касания не работают
                this.longTouch = true;
                // здесь мы решаем начинать или нет горизонтальный скрол
                // является ли свайп вертикальным или горизонтальным
                if (Math.abs(this.touchmovey - this.touchstarty) > Math.abs(this.touchmovex - this.touchstartx)) {
                    this.verticalSwipe = true;
    //                console.log('onSlidesCntTouchStart: Vertical swipe detected');
                }
            }
            this.longTouchTimeoutId = null;
        }).bind(this), 10);

        // ширину слайда при первом таче определяем
        this.resultBackWidth = this.$resultScreenBack.width();
        this.$resultScreenBack.removeClass('animate');
        this.touchstartx = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageX: event.originalEvent.clientX;
        this.touchstarty = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageY: event.originalEvent.clientY;

        // начальная позиция экранов
        this.move({
            animation: false,
            action: 'show'
        });
        this.model.application.slider.move({
            animation: false,
            action: 'hide'
        });

        this.pressed = true;
    },

    onSlidesCntTouchMove: function(event) {
        this.touchmovex = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageX: event.originalEvent.clientX;
        this.touchmovey = (event.originalEvent.touches) ? event.originalEvent.touches[0].pageY: event.originalEvent.clientY;
        if (this.longTouch === true) {
            if (this.verticalSwipe === false) {
                this.movex = this.touchmovex-this.touchstartx;
                if (this.movex > 0) {
                    // с левого края начинает постепенно выезжать экран slider
                    this.$el.css('transform','translate3d(' + this.movex + 'px,0,0)');
                    this.model.application.slider.$el.css('position','absolute').css('transform','translate3d(' + (this.movex-this.resultBackWidth) + 'px,0,0)');
                }
                // для горизонтального свайпа запретить поведение по умолчанию: прокрутку страницы вертикально
                event.originalEvent.preventDefault();
                event.originalEvent.stopPropagation();
                event.originalEvent.stopImmediatePropagation();
//                console.log('onSlidesCntTouchMove: preventDefault');
            }
            else {
                // vertical page scrolling enabled
//                console.log('onSlidesCntTouchMove: return true');
                this.movex = 0;
                return true;
            }
        }
        else {
            this.movex = 0;
        }
    },

    onSlidesCntTouchEnd: function(event) {
//        console.log('onSlidesCntTouchEnd. movex='+this.movex);
        this.longTouch = false;
        if (this.pressed === true) {
            // дистанция на которую надо сделать тач, чтобы начался переход к другому слайду
            var distanceToChange = this.resultBackWidth / 6;
            if (this.movex > distanceToChange) {
                // окончательный переход к экрану slider
                this.move({
                    action: 'hide'
                });
                this.model.application.slider.move({
                    action: 'show'
                });
                this.model.set({
                    state: 'slider'
                });
            }
            else {
                // вернуть в исходное состояние
                this.move({
                    action: 'show'
                });
                this.model.application.slider.move({
                    action: 'hide'
                });
            }
            this.pressed = false;
        }
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

        if (this.model.application.mode !== 'edit') {
            if (window.addEventListener) {
                // listener on changing window size to measure slide width
                window.addEventListener('resize', this.onWindowResize.bind(this), false);
            }
        }

        this.model.bind("change:state", function () {
            if (this.model.application.mode === 'edit') {
                this.render();
            }
            else {
                if (this.model.get('state') === 'slider' && this.model.previous('state') === null) {
                    // подготовить экран к анимации, отрендерить его заранее
                    this.render();
                    this.move({
                        animation: false,
                        action: 'hide'
                    });
                }
            }
        }, this);

        this.model.bind('change:slides', this.onMutAppPropertyChanged, this);
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

    /**
     * При изменении размера окна
     */
    onWindowResize: function() {
        setTimeout((function(){
            this.render();
            if (this.model.get('state') !== 'result') {
                this.move({
                    animation: false,
                    action: 'hide'
                });
            }
        }).bind(this),0);
    },

    /**
     * Кастомная функция показа/скрытия экрана через transform
     *
     * @param param.animation
     * @param param.action
     */
    move: function(param) {
        param = param || {};
        param.animation = (typeof param.animation === 'boolean') ? param.animation: true;
        param.action = param.action || 'hide';

        if (param.animation === true) {
            this.$el.addClass('animate');
        }
        else {
            this.$el.removeClass('animate');
        }

        //TODO перейти на app.getSize().width
        this.$el.show().css('position','absolute');
        this.resultBackWidth = this.$resultScreenBack.width();
        if (param.action === 'show') {
            this.$el.css('transform','translate3d(0,0,0)');
        }
        else if (param.action === 'hide') {
            this.$el.css('position','absolute').css('transform','translate3d(' + (this.resultBackWidth) + 'px,0,0)');
        }
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

        // ширину слайда при первом таче определяем
        this.$resultScreenBack = this.$el.find('.js-logo_cnt')
            .css('transform','translate3d(0,0,0)');

        //
        this.renderCollage();

        this.renderCompleted();
        return this;
    },

    /**
     * Отрендирить коллаж на экране результата
     * Допустимо только определенное количество фото
     */
    renderCollage: function() {
        var slides = this.model.get('slides').toArray();
        var $collageCnt = this.$el.find('.js-collage_cnt').empty();

        // коллаж рассчитан на 1 4 7 картинок, остальные варианты сводятся к этим наборам
        // css стили также рассчитаны только на это количество
        var possiblePhotoCounts = [1,4,7];
        var photosInCollage = 0;
        for (var i = possiblePhotoCounts.length-1; i >= 0; i--) {
            if (slides.length >= possiblePhotoCounts[i]) {
                photosInCollage = possiblePhotoCounts[i];
                break;
            }
        }

        if (photosInCollage > 0) {
            for (var i = 0; i < photosInCollage; i++) {
                var $item = this.template['id-result_collage_item_template']({
                    image: slides[i].imgSrc.getValue()
                });
                $collageCnt.append($item);
            }
            if (photosInCollage === 7) {
                $collageCnt.addClass('__wide');
            }
            else {
                $collageCnt.removeClass('__wide');
            }
            if (photosInCollage === 1) {
                $collageCnt.addClass('__one');
            }
            else {
                $collageCnt.removeClass('__one');
            }
        }
    },

    /**
     * Измерить максимальную высоту этого экрана и сделать ее высотой приложения
     * Только экран может сам измерить свою высоту корректно
     *
     * Нужно пересчитывать при изменении размеров приложения, например, смене ориентации экрана устройства.
     */
    measureHeight: function() {
        // метка которая показывается на контейнере внизу проекта
        var testixLabel = 30;
        var scrHeight = 0;
        scrHeight += this.$el.find('.js-result_title').outerHeight();
        scrHeight += this.$el.find('.js-result_description').outerHeight();
        scrHeight += this.$el.find('.js-result_collage_wr').outerHeight();
        if (this.model.get('showDownload').getValue() === true) {
            scrHeight += this.$el.find('.js-download_btn_wr').outerHeight();
        }
        scrHeight += this.$el.find('.js-restart_btn_wr').outerHeight();
        if (this.model.get('vkSharingEnabled').getValue()===true) {
            scrHeight += this.$el.find('.js-mutapp_share_vk').outerHeight();
        }
        if (this.model.get('fbSharingEnabled').getValue()===true) {
            scrHeight += this.$el.find('.js-mutapp_share_fb').outerHeight();
        }
        if (this.model.get('showLogoInResults').getValue() === true) {
            scrHeight += this.$el.find('.js-result_logo').outerHeight();
        }
        scrHeight += testixLabel;
        return scrHeight;
    },

    /**
     * Функция будет вызвана перед удалением экрана
     * Надо позаботиться об удалении всех обработчиков
     *
     */
    destroy: function() {
        this.model.off("change:slides", this.onMutAppPropertyChanged, this);
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