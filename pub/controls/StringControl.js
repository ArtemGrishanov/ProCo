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
    this._isFocus = false;

    this.$input = this.$directive.find('input');
    this._onInputKeyUpHandler = this.onInputKeyUp.bind(this);
    this.$input.keyup(this._onInputKeyUpHandler);
    this._onInputFocusOut = this.onInputFocusOut.bind(this);
    this.$input.focusout(this._onInputFocusOut);
    this._onInputFocusIn = this.onInputFocusIn.bind(this)
    this.$input.focusin(this._onInputFocusIn);
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
        if (this._isFocus === false) {
            // пока пользователь находится в поле ввода не надо сбивать его курсор и переустанавливать значение
            // после ввода пользователя в инпуте может остаться всякий мусор, даже пустое поле, если пользователь все стер
            // но главное что в приложении будет корректное нормализованное значение
            if (this.colorpicker) {
                this.colorpicker.fromString(value);
            }
            else {
                this.$input.val(value);
            }
        }
    }
    else {
        throw new Error('StringControl.setValue: unsupported value type');
    }
};

StringControl.prototype.destroy = function() {
    this.colorpicker = null;
    this.$input.off('keyup', this._onInputKeyUpHandler);
    this.$input.off('focusout', this._onInputFocusOut);
    this.$input.off('focusin', this._onInputFocusIn);
    this.$directive.remove();
};

/**
 * Событие при нажатии Enter
 */
StringControl.prototype.onInputKeyUp = function(e) {
    this.checkValue();
};

/**
 * Событие при сбросе фокуса с инпута
 */
StringControl.prototype.onInputFocusOut = function(e) {
    this._isFocus = false;
    this.checkValue();
};

/**
 * Событие при сбросе фокуса с инпута
 */
StringControl.prototype.onInputFocusIn = function(e) {
    this._isFocus = true;
};

/**
 * Проверить что значение в поле ввода действительно изменилось и тогда вызвать колбек об уведомлении
 */
StringControl.prototype.checkValue = function() {
    if (this.$input) {
        var inpv = (this.colorpicker) ? this.colorpicker.toHEXString(): this.$input.val();
        if (this.inputValue !== inpv) {
            this.inputValue = inpv;
            this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
        }
    }
};

/**
 * Событие на изменение значения в колорпикере
 * То есть не обязательно закрывать колорпикер (событие onInputFocusOut) чтобы сменить цвет
 */
StringControl.prototype.onColorpickerChange = function() {
    this.checkValue();
};