/**
 * Created by artyom.grishanov on 20.07.16.
 *
 * Проверки определяют работоспособность теста, как отдельного приложения
 * Независимо ни от чего (редактора, движка)
 */

QUnit.test("Specproject Test_New", function( assert ) {
    var done = assert.async();
    TApp.createApp('test', function(appIFrame) {
        // приложение создается асинхронно через iframe
        TApp.checkApp(assert, appIFrame);
        done();
    });
});