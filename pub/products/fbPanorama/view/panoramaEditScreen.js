/**
 * Created by artyom.grishanov on 09.01.17.
 */
var PanoramaEditScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'panoramaEditScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'start',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Панорама',
    /**
     * Какую по умолчанию показывать высоту картинки на экране превью
     * Из этого будет рассчитан масштаб previewScale
     */
    DEF_PANORAMA_PREVIEW_HEIGHT: 600,
    logoPosition: {top: 200, left: 200},
    showLogo: true,
    /**
     * Масштаб панорамы, который отображается на превью
     */
    previewScale: undefined,

    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,

    template: {
        "default": _.template($('#id-panorama_edit_template').html()),
        "id-text_pin_template": _.template($('#id-text_pin_template').html())
    },

    events: {
        "click .js-logo": "onLogoClick"
    },

    onLogoClick: function(e) {
        var ll = this.model.get('logoLink');
        if (ll) {
            var win = window.open(ll, '_blank');
            win.focus();
            this.model.application.stat(this.model.application.type, 'logoclick');
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);
        this.model.bind("change:panoramaImage", function () {

            var pImg = this.model.get('panoramaImage');
            if (pImg) {
                if (this.previewScale === undefined) {
                    this.previewScale = this.DEF_PANORAMA_PREVIEW_HEIGHT/pImg.height;
                    // приложение получить свой новый актуальный размер в зависимости от загруженной картинки и масштаба
                    this.model.application.width = Math.round(pImg.width * this.previewScale);
                    this.model.application.height = this.DEF_PANORAMA_PREVIEW_HEIGHT;
                }

                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
    },

    render: function() {

        var pImg = this.model.get('panoramaImage');
        if (pImg) {
            console.log('panoramaEditScreen.render(): +image');
            this.$el.html(this.template['default']({
                backgroundImage: this.model.get('panoramaImgSrc')
            }));
            var w = Math.round(pImg.width * this.previewScale);
            var h = pImg.height * this.previewScale;
            this.$el.find('.js-pano').width(w+'px').height(h+'px');
            // отрисовка пинов
            var $pinsCnt = this.$el.find('.js-pins_cnt');
            for (var i = 0; i < this.model.attributes.pins.length; i++) {
                var p = this.model.attributes.pins[i];
                p.data.pinIndex = i;
                var $pel = $(this.template[p.uiTemplate](p.data));
                var top = Math.round(p.position.top*this.previewScale);
                var left = Math.round(p.position.left*this.previewScale);
                $pel.css('top',top).css('left',left);
                $pinsCnt.append($pel);
            }
        }
        else {
            console.log('panoramaEditScreen.render(): no image');
            this.$el.html(this.template['default']({
                backgroundImage: ''
            }));
            //TODO show progress loader
        }

        // установка свойств логотипа
        var $l = this.$el.find('.js-start_logo');
        if (this.showLogo === true) {
            $l.css('backgroundImage','url('+this.model.get('logoUrl')+')');
            $l.css('top',this.logoPosition.top+'px').css('left',this.logoPosition.left+'px');
        }
        else {
            $l.hide();
        }

        this.renderChecksum = Math.random();
        return this;
    }
});