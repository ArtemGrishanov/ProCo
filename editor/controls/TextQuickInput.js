/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого редактирования текста "внутри" приложения.
 * View контрола сделано в виде angular-директивы.
 *
 * Главные вещи в контроле:
 * 1) appProperty которое он редактирует.
 * 2) Контроллер для angular дериктивы, для рендера контрола.
 * 3) Возможно, работает с dom элементом из промо-приложения.
 *
 * @constructor
 * @param {AppProperty} appProperty
 * @param {DOMElement} $parent
 * @param {object} controlConfig - объект из config.controls (config.js), конфигурация контрола
 */
function TextQuickInput(appProperty, $parent, controlConfig) {
    this.self = this;
    this.appProperty = appProperty;
    this.appProperty.addChangeCallback(onAppPropertyChanged.bind(this));
    this.textInput = document.createElement('textInput');
    this.$parent = $parent;
    this.controlConfig = controlConfig;
    this.$directive = addDirective.call(this);
    this.$directive.hide();
    var $e = null;
    if (this.appProperty.domElem) {
        $e = $(this.appProperty.domElem);
    }
    else if (this.appProperty.descriptor.domElemSelector) {
        // контрол будет жестко связан с dom элементом для редактирования
        // по клику на этот элемент будет начато редактирование (то есть не в панели)
        $e = $($(appIframe.contentDocument).find(this.appProperty.descriptor.domElemSelector).attr('data-app-property', this.appProperty.propertyString));
    }
    if ($e) {
        setProductDomElement.call(this, $e);
    }

    function setProductDomElement($elem) {
        this.$productDomElem = $elem;
        this.$productDomElem.click(onProductElementClick.bind(this));
        var offset = this.$productDomElem.offset();
        this.productDomElemLeft = offset.left;
        this.productDomElemTop = offset.top;
        this.productDomElemWidth = this.$productDomElem.width();
        this.productDomElemHeight = this.$productDomElem.height();
        $(appIframe.contentDocument).click(onProductIframeClick.bind(this));
    }

    /**
     * Обработчик на клик dom element в промо проекте
     */
    function onProductElementClick(e) {
        // this - инстанс TextQuickInput
        // подменить элемент из промоприложения на контрол для редактирования
        this.$productDomElem.css('visibility','hidden');
        this.show(e.clientX, e.clientY);
        // чтобы обработка клика на документ не сработала, иначе контрол закроется
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Был клик по айфрейму продукта. Скорее всего надо остановить редактирование если оно есть
     * @param {MouseEvent} e
     */
    function onProductIframeClick(e) {
        //var elem = e.target;
        //console.log(e.clientX + ' ' + e.clientY);
        this.hide();
    }

    /**
     * Элемент был привязан/обновлен в процессе работы приложения
     *
     * @param key
     */
    function onAppPropertyChanged(key) {
        if (key == 'domElement' && appProperty[key]) {
            setProductDomElement.call(this, appProperty.domElement)
        }
    }

    this.show = function(x, y) {
        this.$directive.css('top', this.productDomElemTop + 'px');
        this.$directive.css('left', this.productDomElemLeft + 'px');
        this.$directive.css('width', this.productDomElemWidth + 'px');
        this.$directive.css('height', this.productDomElemHeight + 'px');
        this.$directive.css('position','absolute');
        this.$directive.css('zIndex', config.editor.ui.quickControlsZIndex);
        this.$directive.show();
    }

    this.hide = function() {
        this.$directive.css('zIndex', 0);
        this.$directive.hide();
        this.$productDomElem.css('visibility','visible');
    }

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+controlConfig.angularDirectiveName+' data-app_property="'+this.appProperty.propertyString+'"></div>');
        $parent.append($elem);
        return $elem;
    }
}

/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 * Эта функция - общий контроллер для всех TextQuickInput
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function TextQuickInputController(scope, attrs) {
    // получаем id свойства, связанного с этим контролом
    var appPropertyId = attrs.$$element.parent().attr('data-app_property');
    if (appPropertyId) {
        var p = Engine.getAppProperty(appPropertyId);
        // scope.text = p.propertyValue;
        // связь через ng-model приоритетнее, чем шаблон {{text}}
        scope.propertyValue = p.propertyValue;
    }

    // подписка на изменение значения в ui пользователем
    scope.$watch(
        // функция возвращает значение, за которым будет установлено наблюдение
        function() {
            // value for ng-model directive
            return scope.propertyValue;
        },
        // обработчик изменений
        function(newValue, oldValue) {
            if (oldValue !== newValue) {
                console.log('newValue: ' + newValue);
                var appPropertyId = attrs.$$element.parent().attr('data-app_property');
                if (appPropertyId) {
                    var p = Engine.getAppProperty(appPropertyId);
                    Engine.setValue(p, newValue);
                }
            }
        }
    );
}