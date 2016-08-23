/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого редактирования текста "внутри" приложения.
 */
function TextQuickInput(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.onProductElementInput = function() {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, this.$productDomElement.text());
    }

    this.onPropertyChanged = function() {
        //TODO тот кто стал инициатором изменения не должен сам обрабатывать событие
        var p = Engine.getAppProperty(this.propertyString);
        if (this.$productDomElement && this.$productDomElement.text() !== p.propertyValue) {
            this.$productDomElement.text(p.propertyValue);
        }
    }

    if (this.$productDomElement) {
        this.$productDomElement.attr('contenteditable','true');
        this.$productDomElement.css('outline','none');
        this.$productDomElement.on('input', this.onProductElementInput.bind(this));
    }
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));
}

TextQuickInput.prototype = AbstractControl;

/**
 * Способ установить значение в контрол извне, с помощью автогенератора
 * @param value
 */
TextQuickInput.prototype.setControlValue = function(value) {
    if (this.$productDomElement && this.$productDomElement.text() !== value) {
        this.$productDomElement.text(value);
    }
    var p = Engine.getAppProperty(this.propertyString);
    Engine.setValue(p, value);
};