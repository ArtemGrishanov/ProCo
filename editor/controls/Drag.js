/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол для перемещения какого-то элемента в абсолютных координатах
 */
function Drag(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.isDragging = false;
    this.elemPosition = null;

    this.onMouseUp = function(e) {
        // this.elemPosition - изначально =null, и определится только в onMouseMove
        if (this.isDragging === true && this.elemPosition) {
            // апдейт экранов нужен в том случае, когда показано несколько экранов сразу
            // обновлять экраны не надо, так как обновления происхоит по подписке на свойство для скорости
            var ap1 = Engine.getAppProperty(this.propertyString);
            Engine.setValue(ap1, this.elemPosition);
        }
        this.isDragging = false;
    };

    this.onMouseMove = function(e) {
        if (this.isDragging === true) {
            this.elemPosition = {
                top: (e.pageY-this.startMousePosition.top)+this.startPosition.top,
                left: (e.pageX-this.startMousePosition.left)+this.startPosition.left
            };
            this.$productDomElement.css('top', this.elemPosition.top+'px');
            this.$productDomElement.css('left', this.elemPosition.left+'px');
            var ap1 = Engine.getAppProperty(this.propertyString);
            Engine.setValue(ap1, this.elemPosition);
        }
    };

    this.onMouseDown = function(e) {
        this.elemPosition = null;
        this.isDragging = true;
        this.startPosition = $(e.currentTarget).position();
        this.startMousePosition = {
            left: e.pageX,
            top: e.pageY
        };
    };

    this.onPropertyChanged = function() {
        if (this.elemPosition !== null) {
            //тот кто стал инициатором изменения не должен сам обрабатывать событие
            var p = Engine.getAppProperty(this.propertyString);
            // проверка что хотя бы одна из координат изменилась, тогда обновить
            if (this.$productDomElement && (this.elemPosition.left !== p.propertyValue.left || this.elemPosition.top !== p.propertyValue.top)) {
                this.elemPosition.left = p.propertyValue.left;
                this.elemPosition.top = p.propertyValue.top;
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
    $(document).mousemove(this.onMouseMove.bind(this));
    $(document).mouseup(this.onMouseUp.bind(this));
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));
}
Drag.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function DragController(scope, attrs) {

}