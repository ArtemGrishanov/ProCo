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
     * Свойства промо проекта, которые можно редактировать
     */
    var appProperties = [];
    /**
     * Ключи свойств appProperties[i].propertyString
     * @type {Array.<string>}
     */
    var appPropertiesObjectPathes = [];
    /**
     * Прототипы для создания новых свойств
     * Прототип клонируется сколько угодно раз и добавляется в productWindow.app
     */
    var propertyPrototypes = [];
    /**
     * Экраны (слайды) промо приложения
     * Промо приложение сообщает о себе, сколько у него экранов и какие
     * @type {Array}
     */
    var appScreens = [];
    /**
     * Идишки экранов отдельно в массиве
     * @type {Array.<string>}
     */
    var appScreenIds = [];
    /**
     * Экран, для которого было показано превью;
     * Нужно для того чтобы после перезапуска приложения его запоминать и восстанавливать.
     * @type {string}
     */
    var currentPreviewScreen = null;
    /**
     * типы поддерживаемых событий
     */
    var events = ['AppPropertyInited','DOMElementChanged'];
    /**
     * Зарегистрированные колбеки на события
     * {object}
     */
    var eventCallbacks = {
        // inited: {
        //      'key1.value2': [func1, func2],
        //      'key5.path5': [func3]
        // }
    };
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
                        appPropertiesObjectPathes.push(p.propertyString);
                        send('AppPropertyInited', p.propertyString);
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
     * Создать экраны в промоприложении.
     * Движок запрашивает у промо приложения информацию об экранах с помощью
     */
    function createAppScreens() {
        appScreens = [];
        appScreenIds = [];
        var ps = productWindow.screens;
        if (ps) {
            for (var i = 0; i < ps.length; i++) {
                if (ps[i].data) {
                    // если имеются дополнительные данные их возможно вставить во view
                    // например: data-app-property="quiz.{{currentQuestion}}.text"
                    ps[i].view = parseView(ps[i].view, ps[i].data);
                }
                appScreens.push(ps[i]);
                // идишники сохраняем отдельно для быстрой отдачи их редактору единым массивом
                appScreenIds.push(ps[i].id);
            }
        }
    }

    /**
     * вставить во view данные
     *
     * @param view
     * @param data
     * @returns {*|jQuery|HTMLElement}
     */
    function parseView(view, data) {
        var newHtml = $(view).wrap('<div/>').parent().html();
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                newHtml = newHtml.replace('{{'+key+'}}', data[key].toString());
            }
        }
        return $(newHtml);
    }

    /**
     *
     * @param {string} event
     * @param {string} propertyString
     * @param {Function} clb
     */
    function on(event, propertyString, clb) {
        if (events.indexOf(event) > 0) {
            if (eventCallbacks.hasOwnProperty(event) === false) {
                eventCallbacks[event] = {};
            }
            if (eventCallbacks[event].hasOwnProperty(propertyString) === false) {
                eventCallbacks[event][propertyString] = [];
            }
            eventCallbacks[event][propertyString].push(clb);
        }
        else {
            log('Event ' + event + ' not exist', true);
        }
    }

    /**
     * Разослать события определенного типа и для определенного свойства
     * @param event
     * @param propertyString
     */
    function send(event, propertyString) {
        if (eventCallbacks[event] && eventCallbacks[event][propertyString]) {
            for (var i = 0; i < eventCallbacks[event][propertyString].length; i++) {
                eventCallbacks[event][propertyString][i]();
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
                appPropertiesObjectPathes = [];
                // надо пересоздать свойства, так как с добавлением или удалением элементов массива количество AppProperty меняется
                //TODO нужен более умный алгоритм. Пересоздавать только то что надо и когда надо
                createAppProperty(productWindow.app);
                createAppScreens();
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
        var result = {
            engine: this,
            previewScreen: currentPreviewScreen
        };
        if (currentPreviewScreen) {
            // если экран для запуска указан, то надо также передать его данные
            result.previewScreenData = getAppScreen(currentPreviewScreen).data;
        }
        return result;
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
        appPropertiesObjectPathes = [];
        testResults = [];
        // рекурсивно создает по всем свойствам app объекты AppProperty
        createAppProperty(productWindow.app);
        // создать экраны (слайды) для промо приложения
        createAppScreens();
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
     * Вернуть массив строк - ключей свойств
     * Вне Engine лучше работать с этими ключами, так как appProperties могут пересоздавать при изменении свойств
     *
     * @returns {Array.<string>}
     */
    function getAppPropertiesObjectPathes() {
        return appPropertiesObjectPathes;
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
//            p.set('domElement', domElem);
            p.domElem = domElem;
            send('DOMElementChanged', p.propertyString);
        }
        else {
            log('Could not find AppProperty for string: ' + propStr, true);
        }
    }

//    /**
//     * Запросить у промопродукта показ превью определенного экрана.
//     *
//     * @param screenId
//     */
//    function showScreenPreview(screenId) {
//        currentPreviewScreen = screenId;
//        if (typeof productWindow.showScreenPreview === 'function') {
//            for (var i = 0; i < appScreens.length; i++) {
//                if (screenId === appScreens[i].id) {
//                    productWindow.showScreenPreview(screenId, appScreens[i].data);
//                    break;
//                }
//            }
//        }
//    }

    /**
     * Вернуть ид всех доступных экранов
     * @returns {Array.<string>}
     */
    function getAppScreenIds() {
        return appScreenIds;
    }

    /**
     * Найти экран по его ид
     * @param {string} id
     * @returns {*}
     */
    function getAppScreen(id) {
        for (var i = 0; i < appScreens.length; i++) {
            if (id === appScreens[i].id) {
                return appScreens[i];
            }
        }
        return null;
    }

    global.startEngine = startEngine;
    global.test = test;

    // методы для работы со свойствами appProperties
    global.setValue = setValue;
    global.getAppPropertiesObjectPathes = getAppPropertiesObjectPathes;
    global.getAppProperties = getAppProperties;
    global.getPropertyPrototypes = getPropertyPrototypes;
    global.getPrototypesForAppProperty = getPrototypesForAppProperty;
    global.getAppProperty = getAppProperty;
    global.addArrayElement = addArrayElement;
    global.deleteArrayElement = deleteArrayElement;
    global.bind = bind;

    // events
    global.on = on;

    // методы для работы с экранами(слайдами)
    global.getAppScreenIds = getAppScreenIds;
    global.getAppScreen = getAppScreen;

    // методы для работы с шаблонами и темами
    global.exportTemplate = exportTemplate;
})(Engine);