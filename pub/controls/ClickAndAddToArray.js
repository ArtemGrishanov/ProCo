/**
 * Created by artyom.grishanov on 10.01.17.
 *
 * Контрол для перемещения какого-то элемента в абсолютных координатах
 */
function ClickAndAddToArray(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.elemPosition = null;

//            var ap1 = Engine.getAppProperty(this.propertyString);
//            Engine.setValue(ap1, this.elemPosition);

    this.onMouseClick = function(e) {
        console.log(e.offsetX+' '+ e.offsetY);

        var ap = Engine.getAppProperty(this.propertyString);
        var protoIndex = params.prototypeIndex || 0;
        var prototypeNameToAdd = ap.canAdd[protoIndex];
        var proto = Engine.getPrototypeForAppProperty(ap, prototypeNameToAdd);

        if (proto) {
            //TODO
            // Надо делать проброс масштаба через параметр типа params.scale
            // А в дескрипторе писать типа: scale: 'id=panoScr previewScale'
            //
            //
            var app = Engine.getApp();
            var scale = app.getPropertiesBySelector('id=panoramaEditScr previewScale')[0].value;
            Engine.addArrayElement(ap, proto.getValue({
                left: e.offsetX/scale,
                top: e.offsetY/scale
            }));
            if (ap.updateScreens === true) {
                Editor.syncUIControlsToAppProperties();
            }
        }
        else {
            log('There is no prototypes for \''+this.propertyString+'\'', true);
        }


        // обрабатываем только первое нажатие и дальше стоппим обработку событий
        // так как могут два элемента для перетаскивания наложиться друг на друга
        e.stopPropagation();
        e.preventDefault();
    };

    this.$productDomElement.click(this.onMouseClick.bind(this));
}
ClickAndAddToArray.prototype = AbstractControl;