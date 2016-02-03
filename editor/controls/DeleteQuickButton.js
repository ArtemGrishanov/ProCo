/**
 * Created by artyom.grishanov on 03.02.16.
 *
 * Контрол удаления, привязан к свойству массиву
 * Он отвечает за удаление всех элементов массива

 * @constructor
 * @param {string} propertyString
 * @param {HTMLElement} $parent
 * @param {object} controlConfig - объект из config.controls (config.js), конфигурация контрола
 */
function DeleteQuickButton(propertyString, $parent, controlConfig) {
    this.type = 'quick';
    this.self = this;
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
        var $elem = $('<div '+controlConfig.angularDirectiveName+' data-app-property="'+this.propertyString+'"></div>');
        $parent.append($elem);
        $elem.css('zIndex',config.editor.ui.quickControlsZIndex);
        $elem.css('position','absolute');
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
        this.$directive.css('left', '100px');
        this.$directive.css('top', pos.top+'px')
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