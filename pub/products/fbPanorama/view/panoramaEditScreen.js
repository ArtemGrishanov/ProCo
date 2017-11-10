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

    /**
     * мапа для сохранения объектов стилей которые используются для сменв цвета пинов
     */
    customPinColorStyles: {},
    /**
     * Канвас который показывается фоном на экране редактирования
     * На нем не отрисованы пины
     */
    canvasForEditing: null,
    /**
     * Сохраненные пины, чтобы их потом проще удалить
     */
    $pins: [],

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

        if (this.model.application.mode === 'edit' || this.model.application.mode === 'none') {
            this.model.bind("change:imageProgress", function () {
                var panoConfig = this.model.get('panoConfig');
                if (!panoConfig && this.imageProgressShown === false) {
                    // рендерим экран прогресса только первый раз
                    // изменение каждого процента не рендерим, так как это тяжело обновлять в редакторе
                    this.imageProgressShown = true;
                    this.render();
                    if (this.model.get('photoViewerMode').getValue() !== true) {
                        this.model.application.showScreen(this);
                    }
                    else {
                        this.model.application.hideScreen(this);
                    }
                }
            }, this);

            this.model.bind("change:panoramaImage", function () {
                this.canvasForEditing = null;
                this.imageProgressShown = false;
                this.render();
                // this.model.application.showScreen(this);
            }, this);

            this.model.bind("change:pins", function () {
                this.render();
            }, this);

            this.model.bind("change:previewScale", function () {
                this.canvasForEditing = null;
            }, this);

            this.model.bind("change:panoConfig", function () {
                this.canvasForEditing = null;
            }, this);
        }
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
     * Установка произвольного цвета для after элемента пина .pin_wr
     */
    setPinAfterColor: function($pin, pinIndex, mod, backgroundColor, stylesContainer) {
        stylesContainer = stylesContainer || this.$el;
        if (this.customPinColorStyles[pinIndex]) {
            this.customPinColorStyles[pinIndex].remove();
        }
        var customMod = 'customAfterClass'+pinIndex;
        if ($pin.hasClass(customMod) !== true) {
            $pin.addClass(customMod);
        }
        if (backgroundColor) {
            var cssStr = '';
            switch(mod) {
                case 'ar_bottom':
                case 'ar_bottom_left':
                case 'ar_bottom_right':
                    cssStr = 'border-top-color:'+backgroundColor+';';
                    break;
                case 'ar_top':
                case 'ar_top_left':
                case 'ar_top_right':
                    cssStr = 'border-bottom-color:'+backgroundColor+';';
                    break;
            }
            // https://stackoverflow.com/questions/5041494/selecting-and-manipulating-css-pseudo-elements-such-as-before-and-after-usin
            this.customPinColorStyles[pinIndex] = $('<style id="id-pin_custom_style">.pin_wr.'+mod+'.'+customMod+':after{'+cssStr+'}</style>').appendTo(stylesContainer);
            // document.styleSheets[0].addRule('.pin_wr.'+mod+'.special:after',cssStr);
        }
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

            if (this.canvasForEditing === null) {
                // this.model.get('panoCanvas') - не нужен, для редактирования пинов нужен другой канвас без пинов
                // рисовать заново этот канвас надо при изменении одного из параметров: panoConfig panoImage ps, а иначе не надо перерисовывать - тормоза
                // чаще пользователь работает только с пинами, а канвас остается прежний
                /* var c = this.model.get('panoCanvas'); */
                this.canvasForEditing = this.model.createPanoCanvas(
                        panoConfig,
                        panoImage,
                        ps,
                        [] // Важно: без пинов. На экране panoramaEditScreen пины - это верстка, для редактирования
                    );
                this.$el.html(this.template['default']({
                    backgroundImage: ''
                }));
                var $panoImg = this.$el.find('.js-pano_image');
                $(this.canvasForEditing).width(this.canvasForEditing.width*ps+'px').height(this.canvasForEditing.height*ps+'px');
                $panoImg.append(this.canvasForEditing);

                this.$el.find('.js-image_progress').hide();

                var panoImgWidth = Math.round(panoConfig.srcWidth * ps);
                var panoImgHeight = Math.round(panoConfig.srcHeight * ps);
                this.panoramaPreviewImageSize = {
                    width: panoImgWidth,
                    height: panoImgHeight
                };
            }

            // удаляем предыдущие пины
            for (var i = 0; i < this.$pins.length; i++) {
                this.$pins[i].remove();
            }
            this.$pins = [];
            // отрисовка пинов
            var $pinsCnt = this.$el.find('.js-pins_cnt');

            var pinsArr = this.model.attributes.pins.toArray();
            for (var i = 0; i < pinsArr.length; i++) {
                var p = pinsArr[i];
                p.data.pinDictionaryId = this.model.attributes.pins.getIdFromPosition(i);
                var $pel = $(this.template[p.uiTemplate](MutApp.Util.getObjectForRender(p.data)));
                // класс стрелки
                $pel.addClass(p.modArrow.getValue());
                // цвет фона
                if (p.backgroundColor.getValue()) {
                    $pel.css('background-color', p.backgroundColor.getValue());
                    this.setPinAfterColor($pel, i, p.modArrow.getValue(), p.backgroundColor.getValue());
                }
                // цвет текста
                if (p.fontColor.getValue()) {
                    $pel.css('color', p.fontColor.getValue());
                }
                var top = Math.round(p.position.getValue().top*ps);
                var left = Math.round(p.position.getValue().left*ps);
                $pel.css('top',top).css('left',left);
                var textAlign = 'left';
                switch(p.modArrow) {
                    case 'ar_top':
                    case 'ar_bottom': {
                        textAlign = 'center';
                        break;
                    }
                    case 'ar_top_right':
                    case 'ar_bottom_right': {
                        textAlign = 'right';
                        break;
                    }
                }
                $pel.css('textAlign',textAlign);
                $pinsCnt.append($pel);
                this.$pins.push($pel);
                // нормализовать положение пина, чтобы он не вышел за границы картинки
                this.normalizePinPosition($pel, i);
            }
        }
        else {
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

        this.renderCompleted();
        return this;
    }
});