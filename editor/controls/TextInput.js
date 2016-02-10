/**
 * Created by artyom.grishanov on 10.02.16.
 *
 * Контрол управления строкой

 * @constructor
 * @param {string} propertyString
 * @param {string} directiveName - имя вью, имя директивы angular которая его загружает
 * @param {HTMLElement} $parent
 * @param {string} name
 * @param {object} params
 */
function TextInput(propertyString, directiveName, $parent, name, params) {
    this.self = this;
    this.directiveName = directiveName;
    this.name = name;
    this.$parent = $parent;
    this.propertyString = propertyString;
    this.params = params;

    this.$directive = addDirective.call(this);

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+this.directiveName+' data-app-property="'+this.propertyString+'"></div>');
        $parent.append($elem);
        return $elem;
    }

    /**
     * Подразумевается, что этот метод может вызваться только,
     * когда контрол находится в поверх промо проекта при редактировании
     * Так называемый "быстрый контрол".
     *
     * @param elem
     */
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
function TextInputController(scope, attrs) {
    var $e = attrs.$$element;
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
                Engine.setValue(ap, v);
            }
        },500);
//        $input.change('change',function (e) {
//            console.log('changed');
//            var v = $input.val();
//            var ap = Engine.getAppProperty(propertyString);
//            Engine.setValue(ap, v);
//        });
    }
}