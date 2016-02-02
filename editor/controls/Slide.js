/**
 * Created by artyom.grishanov on 24.01.16.
 *
 * @constructor
 * @param {string | Array.<string>} propertyString - здесь также может быть массив, так как экранов несколько
 * @param {DOMElement} $parent
 * @param {object} controlConfig - объект из config.controls (config.js), конфигурация контрола
 */
function Slide(propertyString, $parent, controlConfig) {
    this.type = 'permanent';
    this.self = this;
    // значит что данный экран показан в данный момент пользователю
    // ставится движком в showScreen
    this.active = false;
    this.$parent = $parent;
    this.propertyString = propertyString;
    this.$directive = addDirective.call(this);
    this.onScreenUpdate = function(e) {
        //TODO хорошо перерисовывать только когда экран реально виден пользователю, только активный экран
        if (this.active === true) {
            showScreen([this.propertyString]);
        }
    };

    // помним, что контрол может отвечать сразу за несколько экранов
    var arr = this.propertyString;
    if (!Array.isArray(arr)) {
        arr = [arr];
    }
    // подписка на обновления экрана в движке, контрол будет запрашивать у редактора перерисовку
    for (var i = 0; i < arr.length; i++) {
        Engine.on('ScreenUpdated', arr[i], this.onScreenUpdate.bind(this));
    }

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