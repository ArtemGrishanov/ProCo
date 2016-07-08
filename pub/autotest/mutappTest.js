/**
 * Created by artyom.grishanov on 07.07.16.
 */

QUnit.test("MutApp test1", function( assert ) {
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

    assert.ok(app.screens !== undefined, 'screens in app');
    assert.ok(app.models !== undefined, 'models in app');
    assert.ok(app.inited === true, 'app inited');
});

QUnit.test("MutApp test2", function( assert ) {
    var ScreenClass = MutApp.Screen.extend({

        viewInited: false,

        initialize: function() {
            this.viewInited = true;
        },

        render: function() {

        }
    });

    var s1 = new ScreenClass();

    assert.ok(s1 !== undefined);
    assert.ok(s1 instanceof ScreenClass === true);
    assert.ok(s1.viewInited === true, 'Instance attribute');

    assert.ok(s1.id !== undefined);
    assert.ok(s1.el !== undefined);
    assert.ok(s1.group !== undefined);
    assert.ok(s1.name !== undefined);
    assert.ok(s1.draggable !== undefined);
    assert.ok(s1.canAdd !== undefined);
    assert.ok(s1.canClone !== undefined);
    assert.ok(s1.canDelete !== undefined);
    assert.ok(s1.appPropertyString !== undefined);
    assert.ok(s1.doWhenInDOM !== undefined);

    assert.ok(typeof s1.render === 'function', 'Screen inherited from Backbone.view');
    assert.ok(typeof s1.initialize === 'function', 'Screen inherited from Backbone.view');
    assert.ok(typeof s1.setElement === 'function', 'Screen inherited from Backbone.view');
});

QUnit.test("MutApp test3", function( assert ) {

});

// ====================================
// ========= тесты приложения =========
// ====================================
QUnit.test("TestApp test1", function( assert ) {

});