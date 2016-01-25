/**
 * Created by artyom.grishanov on 24.01.16.
 *
 * @constructor
 * @param {string} propertyString
 * @param {DOMElement} $parent
 * @param {object} controlConfig - объект из config.controls (config.js), конфигурация контрола
 */
function Slide(propertyString, $parent, controlConfig) {
    this.self = this;
    this.propertyString = propertyString;
    this.$parent = $parent;
    this.controlConfig = controlConfig;
    this.$directive = addDirective.call(this);
    // подписка на изменение AppProperty по ключу
    Engine.on('AppPropertyInited', this.propertyString, init.bind(this));
    Engine.on('DOMElementChanged', this.propertyString, init.bind(this));
    init.call(this);


    function init() {
        //TODO so something
    }

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+controlConfig.angularDirectiveName+' data-app_property="'+this.propertyString+'"></div>');
        $parent.append($elem);
        return $elem;
    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function SlideController(scope, attrs) {
    var appPropertyId = attrs.$$element.parent().attr('data-app_property');
    scope.slideClicked = function() {
        Engine.showScreenPreview(appPropertyId);
    }
}