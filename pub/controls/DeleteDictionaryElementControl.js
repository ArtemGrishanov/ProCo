/**
 * Created by artyom.grishanov on 03.02.16.
 *
 * Контрол удаления, привязан к свойству массиву
 * Он отвечает за удаление элементов массива
 */
function DeleteDictionaryElementControl(param) {
    this.init(param);
    this._arrayValue = null;
    this._onDeleteButtonClickHandler = this.onDeleteButtonClick.bind(this);
    this.$directive.on('click', this._onDeleteButtonClickHandler);
}
_.extend(DeleteDictionaryElementControl.prototype, AbstractControl);

//DeleteDictionaryElementControl.prototype.setProductDomElement = function(elem) {
//    this.$productDomElement = $(elem);
//    var optionIndexAttr = this.$productDomElement.attr('data-option-index');
//    this._optionIndex = parseInt(optionIndexAttr);
//    if (isNumeric(this._optionIndex) === false) {
//        throw new Error('DeleteDictionaryElementControl.setProductDomElement: data-option-index attribute must be specified in productDomElement');
//    }
//};

DeleteDictionaryElementControl.prototype.getValue = function() {
    return this._arrayValue;
};

DeleteDictionaryElementControl.prototype.setValue = function(value) {
    this._arrayValue = value;
};

DeleteDictionaryElementControl.prototype.destroy = function() {
    this.$directive.off('click', this._onDeleteButtonClickHandler);
    this.$directive.remove();
};

DeleteDictionaryElementControl.prototype.onDeleteButtonClick = function() {
    // выбор элемента который удалить в dictionary будет произведен в editor в обработчике
    // будет проанализирован атрибут data-dictionary-id
    this.controlEventCallback(ControlManager.EVENT_DICTIONARY_DELETING_REQUESTED, this, {});
};