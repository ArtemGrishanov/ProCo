/**
 * Created by artyom.grishanov on 23.08.17.
 */
var ControlManager = {};
(function(global) {
    var _controlsInfo = [];
    var _valueChangedCallback = null;

    /**
     * Создать контрол для свойства MutApp приложения или его экрана
     * На основе информации appProperty будет выбран ui компонент и создан его экземпляр
     *
     * @param {MutAppProperty} mutAppProperty
     * @return {Array} только что созданные контролы
     */
    function createControl(param) {
        var result = [];
        param = param || {};
        if (!param.mutAppProperty) {
            throw new Error('ControlManager.createControl: mutAppProperty does not specified!');
        }
        var propertyString = param.mutAppProperty.propertyString;
        //todo set dom element later when filtering
        var productDomElement = null; // элемент на экране продукта к которому будет привязан контрол
        for (var i = 0; i < param.mutAppProperty.controls.length; i++) {
            var controlName = null; // например Alternative или SlideGroupControl
            var viewName = null; // имя вью, который будет использован для контрола, например onoffswitcher, altbuttons и тп
            var controlAdditionalParam = {};
            var cfg = null;
            if (typeof param.mutAppProperty.controls[i] === 'string') {
                // указано только имя контрола
                controlName = param.mutAppProperty.controls[i];
                cfg = config.controls[controlName];
            }
            else {
                // объект - то есть имеет расширенное описание контрола
                controlName = param.mutAppProperty.controls[i].name;
                cfg = config.controls[controlName];
                if (!param.mutAppProperty.controls[i].view && cfg.defaultDirectiveIndex >= 0) {
                    param.mutAppProperty.controls[i].view = cfg.directives[cfg.defaultDirectiveIndex];
                }
                if (!param.mutAppProperty.controls[i].view) {
                    throw new Error('ControlManager.createControl: view for '+controlName+' does not specified in Schema');
                }
                viewName = param.mutAppProperty.controls[i].view.toLowerCase();
                if (viewName && cfg.directives.indexOf(viewName) < 0) {
                    throw new Error('ControlManager.createControl: invalid viewName name \'' + viewName + '\' in property \'' + propertyString + '\'');
                }
                controlAdditionalParam = param.mutAppProperty.controls[i].param || {};
            }
            if (!controlName) {
                throw new Error('ControlManager.createControl: can not detect control name in property \'' + propertyString + '\'');
            }
            if (!viewName) {
                // try to set default viewName
                var dirIndex = cfg.defaultDirectiveIndex;
                if (dirIndex >= 0) {
                    // некоторые контролы могут не иметь визуальной части
                    viewName = cfg.directives[dirIndex];
                }
            }

            // Container для контролов одного типа, например static_controls_cnt для type=controlpanel
            var $directiveContainer = $('#'+cfg.parentId);
            // Для некоторых контролов добавляется обертка, например static_control_cnt_template
            var $directiveWrapper = null;
            if (cfg.type === 'controlpanel') {
                $directiveWrapper = $($('#id-static_control_cnt_template').html()).appendTo($directiveContainer);
                if (param.mutAppProperty.label) {
                    var lang = (window.App) ? window.App.getLang(): 'EN';
                    var textLabel = (typeof param.mutAppProperty.label==='string')? param.mutAppProperty.label: param.mutAppProperty.label[lang];
                    if (cfg.labelInControl === true) {
                        // метка находится внутри самого контрола а не вовне как обычно, например в On/Off
                        controlAdditionalParam.label = textLabel;
                        $directiveWrapper.find('.js-label').remove();
                    }
                    else {
                        $directiveWrapper.find('.js-label').html(textLabel);
                    }
                }
            }
            else if (cfg.type === 'workspace' || cfg.type === 'quickcontrolpanel') {
                $directiveWrapper = $('<div></div>').appendTo($directiveContainer);
            }
            else {
                throw new Error('ControlManager.createControl: unknown control type \'' + cfg.type + '\'');
            }
            // на домэлемент можно повесить фильтр data-control-filter и в descriptor в параметрах также его указать
            //if (checkControlFilter(de, _controlsInfo[j].params)===true) {
                //todo разобраться когда это нужно
            //}
            // задается по параметру или по дефолту из конфига
            if (!$directiveContainer || $directiveContainer.length === 0) {
                throw new Error('ControlManager.createControl: control container does not specified \'' + cfg.parentId + '\'');
            }
            controlAdditionalParam.appIframe = param.appIframe; // some controls need app iframe
            var ctrl = new window[controlName]({
                propertyString: propertyString,
                controlName: controlName,
                directiveName: viewName,
                wrapper: $directiveWrapper,
                container: $directiveContainer,
                productDomElement: productDomElement,
                additionalParam: controlAdditionalParam,
                valueChangedCallback: _controlsValueUpdateCallback
            });
            _controlsInfo.push({
                control: ctrl
            });
            ctrl.setValue(param.mutAppProperty.getValue());
            result.push(ctrl);
        }
        return result;
    }

    /**
     * В эту функцию будут приходит сообщения об изменении значения в контроле.
     * Каждый конкретный экземпляр контрола вызывает эту функцию
     * ControlManager будет передавать это изменение дальше в редактор, а тот далее в приложение.
     *
     * @private
     * @param {AbstractControl} control
     */
    function _controlsValueUpdateCallback(control) {
        for (var i = 0; i < _controlsInfo.length; i++) {
            if (_controlsInfo[i].control === control) {
                if (_valueChangedCallback) {
                    _valueChangedCallback(control.propertyString, control.getValue());
                }
                return;
            }
        }
        throw new Error('ControlManager.controlsValueUpdateCallback: this control does not exist propertyString=\''+control.propertyString+'\'');
    }

    /**
     * Найти контрол по propertyString свойства
     *
     * @param {string} propertyString
     */
    function getControl(propertyString) {
        for (var i = 0; i < _controlsInfo.length; i++) {
            if (_controlsInfo[i].control.propertyString === propertyString) {
                return _controlsInfo[i].control;
            }
        }
        return null;
    }

    /**
     * Проверяет что для этого domElement можно создать контрол с параметрами
     * Если никаких фильтров не задано, значит можно.
     * Этот механизм используется при различных опциях ответов, для них нужны разные немного контролы. Хотя и описанные одним правилом в descriptor
     *
     * @param domElement
     * @param controlParam
     */
    function checkControlFilter(domElement, controlParam) {
        var filterAttr = $(domElement).attr('data-control-filter');
        if (filterAttr) {
            filterAttr = filterAttr.replace(new RegExp(/\s/, 'g'), '');
            var filters = filterAttr.split(',')
            for (var m = 0; m < filters.length; m++) {
                // ожидаем выражение вида key=value
                var pairs = filters[m].split('=');
                if (pairs.length==2) {
                    if (controlParam[pairs[0]]==pairs[1]) { //0=='0' должно быть равно
                        return true;
                    }
                }
            }
            // атрибут задан, но подходящего условия не нашли
            return false;
        }
        // если фильтр не указан вообще значит считаем что контрол подходит
        return true;
    }

    /**
     * Вернуть список всех контролов
     *
     * @returns {Array}
     */
    function getControls() {
        var result = [];
        for (var i = 0; i < _controlsInfo.length; i++) {
            result.push(_controlsInfo[i].control);
        }
        return result;
    }

    /**
     * Фильтрация контролов одним из способов
     *
     * @param {MutApp.Screen} param.screen - оставить только контролы, которые имеют отношение к этому экрану
     * @param {MutApp.Screen} param.domElement - оставить только контролы, связаные с этим dom элементом
     */
    function filter(param) {
        param = param || {};
        if (param.screen) {
            if (param.screen._linkedMutAppProperties) {
                // для всех свойств прилинкованных к экрану
                for (var i = 0; i < param.screen._linkedMutAppProperties.length; i++) {
                    var ap = param.screen._linkedMutAppProperties[i];
                    // найти контролы соответствующие этому свойству
                    var apControls = getControls(ap.propertyString);
                    if (!apControls || !apControls.length === 0) {
                        console.error('controlManager.filter: there is no controls for \'' + ap.propertyString + '\', but this MutAppProperty is linked to screen \'' + param.screen.id + '\'');
                    }
                    // связть контрол и элемент на экране MutApp приложения
                    for (var j = 0; j < apControls.length; j++) {
                        apControls[i].setProductDomElement(ap.uiElement);
                    }
                }
                // скрыть неиспользуемые контролы

                // добавить обработчик на каждый ap.uiElement чтобы фильтрован контролы по нему

                // может так: привязка setProductDomElement и фильтрация контролов по экрану это разные операции?

            }
            else {
                throw new Error('controlManager.filter: screen \'' + param.screen.id + '\' does not have linkedMutAppProperties');
            }
        }
    }

    global.createControl = createControl;
    global.getControlsCount = function() { return _controlsInfo.length; }
    global.find = find;
    global.getControls = getControls;
    global.getControl = getControl;
    global.setChangeValueCallback = function(clb) { _valueChangedCallback = clb; }

})(ControlManager)