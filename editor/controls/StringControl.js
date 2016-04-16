/**
 * Created by artyom.grishanov on 10.02.16.
 *
 * Контрол управления строкой
 * Это может быть: цвет, url, текст
 */
function StringControl(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
}
StringControl.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function StringControlController(scope, attrs) {
    var $e = attrs.$$element;
    var propertyString = $e.parent().attr('data-app-property');
    var appProperty = Engine.getAppProperty(propertyString);
    if (appProperty) {
        var $input = $e.find('[type="text"]');
        $input.keypress(function() {
            scope.needCheckDifference = true;
        });
        $input.val(appProperty.propertyValue);
        setInterval(function(){
            if (scope.needCheckDifference === true) {
                scope.needCheckDifference = false;
                var v = $input.val();
                if (scope.savedVal != v) {
                    scope.savedVal = v;
                    var ap = Engine.getAppProperty(propertyString);
                    if (ap.propertyValue !== v) {
                        Engine.setValue(ap, v);
                    }
                }
            }
        },500);
    }
}