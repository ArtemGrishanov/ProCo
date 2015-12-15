/**
 * Created by artyom.grishanov on 15.12.15.
 */

/**
 * Обертка вокруг свойства в объекте window.app
 *
 * @param propertyString - Строка вида 'quiz.2.options.1.points'
 * Которая подразумевает свойство window.app.quiz[2].options[1].points
 * или иначе windows.app['quiz']['2']['options']['1']['points']
 * @param descString - строка-дескриптор, описывающая как работать со свойством
 */

var AppProperty = function(propertyString, descString) {
    this.string = propertyString;
    // в начале строки может быть запятая, отсекаем
    if (this.string.charAt(0) === '.') {
        this.string = this.string.substr(1);
    }
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
    this.arr = this.string.split('.');
//    try {
//        var a = str.split('.');
//        for (var i = 0; i < a.length; i++) {
//            var part = a[i];
//            var ab1 = part.indexOf('[');
//            if (ab1 >= 0) {
//                this.arr.push(part.substring(0,ab1));
//                // далее блок обработки серии скобок, их может быть много
//                while (ab1 >= 0) {
//                    var ab2 = part.indexOf(']');
//                    this.arr.push(part.substring(ab1+1, ab2));
//                    part = part.substring(ab2+1, part.length);
//                    ab1 = part.indexOf('[');
//                }
//            }
//            else {
//                this.arr.push(part);
//            }
//        }
//    }
//    catch(e) {
//        log('Cannot create appProperty: ' + e, true);
//    }
//    finally {
        log('Property inited: ' + this.arr.toString());
//    }
};

/**
 * Создать объект дескриптор из строки
 *
 * @param descString
 */
AppProperty.prototype.parseDescriptor = function(descString) {
    try {
        var d = {};
        var options = descString.split(';');
        for (var i = 0; i < options.length; i++) {
            var values = options[i].split('=');
            d[values[0]] = values[1];
        }
    }
    catch(e) {
        d = null;
        log('Invalid descriptor: \'' + descString + '\'', true);
    }
    return d;
}
AppProperty.prototype.setToApp = function(app, val) {

}