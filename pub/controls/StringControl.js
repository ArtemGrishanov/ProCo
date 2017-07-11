/**
 * Created by artyom.grishanov on 10.02.16.
 *
 * Контрол управления строкой
 * Это может быть: цвет, url, текст
 */
function StringControl(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    /**
     * Поле ввода для текста в контроле
     * @type {null}
     */
    this.$input = null;
    /**
     * Признак того, что значение поля будет апдейтится по таймеру. Либо при нажатии enter и потере фокуса
     * @type {boolean}
     */
    this.changeOnTimer = (params.hasOwnProperty('changeOnTimer')) ? !!params.changeOnTimer : true;

    /**
     * Событие при нажатии Enter
     */
    this.onInputKeyUp = function(e) {
        if (this.changeOnTimer !== true) {
            if (e.keyCode == 13) {
                this.setValueToEngine();
            }
        }
    };

    /**
     * Событие при сбросе фокуса с инпута
     */
    this.onInputFocusOut = function(e) {
        if (this.changeOnTimer !== true) {
            this.setValueToEngine();
        }
    };

    /**
     * Свойство было изменено в движке. Включая и случай изменения этим же контролом.
     */
    this.onPropertyChanged = function() {
        if (this.$input) {
            var v = this.$input.val() || null;
            var p = Engine.getAppProperty(this.propertyString);
            if (p.propertyValue !== v) {
                this.$input.val(p.propertyValue);
            }
        }
    };

    this.setValueToEngine = function() {
        if (this.$input) {
            var p = Engine.getAppProperty(this.propertyString);
            var v = this.$input.val() || null;
            if (p) {
                if (p.propertyValue !== v) {
                    Engine.setValue(p, v);
                }
            }
            else {
                log('StringControl.setValueToEngine: It seems it\'s a zoombir control, appProperty not found for ' + this.propertyString, true);
            }
        }
    };

    /**
     * Способ установить значение в контрол извне, с помощью автогенератора
     * @param value
     */
    this.setControlValue = function(value) {
        if (this.$input && this.$input.val() !== value) {
            this.$input.val(value);
        }
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, value);
    };

//    /**
//     *
//     * @param ap
//     * @returns {propertyValue|*|propertyValue}
//     */
//    this.getFormattedValue = function(ap) {
//        var formattedValue = ap.propertyValue;
//        if (ap.cssValuePattern && ap.cssValuePattern.indexOf('{{number}}')>=0) {
//            // example: '{{number}}px'
//            formattedValue = parseInt(formattedValue).toString();
//        }
//        return formattedValue;
//    };

    this.$input = this.$directive.find('[type="text"]');
    var p = Engine.getAppProperty(this.propertyString);
    this.$input.val(p.propertyValue);
    this.$input.keyup(this.onInputKeyUp.bind(this));
    this.$input.focusout(this.onInputFocusOut.bind(this));

    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));

    if (this.changeOnTimer === true) {
        // в случае колорпикера только используя таймер можно отлавливать изменения поля. События не срабатывают
        setInterval((function(){
            this.setValueToEngine();
        }).bind(this), 500);
    }
}

StringControl.prototype = AbstractControl;