/**
 * Created by artyom.grishanov on 05.02.16.
 *
 * Контрол добавления экрана

 * @constructor
 * @param {string} propertyString
 * @param {HTMLElement} $parent
 * @param {string} name
 * @param {object} params - параметры контрола, которые описаны в дескрипторе. Может быть указано специальное поведение.
 */
function AddScreenButton(propertyString, $parent, name, params) {
    this.self = this;
    this.name = name;
    this.$parent = $parent;
    this.propertyString = propertyString;
    this.params = params;

    this.onAddScreenButtonClick = function(e) {
        var ap = Engine.getAppProperty(this.propertyString);
        var pp = Engine.getPrototypesForAppProperty(ap);
        if (pp.length > 0) {
            //TODO будет выбор какой именно экран добавить
            Engine.addArrayElement(ap, pp[0]);
            //TODO тут реально только надо пересобрать контролы Slide
            if (this.params && this.params.updateScreens === true) {
                syncUIControlsToAppProperties();
            }
        }
        else {
            log('There is no prototypes for \''+this.appProperty+'\'', true);
        }
    }

    this.$directive = addDirective.call(this);

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+config.controls[name].angularDirectiveName+' data-app-property="'+this.propertyString+'"></div>');
        $parent.append($elem);
        $elem.on('click', this.onAddScreenButtonClick.bind(this));
        return $elem;
    }

    this.setProductDomElement = function(elem) {

    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function AddScreenButtonController(scope, attrs) {

}