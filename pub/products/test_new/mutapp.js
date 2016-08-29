/**
 * Created by artyom.grishanov on 06.07.16.
 *
 */

var MutApp = function(param) {
    this.title = null;
    this.description = null;
    this._models = [];
    this._screens = [];
    this._history = [];
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
    this.shareDefaultLink = 'https://testix.me/',
    /**
     * Массив сущностей для публикации
     * Например, ид какого-то результата или достижения (которых в приложении может быть несколько)
     */
    this._shareEntities = [
        //        {
        //            id: 'result1',
        //            title: 'Название результата',
        //            description: 'Описание результата',
        //            view: domElement, // view из которого будет сделана картинка
        //            imgUrl: 'http://testix.me/.../32423534246.jpg' // картинка сгенерированная из view
        //            link: 'http://testix.me/13435255'
        //        }
    ];
    /**
     * Ид для публикации
     *
     * @type {string}
     */
    this.fbAppId = '518819781624579';
    /**
     * Класс для кнопок шаринга
     * @type {string}
     */
    this.shareFBbtnClass = 'js-mutapp_share_fb';

    // далее установка динамических свойств для приложения
    if (param) {
        if (this.screenRoot) {
            this.screenRoot.empty();
            this.screenRoot.width(this.width).height(this.height);
        }

        // значения которые надо установить по умолчанию при запуске приложения
        // значения могут относиться к Вью или Моделям
        if (param.defaults) {
            this._defaults = param.defaults;
            this._parsedDefaults = [];
            for (var key in this._defaults) {
                if (this._defaults.hasOwnProperty(key)) {
                    var parsed = MutApp.Util.parseSelector(key);
                    if (parsed !== null) {
                        parsed.value = this._defaults[key];
                        this._parsedDefaults.push(parsed);
                    }
                    else {
                        // это простое свойство вида 'key1':'value1'
                        // которое надо установить непосредственно в сам объект MutApp
                        this[key] = this._defaults[key];
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
        v.render();
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
    this._shareEntities = arr;
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
 * Установить картинку для шаринга
 *
 * @param {string} entityId
 * @param {string} imgUrl
 * @returns {*}
 */
MutApp.prototype.setImgForShare = function(entityId, imgUrl) {
    for (var i = 0; i < this._shareEntities.length; i++) {
        if (this._shareEntities[i].id === entityId) {
            this._shareEntities[i].imgUrl = imgUrl;
            break;
        }
    }
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
        if (!!ent.imgUrl===false) {
            ent.imgUrl = this.shareDefaultImgUrl;
        }
        if (!!ent.link===false) {
            ent.link = this.shareDefaultLink;
        }

        if (serviceId === 'fb') {
            if (isFakeShare !== true) {
                FB.ui({
                    method: 'feed',
                    link: ent.link,
                    name: ent.title,
                    description: ent.description,
                    picture: ent.imgUrl
                }, function(response){
                    console.log(response);
                });
            }
            return true;
        }

        //TODO other providers
    }
    return false;
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
                        //o = {};
                        //o[d.valueKey] = d.value;
                        //this.set(o);
                        // здесь подойдет установка сразу в attributes модели, так как модели создаются перед вью (всегда?) и не нужны события и прочие опции
                        // например, d.valueKey='quiz.2.question.text' d.value='Текст вопроса'
                        MutApp.Util.assignByPropertyString(this.attributes, d.valueKey, d.value); // assignByPropertyString in util/utils.js
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
    },

    /**
     * Установить свойство используя object path
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