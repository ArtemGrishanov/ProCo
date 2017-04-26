/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления элемента в массив
 */
function AddArrayElementControl(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.$directive.click(this.onAddQuickButtonClick.bind(this));

    this.onAddQuickButtonClick = function(e) {
        var ap = Engine.getAppProperty(this.propertyString);
        var protoIndex = params.prototypeIndex || 0;
        var prototypeNameToAdd = ap.canAdd[protoIndex];
        var proto = Engine.getPrototypeForAppProperty(ap, prototypeNameToAdd);

        if (proto) {
            Engine.addArrayElement(ap, proto.getValue());
            if (ap.updateScreens === true) {
                Editor.syncUIControlsToAppProperties();
            }
        }
        else {
            log('There is no prototypes for \''+this.propertyString+'\'', true);
        }
    }
}
AddArrayElementControl.prototype = AbstractControl;