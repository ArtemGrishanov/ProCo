/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления элемента в массив
 */
function AddArrayElementControl(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.loadDirective(function(response, status, xhr){
        this.$directive.click(this.onAddQuickButtonClick.bind(this));
    });

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
    this.$directive.on('click', this.onAddQuickButtonClick.bind(this));
    if (this.$productDomElement) {
        // берем offset, так как экран располагается внутри iframe
        var offset = this.$productDomElement.offset();
        var h = this.$productDomElement.height();
        // выровнена всегда стилями по центру экрана
        // по высоте - под последней опцией ответв
//        this.$directive.css('position','absolute')
//            .css('left','50%')
//            .css('margin-left','-62px')
//            .css('top', offset.top+h+'px')
//            .css('zIndex',config.editor.ui.quickControlsZIndex);
    }
}
AddArrayElementControl.prototype = AbstractControl;