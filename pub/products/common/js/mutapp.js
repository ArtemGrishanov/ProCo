/**
 * Created by artyom.grishanov on 06.07.16.
 *
 */
var MutApp = function(param) {
    /**
     * Все свойства приложения, которые можно поменять извне
     * Ранее они были в engine.js appProperties
     *
     * @type {Array}
     * @private
     */
    this._mutappProperties = [];
    /**
     * Информация о последней операции сравнения двух приложений методом MutApp.compare
     * @type {result: <string>, message: <string>}
     * @private
     */
    this.compareDetails = null;
    /**
     * Ширина на которой начинается оптимизация
     * Это не обязательно моб
     * @type {number}
     */
    this.SMALL_WIDTH_PX = 600;
    this.id = MutApp.Util.getUniqId(6);
    /**
     * Окно загрузчика, который, возможно, встроил этот проект на страницу
     * @type {window}
     */
    this.loaderWindow = null;
    this.appConstructor = 'mutapp';
    /**
     * Колбеки в которые будет приходить информация о перерисовке экранов и прочих изменениях
     * @type {Array}
     * @private
     */
    this._appChangeCallbacks = [this._appEventHandler.bind(this)];
    /**
     * Каждое изменение MutAppProperty (setValue() или deserialize()) приводитк инкременту этого значения
     *
     * @type {number}
     * @private
     */
    this._operationCount = 0;
    /**
     * Собранные и упорядоченные css правила со всех CssMutAppProperty свойств
     * @type {
            selector: selector,
            rules: [{
                property: cssPropertyName,
                value: value
            }]
        }
     */
    this._cssRules = [];
    /**
     * Предыдущее состояние приложения
     * @type {{}}
     * @private
     */
    this._previousAppState = {
        width: undefined,
        height: undefined,
        screensRenderChecksum: {}
    };
    /**
     * Режим запуска приложения
     * Приложение может быть опубликовано, находиться в режиме редактирования в редакторе или в предпросмотре.
     * Например, только в mode==='published' приложении надо собирать статистику.
     * @type {string} 'published' || 'preview' || 'edit' || 'none'
     */
    this.mode = 'none';
    this.title = null;
    this.description = null;
    this._models = [];
    this._screens = [];
    this._history = [];
    this._isMobile = this.isMobile();
    this._isSmallWidth = this.isSmallWidth();
    //TODO mob 'auto'
    this.width = (param && param.width > 0) ? param.width: 800;
    this.height = (param && param.height > 0) ? param.height: 600;
    /**
     * Дефолтная картинка которая используется для шаринга, если нет сгенерированных редактором картинок
     */
    this.shareDefaultImgUrl = 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/share_def.jpg';
    /**
     * Ссылка для публикации по дефолту
     * Также может быть ссылка на анонимную страницу на тестиксе
     * Или создатель теста может указать какую страницу шарить.
     */
    this.shareDefaultLink = 'https://testix.me/';
    /**
     * Можно установить линк на страницу паблишера
     * Или он будет установлен на конкретный проект (http://testix.me/13435255)
     * @type {string}
     */
    this.shareLink = this.shareDefaultLink;
    /**
     * Массив сущностей для публикации
     * Например, ид какого-то результата или достижения (которых в приложении может быть несколько)
     */
    this._shareEntities = [
        //        {
        //            id: 'result1',
        //            title: 'Название результата',
        //            description: 'Описание результата',
        //            view: domElement, // view из которого будет сделана картинка,
        //            imgUrl: string
        //        }
    ];
    /**
     * Свойство MutAppProperty для установки кастомных css стилей приложения
     * @type {MutAppProperty}
     */
    this.customCssStyles = null;
    /**
     * Ид для публикации
     *
     * @type {string}
     */
    this.fbAppId = '1734391910154130';
    /**
     * Класс для кнопок шаринга
     * @type {string}
     */
    this.shareFBbtnClass = 'js-mutapp_share_fb';
    /**
     * Идентификатор Google Analytics
     * @type {null}
     */
    this.gaId = undefined;
    /**
     * Сохраненные значение для десериализации
     * Когда создается MutAppProperty, то свойства будут искаться здесь
     *
     * @type {{}}
     * @private
     */
    this._parsedDefaults = {};
    /**
     * Значения которые можно сохранить в Engine
     * Эти значения передаются при запуске в приложение
     *
     * @type {{_values: {}, get: Function, set: Function}}
     */
    this.engineStorage = {
        _values: {},
        _appChangeCallbacks: {},
        /**
         *
         * @param value
         */
        get: function(key) {
            return this._values[key];
        },
        /**
         * Отсылается событие об изменении свойств в Engine
         * @param obj
         */
        set: function(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) === true) {
                    this._values[key] = obj[key];
                }
            }
            var event = {
                type: MutApp.ENGINE_STORAGE_VALUE_CHANGED,
                changedValues: obj
            };
            if (this._appChangeCallbacks && this._appChangeCallbacks.length > 0) {
                for (var j = 0; j < this._appChangeCallbacks.length; j++) {
                    this._appChangeCallbacks[j](event);
                }
            }
        },
        /**
         * Установить в движок значение проперти
         * @param propertyString
         * @param value
         */
        setAppProperty: function(propertyString, value) {
            var event = {
                type: MutApp.ENGINE_SET_PROPERTY_VALUE,
                propertyString: propertyString,
                propertyValue: JSON.parse(JSON.stringify(value))
            };
            if (this._appChangeCallbacks && this._appChangeCallbacks.length > 0) {
                for (var j = 0; j < this._appChangeCallbacks.length; j++) {
                    this._appChangeCallbacks[j](event);
                }
            }
        }
    };

    // обработка параметров
    if (param) {
        if (param.mode) {
            this.mode = param.mode;
        }
        if (this.screenRoot) {
            this.screenRoot.empty();
            this.screenRoot.css('max-width',this.width+'px')
                .css('width','100%')
                .css('min-height',this.height+'px')
                .css('position','relative');
        }
        if (param.defaults) {
            // _defaults может быть массивом, чтобы несколько объектов для сериализации можно было ставить упорядоченно
            this._defaults = Array.isArray(param.defaults) ? param.defaults : [param.defaults];
            this._parsedDefaults = {};
            for (var i = 0; i < this._defaults.length; i++) {
                var defProps = this._defaults[i];
                this.deserialize(defProps);
            }
        }

        if (param.appChangeCallbacks) {
            if (Array.isArray(param.appChangeCallbacks) === true) {
                this._appChangeCallbacks = this._appChangeCallbacks.concat(param.appChangeCallbacks);
            }
            else if (typeof param.appChangeCallbacks === 'function') {
                this._appChangeCallbacks.push(param.appChangeCallbacks);
            }
        }

        if (param.engineStorage) {
            if (this._appChangeCallbacks) {
                this.engineStorage._appChangeCallbacks = this._appChangeCallbacks;
            }
            this.engineStorage._values = param.engineStorage;
        }
    }

    // должна быть объявлена схема
    // важно: этот код находится после обработки _appChangeCallbacks
    if (this.mutAppSchema instanceof MutAppSchema === true) {
        this.createCssMutAppProperties(this.mutAppSchema._schema);
    }
    else {
        throw new Error('MutApp.constructor: mutAppSchema is not defined in mutapp');
    }

    // инициализация свойства для хранения кастомных стилей
    // важно: этот код находится после обработки _appChangeCallbacks
    this.customCssStyles = new MutAppProperty({
        application: this,
        propertyString: 'appConstructor=mutapp customCssStyles',
        value: ''
    });
//    this.customCssStyles.bind('change',function(){
//        // запись значения свойства (css строки) в виде стилей
//        MutApp.Util.writeCssTo('id-custom_styles', this.getValue(), this._application.screenRoot);
//    });

    // инициализация апи для статистики, если задан идентификатор Google Analytics
    // при использовании другого или нескольких провайдеров надо будет рефакторить
    if (this.gaId && this.mode === 'published') {
        this.initStatistics(this.gaId);
    }

    // вызов конструктора initialize, аналогично backbone
    this.initialize.apply(this, arguments);

    // подписка на postMessage
    window.addEventListener("message", this.receiveMessage.bind(this), false);

    // включаем мониторинг состояния приложение
//    setInterval((function(){
//        this.onAppMonitorTimer();
//    }).bind(this),200);
};

MutApp.EVENT_SCREEN_CREATED = 'mutapp_event_screen_created';
MutApp.EVENT_SCREEN_RENDERED = 'mutapp_event_screen_rendered';
MutApp.EVENT_SCREEN_DELETED = 'mutapp_event_screen_deleted';
MutApp.EVENT_APP_SIZE_CHANGED = 'mutapp_event_app_size_changed';
MutApp.EVENT_PROPERTY_CREATED = 'mutapp_event_property_created';
MutApp.EVENT_PROPERTY_VALUE_CHANGED = 'mutapp_event_property_value_changed';
MutApp.EVENT_PROPERTY_DELETED = 'mutapp_event_property_created';
MutApp.ENGINE_STORAGE_VALUE_CHANGED = 'mutapp_engine_value_changed';
MutApp.ENGINE_SET_PROPERTY_VALUE = 'mutapp_set_property_value';

/**
 * Обработчик событий в приложении
 *
 * @param {string} event
 * @param {object} data
 */
MutApp.prototype._appEventHandler = function(event, data) {
    switch (event) {
        case MutApp.EVENT_PROPERTY_CREATED:
        case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {
            // обработку обновления isCssMutAppProperty надо проводить во всех режимах: 'edit' 'preview' 'published'
            // например в 'published' режиме при десериализации при старте надо записать стили
            if (MutApp.Util.isCssMutAppProperty(data.property) === true) {
                //if (typeof data.property.getValue() === 'string') {
                    this._saveCssRule({
                        cssSelector: data.property.cssSelector,
                        cssPropertyName: data.property.cssPropertyName,
                        cssValue: data.property.getValue()
                    });
                    MutApp.Util.writeCssTo('id-custom_styles', this._getCssRulesString(), this.screenRoot);
                //}
            }
            if (data.propertyString === 'appConstructor=mutapp customCssStyles') {
                //if (typeof data.property.getValue() === 'string') {
                    this._saveCssRule({
                        cssCodeId: 'appConstructor=mutapp customCssStyles',
                        cssCode: data.property.getValue()
                    });
                    // запись значения свойства (css строки) в виде стилей
                    MutApp.Util.writeCssTo('id-custom_styles', this._getCssRulesString(), this.screenRoot);
                //}
            }
            break;
        }
    }
};
/**
 * Связать экран с приложением
 * Рендер экрана будет вызван сразу при добавлении
 *
 * @param v
 */
MutApp.prototype.addScreen = function(v) {
    if (v instanceof MutApp.Screen === true) {
        this._screens.push(v);
        // v.render(); надо ли?
        this.trigger(MutApp.EVENT_SCREEN_CREATED, {
            screenId: v.id
        });
        return v;
    }
    throw new Error('MutApp.addScreen: View must be a MutApp.Screen instance');
};
/**
 *
 * @param v
 * @returns {*}
 */
MutApp.prototype.deleteScreen = function(v) {
    var index = this._screens.indexOf(v);
    if (index >= 0) {
        this.trigger(MutApp.EVENT_SCREEN_DELETED, {
            screenId: v.id
        });
        this._screens.splice(index, 1);
        v.$el.remove();
    }
    else {
        console.error('MutApp.deleteScreen: This view not found');
    }
};
/**
 * Связать модель с приложением
 * @param v
 */
MutApp.prototype.addModel = function(m) {
    if (m instanceof Backbone.Model === true) {
        this._models.push(m);
        return m;
    }
    throw new Error('MutApp.addModel: Model must be a Backbone.Model instance');
};
/**
 * Отобразить вью.
 * Важно, вызов этого метода еще не гарантирует, что пользователь увидит вью. Он может быть закрыт другим вью сверху
 *
 * Instance method
 * @param v
 * @param hideOthers
 */
MutApp.prototype.showScreen = function(v, hideOthers) {
    hideOthers = (hideOthers === undefined) ? true: hideOthers;
    if (hideOthers === true) {
        this.hideAllScreens();
    }
    $(v.el).show();
    v.isShowed = true;
    if (typeof v.onShow === 'function') {
        v.onShow();
    }
    this._updateViewsZOrder();
};
/**
 * Получить экран по его ид
 * @param {string} id
 */
MutApp.prototype.getScreenById = function(id) {
    for (var i = 0; i < this._screens.length; i++) {
        if (this._screens[i].id === id) {
            return this._screens[i];
        }
    }
    return null;
};
/**
 * Получить список ид всех экранов приложения
 * @return {Array}
 */
MutApp.prototype.getScreenIds = function() {
    var result = [];
    for (var i = 0; i < this._screens.length; i++) {
        result.push(this._screens[i].id);
    }
    return result;
};
/**
 * Скрыть определенный экран приложения
 * Instance method
 * @param v
 */
MutApp.prototype.hideScreen = function(v) {
    $(v.el).hide();
    v.isShowed = false;
    if (typeof v.onHide === 'function') {
        v.onHide();
    }
    this._updateViewsZOrder();
};

/**
 * Скрыть все экраны, которые существуют в приложении
 * Instance method
 */
MutApp.prototype.hideAllScreens = function() {
    for (var i = 0; i < this._screens.length; i++) {
        if (this._screens[i].isShowed !== false) {
            this.hideScreen(this._screens[i]);
        }
    }
};

/**
 * Получить z индекс вьюхи. Относительно других ВИДИМЫХ вью, которые есть в app.screens
 * 0 - самый топ, то есть именно его сейчас видит пользователь. Дальше по убыванию.
 * Например, подписавшись на это событие и проверяя на самый врехний индекс, вью может начать анимацию тогда и только тогда
 * когда пользователь гарантированно его увидит
 *
 */
MutApp.prototype._updateViewsZOrder = function() {
    if (!this._viewsArr) {
        this._regulateViews(this.screenRoot);
    }
    var zIndex = 0, v;
    // this.Views - находятся в порядке "снизу-вверх" в dom дереве
    for (var i = this._viewsArr.length-1; i >= 0; i--) {
        v = this._viewsArr[i];
        if (v.isShowed == true) {
            if (v['__zIndex'] !== zIndex) {
                v['__zIndex'] = zIndex;

                // если у текущего вью меняется zOrder и становится 0, то это считается пока
                // не обязательно show, а может быть hide предыдущего
                if (zIndex == 0) {
                    this._history.push(v);
                }

                if (v.onZIndexChange) {
                    v.onZIndexChange(zIndex);
                }
            }
            zIndex++;
        }
        else {
            v['__zIndex'] = undefined;
        }
    }
};

/**
 * Упорядочить вьхи в едином массив, в таком порядке как они находятся в DOM
 *
 * @param domElem
 */
MutApp.prototype._regulateViews = function(domElem) {
    this._viewsArr = [];
    for (var i = 0; i < domElem.children.length; i++) {
        for (var k = 0; k < this._screens.length; k++) {
            var v = this._screens[k];
            if (this._isElement(v.el) && domElem.children[i] == v.el) {
                v['__domIndex'] = i;
                this._viewsArr.push(v);
            }
        }
    }
};

/**
 * todo
 * @param obj
 * @returns {boolean}
 */
MutApp.prototype._isElement = function(obj) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrom)
        return obj instanceof HTMLElement;
    }
    catch(e){
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have. (works on IE7)
        return (typeof obj==="object") &&
            (obj.nodeType===1) && (typeof obj.style === "object") &&
            (typeof obj.ownerDocument ==="object");
    }
};

/**
 *
 * 0) Если селектор соответствует CssMutAppProperty свойтву, то найти свойство по точному соответствию propertyString
 *
 * 1) Проверить корректность входящего селектора '<filterKey>=<filterValue> propertySelector'
 * Например, 'id=mainModel quiz.{{number}}.text'
 *
 * 2) Найти в приложении вью или модели, соответствующие условию entity[filterKey]===filterValue
 * Например, model['id']==='mainModel'
 *
 * 3) далее разобрать propertySelector
 * Например, он может быть такой: quiz.{{number}}.text - это значит что свойств будет несколько
 *
 * @param {string} selector - например, 'id=mainModel quiz.{{number}}.text' или '.js-start_header color'
 *
 * @return {Array}
 */
MutApp.prototype.getPropertiesBySelector = function(selector) {
    // css селектор
    if (MutApp.Util.isCssMutAppPropertySelector(selector) === true) {
        // у этого типа селектора предусмотрено только единственное соответствие
        // то есть требуется сравнение с propertyString
        var cssPrp = this.getProperty(selector);
        if (cssPrp) {
            // обязаны вернуть в виде массива
            return [{
                entity: null,
                path: null,
                propertyString: selector,
                value: cssPrp
            }];
        }
        return null;
    }
    // regular селектор
    var parsedSelector = MutApp.Util.parseSelector(selector);
    if (parsedSelector) {
        var result = [];
        var entities = this.getEntities(parsedSelector.conditionKey, parsedSelector.conditionValue);
        if (entities) {
            // хотя entities может быть несколько: например, несколько экранов вопросов
            // но настройка это одна: например, showLogo свойства во всех экранах (type=question showLogo)
            // в движке это будет одно appProperty
            // тогда и не надо искать значения во всех entities, достаточно лишь первого
            // Отличаться значения в приложении не должны в таком случае
            for (var i = 0; i < entities.length; i++) {
                var finded = MutApp.Util.getPropertiesBySelector(entities[i], parsedSelector.valueKey);
                for (var m = 0; m < finded.length; m++) {
                    finded[m].entity = entities[i];
                }
                if (finded && finded.length > 0) {
                    result = finded;
                    break;
                }
            }
        }
        // собираем реальный propertyString для работы в движке
        // вместо id=tm quiz.{{number}}.question.text получим:
        // id=tm quiz.0.question.text
        for (var j = 0; j < result.length; j++) {
            result[j].propertyString = parsedSelector.conditionKey+'='+parsedSelector.conditionValue+' '+result[j].path;
        }
        return (result.length > 0) ? result: null;
    }
    return null;
};
/**
 * Найти свойство по propertyString в списке _mutAppProperties
 * @param {string} propertyString
 */
MutApp.prototype.getProperty = function(propertyString) {
    for (var i = 0; i < this._mutappProperties.length; i++) {
        if (this._mutappProperties[i].propertyString === propertyString) {
            return this._mutappProperties[i];
        }
    }
    return null;
};
/**
 * Найти MutAppProperty свойства по запросу
 * @param {*} query
 * @returns {Array}
 */
MutApp.prototype.find = function(query) {
    var result = [], p = null;
    for (var i = 0; i < this._mutappProperties.length; i++) {
        p = this._mutappProperties[i];
        if (p.propertyString.indexOf(query) >= 0 || p._value == query || (typeof p._value === 'string' && p._value.indexOf(query) >= 0)) {
            result.push(p);
        }
    }
    return result;
};
/**
 *
 * Установить значение в приложение по апп-строке
 * Например app.setPropertyByAppString('id=mm pins.0.data.text','new value');
 *
 * @param appString
 * @param value
 */
//MutApp.prototype.setPropertyByAppString = function(appString, value) {
//    var props = this.getPropertiesBySelector(appString);
//    if (props !== null) {
//        for (var i = 0; i < props.length; i++) {
//            var isModel = props[i].entity instanceof MutApp.Model;
//            if (isModel === true) {
//                MutApp.Util.assignByPropertyString(props[i].entity.attributes, props[i].path, value);
//            }
//            else {
//                MutApp.Util.assignByPropertyString(props[i].entity, props[i].path, value);
//            }
//        }
//    }
//    else {
//        console.error('MutApp.setPropertyByAppString: Invalid selector=\''+appString+'\'');
//    }
//};

/**
 * Теперь только для MutAppProperty
 * Скоро именно этот метод станет основным для доступа к свойствам приложения их редактора
 *
 * @param {string} appString
 * @param {*} value
 */
//MutApp.prototype.setPropertyByAppString2 = function(appString, value) {
//    var results = this.getPropertiesBySelector(appString);
//    if (results && results.length > 0) {
//        // свойств может быть несколько если используется подстановка {{number}}
//        var prop = null;
//        for (var i = 0; i < results.length; i++) {
//            prop = results[i].value;
//            // проверяем что найденное значение действительно является MutAppProperty
//            if (MutApp.Util.isMutAppProperty(prop) === true) {
//                prop.setValue(value);
//            }
//            else {
//                throw new Error('MutApp.setPropertyByAppString2: \''+appString+'\' is not a MutAppProperty');
//            }
//        }
//    }
//    else {
//        throw new Error('MutApp.setPropertyByAppString2: properties not found for \''+appString+'\'');
//    }
//};

/**
 * Привязать существующее свойство к приложению.
 * Проверить, что такое свойство существует в схеме mutAppPropertySchema по propertyString внутри mutAppProperty
 *
 * @param {MutAppProperty} mutAppProperty
 */
MutApp.prototype.linkMutAppProperty = function(mutAppProperty) {
    if (this._mutappProperties.indexOf(mutAppProperty) < 0 && this.getProperty(mutAppProperty.propertyString) === null) {
        // проверить, что такое mutAppProperty свойство существует в схеме.
        var prInfo = this.mutAppSchema.getPropertyDescription(mutAppProperty.propertyString);
        if (!prInfo) {
            throw new Error('MutApp.linkMutAppProperty: mutAppProperty not finded in app by schema=\''+mutAppProperty.propertyString+'\'');
        }
        if (prInfo.label) {
            mutAppProperty.label = prInfo.label;
        }
        // свойство показывающее как фильтровать контролы свойства
        if (prInfo.controlFilter) {
            if (prInfo.controlFilter.indexOf('screen') === 0) {
                mutAppProperty._controlFilter = 'screen';
                // получаем id экрана указанного в скобках
                var r = new RegExp(/screen\(([A-z0-9_]+)\=([A-z0-9_]+)\)/i);
                var m = r.exec(prInfo.controlFilter);
                if (m && m[0] && m[1] && m[2]) {
                    mutAppProperty._controlFilterScreenCriteria = {
                        key: m[1],
                        value: m[2]
                    };
                }
                else {
                    throw new Error('MutApp.linkMutAppProperty: can not match screen id in \'' + prInfo.controlFilter + '\' for app property \'' + mutAppProperty.propertyString + '\'');
                }
            }
            else if (prInfo.controlFilter === 'always' || prInfo.controlFilter === 'onclick' || prInfo.controlFilter === 'hidden') {
                mutAppProperty._controlFilter = prInfo.controlFilter;
                mutAppProperty._controlFilterScreenCriteria = null;
            }
            else {
                throw new Error('MutApp.linkMutAppProperty: invalid controlFilter value for \'' + mutAppProperty.propertyString + '\'');
            }
        }
        else {
            mutAppProperty._controlFilter = 'hidden';
            mutAppProperty._controlFilterScreenCriteria = null;
        }
        // переносим из схемы информацию о контролах
        if (prInfo.controls) {
            if (prInfo.controls.hasOwnProperty('controlFilter') === true) {
                throw new Error('MutApp.linlAppProperty: controlFilter must not be declared in control properties! See docs.');
            }
            mutAppProperty.controls = Array.isArray(prInfo.controls) ? prInfo.controls: [prInfo.controls];
        }
        else {
            mutAppProperty.controls = [];
        }

        if (MutApp.Util.isMutAppPropertyArray(mutAppProperty) === true) {
            mutAppProperty.prototypes = prInfo.prototypes;
        }
        if (mutAppProperty._application !== this) {
            mutAppProperty._application = this;
        }

        // если в приложении есть сохраненные десериализованные свойства, то приложение должно получить их
        if (this._parsedDefaults[mutAppProperty.propertyString]) {
            mutAppProperty.deserialize(this._parsedDefaults[mutAppProperty.propertyString]);
        }

        this._mutappProperties.push(mutAppProperty);

        this.trigger(MutApp.EVENT_PROPERTY_CREATED, {
            property: mutAppProperty,
            propertyString: mutAppProperty.propertyString
        });
    }
    else {
        throw new Error('MutApp.linkMutAppProperty: mutAppProperty is already linked=\''+mutAppProperty.propertyString+'\'');
    }
};
/**
 * По схеме создать все css свойства
 * @param schema
 */
MutApp.prototype.createCssMutAppProperties = function(schema) {
    for (var selector in schema) {
        // может встретиться множественный селектор: он может через запятую содержать на самом деле несколько селекторов
        // пример: ".js-start_header padding-top, .js-start_description padding-top"
        var subSelectors = selector.split(',');
        for (var i = 0; i < subSelectors.length; i++) {
            var ss = subSelectors[i].trim();
            if (MutApp.Util.isCssMutAppPropertySelector(ss) === true) {
                var param = JSON.parse(JSON.stringify(schema[selector]));
                param.application = this;
                param.propertyString = ss;
                var cmp = new CssMutAppProperty(param);
            }
        }
    }
};
/**
 * После рендера экрана надо обновить значения css свойств
 * @param {MutAppScreen} screen
 */
MutApp.prototype.updateCssMutAppPropertiesValues = function(screen) {
    var props = this._mutappProperties;
    for (var i = 0; i < props.length; i++) {
        if (props[i] instanceof CssMutAppProperty) {
            var cssv = screen.$el.find(props[i].cssSelector).css(props[i].cssPropertyName);
            if (MutApp.Util.isRgb(cssv) === true) {
                // если строка подходит под формат rgb то надо конвертировать rgba(126,0,255) -> #7E00FF
                // так как пользователю в контроле удобнее работать с таким форматом
                cssv = MutApp.Util.rgb2hex(cssv);
            }
            props[i].setValue(cssv);
        }
    }
};
/**
 * Вернуть стили для проекта из всех CssMutAppProperty
 *
 * @return {string}
 */
MutApp.prototype.getCssMutAppPropertiesStyles = function() {
    //TODO custom css styles
    //TODO all CssMutAppProperties styles
    return '';
};
/**
 * Восстановить из json-строки или объекта значения свойств приложения.
 *
 * Условия:
 * 1) Более конкретные свойства имеют больший приоритет
 * То есть строка элемента массива приоритетнее, чем сам сериализованный массив
 * 2) ...
 *
 * @param {string|object} data
 */
MutApp.prototype.deserialize = function(data) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    for (var key in data) {
        // значения по умолчанию сохраняем для будущих инициализаций MutAppProperty
        if (MutApp.Util.isMutAppPropertySelector(key) || MutApp.Util.isCssMutAppPropertySelector(key)) {
            this._parsedDefaults[key] = data[key];
        }
        else {
            console.error('MutApp.deserialize: selector \''+key+'\' is invalid');
        }
        var ap = this.getProperty(key);
        if (ap) {
            // если свойство уже создано то десериализуем его
            ap.deserialize(data[key]);
        }
        else {
            // при старте приложения нет никаких свойтств пока
            // console.error('MutApp.deserialize: property \'' + key + '\' does not exist in this app.');
        }
    }
};
/**
 * Сохранить данные приложения в виде строки
 * @returns {string}
 */
MutApp.prototype.serialize = function() {
    var data = {}, p = null;
    for (var i = 0; i < this._mutappProperties.length; i++) {
        p = this._mutappProperties[i];
        data[p.propertyString] = p._prepareSerializedObject();
    }
    return JSON.stringify(data);
};
/**
 * Сравнить два MutApp приложения.
 * Это означает, что будут сравнены все свойства MutAppProperty в обоих приложениях.
 * Если существует одно свойство id=pm attr1 в одном приложении, то должно существовать такое же свойство и в другом приложениии. И MutAppProperty.compare возвращать true
 *
 * @param {MutApp} otherApp
 * //@param param.mutAppProperties - сравнить свойства MutAppProperties
 */
MutApp.prototype.compare = function(otherApp, param) {
    param = param || {};
    for (var i = 0; i < this._mutappProperties.length; i++) {
        var ps = this._mutappProperties[i].propertyString;
        var res = otherApp.getPropertiesBySelector(ps);
        if (res && res.length === 1 && MutApp.Util.isMutAppProperty(res[0].value)) {
            var compRes = this._mutappProperties[i].compare(res[0].value);
            if (compRes === false) {
                this.compareDetails = {
                    result: false,
                    message:'MutApp.compare: property \''+ps+'\' does not match the same property in other app.' +
                        ((this._mutappProperties[i].compareDetails) ? ' Details: ' + this._mutappProperties[i].compareDetails.message: '')
                };
                return false;
            }
        }
        else {
            this.compareDetails = {result: false, message:'MutApp.compare: property \''+ps+'\' does not exist in other app.'};
            return false;
        }
    }
    this.compareDetails = {result: true, message:'MutApp.compare: success.'};
    return true;
};

/**
 * Создать клон приложения.
 * Это означает создать новый инстанс приложения и установить те же значения appProperty
 *
 * 1) Для версионирования: операции отмены действия Ctrl+Z
 * 2) Для тестирования сериализации: создание клона, чтобы потом сравнивать его с оригиналом после операций по сериализации
 *
 */
MutApp.prototype.clone = function() {
    //но так оно не сможет работать?
    return _.clone(this);
};

/**
 * Вернуть количество операций (MutAppProperty.setValue() & MutAppProperty.deserialize()) с момента запуска приложения
 *
 * @returns {number}
 */
MutApp.prototype.getOperationsCount = function() {
    return this._operationCount;
};

/**
 * Инициализация fb api для шаринга
 *
 * @param {string} appId
 */
MutApp.prototype.fbInit = function(appId) {
    window.fbAsyncInit = function() {
        FB.init({
            appId      : appId,
            status     : true,
            xfbml      : true,
            version    : 'v2.7'
        });
    };
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
};

/**
 * Найти в приложении сущности, которые имеют свойства filterKey со значением filterValue
 * Модели, экраны и само приложение.
 *
 * @param filterKey
 * @param filterValue
 */
MutApp.prototype.getEntities = function(filterKey, filterValue) {
    if (filterKey && filterValue) {
        var a = this._models.concat(this._screens, [this]);
        var result = [];
        for (var i = 0; i < a.length; i++) {
            // для модели надо также смотреть в ее атрибутах
            var isModel = a[i] instanceof MutApp.Model;
            if (a[i][filterKey]===filterValue || (isModel===true && a[i].attributes[filterKey]===filterValue)) {
                result.push(a[i]);
            }
        }
        return result.length > 0 ? result: null;
    }
};

/**
 * Установить сущности для публикации
 * Будут инициализированы апи сервисов (соцсетей) для публикации
 * @param {Array} arr - ид елемента для публикации
 */
MutApp.prototype.setShareEntities = function(arr) {
    // к этому времени уже могут быть установлены движком часть свойств в конструкторе. Например сохраненные картинки _shareEntities.2.imgUrl
    // id: id,
    // title: r.title,
    // description: descForShare,
    // удалить элементы, оставить только те которые в whitelist
    // view: MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']),
    // imgUrl: null
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        var e = arr[i];
        if (this._shareEntities[i]) {
            for (var key in this._shareEntities[i]) {
                if (this._shareEntities[i].hasOwnProperty(key) === true) {
                    // свойства this._shareEntities более приоритетны, так как они могуть прийти из defaults при запуске приложения
                    // например _shareEntities.{{number}}.imgUrl
                    e[key] = this._shareEntities[i][key];
                }
            }
        }
        result.push(e);
    }
    this._shareEntities = result;
    this.fbInit(this.fbAppId);
};

/**
 * Найти сущность для публикации с заданным ид
 * @param {string} entityId - ид елемента для публикации
 * @return {object}
 */
MutApp.prototype.findShareEntity = function(entityId) {
    for (var i = 0; i < this._shareEntities.length; i++) {
        if (this._shareEntities[i].id === entityId) {
            return this._shareEntities[i];
        }
    }
    return null;
};

/**
 * Опубликовать сущность
 *
 * @param entityId - ид публикуемой сущности. Например, ид какого-то результата или достижения (которых в приложении может быть несколько)
 * @param {string} [serviceId] - fb|vk|odkl|twitter
 * @param {boolean} isFakeShare - показывает что не надо на самом деле делать шаринг, для автотестов
 *
 * @returns {boolean}
 */
MutApp.prototype.share = function(entityId, serviceId, isFakeShare) {
    serviceId = serviceId || 'fb';
    var ent = this.findShareEntity(entityId);
    if (ent) {
        var imgUrl = ent.imgUrl;
        if (!!imgUrl === false) {
            imgUrl = this.shareDefaultImgUrl;
        }
        if (!!this.shareLink===false) {
            this.shareLink = this.shareDefaultLink;
        }
        var name = ent.title.replace(/<br>/gi, ' ').replace(/&nbsp;/gi, '');
        var description = ent.description.replace(/<br>/gi, ' ').replace(/&nbsp;/gi, '');
        if (serviceId === 'fb') {
            if (isFakeShare !== true) {
                // рекомендации перекрывают нижнюю часть окна постинга ФБ
                // В случае ВК - открывается отдельный попап
                this.hideRecommendations();
                FB.ui({
                    method: 'feed',
                    link: this.shareLink,
                    name: name,
                    description: description,
                    picture: imgUrl
                }, (function(response) {
                    console.log(response);
                    this.showRecommendations();
                }).bind(this));
                this.stat('app','feed', name);
                if (this.loaderWindow) {
                    this.loaderWindow.postMessage({
                        method: 'shareDialog',
                        provider: 'Facebook'
                    }, '*');
                }
            }
            return true;
        }
        else if (serviceId === 'vk') {
            if (isFakeShare !== true) {
                // способ построения ссылки взят из интернета и не рекомендован официально ВК
                var url = 'http://vkontakte.ru/share.php?';
                url += 'url='          + encodeURIComponent(this.shareLink);
                url += '&title='       + encodeURIComponent(name);
                url += '&description=' + encodeURIComponent(description);
                url += '&image='       + encodeURIComponent(imgUrl);
                url += '&noparse=true';
                window.open(url,'','toolbar=0,status=0,width=626,height=436');
                if (this.loaderWindow) {
                    this.loaderWindow.postMessage({
                        method: 'shareDialog',
                        provider: 'Vkontakte'
                    }, '*');
                }
                // но вот такой официальный код я заставил работать только под localhost
                // в приложении параметр noparse не работал
//                $(vks).html(
//                    VK.Share.button({
//                            url: this.model.application.shareLink,
//                            title: e.title,
//                            description: e.description,
//                            image: imgUrl,
//                            noparse: true
//                        }, {
//                            type: 'custom',
//                            text: '<img src="http://testix.me/i/products/vk_64.png" />'
//                    )
//                );
            }
            return true;
        }

        //TODO other providers
    }
    return false;
};

/**
 * Инициализация аналитики
 * Однако статистику не надо инициализировать когда мы находимся в редкторе или режиме превью.
 * Только опубликованное приложение нас интересует
 *
 * @param {string} gaId например "UA-84925568-2"
 */
MutApp.prototype.initStatistics = function(gaId) {
    var gaCode = '<script>(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');ga(\'create\', \'{{ga_id}}\', \'auto\');ga(\'send\', \'pageview\');{{init_event}}</script>';
    gaCode = gaCode.replace('{{ga_id}}', gaId);
    gaCode = gaCode.replace('{{init_event}}', 'ga(\'send\', \'event\', \'app\', \'init_analytics\');');
    $('body').append(gaCode);
};

/**
 * Отправить событие в систему сбора статистики
 *
 * @param {string} category, например Videos
 * @param {string} action, например Play
 * @param {string} [label], например 'Fall Campaign' название клипа
 * @param {number} [value], например 10 - длительность
 */
MutApp.prototype.stat = function(category, action, label, value) {
    if (window.ga && this.mode === 'published') {
        var statData = {
            hitType: 'event',
            eventCategory: category,
            eventAction: action,
        };
        if (label) {
            statData.eventLabel = label;
        }
        if (value) {
            statData.eventValue = value
        }
        window.ga('send', statData);
    }
};

/**
 * Получить и обработать сообщение
 * @param event
 */
MutApp.prototype.receiveMessage = function(event) {
    // это событие означает, что лоадер встроил это приложение на страницу
    // надо запомнить его, чтобы потом можно было отослать какое-то сообщение
    if (event.data && event.data.method === 'init') {
        this.loaderWindow = event.source;
    }
};

/**
 * Отправить запрос на показ других релевантных промо проектов
 * Это возможно только когда проект был загружен с помощью loader.js
 */
MutApp.prototype.showRecommendations = function() {
    if (this.loaderWindow) {
        this.loaderWindow.postMessage({
            method: 'showRecommendations'
        }, '*');
    }
};

/**
 * Отправить запрос на скрытие рекомендаций, например когда начинаем тест повторно.
 * Это возможно только когда проект был загружен с помощью loader.js
 */
MutApp.prototype.hideRecommendations = function() {
    if (this.loaderWindow) {
        this.loaderWindow.postMessage({
            method: 'hideRecommendations'
        }, '*');
    }
};

/**
 * Проверка на мобильное устройство по юзер агенту
 * regexp from http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 *
 * @returns {boolean}
 */
MutApp.prototype.isMobile = function() {
    if (typeof this._isMobile === 'boolean') {
        return this._isMobile;
    }
    this._isMobile = false;
    (function(a,self){if(/(android|bb\d+|meego|iPad|iPod|iPhone|Windows Phone|BlackBerry|webOS).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))){
        self._isMobile = true;
    }})(navigator.userAgent||navigator.vendor||window.opera,this);
    return this._isMobile;
};

/**
 *
 * @returns {boolean}
 */
MutApp.prototype.isSmallWidth = function() {
    if (typeof this._isSmallWidth === true) {
        return this._isSmallWidth;
    }
    var ww = $(window).width();
    if (ww === 0) {
        //TODO баг, разобраться. Когда стартует приложение в редакторе. Влияет на превью экрана
        this._isSmallWidth = false;
    }
    else {
        this._isSmallWidth = (ww <= this.SMALL_WIDTH_PX);
    }
    return this._isSmallWidth;
};

/**
 * Инициировать событие в приложении
 * @param {string} eventType
 * @param {object} data
 */
MutApp.prototype.trigger = function(eventType, data) {
    data = data || {};
    data.application = this;
    for (var j = 0; j < this._appChangeCallbacks.length; j++) {
        this._appChangeCallbacks[j](eventType, data);
    }
};

/**
 * Определить, сколько на текущий момент должно быть контролов для приложения.
 * Для каждого свойства, которое сейчас зарегистрировано, может быть 1 и более контролов
 *
 * @returns {number}
 */
MutApp.prototype.getExpectedControlsCount = function() {
    var result = 0;
    for (var i = 0; i < this._mutappProperties.length; i++) {
        if (this._mutappProperties[i].controls.length > 0) {
            result += this._mutappProperties[i].controls.length;
        }
    }
    return result;
};

/**
 * Определить, сколько на текущий момент должно быть контролов для приложения.
 * Для каждого свойства, которое сейчас зарегистрировано, может быть 1 и более контролов
 *
 * @returns {number}
 */
MutApp.prototype.getPropertiesWithControls = function() {
    var result = [];
    for (var i = 0; i < this._mutappProperties.length; i++) {
        if (this._mutappProperties[i].controls.length > 0) {
            result.push(this._mutappProperties[i]);
        }
    }
    return result;
};

/**
 * Сохранить кастомный css стиль для промо проекта.
 * Потом он будет встроен в body тегом <style>
 *
 * Два способа сохранения стилей:
 * 1) Указать cssSelector cssPropertyName cssValue
 * 2) Указать cssCode cssCodeId
 *
 * @param {string} param.cssSelector - например '.js-btn'
 * @param {string} param.cssPropertyName - например 'font-size'
 * @param {string} param.cssValue - например '18px'
 *
 * @param {string} [param.cssCodeId] - идентификатор для cssCode
 * @param {string} [param.cssCode] - опционально можно добавить код
 */
MutApp.prototype._saveCssRule = function(param) {
    param = param || {};
    if (typeof param.cssCode === 'string' && typeof param.cssCodeId === 'string') {
        var r = this._getCssRule(param.cssCodeId);
        if (r) {
            r.rules = param.cssCode;
        }
        else {
            this._cssRules.push({
                selector: param.cssCodeId,
                rules: param.cssCode
            });
        }
    }
    else if (typeof param.cssSelector === 'string' && typeof param.cssPropertyName === 'string') {
        // param.cssValue может быть и null и undefined, это нормально, стиль по умолчанию будет
        var r = this._getCssRule(param.cssSelector);
        if (r) {
            var propertyFound = false;
            for (var j = 0; j < r.rules.length; j++) {
                if (r.rules[j].property === param.cssPropertyName) {
                    // перезаписываем существующее css проперти
                    r.rules[j].value = param.cssValue;
                    propertyFound = true;
                    break;
                }
            }
            // надо проверить что value определено
            if (propertyFound === false) {
                // новое проперти для этого селектора, добавить в массив
                r.rules.push({
                    property: param.cssPropertyName,
                    value: param.cssValue
                });
            }
        }
        else {
            // селектор новый, добавить
            this._cssRules.push({
                selector: param.cssSelector,
                rules: [{
                    property: param.cssPropertyName,
                    value: param.cssValue
                }]
            });
        }
    }
    else {
        throw new Error('MutApp._saveCssRule: invalid params');
    }
};

/**
 * Вспомогальный метод для _saveCssRule
 * @param selector
 * @returns {*}
 * @private
 */
MutApp.prototype._getCssRule = function(selector) {
    for (var i = 0; i < this._cssRules.length; i++) {
        var r = this._cssRules[i];
        if (r.selector === selector) {
            return r;
        }
    }
    return null;
};

/**
 * Собирает все измененные css стили и возвращает их одной строкой
 * @returns {string}
 */
MutApp.prototype._getCssRulesString = function() {
    var cssStr = '\n';
    for (var i = 0; i < this._cssRules.length; i++) {
        var r = this._cssRules[i];
        if (typeof r.rules === 'string') {
            // может быть сразу строка стилей, которую напрямую записываем
            cssStr += r.rules+'\n';
        }
        else {
            cssStr += r.selector+'{\n';
            for (var j = 0; j < r.rules.length; j++) {
                if (r.rules[j].value !== null && r.rules[j].value !== undefined) {
                    cssStr += '\t'+r.rules[j].property+':'+r.rules[j].value+';\n';
                }
            }
            cssStr += '}\n';
        }
    }
    return cssStr;
};

/**
 * Таймер, мониторящий состояние приложения
 */
//MutApp.prototype.onAppMonitorTimer = function() {
//    if (this._appChangeCallbacks && this._appChangeCallbacks.length > 0) {
//        // проверка изменения размеров приложения
//        if (this._previousAppState.width !== this.width || this._previousAppState.height !== this.height) {
//            var event = {
//                type: MutApp.EVENT_APP_SIZE_CHANGED,
//                app: this
//            };
//            for (var j = 0; j < this._appChangeCallbacks.length; j++) {
//                this._appChangeCallbacks[j](event);
//            }
//            this._previousAppState.width = this.width;
//            this._previousAppState.height = this.height;
//        }
//
//        // проверка хешей экранов: произошел ли render() какого либо экрана
//        var v = null;
//        for (var i = 0; i < this._screens.length; i++) {
//            v = this._screens[i];
//            // если renderChecksum не меняется (undefined) то колбек не будет вызван
//            if (v.renderChecksum !== this._previousAppState.screensRenderChecksum[v.id]) {
//                var event = {
//                    type: MutApp.EVENT_SCREEN_RENDERED,
//                    screen: v
//                };
//                for (var j = 0; j < this._appChangeCallbacks.length; j++) {
//                    this._appChangeCallbacks[j](event);
//                }
//                this._previousAppState.screensRenderChecksum[v.id] = v.renderChecksum;
//            }
//        }
//    }
//};

/**
 *
 * Static method
 * @type {Object}
 * @return {Object}
 */
MutApp.extend = Backbone.View.extend.bind(MutApp);

/**
 * Что есть вью а что нет?
 * Хороший ответ: вью это то, что обладает собственной логикой и данными, состояниями
 * Вью:
 *      Экран - как корневой вью, контейнер
 *      буллит - есть несколько визуальных состояний, это предполагает определенную логику
 *      таймер (логика смены цифр)
 *      игровое поле в игре
 *
 * Не вью (можно просто управлять css-стилями этих элементов):
 *      кнопка
 *      опция ответа
 *      логотип
 *      заголовок, текст вопроса,
 *      Хеадер
 *      Прогресс вопросов
 *
 * Наследование
 *      Чтобы не реализовывать логику переключения типов экрнов внутри одного класса, лучше использовать наследование
 *
 * Static method
 *
 *
 * Верстка экрана должна быть адаптивная
 * Так как размер приложения может быть любым: и на вебе тоже, смотря какое выберет пользователь
 */
MutApp.Screen = Backbone.View.extend({
    /**
     * Сабвью которые включены в этот экран
     */
    children: [],
    /**
     * Возможность обновить контрольную сумму при рендере экрана.
     * Это будет сигналом для платформы что экран прошел рендер и его надо обновить.
     *
     * Кейс:
     * Приложение рендерит пустой экран, а потом загружает данные для рендера (большая картинка в панорамах). После загрузки рендерит заново.
     * При повторном рендере контрольнач сумма будет изменена, что даст сигнал для обновдения в движке
     *
     * @param {number}
     */
    renderChecksum: undefined,
    /**
     * Только для режима приложения edit
     * Это ссылки на MutAppProperty связанные с этим экранов, то есть MutAppProperty для которых data-app-property
     * есть на экране
     * Или CssMutAppProperty для которых cssSelector соответствует элементам на экране
     */
    _linkedMutAppProperties: null,
    /**
     * Значения, которые могут быть установлены в initialize автоматически
     */
    defaultsToSetInInitialize: [
        {key: 'id', value: null},
        {key: 'type', value: null},
        {key: 'group', value: null},
        {key: 'arrayAppPropertyString', value: null},
        {key: 'name', value: null},
        {key: 'hideScreen', value: false},
        {key: 'draggable', value: true},
        {key: 'canAdd', value: false},
        {key: 'canClone', value: false},
        {key: 'canDelete', value: false},
        {key: 'collapse', value: false}
    ],
    /**
     *
     */
    super: {
        initialize: function(param) {
            // установить необходимые экрану свойства по умолчанию
            MutApp.Util.setDefaultProperties(this, param, this.defaultsToSetInInitialize);
            if (!this.id) {
                throw new Error('MutApp.Screen.initialize: Screen id must be specified.');
            }
            // Найти в этом экране свойства MutAppProperty и установить application туда
            var prop = null;
            for (var key in this) {
                prop = this[key];
                if (MutApp.Util.isMutAppProperty(prop) === true) {
                    this.model.application.linkMutAppProperty(prop);
                }
            }
            // MutApp.EVENT_SCREEN_CREATED еще рано звать: клиентский initialize еще не закончен, экран не добавлен в список _screens
        }
    },

    /**
     * Главный метод экрана который должен быть переопределен
     */
    render: function() {
        // your code
        // ...
        // this.renderCompleted();
        // return this;
    },

    /**
     * После каждого рендера движок должен произвести необходимые операции
     */
    renderCompleted: function() {
        if (this.model.application.mode === 'edit') {
            this._linkedMutAppProperties = [];
            this._findAndAttachAppProperty();
            this._findAndAttachCssAppProperty();
            // обновить значения css свойств - что-то могло измениться согласно логике render() экрана
            this.model.application.updateCssMutAppPropertiesValues(this);
        }
        // вызвать события о рендере экрана
        this.model.application.trigger(MutApp.EVENT_SCREEN_RENDERED, {
            screenId: this.id
        });
    },

    /**
     * Список слинкованных с экраном свойств
     * @returns {Array}
     */
    getLinkedMutAppProperties: function() {
        return this._linkedMutAppProperties;
    },

    /**
     * 1) Найти в экране элементы с атрибутами data-app-property
     * 2) Записать в MutAppProperty ссылку на этот dom-элемент
     *
     * @returns {Number}
     * @private
     */
    _findAndAttachAppProperty: function() {
        var dataElems = this.$el.find('[data-app-property]');
        if (dataElems.length > 0) {
            for (var j = 0; j < dataElems.length; j++) {
                var atr = $(dataElems[j]).attr('data-app-property');
                var psArr = atr.split(',');
                for (var k = 0; k < psArr.length; k++) {
                    var tspAtr = psArr[k].trim();
                    var ap = this.model.application.getProperty(tspAtr);
                    if (ap!==null) {
                        ap.uiElement = dataElems[j];
                        this._linkedMutAppProperties.push(ap);
                    }
                    else {
                        console.error('MutApp.Screen._findAndAttachAppProperty: app does not has this mutAppProperty \''+tspAtr+'\' (but it was found on screen)');
                    }
                }
            }
        }
        return dataElems.length;
    },

    /**
     * 1) Для CssMutAppProperty найти по селектору элементы на этом экране
     * 2) В атрибут data-app-property дописать propertyString
     * 3) В CssMutAppProperty записать ссылку на этот найденный dom-элемент
     *
     * @private
     */
    _findAndAttachCssAppProperty: function() {
        for (var i = 0; i < this.model.application._mutappProperties.length; i++) {
            var ap = this.model.application._mutappProperties[i];
            if (MutApp.Util.isCssMutAppProperty(ap) === true) {
                var elemsOnView = this.$el.find(ap.cssSelector);
                for (var k = 0; k < elemsOnView.length; k++) {
                    // добавить проперти в data-app-property атрибут, так как css свойств там возможно нет
                    this._addDataAttribute(elemsOnView[k], ap.propertyString);
                    // для экрана подготавливаем domElement связанные с appProperty, чтобы потом не искать их при каждом показе экрана
                    ap.uiElement = elemsOnView[k];
                    this._linkedMutAppProperties.push(ap);
                }
            }
        }
    },

    /**
     * Добавить новое значение в data-app-property избегая дублирования
     * prop3 -> data-app-property="prop1 prop2" = data-app-property="prop1 prop2 prop3"
     *
     * @param {DOMElement} elem html element
     * @param {string} attribute
     */
    _addDataAttribute: function(elem, attribute) {
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
});

MutApp.Model = Backbone.Model.extend({
    /**
     * Значения, которые могут быть установлены в initialize автоматически
     */
    defaultsToSetInInitialize: [
        {key: 'id', value: null},
        {key: 'application', value: null}
    ],
    /**
     *
     */
    super: {
        initialize: function(param) {
            // установить необходимые модели свойства по умолчанию
            MutApp.Util.setDefaultProperties(this, param, this.defaultsToSetInInitialize);
            if (this.application) {
                // Найти в этой модели свойства MutAppProperty и установить эту this модель туда
                var prop = null;
                for (var key in this.attributes) {
                    prop = this.attributes[key];
                    if (MutApp.Util.isMutAppProperty(prop) === true) {
                        prop._model = this;
                        this.application.linkMutAppProperty(prop);
                    }
                }
            }
        }
    }
});

/**
 * Класс утилит
 * @type {{setDefaultProperties: Function}}
 */
MutApp.Util = {
    /**
     * Установит в указанный объект параметры
     *
     * @param {object} object - объект для установки свойств в него
     * @param {object} param - приоритетные значения параметров
     * @param {object} defaults - описание имен параметров и значений по умолчанию
     */
    setDefaultProperties: function(object, param, defaults) {
        var key = null;
        for (var k = 0; k < defaults.length; k++) {
            key = defaults[k].key;
            if (param && param.hasOwnProperty(key)) {
                object[key] = param[key];
            }
            else if (object[key] === undefined){
                object[key] = defaults[k].value;
            }
        }
    },

    /**
     * Проверить соответствие между собой селектора (id=pm quiz.{{number}}.question.text) и строки propertyString (id=pm quiz.0.question.text)
     *
     * @param {string} propertyString - id=pm quiz.0.question.text
     * @param {string} selector - "id=pm quiz.{{number}}.question.text", "id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText"
     * @return {boolean}
     */
    matchPropertyString: function(propertyString, selector) {
        var selectorElems = selector.split(',');
        // selector может быть составным: через запятую перечислены несколько свойств
        for (var i = 0; i < selectorElems.length; i++) {
            var selElem = selectorElems[i].trim();
            if (propertyString === selElem) {
                return true;
            }
            var p = propertyString.replace(/(^|\.|\s)([0-9]+)(\.|\s|$)/g, function(allMatch, group1, group2, group3) {
                return allMatch.replace(group2,'{{number}}');
            });
            if (p === selElem) {
                return true;
            }
        }
        return false;
    },

    /**
     * Разобрать селектор на составляющие и вернуть объектом
     * Эта функция также может быть использована с целью определения корректности селектора.
     *
     * @param selector
     * @return {object}
     */
    parseSelector: function(selector) {
        var reg = new RegExp(/([\w]+)=([\w]+)[\s]+([\w|{|}|\.]+)/ig);
        var match = reg.exec(selector);
        if (match && match[1] && match[2] && match[3]) {
            return {
                conditionKey: match[1],
                conditionValue: match[2],
                valueKey: match[3],
                value: null
            };
        }
        return null;
    },

    /**
     * Проверить в объекте obj, содержит ли он свойства соответствующие selector
     * Например: selector==quiz.{{number}}.text
     * получаем 4-е свойства со своими значениями: quiz.0.text quiz.1.text quiz.2.text quiz.3.text
     *
     * @param obj
     * @param selector
     * @param path
     *
     * @return {Array} result
     */
    getPropertiesBySelector: function(obj, selector, path) {
        if (path) {
            path = path+'.';
        }
        else {
            path = '';
        }
        if (MutApp.Util.isMutAppProperty(obj) === true) {
            // для MutAppProperty надо искать свойство в его значении
            // например id=pm results.0.title - индекс 0 надо брать у значения массива, а не обертки MutAppProperty конечно
            obj = obj._value;
        }
        // у модели свойства надо брать через attributes
        var isModel = obj instanceof MutApp.Model;
        var result = [];
        var parts = selector.split('.');
        // селектор постепенно уменьшается и передается вглубь рекурсии
        var restSelector = parts.slice(1,parts.length).join('.');
        // Либо просто число, либо со ссылкой на переменную: quiz.{{number:currentQuestionIndex}}.options.{{number}}.points
        if (parts[0].indexOf('{{number')===0) {
            // найти все числовые свойтсва в объекте
            for (var objkey in obj) {
                if (MutApp.Util.objectHasProperty(obj, objkey) === true && isNaN(objkey)===false) {
                    // нашли совпадение. Например, это индекс массива
                    // у модели надо брать значение из атрибутов
                    var o = (isModel===true && obj.attributes[objkey]) ? obj.attributes[objkey]: obj[objkey];
                    if (restSelector.length > 0) {
                        // смотрим дальше вглубь пока не закончится селектор
                        result=result.concat(this.getPropertiesBySelector(o, restSelector, path+objkey));
                    }
                    else {
                        // дошли до конца, весь селектор сопоставлен
                        result.push({
                            path: path+objkey,
                            value: o
                        });
                    }
                }
            }
        }
        if (MutApp.Util.objectHasProperty(obj, parts[0]) === true) {
            // нашли совпадение. Например, это индекс массива
            // у модели надо брать значение из атрибутов
            var o = (isModel===true && obj.attributes[parts[0]]) ? obj.attributes[parts[0]]: obj[parts[0]];
            if (restSelector.length > 0) {
                // смотрим дальше вглубь пока не закончится селектор
                result=result.concat(this.getPropertiesBySelector(o, restSelector, path+parts[0]));
            }
            else {
                // дошли до конца, весь селектор сопоставлен
                result.push({
                    path: path+parts[0],
                    value: o
                });
            }
        }
        return result;
    },

    /**
     * Проверить содержит ли объект obj свойство key
     * учитывая то что в MutApp model свойства содержаться также в attributes
     *
     * @param {object} obj
     * @param {string} key
     */
    objectHasProperty: function(obj, key) {
        if (obj instanceof MutApp.Model === true) {
            if (obj.attributes[key] !== undefined || obj.attributes.hasOwnProperty(key) === true || key in obj === true) {
                return true;
            }
        }
        return obj[key] !== undefined || obj.hasOwnProperty(key) === true || key in obj === true;
    },

    /**
     * Установить свойство используя object path.
     * Свойство более высокого уровня должно перетирать дочерние.
     *
     * var obj = {},
     * assign(obj, "foo.bar.foobar", "Value");
     *
     * @param obj
     * @param prop
     * @param value
     */
    assignByPropertyString: function(obj, prop, value) {
        if (typeof prop === "string") {
            prop = prop.split(".");
        }
        if (prop.length > 1) {
            var e = prop.shift();
            var typeString = Object.prototype.toString.call(obj[e]);
            MutApp.Util.assignByPropertyString(obj[e] =
                typeString === "[object Object]" || typeString === "[object Array]"
                    ? obj[e]
                    : {},
                prop,
                value);
        }
        else {
            obj[prop[0]] = value;
        }
    },

    /**
     * Удалить в элементы все субэлементы, которые не содержать классов whitelist
     * Однако, элементы внутри которых вложены элементы с whiteList, также надо оставить
     *
     * @param {} element
     * @param {Array} classesWhiteList
     */
    clarifyElement: function(element, classesWhiteList) {
        var result = element.clone();
        MutApp.Util.__clarifySubElement(result, classesWhiteList);
        return result;
    },

    /**
     * Ищем в элементе потомков с классами.
     * Потомки с классами classesWhiteList оставляем, остальные удаляем.
     * Если был найден хотя бы один, возвращаем true
     *
     * @param element
     * @param classesWhiteList
     * @returns {boolean}
     * @private
     */
    __clarifySubElement: function(element, classesWhiteList) {
        var children = $(element).children();
        if (children.length === 0) {
            // конечный элемент, смотрим только на наличие классов
            if (MutApp.Util.__containClass(element, classesWhiteList) === true) {
                return true;
            }
            element.remove();
            return false;
        }
        var foundChildWithWhiteClass = false;
        for (var i = 0; i < children.length; i++) {
            var c = children[i];
            // если один из потомков имеет элемент с classesWhiteList то всю ветку надо оставлять
            var r = MutApp.Util.__clarifySubElement(c, classesWhiteList);
            if (r === true) {
                // оставляем элемент
                // и пометить что он содержит нужный элемент из classesWhiteList
                foundChildWithWhiteClass = true;
            }
        }
        // когда сам элемент имеет нужные классы или иметт таких потомков его надо оставить
        if (MutApp.Util.__containClass(element, classesWhiteList)===true || foundChildWithWhiteClass===true) {
            return true;
        }
        element.remove();
        return false;
    },

    /**
     *
     * @param element
     * @param classes
     * @returns {boolean}
     * @private
     */
    __containClass: function(element, classes) {
        for (var i = 0; i < classes.length; i++) {
            if ($(element).hasClass(classes[i])===true) {
                return true;
            }
        }
        return false;
    },

    /**
     * Сгенерировать уникальный ключ произвольной длины
     * Можно подмешать свою строку для надежности
     *
     * @param length
     * @param baseStr
     * @returns {string}
     */
    getUniqId: function(length, baseStr) {
        length = length || 99;
        baseStr = baseStr || '';
        var rand = function() {
            return Math.random().toString(36).substr(2); // remove `0.`
        };
        return MD5.calc(rand()+baseStr+rand()).substr(0,length);
    },

    /**
     * Подготовить объект для рендера в приложении
     * Объект на выходе содержит только простые свойства, и результат вызова getValue() от MutAppProperty
     *
     * @param {object} srcObject
     * @return {object}
     */
    getObjectForRender: function(srcObject) {
        var result = {};
        for (var key in srcObject) {
            if (srcObject.hasOwnProperty(key) === true) {
                if (typeof srcObject[key] === 'number' || typeof srcObject[key] === 'string' || typeof srcObject[key] === 'boolean') {
                    result[key] = srcObject[key];
                }
                else if (MutApp.Util.isMutAppProperty(srcObject[key]) === true) {
                    result[key] = srcObject[key].getValue();
                }
            }
        }
        return result;
    },

    /**
     * Проверить, что объект является MutAppProperty
     *
     * @param {*} obj
     * @return {boolean}
     */
    isMutAppProperty: function(obj) {
        return obj instanceof MutAppProperty || obj instanceof MutAppPropertyArray || obj instanceof CssMutAppProperty;
    },

    /**
     * Проверить, что объект является MutAppPropertyArray
     *
     * @param {*} obj
     * @return {boolean}
     */
    isMutAppPropertyArray: function(obj) {
        return obj instanceof MutAppPropertyArray;
    },

    /**
     * Проверить, что объект является isCssMutAppProperty
     *
     * @param {*} obj
     * @return {boolean}
     */
    isCssMutAppProperty: function(obj) {
        return obj instanceof CssMutAppProperty;
    },

    /**
     * Проверка, является ли значение одним из простых типов данных
     * @param value
     * @returns {boolean}
     */
    isPrimitive: function(value) {
        return value === undefined || value === null || typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
    },

    /**
     * Проверить что n является числом
     * @param {*} n
     * @returns {boolean}
     */
    isNumeric: function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    /**
     *
     * Based on https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
     * @returns {boolean}
     */
    deepCompare: function() {
        var details = null;
        var i, l, leftChain, rightChain;

        function compare2Objects (x, y, param) {
            param = param || {};

            var p;

            // remember that NaN === NaN returns false
            // and isNaN(undefined) returns true
            if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
                return true;
            }

            // Compare primitives and functions.
            // Check if both arguments link to the same object.
            // Especially useful on the step where we compare prototypes
            if (x === y) {
                return true;
            }

            // Works in case when functions are created in constructor.
            // Comparing dates is a common scenario. Another built-ins?
            // We can even handle functions passed across iframes
            if ((typeof x === 'function' && typeof y === 'function') ||
                (x instanceof Date && y instanceof Date) ||
                (x instanceof RegExp && y instanceof RegExp) ||
                (x instanceof String && y instanceof String) ||
                (x instanceof Number && y instanceof Number)) {
                return x.toString() === y.toString();
            }

            // MutAppProperty comparison
            if (MutApp.Util.isMutAppProperty(x) === true && MutApp.Util.isMutAppProperty(y) === true) {
                return x.compare(y);
            }

            // At last checking prototypes as good as we can
            if (!(x instanceof Object && y instanceof Object)) {
                return false;
            }

            if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
                return false;
            }

            if (x.constructor !== y.constructor) {
                details = {result: false, message: 'MutApp.Util.deepCompare: constructors are different \'' + x.constructor.name + '\' !== \'' + y.constructor.name + '\' in field \''+param.propertyName+'\''};
                return false;
            }

            if (x.prototype !== y.prototype) {
                return false;
            }

            // Check for infinitive linking loops
            if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
                return false;
            }

            // Quick checking of one object being a subset of another.
            // todo: cache the structure of arguments[0] for performance
            for (p in y) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    return false;
                }
            }

            for (p in x) {
                if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                    details = {result: false, message: 'MutApp.Util.deepCompare: property \'' + p + '\' matters'}
                    return false;
                }
                else if (typeof y[p] !== typeof x[p]) {
                    details = {result: false, message: 'MutApp.Util.deepCompare: typeof property \'' + p + '\' are not equal'}
                    return false;
                }

                switch (typeof (x[p])) {
                    case 'object':
                    case 'function':

                        leftChain.push(x);
                        rightChain.push(y);

                        if (!compare2Objects (x[p], y[p], {propertyName: p})) {
                            return false;
                        }

                        leftChain.pop();
                        rightChain.pop();
                        break;

                    default:
                        if (x[p] !== y[p]) {
                            details = {result: false, message: 'MutApp.Util.deepCompare: values of property \'' + p + '\' are not equal'}
                            return false;
                        }
                        break;
                }
            }

            return true;
        }

        if (arguments.length < 1) {
            return true; //Die silently? Don't know how to handle such case, please help...
            // throw "Need two or more arguments to compare";
        }

        for (i = 1, l = arguments.length; i < l; i++) {

            leftChain = []; //Todo: this can be cached
            rightChain = [];

            if (!compare2Objects(arguments[0], arguments[i])) {
                if (!details) {
                    details = {result: false, message: 'MutApp.Util.deepCompare: no details'};
                }
                this.compareDetails = details;
                return false;
            }
        }

        details = {result: true, message: 'MutApp.Util.deepCompare: success'};
        this.compareDetails = details;
        return true;
    },

    /**
     * Проверить является ли строка корректным селектором вида "id=pm quiz"
     * @param str
     * @returns {boolean}
     */
    isMutAppPropertySelector: function(str) {
        return MutApp.Util.parseSelector(str) !== null;
    },

    /**
     *
     * Пример такого селектора ".js-start_header fontSize"
     * @param {string} str
     * @returns {boolean}
     */
    isCssMutAppPropertySelector: function(str) {
        return MutApp.Util.parseCssMutAppPropertySelector(str) !== null;
    },

    /**
     * Попробовать распарсить строку как mutapp property css selector
     * Пример строки: ".js-start_header color"
     *
     * @param {string} str
     * @returns {cssSelector: string, cssPropertyName: string}
     */
    parseCssMutAppPropertySelector: function(str) {
        var reg = new RegExp(/^(\.([A-z0-9]|-|_)+)(\s)+(([A-z]|\-)+)$/i);
        var res = str.match(reg);
        if (res && res[1] && res[4]) {
            return {
                cssSelector: res[1],
                cssPropertyName: res[4]
            };
        }
        return null;
    },

    /**
     * Найти все суб MutAppProperty в объекте и вернуть их списком.
     * Дубликаты исключаются
     *
     * @param {object} obj
     * @return {Array} result
     */
    findMutAppPropertiesInObject: function(obj, result) {
        if (obj instanceof MutApp === true) {
            if (result === undefined) {
                // первый цикл рекурсии: сразу сообщаем что не поддерживаем
                throw new Error('MutApp.Util.findMutAppPropertiesInObject: searching in MutApp is not supported');
            }
            // не ищем в приложении во избежании циклических зависимостей: mutAppProp1 -> application -> mutAppProp1 -> application -> ...
            return;
        }
        if (obj instanceof MutApp.Model === true) {
            if (result === undefined) {
                // первый цикл рекурсии:  сразу сообщаем что не поддерживаем
                throw new Error('MutApp.Util.findMutAppPropertiesInObject: searching in MutApp.Model is not supported');
            }
            // не ищем в модели во избежании циклических зависимостей: mutAppProp1 -> model -> mutAppProp1 -> model -> ...
            return;
        }
        result = result || [];
        if (MutApp.Util.isMutAppProperty(obj) === true) {
            // исключаем дубликаты
            if (result.indexOf(obj) < 0) {
                result.push(obj);
            }
            // поиск только по value в MutAppProperty, нельзя искать в application, model и прочих свойствах
            MutApp.Util.findMutAppPropertiesInObject(obj._value, result);
        }
        else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (MutApp.Util.isPrimitive(obj[key]) === false) {
                        MutApp.Util.findMutAppPropertiesInObject(obj[key], result);
                    }
                }
            }
        }
        return result;
    },

    /**
     * Записать стили css в dom элемент
     * Будет создан или переписан элемент с ид stylesId <style id="%stylesId%" type="text/css"></style>
     *
     * @param {string} stylesId идишка style элемента
     * @param {string} cssString код, строка
     * @param {HTMLElement} container dom элемент куда вставлять стили
     */
    writeCssTo: function(stylesId, cssString, container) {
        var $style = $(container).find('#'+stylesId);
        if ($style.length === 0) {
            $style = $('<style type="text/css"></style>').attr('id',stylesId).appendTo(container);
        }
        $style.html(cssString);
    },

    /**
     * Конвертация rgba(126,0,255,100) -> #7e00ff
     * @param {string} rgb
     * @returns {string}
     */
    rgb2hex: function(rgb) {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#"+hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    },

    /**
     * проверить подходит ли строка под формат rgba(126,0,255,100)
     * @param {string} str
     * @return {boolean}
     */
    isRgb: function(str) {
        str = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        return !!str && !!str[1] && !!str[2] && !!str[3];
    }
};

var MD5 = (function () {

    var hex_chr = "0123456789abcdef";

    function rhex(num) {
        str = "";
        for (j = 0; j <= 3; j++) {
            str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
                hex_chr.charAt((num >> (j * 8)) & 0x0F);
        }
        return str;
    }

    /*
     * Convert a string to a sequence of 16-word blocks, stored as an array.
     * Append padding bits and the length, as described in the MD5 standard.
     */
    function str2blks_MD5(str) {
        nblk = ((str.length + 8) >> 6) + 1;
        blks = new Array(nblk * 16);
        for (i = 0; i < nblk * 16; i++) {
            blks[i] = 0;
        }
        for (i = 0; i < str.length; i++) {
            blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        }
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left
     */
    function rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * These functions implement the basic operation for each round of the
     * algorithm.
     */
    function cmn(q, a, b, x, s, t) {
        return add(rol(add(add(a, q), add(x, t)), s), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Take a string and return the hex representation of its MD5.
     */
    function calcMD5(str) {
        x = str2blks_MD5(str);
        a = 1732584193;
        b = -271733879;
        c = -1732584194;
        d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = ff(c, d, a, b, x[i + 10], 17, -42063);
            b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = hh(a, b, c, d, x[i + 5], 4, -378558);
            d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = add(a, olda);
            b = add(b, oldb);
            c = add(c, oldc);
            d = add(d, oldd);
        }
        return rhex(a) + rhex(b) + rhex(c) + rhex(d);
    }

    return {
        calc:calcMD5
    };
}());

/**
 * Схема свойств приложения
 *
 * @param schema
 * @constructor
 */
var MutAppSchema = function(schema) {
    this.initialize(schema);
};
/**
 *
 * @param {object} schema
 */
MutAppSchema.prototype.initialize = function(schema) {
    schema = schema || {};
    this._parentMutAppSchema = {
        // схема для свойства где хранятся кастомные стили
        "appConstructor=mutapp customCssStyles": {
        }
    };
    for (var key in this._parentMutAppSchema) {
        schema[key] = this._parentMutAppSchema[key];
    }
    this._schema = schema;
};
/**
 * Найти MutAppProperty в приложении mutapp согласно схеме
 *
 * Применение:
 * 1) Для подтверждения того что создаваемое свойство описано в схеме
 * 2) Найти элемент схемы для нового MutAppProperty и взять оттуда атрибуты: label и так далее
 *
 * @param mutAppProperty
 * @param treeElement
 * @private
 */
//MutAppSchema.prototype.find = function(mutAppProperty, mutapp, treeElement) {
//    treeElement = treeElement || this._schema;
//    for (var propStr in treeElement) {
//
//        var sel = mutapp.getPropertiesBySelector(propStr);
//        for (var i = 0; i < sel.length; i++) {
//            if (mutAppProperty === sel[i].value) {
//                return true;
//            }
//        }
//
//        var propDesc = treeElement[propStr];
//
//        if (typeof propDesc['children'] === 'object') {
//            var subres = this.find(mutAppProperty, propDesc['children'], mutapp);
//            if (subres) {
//                return subres;
//            }
//        }
//    }
//    return null;
//};
/**
 * Найти описание MutAppProperty в схеме
 * Причем один селектор может быть составной и индивидуальный одновременно
 * "id=startScr startHeaderText, id=startScr startDescription, id=startScr startButtonText": {}
 * "id=startScr startDescription": {}
 *
 * @param propertyString
 * @param treeElement
 * @returns {*}
 */
MutAppSchema.prototype.getPropertyDescription = function(propertyString, treeElement) {
    treeElement = treeElement || this._schema;
    for (var selector in treeElement) {
        if (MutApp.Util.matchPropertyString(propertyString, selector) === true) {
            return treeElement[selector];
        }
        if (typeof treeElement[selector]['children'] === 'object') {
            var subres = this.getPropertyDescription(propertyString, treeElement[selector]['children']);
            if (subres) {
                return subres;
            }
        }
    }
    return null;
};



/**
 * Функциональная обертка вокруг свойства.
 * С ее помощью можно редактировать свойства извне
 *
 * В виде функции так как необходимо инстанцировать новые объекты
 *
 * @constructor
 */
var MutAppProperty = function (param) {

    this.initialize(param);

    /**
     *
     *
     * Разделение: теперь можно установить фон для всех экранов отдельно. Свойство новое, картинка пользователя пропадет.
     * Фоновую картинку для каждого результата захотел установить
     * Добавился новый обязательный экран в начале или конце, который нельзя убрать
     * Новая верстка, в результате которой текст перестал умещаться с прежнем месте
     * Делаю фикс и добавляется новый результат. В сохраненные шаблоны пользователю надо дописывать новые результат
     * Изменяю логику результата, чтобы их стало меньше. Часть ответов пользователей пропадет
     * Изменяю базовый размер приложения, меньше чем 800x600. Все выравнивание съехало
     * Ставлю новый текст пояснения на стартовую страницу: все съезжает, либо как выбрать нулевой текст?
     * Сделаю многострочный текст: съедет выравнивание?
     * Поменять структуру quiz: нельзя
     * Поменять дефолтные значения appProperty нельзя в приложении?
     * Добавится настройка текста пояснения в вопросе: как по умолчанию пустой текст показать? так как просто вдруг начать показывать дефолт нельзя
     * Хочу добавить настройку вкл/выкл пояснения показ
     * Добавить настройку внешнего вида пояснений
     * Хочу добавить кнопку "Назад" -> потребовалось изменить существующие appProperty ?
     * В конец добавили кнопки шаринга, что-то закрыли, перекрыли?
     *
     * ОК: Добавить фото-ширина/фото-высота в фото вопросе. Но нельзя потом менять
     * ОК: Добавить лого-ширина/лого-высота. На нескольких экранах
     * ОК: Хочу добавить настройку рандомизации опций ответа
     * OK: Добавлю новые типы вопросов: надо просто добавить в тест
     * ОК: Добавляю в кнопку возможность иконки. По дефолту нельзя ее показывать, иначе съедет.
     * ОК: Добавляется таймер, он абсолют. Время вышло: это другие экраны.
     * ОК: Добавлю скрытие логотипа: по умолчанию он у всех включен.
     * ОК: Добавлю скрытие бордера кнопки: по умолчанию его видно.
     */
};

/**
 * Инициализация базовых параметров свойства
 */
MutAppProperty.prototype.initialize = function(param) {
    this.id = param.id || MutApp.Util.getUniqId(8); // param.id может передаваться при десериализации
    this.label = param.label || {RU:'MutAppProperty имя', EN:'MutAppProperty label'};
    this._getValueTimestamp = param._getValueTimestamp || undefined;
    this._setValueTimestamp = param._setValueTimestamp || undefined;
    this._bindedEvents = {};
    // выделим из propertyString имя свойства. Потребуется в дальнейшем для генерации событий об изменении свойства (только для свойств в MutAppModel)
    var pr = MutApp.Util.parseSelector(param.propertyString);
    if (pr) {
        this._propertyName = pr.valueKey;
    }
    if (this._validateDataType(param.value) === true) {
        this._value = param.value;
    }
    else {
        throw new Error('MutAppProperty.initialize: MutAppProperty implements only primitives: Number, Boolean, String, Undefined, Null. For array use MutAppPropertyArray');
    }
    if (typeof param.propertyString === 'string') {
        this.propertyString = param.propertyString;
    }
    else {
        throw new Error('MutAppProperty.initialize: propertyString is not specified for MutAppProperty. Please, specify it in constructor param');
    }
    this._model = param.model;
    this._application = param.application || null;
    this._model = param.model || null;
    this._controlFilter = null;
    this._controlFilterScreenCriteria = null;
    if (this._application) {
        this._application.linkMutAppProperty(this);
    }
    this.compareDetails = null;
    // dom элемент на экране с которым связано свойства в режиме режактирования приложения
    this.uiElement = null;
};
/**
 * Удалить MutAppProperty
 * Разработчик при удалении свойства обязан вызвать этот метод
 */
MutAppProperty.prototype.destroy = function() {
    var dsInx = this._application._mutappProperties.indexOf(this);
    if (dsInx >= 0) {
        this._application._mutappProperties.splice(dsInx, 1);
    }
    else {
        throw new Error('MutAppProperty.destroy: property \''+this.propertyString+'\' doesnot exist in _mutappProperties array');
    }
};
/**
 * Сравнение двух объектов свойств
 *
 * @param otherMProperty
 * @returns {boolean}
 */
MutAppProperty.prototype.compare = function(otherMProperty) {
    if (this.id !== otherMProperty.id ||
        this.propertyString !== otherMProperty.propertyString ||
        this._propertyName !== otherMProperty._propertyName
        // после десериализации это могут быть совсем другие инстансы приложения и модели
        // this._model !== otherMProperty._model ||
        // this._application !== otherMProperty._application
        ) {
        // сравниваются те атрибуты, которые существенны
        this.compareDetails = {
            result: false,
            message: 'MutAppProperty.compare: base attributes id, propertyString or _propertyName are not equal.'
        };
        return false;
    }
    if (MutApp.Util.deepCompare(this.label, otherMProperty.label) === false) {
        this.compareDetails = {
            result: false,
            message: 'MutAppProperty.compare: labels are not equal.'
        };
        return false;
    }
    if (this._value === otherMProperty._value) {
        // try this fast scenario at first
        this.compareDetails = {
            result: true,
            message: 'MutAppProperty.compare: success.'
        };
        return true;
    }
    var result = MutApp.Util.deepCompare(this._value, otherMProperty._value);
    this.compareDetails = {
        result: result,
        message: MutApp.Util.compareDetails ? MutApp.Util.compareDetails.message: ''
    };
    return result;
};
/**
 * Проверяет что тип данных значения подходит для этого MutAppProperty
 *
 * @returns {boolean}
 */
MutAppProperty.prototype._validateDataType = function(value) {
    return MutApp.Util.isPrimitive(value);
};
/**
 * Сериализовать MutAppProperty
 * Сохраняются только элементарные значения
 *
 * Важно, два случая:
 * 1) Когда просто сериализация MutAppProperty - надо сразу JSON.stringify
 * 2) Когда MutAppProperty в составе сложного свойства, например внутри MutAppPropetyArray, то не надо JSON.stringify, это сделает позже MutAppPropetyArray.serialize
 *
 * @returns {string}
 */
MutAppProperty.prototype.serialize = function() {
    return JSON.stringify(this._prepareSerializedObject());
};
/**
 * Подготовить свойства для сериализации в виде отдельного объекта
 * @return {object}
 */
MutAppProperty.prototype._prepareSerializedObject = function() {
    var data = {
        // special mark for deserialization
        _mutAppConstructor: 'MutAppProperty',
        id: this.id,
        propertyString: this.propertyString,
        value: this._value, // имя именно публичного параметра "value", который передается в конструктор. Не приватного "_value"
        _getValueTimestamp: this._getValueTimestamp,
        _setValueTimestamp: this._setValueTimestamp
    };
    return data;
};
/**
 * Десериализовать свойство из json-строки
 * @param {string|object} data
 */
MutAppProperty.prototype.deserialize = function(data) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    this.id = data.id;
    this._value = data.value;
    this._getValueTimestamp = data._getValueTimestamp;
    this._setValueTimestamp = data._setValueTimestamp;
    if (this._application) {
        this._application._operationCount++;
    }
};

/**
 * Установка свойства
 * Если свойство MutAppProperty объявлено внутри модели, то поддерживается отправка классического события change
 */
MutAppProperty.prototype.setValue = function(newValue) {
    if (this._validateDataType(newValue) !== true) {
        throw new Error('MutAppProperty.constructor: MutAppProperty implements only primitives: Number, Boolean, String, Undefined, Null. For array use MutAppPropertyArray');
    }
    if (this._value !== newValue) {
        this._value = newValue;
        this._setValueTimestamp = new Date().getTime();
        // событие об изменении значения от имени свойства
        this.trigger('change');
        // событие об изменении значения от имени модели
        if (this._model instanceof MutApp.Model && typeof this._propertyName === 'string') {
            this._model.trigger('change:'+this._propertyName);
        }
        if (this._application) {
            this._application._operationCount++;
            // вызвать события об изменении значения свойства в приложении (для тех кто подписан на изменения вовне приложения)
            this._application.trigger(MutApp.EVENT_PROPERTY_VALUE_CHANGED, {
                property: this,
                propertyString: this.propertyString
            });
        }
    }
};
/**
 * Получить значение mutAppProperty
 * Причем делает отметка времени, когда было получено значение последний раз
 */
MutAppProperty.prototype.getValue = function() {
    this._getValueTimestamp = new Date().getTime();
    return this._value;
};

/**
 * События поддерживаемые в MutAppProperty
 * В MutApp там отдельный богатый набор событий, не путать с ними
 *
 * @type {Array}
 */
MutAppProperty.EVENT_TYPES = ['change'];

/**
 * Привязать событие к свойству
 * Например, eventType='change' об изменении свойства
 * Полезно для MutAppProperty внутри экранов, где нет иного механизма подписки.
 * Ведь у свойств в модели есть стандартный механизм подписки Backbone
 *
 * Пример:
 *  - this.shadowEnable.bind('change', function() {...}, this);
 *
 * @param {string} eventType
 * @param {function} callback
 * @param {*} context
 */
MutAppProperty.prototype.bind = function(eventType, callback, context) {
    if (MutAppProperty.EVENT_TYPES.indexOf(eventType) >= 0) {
        if (this._bindedEvents.hasOwnProperty(eventType) !== true) {
            this._bindedEvents[eventType] = [];
        }
        if (callback) {
            this._bindedEvents[eventType].push({
                callback: callback,
                context: context
            });
        }
    }
    else {
        throw new Error('MutAppProperty.bind: event \'' + eventType + '\' is not supported');
    }
};

/**
 * Разослать события определенного типа и для определенного свойства
 * @param {string} eventType
 * @param {Object} data
 */
MutAppProperty.prototype.trigger = function(eventType, data) {
    if (this._bindedEvents[eventType]) {
        var ctx = this;
        for (var i = 0; i < this._bindedEvents[eventType].length; i++) {
            ctx = this._bindedEvents[eventType][i].context || this;
            this._bindedEvents[eventType][i].callback.call(ctx, data);
        }
    }
};


/**
 * Класс обертка для управления css свойствами
 * @param {object} param
 * @constructor
 */
var CssMutAppProperty = function(param) {
    var res = MutApp.Util.parseCssMutAppPropertySelector(param.propertyString);
    if (res && res.cssSelector && res.cssPropertyName) {
        this.cssSelector = res.cssSelector;
        this.cssPropertyName = res.cssPropertyName;
    }
    else {
        throw new Error('CssMutAppProperty constructor: invalid selector \'' + param.propertyString + '\'');
    }
    // initialize в конце метода - так как this.cssSelector и this.cssPropertyName уже должны быть установлены
    // внутри initialize будет linkApp, вызовы событий и уже заполненные свойства cssSelector cssPropertyName нужны в обработчиках
    this.initialize(param);
};
// наследуем от простого базового свойства
_.extend(CssMutAppProperty.prototype, MutAppProperty.prototype);

/**
 * Класс-обертка для управления массивом
 * @constructor
 */
var MutAppPropertyArray = function(param) {
    this.initialize(param);
};
// наследуем от простого базового свойства
_.extend(MutAppPropertyArray.prototype, MutAppProperty.prototype);
/**
 * Проверить что устанавливаемое значение является массивом
 * @param value
 * @returns {boolean}
 * @private
 */
MutAppPropertyArray.prototype._validateDataType = function(value) {
    return Array.isArray(value);
};
/**
 * Добавить новый элемент на позицию. По умолчанию в конец.
 * @param {*} element
 * @param [number] position
 */
MutAppPropertyArray.prototype.addElement = function(element, position) {
    var newArray = this._value.slice(0);
    if (Number.isInteger(position) === false || position < 0) {
        position = newArray.length;
    }
    newArray.splice(position, -1, element);
    // считается, что устанавливаем новый массив целиком
    this.setValue(newArray);
};
/**
 * Удалить элемент массива по определеной позиции
 * @param {number} position
 */
MutAppPropertyArray.prototype.deleteElement = function(position) {
    var newArray = this._value.slice(0);
    if (Number.isInteger(position) === false || position < 0) {
        throw new Error('MutAppPropertyArray.deleteElement: position must be specified');
    }
    if (position >= newArray.length) {
        position = newArray.length-1;
    }
    var deletedArrayElement = newArray.splice(position, 1);
    // согласно допущениям по документации ссылка на один MutAppProperty может быть объявлена только в одном месте в приложении
    // исследуем удаляемый элемент масива на то, что внутри могут быть MutAppProperty которые также надо теперь удалить
    var deletedSubProperties = MutApp.Util.findMutAppPropertiesInObject(deletedArrayElement);
    if (deletedSubProperties && deletedSubProperties.length > 0) {
        for (var i = 0; i < deletedSubProperties.length; i++) {
            deletedSubProperties[i].destroy();
        }
    }
    // считается, что устанавливаем новый массив целиком
    this.setValue(newArray);
};
/**
 * Создать новый элемент из прототипа и сразу добавить его в массив
 *
 * @param {string} protoFunctionPath, например 'id=pm quizProto1'
 * @param [number] position
 */
MutAppPropertyArray.prototype.addElementByPrototype = function(protoFunctionPath, position) {
    if (this.prototypes.indexOf(protoFunctionPath) >= 0) {
        var results = this._application.getPropertiesBySelector(protoFunctionPath);
        if (results && results.length > 0 && _.isFunction(results[0].value)) {
            // clone to be sure it's new JSON.parse(JSON.stringify())
            // в качестве контекста передается объект в котором нашли функцию-прототип
            var newElem = results[0].value.call(results[0].entity);
            this.addElement(newElem, position);
        }
        else {
            console.error('MutAppPropertyArray.addElementByPrototype: can not find prototype function \''+protoFunctionPath+'\'');
        }
    }
    else {
        console.error('MutAppPropertyArray.addElementByPrototype: prototype \''+protoFunctionPath+'\' is not specified for this property \''+this.propertyString+'\'');
    }
};
/**
 * Сериализовать MutAppPropertyArray
 * Сохраняются только элементарные значения
 *
 * @returns {string}
 */
MutAppPropertyArray.prototype.serialize = function() {
    return JSON.stringify(this._prepareSerializedObject());
};
/**
 * Подготовить свойства для сериализации в виде отдельного объекта
 * @return {object}
 */
MutAppPropertyArray.prototype._prepareSerializedObject = function() {
    var data = {
        // special mark for deserialization
        _mutAppConstructor: 'MutAppPropertyArray',
        id: this.id,
        propertyString: this.propertyString,
        // так как массив сложный тип данных используется рекурсивный проход по всем подсвойствам
        value: this._serializeSubProperty(this._value, []), // имя именно публичного параметра "value", который передается в конструктор. Не приватного "_value"
        _getValueTimestamp: this._getValueTimestamp,
        _setValueTimestamp: this._setValueTimestamp
    };
    return data;
};
/**
 *
 * @param obj
 * @param result
 * @returns {{}}
 * @private
 */
MutAppPropertyArray.prototype._serializeSubProperty = function(obj, result) {
    result = result || {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key) === true) {
            if (MutApp.Util.isMutAppProperty(obj[key])===true) {
                result[key] = obj[key]._prepareSerializedObject();
            }
            else if (MutApp.Util.isPrimitive(obj[key])) {
                result[key] = obj[key];
            }
            else if (Array.isArray(obj[key]) === true) {
                result[key] = this._serializeSubProperty(obj[key], []);
            }
            else {
                result[key] = this._serializeSubProperty(obj[key]);
            }
        }
    }
    return result;
};
/**
 * Десериализовать свойство из json-строки
 * В MutAppPropertyArray могут быть суб-свойства MutAppProperty
 *
 * @param {string|object} data
 */
MutAppPropertyArray.prototype.deserialize = function(data) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    // предполагается, что в data только валидные значения. Проверки не делаются
    this.id = data.id;
    this._deserializeSubProperty(data.value); // значение массива это сложный объект, внутри могут быть другие MutAppProperty
    this._value = data.value;
    this._getValueTimestamp = data._getValueTimestamp;
    this._setValueTimestamp = data._setValueTimestamp;
    if (this._application) {
        this._application._operationCount++;
    }
};
/**
 * Пройти рекурсивно по структуре объекта и создать все MutAppProperty
 *
 * @param data
 * @private
 */
MutAppPropertyArray.prototype._deserializeSubProperty = function(data) {
    for (var key in data) {
        if (data[key].hasOwnProperty('_mutAppConstructor') === true) {
            // создаем новое MutAppProperty прямо в сериализации
            var param = data[key];
            param.application = this._application;
            param.model = this._model;
            var ap = this._application.getProperty(param.propertyString);
            if (ap) {
                // свойство может уже создано (пример id=pm results.0.title). Например уже есть элемент в массиве, внутри которого id=pm results.0.title
                // и потом решили десериализовать массив целиком id=pm results
                ap.deserialize(data[key]);
            }
            else {
                ap = new window[data[key]['_mutAppConstructor']](param);
            }
            data[key] = ap;
        }
        else if (MutApp.Util.isPrimitive(data[key]) === false) {
            this._deserializeSubProperty(data[key]);
        }
    }
};


/**
 * Класс-обертка для управления объектом-позицией типа {top:0, left:0}
 *
 * @constructor
 */
var MutAppPropertyPosition = function(param) {
    this.initialize(param);
};
// наследуем от простого базового свойства
_.extend(MutAppPropertyPosition.prototype, MutAppProperty.prototype);
/**
 * Проверить что устанавливаемое значение имеет подходящий формат
 * @param value
 * @returns {boolean}
 * @private
 */
MutAppPropertyPosition.prototype._validateDataType = function(value) {
    return MutApp.Util.isNumeric(value.top)===true && MutApp.Util.isNumeric(value.left)===true;
};