/**
 * Created by artyom.grishanov on 23.08.17.
 *
 * Менеджер контролов:
 * 1) создание контролов для MutAppProperty и хранение
 * 2) Оповещение если контрол изменил свое значение
 * 2) Фильтрация (скрытие и показ контролов по условиям)
 * 3) Обработка показа разных экранов: поддержание связи между контролами и uiElements на экране приложения
 *
 *
 */
var ControlManager = {
    EVENT_CHANGE_VALUE: 'ControlManager.EVENT_CHANGE_VALUE',
    EVENT_FILTER_CHANGED: 'ControlManager.EVENT_FILTER_CHANGED',
    EVENT_DICTIONARY_ADD_REQUESTED: 'ControlManager.EVENT_DICTIONARY_ADD_REQUESTED',
    EVENT_DICTIONARY_DELETING_REQUESTED: 'ControlManager.EVENT_DICTIONARY_DELETING_REQUESTED'
};


(function(global) {
    var _controls = [];
    var _onControlEvents = null;
    var _filterValue = {};

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
        //dom element is set later when filtering
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
            if (!cfg) {
                throw new Error('ControlManager.createControl: can not find info for control \'' + controlName + '\' in config.js');
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
            var $directiveContainer = null;
            if (cfg.type === 'quickcontrolpanel') {
                $directiveContainer = $('#id-control_cnt').find('.js-quick_panel .js-items');
            }
            else {
                $directiveContainer = (param.mutAppProperty._controlFilter === 'always') ? $('#id-static-no_filter_controls') : $('#'+cfg.parentId);
            }
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
            else if (cfg.type === 'workspace' || cfg.type === 'popup') {
                $directiveWrapper = $('<div></div>').appendTo($directiveContainer);
            }
            else if (cfg.type === 'quickcontrolpanel') {
                $directiveWrapper = $('<div class="qp_item"></div>').appendTo($directiveContainer);
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
                controlFilter: param.mutAppProperty._controlFilter,
                controlFilterScreenCriteria: param.mutAppProperty._controlFilterScreenCriteria,
                controlEventCallback: _controlsValueUpdateCallback
            });
            _controls.push(ctrl);
            filter({
                // применить фильтр для созданного контрола
                controls: [ctrl]
            });
            ctrl.setValue(param.mutAppProperty.getValue());
            result.push(ctrl);
        }
        return result;
    }

    /**
     * Удалить контрол, так как удаляется свойство в приложении
     *
     * @param {MutAppProperty} mutAppProperty
     * @return {Array} только что удаленные контролы
     */
    function deleteControl(param) {
        var result = [];
        param = param || {};
        if (!param.mutAppProperty) {
            throw new Error('ControlManager.deleteControl: mutAppProperty does not specified!');
        }
        var ctrls = getControls({propertyString: param.mutAppProperty.propertyString});
        for (var i = 0; i < ctrls.length; i++) {
            var delIdx = _controls.indexOf(ctrls[i]);
            _controls.splice(delIdx, 1);
            ctrls[i].destroy();
            ctrls[i].$wrapper.remove();
            result.push(ctrls[i]);
        }
        return result;
    }

    /**
     * В эту функцию будут приходит сообщения об изменении значения в контроле.
     * Каждый конкретный экземпляр контрола вызывает эту функцию
     * ControlManager будет передавать это изменение дальше в редактор, а тот далее в приложение.
     *
     * @private
     *
     * @param {string} event
     * @param {AbstractControl} control
     * @param {object} data additional information from control
     */
    function _controlsValueUpdateCallback(event, control, data) {
        // здесь делается проверка, что колбек вызвал действительно активный контрол, который сейчас есть в списке, а не какой-то контрол-зомби
        for (var i = 0; i < _controls.length; i++) {
            if (_controls[i] === control) {
                // убедились что контрол действительно сущестует и активен
                if (_onControlEvents) {
                    var controlEventData = {
                        propertyString: control.propertyString,
                        value: control.getValue()
                    };
                    if (data) {
                        // если контрол прислал дополнительные данные, передаем из дальше в editor
                        // например, DeleteDictionaryElementControl шлет optionIndex
                        for (var key in data) {
                            if (data.hasOwnProperty(key) === true) {
                                controlEventData[key] = data[key];
                            }
                        }
                    }
                    _onControlEvents(event, controlEventData);
                }
                return;
            }
        }
        throw new Error('ControlManager.controlsValueUpdateCallback: this control does not exist, propertyString=\''+control.propertyString+'\'');
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
     * Вернуть список всех контролов, либо контролов для указанной propertyString
     *
     * @param {string} param.propertyString - опциональный критерий
     * @returns {Array} массив контролов
     */
    function getControls(param) {
        param = param || {};
        var result = null;
        for (var i = 0; i < _controls.length; i++) {
            if (!param.propertyString || _controls[i].propertyString === param.propertyString) {
                result = result || [];
                result.push(_controls[i]);
            }
        }
        return result;
    }

    /**
     * Очистить фильтр.
     * Будут показаны только контролы типа 'always' по умолчанию
     */
    function clearFilter() {
        filter({
            screen: null,
            propertyStrings: null
        });
    }

    /**
     * Фильтрация контролов одним из способов
     *
     * @param {Array<AbstractControl>} [controls] - опционально, контролы к которым применить фильтрацию
     * @param {MutApp.Screen} param.screen
     * @param {Array<string>} param.propertyStrings
     */
    function filter(param) {
        param = param || {};
        param.controls = param.controls || _controls; // контролы из этого массива будем фильтровать
        if (param.hasOwnProperty('screen') === true) { // может быть и null
            _filterValue.screen = param.screen;
        }
        if (param.hasOwnProperty('propertyStrings') === true) { // может быть и null
            _filterValue.propertyStrings = param.propertyStrings;
        }
        // признак того, что контролы из quick panel попали в фильтр и их надо показывать
        var quickControlsFiltered = false;
        // признак того, что контролы popup типа попали в фильтр и их надо показывать
        var controlPopupFiltered = false;
        for (var i = 0; i < param.controls.length; i++) {
            var c = param.controls[i];
            var needShow = false;
            if (c.controlFilter === 'always') {
                needShow = true;
            }
            else if (c.controlFilter === 'screen' && c.controlFilterScreenCriteria &&
                _filterValue.screen && _filterValue.screen[c.controlFilterScreenCriteria.key] === c.controlFilterScreenCriteria.value) {
                needShow = true;
            }
            else if (_filterValue.propertyStrings && _filterValue.propertyStrings.indexOf(c.propertyString) >= 0) {
                needShow = true;
            }
            else if (c.controlFilter === 'screenPropertyString' && _screenHasDataFilter(_filterValue.screen, c.propertyString) === true) {
                needShow = true;
            }
            if (needShow === true) {
                if (config.controls[c.controlName].type === 'quickcontrolpanel') {
                    quickControlsFiltered = true;
                }
                if (config.controls[c.controlName].type === 'popup') {
                    controlPopupFiltered = true;
                }
                c.show()
            }
            else {
                c.hide();
            }
        }
        if (_onControlEvents) {
            _onControlEvents(ControlManager.EVENT_FILTER_CHANGED, {
                propertyStrings: _filterValue.propertyStrings,
                screen: _filterValue.screen,
                quickControlsFiltered: quickControlsFiltered,
                controlPopupFiltered: controlPopupFiltered
            });
        }
    }

    /**
     * Проверить содержит ли экран элемент с атрибутом data-filter в котором есть propertyString
     *
     * @param screen
     * @param propertyString
     * @returns {boolean}
     * @private
     */
    function _screenHasDataFilter(screen, propertyString) {
        var dataFltrElm = screen.$el.find('[data-filter]');
        dataFltrElm.push(screen.$el);
        for (var i = 0; i < dataFltrElm.length; i++) {
            var dataFltrStr = $(dataFltrElm[i]).attr('data-filter');
            if (dataFltrStr && dataFltrStr.indexOf(propertyString) >= 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * ControlManager обрабатывает показ экрана
     * 1) Связать контрол и соответствующий uiElement на экране приложения
     *
     * @param param.screen
     */
    function handleShowScreen(param) {
        param = param || {};
        if (param.screen) {
            if (param.screen._linkedMutAppProperties) {
                // для всех свойств прилинкованных к экрану
                for (var i = 0; i < param.screen._linkedMutAppProperties.length; i++) {
                    var ap = param.screen._linkedMutAppProperties[i];
                    // найти контролы
                    var apControls = getControls({
                        propertyString: ap.propertyString
                    });
                    if (!apControls || !apControls.length === 0) {
                        console.error('controlManager.handleShowScreen: there is no controls for \'' + ap.propertyString + '\', but this MutAppProperty is linked to screen \'' + param.screen.id + '\'');
                        continue;
                    }
                    // связать контрол и элемент на экране MutApp-приложения
                    for (var j = 0; j < apControls.length; j++) {
                        // элементы на экране param.screen связнные со свойством (может быть несколько)
                        var linkedElems = ap.getLinkedElementsOnScreen(param.screen.id);
                        apControls[j].setProductDomElement(linkedElems);
                    }
                }
            }
            else {
                throw new Error('controlManager.handleShowScreen: screen \'' + param.screen.id + '\' does not have linkedMutAppProperties');
            }
        }
        else {
            throw new Error('controlManager.handleShowScreen: screen does not specified');
        }
    }

    /**
     * Найти контрол по строке, поиск будет производиться по нескольким полям.
     * Надо для отладки, очень удобно
     *
     * @param {string} str
     */
    function find(str) {
        var results1 = [];
        var results2 = [];
        var results3 = [];
        for (var i = 0; i < _controls.length; i++) {
            var ci = _controls[i];
            if (ci.propertyString.indexOf(str) >= 0) {
                // самый релевантный поиск по ключу: propertyString
                results1.push(ci);
            }
            else {
                if (ci.controlName && ci.controlName.indexOf(str) >= 0) {
                    // менее релевантный поиск - имя контрола
                    results3.push(ci);
                }
                else {
                    if (ci.directiveName && ci.directiveName.toLowerCase().indexOf(str.toLowerCase()) >= 0) {
                        // третья степерь релевантности: имя директивы
                        results2.push(ci);
                    }
                }
            }
        }
        return results1.concat(results2).concat(results3);
    }

    /**
     *
     * @param {function} param.onControlEvents
     */
    function init(param) {
        param = param || {};
        _onControlEvents = param.onControlEvents;
    }

    global.init = init;
    global.createControl = createControl;
    global.deleteControl = deleteControl;
    global.getControlsCount = function() { return _controls.length; }
    // global.find = find;
    global.getControls = getControls;
    global.filter = filter;
    global.clearFilter = clearFilter;
    global.handleShowScreen = handleShowScreen;
    global.find = find;
    global.getFilter = function() { return _filterValue; }
    global._screenHasDataFilter = _screenHasDataFilter; // for qunit tests

})(ControlManager)