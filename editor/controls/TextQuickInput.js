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
 * @param {string} propertyString
 * @param {string} directiveName - имя вью, имя директивы angular которая его загружает
 * @param {HTMLElement} $parent
 * @param {string} name
 * @param {object} params
 */
function TextQuickInput(propertyString, directiveName, $parent, name, params) {
    this.self = this;
    this.directiveName = directiveName;
    this.name = name;
    this.params = params;
    this.propertyString = propertyString;
    this.$parent = $parent;
//    this.textInput = document.createElement('textInput');
//    this.$parent = $parent;
//    this.controlConfig = controlConfig;
//    this.$directive = addDirective.call(this);
//    this.$directive.hide();
    // подписка на изменение AppProperty по ключу
//    Engine.on('AppPropertyInited', this.propertyString, init.bind(this));
//    Engine.on('DOMElementChanged', this.propertyString, init.bind(this));

    this.onProductElementInput = function() {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, this.$productDomElem.text(), {
            updateScreens: false
        });
    }

    this.onPropertyChanged = function() {
        //TODO тот кто стал инициатором изменения не должен сам обрабатывать событие
        var p = Engine.getAppProperty(this.propertyString);
        if (this.$productDomElem && this.$productDomElem.text() !== p.propertyValue) {
            this.$productDomElem.text(p.propertyValue);
        }
    }

    this.setProductDomElement = function(elem) {
        this.$productDomElem = $(elem);
        this.$productDomElem.attr('contenteditable','true');
        this.$productDomElem.css('outline','none');
        this.$productDomElem.on('input', this.onProductElementInput.bind(this));
//        this.$productDomElem.click(onProductElementClick.bind(this));
//        var offset = this.$productDomElem.offset();
//        this.productDomElemLeft = offset.left;
//        this.productDomElemTop = offset.top;
//        this.productDomElemWidth = this.$productDomElem.width();
//        this.productDomElemHeight = this.$productDomElem.height();
//        $(document).click(onDocumentClick.bind(this));
    }

    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));

//    var p = Engine.getAppProperty(this.propertyString);
//    var $e = null;
//    if (p.domElem) {
//        $e = $(p.domElem);
//    }
//    else if (p.descriptor.domElemSelector) {
//        // контрол будет жестко связан с dom элементом для редактирования
//        // по клику на этот элемент будет начато редактирование (то есть не в панели)
//        $e = $($(appIframe.contentDocument).find(p.descriptor.domElemSelector));
//    }
//    if ($e) {
//        this.setProductDomElement($e);
//    }

//    /**
//     * Обработчик на клик dom element в промо проекте
//     */
//    function onProductElementClick(e) {
//        // this - инстанс TextQuickInput
//        // подменить элемент из промоприложения на контрол для редактирования
//        this.$productDomElem.css('visibility','hidden');
//        this.show(e.clientX, e.clientY);
//        // чтобы обработка клика на документ не сработала, иначе контрол закроется
//        e.preventDefault();
//        e.stopPropagation();
//    }

//    /**
//     * Был клик по айфрейму продукта. Скорее всего надо остановить редактирование если оно есть
//     * @param {MouseEvent} e
//     */
//    function onDocumentClick(e) {
//        //var elem = e.target;
//        //console.log(e.clientX + ' ' + e.clientY);
//        this.hide();
//    }

//    /**
//     * Элемент был привязан/обновлен в процессе работы приложения
//     *
//     * @param key
//     */
//    function onAppPropertyChanged(key) {
//        if (key == 'domElement' && appProperty[key]) {
//            setProductDomElement.call(this, appProperty.domElement)
//        }
//    }

//    this.show = function(x, y) {
//        this.$directive.css('top', this.productDomElemTop + 'px');
//        this.$directive.css('left', this.productDomElemLeft + 'px');
//        this.$directive.css('width', this.productDomElemWidth + 'px');
//        this.$directive.css('height', this.productDomElemHeight + 'px');
//        this.$directive.css('position','absolute');
//        this.$directive.css('zIndex', config.editor.ui.quickControlsZIndex);
//        this.$directive.show();
//    }
//
//    this.hide = function() {
//        this.$directive.css('zIndex', 0);
//        this.$directive.hide();
//        this.$productDomElem.css('visibility','visible');
//    }

    /**
     * Добавить директиву в контейнер this.$parent
     *
     * @return DOMElement
     */
    function addDirective() {
        var $elem = $('<div '+this.directiveName+' data-app-property="'+this.propertyString+'"></div>');
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
//    // получаем id свойства, связанного с этим контролом
//    var appPropertyId = attrs.$$element.parent().attr('data-app-property');
//    if (appPropertyId) {
//        var p = Engine.getAppProperty(appPropertyId);
//        // scope.text = p.propertyValue;
//        // связь через ng-model приоритетнее, чем шаблон {{text}}
//        scope.propertyValue = p.propertyValue;
//    }
//
//    // подписка на изменение значения в ui пользователем
//    scope.$watch(
//        // функция возвращает значение, за которым будет установлено наблюдение
//        function() {
//            // value for ng-model directive
//            return scope.propertyValue;
//        },
//        // обработчик изменений
//        function(newValue, oldValue) {
//            if (oldValue !== newValue) {
//                console.log('newValue: ' + newValue);
//                var appPropertyId = attrs.$$element.parent().attr('data-app-property');
//                if (appPropertyId) {
//                    var p = Engine.getAppProperty(appPropertyId);
//                    Engine.setValue(p, newValue);
//                }
//            }
//        }
//    );
}