/**
 * Created by artyom.grishanov on 15.06.15.
 *
 *
 */
var AppPropertyPrototype = function(key, descriptor) {
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
    this.img = config.common.home + this.img;
    // private
    // нельзя отдавать значение по прямой ссылке
    this._value = prInfo.data;
};

/**
 * Возвратить клонированное значение прототипа
 *
 * @param {object} [extendProperties] - возможность добавить/переписать свойства. Опционально
 * @returns {*}
 */
AppPropertyPrototype.prototype.getValue = function(extendProperties) {
    var r = JSON.parse(JSON.stringify(this._value));
    if (extendProperties) {
        for (var key in extendProperties) {
            if (extendProperties.hasOwnProperty(key)) {
                r[key] = extendProperties[key];
            }
        }
    }
    return r;
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
    _value: null
};