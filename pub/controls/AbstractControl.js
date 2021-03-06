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
     * @param {string} type - тип, например 'controlpanel' или 'workspace', тот что описан в config.js
     */
    init: function(param) {
        this.self = this;
        this.id = getUniqId().substr(22);
        if (param.type) {
            this.type = param.type;
        }
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

        // параметр отвечающий за сортировку контролов в их контейнерах
        this.sortIndex = 0;
        if (isNumeric(param.sortIndex) === true) {
            this.sortIndex = param.sortIndex;
        }

        // Возможность скрыть и деактивировать контрол полностью, он не фильтруется
        this.disabled = false;

        // экспериментальное свойство, применяется только для quickpanelcontrols
        this.cursorEnabled = true;

        // экспериментальное свойство, применяется только для quickpanelcontrols
        this.delimeterAfter = false;
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
            // обработка копипасты переехади в TextQuickInput и поддерживается только там
            // this.$productDomElements[n].on('paste', this.handlePaste.bind(this));
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
     *
     * @param {DomElement} [param.selectedElement] - опционально, элемент выделенный на экране в данный момент.
     */
    show: function(param) {
        param = param || {};
        this.$wrapper.show();
        if (this.onShow) {
            // можно определить функцию которая будет вызываться при показе контрола
            this.onShow({
                selectedElement: param.selectedElement
            });
        }
    },

    /**
     * Скрыть контрол
     */
    hide: function() {
        this.$wrapper.hide();
        if (this.onHide) {
            // можно определить функцию которая будет вызываться при скрытии контрола
            this.onHide();
        }
    },

    /**
     * Отключить контрол
     * Фильтроваться он не будет, ControlManaget это учитывает
     */
    disable: function() {
        this.disabled = true;
        this.hide();
    },

    /**
     * Каждый контрол должен реализовать логику уничтожения себя, не забыть про ui-листенеры
     */
    destroy: function(value) {
        //todo
    }
};