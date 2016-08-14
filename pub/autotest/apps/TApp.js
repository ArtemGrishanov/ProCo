/**
 * Created by artyom.grishanov on 11.08.16.
 *
 * Первый уровень: уровень проверки отдельного приложения
 */

var TApp = {};

(function(global){

    /**
     * Проверка приложения на работоспособность и корректность
     *
     * @param assert
     * @param app
     * @constructor
     */
    function checkApp(assert, app) {
        if (app.type === 'test') {
            // тип приложения - тест
            checkTestInStatic(assert, app);
            checkTestInAction(assert, app);
        }
        else {
            assert.ok(false, 'checkApp: unknown app type '+app.constructor);
        }
    }

    /**
     *
     * @param width
     * @param height
     * @param defaults
     * @returns {*}
     * @constructor
     */
    function CREATE_TEST(width, height, defaults) {
        return createTest();
    }

    global.checkApp = checkApp;
    global.createTest = createTest;

})(TApp);