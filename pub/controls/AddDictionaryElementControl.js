/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол добавления элемента в массив
 */
function AddDictionaryElementControl(param) {
    this.init(param);
    this._arrayValue = null;
    this.$directive.click(this.onAddQuickButtonClick.bind(this));
}
_.extend(AddDictionaryElementControl.prototype, AbstractControl);

AddDictionaryElementControl.prototype.getValue = function() {
    return this._arrayValue;
};

AddDictionaryElementControl.prototype.setValue = function(value) {
    this._arrayValue = value;
};

AddDictionaryElementControl.prototype.destroy = function() {
    this.$directive.off('click');
    this.$directive.remove();
};

AddDictionaryElementControl.prototype.onAddQuickButtonClick = function() {
    /**
     * Возможность указать имя прототипа для свойства, чтобы не приходилось выбирать.
     * Например если на слайде текстовые опции то логично добавлять только текстовые прототипы, а не фото
     * Клиентское приложение может выставлять такой атрибут при рендере
     * @type {string}
     */
    var defaultPrototypeName = this.$productDomElements[0].attr('data-prototype-name') || null;
    this.controlEventCallback(ControlManager.EVENT_DICTIONARY_ADD_REQUESTED, this, {
        prototypeName: defaultPrototypeName
    });
};