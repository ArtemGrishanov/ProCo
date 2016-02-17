/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления элемента в массив
 */
function AddArrayElementControl(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.onAddQuickButtonClick = function(e) {
        var ap = Engine.getAppProperty(this.propertyString);
        var pp = Engine.getPrototypesForAppProperty(ap);
        if (pp && pp.length > 0) {
            var protoIndex = params.prototypeIndex || 0;
            Engine.addArrayElement(ap, pp[protoIndex], undefined, {updateScreens:true});
            if (this.params && this.params.updateScreens === true) {
                syncUIControlsToAppProperties();
            }
        }
        else {
            log('There is no prototypes for \''+this.propertyString+'\'', true);
        }
    }
    this.$directive.on('click', this.onAddQuickButtonClick.bind(this));
    if (this.$productDomElement) {
        var offset = this.$productDomElement.position();
        var h = this.$productDomElement.height();
        //TODO позиционирование пока не понятно как делать
        //TODO в панеле экранов одно, а на рабочем поле - другое
        this.$directive.css('position','absolute');
        this.$directive.css('left', '10px');
        this.$directive.css('top', offset.top+h+'px')
        this.$directive.css('zIndex',config.editor.ui.quickControlsZIndex);
    }
}
AddArrayElementControl.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function AddArrayElementControlController(scope, attrs) {

}