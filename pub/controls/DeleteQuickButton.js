/**
 * Created by artyom.grishanov on 03.02.16.
 *
 * Контрол удаления, привязан к свойству массиву
 * Он отвечает за удаление элементов массива
 */
function DeleteQuickButton(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
//    this.arrayDomElements = null;
//    this.overedArrayElement = null;
//    this.productDOMElement = productDOMElement;

    this.loadDirective(function(response, status, xhr){
//        this.$directive.css('zIndex', config.editor.ui.quickControlsZIndex);
//        this.$directive.css('position','absolute');
//        this.$directive.css('display','none');
        this.$directive.on('click', this.onDeleteQuickButtonClick.bind(this));
//        this.arrayDomElements = []

        var p = Engine.getAppProperty(this.propertyString);
        for (var i = 0; i < p.propertyValue.length; i++) {
            var e = $(this.productDOMElement).find('[data-app-property=\"'+this.propertyString+'.'+i+'\"]');
            if (e) {
//                this.arrayDomElements.push(e[0]);
//                $(e).mouseover(this.onElementOver.bind(this));
            }
        }
    });

    this.onDeleteQuickButtonClick = function(e) {
//        if (this.overedArrayElement) {
//            var index = this.arrayDomElements.indexOf(this.overedArrayElement);
//            if (index >= 0) {

                var p = Engine.getAppProperty(this.propertyString);
//        TODO index
                Engine.deleteArrayElement(p, 0);
//            }
//        }
    }
//    this.onElementOver = function(e) {
//        this.overedArrayElement = e.currentTarget;
//        var pos = $(this.overedArrayElement).position();
//        //TODO непонятно как позиционировать
//        this.$directive.css('display','block');
//        this.$directive.css('left', pos.left+'px');
//        this.$directive.css('top', (pos.top+0)+'px')
//    }

}
DeleteQuickButton.prototype = AbstractControl;