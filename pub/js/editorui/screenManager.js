/**
 * Created by artyom.grishanov on 01.09.17.
 */

var screenManager = {};

// showScreen

// toDesktopPreview

// toMobilePreview

// createScreenControls

function showScreen(screenIds) {
    //todo

    //привязка элементов на экране приложения и контролов
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
        // todo добавить обработчик на каждый ap.uiElement чтобы фильтрован контролы по нему
    }
    else {
        throw new Error('controlManager.filter: screen \'' + param.screen.id + '\' does not have linkedMutAppProperties');
    }
}