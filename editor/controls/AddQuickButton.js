/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления

 * @constructor
 * @param {string} propertyString
 * @param {HTMLElement} $parent
 * @param {object} controlConfig - объект из config.controls (config.js), конфигурация контрола
 */
function AddQuickButton(propertyString, $parent, controlConfig) {
    this.type = 'quick';
    this.self = this;
    this.$parent = $parent;
    this.propertyString = propertyString;

    this.onAddQuickButtonClick = function(e) {
        var p = Engine.getAppProperty(this.propertyString);
        var c = p.getArrayElementCopy();
        Engine.addArrayElement(p, c);
    }

    this.$directive = addDirective.call(this);

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+controlConfig.angularDirectiveName+' data-app-property="'+this.propertyString+'"></div>');
        $parent.append($elem);
        $elem.css('zIndex',config.editor.ui.quickControlsZIndex);
        $elem.css('position','absolute');
        $elem.on('click', this.onAddQuickButtonClick.bind(this));
        return $elem;
    }

    this.setProductDomElement = function(elem) {
        this.$productDomElem = $(elem);
        var offset = this.$productDomElem.position();
        var h = this.$productDomElem.height();
        //TODO позиционирование пока не понятно как делать
        this.$directive.css('left', '10px');
        this.$directive.css('top', offset.top+h+'px')
    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function AddQuickButtonController(scope, attrs) {

}