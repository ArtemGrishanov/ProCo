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

        screenRoot: $('#id-swimming_test'),

        initialize: function(param) {
            // связь модели с приложением swimming test
            var tm = this.addModel(new TestModel({
                application: this
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
            "id=tm data1": "12345",
            "id=tm  data2": "5678",
            "id=welcomeCustomId data1": "welcomeCustomId",
            "id=welcomeCustomId data2": false,
            "type=question typeData": 23
        }
    });

    assert.ok(app === app._models[0].application, 'application in model');
    assert.ok(app._parsedDefaults.length === 5, 'parsed values');
    assert.ok(app._models[0].attributes.data1 === '12345', 'default value has set');
    assert.ok(app._models[0].attributes.data2 === '5678', 'default value has set');

    assert.ok(app._screens[0].data1 === 'welcomeCustomId', 'default value has set');
    assert.ok(app._screens[0].data2 === false, 'default value has set');

    assert.ok(app._screens[1].typeData === 23, 'default value has set');
    assert.ok(app._screens[2].typeData === 23, 'default value has set');
});