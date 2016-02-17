/**
 * Created by artyom.grishanov on 24.01.16.
 */
function Slide(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.onScreenUpdate = function(e) {
        //перерисовывать только когда экран реально виден пользователю, только активный экран
        //activeScreens - последние показанные экраны
        var p = (Array.isArray(this.propertyString))?this.propertyString.join(','):this.propertyString;
        if (activeScreens.join(',') == p) {
            var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
            showScreen(arr);
        }
    };
    // помним, что контрол может отвечать сразу за несколько экранов
    // подписка на обновления экрана в движке, контрол будет запрашивать у редактора перерисовку
    var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
    for (var i = 0; i < arr.length; i++) {
        Engine.on('ScreenUpdated', arr[i], this.onScreenUpdate.bind(this));
    }
}
Slide.prototype = AbstractControl;
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