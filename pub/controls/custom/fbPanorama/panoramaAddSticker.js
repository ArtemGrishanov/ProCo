/**
 * Created by artyom.grishanov on 15.11.17.
 *
 * для добавления меток на панораму
 */
function PanoramaAddSticker(param) {
    this.init(param);

    // окно и документ айфрейма для работы с вводом
    // так как contenteditable поле ввода находится в айфрейме id-product_screens_cnt
    if (!this.additionalParam.appIframe) {
        throw new Error('PanoramaAddSticker: iframe must be set in additional param');
    }
    this.screenWindow = this.additionalParam.appIframe.contentWindow;
    this.screenDocument = this.additionalParam.appIframe.contentDocument;

    // возможность задать масштаб. Действия контрола будут учитывать этот масштаб
    this._scale = 1;
    if (this.additionalParam.scale) {
        if (isNumeric(this.additionalParam.scale) === true) {
            this._scale = this.additionalParam.scale;
        }
        else if (typeof this.additionalParam.scale === 'string') {
            // запросить по селектору значение попробовать
            this._scale = Editor.getEditedAppValueBySelector(this.additionalParam.scale);
            if (isNumeric(this._scale) !== true) {
                this._scale = 1;
            }
        }
    }

    /**
     * Позиция в которую будет добавлен стикер
     * @type {number}
     * @private
     */
    this._leftAddPosition = 0;
    /**
     * Позиция в которую будет добавлен стикер
     * @type {number}
     * @private
     */
    this._topAddPosition = 0;
    this.$directive.find('.js-add_sticker_btn').click(this.onAddStickerClick.bind(this));
    this.onProductElementInput = function() {
        this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
    };
}

_.extend(PanoramaAddSticker.prototype, AbstractControl);

PanoramaAddSticker.prototype.setProductDomElement = function(elem) {
    if (this.$productDomElement) {
        // отписываться только от тех событий, на которые подписался
        this.$productDomElement.off('click', this._onProductElementMouseClickHandler);
        this.$productDomElement = null;
    }
    if (elem) {
        this.$productDomElement = $(elem);
        this._onProductElementMouseClickHandler = this.onProductElementMouseClick.bind(this);
        this.$productDomElement.click(this._onProductElementMouseClickHandler);
    }
};

PanoramaAddSticker.prototype.getValue = function() {
    return undefined;
};

PanoramaAddSticker.prototype.setValue = function(value) {

};

PanoramaAddSticker.prototype.destroy = function() {
    if (this.$productDomElement) {
        this.$productDomElement.off('click', this._onProductElementMouseClickHandler);
    }
    this.$directive.remove();
};

/**
 *
 */
PanoramaAddSticker.prototype.onProductElementMouseClick = function(e) {
    if ($(e.currentTarget).hasClass('js-panoramaaddsticker') === true) {
        // показать панельку, если не показана
        this.$directive.show();

        this.updateScale();

        var h = this.$directive.height();
        var w = this.$directive.width();

        this._leftAddPosition = Math.round(e.offsetX - w/2);
        this._topAddPosition = Math.round(e.offsetY - h);

        // показ wrapper производится в ControlManager в рамках фильтрации, а здесь позиционирование
        // кастомный такой показ получается с выставлением позиции
        this.$wrapper.css('position','absolute')
            .css('left', this._leftAddPosition + 'px')
            .css('top', this._topAddPosition + 'px')
            // необходимо ставить zIndex так как контейнер с кнтролами ниже приложения
            // на qPanel, selectionBorder и т.п. тоже ставится программно редактором
            .css('z-index', config.editor.ui.quickControlsZIndex);
    }
    else {
        // кликнули в другую часть панорамы: например по стикеру, который выше фоновой картинки
        // надо скрыть контрол добавления нового стикера
        this.$directive.hide();
    }
};

PanoramaAddSticker.prototype.onAddStickerClick = function(e) {
    var app = Editor.getEditedApp();
    if (app) {
        var pins = app.model.get('pins');
        pins.addElementByPrototype('id=mm pinProto1', -1, {
            left: this._leftAddPosition / this._scale,
            top: this._topAddPosition / this._scale
        }); // пока существует только один возможный прототип

    }
};

PanoramaAddSticker.prototype.updateScale = function() {
    if (this.additionalParam.scale && typeof this.additionalParam.scale === 'string') {
        // запросить по селектору значение попробовать
        this._scale = Editor.getEditedAppValueBySelector(this.additionalParam.scale);
        if (isNumeric(this._scale) !== true) {
            this._scale = 1;
        }
    }
};