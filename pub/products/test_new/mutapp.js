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
//})();

var MutApp = function() {
    // вызов конструктора initialize, аналогично backbone
    this.initialize.apply(this, arguments);
};
/**
 * dom-элемент в котором помещаются все экраны
 * @type {null}
 */
MutApp.prototype.screenRoot = null;
/**
 * История показов экранов
 *
 * @type {Array}
 */
MutApp.prototype.history = [];
/**
 * Все экраны приложения
 *
 * @type {Object}
 */
MutApp.prototype.screens = {};
/**
 * Модели приложения, которые связываются с представлениями
 *
 * @type {Object}
 */
MutApp.prototype.models = {};
/**
 * Отобразить вью.
 * Важно, вызов этого метода еще не гарантирует, что пользователь увидит вью. Он может быть закрыт другим вью сверху
 *
 * Instance method
 * @param v
 * @param hideOthers
 */
MutApp.prototype.showScreen = function(v) {
    $(v.el).show();
    v.isShowed = true;
    if (typeof v.onShow === 'function') {
        v.onShow();
    }
    this.updateViewsZOrder();
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
    this.updateViewsZOrder();
};

/**
 * Скрыть все экраны, которые существуют в приложении
 * Instance method
 */
MutApp.prototype.hideAllScreens = function() {
    _.each(this.Views, _.bind(function(v) {
        if (v.isShowed !== false) {
            app.hideView(v);
        }
    }), this);
};

/**
 * Получить z индекс вьюхи. Относительно других ВИДИМЫХ вью, которые есть в app.Views
 * 0 - самый топ, то есть именно его сейчас видит пользователь. Дальше по убыванию.
 * Например, подписавшись на это событие и проверяя на самый врехний индекс, вью может начать анимацию тогда и только тогда
 * когда пользователь гарантированно его увидит
 *
 */
MutApp.prototype.updateViewsZOrder = function() {
    if (!this.viewsArr) {
        this.regulateViews(this.screenRoot);
    }
    var zIndex = 0, v;
    // this.Views - находятся в порядке "снизу-вверх" в dom дереве
    for (var i = this.viewsArr.length-1; i >= 0; i--) {
        v = this.viewsArr[i];
        if (v.isShowed == true) {
            if (v['__zIndex'] !== zIndex) {
                v['__zIndex'] = zIndex;

                // если у текущего вью меняется zOrder и становится 0, то это считается пока
                // не обязательно show, а может быть hide предыдущего
                if (zIndex == 0) {
                    this.history.push(v);
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
MutApp.prototype.regulateViews = function(domElem) {
    this.viewsArr = [];
    for (var i = 0; i < domElem.children.length; i++) {
        _.each(app.Views, function(v) {
            if (app.isElement(v.el) && domElem.children[i] == v.el) {
                v['__domIndex'] = i;
                app.viewsArr.push(v);
            }
        });
    }
};

/**
 * todo
 * @param obj
 * @returns {boolean}
 */
MutApp.prototype.isElement = function(obj) {
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

//MutApp.prototype.back function() {
//    if (this.history.length >= 2) {
//        this.history.pop()
//        this.showView(this.history[this.history.length-1]);
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
 */
MutApp.Screen = Backbone.View.extend({

    id: null,
    el: null,
    group: null,
    name: null,
    draggable: true,
    canAdd: false,
    canClone: false,
    canDelete: false,
    appPropertyString: null,
    doWhenInDOM: null,

    render: function() {
        // screen hash
    }
});