/**
 * Created by artyom.grishanov on 10.01.17.
 *
 * Контрол для перемещения какого-то элемента в абсолютных координатах
 */
function ClickAndAddToArray(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.elemPosition = null;
    // возможность задать масштаб. Действия контрола будут учитывать этот масштаб
    this.scale = 1;
    if (params.scale) {
        if (!isNaN(parseFloat(params.scale)) && isFinite(params.scale)) {
            this.scale = parseFloat(params.scale);
        }
        else if (Engine.parseSelector(params.scale) !== null) {
            var s = undefined;
            try {
                s = Engine.getApp().getPropertiesBySelector(params.scale)[0].value;
            }
            catch (err) {}
            if (s !== undefined) {
                this.scale = s;
            }
        }
    }

    this.onMouseClick = function(e) {
        console.log(e.offsetX+' '+ e.offsetY);

        var ap = Engine.getAppProperty(this.propertyString);
        var protoIndex = params.prototypeIndex || 0;
        var prototypeNameToAdd = ap.canAdd[protoIndex];
        var proto = Engine.getPrototypeForAppProperty(ap, prototypeNameToAdd);

        if (proto) {
            Engine.addArrayElement(ap, proto.getValue({position:{
                left: Math.round(e.offsetX/this.scale),
                top: Math.round(e.offsetY/this.scale)
            }}));
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