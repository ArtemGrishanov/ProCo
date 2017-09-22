/**
 * Created by artyom.grishanov on 03.02.16.
 *
 * Контрол удаления, привязан к свойству массиву
 * Он отвечает за удаление элементов массива
 */
function DeleteArrayElementControl(param) {
    this.init(param);
    this._arrayValue = null;
    /**
     * индекс опции, к которой привязан этот контрол
     * этот индекс неявно находится в propertyString, например, quiz.1.answer.options.0.img (нолик в данном случае)
     * но узнать его наверняка можно только с помощью доп атрибута для контрола
     *
     * @type {number}
     * @private
     */
//    this._optionIndex = undefined;
    this.$directive.on('click', this.onDeleteButtonClick.bind(this));
}
_.extend(DeleteArrayElementControl.prototype, AbstractControl);

//DeleteArrayElementControl.prototype.setProductDomElement = function(elem) {
//    this.$productDomElement = $(elem);
//    var optionIndexAttr = this.$productDomElement.attr('data-option-index');
//    this._optionIndex = parseInt(optionIndexAttr);
//    if (isNumeric(this._optionIndex) === false) {
//        throw new Error('DeleteArrayElementControl.setProductDomElement: data-option-index attribute must be specified in productDomElement');
//    }
//};

DeleteArrayElementControl.prototype.getValue = function() {
    return this._arrayValue;
};

DeleteArrayElementControl.prototype.setValue = function(value) {
    this._arrayValue = value;
};

DeleteArrayElementControl.prototype.destroy = function() {
    this.$directive.off('click');
    this.$directive.remove();
};

DeleteArrayElementControl.prototype.onDeleteButtonClick = function() {
    this.controlEventCallback(ControlManager.EVENT_ARRAY_DELETING_REQUESTED, this, {optionIndex: this._optionIndex});
};