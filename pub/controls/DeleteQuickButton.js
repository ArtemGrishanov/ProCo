/**
 * Created by artyom.grishanov on 03.02.16.
 *
 * Контрол удаления, привязан к свойству массиву
 * Он отвечает за удаление элементов массива
 */
function DeleteQuickButton(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    // индекс опции, к которой привязан этот контрол
    // этот индекс неявно находится в propertyString, например, quiz.1.answer.options.0.img (нолик в данном случае)
    // но узнать его наверняка можно только с помощью доп атрибута для контрола
    this.optionIndex = 0;
    var optionIndexAttr = $(productDOMElement).attr('data-option-index');
    if (Number.isInteger(parseInt(optionIndexAttr))===true) {
        this.optionIndex = parseInt(optionIndexAttr);
    }
    else {
        log('DeleteQuickButton: product dom element for this control must have \'data-option-index\' attribute', true);
    }

    this._onShow = function() {
        //TODO двойной обработчик получается, в панорамах вызывается два раза удаление одной и той же метки. Поэтому удаляются две.
        // но для теста это надо: заново устанавливать его иначе не работает
        //this.$directive.on('click', this.onDeleteQuickButtonClick.bind(this));
    };

    this.onDeleteQuickButtonClick = function() {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.deleteArrayElement(p, this.optionIndex);
    };

    this.$directive.on('click', this.onDeleteQuickButtonClick.bind(this));
}
DeleteQuickButton.prototype = AbstractControl;