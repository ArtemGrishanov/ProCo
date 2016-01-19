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
    this.appProperty = appProperty;
    this.textInput = document.createElement('textInput');
    this.$parent = $parent;
    this.controlConfig = controlConfig;
    this.controlView = null;
    addDirective.call(this);
    if (this.appProperty.descriptor.domElemSelector) {
        // контрол будет жестко связан с dom элементом для редактирования
        // по клику на этот элемент будет начато редактирование (то есть не в панели)
        this.domElem = $(appIframe.contentDocument).find(this.appProperty.descriptor.domElemSelector).attr('data-app-property', this.appProperty.propertyString);
        this.domElem.click(onClick);
    }

    function onClick() {
        // подменить элемент из промоприложения на контрол для редактирования
    }

    function addDirective() {
        // info='+this.appProperty.propertyString+'
        //ng-model="data.'+this.appProperty.propertyString+'
        var $elem = $('<div '+controlConfig.angularDirectiveName+' data-app_property="'+this.appProperty.propertyString+'"></div>');
        $parent.append($elem);
    }
}

/**
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 * @param $scope
 * @param $attrs
 */
function TextQuickInputController(scope, attrs) {

    // получаем id свойства, связанного с этим контролом
    var appPropertyId = attrs.$$element.parent().attr('data-app_property');
    if (appPropertyId) {
        var p = Engine.getAppProperty(appPropertyId);
//        scope.text = p.propertyValue; // text
        // связь через модель приоритетнее
        scope.propertyValue = p.propertyValue; // text
    }

    scope.$watch(function() {
            // value for ng-model directive
            return scope.propertyValue;
        },
        function(newValue, oldValue) {
            if (oldValue !== newValue) {
                console.log('newValue: ' + newValue);
                var appPropertyId = attrs.$$element.parent().attr('data-app_property');
                if (appPropertyId) {
                    var p = Engine.getAppProperty(appPropertyId);
                    Engine.setValue(p, newValue);
                }
            }
        });

//        $http.get('controls/TextQuickInput.html').success(function(data) {
//            // текст для редактирования
//            $scope.text = 'sdjhhjhf wfjwb  nkj';// + $scope.customer;
//        });
}