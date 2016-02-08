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
 * @param propertyValue - значение свойства
 * @param propertyString - Строка вида 'quiz.2.options.1.points'
 * Которая подразумевает свойство window.app.quiz[2].options[1].points
 * или иначе windows.app['quiz']['2']['options']['1']['points']
 * @param descString - строка-дескриптор, описывающая как работать со свойством
 */

var AppProperty = function(propertyValue, propertyString, descString) {
    this.propertyValue = propertyValue;
    this.propertyString = propertyString;
    // в начале строки может быть запятая, отсекаем
    if (this.propertyString.charAt(0) === '.') {
        this.propertyString = this.propertyString.substr(1);
    }
    // может быть привязан позднее
    this.domElement = null;
    this.descString = descString;
    if (descString) {
        this.descriptor = this.parseDescriptor(descString);
    }
    else {
        this.descriptor = null;
    }
    if (!this.descriptor.hasOwnProperty('editable')) {
        this.descriptor.editable = false;
    }
    if (this.descriptor.hasOwnProperty('ui')) {
        // для одного свойства может быть несколько контролов, они будут в этом массиве
        this.descriptor.controls = this.parseControl(this.descriptor.ui);
    }
    this.path = this.propertyString.split('.');
    this.isArray = Array.isArray(this.propertyValue);
    log('Property inited: ' + this.path.toString());
};

/**
 * Создать объект дескриптор из строки
 *
 * @param descString
 */
AppProperty.prototype.parseDescriptor = function(descString) {
    try {
        var d = {};
        var reg = /((?:\w)+)\=((?:\w|\(|\)|\=|\,)+)/ig;
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
//        var options = descString.split(';');
//        for (var i = 0; i < options.length; i++) {
//
//            var values = options[i].split('=');
//            if (values[0] && values[1]) {
//                d[values[0]] = values[1];
//                if (d[values[0]] === 'false') {
//                    d[values[0]] = false;
//                }
//                if (d[values[0]] === 'true') {
//                    d[values[0]] = true;
//                }
//            }
//        }
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
AppProperty.prototype.parseControl = function(str) {
    var reg = /((?:\w)+)(?:\(((?:\w|\,|=)*)\)){0,1}/ig;
    var res = [];
    while (match = reg.exec(str)) {
        // match[0] string itself
        var n = match[1];
        var p = {};
        if (match[2]) {
            // есть какие то параметры в описании контрола
            var preg = /((?:\w)+)\=((?:\w)+)/ig;
            var pmatch = null;
            while (pmatch = preg.exec(match[2])) {
                // булиновкие типы лучше сразу сделать, чтобы удобнее было потом работать
                if (pmatch[2] === 'false') {
                    pmatch[2] = false;
                }
                if (pmatch[2] === 'true') {
                    pmatch[2] = true;
                }
                p[pmatch[1]] = pmatch[2];
            }
        }
        res.push({
            name: n,
            params: p
        });
    }
    return res;
}

/**
 * Получить копию элемента массива.
 * При добавлении нового элемента в редакторе сначала получаем и редактируем эту копию, а потом уже добавляем её в свойства app
 * Если настройка не привязана к массиву, вернется null.
 *
 * @param [index] индекс элемента для копирования
 *
 * return {Object} копия элемента массива
 */
AppProperty.prototype.getArrayElementCopy = function(index) {
    if (this.isArray === true && this.propertyValue.length > 0) {
        var index = index || this.propertyValue.length-1;
        return JSON.parse(JSON.stringify(this.propertyValue[index]));
    }
    return null;
}
//
//AppProperty.prototype.addChangeCallback = function(clb) {
//    if (!this.changeCallbacks) {
//        this.changeCallbacks = [];
//    }
//    this.changeCallbacks.push(clb);
//}
//AppProperty.prototype.sendChangeEvent = function(field) {
//    if (this.changeCallbacks) {
//        for (var i = 0; i < this.changeCallbacks.length; i++) {
//            this.changeCallbacks[i].call(this, field);
//        }
//    }
//}
//
//AppProperty.prototype.set = function(key, value) {
//    this[key] = value;
//    this.sendChangeEvent(key);
//};