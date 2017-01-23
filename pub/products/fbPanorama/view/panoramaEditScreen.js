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
            this.render();
        }, this);
    },

    render: function() {

        var ps = this.model.get('previewScale');
        var panoConfig = this.model.get('panoConfig');
        var panoImage = this.model.get('panoramaImage');
        if (panoConfig) {
            console.log('panoramaEditScreen.render(): +image');
            this.$el.html(this.template['default']({
                backgroundImage: this.model.get('panoramaImgSrc')
            }));

            var cntWidth = Math.round(panoConfig.srcWidth * ps);
            var cntHeight = Math.round(panoConfig.srcHeight * ps);
            var $panoCnt = this.$el.find('.js-pano').width(cntWidth+'px').height(cntHeight+'px');

            // если картинка меньше контейнера, надо ее выровнять по центру внутри него. Так же делается при отрисовке канваса
            var $panoImg = this.$el.find('.js-pano_image');
            var panoImgWidth = Math.round(panoImage.width * ps);
            var panoImgHeight = Math.round(panoImage.height * ps);
            $panoImg.width(panoImgWidth+'px').height(panoImgHeight+'px');
            $panoImg.css('top', Math.round((cntHeight-panoImgHeight)/2)+'px').css('left', Math.round((cntWidth-panoImgWidth)/2)+'px');

            // отрисовка пинов
            var $pinsCnt = this.$el.find('.js-pins_cnt');
            for (var i = 0; i < this.model.attributes.pins.length; i++) {
                var p = this.model.attributes.pins[i];
                p.data.pinIndex = i;
                var $pel = $(this.template[p.uiTemplate](p.data));
                var top = Math.round(p.position.top*ps);
                var left = Math.round(p.position.left*ps);
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