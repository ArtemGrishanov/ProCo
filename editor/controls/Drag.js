/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол для перемещения какого-то элемента в абсолютных координатах

 * @constructor
 * @param {Array.<string>} propertyStrings
 * @param {string} directiveName - имя вью, имя директивы angular которая его загружает
 * @param {HTMLElement} $parent
 * @param {string} name
 * @param {object} params
 */
function Drag(propertyStringsArray, directiveName, $parent, name, params) {
    this.self = this;
    this.directiveName = directiveName;
    this.name = name;
    this.$parent = $parent;
    this.propertyStringsArray = propertyStringsArray;
    this.params = params;
    this.isDragging = false;
    this.$elem = null;
    this.elemPosition = null;

    this.onMouseUp = function(e) {
        if (this.isDragging === true) {
//            for (var i = 0; i < this.propertyStringsArray.length; i++) {
            // апдейт экранов нужен в том случае, когда показано несколько экранов сразу
            //TODO в этом случае подойдет "локальное" обновление: без пересборки экранов найти такое же data-app-propert в соседних экранах и проапдейтить
            var ap1 = Engine.getAppProperty(this.propertyStringsArray[0]);
            Engine.setValue(ap1, this.elemPosition.left, {updateScreens: true});
            //TODO как показать соответствие свойства и конкретных позиций top и left ? Заточка
            var ap2 = Engine.getAppProperty(this.propertyStringsArray[1]);
            Engine.setValue(ap2, this.elemPosition.top, {updateScreens: true});
//            }
            this.isDragging = false;
        }
    };

    this.onMouseMove = function(e) {
        if (this.isDragging === true) {
            this.elemPosition = {
                top: (e.pageY-this.startMousePosition.top)+this.startPosition.top,
                left: (e.pageX-this.startMousePosition.left)+this.startPosition.left
            };
            this.$elem.css('top', this.elemPosition.top+'px');
            this.$elem.css('left', this.elemPosition.left+'px');
        }
    };

    this.onMouseDown = function(e) {
        this.isDragging = true;
        this.startPosition = $(e.currentTarget).position();
        this.startMousePosition = {
            left: e.pageX,
            top: e.pageY
        };
    };

    this.$directive = addDirective.call(this);

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+this.directiveName+' data-app-property="'+this.propertyStringsArray.join(',')+'"></div>');
        $parent.append($elem);
        return $elem;
    }

    /**
     * Подразумевается, что этот метод может вызваться только,
     * когда контрол находится в поверх промо проекта при редактировании
     * Так называемый "быстрый контрол".
     *
     * @param elem
     */
    this.setProductDomElement = function(elem) {
        this.$elem = $(elem);
        $(elem).mousedown(this.onMouseDown.bind(this));
        $(document).mousemove(this.onMouseMove.bind(this));
        $(document).mouseup(this.onMouseUp.bind(this));
    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function DragController(scope, attrs) {

}