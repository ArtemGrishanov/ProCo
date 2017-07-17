/**
 * Created by artyom.grishanov on 07.07.16.
 */

QUnit.test("MutApp test: basics", function( assert ) {
    assert.ok(MutApp !== undefined);
    assert.ok(typeof MutApp.extend === 'function', 'extend in MutApp');
    assert.ok(typeof MutApp.Screen === 'function', ' Screen in MutApp');

    var AppClass = MutApp.extend({
        inited: false,
        mutAppSchema: new MutAppSchema(),
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

QUnit.test("MutApp test: getPropertiesBySelector", function( assert ) {
    var app = new PersonalityApp({
        defaults: null
    });
    app.start();
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');

    var quizProperty = app.getPropertiesBySelector('id=pm quiz')[0].value;
    assert.ok(quizProperty instanceof MutAppPropertyArray === true);
    assert.ok(quizProperty.getValue().length === 0);

    var resultsProperty = app.getPropertiesBySelector('id=pm results')[0].value;
    assert.ok(resultsProperty instanceof MutAppPropertyArray === true);
    assert.ok(resultsProperty.getValue().length === 2); // two prototypes was added before

    assert.ok(app.getPropertiesBySelector('id=pm results.{{number}}.title').length === 2);

    var title0Property = app.getPropertiesBySelector('id=pm results.0.title')[0].value;
    assert.ok(title0Property instanceof MutAppProperty === true);
    assert.ok(typeof title0Property.getValue() === 'string');

});

QUnit.test("MutApp test: objects comparison", function( assert ) {
    var app = new PersonalityApp({
        defaults: null
    });
    app.start();
    assert.ok(app.compare(app));

    var app2 = new PersonalityApp({
        defaults: null
    });
    app2.start();

    var m1 = app.model.attributes.showBackgroundImage;
    var m2 = app2.model.attributes.showBackgroundImage;
    var m3 = app.model.attributes.results;
    var m4 = app2.model.attributes.results;

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

    // сравнение приложения
    assert.ok(app.compare(app));
    assert.ok(app2.compare(app) === false);
});

/**
 * Тест сериализации
 */
QUnit.test("MutApp test: MutAppProperties serialization operations. PersonalityTest was taken for test.", function( assert ) {
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
        mutAppSchema: new MutAppSchema(),
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
    var app = new PersonalityApp({
        defaults: {
            "type=personality appAttr1": 'appData1',
            "type=personality appAttr2": true,

            "invalid": 'value',

            "id=pm data1": "12345",
            "id=pm  data2": "5678",
            "id=startScr data1": "welcomeCustomId",
            "id=startScr data2": false,
            "type=questions typeData": 23
        }
    });
    app.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');
    app.model.attributes.quiz.addElementByPrototype('id=pm quizProto1');

    assert.ok(app === app._models[0].application, 'application in model');
    assert.ok(app._parsedDefaults.length === 7, 'parsed values');

    assert.ok(app.appAttr1 === 'appData1', 'app selector');
    assert.ok(app.appAttr2 === true, 'app selector');

    assert.ok(app._models[0].attributes.data1 === '12345', 'default value has set');
    assert.ok(app._models[0].attributes.data2 === '5678', 'default value has set');

    assert.ok(app._screens[0].data1 === 'welcomeCustomId', 'default value has set');
    assert.ok(app._screens[0].data2 === false, 'default value has set');

    assert.ok(app._screens[2].typeData === 23, 'default value has set');

    var ent1 = app.getEntities('type', 'questions');
    assert.ok(ent1 && ent1.length === 2, 'getAllEntities');

    var ent2 = app.getEntities('id', 'pm');
    assert.ok(ent2 && ent2.length === 1, 'getAllEntities');

    var ent3 = app.getEntities('type', 'personality');
    assert.ok(ent3[0] === app && ent3.length === 1, 'getAllEntities');

    var p1 = app.getPropertiesBySelector('id=pm data1');
    assert.ok(p1 !== null, 'getPropertiesBySelector');
    assert.ok(p1.length === 1, 'getPropertiesBySelector');

    var p2 = app.getPropertiesBySelector('id=pm quiz.{{number}}.question.text');
    assert.ok(p2 !== null, 'getPropertiesBySelector');
    assert.ok(p2.length === 2, 'getPropertiesBySelector');
    assert.ok(p2[0].path === 'quiz.0.question.text', 'getPropertiesBySelector path');
    assert.ok(MutApp.Util.isMutAppProperty(p2[0].value) === true, 'getPropertiesBySelector value');
    assert.ok(p2[1].path === 'quiz.1.question.text', 'getPropertiesBySelector path');
    assert.ok(MutApp.Util.isMutAppProperty(p2[1].value) === true, 'getPropertiesBySelector value');

    var p3 = app.getPropertiesBySelector('type=questions showLogo');
    assert.ok(p3 !== null, 'getPropertiesBySelector');
    assert.ok(p3.length === 1, 'getPropertiesBySelector');
    assert.ok(p3[0].path === 'showLogo', 'getPropertiesBySelector');
    assert.ok(p3[0].value.getValue() === true, 'getPropertiesBySelector');

    // поиск по атрибутам модели
    var p4 = app.getPropertiesBySelector('id=pm state');
    assert.ok(p4 !== null, 'getPropertiesBySelector');
    assert.ok(p4.length === 1, 'getPropertiesBySelector');
    assert.ok(p4[0].value === 'welcome', 'getPropertiesBySelector');

    // undefined значения также должны выбираться
    var p5 = app.getPropertiesBySelector('id=pm currentQuestionIndex');
    assert.ok(p5 !== null, 'getPropertiesBySelector');
    assert.ok(p5.length === 1, 'getPropertiesBySelector');
    assert.ok(p5[0].path === 'currentQuestionIndex', 'getPropertiesBySelector');
    assert.ok(p5[0].value === undefined, 'getPropertiesBySelector');

    // проверка установки сложных свойств, которые конфликтуют друг с другом
    var app2 = new PersonalityApp({
        defaults: {
            "id=pm objectValue": [
                {
                    url: 'http://example.org/1.jpg',
                    text: 'qwerty'
                },
                {
                    url: 'http://example.org/2.jpg',
                    text: 'asdfg'
                }
            ],
            "id=pm objectValue.0.text": "5678",
            "id=pm objectValue.1.url": 'http://example.org/333.jpg'
        }
    });
    assert.ok(app2.getPropertiesBySelector('id=pm objectValue.0.text')[0].value === '5678');
    assert.ok(app2.getPropertiesBySelector('id=pm objectValue.0.url')[0].value === 'http://example.org/1.jpg');
    assert.ok(app2.getPropertiesBySelector('id=pm objectValue.1.text')[0].value === 'asdfg');
    assert.ok(app2.getPropertiesBySelector('id=pm objectValue.1.url')[0].value === 'http://example.org/333.jpg');

    // альтернативная форма передачи параметра в виде массива
    var app3 = new PersonalityApp({
        defaults: [
            {
                "id=pm objectValue.0.text": "5678",
                "id=pm objectValue.1.url": 'http://example.org/333.jpg',
                "type=question data1": 'value1'
            },
            {
                "id=pm objectValue": [
                    {
                        url: 'http://example.org/1.jpg',
                        text: 'qwerty'
                    },
                    {
                        url: 'http://example.org/2.jpg'
                    }
                ]
            }
        ]
    });
    assert.ok(app3.getPropertiesBySelector('id=pm objectValue.0.text')[0].value === 'qwerty');
    assert.ok(app3.getPropertiesBySelector('id=pm objectValue.0.url')[0].value === 'http://example.org/1.jpg');
    assert.ok(app3.getPropertiesBySelector('id=pm objectValue.1.text') === null);
    assert.ok(app3.getPropertiesBySelector('id=pm objectValue.1.url')[0].value === 'http://example.org/2.jpg');
});

QUnit.test("MutApp test: multiapp", function( assert ) {
    var app1 = new PersonalityApp({
    });
    app1.model.attributes.results.addElementByPrototype('id=pm resultProto1');

    var app2 = new PersonalityApp({
    });
    app2.model.attributes.results.addElementByPrototype('id=pm resultProto1');
    app2.model.attributes.results.addElementByPrototype('id=pm resultProto1');

    assert.ok(app1._screens.length === 2, 'Screens length 1');
    assert.ok(app1._models.length === 1, 'Models length 1');

    assert.ok(app2._screens.length === 3, 'Screens length 2');
    assert.ok(app2._models.length === 1, 'Models length 2');
});

QUnit.test("MutApp test: Sharing", function( assert ) {
    var app = new PersonalityApp({
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
        '<div class="modal __active js-back_color js-back_img" data-app-property="type=result backgroundImg"><div class="modal_cnt info"><div class="info_title" data-app-property="id=pm results.<%=currentResultIndex%>.title"><b class="b_title"><%=title%></b></div><div class="info_tx" data-app-property="id=pm results.<%=currentResultIndex%>.description"><%=description%></div><div class="info_f"><div class="button __sec js-next js-restart js-test_btn">Пройти тест еще раз</div><!--<div class="button js-details">Подробности</div>--></div><div class="js-mutapp_share_fb fb_share" data-app-property="type=result fbSharePosition"></div><div class="foo_class"><div class="foo_2_class"><div class="info_tx">Useful element</div></div></div></div></div>'
    );

    var ce = MutApp.Util.clarifyElement(e, ['modal','modal_cnt','info_title','info_tx', 'b_title']);

    var expectedHtml = '<div class="modal __active js-back_color js-back_img" data-app-property="type=result backgroundImg"><div class="modal_cnt info"><div class="info_title" data-app-property="id=pm results.<%=currentResultIndex%>.title"><b class="b_title">&lt;%=title%&gt;</b></div><div class="info_tx" data-app-property="id=pm results.<%=currentResultIndex%>.description">&lt;%=description%&gt;</div><div class="foo_class"><div class="foo_2_class"><div class="info_tx">Useful element</div></div></div></div></div>';
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