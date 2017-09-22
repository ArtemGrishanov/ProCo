/**
 * Используется упрощенная модель теста
 * @returns
 */
function createQuizElem() {
    return {
        question: {
            uiTemplate: 'uiu_template',
            backgroundColor: new MutAppProperty({
                propertyString: 'id=pm quiz.{{id}}.question.backgroundColor',
                value: '#ffffff'
            })
        },
        answer: {
            type: 'radiobutton',
            options: new MutAppPropertyArray({
                propertyString: 'id=pm quiz.{{id}}.answer.options',
                value: [
                    {
                        text: new MutAppProperty({
                            propertyString: 'id=pm quiz.{{id}}.answer.options.{{id}}.text',
                            value: 'Rock'
                        })
                    },
                    {
                        text: new MutAppProperty({
                            propertyString: 'id=pm quiz.{{id}}.answer.options.{{id}}.text',
                            value: 'Jazz'
                        })
                    },
                    {
                        text: new MutAppProperty({
                            propertyString: 'id=pm quiz.{{id}}.answer.options.{{id}}.text',
                            value: 'Pop'
                        })
                    }
                ]
            })
        }
    };
}

function createOption() {
    return {};
}


QUnit.test("MutApp test: Arrays operations", function( assert ) {
    // Операция добавления: ОК с индексами и с сабэлементами
    // Операция перемещения и удаления: не ОК
    // С массивами: не ОК то что без приложения их не потестируешь нормально
    // постараться обойтись без приложения: лучшая локализация проблемы, легче воспринимать
    // просто не нравятся propertyString для массива при создании: выглядит нелогично и стремно

    var quizArray = new MutAppPropertyArray({
        propertyString: 'quizArray',
        value: []
    });

    assert.ok(quizArray.length === 0);
    quizArray.push(createQuizElem());
    assert.ok(quizArray.length === 1);

    assert.ok(MutApp.Util.getPropertiesBySelector(arr1, '0.foo') === null);
    assert.ok(MutApp.Util.getPropertiesBySelector(arr1, '0.question'));
    assert.ok(MutApp.Util.getPropertiesBySelector(arr1, '0.answer'));
    assert.ok(MutApp.Util.getPropertiesBySelector(arr1, '0.answer.options'));
    assert.ok(MutApp.Util.getPropertiesBySelector(arr1, '0.answer.options.0'));
    assert.ok(MutApp.Util.getPropertiesBySelector(arr1, '0.answer.options.0.text'));
});

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
    // + id=pm quiz.0.question.backgroundColor
    // + id=pm quiz.0.question.backgroundImage
    // + id=pm quiz.0.answer.options
    // + id=pm quiz.0.answer.options.0.text
    // + id=pm quiz.0.answer.options.1.text
    // + id=pm quiz.0.answer.options.2.text
    assert.ok(originCount+7 === app._mutappProperties.length);

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
    assert.ok(originCount+14 === app._mutappProperties.length);

    // add element in array, inside in array
    app.model.attributes.quiz._value[0].answer.options.addElementByPrototype('id=pm proto_optionText');
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.0.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.getValue().length === 4);
    assert.ok(MutApp.Util.isMutAppPropertyArray(optionsProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.answer.options').length === 2);
    assert.ok(originCount+15 === app._mutappProperties.length);

    // deleting element
    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text').length === 1);
    assert.ok(originCount+7 === app._mutappProperties.length);

    // deleting element
    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.getValue().length === 0);
    assert.ok(MutApp.Util.isMutAppPropertyArray(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text') === null);
    // удалится не только последний элемент массива, но и свойство showLogo на экране вопроса
    assert.ok(originCount === app._mutappProperties.length);

});