/**
 * Created by artyom.grishanov on 11.08.16.
 */

var TEngine = {};

(function(global){

    /**
     * Проверка Engine на работоспособность и корректность
     *
     * @param assert
     * @constructor
     */
    function checkEngine(assert) {
        assert.ok(Engine.getAppProperties().length > 120, 'More then 120 appProperties for test');
        assert.ok(Engine.getAppProperties().length === Engine.getAppPropertiesObjectPathes().length, 'App Properties and object pathes');
        assert.ok(Engine.getAppScreenIds().length >= 9, 'There are some screens');
    }

    global.checkEngine = checkEngine;

})(TEngine);