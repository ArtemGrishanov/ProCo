/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол для перемещения какого-то элемента в абсолютных координатах
 *
 * @param {string} param.additionalParam.draggableParentSelector - обязательный параметр. Селектор одного из родителей в котором будет происходить перетаскивание
 */
function Drag(param) {
    this.init(param);

    if (!this.additionalParam.draggableParentSelector) {
        throw new Error('Drag: \'draggableParentSelector\' param must be specified in additional param. This is a css class selector.');
    }

    this.$draggableParent = null;
    // основное значение контрола
    this.position = {
        left: 0,
        top: 0
    };
    this.isDragging = false;
    this.prodElemPositionCached = null; // кеш при перетаскивании
    this.productDOMElementSize = null; // размеры нужны для нормализации, чтобы не выйти за границы
    this.draggableParentSize = null;
    // ??
    // this.onMouseDownStopPropagation = params.hasOwnProperty('onMouseDownStopPropagation') ? params.onMouseDownStopPropagation: true;
    this.onMouseDownStopPropagation = true;

    // возможность задать масштаб. Действия контрола будут учитывать этот масштаб
    this.scale = 1;
    if (this.additionalParam.scale) {
        if (isNumeric(this.additionalParam.scale) === true) {
            this.scale = parseFloat(this.additionalParam.scale);
        }
//        todo with panorama
//        else if (Engine.parseSelector(params.scale) !== null) {
//            var s = undefined;
//            try {
//                s = Engine.getApp().getPropertiesBySelector(params.scale)[0].value;
//            }
//            catch (err) {}
//            if (s !== undefined) {
//                this.scale = s;
//            }
//        }
    }

    this._mouseDownHandler = null;
    this._draggableParentMousemoveHandler = null;
    this._draggableParentMouseupHandler = null;
}
_.extend(Drag.prototype, AbstractControl);

Drag.prototype.setProductDomElement = function(elem) {
    if (this.$productDomElement) {
        this.$productDomElement.off('mousedown', this._mouseDownHandler);
        this.$productDomElement = null;
    }
    if (elem) {
        this.$productDomElement = $(elem);
        this._mouseDownHandler = this.onMouseDown.bind(this);
        this.$productDomElement.mousedown(this._mouseDownHandler);
        this.setDraggableParent();
    }
};

Drag.prototype.getValue = function() {
    return {
        left: this.position.left / this.scale,
        top: this.position.top / this.scale
    };
};

Drag.prototype.setValue = function(value) {
    value.top = parseInt(value.top); // '20px' string is ok
    value.left = parseInt(value.left);
    if (isNumeric(value.top) === true && isNumeric(value.left) === true) {
        var l = Math.round(value.left * this.scale);
        var t = Math.round(value.top * this.scale);
        // проверка что хотя бы одна из координат изменилась, тогда обновить
        if (this.position.left !== l || this.position.top !== t) {
            this.position.left = l;
            this.position.top = t;
            if (this.$productDomElement) {
                this.$productDomElement.css('left',this.position.left+'px');
                this.$productDomElement.css('top',this.position.top+'px');
            }
        }
    }
    else {
        throw new Error('Drag.setValue: unsupported value type');
    }
};

Drag.prototype.destroy = function() {
    this.$productDomElement.off('mousedown', this._mouseDownHandler);
    this.$draggableParent.off('mousemove', this._draggableParentMousemoveHandler);
    this.$draggableParent.off('mouseup', this._draggableParentMouseupHandler);
    this.$directive.remove();
};

/**
 * На основании this.additionalParam.draggableParentSelector найти родителя внутри которого будем перетаскивать
 *
 */
Drag.prototype.setDraggableParent = function() {
    if (this.$draggableParent) {
        this.$draggableParent.off('mousemove', this._draggableParentMousemoveHandler);
        this.$draggableParent.off('mouseup', this._draggableParentMouseupHandler);
    }
    var cls = this.additionalParam.draggableParentSelector;
    if (cls[0]==='.') {
        // убираем точку впереди если она есть. Для проверки hasClass нужно просто имя класса
        cls = cls.substr(1, cls.length);
    }
    var p = this.$productDomElement.parent();
    while (p.hasClass(cls) === false &&
        p.length > 0) {
        p = p.parent();
    }
    if (p && p.hasClass(cls)===true) {
        this.$draggableParent = p;
        this._draggableParentMousemoveHandler = this.onDraggableParentMouseMove.bind(this);
        this._draggableParentMouseupHandler = this.onDraggableParentMouseUp.bind(this);
        this.$draggableParent.mousemove(this._draggableParentMousemoveHandler);
        this.$draggableParent.mouseup(this._draggableParentMouseupHandler);
    }
    else {
        throw new Error('Drag.findDraggableParent: cannot find parent with selector \''+this.additionalParam.draggableParentSelector+'\'. Property=\''+this.propertyString+'\'');
    }

};

/**
 * Не дать перетаскиваемому элементу выйти за границы родителя this.additionalParam.draggableParentSelector
 *
 */
Drag.prototype.normalizeElementPosition = function() {
    if (this.prodElemPositionCached.top < 0) {
        this.prodElemPositionCached.top = 0;
    } else if (this.prodElemPositionCached.top + this.productDOMElementSize.height > this.draggableParentSize.height) {
        this.prodElemPositionCached.top = this.draggableParentSize.height - this.productDOMElementSize.height;
    }
    if (this.prodElemPositionCached.left < 0) {
        this.prodElemPositionCached.left = 0;
    } else if (this.prodElemPositionCached.left + this.productDOMElementSize.width > this.draggableParentSize.width) {
        this.prodElemPositionCached.left = this.draggableParentSize.width - this.productDOMElementSize.width;
    }
};

/**
 * Нажатие на productDomElement
 * @param e
 */
Drag.prototype.onMouseDown = function(e) {
    // console.log('Drag.onMouseDown');
    this.productDOMElementSize = {
        width: this.$productDomElement.outerWidth(false),
        height: this.$productDomElement.outerHeight(false)
    };
    this.draggableParentSize = {
        width: this.$draggableParent.outerWidth(false),
        height: this.$draggableParent.outerHeight(false)
    };
    this.prodElemPositionCached = null;
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

/**
 * Перемещение мыши по this.additionalParam.draggableParentSelector
 * @param e
 */
Drag.prototype.onDraggableParentMouseMove = function(e) {
    // console.log('Drag.onMouseMove');
    if (this.isDragging === true) {
        this.prodElemPositionCached = {
            top: (e.pageY-this.startMousePosition.top)+this.startPosition.top,
            left: (e.pageX-this.startMousePosition.left)+this.startPosition.left
        };
        this.normalizeElementPosition();
        this.$productDomElement.css('top', this.prodElemPositionCached.top+'px');
        this.$productDomElement.css('left', this.prodElemPositionCached.left+'px');

        //todo событие будет об изменении свойства, редактор по типу или имени контролов будет просить workspace апдейтить выделение
        // Editor.updateSelection();
        // Editor.getQuickControlPanel().updatePosition(this.$productDomElement);
        this.position = this.prodElemPositionCached;
        this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
    }
};

/**
 * MouseUp для this.additionalParam.draggableParentSelector, остановка перетаскивания
 * @param e
 */
Drag.prototype.onDraggableParentMouseUp = function(e) {
    console.log('Drag.onMouseUp');
    if (this.isDragging === true && this.prodElemPositionCached) {
        this.position = this.prodElemPositionCached;
        this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
    }
    this.isDragging = false;
};