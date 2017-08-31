/**
 * Created by artyom.grishanov on 10.02.16.
 *
 * Контрол управления строкой
 * Это может быть: цвет, url, текст
 */
function StringControl(param) {
    this.init(param);
    /**
     * Поле ввода для текста в контроле
     * @type {null}
     */
    this.$input = null;
    this.inputValue = undefined;
    this.colorpicker = null;

    /**
     * Событие при нажатии Enter
     */
    this.onInputKeyUp = function(e) {
        if (this.changeOnTimer !== true) {
            if (e.keyCode == 13) {
                this.checkValue();
            }
        }
    };

    /**
     * Событие при сбросе фокуса с инпута
     */
    this.onInputFocusOut = function(e) {
        this.checkValue();
    };

    /**
     * Проверить что значение в поле ввода действительно изменилось и тогда вызвать колбек об уведомлении
     */
    this.checkValue = function() {
        if (this.$input) {
            var inpv = (this.colorpicker) ? this.colorpicker.toHEXString(): this.$input.val();
            if (this.inputValue !== inpv) {
                this.inputValue = inpv;
                this.valueChangedCallback(this);
            }
        }
    };

    /**
     * Событие на изменение значения в колорпикере
     * То есть не обязательно закрывать колорпикер (событие onInputFocusOut) чтобы сменить цвет
     */
    this.onColorpickerChange = function() {
        this.checkValue();
    };

    this.$input = this.$directive.find('input');
    this.$input.keyup(this.onInputKeyUp.bind(this));
    this.$input.focusout(this.onInputFocusOut.bind(this));
    if (this.$directive.hasClass('js-colorpicker') === true && window.jscolor) {
        // подключаем компонент выбора цвета
        this.colorpicker = new jscolor(this.$input[0]);
        this.$input.change(this.onColorpickerChange.bind(this));
    }
}
_.extend(StringControl.prototype, AbstractControl);

StringControl.prototype.getValue = function() {
    if (this.colorpicker) {
        // если использован колопикер, то правильнее брать цвет из него сразу в нужном формате
        return this.colorpicker.toHEXString();
    }
    return this.$input.val();
};

StringControl.prototype.setValue = function(value) {
    if (typeof value === 'string' || value === null || value === undefined) {
        if (value === undefined || value === null) {
            value = '';
        }
        this.inputValue = value;
        if (this.colorpicker) {
            this.colorpicker.fromString(value);
        }
        else {
            this.$input.val(value);
        }
    }
    else {
        throw new Error('StringControl.setValue: unsupported value type');
    }
};

StringControl.prototype.destroy = function() {
    this.colorpicker = null;
    this.$input.off();
    this.$directive.remove();
};