/**
 * Created by alex on 10.08.17.
 */

QUnit.test("MutApp test: objects comparison", function( assert ) {
    var app = new PersonalityApp({
        defaults: null
    });
    app.start();
    assert.ok(app.compare(app), app._compareDetails.message);

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
