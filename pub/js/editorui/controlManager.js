/**
 * Created by artyom.grishanov on 23.08.17.
 */
var ControlManager = {};
(function(global) {
    var controlsInfo = [];

    /**
     * Создать контрол для свойства MutApp приложения или его экрана
     * На основе информации appProperty будет выбран ui компонент и создан его экземпляр
     *
     * @param {MutAppProperty} mutAppProperty
     * @param {string} param.propertyString
     * @param {string} param.param.controlName - например Alternative или SlideGroupControl
     * 
     * @param {string} [param.param.controlDirectiveName] - имя вью, который будет использован для контрола, например onoffswitcher, altbuttons и тп
     * @param {object} [param.param.controlAdditionalParam]
     * @param {HTMLElement} [param.param.controlParentView] для некоторых контролов место выбирается динамически. Например для групп слайдов
     * @param {HTMLElement} [param.productDOMElement] элемент на экране продукта к которому будет привязан контрол
     * @returns {*}
     */
    function createControl(param) {
        param = param || {};
        if (param.mutAppProperty) {
            param.controlName = надо уметь создавать из свойства mutappproperty
            а для slide без такого свойства

            можно послать нафиг slide пусть сами там внутри создают в slidegroupcontaol

            учесть что может быть несколько контролов для одного свойства здесь
        }
        if (!param.controlName || !param.propertyString) {
            throw new Error('ControlManager.createControl: controlName or propertyString do not specified!');
        }
        // существует ли такой вью, если нет, берем по умолчанию
        if (param.controlDirectiveName) {
            // в случае с вью регистр важен, в конфиге директивы прописаны малым регистром
            param.controlDirectiveName = param.controlDirectiveName.toLowerCase();
        }
        if (!param.controlDirectiveName || config.controls[param.controlName].directives.indexOf(param.controlDirectiveName) < 0) {
            var dirIndex = config.controls[param.controlName].defaultDirectiveIndex;
            if (dirIndex>=0) {
                // некоторые контролы могут не иметь визуальной части
                param.controlDirectiveName = config.controls[param.controlName].directives[dirIndex];
            }
        }
        // задается по параметру или по дефолту из конфига
        var cpv = null;
        if (param.controlParentView) {
            cpv = $(param.controlParentView);
        }
        else {
            cpv = $('#'+config.controls[param.controlName].parentId);
        }
        // свойств может быть несколько, передаем массив
        var propertyStrArg = (propertyString && propertyString.indexOf(',')>=0) ? propertyString.split(','): propertyString;
        var ctrl = new window[param.controlName](propertyStrArg, param.controlDirectiveName, cpv, param.productDOMElement, param.controlAdditionalParam);
        controlsInfo.push({
            propertyString: propertyString,
            control: ctrl,
            domElement: de,
            type: config.controls[param.controlName].type
            //wrapper: wrapper ??
        });
        return ctrl;
    }

    /**
     * Найти контрол по propertyString свойства
     *
     * @param {string} propertyString
     */
    function getControl(propertyString) {
        for (var i = 0; i < controlsInfo.length; i++) {
            if (controlsInfo[i].control.propertyString === propertyString) {
                return controlsInfo[i].control;
            }
        }
        return null;
    }

    global.createControl = createControl;
    global.getControl = function() { return controls; }
    global.find = find;

})(ControlManager)