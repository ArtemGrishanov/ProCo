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
     * @param {string} controlFilter
     * @param {string} controlFilterScreenCriteria
     * @param {Function} controlEventCallback - ссылка на функцию куда надо отправлять уведомление об изменении
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
        if (param.controlFilter) {
            this.controlFilter = param.controlFilter;
            if (param.controlFilterScreenCriteria) {
                this.controlFilterScreenCriteria = param.controlFilterScreenCriteria;
            }
        }
        else {
            throw new Error('AbstractControl.init: controlFilter does not specified');
        }
        if (param.productDomElement) {
            this.setProductDomElement(param.productDomElement);
        }
        else {
            this.$productDomElements = null;
        }
        this.controlEventCallback = param.controlEventCallback;
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
     * Связать хтмл элемент(элементы) из приложения с этим контролом
     * @param {domElement | Array} elements
     */
    setProductDomElement: function(elements) {
        this.$productDomElements = Array.isArray(elements) ? elements: [elements];
        for (var n = 0; n < this.$productDomElements.length; n++) {
            this.$productDomElements[n] = $(this.$productDomElements[n]);
            this.$productDomElements[n].on('paste', this.handlePaste.bind(this));
        }
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
     * Проверить виден ли контрол
     * @returns {boolean}
     */
    isShown: function() {
        // допущение: мы оперируем только 'none' & 'block', не учитывая visibility
        return this.$wrapper.css('display') !== 'none';
    },

    /**
     * Показать контрол
     */
    show: function() {
        this.$wrapper.show();
    },

    /**
     * Скрыть контрол
     */
    hide: function() {
        this.$wrapper.hide();
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
        if (this.$productDomElements) {
            for (var n = 0; n < this.$productDomElements.length; n++) {
                this.$productDomElements[n].text(pastedData);
            }
        }
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