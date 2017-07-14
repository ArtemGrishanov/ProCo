/**
 * Created by artyom.grishanov on 07.07.16.
 */

QUnit.test("MutApp test: basics", function( assert ) {
    assert.ok(MutApp !== undefined);
    assert.ok(typeof MutApp.extend === 'function', 'extend in MutApp');
    assert.ok(typeof MutApp.Screen === 'function', ' Screen in MutApp');

    var AppClass = MutApp.extend({
        inited: false,
        initialize: function() {
            this.inited = true;
        }
    });
    var app = new AppClass();

    assert.ok(app._screens !== undefined, 'screens in app');
    assert.ok(app._models !== undefined, 'models in app');
    assert.ok(app.inited === true, 'app inited');
    assert.ok(!!app.id === true, 'app id');
});

QUnit.test("MutApp test: objects comparison", function( assert ) {
    var app = new PersonalityApp({
        defaults: null
    });
    app.start();
    var m1 = new MutAppProperty({
        application: app, // link with app and schema
        model: app.model, // link with app and schema
        propertyString: 'id=pm showBackgroundImage',
        propertyName: 'showBackgroundImage',
        value: true
    });
    var m2 = new MutAppProperty({
        application: app, // link with app and schema
        model: app.model, // link with app and schema
        propertyString: 'id=pm showBackgroundImage',
        propertyName: 'showBackgroundImage',
        value: true
    });
    var m3 = new MutAppPropertyArray({
        application: app, // link with app and schema
        model: app.model, // link with app and schema
        propertyString: 'id=pm results',
        propertyName: 'results',
        value: []
    });
    var m4 = new MutAppPropertyArray({
        application: app, // link with app and schema
        model: app.model, // link with app and schema
        propertyString: 'id=pm results',
        propertyName: 'results',
        value: []
    });
    var o1 = {}, o2 = {};
    var o3 = {v1:'123', v2:true, v3:2, v4:null, v5:undefined},
        o4 = {v1:'123', v2:true, v3:2, v4:null, v5:undefined},
        o5 = {v1:'123', v2:true, v3:2, v4:null, v5:''},
        o6 = {v1:{ v2:{ v3:[] }, v4:8 }, v5:''},
        o7 = {v1:{ v2:{ v3:[] }, v4:8 }, v5:''},
        o8 = {v1: m1, v5:''},
        o9 = {v1: m2, v5:''},
        o10 = [o1, '2', o6, [o3]],
        o11 = [o2, '2', o7, [o4]]
        ;
    var f1 = function() {var t=0;console.log(t)},
        f2 = function() {var t=0;console.log(t)};

    assert.ok(MutApp.Util.deepCompare(o1, o2));
    assert.ok(MutApp.Util.deepCompare(o3, o4));
    assert.ok(MutApp.Util.deepCompare(o3, o5)===false);
    assert.ok(MutApp.Util.deepCompare(o6, o7));
    assert.ok(MutApp.Util.deepCompare(f1, f2));
    assert.ok(MutApp.Util.deepCompare(o10, o11));

    assert.ok(MutApp.Util.deepCompare(m1, m2)===false); // different unic ids
    m1.id = m2.id; // hack
    assert.ok(MutApp.Util.deepCompare(m1, m2));
    assert.ok(m1.compare(m2) === true);
    assert.ok(MutApp.Util.deepCompare(o8, o9));

    m1.setValue('primitive values only');
    assert.ok(m1.compare(m2) === false);
    m2.setValue('primitive values only');
    assert.ok(m1.compare(m2));

    assert.ok(MutApp.Util.deepCompare(m3, m4)===false); // different unic ids
    m3.id = m4.id; // hack
    assert.ok(MutApp.Util.deepCompare(m3, m4));
    assert.ok(m3.compare(m4) === true);
    m3.addElementByPrototype('id=pm resultProto1');
    assert.ok(m3.compare(m4) === false);
    m4.addElementByPrototype('id=pm resultProto1');

    m3._value[0].id= m4._value[0].id;
    m3._value[0].title.id= m4._value[0].title.id;
    m3._value[0].description.id= m4._value[0].description.id;
    assert.ok(m3.compare(m4));
});

/**
 * Тест сериализации
 */
QUnit.test("MutApp test: MutAppProperties serialization operations. PersonalityTest was taken for test.", function( assert ) {
//    var model1 = new PersonalityModel();
//    var model2 = new PersonalityModel();

    var app = new PersonalityApp({
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === 7);
    assert.ok(app.model.attributes.results.getValue().length === 0);
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    checkResult(app, 1);
    assert.ok(app._mutappProperties.length === 9);
    var serRes = app.model.attributes.results.serialize();
    assert.ok(serRes.length > 30);
    var savedResults1 = app.model.attributes.results; // сохраняем первую версию объекта для последующего сравнения

    var app = new PersonalityApp({
        defaults: null // no defaults
    });
    app.start();

    assert.ok(app._mutappProperties.length === 7);
    checkResult(app, 0);
    app.model.attributes.results.deserialize(serRes);
    checkResult(app, 1);
    assert.ok(app._mutappProperties.length === 9);
    assert.ok(app.model.attributes.results.compare(savedResults1));

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
 * Проверить базовые операции с MutAppProperties свойствами.
 * Особенно с массивами и вложенными свойствами
 */
QUnit.test("MutApp test: MutAppProperties basic operations. PersonalityTest was taken for test.", function( assert ) {
    var app = new PersonalityApp({
        defaults: null // no defaults
    });
    app.start();



    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty instanceof MutAppPropertyArray === true);
    assert.ok(quizProperty.getValue().length === 0);
});

QUnit.test("MutApp test: Screen", function( assert ) {
    var ScreenClass = MutApp.Screen.extend({

        viewInited: false,

        initialize: function(param) {
            this.super.initialize.call(this, param);
            this.viewInited = true;
        },

        render: function() {

        }
    });

    var s1 = new ScreenClass({
        id: 'newScr'
    });

    assert.ok(s1 !== undefined);
    assert.ok(s1 instanceof ScreenClass === true);
    assert.ok(s1.viewInited === true, 'Instance attribute');

    assert.ok(s1.id !== undefined);
    assert.ok(s1.group !== undefined);
    assert.ok(s1.arrayAppPropertyString !== undefined);
    assert.ok(s1.name !== undefined);
    assert.ok(s1.draggable !== undefined);
    assert.ok(s1.canAdd !== undefined);
    assert.ok(s1.canClone !== undefined);
    assert.ok(s1.canDelete !== undefined);
    assert.ok(s1.id === 'newScr');

    assert.ok(typeof s1.render === 'function', 'Screen inherited from Backbone.view');
    assert.ok(typeof s1.initialize === 'function', 'Screen inherited from Backbone.view');
    assert.ok(typeof s1.setElement === 'function', 'Screen inherited from Backbone.view');
});

QUnit.test("MutApp test: app size", function( assert ) {
    var AppClass = MutApp.extend({
        screenRoot: $('#id-swimming_test'),
        initialize: function() {
            this.inited = true;
        }
    });
    var app = new AppClass({width:1000,height:500});

    assert.ok(app.screenRoot.length > 0, 'screenRoot is set');
    assert.ok(app.width === 1000, 'width is set');
    assert.ok(app.height === 500, 'height is set');
    assert.ok($('#id-swimming_test').width() === 1000, 'width is ok');
    assert.ok($('#id-swimming_test').height() === 500, 'height is ok');
});

QUnit.test("MutApp test: Models", function( assert ) {
    var SwimmingTest = MutApp.extend({

        testName: 'swimmingTest',

        undefinedProperty: undefined,

        screenRoot: $('#id-swimming_test'),

        initialize: function(param) {
            // связь модели с приложением swimming test
            var tm = this.addModel(new PersonalityModel({
                application: this,
                customAttr1: 'customValue1'
            }));

            this.addScreen(new StartScreen({
                model: tm,
                id: 'welcomeCustomId',
                screenRoot: this.screenRoot
            }));

            // для всех вопросов создается по отдельному экрану
            var quiz = tm.get('quiz');
            var qs = null;
            var id = null;
            for (var i = 0; i < quiz.length; i++) {
                id = 'questionScreen'+i;
                qs = new QuestionScreen({
                    id: id,
                    type: 'question',
                    model: tm,
                    questionId: quiz[i].id,
                    screenRoot: this.screenRoot
                });
                this.addScreen(qs);
            }

            // для всех результатов по отдельному экрану
            var results = tm.get('results');
            var rs = null;
            for (var i = 0; i < results.length; i++) {
                id = 'resultScreen'+i;
                rs = new ResultScreen({
                    id: id,
                    model: tm,
                    resultId: results[i].id,
                    screenRoot: this.screenRoot
                });
                this.addScreen(rs);
            }
        }
    });

    var app = new SwimmingTest({
        defaults: {
            "testName=swimmingTest appAttr1": 'appData1',
            "testName=swimmingTest appAttr2": true,

            "invalid": 'value',

            "id=tm data1": "12345",
            "id=tm  data2": "5678",
            "id=welcomeCustomId data1": "welcomeCustomId",
            "id=welcomeCustomId data2": false,
            "type=question typeData": 23
        }
    });

    assert.ok(app === app._models[0].application, 'application in model');
    assert.ok(app._parsedDefaults.length === 7, 'parsed values');

    assert.ok(app.appAttr1 === 'appData1', 'app selector');
    assert.ok(app.appAttr2 === true, 'app selector');

    assert.ok(app._models[0].attributes.data1 === '12345', 'default value has set');
    assert.ok(app._models[0].attributes.data2 === '5678', 'default value has set');

    assert.ok(app._screens[0].data1 === 'welcomeCustomId', 'default value has set');
    assert.ok(app._screens[0].data2 === false, 'default value has set');

    assert.ok(app._screens[1].typeData === 23, 'default value has set');
    assert.ok(app._screens[2].typeData === 23, 'default value has set');

    var ent1 = app.getEntities('type', 'question');
    assert.ok(ent1 && ent1.length === 3, 'getAllEntities');

    var ent2 = app.getEntities('id', 'tm');
    assert.ok(ent2 && ent2.length === 1, 'getAllEntities');

    var ent3 = app.getEntities('testName', 'swimmingTest');
    assert.ok(ent3[0] === app && ent3.length === 1, 'getAllEntities');

    var p1 = app.getPropertiesBySelector('id=tm data1');
    assert.ok(p1 !== null, 'getPropertiesBySelector');
    assert.ok(p1.length === 1, 'getPropertiesBySelector');

    var p2 = app.getPropertiesBySelector('id=tm quiz.{{number}}.question.text');
    assert.ok(p2 !== null, 'getPropertiesBySelector');
    assert.ok(p2.length === 3, 'getPropertiesBySelector');
    assert.ok(p2[0].path === 'quiz.0.question.text', 'getPropertiesBySelector path');
    assert.ok(typeof p2[0].value === 'string', 'getPropertiesBySelector value');
    assert.ok(p2[1].path === 'quiz.1.question.text', 'getPropertiesBySelector path');
    assert.ok(typeof p2[1].value === 'string', 'getPropertiesBySelector value');
    assert.ok(p2[2].path === 'quiz.2.question.text', 'getPropertiesBySelector path');
    assert.ok(typeof p2[2].value === 'string', 'getPropertiesBySelector value');

    var p3 = app.getPropertiesBySelector('type=question showLogo');
    assert.ok(p3 !== null, 'getPropertiesBySelector');
    assert.ok(p3.length === 1, 'getPropertiesBySelector');
    assert.ok(p3[0].path === 'showLogo', 'getPropertiesBySelector');
    assert.ok(p3[0].value === true, 'getPropertiesBySelector');

    // поиск по атрибутам модели
    var p4 = app.getPropertiesBySelector('customAttr1=customValue1 data1');
    assert.ok(p4 !== null, 'getPropertiesBySelector');
    assert.ok(p4.length === 1, 'getPropertiesBySelector');

    // undefined значения также должны выбираться
    var p5 = app.getPropertiesBySelector('testName=swimmingTest undefinedProperty');
    assert.ok(p5 !== null, 'getPropertiesBySelector');
    assert.ok(p5.length === 1, 'getPropertiesBySelector');
    assert.ok(p5[0].path === 'undefinedProperty', 'getPropertiesBySelector');
    assert.ok(p5[0].value === undefined, 'getPropertiesBySelector');

    // проверка установки сложных свойств, которые конфликтуют друг с другом
    var app2 = new SwimmingTest({
        defaults: {
            "id=tm objectValue": [
                {
                    url: 'http://example.org/1.jpg',
                    text: 'qwerty'
                },
                {
                    url: 'http://example.org/2.jpg',
                    text: 'asdfg'
                }
            ],
            "id=tm objectValue.0.text": "5678",
            "id=tm objectValue.1.url": 'http://example.org/333.jpg'
        }
    });
    assert.ok(app2.getPropertiesBySelector('id=tm objectValue.0.text')[0].value === '5678');
    assert.ok(app2.getPropertiesBySelector('id=tm objectValue.0.url')[0].value === 'http://example.org/1.jpg');
    assert.ok(app2.getPropertiesBySelector('id=tm objectValue.1.text')[0].value === 'asdfg');
    assert.ok(app2.getPropertiesBySelector('id=tm objectValue.1.url')[0].value === 'http://example.org/333.jpg');

    // альтернативная форма передачи параметра в виде массива
    var app3 = new SwimmingTest({
        defaults: [
            {
                "id=tm objectValue.0.text": "5678",
                "id=tm objectValue.1.url": 'http://example.org/333.jpg',
                "type=question data1": 'value1'
            },
            {
                "id=tm objectValue": [
                    {
                        url: 'http://example.org/1.jpg',
                        text: 'qwerty'
                    },
                    {
                        url: 'http://example.org/2.jpg',
//                        text: 'asdfg'
                    }
                ],
                "type=question data2": 'value2',
            }
        ]
    });
    assert.ok(app3.getPropertiesBySelector('id=tm objectValue.0.text')[0].value === 'qwerty');
    assert.ok(app3.getPropertiesBySelector('id=tm objectValue.0.url')[0].value === 'http://example.org/1.jpg');
    assert.ok(app3.getPropertiesBySelector('id=tm objectValue.1.text') === null);
    assert.ok(app3.getPropertiesBySelector('id=tm objectValue.1.url')[0].value === 'http://example.org/2.jpg');
    assert.ok(app3.getPropertiesBySelector('type=question data2')[0].value === 'value2');
});

QUnit.test("MutApp test: multiapp", function( assert ) {
    var SwimmingTest = MutApp.extend({
        screenRoot: $('#id-swimming_test'),
        initialize: function(param) {
            var tm = this.addModel(new PersonalityModel({
                application: this
            }));
            this.addScreen(new StartScreen({
                model: tm,
                screenRoot: this.screenRoot
            }));
            this.addScreen(new QuestionScreen({
                model: tm,
                questionId: tm.attributes.quiz[0].id,
                screenRoot: this.screenRoot
            }));
            this.addScreen(new ResultScreen({
                model: tm,
                resultId: tm.attributes.results[0].id,
                screenRoot: this.screenRoot
            }));
        }
    });

    var app1 = new SwimmingTest({
    });

    var app2 = new SwimmingTest({
    });

    assert.ok(app1._screens.length === 3, 'Screens length 1');
    assert.ok(app1._models.length === 1, 'Models length 1');

    assert.ok(app2._screens.length === 3, 'Screens length 2');
    assert.ok(app2._models.length === 1, 'Models length 2');
});

QUnit.test("MutApp test: Sharing", function( assert ) {
    var SwimmingTest = MutApp.extend({
        screenRoot: $('#id-swimming_test'),
        initialize: function(param) {
            var tm = this.addModel(new TestModel({
                application: this
            }));
            this.addScreen(new StartScreen({
                model: tm,
                screenRoot: this.screenRoot
            }));
            this.addScreen(new QuestionScreen({
                model: tm,
                questionId: tm.attributes.quiz[0].id,
                screenRoot: this.screenRoot
            }));
            this.addScreen(new ResultScreen({
                model: tm,
                resultId: tm.attributes.results[0].id,
                screenRoot: this.screenRoot
            }));

            // способ указания этих атрибутов уникален для каждого проекта
            this.title = this.getPropertiesBySelector('id=startScr startHeaderText');
            this.description = this.getPropertiesBySelector('id=startScr startDescription');
        }
    });

    var app = new SwimmingTest({
    });

    assert.ok(!!app.title===true, 'title in app');
    assert.ok(!!app.description===true, 'description in app');
    assert.ok(!!app.shareDefaultImgUrl===true, 'defaultImgUrl in Sharer');
    assert.ok(app._shareEntities.length===0, 'entities in Sharer');
    assert.ok(!!app.share('fooId')===false, 'share() in Sharer');

    // не устанавливали setShareEntities, поэтому фб апи не должно инициализироваться
    assert.ok(window.FB === undefined, 'FB === undefined');
    assert.ok($('#facebook-jssdk').length === 0, 'facebook-jssdk dont exist');
});

QUnit.test("MutApp test: clarifyElement", function( assert ) {
    var e = $(
        '<div class="modal __active js-back_color js-back_img" data-app-property="type=result backgroundImg"><div class="modal_cnt info"><div class="info_title" data-app-property="id=tm results.<%=currentResultIndex%>.title"><b class="b_title"><%=title%></b></div><div class="info_tx" data-app-property="id=tm results.<%=currentResultIndex%>.description"><%=description%></div><div class="info_f"><div class="button __sec js-next js-restart js-test_btn">Пройти тест еще раз</div><!--<div class="button js-details">Подробности</div>--></div><div class="js-mutapp_share_fb fb_share" data-app-property="type=result fbSharePosition"></div><div class="foo_class"><div class="foo_2_class"><div class="info_tx">Useful element</div></div></div></div></div>'
    );

    var ce = MutApp.Util.clarifyElement(e, ['modal','modal_cnt','info_title','info_tx', 'b_title']);

    var expectedHtml = '<div class="modal __active js-back_color js-back_img" data-app-property="type=result backgroundImg"><div class="modal_cnt info"><div class="info_title" data-app-property="id=tm results.<%=currentResultIndex%>.title"><b class="b_title">&lt;%=title%&gt;</b></div><div class="info_tx" data-app-property="id=tm results.<%=currentResultIndex%>.description">&lt;%=description%&gt;</div><div class="foo_class"><div class="foo_2_class"><div class="info_tx">Useful element</div></div></div></div></div>';
    assert.ok($('<div></div>').append(ce).html()===expectedHtml, 'clarifyElement: ok');
});

QUnit.test("MutApp test: getUniqId", function( assert ) {
    var v1 = MutApp.Util.getUniqId(6, null);
    var v2 = MutApp.Util.getUniqId(6, null);
    assert.ok(v1.length === 6, 'getUniqId');
    assert.ok(v2.length === 6, 'getUniqId');
    assert.ok(v1 !== v2, 'getUniqId');

    var v1 = MutApp.Util.getUniqId(8, 'blch');
    var v2 = MutApp.Util.getUniqId(8, 'er3434g34g3');
    assert.ok(v1.length === 8, 'getUniqId');
    assert.ok(v2.length === 8, 'getUniqId');
    assert.ok(v1 !== v2, 'getUniqId');

    var v1 = MutApp.Util.getUniqId(undefined, '32§3414');
    var v2 = MutApp.Util.getUniqId(undefined, '33423t35t3');
    assert.ok(v1 !== v2, 'getUniqId');
    assert.ok(v1.length === v2.length, 'getUniqId');
});

QUnit.test("MutApp test: assignByPropertyString", function( assert ) {
    var o = {
        root: {
            arr: [
                {text:'1', key1: 'value1'},
                {text:'2'},
                {text:'3'}
            ]
        }
    };
    MutApp.Util.assignByPropertyString(o, 'foo.bar.value', 123);
    MutApp.Util.assignByPropertyString(o, 'root.arr.4.text', '4');

    assert.ok(o.foo.bar.value===123, 'assignByPropertyString');
    assert.ok(o.root.arr[4].text==='4', 'assignByPropertyString');

    // запись свойства верхнего уровня должна переопределять весь объект
    var newRoot = {
        arr: [
            {text: 'q'},
            {text: 'w'}
        ]
    };
    MutApp.Util.assignByPropertyString(o, 'root', newRoot);
    assert.ok(o.root.arr[0].text==='q', 'assignByPropertyString');
    assert.ok(o.root.arr[0].key1===undefined, 'assignByPropertyString');
    assert.ok(o.root.arr[1].text==='w', 'assignByPropertyString');
    assert.ok(o.root.arr[2]===undefined, 'assignByPropertyString');
    assert.ok(o.root.arr.length===2, 'assignByPropertyString');
});