/**
 * Created by artyom.grishanov on 15.06.15.
 *
 *
 */
var AppPropertyPrototype = function(key, app, descriptor) {
    if (descriptor.prototypes) {
        var prInfo = descriptor.prototypes[key];
        if (prInfo) {
            for (var k in AppPropertyPrototype.validAttributes) {
                if (prInfo.hasOwnProperty(k)) {
                    this[k] = prInfo[k];
                }
                else {
                    this[k] = AppProperty.validAttributes[k];
                }
            }
        }
    }
    this.key = key;
    this.img = config.common.devPrototypesHostName+this.img;
    // клонируем прототип. Нельзя отдавать наружу реальный объект из productWindow
    this.value = JSON.parse(JSON.stringify(app[this.key]));
};

/**
 * Допустимые свойства и их значения по умолчанию
 */
AppPropertyPrototype.validAttributes = {
    /**
     * ссылка на свойство прототипа
     */
    key: null,
    /**
     * Текстовое пояснение которе будет показано пользователю
     * Можно задать в дескрипторе
     */
    label: null,
    /**
     * Иконка для выбора, которая будет показана пользователю
     * Можно задать в дескрипторе
     */
    img: null,
    /**
     * Готовое значение, которе сразу можно добавлять и добавлять в проект
     */
    value: null
};