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
     * @param {string} controlName
     * @param {HTMLElement} wrapper
     * @param {HTMLElement} container
     * @param {HTMLElement} productDomElement элемент на экране промо-продукта к которому привязывается контрол
     * @param {object} additionalParam
     * @param {Function} valueChangedCallback - ссылка на функцию куда надо отправлять уведомление об изменении
     */
    init: function(param) {
        this.self = this;
        this.id = getUniqId().substr(22);
        if (param.propertyString) {
            this.propertyString = param.propertyString;
        }
        else {
            throw new Error('AbstractControl.init: propertyString does not specified');
        }
        if (param.controlName) {
            this.controlName = param.controlName;
        }
        else {
            throw new Error('AbstractControl.init: controlName does not specified');
        }
        this.additionalParam = param.additionalParam;
        this.destroyed = false;
        if (param.wrapper) {
            this.$wrapper = $(param.wrapper);
        }
        else {
            throw new Error('AbstractControl.init: wrapper does not specified');
        }
        if (param.container) {
            this.$container = $(param.container);
        }
        if (param.directiveName) {
            this.directiveName = param.directiveName;
            this.$directive = $(directiveLoader.getDirective(this.directiveName));
            this.$directive.attr('data-app-property', this.propertyString);
            this.$wrapper.append(this.$directive);
        }
        else {
            //there are may be controls without directive
            //throw new Error('AbstractControl.init: directiveName does not specified');
        }
        if (param.productDomElement) {
            this.$productDomElement = $(param.productDomElement);
            this.$productDomElement.on('paste', this.handlePaste.bind(this));
        }
        else {
            this.$productDomElement = null;
        }
        this.valueChangedCallback = param.valueChangedCallback;
    },

    /**
     * Каждый контрол должен уметь возвращать свое значение
     *
     * @returns {*}
     */
    getValue: function() {
        //todo
        return undefined;
    },

    /**
     * Каждый контрол должен реализовать установку значения
     */
    setValue: function(value) {
        //todo
    },

    /**
     * Обработать сообщение из MutApp приложения.
     * Контрол не подписан напрямую на сообщения из приложения.
     * Событие пробрасывается через контроллер в редакторе, и далее в ControlManager
     *
     * @param {string} event
     * @param {object} data
     */
    handleEvent: function(event, data) {

    },

    /**
     * Фильтрация html, чтобы вставить только текст
     *
     * http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
     *
     * @param {event} e
     */
    handlePaste: function(e) {
        var clipboardData, pastedData;
        // Stop data actually being pasted into div
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        // Get pasted data via clipboard API
        clipboardData = e.originalEvent.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');
        // Do whatever with pasteddata
        this.$productDomElement.text(pastedData);
        if (this.onPaste) {
            // дать возможность наследникам сделать собственную обработку вставки, например сохранить в appProperty значение
            this.onPaste();
        }
    },

    /**
     * Каждый контрол должен реализовать логику уничтожения себя, не забыть про ui-листенеры
     */
    destroy: function(value) {
        //todo
    }
};