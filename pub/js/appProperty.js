/**
 * Created by artyom.grishanov on 15.12.15.
 */

/**
 * Обертка вокруг одного свойства в объекте window.app
 * То, что можно менять в промо проекте.
 * Например, app.randomQuestions в тесте - для него будет создана обертка AppProperty, так как у этого свойства есть дескриптор и оно помечено для редактирования.
 * Или более сложное app.quiz в тесте - вопросы теста. Будет создано AppProperty для всего массива и также для каких то объектов внутри (вопросы, тексты, баллы и т.д.)
 * AppProperty показывает что свойство можно редактировать и каким образом. Например, через дескриптор можно указать UI для редактирования этого поля
 * Для массивов AppProperty предоставляет возможность клонирования элемента.
 *
 * @param {*} propertyValue - значение свойства
 * @param {string} propertyString - Строка вида 'quiz.2.options.1.points'
 * Которая подразумевает свойство window.app.quiz[2].options[1].points
 * или иначе windows.app['quiz']['2']['options']['1']['points']
 * @param {object} descriptor - строка-дескриптор, описывающая как работать со свойством
 */
var AppProperty = function(propertyValue, propertyString, descriptor) {
    this.propertyValue = propertyValue;
    this.propertyString = propertyString;
    // в начале строки может быть запятая, отсекаем
    if (this.propertyString.charAt(0) === '.') {
        this.propertyString = this.propertyString.substr(1);
    }
// может быть привязан позднее
//    this.domElement = null;
//    // если css селектор не указан, то автоматически формируем его из имени propertyString
//    if (!descriptor.cssSelector) {
//        descriptor.cssSelector = '.js-app_'+propertyString;
//    }
    // декскриптор и его нормализация
    for (var key in AppProperty.validAttributes) {
        if (descriptor.hasOwnProperty(key)) {
            this[key] = descriptor[key];
        }
        else {
            this[key] = AppProperty.validAttributes[key];
        }
    }
    this.parseControls(descriptor);
    this.path = this.propertyString.split('.');
    this.isArray = Array.isArray(this.propertyValue);
    log('Property inited: ' + this.path.toString(), false, false);
};

/**
 * Допустимые свойства и их значения по умолчанию
 */
AppProperty.validAttributes = {
    selector: null,
    canAdd: null,
    editable: true,
    updateScreens: false,
    updateAppProperties: true,
    label: null,
    runTests: true,
    static: false,
    possibleValues: [],
    isPreset: false,
    cssProperty: null,

    // это селектор элемента с которым работаем. То есть кликаем в него, риусем выделение, применяем к нему свойства.
    // но иногда применять свойства надо к родителю или еще как-то. Тогда поможет applyCssTo
    cssSelector: null,
    cssValuePattern: null,
    filter: false,

    // селектор dom-элемент к которому применяем свойства. Обычно это cssSelector, но например text-align надо применять к родителю.
    // вот тут и указываем родителя в этом свойства
    applyCssTo: null,

    // подсказка для dom-элемента в промо продуктеы
    hint: null
};

/**
 * Создать объект дескриптор из строки
 *
 * @param descString
 */
AppProperty.prototype.parseDescriptor = function(descString) {
    try {
        var d = {};
        var reg = /((?:\w)+)\=((?:\w|\(|\)|\=|\,|[А-я]|\s)+)/ig;
        var match = null;
        while (match = reg.exec(descString)) {
            if (match[2] === 'false') {
                match[2] = false;
            }
            if (match[2] === 'true') {
                match[2] = true;
            }
            d[match[1]] = match[2];
        }
    }
    catch(e) {
        d = null;
        log('Invalid descriptor: \'' + descString + '\'', true);
    }
    return d;
}

/**
 * Парсинг строки вида с описанием контролов
 * AddScreenButton(updateScreens=true,screenGroup=questions),DeleteQuickButton
 *
 * @param str
 * @returns {Array}
 */
AppProperty.prototype.parseControls = function(descriptor) {
    // контрол может быть объявлен в двух вариантах. Массив и объект
    if (descriptor.controls) {
        if (Array.isArray(descriptor.controls) === true) {
            // формат уже должен соответствовать тому что требуется
            for (var i = 0; i < descriptor.controls.length; i++) {
                if (!descriptor.controls[i].params) {
                    // вдруг где-то забылы хотябы пустые параметры задать
                    desctiptor.controls[i].params = {};
                }
            }
            this.controls = descriptor.controls;
        }
        else {
            descriptor.controlParams = descriptor.controlParams || {};
            // сделать массив контролов из одного контрола
            this.controls = [{
                name: descriptor.controls,
                params: descriptor.controlParams
            }];
        }
    }
    else {
        this.controls = [];
    }
//    var reg = /((?:\w)+)(?:\(((?:\w|\,|=)*)\)){0,1}/ig;
//    var res = [];
//    while (match = reg.exec(str)) {
//        // match[0] string itself
//        var n = match[1];
//        var p = {};
//        if (match[2]) {
//            // есть какие то параметры в описании контрола
//            var preg = /((?:\w)+)\=((?:\w)+)/ig;
//            var pmatch = null;
//            while (pmatch = preg.exec(match[2])) {
//                // булиновкие типы лучше сразу сделать, чтобы удобнее было потом работать
//                if (pmatch[2] === 'false') {
//                    pmatch[2] = false;
//                }
//                if (pmatch[2] === 'true') {
//                    pmatch[2] = true;
//                }
//                p[pmatch[1]] = pmatch[2];
//            }
//        }
//        res.push({
//            name: n,
//            params: p
//        });
//    }
//    return res;
}

/**
 * Получить копию элемента массива.
 * В редакторе встречается функция клонирования элемента массива, например, экрана.
 * Если настройка не привязана к массиву, вернется null.
 *
 * @param [index] индекс элемента для копирования
 *
 * return {Object} копия элемента массива
 */
AppProperty.prototype.getArrayElementCopy = function(index) {
    if (this.isArray === true && this.propertyValue.length > 0) {
        if (Number.isInteger(index) === false) {
            index = this.propertyValue.length-1;
        }
        return JSON.parse(JSON.stringify(this.propertyValue[index]));
    }
    return null;
}