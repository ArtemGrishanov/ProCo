/**
 * Created by artyom.grishanov on 23.05.16
 */

/**
 *
 * @param params.name - имя
 * @param params.repeat - сколько раз повторять триггер при наступлении события
 * @param params.event - значение свойства
 * @param params.action - действие которое делает триггер
 */
var AppTrigger = function(params) {
    // нормализация свойств
    for (var key in AppTrigger.validAttributes) {
        if (params.hasOwnProperty(key)) {
            this[key] = params[key];
        }
        else {
            this[key] = AppTrigger.validAttributes[key];
        }
    }
    // скрываем action будем звать через обертку do
    this.__action = this.action;
    delete this.action;
    if (this.repeat === 'infinity') {
        this.repeat = Number.MAX_VALUE;
    }
    this.status = 'unknown';
    // счетчик, сколько раз был сделан триггер
    this.count = 0;
    log('Trigger inited: ' + this.name, false, false);
};

/**
 * Допустимые свойства и их значения по умолчанию
 */
AppTrigger.validAttributes = {
    name: null,
    event: 'show_screen',
    repeat: 1,
    action: null
};

//
AppTrigger.STATUS_UNKNOWN = 'unknown';

// не удалось выполнить, счетчик не будет накручен
AppTrigger.STATUS_FAILED = 'failed_on_screen';

// выполнен на экране. На этом экране больше он не будет выполняться
AppTrigger.STATUS_COMPLETED_ON_SCREEN = 'completed_on_screen';

// более не активен, выполнен совсем в приложении
AppTrigger.STATUS_RESOLVED = 'resolved';

/**
 * Запуск триггера
 * @param descString
 */
AppTrigger.prototype.do = function(params) {
    if (this.repeat > this.count) {
        if (typeof this.__action === 'function') {
            var completed = this.__action(params);
            if (completed === true) {
                // если триггер действительно был выполнен то накручиваем счетчик
                // "был выполнен" - это значит что удалось сделать действие которое задумывалось
                // например, найти ответы теста и поставить им признак верного ответа
                this.count++;
                this.status = AppTrigger.STATUS_COMPLETED_ON_SCREEN;
            }
            else {
                this.status = AppTrigger.STATUS_FAILED;
            }
        }
        if (typeof this.__action === 'string') {
            //TODO standart triggers

        }
        if (this.repeat <= this.count) {
            // конец: все попытки исчерпаны
            this.status = AppTrigger.STATUS_RESOLVED;
        }
    }
}