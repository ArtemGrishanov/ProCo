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
            options: new MutAppPropertyDictionary({
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

/**
 * Базовые операции с MutAppPropertyDictionary
 *
 */
QUnit.test("MutAppPropertyDictionary: basics 1", function( assert ) {
    var arr1 = new MutAppPropertyDictionary({
        propertyString: 'arr1',
        value: []
    });
    assert.ok(arr1.toArray().length === 0);

    arr1.addElement('elem1');
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 1);
    assert.ok(arr1.toArray().length === 1);
    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(arr1.getIdFromPosition(1) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem1');

    arr1.addElement('elem2');
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 2);
    assert.ok(arr1.toArray().length === 2);
    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(arr1.toArray()[1] === 'elem2');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(typeof arr1.getIdFromPosition(1) === 'string');
    assert.ok(arr1.getIdFromPosition(2) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem1');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(1)]  === 'elem2');


    arr1.addElement('elem0', 0);
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 3);
    assert.ok(arr1.toArray().length === 3);
    assert.ok(arr1.toArray()[0] === 'elem0');
    assert.ok(arr1.toArray()[1] === 'elem1');
    assert.ok(arr1.toArray()[2] === 'elem2');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(typeof arr1.getIdFromPosition(1) === 'string');
    assert.ok(typeof arr1.getIdFromPosition(2) === 'string');
    assert.ok(arr1.getIdFromPosition(3) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem0');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(1)]  === 'elem1');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(2)]  === 'elem2');

    // todo change position operation

    // todo deleteElementById

    // todo getPosition

    arr1.deleteElement(0);
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 2);
    assert.ok(arr1.toArray().length === 2);
    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(arr1.toArray()[1] === 'elem2');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(typeof arr1.getIdFromPosition(1) === 'string');
    assert.ok(arr1.getIdFromPosition(2) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem1');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(1)]  === 'elem2');

    arr1.deleteElement(99);
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 1);
    assert.ok(arr1.toArray().length === 1);
    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(arr1.getIdFromPosition(1) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem1');

    arr1.deleteElement(0);
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 0);
    assert.ok(arr1.toArray().length === 0);
    assert.ok(arr1.getIdFromPosition(0) === undefined);
});

QUnit.test("MutAppPropertyDictionary: basics 2", function( assert ) {
    var arr1 = new MutAppPropertyDictionary({
        propertyString: 'arr1',
        value: []
    });
    assert.ok(arr1.toArray().length === 0);

    arr1.addElement('elem1');
    arr1.addElement('elem2');

    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 2); // utils.js
    assert.ok(arr1.toArray().length === 2);
    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(arr1.toArray()[1] === 'elem2');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(typeof arr1.getIdFromPosition(1) === 'string');
    assert.ok(arr1.getIdFromPosition(2) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem1');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(1)]  === 'elem2');

    var elementIndex = 1;
    var newElementIndex = 0
    arr1.changePosition(elementIndex, newElementIndex);

    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 2);
    assert.ok(arr1.toArray().length === 2);
    assert.ok(arr1.toArray()[0] === 'elem2'); // changed!
    assert.ok(arr1.toArray()[1] === 'elem1');
    assert.ok(typeof arr1.getIdFromPosition(0) === 'string');
    assert.ok(typeof arr1.getIdFromPosition(1) === 'string');
    assert.ok(arr1.getIdFromPosition(2) === undefined);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem2'); // changed!
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(1)]  === 'elem1');

    arr1.addElement('elem3');
    arr1.addElement('elem4');
    arr1.changePosition(0, 99);

    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(arr1.toArray()[1] === 'elem3');
    assert.ok(arr1.toArray()[2] === 'elem4');
    assert.ok(arr1.toArray()[3] === 'elem2');

    arr1.changePosition(3, 1);
    assert.ok(arr1.toArray()[0] === 'elem1');
    assert.ok(arr1.toArray()[1] === 'elem2');
    assert.ok(arr1.toArray()[2] === 'elem3');
    assert.ok(arr1.toArray()[3] === 'elem4');
    assert.ok(arr1.toArray().length === 4);
    assert.ok(getOwnPropertiesCount(arr1.getValue()) === 4);
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(0)]  === 'elem1'); // changed!
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(1)]  === 'elem2');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(2)]  === 'elem3');
    assert.ok(arr1.getValue()[arr1.getIdFromPosition(3)]  === 'elem4');
});

/**
 * Delete elements in dictionary inside another dictionary
 */
QUnit.test("MutApp test: Delete elements in dictionary inside another dictionary", function( assert ) {
    var deletedEventsCount = 0;
    var deletedPropertyString = null;
    var app = new PersonalityApp({
        mode: 'edit',
        defaults: null,
        appChangeCallbacks: [onAppChanged]
    });
    app.start();

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    var quizProperty0ElemId = quizProperty.getIdFromPosition(0);

    // проверяем массив в массиве
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.answer.options.{{id}}').length === 3);
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.'+quizProperty0ElemId+'.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.toArray().length === 3);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(optionsProperty) === true);

    // delete element in array, inside in array
    var propertiesCountBeforeDelete = app._mutappProperties.length;
    var option1Id = app.model.attributes.quiz.getValue()[quizProperty0ElemId].answer.options.getIdFromPosition(1); // сохранить id перед удалением для последующей проверки
    app.model.attributes.quiz.getValue()[quizProperty0ElemId].answer.options.deleteElement(1); // удалить средний элемент из трех
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.'+quizProperty0ElemId+'.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.toArray().length === 2);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.answer.options.{{id}}').length === 2);
    assert.ok(propertiesCountBeforeDelete-1 === app._mutappProperties.length);
    assert.ok(app.getProperty('id=pm quiz.'+quizProperty0ElemId+'.answer.options.'+option1Id+'.text') === null);
    assert.ok(deletedEventsCount === 1);
    assert.ok(deletedPropertyString === 'id=pm quiz.'+quizProperty0ElemId+'.answer.options.'+option1Id+'.text');

    function onAppChanged(event, data) {
        switch(event) {
            case MutApp.EVENT_PROPERTY_CREATED: {

                break;
            }
            case MutApp.EVENT_PROPERTY_VALUE_CHANGED: {

                break;
            }
            case MutApp.EVENT_PROPERTY_DELETED: {
                deletedPropertyString = data.propertyString;
                deletedEventsCount++;
                break;
            }
        }
    }
});


/**
 * В тестовый массив добавляются элементы содержащие MutAppProperty c путыми propertyString, которые будут назначаться автоматически
 *
 * Эксперимент с автоматическим резолвингом пока закрываем.
 * Все таки надо при старте укзаывать propertyString: вызовы событий, линковка с приложением требуют этого.
 *
 */
//QUnit.test("MutAppPropertyDictionary: Personality array operations. Property string resolving in subproperties", function( assert ) {
//    var app = new PersonalityApp({
//        defaults: null
//    });
//    app.start();
//
//    // тестовый массив, в него добавляются элементы с пустыми propertyString, которые будут резолвиться автоматически
//    app.model.attributes.testArray = new MutAppPropertyDictionary({
//        model: app.model,
//        propertyString: 'id=pm testArray',
//        value: []
//    });
//
//    // addElementByPrototype - нужен только для управления в редакторе, addElement также подходит для тестов
//    // произойдет авторезолвинг propertyString для сабпроперти внутри массива
//    app.model.attributes.testArray.addElement({
//        text: new MutAppProperty({
//            value: 'option text',
//            propertyString: 'autoresolve. it must be like id=pm tetsArray.432d30.text'
//        })
//    }, 0);
//
//    var newId = app.model.attributes.testArray.getIdFromPosition(0);
//    var prop = MutApp.Util.getPropertiesBySelector(app.model.attributes.testArray, newId+'.text');
//    assert.ok(prop.length === 1, 'length');
//    assert.ok(prop[0].value.propertyString === 'id=pm testArray.'+newId+'.text', prop[0].value.propertyString);
//
//    // добавление второго элемента
//    app.model.attributes.testArray.addElement({
//        text: new MutAppProperty({
//            value: 'option text 2',
//            propertyString: 'autoresolve. it must be like id=pm tetsArray.432d30.text'
//        })
//    });
//    var newId = app.model.attributes.testArray.getIdFromPosition(1);
//    var prop = MutApp.Util.getPropertiesBySelector(app.model.attributes.testArray, newId+'.text');
//    assert.ok(prop.length === 1, 'length');
//    assert.ok(prop[0].value.propertyString === 'id=pm testArray.'+newId+'.text', prop[0].value.propertyString);
//
//    // добавление третьего более сложного элемента
//    app.model.attributes.testArray.addElement({
//        label: 'array in array element',
//        subArray: new MutAppPropertyDictionary({
//            value: [
//                {
//                    label: 'label 1',
//                    text: new MutAppProperty({value:'sub option 1', propertyString: 'todo'})
//                },
//                {
//                    label: 'label 2',
//                    text: new MutAppProperty({value:'sub option 2', propertyString: 'todo'})
//                },
//                {
//                    label: 'label 3',
//                    text: new MutAppProperty({value:'sub option 3', propertyString: 'todo'})
//                }
//            ],
//            propertyString: 'autoresolve. it must be like id=pm tetsArray.432d30.text'
//        })
//    });
//    // сначала проверяем новый элемент верхнего уровня
//    var newId = app.model.attributes.testArray.getIdFromPosition(2);
//    assert.ok(typeof newId === 'string', newId);
//    var prop = MutApp.Util.getPropertiesBySelector(app.model.attributes.testArray, newId+'.label'); // это пример простого свойства
//    assert.ok(prop.length === 1);
//    var prop = MutApp.Util.getPropertiesBySelector(app.model.attributes.testArray, newId+'.subArray');
//    assert.ok(prop.length === 1);
//    assert.ok(prop[0].value.propertyString === 'id=pm testArray.'+newId+'.subArray', prop[0].value.propertyString);
//    // проверить path первого саб элемента
//    var subArray = app.model.attributes.testArray.toArray()[2].subArray;
//    assert.ok(subArray.toArray().length = 3, 'subarray length');
//    var subId1 = subArray.getIdFromPosition(0);
//    assert.ok(subArray.toArray()[0].text.propertyString === 'id=pm testArray.'+newId+'.subArray.'+subId1+'.text', subArray.toArray()[0].text.propertyString);
//});

/**
 * Created by alex on 10.08.17.
 */
QUnit.test("MutAppPropertyDictionary: dictionary operations in personality model", function( assert ) {

    var app = new PersonalityApp({
        mode: 'edit',
        defaults: null
    });
    app.start();

    // начальное количество свойств
    var originCount = app._mutappProperties.length;
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.toArray().length === 0);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text') === null);

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.toArray().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.question.text').length === 1);
    var quizTextProperty = app.model.attributes.quiz.toArray()[0].question.text;
    assert.ok(app.getPropertiesBySelector(quizTextProperty.propertyString).length === 1, 'quizTextProperty.propertyString found in app');
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
    var quizProperty0ElemId = quizProperty.getIdFromPosition(0);
    assert.ok(quizProperty.toArray().length === 2);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.question.text').length === 2);
    var quizTextProperty = app.model.attributes.quiz.toArray()[1].question.text;
    assert.ok(app.getPropertiesBySelector(quizTextProperty.propertyString).length === 1, 'quizTextProperty.propertyString found in app');

    // проверяем массив в массиве
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.'+quizProperty0ElemId+'.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.toArray().length === 3);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(optionsProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.answer.options').length === 2);
    assert.ok(originCount+14 === app._mutappProperties.length);

    // add element in array, inside in array
    app.model.attributes.quiz.getValue()[quizProperty0ElemId].answer.options.addElementByPrototype('id=pm proto_optionText', -1, {questionId: quizProperty0ElemId});
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.'+quizProperty0ElemId+'.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.toArray().length === 4);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(optionsProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.answer.options').length === 2);
    assert.ok(originCount+15 === app._mutappProperties.length);

    // deleting element
    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.toArray().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.question.text').length === 1);
    assert.ok(originCount+7 === app._mutappProperties.length);

    // deleting element
    app.model.attributes.quiz.deleteElement(0);
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.toArray().length === 0);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.question.text') === null);
    // удалится не только последний элемент массива, но и свойство showLogo на экране вопроса
    assert.ok(originCount === app._mutappProperties.length);

});

QUnit.test("MutAppPropertyDictionary: dictionary getElementCopy", function( assert ) {

    var app = new PersonalityApp({
        mode: 'edit',
        defaults: null
    });
    app.start();

    var originCount = app._mutappProperties.length;

    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty.toArray().length === 1);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.question.text').length === 1);
    var quizTextProperty = app.model.attributes.quiz.toArray()[0].question.text;
    assert.ok(app.getPropertiesBySelector(quizTextProperty.propertyString).length === 1, 'quizTextProperty.propertyString found in app');
    // добавятся
    // + id=pm quiz.0.question.text
    // + id=pm quiz.0.question.backgroundColor
    // + id=pm quiz.0.question.backgroundImage
    // + id=pm quiz.0.answer.options
    // + id=pm quiz.0.answer.options.0.text
    // + id=pm quiz.0.answer.options.1.text
    // + id=pm quiz.0.answer.options.2.text
    assert.ok(originCount+7 === app._mutappProperties.length);

    var clonedElement = app.model.attributes.quiz.getElementCopy(0);
    assert.ok(MutApp.Util.deepCompare(clonedElement, app.model.attributes.quiz.toArray()[0]) === true, 'Compare info: ' + MutApp.Util.compareDetails.message);
    app.model.attributes.quiz.addElement(clonedElement);

    // увеличилось на одно суб свойство которое есть внутри элемента массива
    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    var quizProperty0ElemId = quizProperty.getIdFromPosition(0);
    assert.ok(quizProperty.toArray().length === 2);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(quizProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.question.text').length === 2);
    var quizTextProperty = app.model.attributes.quiz.toArray()[1].question.text;
    assert.ok(app.getPropertiesBySelector(quizTextProperty.propertyString).length === 1, 'quizTextProperty.propertyString found in app');

    // проверяем массив в массиве
    var optionsProperty = app.getPropertiesBySelector('id=pm quiz.'+quizProperty0ElemId+'.answer.options')[0].value; // array in array
    assert.ok(optionsProperty.toArray().length === 3);
    assert.ok(MutApp.Util.isMutAppPropertyDictionary(optionsProperty) === true);
    assert.ok(app.getPropertiesBySelector('id=pm quiz.{{id}}.answer.options').length === 2);
    assert.ok(originCount+14 === app._mutappProperties.length);


});