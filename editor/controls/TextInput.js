/**
 * Created by artyom.grishanov on 10.02.16.
 *
 * Контрол управления строкой
 * Это может быть: цвет, url, текст
 */
function TextInput(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
}
TextInput.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function TextInputController(scope, attrs) {
    var $e = attrs.$$element;
    //TODO обрабатывается не массив, а одно свойство
    var propertyString = $e.parent().attr('data-app-property');
    var appProperty = Engine.getAppProperty(propertyString);
    if (appProperty) {
        var $input = $e.find('[type="text"]');
        $input.val(appProperty.propertyValue);
        setInterval(function(){
            var v = $input.val();
            if (scope.savedVal != v) {
                scope.savedVal = v;
                var ap = Engine.getAppProperty(propertyString);
                if (ap.propertyValue !== v) {
                    Engine.setValue(ap, v);
                }
            }
        },500);
    }
}