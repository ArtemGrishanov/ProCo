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
     * Проанализированная и собранная информация из descriptor.app
     * Собирается один раз при старте приложения
     * @type {null}
     */
    var calculatedAppDescriptor = null;
    /**
     * Когда происходит редактирования свойства через setValue счетчик накручивается
     * @type {number}
     */
    var operationsCount = 0;

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
                // надо проверить что value определено
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
        var cssStr = getCustomStylesString();
        var $style = $(elem).find('#id-custom_style');
        if ($style.length === 0) {
            $style = $('<style></style>').attr('id','id-custom_style').appendTo(elem);
        }
        $style.html(cssStr);
    }

    /**
     * Собирает все измененные css стили и возвращает их одной строкой
     * @returns {string}
     */
    function getCustomStylesString() {
        var cssStr = '\n';
        for (var i = 0; i < customCssRules.length; i++) {
            var r = customCssRules[i];
            cssStr += r.selector+'{\n';
            for (var j = 0; j < r.rules.length; j++) {
                cssStr += '\t'+r.rules[j].property+':'+r.rules[j].value+';\n';
            }
            cssStr += '}\n';
        }
        return cssStr;
    }

    /**
     * Возвращает объект ключ-значения со свойствами
     * propertyString:propertyValue
     * Например {"t_btn_paddingTop":"20","js-question_progress_fontColor":"#eee","showBackgroundImage":true,...}
     * Нужно при сериализации шаблона
     *
     * @return {string}
     */
    function getAppPropertiesValues() {
        var result = {};
        for (var i = 0; i < appProperties.length; i++) {
            result[appProperties[i].propertyString]=appProperties[i].propertyValue;
        }
        return result;
    }

    /**
     * Устанавливает быстро значения appProperty
     * propertyString:propertyValue
     * Например {"t_btn_paddingTop":"20","js-question_progress_fontColor":"#eee","showBackgroundImage":true,...}
     * Нужно при загрузке шаблона
     */
    function setAppPropertiesValues(values) {
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var p = getAppProperty(key);
                if (p) {
                    //TODO ускорить как-то. Занимает 2-3 секунды
                    setValue(p, values[key], {
                        updateScreens:false,
                        updateAppProperties:false,
                        runTests:false
                    });
                }
                else {
                    log('Property is not exist \''+key+'\'. Maybe it came from descriptor', true);
                }
            }
        }
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
     * Разобрать декскриптор на правила
     * Именно эта информация определяющая
     * По селекторам из дескриптора ищутся подходящие свойства в в productWindow.app
     *
     * @param desc
     */
    function createAppProperties(desc) {
        // в этот объект положим все вычисленные свойства для каждого селектора
        if (calculatedAppDescriptor===null) {
            calculatedAppDescriptor = {};
            for (var i = 0; i < desc.app.length; i++) {
                // получаем текущую запись в дескрипторе
                var curRec = desc.app[i];
                if (!curRec.selector) {
                    log('Descriptor property index\''+i+'\' has not selector',true);
                    continue;
                }
                //TODO удалить двойные пробелы
                var selectorArr = curRec.selector.split(' ');
                for (var j = 0; j < selectorArr.length; j++) {
                    var appPropertyString = selectorArr[j];
                    if (calculatedAppDescriptor.hasOwnProperty(appPropertyString)===false) {
                        // первый раз столкнулись с таким свойством-селектором, надо создать
                        calculatedAppDescriptor[appPropertyString] = {};
                    }
                    if (curRec.rules) {
                        // несколько правил может быть, они перечислены через пробел
                        //TODO удалить двойные пробелы
                        var ruleNames = curRec.rules.split(' ');
                        for (var k = 0; k < ruleNames.length; k++) {
                            var rn = ruleNames[k];
                            if (desc.rules.hasOwnProperty(rn)) {
                                mergeProperties(desc.rules[rn], calculatedAppDescriptor[appPropertyString]);
                            }
                            else {
                                log('Rule \''+rn+'\' is not exist in descriptor.rules',true);
                            }
                        }
                    }
                    // мердж со свойствами curInfo стоит после мерджа правил, так как они более приоритетны
                    mergeProperties(curRec, calculatedAppDescriptor[appPropertyString]);
                }
            }
        }
        // собрали все селекторы. Теперь нужно зарезолвить такие селекторы quiz.{{number}}.img
        var count = 0;
        for (var selector in calculatedAppDescriptor) {
            // проверяем существуют ли в productWindow такие свойства отвечающие селектору
            // например: selector==quiz.{{number}}.text
            // получаем 4-е свойства со своими значениями: quiz.0.text quiz.1.text quiz.2.text quiz.3.text
            var pp = getPropertiesBySelector(productWindow.app, selector);
            for (var q = 0; q < pp.length; q++) {
                if (getAppProperty(pp[q].path) === null) {
                    count++;
                    var p = new AppProperty(pp[q].value,
                        pp[q].path,
                        calculatedAppDescriptor[selector]);
                    p.type = 'app';
                    appProperties.push(p);
                    appPropertiesObjectPathes.push(p.propertyString);
                    send('AppPropertyInited', p.propertyString);
//                    log('AppProperty created: \''+ p.propertyString + '\'', false, false);
                }
            }
        }
        log('AppProperties created (type=app) ' + count, false);
    }

    /**
     * Создание appProperty для управления css-промо проекта вынесено в отдельную функцию
     * Оно достаточно отличается от создания обычных свойств
     * Однако в конечном итоге должен получиться единый массив appProperty для
     * монолитной работы редактора и контролов.
     *
     * @param {object} desc - объект дескриптор
     */
    function createCssProperties(desc) {
        var calculatedCssDescriptor = {};
        for (var i = 0; i < desc.css.length; i++) {
            // получаем текущую запись в дескрипторе
            var curRec = desc.css[i];
            if (!curRec.selector) {
                log('Descriptor property index\''+i+'\' has not selector',true);
                continue;
            }
            //TODO удалить двойные пробелы
            var selectorArr = curRec.selector.split(' ');
            for (var j = 0; j < selectorArr.length; j++) {
                if (curRec.rules) {
                    // несколько правил может быть, они перечислены через пробел
                    //TODO удалить двойные пробелы
                    var ruleNames = curRec.rules.split(' ');
                    for (var k = 0; k < ruleNames.length; k++) {
                        var appPropertyString = selectorArr[j]+'_'+ruleNames[k];
                        if (calculatedCssDescriptor.hasOwnProperty(appPropertyString)===false) {
                            // первый раз столкнулись с таким свойством-селектором, надо создать
                            calculatedCssDescriptor[appPropertyString] = {cssSelector:selectorArr[j]};
                        }
                        var rn = ruleNames[k];
                        if (desc.rules.hasOwnProperty(rn)) {
                            mergeProperties(desc.rules[rn], calculatedCssDescriptor[appPropertyString]);
                        }
                        else {
                            log('Rule \''+rn+'\' is not exist in descriptor.rules',true);
                        }
                        // мердж со свойствами curInfo стоит после мерджа правил, так как они более приоритетны
                        mergeProperties(curRec, calculatedCssDescriptor[appPropertyString]);
                    }
                }
            }
        }
        // все готово, теперь создаем appPropery
        var count = 0;
        for (var selector in calculatedCssDescriptor) {
            // пустая строка в качество начального значения
            var p = new AppProperty('',
                selector,
                calculatedCssDescriptor[selector]);
            p.type = 'css';
            appProperties.push(p);
            appPropertiesObjectPathes.push(p.propertyString);
            send('AppPropertyInited', p.propertyString);
            log('AppProperty created: \''+ p.propertyString + '\'', false, false);
            count++;
        }
        log('AppProperties created (type=css) ' + count, false);
    }

    function clearAppProperties() {
        var newPathes = [];
        for (var k = 0; k < appProperties.length;) {
            if (appProperties[k].type==='app') {
                // удалить этот элемент
                appProperties.splice(k,1);
                continue;
            }
            newPathes.push(appProperties[k].propertyString);
            k++;
        }
        appPropertiesObjectPathes = [];
    }

    /**
     * Проверить в объекте obj, содержит ли он свойства соответствующие selector
     * Например: selector==quiz.{{number}}.text
     * получаем 4-е свойства со своими значениями: quiz.0.text quiz.1.text quiz.2.text quiz.3.text
     *
     * @param obj
     * @param selector
     * @return {Array} result
     */
    function getPropertiesBySelector(obj, selector, path) {
        if (path) {
            path = path+'.';
        }
        else {
            path = '';
        }
        var result = [];
        var parts = selector.split('.');
        // селектор постепенно уменьшается и передается вглубь рекурсии
        var restSelector = parts.slice(1,parts.length).join('.');
        // Либо просто число, либо со ссылкой на переменную: quiz.{{number:currentQuestionIndex}}.options.{{number}}.points
        if (parts[0].indexOf('{{number')===0) {
            // найти все числовые свойтсва в объекте
            for (var objkey in obj) {
                if (obj.hasOwnProperty(objkey) && isNaN(objkey)===false) {
                    // нашли совпадение. Например, это индекс массива
                    if (restSelector.length > 0) {
                        // смотрим дальше вглубь пока не закончится селектор
                        result=result.concat(getPropertiesBySelector(obj[objkey], restSelector, path+objkey));
                    }
                    else {
                        // дошли до конца, весь селектор сопоставлен
                        result.push({
                            path: path+objkey,
                            value: obj[objkey]
                        });
                    }
                }
            }
        }
        if (obj.hasOwnProperty(parts[0])) {
            // нашли совпадение. Например, это индекс массива
            if (restSelector.length > 0) {
                // смотрим дальше вглубь пока не закончится селектор
                result=result.concat(getPropertiesBySelector(obj[parts[0]], restSelector, path+parts[0]));
            }
            else {
                // дошли до конца, весь селектор сопоставлен
                result.push({
                    path: path+parts[0],
                    value: obj[parts[0]]
                });
            }
        }
        return result;
    }

    /**
     * Найти все описания для свойства objectString в объекте descriptor
     *
     * @param objectString
     * @returns {*} null если ничего не найдено
     */
//    function findDescription(objectString) {
//        var descInfo = null;
//        // в app.descriptor может быть несколько селекторов, которые соответствуют свойству
//        for (var i = 0; i < productWindow.descriptor.length; i++) {
//            var selector = productWindow.descriptor[i].selector;
//            if (matchSelector(objectString,selector) === true) {
//                descInfo = descInfo || {};
//                // добавляем найденную конфигурацию в описание
//                for (var key in productWindow.descriptor[i]) {
//                    descInfo[key] = productWindow.descriptor[i][key];
//                }
//            }
//        }
//        return descInfo;
//    }

    /**
     * Сопоставить селектор и object-path свойства
     *
     * @param {string} objectString например "quiz.0.options.1.text"
     * @param Array.<string> selector например "[startHeaderText, quiz.{{number}}.options.{{number}}.text, resultText]"
     * @returns {boolean}
     */
//    function matchSelector(objectString, selector) {
//        var selectorArr = selector.split(' ');
//        for (var i = 0; i < selectorArr.length; i++) {
//            if (objectString === selectorArr[i].trim()) {
//                return true;
//            }
//            else if (selectorArr[i].indexOf('.') >= 0 || selectorArr[i].indexOf('{{') >= 0) {
//                // Пример: selector "quiz.{{number}}.text" превращается в регулярку "quiz\.\d+\.text" и сравнивается с objectString на соответствие
//                var s = selectorArr[i].replace(new RegExp('\\.','g'),'\\.').replace(new RegExp('{{number}}','ig'),'\\d+');
//                var reg = new RegExp(s,'ig');
//                var match = reg.exec(objectString);
//                if (match && match[0] == objectString) {
//                    // match[0] string itself
//                    return true;
//                }
//            }
//        }
//        return false;
//    }

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
                    writeCssRulesTo(ps[i].view);
                }
                // мы знаем сss классы для редактирования, так как дескриптор был разобран
                // можно сразу найти классы и data-app-property на view
                ps[i].appPropertyElements = [];
                ps[i].hints = [];
                // id нужен для соотнесения клика по элементу с нужным апп проперти в массиве appPropertyElements
                //TODO нужно подумать о таком кейсе: когда один и тот же элемент помечен как data-app-property и каким-то классом одновременно
                for (var j = 0; j < appProperties.length; j++) {
                    if (appProperties[j].type === 'css') {
                        var elemsOnView = $(ps[i].view).find(appProperties[j].cssSelector);
                        for (var k = 0; k < elemsOnView.length; k++) {
                            // добавить проперти в data-app-property атрибут, так как css свойств там нет
                            // они понадобятся чтобы по клику а этот элемент показать все проперти которые нужны
                            addDataAttribute(elemsOnView[k], appProperties[j].propertyString);
                            // для экрана подготавливаем domElement связанные с appProperty,
                            // чтобы потом не искать их при каждом показе экрана
                            ps[i].appPropertyElements.push({
                                propertyString: appProperties[j].propertyString,
                                domElement: elemsOnView[k]
                            });
                        }
                        if (appProperties[j].propertyValue === '' || appProperties[j].propertyValue === null || appProperties[j].propertyValue === undefined) {
                            // прочитать актуальное значение свойства и сохранить его
                            // если свойство ни разу не задавали, то сначала надо взять его из приложения и записать
                            // TODO далее могут быть разные сценарии: изменено где-то вовне, например самим промо приложением согласно его логике,
                            // TODO эти случаи не рассматриваем пока...
                            var actualSelector = appProperties[j].applyCssTo || appProperties[j].cssSelector;
                            if (appProperties[j].cssProperty) {
                                //$(ps[i].view).find('.js-startHeader').css('text-align')
                                //$("#id-product_iframe_cnt").find('iframe').contents().find('.js-startHeader').css('font-family');
                                appProperties[j].propertyValue = $("#id-product_iframe_cnt").find('iframe').contents().find(actualSelector).css(appProperties[j].cssProperty)
//                                appProperties[j].propertyValue = $(productScreensCnt).find(actualSelector).css(appProperties[j].cssProperty);
                            }
                            else {
                                log('No cssProperty: ' + appProperties[j].propertyString, true);
                            }
                        }
                    }
                    // заранее находим dom элементы на экране для подсказок
                    // в дальнейшем они будут активироваться при показе этого экрана
                    if (appProperties[j].hint) {
                        var hde = $(ps[i].view).find(appProperties[j].cssSelector);
                        if (hde && hde.length > 0) {
                            // если элемент для подсказки действительно был найден на текущем экране то добавляем подсказку для показа здесь
                            ps[i].hints.push({
                                text: appProperties[j].hint,
                                domElement: hde,
                                isShown: false
                            });
                        }
                    }
                }
                // далее ищем data-app-property атрибуты, чтобы сразу привязать к экрану app property
                var dataElems = $(ps[i].view).find('[data-app-property]');
                if (dataElems.length > 0) {
                    for (var j = 0; j < dataElems.length; j++) {
                        var atr = $(dataElems[j]).attr('data-app-property');
                        var psArr = atr.split(' ');
                        for (var k = 0; k < psArr.length; k++) {
                            var tspAtr = psArr[k].trim();
                            if (getAppProperty(tspAtr)!==null) {
                                ps[i].appPropertyElements.push({
                                    propertyString: tspAtr,
                                    domElement: dataElems[j]
                                });
                            }
                        }
                    }
                }

                appScreens.push(ps[i]);
                // идишники сохраняем отдельно для быстрой отдачи их редактору единым массивом
                appScreenIds.push(ps[i].id);
                send('ScreenUpdated', ps[i].id);
            }
        }
    }

    /**
     * Добавить новое значение в data-app-property избегая дублирования
     * prop3 -> data-app-property="prop1 prop2" = data-app-property="prop1 prop2 prop3"
     *
     * @param {DOMElement} elem html element
     * @param {string} attribute
     */
    function addDataAttribute(elem, attribute) {
        var exAtr = $(elem).attr('data-app-property');
        if (exAtr) {
            if (exAtr.indexOf(attribute) < 0) {
                // избегаем дублирования
                $(elem).attr('data-app-property', exAtr + ' ' + attribute);
            }
        }
        else {
            $(elem).attr('data-app-property', attribute);
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
     *
     * @return {object} - объект с ключами appPropertyStrings, которые были найдены.
     * Это могут быть ссылки на свойства, которых еще не было в productWindow.app
     */
    function setDataAppPropertyClasses(view) {
        var res = {};
        var elems = $(view).find('[data-app-property]');
        if ($(view).attr('data-app-property')) {
            // непосредственно сам view надо тоже проанализировать, так как он в поиске find не участвует
            elems.push(view);
        }
        for (var j = 0; j < elems.length; j++) {
            var v = $(elems[j]).attr('data-app-property');
            var aps = v.split(' ');
            for (var i = 0; i < aps.length; i++) {
                $(elems[j]).addClass('js-app_'+aps[i]);
                res[aps[i]] = undefined;
            }
        }
        return res;
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
                operationsCount++;
                appProperty.propertyValue = value;
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
                // Проверки на null и так далее: дескрипторе это нормально - описать редактирование свойства, а значения нет, пока первый раз его не задашь
                if (appProperty.cssSelector && appProperty.cssProperty && value !== undefined && value !== null && value !== '') {
                    var cssV = null;
                    if (appProperty.cssValuePattern) {
                        // пока поддерживается только паттерны на основе целого числа
                        // например {{number}}px
                        if (appProperty.cssValuePattern.indexOf('{{number}}') >= 0) {
                            // парсим число для того чтобы работала установка как '20', так и '20px' в контроле в редакторе
                            value = parseInt(value);
                            cssV = appProperty.cssValuePattern.replace('{{number}}',value);
                        }
                    }
                    else {
                        cssV = value;
                    }
                    saveCssRule(appProperty.applyCssTo || appProperty.cssSelector, appProperty.cssProperty, cssV);
                    //TODO здесь наверное не обязательно каждый раз писать.
                    // это мы пишем в productWindow - то есть в скрытый iframe с промо приложением, который показывается только в предпросмотре
                    writeCssRulesTo(productWindow.document.body);
                }
                // надо пересоздать свойства, так как с добавлением или удалением элементов массива количество AppProperty меняется
                //TODO нужен более умный алгоритм. Пересоздавать только свойства в массиве. Есть ли другие случаи?
                if (attributes.updateAppProperties === true) {
                    clearAppProperties();
                    createAppProperties(productWindow.descriptor);
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
     * @param {object} [params.values] свойства из шаблона например {"t_btn_paddingTop":"20","js-question_progress_fontColor":"#eee",...}
     * это объект ключ значение, чтобы установить его в appProperty
     * @param {object} [params.descriptor] дескриптор из шаблона
     */
    function startEngine(prodWindow, params) {
        productWindow = prodWindow;
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
        createAppProperties(productWindow.descriptor);
        createCssProperties(productWindow.descriptor);

        // установить css свойства, например, они могут быть взяты из шаблона
        if (params && params.values) {
            setAppPropertiesValues(params.values);
        }

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

    /**
     * Вернуть актуальные свойства приложения в виде строки
     * @return {string}
     */
    function getAppString() {
        return JSON.stringify(productWindow.app);
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
    global.getCustomStylesString = getCustomStylesString;
    global.getAppString = getAppString;
    global.getAppPropertiesValues = getAppPropertiesValues;
    global.getOperationsCount = function() { return operationsCount; }
})(Engine);