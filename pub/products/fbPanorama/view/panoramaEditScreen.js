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
    name: {RU:'Панорама',EN:'Panorama'},
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

    imageProgressShown: false,

    panoramaContainerSize: null,

    panoramaPreviewImageSize: null,

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
        this.model.bind("change:imageProgress", function () {
            var panoConfig = this.model.get('panoConfig');
            if (!panoConfig && this.imageProgressShown === false) {
                // рендерим экран прогресса только первый раз
                // изменение каждого процента не рендерим, так как это тяжело обновлять в редакторе
                this.imageProgressShown = true;
                this.render();
                this.model.application.showScreen(this);
            }
        }, this);
        this.model.bind("change:panoramaImage", function () {
            this.imageProgressShown = false;
            this.render();
//            this.model.application.showScreen(this);
        }, this);
    },

    /**
     * Проверка, что пины не выходят за края картинки
     * Если это случается, то подвинуть пин к краю
     *
     * @param $view
     * @param {number} pinIndex - индекс в массиве pins в модели
     */
    normalizePinPosition: function($view, pinIndex) {
        // в модели хранятся орригинальные координаты в реальном масштабе
        var p = this.model.attributes.pins[pinIndex];

        var ep = {
            top: parseInt($view.css('top')),
            left: parseInt($view.css('left')),
            width: $view.outerWidth(false),
            height: $view.outerHeight(false)
        };
        if (ep.top < 0) {
            ep.top = 0;
        } else if (ep.top + ep.height > this.panoramaPreviewImageSize.height) {
            ep.top = this.panoramaPreviewImageSize.height - ep.height;
        }
        if (ep.left < 0) {
            ep.left = 0;
        } else if (ep.left + ep.width > this.panoramaPreviewImageSize.width) {
            ep.left = this.panoramaPreviewImageSize.width - ep.width;
        }

        $view.css('top', ep.top+'px');
        $view.css('left', ep.left+'px');
    },

    /**
     *
     * @returns {PanoramaEditScreen}
     */
    render: function() {
        var ps = this.model.get('previewScale');
        var panoConfig = this.model.get('panoConfig');
        var panoImage = this.model.get('panoramaImage');
        if (panoConfig) {
            console.log('panoramaEditScreen.render(): +image');

            // содержимое канваса не клонируется когда создается экран в редакторе
            var c = /*this.model.get('panoCanvas');/*/
                this.model.createPanoCanvas(
                    panoConfig,
                    panoImage,
                    ps,
                    [] // Важно: без пинов!
                );

            this.$el.html(this.template['default']({
                backgroundImage: ''
            }));
            var $panoImg = this.$el.find('.js-pano_image');
            $(c).width(c.width*ps+'px').height(c.height*ps+'px');
            $panoImg.append(c);
            this.$el.find('.js-image_progress').hide();
            //-- canvas experiment

//            this.$el.html(this.template['default']({
//                backgroundImage: this.model.get('panoramaImgSrc')
//            }));
//            this.$el.find('.js-image_progress').hide();

//            var cntWidth = Math.round(panoConfig.srcWidth * ps);
//            var cntHeight = Math.round(panoConfig.srcHeight * ps);
//            this.panoramaContainerSize = {
//                width: cntWidth,
//                height: cntHeight
//            };
//            var $panoCnt = this.$el.find('.js-pano').width(cntWidth+'px').height(cntHeight+'px');
//
//            // если картинка меньше контейнера, надо ее выровнять по центру внутри него. Так же делается при отрисовке канваса
//            var $panoImg = this.$el.find('.js-pano_image');
            var panoImgWidth = Math.round(panoConfig.srcWidth * ps);
            var panoImgHeight = Math.round(panoConfig.srcHeight * ps);
            this.panoramaPreviewImageSize = {
                width: panoImgWidth,
                height: panoImgHeight
            };
//            $panoImg.width(panoImgWidth+'px').height(panoImgHeight+'px');
//            $panoImg.css('top', Math.round((cntHeight-panoImgHeight)/2)+'px');
//            // выравнивать по горизонтали не надо. Если ширина контейнера меньше, будет оверфлоу прокрутка
//            //.css('left', Math.round((cntWidth-panoImgWidth)/2)+'px');
//
//            // отрисовка пинов
            var $pinsCnt = this.$el.find('.js-pins_cnt');
            for (var i = 0; i < this.model.attributes.pins.length; i++) {
                var p = this.model.attributes.pins[i];
                p.data.pinIndex = i;
                var $pel = $(this.template[p.uiTemplate](p.data));
                // класс стрелки
                $pel.addClass(p.modArrow);
                var top = Math.round(p.position.top*ps);
                var left = Math.round(p.position.left*ps);
                $pel.css('top',top).css('left',left);
                $pinsCnt.append($pel);
                // нормализовать положение пина, чтобы он не вышел за границы картинки
                this.normalizePinPosition($pel, i);
            }
        }
        else {
            console.log('panoramaEditScreen.render(): no image');
            this.$el.html(this.template['default']({
                backgroundImage: ''
            }));
            var p = this.model.get('imageProgress');
            this.$el.find('.js-image_progress').show();//.text(p + '%');
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