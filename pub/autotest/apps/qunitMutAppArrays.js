/**
 * Created by alex on 10.08.17.
 */
QUnit.test("MutApp test: Arrays operations", function( assert ) {

    var app = new PersonalityApp({
        defaults: null
    });
    app.start();

    // начальное количество свойств
    var originCount = app._mutappProperties.length;
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 0);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text') === null);

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text').length === 1);
    // добавятся
    // + id=pm quiz.0.question.text
    // + id=pm quiz.0.question.backgroundImage
    // + id=pm quiz.0.answer.options
    // + id=pm quiz.0.answer.options.0.text
    // + id=pm quiz.0.answer.options.1.text
    // + id=pm quiz.0.answer.options.2.text
    assert.ok(originCount+6 === app._mutappProperties.length);

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 2);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text').length === 2);
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.0.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.getValue().length === 3);
    assert.ok(MutApp.Util.isMutAppPropertyArray(optionsProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.answer.options').length === 2);
    assert.ok(originCount+12 === app._mutappProperties.length);

    // deleting element
    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text').length === 1);
    assert.ok(originCount+6 === app._mutappProperties.length);

    // deleting element
    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 0);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text') === null);
    // удалится не только последний элемент массива, но и свойство showLogo на экране вопроса
    assert.ok(originCount === app._mutappProperties.length);

});