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
        this.destroyed = false;
        this.directiveName = directiveName;
        if (parent) {
            this.$parent = $(parent);
        }
        this.propertyString = propertyString;
        this.params = params;
        if (typeof this.params.localizeDirective !== 'boolean') {
            this.params.localizeDirective = false;
        }
//        if (this.directiveName) {
//            // в некоторых контролах нет никакой визуальной части
//            this.$directive = this.addDirective();
//        }
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
        if (this.directiveName && this.destroyed !== true) {
            var control = this;
            var t = {
                run: function () {
//                    console.log('ABSTRACT_CONTROL: '+control.propertyString+'.'+control.directiveName+' run started');
                    var $d = $('<div></div>').load(config.common.home+'controls/view/'+control.directiveName+'.html', (function(response, status, xhr) {
                        if (control.destroyed !== true) {
                            if (control.$parent) {
                                control.$directive = $($d.html());
                                if (control.params.localizeDirective === true) {
                                    App.localize(control.$directive);
                                }
                                control.$directive.attr('data-app-property',control.propertyString);
                                control.$parent.append(control.$directive);
                                callback.call(control);
//                                Queue.release(this);
                            }
                        }
                        Queue.release(this);
//                        var duration = new Date().getTime() - this.startTime;
//                        console.log('ABSTRACT_CONTROL: '+control.propertyString+'.'+control.directiveName+' DIRECTIVE LOADED. destroyed=='+control.destroyed+' Duration='+duration);
                    }).bind(this));
                },
                onFail: function() {
//                    var duration = new Date().getTime() - this.startTime;
//                    console.log('ABSTRACT_CONTROL: '+control.propertyString+'.'+control.directiveName+' ON FAIL. destroyed=='+control.destroyed+' Duration='+duration);
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
            //TODO
            if (this.directiveName === 'colorpicker') {
                t.priority = 8;
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
    },

    /**
     * Уничтожаем контрол
     * Выставить признак уничтожения, чтобы в возможных оставшихся задачах и обработчиках стал доступен этот признак
     */
    destroy: function() {
        this.destroyed = true;
        if (this.$directive) {
            this.$directive.remove();
        }
    }
};
