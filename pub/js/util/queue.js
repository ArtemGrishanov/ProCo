/**
 * Created by artyom.grishanov on 21.12.15.
 *
 * Для выполнения сложных и тяжелых задач. Возможность "закинуть" в этот объект несколько задач и установить колбек на их завершение.
 *
 * @example
            var t = {
                // клонируем данные для задачи, так как иначе индекс i сбиндится, будет браться последний из цикла
                data: {url:'123'},
                run: function() {
                    // task body
                    var client = new XMLHttpRequest();
                    client.open('GET', baseProductUrl + this.data.url);
                    client.onreadystatechange = (function(e) {
                        if (e.target.readyState == 4) {
                            if(e.target.status == 200) {
                                // task context
                                log('Grab task done:' + this.data.url);
                            }
                            else {
                                log('Resource request failed: '+ myRequest.statusText, true);
                            }
                            // даем понять, что таск завершен
                            Queue.release(this);
                        }
                    }).bind(this);
                    client.send();
                }
            };
            t.type = 'type1';
            t.priority = 1;
            Queue.push(t);
 */

var Queue = {};

// функция НЕ анонимная для возможной повторной инициализации
function __init_queue(global) {
    var tasks = [];
    var timer = setInterval(doNext, 60);
    var currentTask = null;
    var onCompleteHandlers = [];
    /**
     * Максимальное допустимое время на выполнение таска
     * @type {number}
     */
    var maxTimeForTaskExecution = 4000; //millis
    /**
     * Максимальное время по умолчанию для ожидания завершения группы задач.
     * Далее вызовется колбек с неудачей
     * @type {number}
     */
    var maxTimeForCompleteHandler = 10000; // millis

    function doNext() {
        if (currentTask === null) {
            if (tasks.length > 0) {
                // получить следующий таск с учетом приоритета
                var inx = getNextTaskIndex();
                currentTask = tasks[inx];
                // фиксируем время начала
                currentTask.startTime = new Date().getTime();
                // взяли таск в работу и сразу удаляем его их очереди
                tasks.splice(inx,1);
                if (typeof currentTask.run === 'function') {
                    currentTask.run();
                }
            }
        }
        else {
            // смотрим на время выполнения таска
            var now = new Date().getTime();
            if (now - currentTask.startTime > currentTask.maxWaitTime) {
                // таск не успел выполниться за отведенное время
                if (typeof currentTask.onFail === 'function') {
                    currentTask.onFail();
                }
                // Если таск никто на клиенте не релизит и ждем достаточно долго, то релизим здесь
                // будут вызваны также обработчики onComplete внутри
                Queue.release(currentTask, true);
                currentTask = null;
            }
        }
    }

    /**
     * Выбрать следующую задачу с максимальным значением priority
     */
    function getNextTaskIndex() {
        // находим задачу с максимальным значением priority
        if (tasks.length > 0) {
            var maxInx = 0;
            for (var i = 1; i < tasks.length; i++) {
                if (tasks[maxInx].priority < tasks[i].priority) {
                    maxInx = i;
                }
            }
            return maxInx;
        }
        return null;
    }

    /**
     * Найти в массиве обработчиков задачи указанного типа type
     *
     * @param {Array} handlers
     * @param {string} type
     * @returns {number}
     */
    function findHandler(handlers, type) {
        for (var j = 0; j < handlers.length; j++) {
            if (handlers[j].type === type) {
                return j;
            }
        }
        return -1;
    }

    /**
     * Добавить новую задачу для выполнения
     * @param {Object} t - задача на выполнение
     * @param {function} t.run - код задачи для выполнения
     * @param {function} t.onFail - Вызывается, когда время на выполнение задачи истекло. Опционально.
     * @param {string} t.type - тип задачи, опционально
     * @param {Number} t.maxWaitTime - максимальное время ожидания выполнения таска. Опционально. После чего таск считается неуспешным. То же самое произойдет, если забыть вызвать release для таска
     * @param {Number} t.priority - приоритет задачи (выше -- важнее). Опционально.
     */
    global.push = function(t) {
        if (!t.hasOwnProperty('priority')) {
            t.priority = 1;
        }
        if (!t.hasOwnProperty('maxWaitTime')) {
            t.maxWaitTime = maxTimeForTaskExecution;
        }
        tasks.push(t);
    };

    /**
     * Завершить таск. Вызывается из клиентского кода.
     * Вызов указывает объекту Queue на то, что можно выполнять следующий таск.
     *
     * @param {object} t - объект-таск
     * @param {boolean} [failed] - завершаем таск с ошибкой
     */
    global.release = function(t, failed) {
        failed = (failed === undefined) ? false: failed;
        if (currentTask === t) {
            if (t.hasOwnProperty('type')) {
                for (var j = 0; j < onCompleteHandlers.length; j++) {
                    if (onCompleteHandlers[j].type === t.type) {
                        // у завершаемого таска есть обработчик
                        // смотрим, что все таски этого типа закнчились
                        var notFound = true;
                        for (var i = 0; i < tasks.length; i++) {
                            if (tasks[i].type === t.type) {
                                notFound = false;
                                break;
                            }
                        }
                        if (notFound) {
                            var clb = null;
                            if (failed === true) {
                                clb = onCompleteHandlers[j].onFail;
                            }
                            else {
                                clb = onCompleteHandlers[j].onSuccess;
                            }
                            // удалем обработчик для типа задач
                            onCompleteHandlers.splice(j,1);
                            if (clb) {
                                clb();
                            }
                        }
                    }
                }
            }
            currentTask = null;
        }
    };

    /**
     * Подписка на завершение всех задач определенного типа.
     * Например, пометить все задачи по загрузке ресурсов 'taskTypeUpload' и подписаться на обратный вызов, когда все подобный задачи будут выполнены.
     * Если задач указанного типа нет, то обработчик всё равно будет добавлен. Если в будущем задачи появятся и завершатся, обработчик сработает.
     *
     * @param {string} type типа задачи
     * @param {Function} onSuccess функция для вызова после выполнения всех задач.
     * @param {Function} onFail колбек при неудачном завершении. Например, время исполнения истекло, а задача не была завершена.
     */
    global.onComplete = function(type, onSuccess, onFail) {
        // поиск: есть ли уже такой обработчик
        var p = findHandler(onCompleteHandlers, type);
        if (p >= 0) {
            // если такой обработчик уже есть - удаляем его
            onCompleteHandlers.splice(p,1);
        }
        onCompleteHandlers.push({
            type: type,
            onSuccess: onSuccess,
            onFail: onFail,
            registrationTime: new Date().getTime()
        });
    };

    /**
     * Во время разработки автотестов возникла необходимость для параллельного выполнения задач
     * Это возмонжость создавать несколько очередей для выполнения в них проверок и сценариев
     *
     * @returns {{}}
     */
    global.create = function() {
        var newQueue = {};
        __init_queue(newQueue);
        return newQueue;
    };

    /**
     * Удалить запущенные и ожидающие таски по типу
     *
     * @param {string} param.type
     */
    global.clearTasks = function(param) {
        param = param || {};
        if (typeof param.type === 'string') {
            if (currentTask && currentTask.type === param.type) {
                currentTask = null;
            }
            for (var i = 0; i < tasks.length;) {
                if (tasks[i].type == param.type) {
                    tasks.splice(i, 1);
                }
                else {
                    i++;
                }
            }
        }
    };
}
// автоматический инит главного инстанса Queue
// с ним работает редактор и все основные сервисы
__init_queue(Queue);