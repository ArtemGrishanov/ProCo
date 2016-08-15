/**
 * Created by artyom.grishanov on 06.07.16.
 *
 */

/**
 * Реализация наследования с помощью метода extend
 * Таким образом, наследование становится контролируемым, что лучше подходит для фреймворка.
 * Например:
 * Метод init заточен в виде конструктора
 * Можно делать какие-то проверки на корректность нового "класса", который пытается создать пользователь
 */
//(function () {
//    var initializing = false;
////        fnTest = /xyz/.test(function () {
////            xyz;
////        }) ? /\b_super\b/ : /.*/;
//
//    // The base Class implementation (does nothing)
//    this.Class = function () {
//    };
//
//    Class.extend = function (prop) {
//        // Instantiate a base class (but only create the instance,
//        // don’t run the init constructor)
//        initializing = true;
//        var prototype = new this(); // ex: new Person()
//        initializing = false;
//        // копирование новых свойств в уже сществующий прототип
//        for (var name in prop) {
//            prototype[name] = prop[name];
//        }
//        // для удобства сохраняем ссылку на предка
//        prototype._super = this.prototype;
//        // Подменяем конструктор вот этой функцией, чтобы звалась функция init как коструктор
//        function Class() {
//            // All construction is actually done in the init method
//            if (!initializing && this.init)
//                this.init.apply(this, arguments);
//        }
//        // Populate our constructed prototype object
//        Class.prototype = prototype;
//        // Enforce the constructor to be what we expect
//        Class.prototype.constructor = Class;
//        // And make this class extendable
//        Class.extend = arguments.callee;
//        return Class;
//    };
//    };
//})();

var MutApp = function() {
    this._models = [];
    this._screens = [];
    this._history = [];

    if (arguments[0]) {
        this.width = arguments[0].width;
        this.height = arguments[0].height;
        if (this.screenRoot) {
            this.screenRoot.width(this.width).height(this.height);
        }

        // значения которые надо установить по умолчанию при запуске приложения
        // значения могут относиться к Вью или Моделям
        if (arguments[0].defaults) {
            this._defaults = arguments[0].defaults;
            this._parsedDefaults = [];
            for (var key in this._defaults) {
                if (this._defaults.hasOwnProperty(key)) {
                    var parsed = MutApp.Util.parseSelector(key);
                    if (parsed !== null) {
                        parsed.value = this._defaults[key];
                        this._parsedDefaults.push(parsed);
                    }
                }
            }
        }
    }
    // вызов конструктора initialize, аналогично backbone
    this.initialize.apply(this, arguments);
};
/**
 * dom-элемент в котором помещаются все экраны
 * Создается в конструкторе приложения
 * MutApp.prototype.screenRoot = null;
 *
 * @type {null}
 */

/**
 * История показов экранов
 * Создается в конструкторе приложения
 *
 * @type {Array}
 * @private
 * MutApp.prototype._history = [];
 */

/**
 * Все экраны приложения
 * Создается в конструкторе приложения
 *
 * @type {Array}
 * @private
 * MutApp.prototype._screens = [];
 */

/**
 * Модели приложения, которые связываются с представлениями
 * Создается в кнструкторе приложения
 *
 * @type {Object}
 * @private
 * MutApp.prototype._models = [];
 */

/**
 * Связать экран с приложением
 * @param v
 */
MutApp.prototype.addScreen = function(v) {
    if (v instanceof MutApp.Screen === true) {
        this._screens.push(v);
        return v;
    }
    throw new Error('View must be a MutApp.Screen instance');
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
    throw new Error('Model must be a Backbone.Model instance');
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
 * 0) Проверить корректность входящего селектора '<filterKey>=<filterValue> propertySelector'
 * Например, 'id=mainModel quiz.{{number}}.text'
 *
 * 1) Найти в приложении вью или модели, соответствующие условию entity[filterKey]===filterValue
 * Например, model['id']==='mainModel'
 *
 * 2) далее разобрать propertySelector
 * Например, он может быть такой: quiz.{{number}}.text - это значит что свойств будет несколько
 *
 * @param {string} selector - например, 'id=mainModel quiz.{{number}}.text'
 *
 * @return {Array}
 */
MutApp.prototype.getPropertiesBySelector = function(selector) {
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
                var finded = MutApp.Util.getPropertiesBySelector(entities[i], parsedSelector.valueKey)
                if (finded && finded.length > 0) {
                    result = finded;
                    break;
                }
            }
        }
        return (result.length > 0) ? result: null;
    }
    return null;
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

//MutApp.prototype.back function() {
//    if (this._history.length >= 2) {
//        this._history.pop()
//        this.showView(this._history[this._history.length-1]);
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
     * Значения, которые могут быть установлены в initialize автоматически
     */
    defaultsToSetInInitialize: [
        {key: 'id', value: null},
        {key: 'type', value: null},
        {key: 'group', value: null},
        {key: 'name', value: null},
        {key: 'draggable', value: true},
        {key: 'canAdd', value: false},
        {key: 'canClone', value: false},
        {key: 'canDelete', value: false}
    ],
    /**
     *
     */
    super: {
        initialize: function(param) {
            // установить необходимые экрану свойства по умолчанию
            MutApp.Util.setDefaultProperties(this, param, this.defaultsToSetInInitialize);
            // screen связываетсяс application через его модель
            if (this.model && this.model.application) {
                if (this.model.application._parsedDefaults) {
                    var d, o = null;
                    for (var i = 0; i < this.model.application._parsedDefaults.length; i++) {
                        d = this.model.application._parsedDefaults[i];
                        if (d.conditionValue === this[d.conditionKey]) {
                            this[d.valueKey] = d.value;
                        }
                    }
                }
            }
        }
    },

    render: function() {
        // screen hash
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
            if (this.application && this.application._parsedDefaults) {
                var d, o = null;
                for (var i = 0; i < this.application._parsedDefaults.length; i++) {
                    d = this.application._parsedDefaults[i];
                    if (d.conditionValue === this[d.conditionKey]) {
                        o = {};
                        o[d.valueKey] = d.value;
                        this.set(o);
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
                if (((isModel===true && obj.attributes.hasOwnProperty(objKey)) || obj[objkey]!==undefined) && isNaN(objkey)===false) {
                    // нашли совпадение. Например, это индекс массива
                    // у модели надо брать значение из атрибутов
                    var o = (isModel===true) ? obj.attributes[objKey]: obj[objkey];
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
        if ((isModel===true && obj.attributes.hasOwnProperty(parts[0])) || obj[parts[0]]!==undefined) {
            // нашли совпадение. Например, это индекс массива
            // у модели надо брать значение из атрибутов
            var o = (isModel===true) ? obj.attributes[parts[0]]: obj[parts[0]];
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
    }
};

var MutAppProperty = function() {
    // класс обертка?

//    прототипы данных
//    Изменение стиля одного буллита? Или всех буллитов в приложении? Или: фон для всех экранов приложения, против фона для каждого экрана отдельно?
//        Если мне нужно создать подвид теста (с др мех ответов), то что?
//        applyStyles?
//            Зависимости: при изменении одного свойства приложения, могут измениться другие. Для движка должно быть понятно.
//        При изменении свойства должно быть понятно автоматически, какие экраны (вью) претерпели рендер
//    аналог сеттеров-геттеров для нормализации и контроля значения

    // рассылка об изменении свойства своего ?
    function set() {

    }

    function get() {

    }

    // версионирование. Случаи
    // сохраненный шаблон - это просто ключ=значение
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
}