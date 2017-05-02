/**
 * Created by artyom.grishanov on 27.04.17.
 *
 * Что это такое и зачем:
 *
 * Как добавить хук:
 * 1) В descriptor.hooks проекта можно добавить функцию с одним из зарезервированных имен, например 'beforePreview'
 *    1.1 Доступные хуки в config.editor.hooks.hookNames
 *
 * 2) В editor.js в нужный момент сработает этот хук, выполнится кастомный код хука
 *
 */
var hookRunner = {};
(function(global) {

    var hooks = {};

    /**
     * Установить хуки из загруженного промо проекта
     * @param {Object} ahooks from desciptor.hooks
     */
    function setHooks(ahooks) {
        hooks = ahooks || {};
    }

    /**
     * Попытка вызвать хук, если он определен
     *
     * @param {string} hookName
     * @param {Object} editorEnvironment
     * @param {function} callback
     */
    function on(hookName, editorEnvironment, callback) {
        var f = hooks[hookName];
        if (f) {
            // using Queue
            var t = {
                maxWaitTime: config.editor.hooks.maxWaitTimeInQueue,
                run: function() {
                    f(
                        {editorEnvironment: editorEnvironment},
                        (function(result) {
                            Queue.release(this);
                            callback(new HookResultEvent({status: (result==='ok') ? 'completed': 'error'}));
                        }).bind(this)
                    );
                },
                onFail: function() {
                    callback(new HookResultEvent({status:'error'}));
                }
            };
            Queue.push(t);
        }
        else {
            callback(new HookResultEvent({status:'not_exist'}));
        }
    }

    global.setHooks = setHooks;
    global.on = on;

})(hookRunner);
