/**
 * Created by artyom.grishanov on 11.08.16.
 */

/**
 *
 * @type {{}}
 */

var TEngine = {};

(function(global){

    /**
     * Проверка Engine на работоспособность и корректность
     *
     * @param assert
     * @constructor
     */
    function checkEngine(assert) {
        var app = Engine.getApp();
        assert.ok(!!app === true, 'Engine.checkEngine: App exists in Engine');

        var name = app.type; //'test'
        assert.ok(name.length > 0, 'Engine.checkEngine: app type exist');

        var productConfig = config.products[name];
        assert.ok(productConfig !== null, 'Engine.checkEngine: Product config exist');

        var appProps = Engine.getAppProperties();
        assert.ok(appProps.length > productConfig.autotests.expectedPropertiesCount, 'Engine.checkEngine: More then '+productConfig.autotests.expectedPropertiesCount+' appProperties for test');
        assert.ok(appProps.length === Engine.getAppPropertiesObjectPathes().length, 'Engine.checkEngine: App Properties and object pathes');
        for (var i = 0; i < appProps.length; i++) {
            if (appProps[i].type === 'app') {
                var f = Engine.getAppProperty(appProps[i].propertyString);
                assert.ok(f === appProps[i], 'Engine.checkEngine: getAppProperty search');

                checkAppProperty(assert, appProps[i]);
            }
        }
        // поиск дублирующихся пропертей
        var d = duplicateCount(assert,appProps,'propertyString');
        assert.ok(d === 0, 'Engine.checkEngine: Duplicates in app properties');

        var scrIds = Engine.getAppScreenIds();
        assert.ok(scrIds.length >= productConfig.autotests.expectedScreensCount, 'Engine.checkEngine: There are some screens');
        for (var i = 0; i < scrIds.length; i++) {
            var s = Engine.getAppScreen(scrIds[i]);
            assert.ok(s!==null,'Engine.checkEngine: Screen has finded');

            checkAppScreen(assert, s);
        }

        var trig = Engine.getAppTriggers();
        assert.ok(trig.length >= productConfig.autotests.expectedTriggersCount, 'There are some triggers');

        // идет разделение на два типа свойств {app:{}, css{}}
        // это нужно для сохранения шаблонов
        var exportedProperties = Engine.getAppPropertiesValues();
        assert.ok(exportedProperties !== null, 'Engine.getAppPropertiesValues');
        assert.ok(exportedProperties.css !== null, 'Engine.getAppPropertiesValues');
        assert.ok(exportedProperties.app !== null, 'Engine.getAppPropertiesValues');
        assert.ok(propertiesCount(exportedProperties.app) > 30, 'Engine.getAppPropertiesValues app count');
        assert.ok(propertiesCount(exportedProperties.css) > 60, 'Engine.getAppPropertiesValues css count');

        // вернуть свойства приложения в виде строки
        var serializedApps = Engine.serializeAppValues();
        assert.ok(typeof serializedApps  === 'string', 'Engine.checkEngine: serialize values');
        assert.ok(serializedApps.length > productConfig.autotests.expectedSerializedAppStringLength, 'Engine.getAppString()');

        // styles string
        var cssString = Engine.getCustomStylesString();
        assert.ok(typeof cssString  === 'string', 'Engine.checkEngine: getCustomStylesString()');
        var p = propertiesCount(exportedProperties.css, true);
        if (p > 0) {
            // содержит более менее-длинную строку
            // длина которой примерно зависит от количества определенных css свойств
            assert.ok(cssString.length > p*5, 'Engine.checkEngine: getCustomStylesString()');
        }
        else {
            // содержит только символ новой строки
            // нет стилей для экспорта
            assert.ok(cssString.length == 1, 'Engine.checkEngine: getCustomStylesString()');
        }

        // находим необходимый айфрейм с приложением, их может быть несколько
        var appIframe = findIframeWithApp($("#id-product_iframe_cnt"), app.id);
        assert.ok(appIframe !== null, 'Engine.checkEngine: app iframe found with appId='+app.id);

        var body = $(appIframe).contents().find('body');
        assert.ok(body.html().indexOf(cssString)>=0, 'Engine.checkEngine: productIframe contains custom styles');
        // custom cssString in iframe
    }

    /**
     * Проверить отдельное appProperty в движке.
     */
    function checkAppProperty(assert, appProperty, expectedValue) {
        //todo формальная корректность
        //todo expectedValue - last param
        //todo наличие контрола
        //todo значение этого свойства в приложении
        // проверить в Engine, что оно в действительности установлено
        // проверить что в приложении оно тоже действительно установлено
        // проверить что во вью приложения оно реально установлено
        if (appProperty===null) {
            console.log('stop');
        }
        assert.ok(typeof appProperty.propertyString === 'string', 'checkAppProperty');

        if (appProperty.type==='app') {
            var r = Engine.parseSelector(appProperty.propertyString);
            assert.ok(r !== null, 'checkAppProperty: propertyString (type=app) is valid in '+appProperty.propertyString);
        }
        else if (appProperty.type==='css') {
            // в начале селектора надо вырезать точку
            assert.ok(appProperty.propertyString.indexOf(appProperty.cssSelector.substr(1,appProperty.cssSelector.length))===0, 'checkAppProperty: propertyString (type=css) is valid in '+appProperty.propertyString);
        }
        else {
            assert.ok(false, 'checkApppropety: Unknown type='+appProperty.type);
        }

        assert.ok(!!appProperty.controls===true && appProperty.controls.length>0, 'checkAppProperty: control exist in '+appProperty.propertyString);
    }

    /**
     * Проверить отдельный AppScreen
     */
    function checkAppScreen(assert, screen) {
        assert.ok(!!screen.id === true, 'checkAppScreen id');
        assert.ok(!!screen.group === true, 'checkAppScreen group');
        assert.ok(typeof screen.name === 'string', 'checkAppScreen name');
        assert.ok(typeof screen.collapse === 'boolean', 'checkAppScreen collapse');
        assert.ok(typeof screen.draggable === 'boolean', 'checkAppScreen draggable');
        assert.ok(typeof screen.canAdd === 'boolean', 'checkAppScreen canAdd');
        assert.ok(typeof screen.canDelete === 'boolean', 'checkAppScreen canDelete');
        assert.ok(typeof screen.canClone === 'boolean', 'checkAppScreen canClone');
        assert.ok(!!screen.view === true, 'checkAppScreen view');
        assert.ok(screen.view.css('display') !== 'none', 'checkAppScreen display!==none');
        assert.ok(!!screen.view.children().length > 0, 'checkAppScreen view.$el children');

        var dataElems = screen.view.find('[data-app-property]');
        if (dataElems.length > 0) {
            assert.ok(screen.appPropertyElements.length > 0, 'checkAppScreen appPropertyElements '+screen.id);
        }
        else {
            assert.ok(screen.appPropertyElements.length === 0, 'checkAppScreen appPropertyElements'+screen.id);
        }
    }

    /**
     *
     * @param assert
     */
    function scenarioChangeValues(assert, appName) {
        var appName = appName || 'test';

        var done = assert.async();
        var appIframe = null;
//        var app = null;

        Queue.push({
            run: function() {
                TApp.createApp(appName, function(iframe) {
                    appIframe = iframe;
                    assert.ok(true, 'App created');
                    Engine.startEngine(appIframe.contentWindow);
                    assert.ok(true, 'Engine started');
                    Queue.release(this);
                });
            }
        });

        Queue.push({run: function() {
            TEngine.checkEngine(assert, 'test');
            Queue.release(this);
        }});

        Queue.push({
            run: function() {
                var saved = [];
                // нужно склонировать массив, так как он по ходу теста может меняться, а нам надо постоянный
                var appProps = JSON.parse(JSON.stringify(Engine.getAppPropertiesObjectPathes()));

                var initialLength = appProps.length;
                for (var i = 0; i < appProps.length; i++) {
                    var p = Engine.getAppProperty(appProps[i]);
                    assert.ok(p!==null,'Property not null \''+appProps[i]+'\'');
                    var newValue = generateValue(p);
                    if (newValue !== null) {
                        Engine.setValue(p, newValue);
                        // проверить как прошла установка: получить реальное значение свойства из приложения
                        if (p.type==='app') {
                            var actualProperty = Engine.getApp().getPropertiesBySelector(p.propertyString);
                            if (actualProperty === null) {
                                assert.ok(false, 'actualProperty===null for appProperty=\''+p.propertyString+'\'');
                            }
                            assert.ok(actualProperty.length===1, 'actualProperty is array length=1 for appProperty=\''+p.propertyString+'\'');
                            assert.ok(actualProperty[0].value === newValue, typeof p.propertyValue+' value set correctly for \''+p.propertyString+'\''+' value='+newValue);
                        }
                        else {
                            // собрать все вью экранов заранее для последующей проверки стилей в них
                            var allViews = [];
                            for (var k = 0; k < Engine.getApp()._screens.length; k++) {
                                // из всех экранов соберем вью для проверки выставления стилей
                                // причем надо сделеать show() для применения стилей браузером
                                allViews.push(Engine.getApp()._screens[k].$el.show());
                            }
                            var viewsWithThisClass = [];
                            // отобрать экраны, которые содержат классы, имеющие отношение к свойству
                            viewsWithThisClass = findViewsContainingClass(allViews, [p.applyCssTo || p.cssSelector]);
                            assert.ok(viewsWithThisClass.length > 0, 'There are screens with this css appProperty=\''+p.propertyString+'\'');
                            for (var n = 0; n < viewsWithThisClass.length; n++) {
                                // проверить значение css свойства p на экране view
                                validateDomElement(assert, viewsWithThisClass[n], p, viewsWithThisClass[n].attr('id'));
                            }
                        }

                        saved.push({'propertyString':p.propertyString, 'value':newValue});
                    }
                    else {
                        log('TEngine.scenarioChangeValues: Cannot generate value for \''+p.propertyString+'\'', true);
                    }
                }

                for (var i = 0; i < saved.length; i++) {
                    var p = Engine.getAppProperty(saved[i].propertyString);
                    if (p.type==='app') {
                        var actualProperty = Engine.getApp().getPropertiesBySelector(saved[i].propertyString);
                        assert.ok(actualProperty.length===1, 'Second interation. actualProperty is array length=1');
                        assert.ok(actualProperty[0].value === saved[i].value, 'Second interation. String value set correctly for \''+saved[i].propertyString+'\''+' value='+saved[i].value);
                    }
                    else {
                        //TODO повторная проверка css свойств
                        // как и выше в предыдущем цикле
                    }
                }

                assert.ok(initialLength===Engine.getAppProperties().length, 'Length');

                Queue.release(this);
            }
        });

        Queue.push({run: function() {
            TEngine.checkEngine(assert, 'test');
            Queue.release(this);
        }});

        Queue.push({run: function() {
            TApp.checkApp(assert, appIframe);
            Queue.release(this);

            // рестартануть приложение, чтобы привести экраны в нормальное состояние
            // так как по ходу теста, мы показывали некоторые экраны в тестовом скрипте для валидации css свойств на них
            Engine.getApp().start();

            // завершить тестовый сценарий
            done();
        }});
    }

    /**
     * Посчитать количество свойств в объекте
     *
     * @param {object} obj
     * @param {boolean} [onlyNotEmptyProperties] считать только "ненулевые" свойства. Пустая строка тоже нулевая.
     *
     * @returns {number}
     */
    function propertiesCount(obj, onlyNotEmptyProperties) {
        var result = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (onlyNotEmptyProperties === true) {
                    if (!!obj[key]===true) {
                        result++;
                    }
                }
                else {
                    result++;
                }
            }
        }
        return result;
    }

    /**
     * Найти количество дубликатов в массиве по свойству
     *
     * @param array
     * @param propertyName
     */
    function duplicateCount(assert, array, propertyName) {
        var result = 0;
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array.length; j++) {
                if (i!==j && array[i][propertyName]===array[j][propertyName]) {
                    assert.ok(false, 'TEngine.duplicateCount: duplicated \''+array[i][propertyName]+'\'');
                    result++;
                }
            }
        }
        return result;
    }

    global.checkEngine = checkEngine;
    global.scenarioChangeValues = scenarioChangeValues;
    global.checkAppProperty = checkAppProperty;

})(TEngine);