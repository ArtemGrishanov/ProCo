/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления элемента в массив
 */
function AddArrayElementControl(param) {
    this.init(param);
    this._arrayValue = null;
    this.$directive.click(this.onAddQuickButtonClick.bind(this));
}
_.extend(AddArrayElementControl.prototype, AbstractControl);

AddArrayElementControl.prototype.getValue = function() {
    return this._arrayValue;
};

AddArrayElementControl.prototype.setValue = function(value) {
    this._arrayValue = value;
};

AddArrayElementControl.prototype.destroy = function() {
    this.$directive.off('click');
    this.$directive.remove();
};

AddArrayElementControl.prototype.onAddQuickButtonClick = function() {
    this.controlEventCallback(ControlManager.EVENT_ARRAY_ADD_REQUESTED, this);
};