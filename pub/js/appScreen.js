/**
 * Created by artyom.grishanov on 16.08.16.
 *
 * @param {MutApp.Screen} view
 */
var AppScreen = function(view) {
    /**
     * MutApp screen
     */
    this.view = view;
    if (!!view.id===false) {
        log('AppScreen: view must have the id', true);
    }
    this.id = view.id;
    /**
     * propertyString-domElement pairs on this screen
     * @type {Array}
     */
    this.appPropertyElements = [];
    this.hints = [];
    /**
     * Признак группировки в контроле
     * @type {*}
     */
    this.group = view.group;
    /**
     * Название показываемое рядом с экраном
     * @type {*}
     */
    this.name = view.name;
    /**
     * Схлопывание экранов в один контрол
     * @type {*}
     */
    this.collapse = view.collapse;
    this.canAdd = view.canAdd;
    this.canDelete = view.canDelete;
    this.canClone = view.canClone;
    this.draggable = view.draggable;
    /**
     * Сразу выполнить во вью поиск атрибутов data-app-property и проанализировать их
     */
    this.findAndAttachAppProperty();
}

/**
 * Найти на экране элементы связанные с css AppProperty
 * Поставить им атрибуты
 * И закешировать в appPropertyElements
 *
 * @param ap
 * @returns {number} количество найденных dom-элементов на экране
 */
AppScreen.prototype.findAndAttachCssAppProperty = function(ap) {
    if (ap.type !== 'css') {
        log('AppScreen.findAndAttchCssAppProperty: only css appProperty is allowed here', true);
    }
    if (this.view.$el) {
        var elemsOnView = $(this.view).find(ap.cssSelector);
        for (var k = 0; k < elemsOnView.length; k++) {
            // добавить проперти в data-app-property атрибут, так как css свойств там нет
            // они понадобятся чтобы по клику а этот элемент показать все проперти которые нужны
            this.addDataAttribute(elemsOnView[k], ap.propertyString);
            // для экрана подготавливаем domElement связанные с appProperty,
            // чтобы потом не искать их при каждом показе экрана
            this.appPropertyElements.push({
                propertyString: ps.propertyString,
                domElement: elemsOnView[k]
            });
        }
        return elemsOnView.length;
    }
    else {
        log('AppScreen.findAndAttchCssAppProperty: View or view.$el does not exist in AppScreen+'+this.id, true);
    }
    return 0;
};

/**
 * Найти на экране элементов с атрибутами data-app-property
 * Попробовать привязать к ним appProperty
 *
 * @returns {number} количество найденных dom-элементов на экране
 */
AppScreen.prototype.findAndAttachAppProperty = function() {
    var dataElems = this.view.$el.find('[data-app-property]');
    if (dataElems.length > 0) {
        for (var j = 0; j < dataElems.length; j++) {
            var atr = $(dataElems[j]).attr('data-app-property');
            var psArr = atr.split(',');
            for (var k = 0; k < psArr.length; k++) {
                var tspAtr = psArr[k].trim();
                if (Engine.getAppProperty(tspAtr)!==null) {
                    this.appPropertyElements.push({
                        propertyString: tspAtr,
                        domElement: dataElems[j]
                    });
                }
                else {
                    log('AppScreen.findAndAttachAppProperties: there is no appProperty for \''+tspAtr+'\'',true);
                }
            }
        }
    }
    return dataElems.length;
};

/**
 * Добавить новое значение в data-app-property избегая дублирования
 * prop3 -> data-app-property="prop1 prop2" = data-app-property="prop1 prop2 prop3"
 *
 * @param {DOMElement} elem html element
 * @param {string} attribute
 */
AppScreen.prototype.addDataAttribute = function(elem, attribute) {
    var exAtr = $(elem).attr('data-app-property');
    if (exAtr) {
        if (exAtr.indexOf(attribute) < 0) {
            // избегаем дублирования
            $(elem).attr('data-app-property', exAtr + ',' + attribute);
        }
    }
    else {
        $(elem).attr('data-app-property', attribute);
    }
}