/**
 * Created by artyom.grishanov on 16.02.16.
 *
 * Абстрактный контрол для управления свойствами AppProperty
 *
 * View контрола сделано в виде angular-директивы.
 *
 * Главные вещи в контроле:
 * 1) appProperty которое он редактирует.
 * 2) Контроллер для angular дериктивы, для рендера контрола.
 * 3) Возможно, работает с dom элементом из промо-приложения.
 */
var AbstractControl = {
    /**
     *
     * @constructor
     * @param {(Array.<string>)|(string)} propertyString одно или несколько свойств, с которыми будет работать контрол
     * @param {string} directiveName - имя вью, имя директивы angular которая его загружает
     * @param {HTMLElement} parent
     * @param {HTMLElement} productDOMElement элемент на экране промо-продукта к которому привязывается контрол
     * @param {object} params
     */
    init: function(propertyString, directiveName, parent, productDOMElement, params) {
        this.self = this;
        this.directiveName = directiveName;
        if (parent) {
            this.$parent = $(parent);
        }
        this.propertyString = propertyString;
        this.params = params;
        if (this.directiveName) {
            // в некоторых контролах нет никакой визуальной части
            this.$directive = this.addDirective();
        }
        if (productDOMElement) {
            this.$productDomElement = $(productDOMElement);
        }
    },

    /**
     * Добавить директиву в контейнер this.$parent
     * Далее она будет загружена автоматически
     *
     * @return DOMElement
     */
    addDirective: function() {
        //TODO refactor
        if (this.$parent &&
            this.directiveName != 'arraycontrol' &&
            this.directiveName != 'slide' &&
            this.directiveName != 'colorpicker' &&
            this.directiveName != 'textinput') {
            var $elem = $('<div '+this.directiveName+' data-app-property="'+this.propertyString+'"></div>');
            this.$parent.append($elem);
            return $elem;
        }
    },

    /**
     * Загружает html вьюхи и добавляет его в родительский элемент
     */
    loadDirective: function(callback) {
        if (this.directiveName) {
            var $d = $('<div></div>').load('controls/view/'+this.directiveName+'.html', (function(response, status, xhr) {
                if (this.$parent) {
                    this.$directive = $($d.html());
                    this.$directive.attr('data-app-property',this.propertyString);
                    this.$parent.append(this.$directive);
                    callback.call(this);
                }
            }).bind(this));
        }
    }
};
