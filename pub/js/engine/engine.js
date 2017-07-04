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
     * Имя-тип загруженного приложения (test, memoriz и так далее)
     * @type {null}
     */
    var appName = null;
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
     * Триггеры. Создаются только один раз при запуске движка
     * @type {Array}
     */
    var triggers = [];
    /**
     * Экран, для которого было показано превью;
     * Нужно для того чтобы после перезапуска приложения его запоминать и восстанавливать.
     * @type {string}
     */
    var currentPreviewScreen = null;
    /**
     * типы поддерживаемых событий
     */
    var events = ['AppPropertyInited',
        'AppPropertyValueChanged',
        'DOMElementChanged',
        'AllScreensWereUpdatedBefore', // экраны уже созданы, но перед тем как разослать каждому, вызывается эт событие
        'ScreenUpdated', // один скрин обновился, вызывается для каждого скрина отдельно
        'AllScreensWereUpdatedAfter', // после того как все экраны собраны и сообщения разосланы для всех скринов будет это вызвано
        'AppSizeChanged',
        'AppScreenRendered'
    ];
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
     * Хранилище значени, которые передаются в mutapp приложение при запуске
     * А mutapp приложение может послать сообщение в engine чтобы изменить эти значения
     * @type {{}}
     */
    var appStorage = {};

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
        var $style = $(elem).find('#'+config.common.previewCustomStylesId);
        if ($style.length === 0) {
            $style = $('<style type="text/css"></style>').attr('id',config.common.previewCustomStylesId).appendTo(elem);
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
     * Причем app и css свойства разделены
     * {app:{свойтсва апп}, css:{свойства стилей}}
     *
     * Нужно при сериализации шаблона
     *
     * @return {object}
     */
    function getAppPropertiesValues() {
        var result = {css:{},app:{}};
        for (var i = 0; i < appProperties.length; i++) {
            if (appProperties[i].type === 'css') {
                result['css'][appProperties[i].propertyString] = appProperties[i].propertyValue;
            }
            else if (appProperties[i].type === 'app') {
                result['app'][appProperties[i].propertyString] = appProperties[i].propertyValue;
            }
        }
        return result;
    }

    /**
     * Устанавливает быстро значения appProperty
     * propertyString:propertyValue
     * Например {"t_btn_paddingTop":"20","js-question_progress_fontColor":"#eee","showBackgroundImage":true,...}
     * Нужно при загрузке шаблона
     */
    function setCssPropertiesValues(values) {
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
     * По селекторам из дескриптора ищутся подходящие свойства в приложении
     *
     * @param {Object} desc
     * @param {MutApp} app
     * @param {string} param.filter - проверить и создать только те свойства в приложении, которые отвечают фильтру
     */
    function createAppProperties(desc, app, param) {
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
                // через запятую может быть несколько селекторов
                var selectorArr = curRec.selector.split(',');
                for (var j = 0; j < selectorArr.length; j++) {
                    //селектор в приложении должен соответствовать определенному формату '<filterKey>=<filterValue> value'
                    var correct = Engine.parseSelector(selectorArr[j].trim()) !== null;
                    if (correct === true) {
                        var appPropertyString = selectorArr[j].trim();
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
                    else {
                        log('Engine.createAppProperties: Invalid selector in descriptor: '+selectorArr[j], true);
                    }
                }
            }
        }
        // собрали все селекторы. Теперь нужно зарезолвить такие селекторы quiz.{{number}}.img
        var count = 0;
        for (var s in calculatedAppDescriptor) {
            // проверяем существуют ли в приложении такие свойства отвечающие propertyString
            // например: tm=id property==quiz.{{number}}.text
            // получаем 4-е свойства со своими значениями: quiz.0.text quiz.1.text quiz.2.text quiz.3.text
            var pp = app.getPropertiesBySelector(s);
            if (pp && pp.length > 0) {
                for (var q = 0; q < pp.length; q++) {
                    if (getAppProperty(pp[q].path) === null) {
                        count++;
                        // второй параметр (appProperty) это уже не селектор вида id=tm quiz.{{number}}.img
                        // а конкретный id=tm quiz.0.img
                        var p = new AppProperty(pp[q].value,
                            pp[q].propertyString,
                            calculatedAppDescriptor[s]);
                        p.type = 'app';
                        appProperties.push(p);
                        appPropertiesObjectPathes.push(p.propertyString);
                        send('AppPropertyInited', p.propertyString);
                        // log('AppProperty created: \''+ p.propertyString + '\'', false, false);
                    }
                }
            }
            else {
                log('WARNING: Engine.createAppProperties: Cannot find property in mutapp by selector: '+s+'. It can be ok or not.', true);
            }

        }
        log('Engine.createAppProperties: properties created (type=app) '+count, false);
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
        for (var key in calculatedCssDescriptor) {
            // пустая строка в качество начального значения
            var p = new AppProperty('',
                key,
                calculatedCssDescriptor[key]);
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
        // обновляем список ключей, в нем останутся только имена appproperty с типом css
        appPropertiesObjectPathes = newPathes;
    }

    /**
     * Создать триггеры - индивидуальная логика по управлению проектом
     *
     * @param {object} desc - дескриптор приложения
     */
    function createTriggers(desc) {
        triggers = [];
        if (desc.triggers) {
            for (var key in desc.triggers) {
                if (desc.triggers.hasOwnProperty(key)) {
                    var params = desc.triggers[key];
                    params.name = params.name || key;
                    var t = new AppTrigger(params);
                    triggers.push(t);
                }
            }
        }
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

        // заранее надо проставить значения по умолчанию для css appProperties
        // по css селекторам определяем значения в промо приложении в верстке
        for (var j = 0; j < appProperties.length; j++) {
            var ap = appProperties[j];
            if (ap.type==='css' && !!ap.propertyValue === false) {
                // прочитать актуальное значение свойства и сохранить его
                // если свойство ни разу не задавали, то сначала надо взять его из приложения и записать
                // TODO далее могут быть разные сценарии: изменено где-то вовне, например самим промо приложением согласно его логике,
                // TODO эти случаи не рассматриваем пока...
                var actualSelector = ap.applyCssTo || ap.cssSelector;
                if (ap.cssProperty) {
                    ap.propertyValue = $("#id-product_iframe_cnt").find('iframe').contents().find(actualSelector).css(ap.cssProperty)
                }
                else {
                    log('Engine.createAppScreens: No cssProperty in app: ' + ap.propertyString, true);
                }
            }
        }

        var ps = Engine.getApp()._screens;
        if (ps) {
            for (var i = 0; i < ps.length; i++) {
                // не нужно показывать все экраны, только те которые участвуют в редактировании приложения
                if (ps[i].hideScreen !== true) {
                    // мы знаем сss классы для редактирования, так как дескриптор был разобран
                    // можно сразу найти классы и data-app-property на view
                    var appScreen = new AppScreen(ps[i]);
                    for (var j = 0; j < appProperties.length; j++) {
                        var ap = appProperties[j];
                        if (ap.type === 'css') {
                            var findedDomElements = appScreen.findAndAttachCssAppProperty(ap);
                        }
                    }
                    appScreens.push(appScreen);
                    // идишники сохраняем отдельно для быстрой отдачи их редактору единым массивом
                    appScreenIds.push(appScreen.id);
                }
            }
            // нужно именно такое разделение событий: до, для каждого экрана, и после
            send('AllScreensWereUpdatedBefore');
            for (var i = 0; i < ps.length; i++) {
                send('ScreenUpdated', null, ps[i].id);
            }
            send('AllScreensWereUpdatedAfter');
        }
        log('Engine.createAppScreens: '+appScreens.length+' were created');
    }

    /**
     * Обработка события об изменениях в приложении: рендер экрана, изменения размеров приложения и тп
     *
     * @param {Object} e
     */
    function onAppChanged(e) {

        switch (e.type) {
            case 'mutapp_app_size_changed': {
                console.log('Engine:mutapp_app_size_changed = ' + e.app.width+'x'+ e.app.height);
                send('AppSizeChanged');
                break;
            }
            case 'mutapp_screen_rendered': {
                console.log('Engine:mutapp_screen_rendered = ' + e.screen.id);
                createAppScreens();
                send('AppScreenRendered');
                break;
            }
            case 'mutapp_engine_value_changed': {
                var str = '';
                for (var key in e.changedValues) {
                    str += key+'='+e.changedValues[key].toString()+';'
                }
                console.log('Engine:mutapp_engine_value_changed = ' + str);
                for (var key in e.changedValues) {
                    if (e.changedValues.hasOwnProperty(key)===true) {
                        appStorage[key] = e.changedValues[key];
                    }
                }
                break;
            }
            case 'mutapp_set_property_value': {
                console.log('Engine:mutapp_set_property_value = ' + e.propertyString + ' ' + e.propertyValue);
                var p = getAppProperty(e.propertyString);
                if (p) {
                    p.propertyValue = e.propertyValue;
                }
                break;
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
     *
     * @return {object} - объект с ключами appPropertyStrings, которые были найдены.
     * Это могут быть ссылки на свойства, которых еще не было в productWindow.app
     */
//    function setDataAppPropertyClasses(view) {
//        var res = {};
//        var elems = $(view).find('[data-app-property]');
//        if ($(view).attr('data-app-property')) {
//            // непосредственно сам view надо тоже проанализировать, так как он в поиске find не участвует
//            elems.push(view);
//        }
//        for (var j = 0; j < elems.length; j++) {
//            var v = $(elems[j]).attr('data-app-property');
//            var aps = v.split(',');
//            for (var i = 0; i < aps.length; i++) {
//                $(elems[j]).addClass('js-app_'+aps[i]);
//                res[aps[i]] = undefined;
//            }
//        }
//        return res;
//    }

    /**
     * Подписаться на событие в движке
     *
     * @param {string} event
     * @param {string} propertyString
     * @param {Function} clb
     */
    function on(event, propertyString, clb) {
        propertyString = propertyString || 'default';
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
    function send(event, propertyString, data) {
        propertyString = propertyString || 'default';
        if (eventCallbacks[event] && eventCallbacks[event][propertyString]) {
            for (var i = 0; i < eventCallbacks[event][propertyString].length; i++) {
                eventCallbacks[event][propertyString][i](data);
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
        //var selected = Engine.getApp().getPropertiesBySelector(appProperty.propertyString);
        //if (selected.length===1) {
        //    if (Array.isArray(selected[0].value)) {
            if (Array.isArray(appProperty.propertyValue)) {
                // не вставляем значение в существующий, а готовим новый массив, чтобы заменить целиком
                //var newArray = JSON.parse(JSON.stringify(selected[0].value));
                var newArray = JSON.parse(JSON.stringify(appProperty.propertyValue));
                if (Number.isInteger(position) === false || position < 0) {
                    position = newArray.length;
                }
                newArray.splice(position, -1, value);
                // считается, что устанавливаем новый массив целиком
                this.setValue(appProperty, newArray, attrs);
            }
            else {
                log('Engine.addArrayElement: you can add elements in array only \''+appProperty.propertyString+'\'');
            }
        //}
        //else {
        //    log('Engine.addArrayElement: must be only one result for \''+appProperty.propertyString+'\'');
        //}
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
        //var selected = Engine.getApp().getPropertiesBySelector(appProperty.propertyString);
        //if (selected.length===1) {
            //if (Array.isArray(selected[0].value)) {
            if (Array.isArray(appProperty.propertyValue)) {
                // не вставляем значение в существующий, а готовим новый массив, чтобы заменить целиком
                //var newArray = JSON.parse(JSON.stringify(selected[0].value));
                var newArray = JSON.parse(JSON.stringify(appProperty.propertyValue));
                if (index >= 0 || index < newArray.length) {
                    newArray.splice(index,1);
                    // считается, что устанавливаем новый массив целиком
                    this.setValue(appProperty, newArray, attrs);
                }
            }
            else {
                log('Engine.addArrayElement: you can add elements in array only \''+appProperty.propertyString+'\'');
            }
        //}
        //else {
        //    log('Engine.addArrayElement: must be only one result for \''+appProperty.propertyString+'\'');
        //}
    }

    /**
     * Установить значение в продукт, в объект app[key] = value
     * Будут выполнены необходимые проверки, описанные разработчиком прототипа в тестах
     *
     * @public
     * @param {AppProperty} appProperty объект-обертка свойства в промо приложении. Например, 'results[0].title' или 'randomizeQuestions'
     * @param {*} value - новое значение свойства, тип может быть любым
     * @param {boolean} [attrs.restartApp] - Надо ли перезапускать приложение mutapp. По умолчанию true, в болшинстве случаев надо, так как изменения должны быть видны на экране.
     * Но иногда изменения незначительны или произведены самим контролом на превью экрана (TextQuickInput меняет текст на превью, Drag перетаскивает элемент)
     * Если restartApp===true, только тогда имеют смысл updateScreens и updateAppProperties, так как если приложение не перезапускается, то
     * и экраны и список свойств не обновляется.
     * @param {boolean} [attrs.updateScreens] - Надо ли апдейтить экраны после применения свойства (если restartApp===true)
     * @param {boolean} [attrs.updateAppProperties] - Надо ли апдейтить список свойств (если restartApp===true)
     * @param {boolean} [attrs.runTests] - Надо ли искать и запускать тесты
     * Например, при добавлении нового варианта ответа в тесте или вопроса -- конечно, надо.
     * При изменении текста вопроса - нет, не надо.
     * @return {}
     */
    function setValue(appProperty, value, attrs) {
        var attributes = attrs || {};
        if (attributes.hasOwnProperty('restartApp') === false) {
            attributes.restartApp = appProperty.restartApp;
        }
        if (attributes.hasOwnProperty('updateScreens') === false) {
            attributes.updateScreens = appProperty.updateScreens;
        }
        if (attributes.hasOwnProperty('updateAppProperties') === false) {
            attributes.updateAppProperties = appProperty.updateAppProperties;
        }
        if (attributes.hasOwnProperty('renderScreens') === false) {
            attributes.renderScreens = appProperty.renderScreens;
        }
        if (attributes.hasOwnProperty('runTests') === false) {
            attributes.runTests = appProperty.runTests;
        }
        var pStr = appProperty.propertyString;
        // stringifiedValue for log and tests
        var stringifiedValue = JSON.stringify(value);
        log('Changing property \''+pStr+'\'='+stringifiedValue, false, false);

        if (appProperty.type === 'app') {
            var success = true;
            if (attributes.restartApp === true) {
                success = setPropertyToMutApp(pStr, value);
            }
            else {
                //TODO
                // свойство restartApp применяется в панорамах для изменения текста и позиции
                // из приложения-дубликата _dapp пересоздавались свойства createAppProperties()
                // но всё равно были тормоза при перезапуске приложения в фоне
                // Но для простых свойств: строка, объект XY скорее всего и не надо этого механизма
                // setPropertyToDuplicateMutApp(pStr, value);

                //TODO вместо перезапуска пробую устанавливать напрямую.
                // В app должны содержаться актуальные свойства, так как createAppProperties() читает оттуда значения.
                productWindow.app.setPropertyByAppString(pStr, value);
            }
            if (success === true) {
                operationsCount++;
                appProperty.propertyValue = value;
                log('Engine.setValue: property was set \''+pStr+'\'='+stringifiedValue);
            }
            else {
                log('Engine.setValue: Unable to set \''+pStr+'\'='+stringifiedValue, true);
            }
        }

        if (appProperty.type === 'css') {
            // если с изменямым appProperty связаны css свойства, то записываем их
            // Проверки на null и так далее: дескрипторе это нормально - описать редактирование свойства, а значения нет, пока первый раз его не задашь
            if (appProperty.cssSelector && appProperty.cssProperty && value !== undefined && value !== null && value !== '') {
                var cssV = parseCssPattern(appProperty, value);
                appProperty.propertyValue = cssV;
                saveCssRule(appProperty.applyCssTo || appProperty.cssSelector, appProperty.cssProperty, cssV);
                writeCssRulesTo(productWindow.document.body);
            }
        }
        // использование дубликата приложения для рассчета новых appProperties
        // когда приложение не надо перезапускать, то свойства бывает все равно надо пересчитать. Для этого используется дубликат.
        var svApp = /*(attributes.restartApp === true) ? */productWindow.app/* : productWindow._dapp*/;
        // надо пересоздать свойства, так как с добавлением или удалением элементов массива количество AppProperty меняется
        if (attributes.updateAppProperties === true) {
            clearAppProperties();
            createAppProperties(productWindow.descriptor, svApp);
        }
        if (attributes.renderScreens.length > 0) {
            // рендер некоторых экранов, если того требует свойство
            var scrn = null;
            for (var i = 0; i < attributes.renderScreens.length; i++) {
                scrn = svApp.getScreenById(attributes.renderScreens[i]);
                if (scrn && scrn.render) {
                    scrn.render();
                }
            }
        }
        if (attributes.updateScreens === true) {
            createAppScreens();
        }
        // рассылка события для ключа pStr
        send('AppPropertyValueChanged', pStr);
        return {result: 'success', message: ''};
    }

    /**
     * Подготовить значение для css правила на основе шаблона.
     *
     * @param appProperty
     * @param value
     * @returns {*}
     */
    function parseCssPattern(appProperty, value) {
        if (appProperty.cssValuePattern) {
            // пока поддерживается только паттерны на основе целого числа
            // например {{number}}px
            if (appProperty.cssValuePattern.indexOf('{{number}}') >= 0) {
                // парсим число для того чтобы работала установка как '20', так и '20px' в контроле в редакторе
                value = parseInt(value);
                return appProperty.cssValuePattern.replace('{{number}}',value);
            }
            log('Engine.parseCssPattern: Unsupported css pattern', true);
            return null;
        }
        return value;
    }

    /**
     * Старт приложения
     * @param {object} defaults свойства которые будут установлены по умолчанию в приложение
     * @return {boolen}
     */
    function startMutApp(defaults) {
        try {
            delete productWindow.app;
            var cfg = config.products[appName];
            productWindow.app = new productWindow[cfg.constructorName]({
                width: cfg.defaultWidth,
                height: cfg.defaultHeight,
                defaults: defaults,
                appChangeCallbacks: [onAppChanged],
                engineStorage: JSON.parse(JSON.stringify(appStorage))
            });
            productWindow.app.start();
        }
        catch(e) {
            log('Engine.setPropertyToMutApp: '+ e.message, true);
            return false;
        }
        return true;
    }

    /**
     * Поменять одно свойтство приложения
     * Всегда делается перезапуск
     *
     * @param {string} 'id=tm showTextixLogo'
     * @param {*} newValue
     *
     * @return {boolean}
     */
    function setPropertyToMutApp(propertyString, newValue) {
        try {
            delete productWindow.app;
            var apps = Engine.getAppPropertiesValues().app;
            var newApps = {};
            // Важно: необходимо склонировать устанавливаемое значение
            // если это объект, то могуть быть субсвойства внутри этого объекта, устанавливамые отдельно как самостоятельное AppProperty
            // в таком случае они будут переписывать родительский объект
            // например, quiz.0.answer.0.text переписывал бы родительский quiz, даже если бы тот ставился позже
            newApps[propertyString] = JSON.parse(JSON.stringify(newValue));

            var cfg = config.products[appName];
            productWindow.app = new productWindow[cfg.constructorName]({
                //TODO ширина и высота такие аппПроперти
                width: cfg.defaultWidth,
                height: cfg.defaultHeight,
                defaults: [apps, newApps],
                appChangeCallbacks: [onAppChanged],
                engineStorage: JSON.parse(JSON.stringify(appStorage))
            });
            productWindow.app.start();
        }
        catch(e) {
            log('Engine.setPropertyToMutApp: '+ e.message, true);
            return false;
        }
        return true;
    }

    function setPropertyToDuplicateMutApp(propertyString, newValue) {
        try {
            delete productWindow._dapp;
            var apps = Engine.getAppPropertiesValues().app;
            var newApps = {};
            newApps[propertyString] = JSON.parse(JSON.stringify(newValue));
            var cfg = config.products[appName];
            productWindow._dapp = new productWindow[cfg.constructorName]({
                width: cfg.defaultWidth,
                height: cfg.defaultHeight,
                defaults: [apps, newApps]
                //appChangeCallbacks: [onAppChanged] не нужно
                //engineStorage: appStorage не нужно
            });
            productWindow._dapp.start();
        }
        catch(e) {
            log('Engine.setPropertyToDuplicateMutApp: '+ e.message, true);
            return false;
        }
        return true;
    }

    /**
     * Перезапустить mutapp приложение
     * Например, может быть нужно когда меняется размер приложения
     *
     * @param {string} params.mode режим запуска
     * @returns {boolean}
     */
    function restartApp(params) {
        params = params || {};
        try {
            delete productWindow.app;
            var apps = Engine.getAppPropertiesValues().app;
            if (params.mode) {
                // один из режимов запуска, например edit || preview
                apps["appConstructor=mutapp mode"] = params.mode;
            }
            var cfg = config.products[appName];
            productWindow.app = new productWindow[cfg.constructorName]({
                //TODO ширина и высота такие аппПроперти
                width: cfg.defaultWidth,
                height: cfg.defaultHeight,
                defaults: [apps],
                appChangeCallbacks: [onAppChanged],
                engineStorage: JSON.parse(JSON.stringify(appStorage))
            });
            productWindow.app.start();
        }
        catch(e) {
            log('Engine.restartApp: '+ e.message, true);
            return false;
        }
        return true;
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
     * Запуск платформы
     * Можно запустить, когда в браузер загружен промо-проект
     *
     * @param prodWindow объект window промо проекта для его редактирования
     * @param {object} [params.app] свойства из шаблона
     * @param {object} [params.values] свойства из шаблона например {"t_btn_paddingTop":"20","js-question_progress_fontColor":"#eee",...}
     * это объект ключ значение, чтобы установить его в appProperty
     * @param {object} [params.descriptor] дескриптор из шаблона
     * @param {string} [params.appStorageString] свойства для передачи в приложение mutapp
     * Пример: appStorage=deletePins:1,foo:value2
     * @param {string} [params.appName] имя приложения: test, memoriz и так далее; они описаны в config.products[appName]
     */
    function startEngine(prodWindow, params) {
        productWindow = prodWindow;
        appName = (params) ? params.appName: null;
        if (params && params.descriptor) {
            // переписываем десриптором из шаблона
            productWindow.descriptor = params.descriptor;
        }
        if (productWindow.app === undefined) {
            console.error('app object must be specified');
        }
        if (productWindow.descriptor === undefined) {
            console.error('descriptor object must be specified');
        }
        if (!!appName===false) {
            console.error('appName must be specified');
        }

        if (params.appStorageString) {
            try {
                var vp = params.appStorageString.split(',')
                for (var key in vp) {
                    var kv = vp[key].split(':');
                    appStorage[kv[0]] = kv[1];
                }
            }
            catch (err) {
                log('Engine.startEngine: error in parsing appStorageString');
            }
        }

//        if (params && params.values && params.values.app) {
//            setAppPropertiesValues(params.values.app);
//        }

        // вызываем start передавая в промо-приложение параметры
//        productWindow.start.call(productWindow, buildProductAppParams.call(this));
        //TODO
        var success = undefined;
        if (params && params.values && params.values.app) {
            // установить значения из шаблона
            // сначала установить значения, так как на основе них потом создаются appProperty
            success = startMutApp(params.values.app);
        }
        else {
            success = startMutApp();
        }
        if (success===true) {
            appProperties = [];
            appPropertiesObjectPathes = [];
            testResults = [];
            // рекурсивно создает по всем свойствам app объекты AppProperty
            createAppProperties(productWindow.descriptor, getApp());
            createCssProperties(productWindow.descriptor);

            // css можно устанавливать уже после создания appProperties по дескриптору, роли не играет
            if (params && params.values && params.values.css) {
                setCssPropertiesValues(params.values.css);
            }

            // создать экраны (слайды) для промо приложения
            createAppScreens();
            // находим и создаем темы
            createAppPresets(productWindow.descriptor);
            // создать триггеры. Создаются только один раз
            createTriggers(productWindow.descriptor);

            // первые раз сохранить все css правила
            for (var i = 0; i < appProperties.length; i++) {
                var p = appProperties[i];
                if (p.type === 'css') {
                    // если с изменямым appProperty связаны css свойства, то записываем их
                    // Проверки на null и так далее: дескрипторе это нормально - описать редактирование свойства, а значения нет, пока первый раз его не задашь
                    if (p.cssSelector && p.cssProperty && p.propertyValue !== undefined && p.propertyValue !== null && p.propertyValue !== '') {
                        var cssV = parseCssPattern(p, p.propertyValue);
                        saveCssRule(p.applyCssTo || p.cssSelector, p.cssProperty, cssV);
                    }
                }
            }
            writeCssRulesTo(productWindow.document.body);
        }
        else {
            log('Engine: Can not start application');
        }
    }

    /**
     * Вернуть приложение MutApp
     * @returns {MutApp}
     */
    function getApp() {
        return productWindow.app;
    }

    /**
     * Ищет доступные прототипы, которые можно было бы добавить в AppProperty
     * Только для массивов. AppProperty должна обязательно представлять массив.
     * Прототипы собираются "на лету"
     *
     * @param {AppProperty} appProperty свойство, для которого найти прототипы
     * @returns {array<AppPropertyPrototype>} например все прототипы слайдов, которые можно вставить в тест.
     */
    function getPrototypesForAppProperty(appProperty) {
        //TODO один раз сформировать список прототипов и возвращать его
        //один прототип может быть использован в нескольких местах для создания нового значения
        //так как значение клонируется
        if (appProperty.isArray === true && appProperty.hasOwnProperty('canAdd')) {
            var canAddArr = appProperty.canAdd;
            var result = null;
            for (var i = 0; i < canAddArr.length; i++) {
                if (productWindow.descriptor.prototypes.hasOwnProperty(canAddArr[i])) {
                    if (result === null) {
                        result = [];
                    }
                    var pr = new AppPropertyPrototype(canAddArr[i], productWindow.descriptor);
                    result.push(pr);
                }
            }
            return result;
        }
        return null;
    }

    /**
     * Найти прототип по его имени для указанного appProperty
     * @param appProperty
     * @param prototypeName
     * @returns {AppPrototype}
     */
    function getPrototypeForAppProperty(appProperty, prototypeName) {
        var pp = getPrototypesForAppProperty(appProperty);
        if (pp) {
            for (var i = 0; i < pp.length; i++) {
                if (pp[i].key === prototypeName) {
                    return pp[i];
                }
            }
        }
        return null;
    }

    /**
     * Найти свойство по строке
     *
     * @param {string} propertyString строка свойства, например "background" или "quiz.2.options.1.points"
     * Или селектор. Обычно селектор и propertyString идентичны но иногда нет: id=mm pins(createPins)
     *
     * @return {AppProperty}
     */
    function getAppProperty(propertyStringOrSelector) {
        for (var i = 0; i < appProperties.length; i++) {
            if (propertyStringOrSelector === appProperties[i].propertyString || propertyStringOrSelector === appProperties[i].selector) {
                return appProperties[i];
            }
        }
        return null;
    }

    /**
     * Вернуть свойства промо приложения
     * @returns {Array}
     */
    function getAppProperties() {
        return appProperties;
    }

    /**
     * Вернуть массив строк - ключей свойств
     * Редактор перебирает этот массив строк для создания контролов.
     *
     * @returns {Array.<string>}
     */
    function getAppPropertiesObjectPathes() {
        return appPropertiesObjectPathes;
    }

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
     * Вернуть триггеры для промо приложения.
     */
    function getAppTriggers() {
        return triggers;
    }

    /**
     * Вернуть актуальные свойства приложения в виде строки.
     * Применяется в публикации
     *
     * @param param.addIsPublishedParam {boolean} добавить в приложение свойство, признак опубликованности
     *
     * @return {string}
     */
    function serializeAppValues(param) {
        param = param || {};
        param.addIsPublishedParam = param.hasOwnProperty('addIsPublishedParam') ? param.addIsPublishedParam : false;
        var res = JSON.stringify(Engine.getAppPropertiesValues().app);
        if (param.addIsPublishedParam === true) {
            var r = /^{"/ig;
            res = res.replace(r, '{"appConstructor=mutapp mode":"published","');
        }
        return res;
    }

    /**
     * Найти свойство по строке, поиск будет производиться по нескольким полям.
     * Надо для отладки
     *
     * @param {string} str
     */
    function find(str) {
        var results1 = [];
        var results2 = [];
        var results3 = [];
        for (var i = 0; i < appProperties.length; i++) {
            var ap = appProperties[i];
            if (ap.propertyString.indexOf(str) >= 0) {
                // самый релевантный поиск по ключу: propertyString
                results1.push(ap);
            }
            else {
                if ((ap.selector && ap.selector.indexOf(str) >= 0) ||
                    (ap.cssProperty && ap.cssProperty.indexOf(str) >= 0) ||
                    (ap.cssSelector && ap.cssSelector.indexOf(str) >= 0) ||
                    (ap.applyCssTo && ap.applyCssTo.indexOf(str) >= 0)
                    ) {
                    // вторая степерь релевантности: доп атрибуты
                    results2.push(ap);
                }
                else {
                    if (ap.propertyValue && ap.propertyValue.toString().indexOf(str) >= 0) {
                        // менее релевантный поиск - по значению
                        results3.push(ap);
                    }
                }
            }
        }
        return results1.concat(results2).concat(results3);
    }

    global.startEngine = startEngine;
    global.test = test;
    global.getApp = getApp;
    global.parseSelector = function(s) { return productWindow.MutApp.Util.parseSelector(s) };
    global.find = find;
    global.restartApp = restartApp;

    // методы для работы со свойствами appProperties
    global.setValue = setValue;
    global.getAppPropertiesObjectPathes = getAppPropertiesObjectPathes;
    global.getAppProperties = getAppProperties;
    global.getPrototypesForAppProperty = getPrototypesForAppProperty;
    global.getPrototypeForAppProperty = getPrototypeForAppProperty;
    global.getAppProperty = getAppProperty;
    global.addArrayElement = addArrayElement;
    global.deleteArrayElement = deleteArrayElement;

    // events
    global.on = on;

    // triggers methods
    global.getAppTriggers = getAppTriggers;

    // методы для работы с экранами(слайдами)
    global.getAppScreenIds = getAppScreenIds;
    global.getAppScreen = getAppScreen;

    // методы для работы с шаблонами
    global.getCustomStylesString = getCustomStylesString;
    global.writeCssRulesTo = writeCssRulesTo;
    global.serializeAppValues = serializeAppValues;
    global.getAppPropertiesValues = getAppPropertiesValues;
    global.getOperationsCount = function() { return operationsCount; }
})(Engine);