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
     * Пресеты - это набор значений для некоторых appProperty
     * Обычно стилистических
     *
     * @type {Array}
     */
    var presets = [];
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
    var events = ['AppPropertyInited','AppPropertyValueChanged','DOMElementChanged','ScreenUpdated'];
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
     * Некоторые app проперти имеют связанные css правила, которые описываются в дескрипторы.
     * В этом случае при изменени app проперти происходит создание правила и запись его в body промо-проекта
     * Пример элемента: {selector: '.t_btn', rules: [{property: 'background-color', value: '#000'}, ...]}
     *
     * @type {Array}
     */
    var customCssRules = [];


    /**
     * Сохранить кастомный css стиль для промо проекта.
     * Потом он будет встроен в body тегом <style>
     *
     * @param selector
     * @param property
     * @param value
     */
    function saveCssRule(selector, property, value) {
        var selectorFound = false;
        for (var i = 0; i < customCssRules.length; i++) {
            var r = customCssRules[i];
            if (r.selector === selector) {
                var propertyFound = false;
                for (var j = 0; j < r.rules.length; j++) {
                    if (r.rules[j].property === property) {
                        // перезаписываем существующее css проперти
                        r.rules[j].value = value;
                        propertyFound = true;
                        break;
                    }
                }
                if (propertyFound === false) {
                    // новое проперти для этого селектора, добавить в массив
                    r.rules.push({
                        property: property,
                        value: value
                    });
                }
                selectorFound = true;
                break;
            }
        }
        if (selectorFound === false) {
            // селектор новый, добавить
            customCssRules.push({
                selector: selector,
                rules: [{
                    property: property,
                    value: value
                }]
            });
        }
    }

    /**
     * Записать стили в указанный элемент
     * @param elem
     */
    function writeCssRulesTo(elem) {
        var cssStr = '\n';
        for (var i = 0; i < customCssRules.length; i++) {
            var r = customCssRules[i];
            cssStr += r.selector+'{\n';
            for (var j = 0; j < r.rules.length; j++) {
                cssStr += '\t'+r.rules[j].property+':'+r.rules[j].value+';\n';
            }
            cssStr += '}\n';
        }
        var $style = $(elem).find('#id-custom_style');
        if ($style.length === 0) {
            $style = $('<style></style>').attr('id','id-custom_style').appendTo(elem);
        }
        $style.html(cssStr);

    }

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
     * Ищет в дексрипторе пресеты, то есть наборы свойств, которые применяются разом.
     * Создаем один раз при старте движка
     *
     * @param descriptor
     */
    function createAppPresets(descriptor) {
        presets = [];
//        // с точки зрения редактора и контролов работа будет выглядеть незаметно
//        themeAppProperty = new AppProperty(descriptor[key],'themes',{
//
//        });
//        // обязательно должна быть "пустой" пресет, так как по умолчанию он выбран
//        themeAppProperty.possibleValues = [];
        for (var key in descriptor) {
            if (descriptor[key].isPreset === true) {
                var pre = new AppProperty(null,key,descriptor[key]);
                appProperties.push(pre);
                appPropertiesObjectPathes.push(key);
                presets.push(pre);
//                themes.push(descriptor[key]);
//                presets.possibleValues.push(descriptor[key]);
            }
        }
    }
    //TODO сейчас апппроперти пресета очистится при обновлении свойств и всё
    //TODO для всех контролов надо делать регистрацию события на изменение свойства. При выборе темы так будет
    //TODO как приспособить контрол Alternative для выбора темы
    //TODO множественный setValue(Array,Array,object)?

    /**
     * Создать обертку для свойства app
     * Только для тех свойств у которых есть дескриптор
     *
     * @param {object} obj объект window.app у промо-приложения
     */
    function createAppProperty(obj, strPrefix) {
        strPrefix = (strPrefix) ?(strPrefix+'.'): '';
        for (var key in obj) {
            var str = strPrefix+key;
            // в объекте descriptor найти описания свойства
            var descInfo = findDescription(str);
            if (descInfo) {
                //TODO remove. isPrototype isTheme arent used
                if (descInfo.isPrototype === true || descInfo.isTheme === true) {
                    // не нужно анализировать прототипы как appProperty
                    // и темы пропускаем
                    continue;
                }
                log('Found AppProperty: \''+ str + '\'', false, false);
                var p = new AppProperty(obj[key],str,descInfo);
                appProperties.push(p);
                appPropertiesObjectPathes.push(p.propertyString);
                send('AppPropertyInited', p.propertyString);
            }
            if (obj[key] !== null && typeof obj[key] === 'object') {
                // идем глубже в дочерние объекты
                createAppProperty(obj[key], str);
            }
        }
    }

    /**
     * Найти все описания для свойства objectString в объекте descriptor
     *
     * @param objectString
     * @returns {*} null если ничего не найдено
     */
    function findDescription(objectString) {
        var descInfo = null;
        // в app.descriptor может быть несколько селекторов, которые соответствуют свойству
        for (var i = 0; i < productWindow.descriptor.length; i++) {
            var selector = productWindow.descriptor[i].selector;
            if (matchSelector(objectString,selector) === true) {
                descInfo = descInfo || {};
                // добавляем найденную конфигурацию в описание
                for (var key in productWindow.descriptor[i]) {
                    descInfo[key] = productWindow.descriptor[i][key];
                }
            }
        }
        return descInfo;
    }

    /**
     * Сопоставить селектор и object-path свойства
     *
     * @param {string} objectString например "quiz.0.options.1.text"
     * @param Array.<string> selector например "[startHeaderText, quiz.{{number}}.options.{{number}}.text, resultText]"
     * @returns {boolean}
     */
    function matchSelector(objectString, selector) {
        var selectorArr = selector.split(' ');
        for (var i = 0; i < selectorArr.length; i++) {
            if (objectString === selectorArr[i].trim()) {
                return true;
            }
            else if (selectorArr[i].indexOf('.') >= 0 || selectorArr[i].indexOf('{{') >= 0) {
                // Пример: selector "quiz.{{number}}.text" превращается в регулярку "quiz\.\d+\.text" и сравнивается с objectString на соответствие
                var s = selectorArr[i].replace(new RegExp('\\.','g'),'\\.').replace(new RegExp('{{number}}','ig'),'\\d+');
                var reg = new RegExp(s,'ig');
                var match = reg.exec(objectString);
                if (match && match[0] == objectString) {
                    // match[0] string itself
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Создать экраны в промоприложении.
     * Движок запрашивает у промо приложения информацию об экранах.
     * Это происходит не только в начале
     * Могут измениться свойства промоприложения, которые приведут к изменению вида экрана.
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
                    setDataAppPropertyClasses(ps[i].view);
                    writeCssRulesTo(ps[i].view);
                }
                appScreens.push(ps[i]);
                // идишники сохраняем отдельно для быстрой отдачи их редактору единым массивом
                appScreenIds.push(ps[i].id);
                send('ScreenUpdated', ps[i].id);
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
                var re = new RegExp('{{'+key+'}}','g');
                newHtml = newHtml.replace(re, data[key].toString());
            }
        }
        return $(newHtml);
    }

    /**
     * Для view промо-приложения найдем все все элементы с атрибутом data-app-property, в котором содержатся appPropertyStrings
     * Пометим классами js-app_{{appPropertyString}} такие элементы
     * @param view
     */
    function setDataAppPropertyClasses(view) {
        var elems = $(view).find('[data-app-property]');
        for (var j = 0; j < elems.length; j++) {
            var v = $(elems[j]).attr('data-app-property');
            var aps = v.split(',');
            for (var i = 0; i < aps.length; i++) {
                $(elems[j]).addClass('js-app_'+aps[i]);
            }
        }
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
                eventCallbacks[event][propertyString][i]({
                    propertyString: propertyString
                });
            }
        }
    }

    /**
     * Добавить элемент в массив
     * Полный цикл добавления элемента в массив будет выглядеть примерно так
     * 1) var p = Engine.getAppProperty('quiz.1.options');
     * 2) var c = p.getArrayElementCopy();
     * 3) Engine.addArrayElement(p, c);
     *
     * @param appProperty обертка AppProperty для свойства
     * @param value значение элемента массива
     * @param {Number} [position] - позиция для вставки
     * @param {object} [attrs] - описание смотри в setValue
     */
    function addArrayElement(appProperty, value, position, attrs) {
        // все методы работы с массивами должны сводиться к setValue
        // подготовим новый массив и сделаем установку свойства
        var key = appProperty.propertyString;
        // проверяем что в промо проекте действительно есть такой массив
        var obj = eval('productWindow.app'+convertToBracedString(key));
        if (obj && Array.isArray(obj)) {
            var newArray = JSON.parse(JSON.stringify(obj));
            if (Number.isInteger(position) === false || position < 0) {
                position = newArray.length;
            }
            newArray.splice(position, -1, value);
            // считается, что устанавливаем новый массив целиком
            this.setValue(appProperty, newArray, attrs);
        }
    }

    /**
     * Удалить элемент из массива
     * Пример:
     * 1) var p = Engine.getAppProperty('quiz.1.options');
     * 2) Engine.deleteArrayElement(p, 1);
     *
     * @param appProperty
     * @param index
     * @param {object} [attrs] - описание смотри в setValue
     */
    function deleteArrayElement(appProperty, index, attrs) {
        // подготовим новый массив и сделаем установку свойства
        var key = appProperty.propertyString;
        // проверяем что в промо проекте действительно есть такой массив
        var obj = eval('productWindow.app'+convertToBracedString(key));
        if (obj && Array.isArray(obj)) {
            var newArray = JSON.parse(JSON.stringify(obj));
            if (index >= 0 || index < newArray.length) {
                newArray.splice(index,1);
                // считается, что устанавливаем новый массив целиком
                this.setValue(appProperty, newArray, attrs);
            }
        }
    }

    /**
     * Установить значение в продукт, в объект app[key] = value
     * Будут выполнены необходимые проверки, описанные разработчиком прототипа в тестах
     *
     * @public
     * @param {AppProperty} appProperty объект-обертка свойства в промо приложении. Например, 'results[0].title' или 'randomizeQuestions'
     * @param {*} value
     * @param {boolean} [attrs.updateScreens] - Надо ли апдейтить экраны после применения свойства.
     * @param {boolean} [attrs.updateAppProperties] - Надо ли апдейтить список свойств
     * @param {boolean} [attrs.runTests] - Надо ли искать и запускать тесты
     * Например, при добавлении нового варианта ответа в тесте или вопроса -- конечно, надо.
     * При изменении текста вопроса - нет, не надо.
     * @return {}
     */
    function setValue(appProperty, value, attrs) {
        var attributes = attrs || {};
        if (attributes.hasOwnProperty('updateScreens') === false) {
            attributes.updateScreens = appProperty.updateScreens;
        }
        if (attributes.hasOwnProperty('updateAppProperties') === false) {
            attributes.updateAppProperties = appProperty.updateAppProperties;
        }
        if (attributes.hasOwnProperty('runTests') === false) {
            attributes.runTests = appProperty.runTests;
        }
        var key = appProperty.propertyString;
        var stringifiedValue = JSON.stringify(value);
        log('Changing property \''+key+'\'='+stringifiedValue);
        if (productWindow.app && productWindow.tests) {
            // обнуляем перед прогоном тестов
            testResults = [];
            if (attributes.runTests === true) {
                //TODO для сложных строк типа quiz.1.text как определять тесты? Возможно, все таки явно указывать
                for (var i = 0; i < productWindow.tests.length; i++) {
                    var s = productWindow.tests[i].toString();
                    // запускаем тесты, в которых обнаружено данное свойство
                    if (s.indexOf('.'+key) >= 0 || s.indexOf('\''+key+'\'') >= 0) {
                        // клонируем настройки приложения, чтобы на них произвести тест
                        //TODO может быть не эффективно на сложных объектах
                        var appCopy = JSON.parse(JSON.stringify(productWindow.app));
                        // делаем изменение
                        eval('appCopy'+convertToBracedString(key)+'='+stringifiedValue);
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
            }
            // после прогонов всех тестов (если они были) можно сделать вывод о том, были ли ошибки
            // если тестов не было, то тоже считаем что всё успешно
            if (isErrorInTestResults() === false) {
                // если всё хорошо завершилось, устанавливаем свойство, это безопасно
                eval('productWindow.app'+convertToBracedString(key)+'='+stringifiedValue);
                log('All tests was successful. Tests count='+testResults.length+'; \''+key+'\'='+stringifiedValue+' was set');
                // дальше перезапустить приложение
                if (typeof productWindow.start === 'function') {
                    log('Restart app');
                    // передает ссылку на себя при старте
                    productWindow.start.call(productWindow, buildProductAppParams.call(this));
                }
                // если с изменямым appProperty связаны css свойства, то записываем их
                if (appProperty.cssSelector && appProperty.cssProperty) {
                    //
                    var cssV = null;
                    if (appProperty.cssValuePattern) {
                        cssV = appProperty.cssValuePattern.replace('{{value}}',value);
                    }
                    else {
                        cssV = value;
                    }
                    saveCssRule(appProperty.cssSelector, appProperty.cssProperty, cssV);
                    writeCssRulesTo(productWindow.document.body);
                }
                // надо пересоздать свойства, так как с добавлением или удалением элементов массива количество AppProperty меняется
                //TODO нужен более умный алгоритм. Пересоздавать только свойства в массиве. Есть ли другие случаи?
                if (attributes.updateAppProperties === true) {
                    appProperties = [];
                    appPropertiesObjectPathes = [];
                    createAppProperty(productWindow.app);
                }
                if (attributes.updateScreens === true) {
                    createAppScreens();
                }
                // рассылка события для ключа key
                send('AppPropertyValueChanged', key);
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
     * @param {object} [params.app] свойства из шаблона
     * @param {object} [params.descriptor] дескриптор из шаблона
     */
    function startEngine(prodWindow, params) {
        productWindow = prodWindow;
        if (params && params.app) {
            // переписываем свойствами из шаблона
            productWindow.app = params.app;
        }
        if (params && params.descriptor) {
            // переписываем десриптором из шаблона
            productWindow.descriptor = params.descriptor;
        }
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
        // находим и создаем темы
        createAppPresets(productWindow.descriptor);
    }

    /**
     * Ищет доступные прототипы, которые можно было бы добавить в AppProperty
     * Только для массивов. AppProperty должна обязательно представлять массив.
     *
     * @param appProperty app property для которого найти прототипы
     * @returns {array<object>} например все прототипы слайдов, которые можно вставить в тест.
     */
    function getPrototypesForAppProperty(appProperty) {
        if (appProperty.isArray === true && appProperty.hasOwnProperty('canAdd')) {
            var canAddArr = appProperty.canAdd;
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

//    /**
//     * Связать свойство промо-приложения и dom-элемент
//     * UI элементы часто создаются динамически и сразу привязать их в дескрипторе нет возможности.
//     * Разработчик промо-приложения сам должен за этим следить.
//     *
//     * @param {Array|string} objectPath
//     * @param {DOMElement} domElem
//     */
//    function bind(objectPath, domElem) {
//        if (!objectPath) {
//            log('objectPath is empty in binding.');
//            return;
//        }
//        var propStr = '';
//        if (Array.isArray(objectPath)) {
//            propStr = objectPath.join('.');
//        }
//        else if (typeof objectPath === 'string') {
//            propStr = objectPath;
//        }
//        var p = getAppProperty(propStr);
//        if (p) {
////            p.set('domElement', domElem);
//            p.domElem = domElem;
//            send('DOMElementChanged', p.propertyString);
//        }
//        else {
//            log('Could not find AppProperty for string: ' + propStr, true);
//        }
//    }

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

    /**
     * Создать шаблон из прототипа. Это набор дескрипторов, который можно применить к прототипу.
     * @deprecated
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

    global.startEngine = startEngine;
    global.test = test;

    // методы для работы со свойствами appProperties
    global.setValue = setValue;
    global.getAppPropertiesObjectPathes = getAppPropertiesObjectPathes;
    global.getAppProperties = getAppProperties;
    global.getPrototypesForAppProperty = getPrototypesForAppProperty;
    global.getAppProperty = getAppProperty;
    global.addArrayElement = addArrayElement;
    global.deleteArrayElement = deleteArrayElement;
//    global.bind = bind;

    // events
    global.on = on;

    // методы для работы с экранами(слайдами)
    global.getAppScreenIds = getAppScreenIds;
    global.getAppScreen = getAppScreen;

    // методы для работы с шаблонами
    global.exportTemplate = exportTemplate;
})(Engine);