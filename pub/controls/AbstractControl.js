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
            this.directiveName != 'slidegroupcontrol' &&
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
            var control = this;
            var t = {
                run: function () {
                    var $d = $('<div></div>').load('controls/view/'+control.directiveName+'.html', (function(response, status, xhr) {
                        if (control.$parent) {
                            control.$directive = $($d.html());
                            control.$directive.attr('data-app-property',control.propertyString);
                            control.$parent.append(control.$directive);
                            callback.call(control);
                            Queue.release(this);
                        }
                    }).bind(this));
                }
            };
            var cfg = this.getControlConfig();
            if (cfg) {
                if (cfg.directiveLoadPriority !== undefined) {
                    // кастомный приоритет для некоторых директив, задается в конфиге
                    t.priority = cfg.directiveLoadPriority;
                }
            }
            else {
                log('There is not config for directive: '+this.directiveName, true);
            }
            Queue.push(t);
        }
    },

    /**
     * Получить конфигурацию контрола по его вью
     * используется this.directiveName в качестве критерия поиска
     */
    getControlConfig: function() {
        for (var controlName in config.controls) {
            if (config.controls[controlName].directives.indexOf(this.directiveName) >= 0) {
                return config.controls[controlName];
            }
        }
        return null;
    }
};
