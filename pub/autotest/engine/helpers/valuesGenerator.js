/**
 * Created by artyom.grishanov on 23.08.16.
 */

/**
 *
 * @param ap
 * @returns {*}
 */
function generateValue(ap) {
    var result = null;
    var control = ap.controls[0];

    if (ap.type === 'app') {
        if (control.name === 'ChooseImageQuick') {
            result = randElem(GENDATA.ChooseQuickImage);
        }
        else if (typeof ap.propertyValue === 'string') {
            result = 'rand_string_'+Math.trunc(Math.random()*10000);
        }
        else if (typeof ap.propertyValue === 'boolean') {
            result = Math.random()<.5;
        }
    }
    else if (ap.type === 'css') {
        result = generateCssValue(ap.cssProperty);
    }


    return result;
}

/**
 * Взять рандомный элемент массива
 * @param arr
 */
function randElem(arr) {
    return arr[randInt(0,arr.length-1)];
}

/**
 * Get a random integer between `min` and `max`.
 *
 * @param {number} min - min number
 * @param {number} max - max number
 * @return {int} a random integer
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 *
 * @param cssProperty
 */
function generateCssValue(cssProperty) {
    for (var i = 0; i < CSS_MAP.length; i++) {
        var e = CSS_MAP[i];
        if (e.cssProperties.indexOf(cssProperty)>=0) {
            return randElem(e.possibleValues);
        }
    }
    return null;
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