/**
 * Created by artyom.grishanov on 11.08.16.
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
        assert.ok(!!app === true, 'App exists in Engine');

        var name = app.type; //'test'
        assert.ok(name.length > 0, 'app type exist');

        var productConfig = config.products[name];
        assert.ok(productConfig !== null, 'Product config exist');

        var appProps = Engine.getAppProperties();
        assert.ok(appProps.length > productConfig.autotests.expectedPropertiesCount, 'More then '+productConfig.autotests.expectedPropertiesCount+' appProperties for test');
        assert.ok(appProps.length === Engine.getAppPropertiesObjectPathes().length, 'App Properties and object pathes');
        for (var i = 0; i < appProps.length; i++) {
            if (appProps[i].type === 'app') {
                var f = Engine.getAppProperty(appProps[i].propertyString);
                assert.ok(f === appProps[i], 'Engine.getAppProperty search');

                checkAppProperty(assert, appProps[i]);
            }
        }
        // поиск дублирующихся пропертей
        var d = duplicateCount(assert,appProps,'propertyString');
        assert.ok(d === 0, 'Duplicates in app properties');

        var scrIds = Engine.getAppScreenIds();
        assert.ok(scrIds.length >= productConfig.autotests.expectedScreensCount, 'There are some screens');
        for (var i = 0; i < scrIds.length; i++) {
            var s = Engine.getAppScreen(scrIds[i]);
            assert.ok(s!==null,'Screen has finded');

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
        assert.ok(typeof serializedApps  === 'string', 'Engine.getAppString()');
        assert.ok(serializedApps.length > productConfig.autotests.expectedSerializedAppStringLength, 'Engine.getAppString()');

        // styles string
        var cssString = Engine.getCustomStylesString();
        assert.ok(typeof cssString  === 'string', 'Engine.getCustomStylesString()');
        var p = propertiesCount(exportedProperties.css, true);
        if (p > 0) {
            // содержит более менее-длинную строку
            // длина которой примерно зависит от количества определенных css свойств
            assert.ok(cssString.length > p*5, 'Engine.getCustomStylesString()');
        }
        else {
            // содержит только символ новой строки
            // нет стилей для экспорта
            assert.ok(cssString.length == 1, 'Engine.getCustomStylesString()');
        }

//        1) верхний уровень можно назвать "product"
//        а сценарии иметь на каждом уровне
//        на уровне движка например генератор
//        на уровне TApp выделить сценарий прохождения и проверки

    }

    /**
     * Проверить отдельное appProperty в движке.
     */
    function checkAppProperty(assert, appProperty) {
        //todo
        // формальная корректность
        // наличие контрола
        // значение этого свойства в приложении

        assert.ok(typeof appProperty.propertyString === 'string', 'checkAppProperty');
        var r = Engine.parseSelector(appProperty.propertyString);
        assert.ok(r !== null, 'checkAppProperty');
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
        assert.ok(!!screen.view.$el === true, 'checkAppScreen view.$el');
        assert.ok(!!screen.view.$el.children().length > 0, 'checkAppScreen view.$el children');

        var dataElems = screen.view.$el.find('[data-app-property]');
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
                // запуск редактора
                // в нормальном режиме эти параметры передаются через url-get строку
//                Editor.start({
//                    app: appName,
//                    //template: '' // другой режим запуска возможен, через шаблон
//                    callback: function() {
//                        assert.ok(true, 'Editor started');
//                        Queue.release(this);
//                    }
//                });
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
                    if (p.type === 'app') {
                        if (typeof p.propertyValue === 'string') {
                            var newValue = 'rand_string_'+Math.trunc(Math.random()*10000);
                            Engine.setValue(p, newValue);
                            var actualProperty = Engine.getApp().getPropertiesBySelector(p.propertyString);
                            assert.ok(actualProperty.length===1, 'actualProperty is array length=1');
                            assert.ok(actualProperty[0].value === newValue, 'string value set correctly for \''+p.propertyString+'\''+' value='+newValue);
                            saved.push({'propertyString':p.propertyString, 'value':newValue});
                        }
                    }
                }

                for (var i = 0; i < saved.length; i++) {
                    var actualProperty = Engine.getApp().getPropertiesBySelector(saved[i].propertyString);
                    assert.ok(actualProperty.length===1, 'Second interation. actualProperty is array length=1');
                    assert.ok(actualProperty[0].value === saved[i].value, 'Second interation. String value set correctly for \''+saved[i].propertyString+'\''+' value='+saved[i].value);
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
                    assert(false, 'TEngine.duplicateCount: duplicated \''+array[i][propertyName]+'\'');
                    result++;
                }
            }
        }
        return result;
    }

    global.checkEngine = checkEngine;
    global.scenarioChangeValues = scenarioChangeValues;

})(TEngine);