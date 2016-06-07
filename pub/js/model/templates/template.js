/**
 * Created by artyom.grishanov on 06.06.16.
 *
 * Шаблон промо приложения
 */

function Template(param) {
    this.set(param)
}

Template.prototype.set = function(param) {
    param = param || {};
    this.id = (param.id !== null) ? param.id: null;
    this.url = (param.url !== null) ? param.url: null;
    this.title = (param.title !== null) ? param.title: null;
    this.previewUrl = (param.previewUrl !== null) ? param.previewUrl: null;
    this.appId = (param.appId !== null) ? param.appId: null;
    // имя промо-прототипа, например test timeline и так далее
    this.appName = (param.appId !== null) ? param.appName: null;
    this.propertyValues = (param.propertyValues !== null) ? param.propertyValues: null;
    this.descriptor = (param.descriptor !== null) ? param.descriptor: null;
    this.lastModified = (param.lastModified !== null) ? param.lastModified: null;
    this.publishDate = (param.publishDate !== null) ? param.publishDate: null;
}

/**
 * Показывает что шаблон корректный и его можно загрузить
 *
 * @param str
 * @returns {boolean}
 */
Template.prototype.isValid = function(str) {
    return !!this.appName && !!this.propertyValues && !!this.descriptor;
}

Template.prototype.deserialize = function(str) {
    this.set(JSON.parse(str));
}

Template.prototype.serialize = function() {

}
