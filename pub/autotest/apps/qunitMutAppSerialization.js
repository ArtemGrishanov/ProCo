/**
 * Created by alex on 10.08.17.
 */
var EXPECTED_MUTAPP_PROPERTIES_COUNT = 83;
var PROPETIES_IN_ONE_QUIZ_ELEM = 7;
var PROPETIES_IN_ONE_RESULT_ELEM = 6+1; // 6 - это свойства в элементе результата + 1-shareImage создается

QUnit.test("MutApp test: MutAppProperties array serialization (PersonalityTest)", function( assert ) {

    var app = new PersonalityApp({
        autotesting: true,
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT);
    assert.ok(app.model.attributes.quiz.toArray().length === 0);
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT + PROPETIES_IN_ONE_QUIZ_ELEM);

    var serString = app.model.attributes.quiz.serialize();
    assert.ok(typeof serString === 'string' && serString.length > 10);

    var count = (serString.match(/_orderedIds/g) || []).length; // сколько раз встречается атрибуты dictionary в сериализованой строке
    assert.ok(count === 2, 'quiz array, options array');
    var count = (serString.match(/MutAppPropertyDictionary/g) || []).length; // сколько раз встречается атрибуты dictionary в сериализованой строке
    assert.ok(count === 2, 'quiz array, options array');

    var app2 = new PersonalityApp({
        defaults: null // no defaults
    });
    app2.start();
    app2.model.attributes.quiz.deserialize(serString);
    assert.ok(app2._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT + PROPETIES_IN_ONE_QUIZ_ELEM);
    // сравниваем только свойства, не приложения
    assert.ok(app.model.attributes.quiz.compare(app2.model.attributes.quiz) === true, app.model.attributes.quiz.compareDetails.message);
});
/**
 * Тест сериализации отдельных свойств
 * Нужно проверять сериализцию различных видов свойств: MutAppProperty CssMutAppProperty MutAppPropertyArray
 */
QUnit.test("MutApp test: MutAppProperties serialization operations. PersonalityTest was taken for test.", function( assert ) {

    var app = new PersonalityApp({
        autotesting: true,
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT);
    assert.ok(app.model.attributes.results.toArray().length === 0);
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    checkResult(app, 1);
    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT + PROPETIES_IN_ONE_RESULT_ELEM); // PROPETIES_IN_ONE_RESULT_ELEM sub property in result elem

    // запоминаем оригиальные значения и сериализованные строки
    var serRes = app.model.attributes.results.serialize();
    assert.ok(serRes.length > 30);
    var savedResults1 = app.model.attributes.results; // сохраняем первую версию объекта для последующего сравнения
    var serShowBackgroundImage = app.model.attributes.showLogoOnStartScreen.serialize();

    assert.ok(serShowBackgroundImage.length > 10);
    var showBackgroundImage1 = app.model.attributes.showLogoOnStartScreen; // сохраняем первую версию объекта для последующего сравнения

    // запустим новое приложение
    var app = new PersonalityApp({
        autotesting: true,
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT);
    checkResult(app, 0);
    // десериализуем свойства по одному
    app.model.attributes.results.deserialize(serRes);
    checkResult(app, 1);
    app.model.attributes.showLogoOnStartScreen.deserialize(serShowBackgroundImage);

    // должны быть создана одна шара-картинка для одного результата. Но мы вроде договорились что десериалайз не вызывает события изменения свойства?
    var SHARE_IMAGE_COUNT_WHICH_MUST_BE_CREAETED = 1;
    assert.ok(app._mutappProperties.length === EXPECTED_MUTAPP_PROPERTIES_COUNT + PROPETIES_IN_ONE_RESULT_ELEM - SHARE_IMAGE_COUNT_WHICH_MUST_BE_CREAETED);
    // сравниваем свойства по одному
    assert.ok(app.model.attributes.results.compare(savedResults1));
    assert.ok(app.model.attributes.showLogoOnStartScreen.compare(showBackgroundImage1));

    function checkResult(app, expectedResultsCount) {
        assert.ok(app.model.attributes.results.toArray().length === expectedResultsCount);
        assert.ok(app._mutappProperties.indexOf(app.model.attributes.results) >= 0);
        var resValue = app.model.attributes.results.toArray();
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
        autotesting: true,
        defaults: null // no defaults
    });
    originApp.start();

    // внести изменения во все свойства приложения
    valueGenerator.randomChangeApp(originApp);

    // сериализовать приложение
    var str = originApp.serialize();

    // создать новое приложение
    var app2 = new PersonalityApp({
        autotesting: true,
        defaults: null // no defaults
    });
    app2.start();

    // десериализовать в новом приложении
    app2.deserialize(str);

    // сравнить приложения 1 и 2 compare
    assert.ok(originApp.compare(app2), originApp.compareDetails.message);
});

/**
 * Тест сериализации приложения целиком
 */
QUnit.test("MutApp test: MutApp serialization. FbPanorama was taken for test.", function( assert ) {
    // создать приложение
    var originApp = new FbPanoramaApp({
        autotesting: true,
        defaults: null // no defaults
    });
    originApp.start();

    originApp.model.attributes.pins.addElementByPrototype('id=mm pinProto1');
    originApp.model.attributes.pins.addElementByPrototype('id=mm pinProto1');
    originApp.model.attributes.pins.addElementByPrototype('id=mm pinProto1');

    // сериализовать приложение
    var str = originApp.serialize();

    // создать новое приложение
    var app2 = new FbPanoramaApp({
        autotesting: true,
        defaults: null // no defaults
    });
    app2.start();

    // десериализовать в новом приложении
    app2.deserialize(str);

    // сравнить приложения 1 и 2 compare
    assert.ok(originApp.compare(app2), originApp.compareDetails.message);
});

/**
 * Тест сериализации приложения целиком с удалением элементов массива
 */
QUnit.test("MutApp test: MutApp serialization with array element delete. (PersonalityTest)", function( assert ) {
    // создать приложение
    var originApp = new PersonalityApp({
        autotesting: true,
        defaults: null // no defaults
    });
    originApp.start();
    originApp.isOK({assert: assert});

    originApp.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    originApp.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    originApp.isOK({assert: assert});

    // сериализовать приложение
    var str = originApp.serialize();
    originApp.isOK({assert: assert});

    // создать новое приложение
    var app2 = new PersonalityApp({
        autotesting: true,
        defaults: null // no defaults
    });
    app2.start();

    // десериализовать в новом приложении
    app2.deserialize(str);
    originApp.isOK({assert: assert});
    assert.ok(originApp.compare(app2), originApp.compareDetails.message);

    // теперь удалить элементы из массива
    app2.model.attributes.quiz.deleteElement(0);
    app2.model.attributes.results.deleteElement(0);
    assert.ok(originApp.compare(app2) === false, originApp.compareDetails.message);
    var str2 = app2.serialize();

    // создать новое приложение
    var app3 = new PersonalityApp({
        autotesting: true,
        defaults: str2
    });
    app3.start();
    //app3.deserialize(str2);
    // ошибка
    // десериализация сначала ставит значание как надо (undefined, хотя undefined тоже сомнительно что верно, но не суть)
    // но затем app3.updateCssMutAppPropertiesValues забирает с экрана черный цвет
    //
    assert.ok(app2.compare(app3), app2.compareDetails.message);
});

/**
 * Тест десериализации при старте
 */
QUnit.test("MutApp test: MutApp deserialization in start. (PersonalityTest)", function( assert ) {
    var originApp = new PersonalityApp({
        defaults: null,
        autotesting: true
    });
    originApp.start();
    // внести изменения во все свойства приложения
    valueGenerator.randomChangeApp(originApp);
    var serString = originApp.serialize();

    var app2 = new PersonalityApp({
        defaults: serString
    });
    app2.start();
    assert.ok(originApp.compare(app2), originApp.compareDetails.message);
});

/**
 * Десериализация поверх существующего свойтсва
 *
 * 1) app1.model.attributes.results уже существует включая id=pm results.0.title
 * 2) десериализуем сразу app1.model.attributes.results.deserialize();
 *
 */
QUnit.test("MutApp test: deserialization of existed property", function( assert ) {
    var app1 = new PersonalityApp({
        autotesting: true
    });
    app1.start();
    app1.model.attributes.results.addElementByPrototype('id=pm resultProto1');

    var app2 = new PersonalityApp({
        autotesting: true
    });
    app2.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    var serStr = app2.model.attributes.results.serialize();
    app1.model.attributes.results.deserialize(serStr);

    assert.ok(app1.model.attributes.results.compare(app2.model.attributes.results));
    assert.ok(app1.compare(app2)===false, app1.compareDetails.message);

    app1.deserialize(app2.serialize());
    assert.ok(app1.compare(app2), app1.compareDetails.message);
});