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
    // id=pm quiz.0.question.text
    // type=questions showLogo - так как экрана questionScreen до этого не было
    assert.ok(originCount+2 === app._mutappProperties.length);

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 2);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text').length === 2);
    assert.ok(originCount+3 === app._mutappProperties.length);

    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text').length === 1);
    assert.ok(originCount+2 === app._mutappProperties.length);

    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 0);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text') === null);
    assert.ok(originCount === app._mutappProperties.length);

//    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
//    assert.ok(quizProperty instanceof MutAppPropertyArray === true);
//    assert.ok(quizProperty.getValue().length === 0);
//    assert.ok(MutApp.Util.isMutAppProperty(quizProperty) === true);
//
//    assert.ok(app.getPropertiesBySelector('id=pm results.{{number}}.title').length === 2);
//
//    var title0Property = app.getPropertiesBySelector('id=pm results.0.title')[0].value;
//    assert.ok(title0Property instanceof MutAppProperty === true);
//    assert.ok(typeof title0Property.getValue() === 'string');
//    assert.ok(MutApp.Util.isMutAppProperty(title0Property) === true);
});