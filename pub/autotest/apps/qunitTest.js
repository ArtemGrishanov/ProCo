/**
 * Created by artyom.grishanov on 20.07.16.
 *
 * Проверки определяют работоспособность теста, как отдельного приложения
 * Независимо ни от чего (редактора, движка)
 */

QUnit.test("Specproject Test_New", function( assert ) {
    var app = LAYER1_APP.CREATE_TEST();
    LAYER1_APP.CHECK_TEST(app);
});