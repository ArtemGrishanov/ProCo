/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол типа Вкл/Выкл
 * Хорошо подходит для редактирования свойства типа boolean
 */
function OnOff(param) {
    this.init(param);

    // каждый переключатель требует свой уникальный ид, так работает этот bootstrap компонент
    var switcherId = Math.random().toString();
    this.$directive.find('input').attr('id',switcherId);
    this.$directive.find('label').attr('for',switcherId);
    this.$checkbox = this.$directive.find('[type="checkbox"]');
    this.$checkbox.on('change', this.onCheckboxChange.bind(this));
    this.label = (this.additionalParam.label) ? this.additionalParam.label: 'Off/On';
    if (this.label) {
        this.$directive.find('.js-label').text(this.label);
    }
}
_.extend(OnOff.prototype, AbstractControl);

OnOff.prototype.onCheckboxChange = function() {
    var v = this.$checkbox.prop('checked');
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};

OnOff.prototype.getValue = function() {
    return this.$checkbox.prop('checked');
};

OnOff.prototype.setValue = function(value) {
    if (typeof value === 'boolean') {
        if (this.getValue() !== value) {
            this.$checkbox.prop('checked', value);
        }
    }
    else {
        throw new Error('OnOff.setValue: unsupported value type');
    }
};

OnOff.prototype.destroy = function() {
    this.$checkbox.off();
    this.$directive.remove();
};