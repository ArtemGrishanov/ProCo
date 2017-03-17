/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол для перемещения какого-то элемента в абсолютных координатах
 */
function Drag(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.isDragging = false;
    this.elemPosition = null;
    this.productDOMElementSize = null;
    this.onMouseDownStopPropagation = params.hasOwnProperty('onMouseDownStopPropagation') ? params.onMouseDownStopPropagation: true;

    // возможность задать масштаб. Действия контрола будут учитывать этот масштаб
    this.scale = 1;
    if (params.scale) {
        if (!isNaN(parseFloat(params.scale)) && isFinite(params.scale)) {
            this.scale = parseFloat(params.scale);
        }
        else if (Engine.parseSelector(params.scale) !== null) {
            var s = undefined;
            try {
                s = Engine.getApp().getPropertiesBySelector(params.scale)[0].value;
            }
            catch (err) {}
            if (s !== undefined) {
                this.scale = s;
            }
        }
    }

    this.onMouseUp = function(e) {
        // this.elemPosition - изначально =null, и определится только в onMouseMove
        if (this.isDragging === true && this.elemPosition) {
            // апдейт экранов нужен в том случае, когда показано несколько экранов сразу
            // обновлять экраны не надо, так как обновления происхоит по подписке на свойство для скорости
            var ap1 = Engine.getAppProperty(this.propertyString);
            Engine.setValue(ap1, {
                top: Math.round(this.elemPosition.top / this.scale),
                left: Math.round(this.elemPosition.left / this.scale)
            });
        }
        this.isDragging = false;
    };

    this.onMouseMove = function(e) {
        if (this.isDragging === true) {
            this.elemPosition = {
                top: (e.pageY-this.startMousePosition.top)+this.startPosition.top,
                left: (e.pageX-this.startMousePosition.left)+this.startPosition.left
            };

            this.normalizeElementPosition();

            this.$productDomElement.css('top', this.elemPosition.top+'px');
            this.$productDomElement.css('left', this.elemPosition.left+'px');
            var ap1 = Engine.getAppProperty(this.propertyString);
//            Engine.setValue(ap1, {
//                top: Math.round(this.elemPosition.top / this.scale),
//                left: Math.round(this.elemPosition.left / this.scale)
//            });
            Editor.updateSelection();
            Editor.getQuickControlPanel().updatePosition(this.$productDomElement);
        }
    };

    this.onMouseDown = function(e) {
        this.productDOMElementSize = {
            width: this.$productDomElement.outerWidth(false),
            height: this.$productDomElement.outerHeight(false)
        };
        this.elemPosition = null;
        this.isDragging = true;
        this.startPosition = $(e.currentTarget).position();
        this.startMousePosition = {
            left: e.pageX,
            top: e.pageY
        };
        // обрабатываем только первое нажатие и дальше стоппим обработку событий
        // так как могут два элемента для перетаскивания наложиться друг на друга
        if (this.onMouseDownStopPropagation === true) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    this.normalizeElementPosition = function() {
        var cntSize = Editor.getAppContainerSize();
        if (this.elemPosition.top < 0) {
            this.elemPosition.top = 0;
        } else if (this.elemPosition.top + this.productDOMElementSize.height > cntSize.height) {
            this.elemPosition.top = cntSize.height - this.productDOMElementSize.height;
        }
        if (this.elemPosition.left < 0) {
            this.elemPosition.left = 0;
        } else if (this.elemPosition.left + this.productDOMElementSize.width > cntSize.width) {
            this.elemPosition.left = cntSize.width - this.productDOMElementSize.width;
        }
    };

    this.onPropertyChanged = function() {
        if (this.elemPosition !== null) {
            //тот кто стал инициатором изменения не должен сам обрабатывать событие
            var p = Engine.getAppProperty(this.propertyString);
            var l = Math.round(p.propertyValue.left * this.scale);
            var t = Math.round(p.propertyValue.top * this.scale);
            // проверка что хотя бы одна из координат изменилась, тогда обновить
            if (this.$productDomElement && (this.elemPosition.left !== l || this.elemPosition.top !== t)) {
                this.elemPosition.left = l;
                this.elemPosition.top = t;
                this.$productDomElement.css('left',this.elemPosition.left+'px');
                this.$productDomElement.css('top',this.elemPosition.top+'px');
            }
        }
    };

    this.elemPosition = {
        left: this.$productDomElement.css('left'),
        top: this.$productDomElement.css('top')
    };
    this.$productDomElement.mousedown(this.onMouseDown.bind(this));
    $("#id-product_screens_cnt").contents().mousemove(this.onMouseMove.bind(this));
    $("#id-product_screens_cnt").contents().mouseup(this.onMouseUp.bind(this));
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));
}
Drag.prototype = AbstractControl;