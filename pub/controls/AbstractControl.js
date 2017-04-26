/**
 * Created by artyom.grishanov on 16.02.16.
 *
 * Абстрактный контрол для управления свойствами AppProperty
 *
 * Главные вещи в контроле:
 * 1) appProperty которое он редактирует.
 * 2) view $directive
 * 3) Возможно, работает с dom элементом из промо-приложения.
 */
var AbstractControl = {

    /**
     *
     * @constructor
     * @param {(Array.<string>)|(string)} propertyString одно или несколько свойств, с которыми будет работать контрол
     * @param {string} directiveName - имя вью, имя директивы, которая его загружает
     * @param {HTMLElement} parent
     * @param {HTMLElement} productDOMElement элемент на экране промо-продукта к которому привязывается контрол
     * @param {object} params
     */
    init: function(propertyString, directiveName, parent, productDOMElement, params) {
        this.self = this;
        this.id = getUniqId().substr(22);
        this.propertyString = propertyString;
        this.params = params;
        this.__activeControls[this.id] = 1;
        this.destroyed = false;
        if (parent) {
            this.$parent = $(parent);
        }
        this.directiveName = directiveName;
        this.$directive = $(directiveLoader.getDirective(this.directiveName));
        this.$directive.attr('data-app-property', this.propertyString);
        this.$parent.append(this.$directive);
        if (productDOMElement) {
            this.$productDomElement = $(productDOMElement);
        }
    },

    /**
     * Уничтожаем контрол
     * Выставить признак уничтожения, чтобы в возможных оставшихся задачах и обработчиках стал доступен этот признак
     */
    destroy: function() {
        this.__activeControls[this.id] = 0;
        this.destroyed = true;
        if (this.$directive) {
            this.$directive.remove();
        }
    },

    __activeControls: {}
};