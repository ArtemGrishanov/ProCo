/**
 * Created by artyom.grishanov on 23.08.16.
 */
var valueGenerator = {};

(function(global) {

    /**
     * Для всех MutAppProperty приложения сгенерировать новые значения основываясь на типе value
     *
     * @param {MutApp} app
     */
    function randomChangeApp(app) {
        // изменение массива может создать новые mutappproperty свойства
        // поэтому надо пройти по свойствам и изменить значения массивов, а после еще проход по простым свойствам
        // при добавлении нового элемета массива новые проперти добавятся в список __mutappProperties
        for (var i = 0; i < app._mutappProperties.length; i++) {
            if (MutApp.Util.isMutAppPropertyDictionary(app._mutappProperties[i]) === true) {
                _randomChangeProperty(app._mutappProperties[i]);
            }
        }
        for (var i = 0; i < app._mutappProperties.length; i++) {
            if (MutApp.Util.isMutAppPropertyDictionary(app._mutappProperties[i]) !== true) {
                _randomChangeProperty(app._mutappProperties[i]);
            }
        }
    }

    /**
     * Изменить значение для свойства основываясь на типе value
     * Возможен брос эксепшена, если тип значения не поддерживается
     *
     * @param {MutAppProperty} ap
     */
    function _randomChangeProperty(ap) {
        if (MutApp.Util.isCssMutAppProperty(ap) === true) {
            ap.setValue(_getRandomCssValue(ap));
        }
        else if (MutApp.Util.isMutAppPropertyDictionary(ap) === true) {
            var prot = ap.prototypes[_randInt(0, ap.prototypes.length-1)];
            ap.addElementByPrototype(prot.protoFunction);
        }
        else if (MutApp.Util.isMutAppPropertyPosition(ap) === true) {
            ap.setValue(_getRandomPositionValue(ap));
        }
        else if (ap._value === null) {
            // с null неизвестно как поступать
            ap.setValue('rand_string_insteadof_null_' + Math.trunc(Math.random()*10000));
        }
        else if (typeof ap._value === 'string') {
            ap.setValue('rand_string_' + Math.trunc(Math.random()*10000));
        }
        else if (typeof ap._value === 'boolean') {
            ap.setValue(Math.random() < 0.5);
        }
        else if (typeof ap._value === 'number') {
            ap.setValue(_randInt(0, 100));
        }
        else {
            throw new Error('valuesGenerator._randomChangeProperty: unsupported data type \'' + typeof ap._value + '\' in \'' + ap.propertyString + '\'');
        }
    }

    /**
     * Взять рандомный элемент массива
     * @param arr
     */
    function _randElem(arr) {
        return arr[_randInt(0,arr.length-1)];
    }

    /**
     * Get a random integer between `min` and `max`.
     *
     * @param {number} min - min number
     * @param {number} max - max number
     * @return {int} a random integer
     */
    function _randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Сгенерировать случайное значение для свойства CssMutAppProperty
     * @param {MutAppProperty} ap
     */
    function _getRandomCssValue(ap) {
        for (var i = 0; i < CSS_MAP.length; i++) {
            var e = CSS_MAP[i];
            if (e.cssProperties.indexOf(ap.cssPropertyName) >= 0) {
                return _randElem(e.possibleValues);
            }
        }
        throw new Error('valuesGenerator._getRandomCssValue: unsupported css property \'' + ap.cssPropertyName + '\'');
    }

    /**
     * Вернуть рандомную позицию
     * @param ap
     * @returns {{width: int, height: int}}
     * @private
     */
    function _getRandomPositionValue(ap) {
        return {
            top: _randInt(0, 499),
            left: _randInt(0, 499)
        };
    }

    /**
     * Данные для автотестов
     *
     */
    var GENDATA = {
        ChooseQuickImage: [
            '',
            'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/1.jpg',
            'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/2.jpg',
            'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/3.jpg',
            'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/4.jpg',
            'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/5.jpg'
        ]
    };

    /**
     * Возможные значения для css свойств
     *
     * @type {Array}
     */
    var CSS_MAP = [
        {
            cssProperties: ['color','background-color','border-color','border-bottom-color'],
            // $.css('color') возвращает цвета в формате rgb()
            possibleValues: ['rgb(0, 123, 0)','rgb(64, 64, 64)','rgb(212, 64, 212)','rgb(0, 64, 190)','rgb(200, 200, 200)','rgb(64, 64, 0)','rgb(164, 200, 32)']
        },
        {
            cssProperties: ['font-family'],
            possibleValues: ["Arial","Times New Roman"]
        },
        {
            cssProperties: ['font-size'],
            possibleValues: ["10px","12px","16px","24px","36px"]
        },
        {
            cssProperties: ['text-align'],
            possibleValues: ["left","center","right"]
        },
        {
            cssProperties: ['padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left'],
            possibleValues: ["0","5px","10px","25px","45px","70px"]
        },
        {
            cssProperties: ['border-radius'],
            possibleValues: ["0","4px","8px","99px"]
        },
        {
            cssProperties: ['border-width'],
            possibleValues: ["1px","4px"]
        },
    ];

    global.randomChangeApp = randomChangeApp;

})(valueGenerator);