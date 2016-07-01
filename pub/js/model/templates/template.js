/**
 * Created by artyom.grishanov on 06.06.16.
 *
 * Шаблон промо приложения
 */
function Template(param) {
    this.set(param)
}

/**
 * Установить свойства для шаблона
 * Будут установелны только свойства описанные в Template.validAttributes
 *
 * @param param
 */
Template.prototype.set = function(param) {
    param = param || {};
    for (var key in Template.validAttributes) {
        if (param.hasOwnProperty(key) === true) {
            this[key] = param[key];
        }
    }
}

/**
 * Показывает что шаблон корректный и его можно загрузить
 *
 * @param str
 * @returns {boolean}
 */
Template.prototype.isValid = function(str) {
    return !!this.appName && !!this.propertyValues/* && !!this.descriptor*/;
}

Template.prototype.deserialize = function(str) {
    this.set(JSON.parse(str));
}

/**
 * Сериализовать ключевые свойства шаблона в строку
 *
 * @returns {*}
 */
Template.prototype.serialize = function() {
    var result = {};
    for (var key in Template.validAttributes) {
        var v = this[key];
        if (v !== null && v != undefined) {
            // берем только необходимые атрибуты
            // причем null и undefined сохранять смысла нет
            result[key] = v;
        }
    }
    return JSON.stringify(result);
}

Template.validAttributes = {
    id: null,
    url: null,
    title: null,
    previewUrl: null,
    appName: null, // имя промо-прототипа, например test timeline и так далее
    propertyValues: null,
    // была идея сериализовать дескриптор тоже для того, чтобы у разных шаблонов были разные настройки
    // но сложностей много и фича сомнительная
    // descriptor: null,
    lastModified: null,
    publishDate: null
};
