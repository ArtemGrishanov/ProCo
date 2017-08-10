/**
 * Created by alex on 10.08.17.
 */
/**
 * Тест сериализации отдельных свойств
 * Нужно проверять сериализцию различных видов свойств: MutAppProperty CssMutAppProperty MutAppPropertyArray
 *
 * Как сейчас:
 * 1) Добавить новый результат, проверить что новые свойства появились и в списке mutappproperty
 * 2) Сериализовать свойства результата
 * 3) Создать новое приложение и установить туда свойства результата
 * 4)
 *
 * Как должно быть, всё основывается на compare и clone:
 * 1) Сделать клон приложения app1
 * 2) Сериализовать любое свойство в приложении app1
 *      Сделать клон приложения app1
 * 3.a) Десериализовать в том же приложении app1
 * 3.a) Десериализовать в новом приложении app2
 *
 * Надо ли десериализовывать в ТОМ ЖЕ приложении?
 *  можно, но тогда можно сделать клон, или снепшот. Это как операции отмены
 *
 * 3) app1 app2: MutApp.compare (значение свойств, количество свойств)
 *      MutApp.compare - гарантия соответствия количества свойств и из значений
 *
 *      TODO all
 *      выбирать любое свойство и сериализовывать
 *          TODO0 clone app, auto test about clone method
 *          TODO1 выбирать среди всех
 *          -- TODO2 менять как - пока об изменении не идет речь
 *      ожидаемое количество свойств надо?
 *          TODO какая то встоенная проверка движка?
 *      что свойство находится в списке _mutAppProperty ?
 *          TODO какая то встоенная проверка движка?
 *              что свойство точно используется
 *
 *      TODO editing
 *          - iterate properties
 *          - set new values
 *          - check standart rules
 *
 * @underconstruction
 */
QUnit.test("MutApp test: MutAppProperties serialization operations. PersonalityTest was taken for test.", function( assert ) {
    var EXPECTED_MUTAPP_PROPERTIES_COUNT = 9;

    var app = new PersonalityApp({
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT);
    assert.ok(app.model.attributes.results.getValue().length === 0);
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    checkResult(app, 1);
    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT + 2);

    // запоминаем оригиальные значения и сериализованные строки
    // MutAppPropertyArray app.model.attributes.results
    var serRes = app.model.attributes.results.serialize();
    assert.ok(serRes.length > 30);
    var savedResults1 = app.model.attributes.results; // сохраняем первую версию объекта для последующего сравнения
    // MutAppProperty app.model.attributes.showBackgroundImage
    var serShowBackgroundImage = app.model.attributes.showBackgroundImage.serialize();

    //TODO serialize
    //1. автоматический алгоритм проход по всем свойствам и проверка всего как было и как станет после
    //2. Сериализация и восстановление всего приложения: serialize deserialize compare

    assert.ok(serShowBackgroundImage.length > 10);
    var showBackgroundImage1 = app.model.attributes.showBackgroundImage; // сохраняем первую версию объекта для последующего сравнения


    // запустим
    var app = new PersonalityApp({
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT);
    checkResult(app, 0);
    app.model.attributes.results.deserialize(serRes);
    checkResult(app, 1);
    app.model.attributes.showBackgroundImage.deserialize(serShowBackgroundImage);

    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT + 2);
    assert.ok(app.model.attributes.results.compare(savedResults1));
    assert.ok(app.model.attributes.showBackgroundImage.compare(showBackgroundImage1));

    function checkResult(app, expectedResultsCount) {
        assert.ok(app.model.attributes.results.getValue().length === expectedResultsCount);
        assert.ok(app._mutappProperties.indexOf(app.model.attributes.results) >= 0);
        var resValue = app.model.attributes.results.getValue();
        for (var i = 0; i < resValue.length; i++) {
            assert.ok(app._mutappProperties.indexOf(resValue[i].title) >= 0);
            assert.ok(app._mutappProperties.indexOf(resValue[i].description) >= 0);
        }
    }
});

/**
 * Тест сериализации приложения целиком
 */
QUnit.test("MutApp test: MutApp serialization. PersonalityTest was taken for test.", function( assert ) {
    // создать приложение
    var originApp = new PersonalityApp({
        defaults: null // no defaults
    });
    originApp.start();

    // внести изменения во все свойства приложения
    valueGenerator.randomChangeApp(originApp);
    // сериализовать приложение

    // создать новое приложение
    var app2 = new PersonalityApp({
        defaults: null // no defaults
    });
    app2.start();

    // десериализовать в новом приложении

    // сравнить приложения 1 и 2 compare
    assert.ok(originApp.compare(app2), originApp._compareDetails.message);
});