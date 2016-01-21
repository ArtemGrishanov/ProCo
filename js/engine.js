/**
 * Created by alex on 29.10.15.
 */

var Engine = {};
(function (global) {
    var DESC_PREFIX='d__';
    var PROTOTYPE_PREFIX='proto__';
    //var ENTITY_ATTRS = ['text', 'css', 'link', 'visible', 'data'];
    var settings = [];
    /**
     * В ней будут накапливаться результаты тестов
     * @type {null}
     */
    var testResults = null;
    /**
     * объект window промо-приложения
     */
    var productWindow = null;
    /**
     * Свойтва промо проекта, которые можно редактировать
     */
    var appProperties = [];
    /**
     * Прототипы для создания новых свойств
     * Прототип клонируется сколько угодно раз и добавляется в productWindow.app
     */
    var propertyPrototypes = [];

    //TODO надо наверное копию сделать массива entity а то как прототип использовать

    //TODO полезно модель валидировать с версткой: идишки все проверять, события, и много еще полезных проверок.
    // не повторения идишек и так далее, все ли setting существуют и допустимые

    //if (entities) {
    //    for (var i = 0; i < entities.length; i ++) {
    //        if (entities[i].items !== undefined) {
    //            // внутри групп тоже инитим всё
    //            for (var j = 0; j < entities[i].items.length; j ++) {
    //                initEntity(entities[i].items[j]);
    //            }
    //        }
    //        initEntity(entities[i]);
    //    }
    //}
    //
    //if (states) {
    //    for (var i = 0; i < states.length; i ++) {
    //        initState(states[i]);
    //    }
    //}

    //function initEntity(entity) {
    //    if (entity.id) {
    //        console.log('Creating entity:' + entity.id);
    //        apply(entity, entity);
    //        createSettingsForEntity(entity);
    //    }
    //    else {
    //        console.error('Entity does not have id');
    //    }
    //}
    //
    //function initState(state) {
    //    if (state.trigger) {
    //        var a = state.trigger.split(':');
    //        $(a[0]).on(a[1],function(){
    //            activateState(state);
    //        });
    //    }
    //    //TODO пока не делаю настройки для state, там ID не уникальные у entity. Пока не знаю как быть
    ////    for (var j = 0; j < state.entities.length; j ++) {
    ////        createSettingsForEntity(state.entities[j]);
    ////    }
    //}

    ///**
    // * Поиск элемента по id
    // * Включая поиск по группам, есил они есть
    // *
    // * @param id
    // * @returns {*}
    // */
    //function getEntity(id) {
    //    for (var i = 0; i < entities.length; i ++) {
    //        if (entities[i].id == id) {
    //            return entities[i];
    //        }
    //        else if (entities[i].items !== undefined) {
    //            for (var j = 0; j < entities[i].items.length; j ++) {
    //                if (entities[i].items[j].id == id) {
    //                    return entities[i].items[j];
    //                }
    //            }
    //        }
    //    }
    //    return null;
    //}

    /**
     * Активировать состояние.
     * Применить стили и данные ко всем элементам
     *
     * @param state
     */
    //function activateState(state) {
    //    if (state.entities != undefined) {
    //        var eid = null, ent = null, htmlId = null, entUpdate = null;
    //        for (var i = 0; i < state.entities.length; i ++) {
    //            entUpdate = state.entities[i];
    //            eid = entUpdate.id;
    //            ent = getEntity(eid);
    //            apply(ent, entUpdate);
    //        }
    //    }
    //}

    /**
     * Применить к элементу какое-то оновление
     *
     * @param entity
     * @param update
     */
    //function apply(entity, update) {
    //    var htmlId = '#'+(entity.htmlId || entity.id);
    //    if (update.text !== undefined) {
    //        $(htmlId).text(update.text.value);
    //    }
    //    if (update.css !== undefined) {
    //        var a = update.css.value.split(':');
    //        $(htmlId).css(a[0],a[1]);
    //    }
    //    if (update.link !== undefined) {
    //        $(htmlId).attr('href',update.link.value);
    //    }
    //    if (update.visible !== undefined) {
    //        //TODO надо скопировать начальные свойства при старте. И их потом восстанавливать уметь
    //        $(htmlId).css('display',(update.visible.value === true)?'block':'none');
    //        entity.visible.value = update.visible.value;
    //    }
    //    if (update.data !== undefined) {
    //        //TODO do something
    //        //update.data.value
    //    }
    //}
    //
    ////TODO задавать стейт по умолчанию уметь
    //if (states.length > 0) {
    //    activateState(states[0]);
    //}

    ///**
    // * В одной сущности может быть несколько атрибутов, значит и несколько настроек.
    // *
    // * @param entity
    // */
    //function createSettingsForEntity(entity) {
    //    var sType = null;
    //    for (var i = 0; i < ENTITY_ATTRS.length; i++) {
    //        var propertyName = ENTITY_ATTRS[i];
    //        if (entity[propertyName] !== undefined) {
    //            //TODO может быть несколько свойств css. Сейчас предполагается только одно
    //            console.log('Setting creating for: ' + entity.id + '.' + propertyName);
    //            var s = new Setting(entity, propertyName);
    //            if (s && s.isError !== true) {
    //                settings.push(s);
    //            }
    //        }
    //    }
    //}

    ///**
    // * Обновить настройки views -> entity
    // */
    //function applySettings() {
    //    for (var i = 0; i < settings.length; i++) {
    //        // компонента setting готовит обновление для entity
    //        if (settings[i].isError !== true) {
    //            //TODO проверка нужна вот зачем: UI загружается асинхронно и двжиок не ждет будет ли он загружен или нет
    //            // а некоторых ui еще нет.
    //            var updateInfo = settings[i].getUpdateFromView();
    //            if (updateInfo !== null) {
    //                apply(settings[i].entity, updateInfo)
    //            }
    //        }
    //    }
    //}

    /**
     * Создать entity и поместить её в массив entities
     * уникальный id будет создан
     * DOM элемент, если надо, будет создан
     *
     * @param prototypeId
     */
    //function createEntity(prototypeId) {
    //    var e = null;
    //    var p = getPrototype(prototypeId);
    //    if (p) {
    //
    //    }
    //    return e;
    //}

    /**
     * Найти и вернуть прототип с заданным prototypeId
     *
     * @param prototypeId
     * @returns {*}
     */
    //function getPrototype(prototypeId) {
    //    if (prototypes) {
    //        for (var i = 0; i < prototypes.length; i ++) {
    //            if (prototypes[i].prototypeId == prototypeId) {
    //                return prototypes[i];
    //            }
    //        }
    //    }
    //    return null;
    //}

    var testMode = false;
    /**
     * Проверяет выражение на верность.
     * Двойное назначение этой функции: проверка в модульных тестах, во-вторых проверка ограничений во время работы пользователя
     * Для модульных тестов требуется подключение QUnit
     *
     * @param actual - выражение, которое требуется проверить
     * @param expected - значение, которое ожидается
     * @param message - сообщение, которое объясняет что и почему проверяем
     */
    function test(actual, expected, message) {
        // тестовый режим означает, что программа находится в режиме тестового прогона
        // и что используется библиотека модульных тестов для сбор и визуализации
        if (testMode === true) {
            QUnit.equals(actual, expected, message);
        }
        else {
            // обычный режим проверки свойств
            if (actual != expected) {
                testResults.push({
                    result: 'error',
                    actual: actual,
                    expected: expected,
                    message: message
                });
                log('actual='+actual+' expected='+expected+' message='+message, true);
            }
            else {
                testResults.push({
                    result: 'success',
                    actual: actual,
                    expected: expected,
                    message: message
                });
            }
        }
        return true;
    }

    /**
     * Ищет и создает прототипы свойств в productWindow.app
     * Прототипы нужны для того, чтобы создавать новые элементы в массивах
     * Например, в тесте есть различные типы вопросов. Пользователь может создавать любое количество различных типов слайдов в одном массиве
     *
     * @param obj
     */
    function createAppPrototypes(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                // если это не дескриптор, а просто свойство
                if (key.indexOf(PROTOTYPE_PREFIX) === 0) {
                    log('Property prototype: \''+ key + '\' found');
                    propertyPrototypes.push(obj[key]);
                }
            }
        }
    }

    /**
     * Создать обертку для свойства app
     * Только для тех свойств у которых есть дескриптор
     *
     * @param {object} obj объект window.app у промо-приложения
     */
    function createAppProperty(obj, strPrefix) {
        strPrefix = strPrefix || '';
        strPrefix += '.';
        for (var key in obj) {
            // прототипы не надо рассматривать и искать в них AppProperty
            if (obj.hasOwnProperty(key) && key.indexOf(PROTOTYPE_PREFIX)!==0) {
                // если это не дескриптор, а просто свойство
                if (key.indexOf(DESC_PREFIX)!==0) {
                    // смотрим, есть ли у него дескриптор
                    if (obj.hasOwnProperty(DESC_PREFIX+key)) {
                        var str = strPrefix + key;
                        log('Property string: \''+ str + '\' and desc found: ' + obj[DESC_PREFIX+key]);
                        var p = new AppProperty(obj[key],str,obj[DESC_PREFIX+key]);
                        appProperties.push(p);
                    }
                }
                if (obj[key] !== null && typeof obj[key] === 'object') {
                    // идем глубже
                    createAppProperty(obj[key], strPrefix + key);
                }
            }
        }
    }

    /**
     * Добавить элемент в массив
     *
     * @param appProperty обертка AppProperty для свойства
     * @param value значение элемента массива
     */
    function addArrayElement(appProperty, value, position) {
        // все методы работы с массивами должны сводиться к setValue
        // подготовим новый массив и сделаем установку свойства
        var key = appProperty.propertyString;
        if (productWindow.app.hasOwnProperty(key) && Array.isArray(productWindow.app[key])) {
            var newArray = JSON.parse(JSON.stringify(productWindow.app[key]));
            if (position < 0) {
                position = 0;
            }
            newArray.splice(position, -1, value);
            // считается, что устанавливаем новый массив целиком
            this.setValue(appProperty, newArray);
        }
    }

    function deleteArrayElement(appProperty, index) {

    }

    /**
     * Установить значение в продукт, в объект app[key] = value
     * Будут выполнены необходимые проверки, описанные разработчиком прототипа в тестах
     *
     * @public
     * @param {AppProperty} appProperty объект-обертка свойства в промо приложении. Например, 'results[0].title' или 'randomizeQuestions'
     * @param {*} value
     * @return {}
     */
    function setValue(appProperty, value) {
        var key = appProperty.propertyString;
        var stringifiedValue = JSON.stringify(value);
        log('Changing property \''+key+'\'='+stringifiedValue);
        if (productWindow.app && productWindow.tests) {
            // обнуляем перед прогоном тестов
            testResults = [];
//            var needQuatas = (typeof value === 'string');
            //TODO для сложных строк типа quiz.1.text как определять тесты? Возможно, все таки явно указывать
            for (var i = 0; i < productWindow.tests.length; i++) {
                var s = productWindow.tests[i].toString();
                // запускаем тесты, в которых обнаружено данное свойство
                if (s.indexOf('.'+key) >= 0 || s.indexOf('\''+key+'\'') >= 0) {
                    // клонируем настройки приложения, чтобы на них произвести тест
                    //TODO может быть не эффективно на сложных объектах
                    var appCopy = JSON.parse(JSON.stringify(productWindow.app));
                    // делаем изменение
//                    if (needQuatas === true) {
//                        eval('appCopy.'+key+'=\''+stringifiedValue+'\'');
//                    }
//                    else {
                        eval('appCopy.'+key+'='+stringifiedValue);
//                    }
                    try {
                        // запускаем тест на новых настройках, результаты собираются в переменную
                        log('Running test...');
                        productWindow.tests[i].call(productWindow, appCopy, this);
                    }
                    catch(e) {
                        // что-то непредвиденное тоже обрабатываем, так как запускаются клиентские тесты
                        testResults.push({
                            result: 'error',
                            message: e
                        });
                        log(e, true);
                    }
                }
            }
            // после прогонов всех тестов (если они были) можно сделать вывод о том, были ли ошибки
            // если тестов не было, то тоже считаем что всё успешно
            if (isErrorInTestResults() === false) {
                // если всё хорошо завершилось, устанавливаем свойство, это безопасно
//                if (needQuatas === true) {
//                    eval('productWindow.app.'+key+'=\''+stringifiedValue+'\'');
//                }
//                else {
                    eval('productWindow.app'+convertToBracedString(key)+'='+stringifiedValue);
//                }
                log('All tests was successful. Tests count='+testResults.length+'; \''+key+'\'='+stringifiedValue+' was set');
                // дальше перезапустить приложение
                if (typeof productWindow.start === 'function') {
                    log('Restart app');
                    // передает ссылку на себя при старте
                    productWindow.start.call(productWindow, buildProductAppParams.call(this));
                }
                appProperties = [];
                // надо пересоздать свойства, так как с добавлением или удалением элементов массива количество AppProperty меняется
                //TODO нужен более умный алгоритм. Пересоздавать только то что надо и когда надо
                createAppProperty(productWindow.app);
                return {result: 'success', message: ''};
            }
            log('Tests contain errors. Cannot set \''+key+'\'='+stringifiedValue);
            return {result: 'error', message: ''};
        }
        else {
            log('You must set windows.app and windows.test properties in your promoapp', true);
        }
        return {result: 'error', message: ''};
    }

    function isErrorInTestResults() {
        if (testResults) {
            for (var i = 0; i < testResults.length; i++) {
                if (testResults[i].result === 'error') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Подготовить параметры для передачи в промо приложение при запуске
     *
     * @returns {{engine: buildProductAppParams, startSlide: number}}
     */
    function buildProductAppParams() {
        return {
            engine: this,
            startSlide: 0
        }
    }

    /**
     * Запуск платформы
     * Можно запустить, когда в браузер загружен промо-проект
     *
     * @param prodWindow объект window промо проекта для его редактирования
     */
    function startEngine(prodWindow) {
        productWindow = prodWindow;
        if (productWindow.app === undefined) {
            console.error('app object must be specified');
        }

        if (productWindow.tests === undefined) {
            console.error('tests array must be specified');
        }

        if (productWindow.start === undefined) {
            console.error('start function must be specified');
        }
        // вызываем start передавая в промо-приложение параметры
        productWindow.start.call(productWindow, buildProductAppParams.call(this));
        appProperties = [];
        testResults = [];
        // рекурсивно создает по всем свойствам app объекты AppProperty
        createAppProperty(productWindow.app);
        // находим и создаем шаблоны
        createAppPrototypes(productWindow.app);
    }

    /**
     * Создать шаблон из прототипа. Это набор дескрипторов, который можно применить к прототипу.
     * @returns {string} строка, сериализованный JSON объект
     */
    function exportTemplate() {
        // ид прототипа показывает для какого прототипа подходит этот шаблон
        var templObj = {
            prototype: config.products.tests.prototypeId,
            descriptors: {},
            themes: ''
        };
        // записать дескрипторы в шаблон
        for (var i = 0; i < appProperties.length; i++) {
            var p = appProperties[i];
            if (p.descriptor.editable === true) {
                for (var key in p.descriptor) {
                    if (p.descriptor.hasOwnProperty(key)) {
                        templObj.descriptors[key] = p.descriptor[key];
                    }
                }
            }
        }
        // TODO записать темы (возможно, на первое время это просто цвета)
        var templStr = null;
        try {
            templStr = JSON.stringify(templObj);
        }
        catch(e) {
            log('Error in serializing template error: ' + e, true);
            return null;
        }
        return templStr;
    }

    /**
     * Ищет доступные прототипы, которые можно было бы добавить в AppProperty
     * Только для массивов. AppProperty должна обязательно представлять массив.
     *
     * @param appProperty app property для которого найти прототипы
     * @returns {array<object>} например все прототипы слайдов, которые можно вставить в тест.
     */
    function getPrototypesForAppProperty(appProperty) {
        if (appProperty.isArray === true && appProperty.descriptor.hasOwnProperty('canAdd')) {
            var canAddArr = appProperty.descriptor.canAdd.split(',');
            var result = null;
            for (var i = 0; i < canAddArr.length; i++) {
                if (productWindow.app.hasOwnProperty(canAddArr[i])) {
                    if (result === null) {
                        result = [];
                    }
                    // клонируем прототип. Нельзя отдавать наружу реальный объект из productWindow
                    var c = JSON.parse(JSON.stringify(productWindow.app[canAddArr[i]]));
                    result.push(c);
                }
            }
            return result;
        }
        return null;
    }

    /**
     * Найти свойство по строке
     *
     * @param propertyString строка свойства, например "background" или "quiz.2.options.1.points"
     *
     * @return {AppProperty}
     */
    function getAppProperty(propertyString) {
        for (var i = 0; i < appProperties.length; i++) {
            if (propertyString === appProperties[i].propertyString) {
                return appProperties[i];
            }
        }
        return null;
    }

//    /**
//     * Найти прототип по имени
//     * @param name имя прототипа
//     * @return {object}
//     */
//    function getPropertyPrototype(name) {
//        for (var i = 0; i < propertyPrototypes.length; i++) {
//                name нет такого поля
//            if (name === propertyPrototypes[i].name) {
//                return propertyPrototypes[i];
//            }
//        }
//        return null;
//    }

    /**
     * Вернуть свойства промо приложения
     * @returns {Array}
     */
    function getAppProperties() {
        return appProperties;
    }

    /**
     * Вернуть доступные прототипы свойств
     * @returns {Array}
     */
    function getPropertyPrototypes() {
        return propertyPrototypes;
    }

    /**
     * Связать свойство промо-приложения и dom-элемент
     * UI элементы часто создаются динамически и сразу привязать их в дескрипторе нет возможности.
     * Разработчик промо-приложения сам должен за этим следить.
     *
     * @param {Array|string} objectPath
     * @param {DOMElement} domElem
     */
    function bind(objectPath, domElem) {
        if (!objectPath) {
            log('objectPath is empty in binding.');
            return;
        }
        var propStr = '';
        if (Array.isArray(objectPath)) {
            propStr = objectPath.join('.');
        }
        else if (typeof objectPath === 'string') {
            propStr = objectPath;
        }
        var p = getAppProperty(propStr);
        if (p) {
            p.set('domElement', domElem);
        }
        else {
            log('Could not find AppProperty for string: ' + propStr, true);
        }
    }

    global.startEngine = startEngine;
    global.setValue = setValue;
    global.addArrayElement = addArrayElement;
    global.deleteArrayElement = deleteArrayElement;
    global.test = test;
    global.getAppProperties = getAppProperties;
    global.getPropertyPrototypes = getPropertyPrototypes;
    global.getPrototypesForAppProperty = getPrototypesForAppProperty;
    global.exportTemplate = exportTemplate;
    global.getAppProperty = getAppProperty;
    global.bind = bind;
})(Engine);