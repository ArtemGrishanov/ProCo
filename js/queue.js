/**
 * Created by artyom.grishanov on 21.12.15.
 */

var Queue = {};
(function(global) {
    var tasks = [];
    var timer = setInterval(doNext, 200);
    var currentTask = null;
    var taskInProgress = false;
    var onCompleteHandlers = [];

    //TODO если стишком долго выполняется - закрыть таск через function release
    function doNext() {
        if (taskInProgress === false && tasks.length > 0) {
            currentTask = tasks.shift();
            if (typeof currentTask.run === 'function') {
                log('run task');
                currentTask.run();
            }
            taskInProgress = true;
        }
    }

    /**
     *
     * @param t
     */
    global.push = function(t) {
        log('New task came');
        tasks.push(t);
    };

    /**
     * Завершить таск
     * Queue может продолжить выполнение дальше
     *
     * @param t
     */
    global.release = function(t) {
        if (currentTask === t) {
            taskInProgress = false;
//TODO проверка по onCompleteHandlers по типу задач что всё закончилось
//            for (var i = 0; i < ) {
//
//            }
        }
    }

    /**
     * Возможность подписаться на завершение всех задач определенного типа.
     * Например, пометить все задачи по загрузке ресурсов 'taskTypeUpload' и подписаться на обратный вызов
     *
     * @param type
     * @param callback
     */
    global.onComplete = function(type, callback) {
        onCompleteHandlers.push(callback);
    }


})(Queue);

//var QueueTask = function(param) {
//    this.run = param.run;
//    this.done = param.done;
//    this.data = param.data;
//    this.type = param.type;
//};
//QueueTask.prototype.some = function() {
//
//}