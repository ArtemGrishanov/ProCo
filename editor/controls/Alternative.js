/**
 * Created by artyom.grishanov on 18.02.16.
 */
function Alternative(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
}
Alternative.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function AlternativeController(scope, attrs) {
    scope.controlId = Math.random().toString();
    var $e = attrs.$$element;
    var propertyString = $e.parent().attr('data-app-property');
    var appProperty = Engine.getAppProperty(propertyString);
    var templateHtml = $e.find('.js-option_template').html();
    var $cnt = $e.find('.js-options');
    var $dropDownValue = $e.find('.js-value');
    for (var i = 0; i < appProperty.possibleValues.length; i++) {
        var pv = appProperty.possibleValues[i];
        // {{option}} - это визуальная часть, что видит пользователь
        // {{value}} - это само значение propertyValue, может отличаться
        var $newElem = $(templateHtml.replace('{{option}}',pv).replace('{{value}}',pv)).appendTo($cnt);
        $newElem.click(function(e) {
            //нажатие на клик и смена значения во вью и в движке
            var v = $(e.currentTarget).attr('data-value');
            $dropDownValue.text(v);
            Engine.setValue(appProperty, v);
        });
    }
    // сначала ставим текущее значение свойства как "выбранное"
    $dropDownValue.text(appProperty.propertyValue);
}