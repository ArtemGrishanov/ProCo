/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления

 * @constructor
 * @param {string} propertyString
 * @param {string} directiveName - имя вью, имя директивы angular которая его загружает
 * @param {HTMLElement} $parent
 * @param {string} name
 * @param {object} params
 */
function AddArrayElementControl(propertyString, directiveName, $parent, name, params) {
    this.self = this;
    this.directiveName = directiveName;
    this.name = name;
    this.$parent = $parent;
    this.propertyString = propertyString;
    this.params = params;

    this.onAddQuickButtonClick = function(e) {
        var ap = Engine.getAppProperty(this.propertyString);
        var pp = Engine.getPrototypesForAppProperty(ap);
        if (pp && pp.length > 0) {
            var protoIndex = params.prototypeIndex || 0;
            Engine.addArrayElement(ap, pp[protoIndex]);
            if (this.params && this.params.updateScreens === true) {
                syncUIControlsToAppProperties();
            }
        }
        else {
            log('There is no prototypes for \''+this.propertyString+'\'', true);
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
        $elem.on('click', this.onAddQuickButtonClick.bind(this));
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
        this.$productDomElem = $(elem);
        var offset = this.$productDomElem.position();
        var h = this.$productDomElem.height();
        //TODO позиционирование пока не понятно как делать
        this.$directive.css('position','absolute');
        this.$directive.css('left', '10px');
        this.$directive.css('top', offset.top+h+'px')
        this.$directive.css('zIndex',config.editor.ui.quickControlsZIndex);
    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function AddArrayElementControlController(scope, attrs) {

}