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

        var scrIds = Engine.getAppScreenIds();
        assert.ok(scrIds.length >= productConfig.autotests.expectedScreensCount, 'There are some screens');
        for (var i = 0; i < scrIds.length; i++) {
            var s = Engine.getAppScreen(scrIds[i]);
            assert.ok(s!==null,'Screen has finded');
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



        //TODO
//        0) Engine.getAppString - внутрь MutApp
//        Это сериализация значения, чтобы паблишер мог их вставить в приложение
//        в defaults подставить объект:
//        {'id=tm value1':  data1}
//
//        2) сценрий engine
//        сделать изменение свойств в приложении mutapp через движок и с их последующей проверкой
//        но как тогда грузить приложение? Этот слой сам этого не умеет...
//
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
    function checkAppScreen() {
        //todo
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

    global.checkEngine = checkEngine;

})(TEngine);