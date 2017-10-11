/**
 * Created by alex on 10.08.17.
 */

QUnit.test("MutApp test: objects comparison", function( assert ) {
    var app = new PersonalityApp({
        defaults: null
    });
    app.start();
    assert.ok(app.compare(app), app.compareDetails.message);

    var app2 = new PersonalityApp({
        defaults: null
    });
    app2.start();

    var m1 = app.model.attributes.showLogoOnStartScreen;
    var m2 = app2.model.attributes.showLogoOnStartScreen;
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
    m3.addElementByPrototype('id=pm resultProto1'); // для сабпроперти тут будут уникалные идишки
    assert.ok(m3.compare(m4) === false);
    m4.addElementByPrototype('id=pm resultProto1'); // для сабпроперти тут будут уникалные идишки

    // dictionary идишки разные будут в m3 и m4, искусственно делаем одинаковыми
    m3._value[m4._orderedIds[0]] = m3._value[m3._orderedIds[0]];
    delete m3._value[m3._orderedIds[0]];
    m3._orderedIds[0] = m4._orderedIds[0];

    // искусственно пытаемся сделать два объекта одинаковыми чтобы показать что мы контролируем процесс
    m3.toArray()[0].id= m4.toArray()[0].id;
    m3.toArray()[0].title.id= m4.toArray()[0].title.id;
    m3.toArray()[0].title.propertyString= m4.toArray()[0].title.propertyString;
    m3.toArray()[0].title._propertyName= m4.toArray()[0].title._propertyName;
    m3.toArray()[0].description.id= m4.toArray()[0].description.id;
    m3.toArray()[0].description.propertyString= m4.toArray()[0].description.propertyString;
    m3.toArray()[0].description._propertyName= m4.toArray()[0].description._propertyName;
    m3.toArray()[0].backgroundImage.id= m4.toArray()[0].backgroundImage.id;
    m3.toArray()[0].backgroundImage.propertyString= m4.toArray()[0].backgroundImage.propertyString;
    m3.toArray()[0].backgroundImage._propertyName= m4.toArray()[0].backgroundImage._propertyName;
    m3.toArray()[0].backgroundColor.id= m4.toArray()[0].backgroundColor.id;
    m3.toArray()[0].backgroundColor.propertyString= m4.toArray()[0].backgroundColor.propertyString;
    m3.toArray()[0].backgroundColor._propertyName= m4.toArray()[0].backgroundColor._propertyName;
    assert.ok(m3.compare(m4), m3.compareDetails.message);

    // сравнение приложения
    assert.ok(app.compare(app));
    assert.ok(app2.compare(app) === false);
});
