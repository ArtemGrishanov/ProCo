/**
 * Created by artyom.grishanov on 03.02.16.
 *
 * Контрол удаления, привязан к свойству массиву
 * Он отвечает за удаление всех элементов массива
 * Кнопка сама перемещается вслед за наведением

 * @constructor
 * @param {string} propertyString
 * @param {string} directiveName - имя вью, имя директивы angular которая его загружает
 * @param {HTMLElement} $parent
 * @param {string} name
 * @param {object} params
 */
function DeleteQuickButton(propertyString, directiveName, $parent, name, params) {
    this.self = this;
    this.directiveName = directiveName;
    this.name = name;
    this.params = params;
    this.arrayDomElements = null;
    this.overedArrayElement = null;
    this.$parent = $parent;
    this.propertyString = propertyString;

    this.onDeleteQuickButtonClick = function(e) {
        if (this.overedArrayElement) {
            var index = this.arrayDomElements.indexOf(this.overedArrayElement);
            if (index >= 0) {
                var p = Engine.getAppProperty(this.propertyString);
                Engine.deleteArrayElement(p, index);
            }
        }
    }

    this.$directive = addDirective.call(this);

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+this.directiveName+' data-app-property="'+this.propertyString+'"></div>');
        $parent.append($elem);
        $elem.css('zIndex',config.editor.ui.quickControlsZIndex);
        $elem.css('position','absolute');
        $elem.css('display','none');
        $elem.on('click', this.onDeleteQuickButtonClick.bind(this));
        return $elem;
    }

    this.setProductDomElement = function(elem) {
        this.arrayDomElements = []
        this.$productDomElem = $(elem);
        var p = Engine.getAppProperty(this.propertyString);
        for (var i = 0; i < p.propertyValue.length; i++) {
            var e = this.$productDomElem.find('[data-app-property=\"'+this.propertyString+'.'+i+'\"]');
            if (e) {
                this.arrayDomElements.push(e[0]);
                $(e).mouseover(this.onElementOver.bind(this));
            }
        }
    }

    this.onElementOver = function(e) {
        this.overedArrayElement = e. currentTarget;
        var pos = $(this.overedArrayElement).position();
        //TODO непонятно как позиционировать
        this.$directive.css('display','block');
        this.$directive.css('left', '300px');
        this.$directive.css('top', (pos.top+14)+'px')
    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function DeleteQuickButtonController(scope, attrs) {

}