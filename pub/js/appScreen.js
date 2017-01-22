/**
 * Created by artyom.grishanov on 16.08.16.
 *
 * @param {MutApp.Screen} mutAppScreen
 */
var AppScreen = function(mutAppScreen) {
    /**
     * MutApp screen
     */
    this._mutAppScreen = mutAppScreen;
    if (!!this._mutAppScreen.id===false) {
        log('AppScreen: mutAppScreen must have the id', true);
    }
    if (!!this._mutAppScreen.$el === false) {
        log('AppScreen: mutAppScreen must be rendered!', true);
    }
    // необходимо склонировать вью для работы в редакторе, чтобы отвязать все ui обработчики в приложении
    this.view = this._mutAppScreen.$el.clone().show();

    this.id = this._mutAppScreen.id;
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
    this.group = this._mutAppScreen.group;
    /**
     * Название показываемое рядом с экраном
     * @type {*}
     */
    this.name = this._mutAppScreen.name;
    /**
     * Не показывать скрин на панели контролов
     * @type {*}
     */
    this.hideScreen = this._mutAppScreen.hideScreen;
    /**
     * Схлопывание экранов в один контрол
     * @type {*}
     */
    this.collapse = this._mutAppScreen.collapse;
    this.canAdd = this._mutAppScreen.canAdd;
    this.canDelete = this._mutAppScreen.canDelete;
    this.canClone = this._mutAppScreen.canClone;
    this.draggable = this._mutAppScreen.draggable;
    this.arrayAppPropertyString = this._mutAppScreen.arrayAppPropertyString;
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
 * @param {AppProperty} ap
 * @returns {number} количество найденных dom-элементов на экране
 */
AppScreen.prototype.findAndAttachCssAppProperty = function(ap) {
    if (ap.type !== 'css') {
        log('AppScreen.findAndAttchCssAppProperty: only css appProperty is allowed here', true);
    }
    var elemsOnView = $(this.view).find(ap.cssSelector);
    for (var k = 0; k < elemsOnView.length; k++) {
        // добавить проперти в data-app-property атрибут, так как css свойств там нет
        // они понадобятся чтобы по клику а этот элемент показать все проперти которые нужны
        this.addDataAttribute(elemsOnView[k], ap.propertyString);
        // для экрана подготавливаем domElement связанные с appProperty,
        // чтобы потом не искать их при каждом показе экрана
        this.appPropertyElements.push({
            propertyString: ap.propertyString,
            domElement: elemsOnView[k]
        });
    }
    return elemsOnView.length;
};

/**
 * Найти на экране элементов с атрибутами data-app-property
 * Попробовать привязать к ним appProperty
 *
 * @returns {number} количество найденных dom-элементов на экране
 */
AppScreen.prototype.findAndAttachAppProperty = function() {
    var dataElems = this.view.find('[data-app-property]');
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
                    log('AppScreen.findAndAttachAppProperties: Engine does not has this appProperty \''+tspAtr+'\' (but it was found on screen)',true);
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