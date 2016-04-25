/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол типа Вкл/Выкл
 * Хорошо подходит для редактирования свойства типа boolean
 */
function OnOff(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
}
OnOff.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function OnOffController(scope, attrs) {
    scope.switcherId = Math.random().toString();
    var $e = attrs.$$element;
    //TODO здесь не учитывается что propertyStringsArray может быть массивом
    var propertyString = $e.parent().attr('data-app-property');
    var appProperty = Engine.getAppProperty(propertyString);
    if (appProperty) {
        var $checkbox = $e.find('[type="checkbox"]');
        $checkbox.prop('checked', appProperty.propertyValue);
        $checkbox.on('change',function (e) {
            console.log('changed');
            var v = $checkbox.prop('checked');
            var ap = Engine.getAppProperty(propertyString);
            Engine.setValue(ap, v);
        });
    }
}