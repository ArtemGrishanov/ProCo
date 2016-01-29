/**
 * Created by artyom.grishanov on 24.01.16.
 *
 * @constructor
 * @param {string | Array.<string>} propertyString - здесь также может быть массив, так как экранов несколько
 * @param {DOMElement} $parent
 * @param {object} controlConfig - объект из config.controls (config.js), конфигурация контрола
 */
function Slide(propertyString, $parent, controlConfig) {
    this.self = this;
    this.propertyString = propertyString;
//    this.$parent = $parent;
//    this.controlConfig = controlConfig;
    this.$directive = addDirective.call(this);
    // подписка на изменение AppProperty по ключу
//    Engine.on('AppPropertyInited', this.propertyString, init.bind(this));
//    Engine.on('DOMElementChanged', this.propertyString, init.bind(this));
//    init.call(this);
//
//
//    function init() {
//        //TODO so something
//    }

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var p = (Array.isArray(this.propertyString)) ? this.propertyString.join(',') : this.propertyString;
        var $elem = $('<div '+controlConfig.angularDirectiveName+' data-app-property="'+p+'"></div>');
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
    // может быть указано несколько экрано для одного контрола Slide
    var appProperties = attrs.$$element.parent().attr('data-app-property');
    var scrIds = appProperties.split(',');
    scope.slideClicked = function() {
        // просим редактор показать скрин по его ид
        showScreen(scrIds);
    }
}