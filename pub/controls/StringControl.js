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

    this.loadDirective(function(response, status, xhr){
        this.$input = this.$directive.find('[type="text"]');
        var p = Engine.getAppProperty(this.propertyString);
        this.$input.val(p.propertyValue);
    });

    this.onPropertyChanged = function() {
        if (this.$input) {
            var v = this.$input.val() || null;
            var p = Engine.getAppProperty(this.propertyString);
            if (p.propertyValue !== v) {
                this.$input.val(p.propertyValue);
            }
        }
    };

    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));

    // в случае колорпикера только используя таймер можно отлавливать изменения поля. События не срабатывают
    setInterval((function(){
        if (this.$input) {
            var p = Engine.getAppProperty(this.propertyString);
            var v = this.$input.val() || null;
            if (p.propertyValue !== v) {
                Engine.setValue(p, v);
            }
        }
    }).bind(this), 500);
}

StringControl.prototype = AbstractControl;

/**
 * Способ установить значение в контрол извне, с помощью автогенератора
 * @param value
 */
StringControl.prototype.setControlValue = function(value) {
    if (this.$input && this.$input.val() !== value) {
        this.$input.val(value);
    }
    var p = Engine.getAppProperty(this.propertyString);
    Engine.setValue(p, value);
};