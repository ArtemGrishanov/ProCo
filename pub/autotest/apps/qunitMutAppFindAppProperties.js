/**
 * Created by alex on 11.08.17.
 */
QUnit.test("MutApp test: findMutAppPropertiesInObject", function( assert ) {
    var app = new PersonalityApp({
        defaults: null
    });
    app.start();
    var m1 = new MutAppProperty({
        application: app,
        model: app.model,
        propertyString: 'id=pm test1',
        value: 'test value'
    });
    var m2 = new MutAppProperty({
        application: app,
        model: app.model,
        propertyString: 'id=pm test2',
        value: null
    });
    var m3 = new MutAppPropertyArray({
        application: app,
        model: app.model,
        propertyString: 'id=pm test3',
        value: [{k1:'1243'},{k3:m2}]
    });

    var o1 = m1;
    var o2 = [0,1,m1,2];
    var o3 = {k1:'123',k2:m1,k3:{k4:{k5:m2}}};
    var o4 = {k1:'123',k2:{k3:false,k4:m1},k5:[7,m2,4]};
    var o5 = {};
    var o6 = m3;
    var o7 = {k7:23,k8:m3,k9:m1};
    var o8 = [0,m1,m1,2];

    var r1 = MutApp.Util.findMutAppPropertiesInObject(o1);
    assert.ok(r1.length === 1 && r1[0] === m1);

    var r2 = MutApp.Util.findMutAppPropertiesInObject(o2);
    assert.ok(r2.length === 1 && r2[0] === m1);

    var r3 = MutApp.Util.findMutAppPropertiesInObject(o3);
    assert.ok(r3.length === 2 && r3[0] === m1 && r3[1] == m2);

    var r4 = MutApp.Util.findMutAppPropertiesInObject(o4);
    assert.ok(r4.length === 2 && r4[0] === m1 && r4[1] == m2);

    var r5 = MutApp.Util.findMutAppPropertiesInObject(o5);
    assert.ok(r5.length === 0);

    var r6 = MutApp.Util.findMutAppPropertiesInObject(o6);
    assert.ok(r6.length === 2 && r6[0] === m3 && r6[1] === m2);

    var r7 = MutApp.Util.findMutAppPropertiesInObject(o7);
    assert.ok(r7.length === 3 && r7[0] === m3 && r7[1] === m2 && r7[2] === m1);

    // исключение дубликатов при выборке
    var r8 = MutApp.Util.findMutAppPropertiesInObject(o8);
    assert.ok(r8.length === 1 && r8[0] === m1);

    try {
        MutApp.Util.findMutAppPropertiesInObject(app);
    }
    catch(e) {
        assert.ok(true, 'not supported search in MutApp');
    }

    try {
        MutApp.Util.findMutAppPropertiesInObject(app.model);
    }
    catch(e) {
        assert.ok(true, 'not supported search in MutApp');
    }

    var r9 = MutApp.Util.findMutAppPropertiesInObject(app.model.attributes);
    assert.ok(r9.length > 1);

    var r10 = MutApp.Util.findMutAppPropertiesInObject(app._screens);
    assert.ok(r10.length > 1);

});