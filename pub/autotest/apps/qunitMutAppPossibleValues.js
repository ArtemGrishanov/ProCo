/**
 * Created by artyom.grishanov on 25.12.17.
 */
QUnit.test("MutApp: possible values (alternatives) in PersonalityApp", function( assert ) {
    var app = new PersonalityApp({
        autotesting: true,
        mode: 'edit'
    });
    app.start();

    // копия того что есть в mutappSchema
    var possibleValues = ['Arial', 'Times New Roman', undefined];
    var p = app.getProperty('.js-start_header font-family');
    isValidValue(assert, p, possibleValues);
    p.setValue('bla-bla-font');
    isValidValue(assert, p, possibleValues);
    p.setValue('Times New Roman');
    isValidValue(assert, p, possibleValues);

    // копия того что есть в mutappSchema
    var possibleValues = [
        {value:"left",icon:{
            normal:"i/altern/align-left.png", selected:"i/altern/align-left-selected.png"
        }},
        {value:"center",icon:{
            normal:"i/altern/align-center.png", selected:"i/altern/align-center-selected.png"
        }},
        {value:"right",icon:{
            normal:"i/altern/align-right.png", selected:"i/altern/align-right-selected.png"
        }}
    ];
    var p = app.getProperty('.js-start_header text-align');
    isValidValue(assert, p, possibleValues);
    p.setValue('bla-bla-align');
    isValidValue(assert, p, possibleValues);
    p.setValue('right');
    isValidValue(assert, p, possibleValues);
});


QUnit.test("MutApp: normalizeValue", function(assert) {
    var AppClass = MutApp.extend({
        id: 'TestApp',
        mutAppSchema: new MutAppSchema({
            "id=TestApp property1": {
                label: {RU:'',EN:''},
                controls: {
                    name:"Alternative",
                    view: 'altbuttons',
                    param: {
                        possibleValues: [
                            {value:"left",icon:{
                                normal:"i/altern/align-left.png", selected:"i/altern/align-left-selected.png"
                            }},
                            {value:"center",icon:{
                                normal:"i/altern/align-center.png", selected:"i/altern/align-center-selected.png"
                            }},
                            {value:"right",icon:{
                                normal:"i/altern/align-right.png", selected:"i/altern/align-right-selected.png"
                            }}
                        ],
                    }
                }
            },
            "id=TestApp property2": {
                label: {RU:'',EN:''},
                controls: {
                    name:"Alternative",
                    view: 'dropdown',
                    param: {
                        possibleValues: ["Arial","Times New Roman"]
                    }
                }
            },
            "id=TestApp property3": {
                label: {RU:'',EN:''},
                controls: {
                    name:"Alternative",
                    view: 'dropdown',
                    param: {
                        possibleValues: ["Arial","Times New Roman"]
                    }
                }
            },
            "id=TestApp property4": {
                label: {RU:'',EN:''},
                controls: {
                    name:"Alternative",
                    view: 'dropdown',
                    param: {
                        possibleValues: [1,2,3]
                    }
                }
            },
            "id=TestApp property5": {
                label: {RU:'',EN:''},
                controls: {
                    name:"Alternative",
                    view: 'dropdown'
                },
                minValue: 0,
                maxValue: 10
            },
            "id=TestApp property6": {
                label: {RU:'',EN:''},
                controls: {
                    name:"Alternative",
                    view: 'dropdown'
                },
                valuePattern: '{{number}}px',
                minValue: 0,
                maxValue: 10
            }
        }),

        initialize: function() {
            this.property1 = new MutAppProperty({
                application: this,
                propertyString: 'id=TestApp property1',
                value: 'left'
            });
            this.property2 = new MutAppProperty({
                application: this,
                propertyString: 'id=TestApp property2',
                value: 'Arial'
            });
            this.property3 = new MutAppProperty({
                application: this,
                propertyString: 'id=TestApp property3',
                value: 'blah-blah-Arial'
            });
            this.property4 = new MutAppProperty({
                application: this,
                propertyString: 'id=TestApp property4',
                value: 6
            });
            this.property5 = new MutAppProperty({
                application: this,
                propertyString: 'id=TestApp property5',
                value: -1
            });
            this.property6 = new MutAppProperty({
                application: this,
                propertyString: 'id=TestApp property6',
                value: -4
            });
        }
    });

    var app = new AppClass();

    var p1 = app.getProperty('id=TestApp property1');
    var p2 = app.getProperty('id=TestApp property2');
    var p3 = app.getProperty('id=TestApp property3');
    var p4 = app.getProperty('id=TestApp property4');
    var p5 = app.getProperty('id=TestApp property5');
    var p6 = app.getProperty('id=TestApp property6');

    assert.ok(p1.getValue() === 'left');
    assert.ok(p2.getValue() === 'Arial');
    assert.ok(p3.getValue() === 'Arial'); // normalized to first alternative value
    assert.ok(p4.getValue() === 1); // normalized to first alternative value
    assert.ok(p5.getValue() === 0);
    assert.ok(p6.getValue() === '0px');

    p1.setValue('right');
    p2.setValue('foo');
    p3.setValue('Times New Roman');
    p4.setValue(3);
    p5.setValue(99);
    p6.setValue(99);

    assert.ok(p1.getValue() === 'right');
    assert.ok(p2.getValue() === 'Arial'); // normalized to first alternative value
    assert.ok(p3.getValue() === 'Times New Roman');
    assert.ok(p4.getValue() === 3);
    assert.ok(p5.getValue() === 10);
    assert.ok(p6.getValue() === '10px');

    p6.setValue('-');
    assert.ok(p6.getValue() === '0px');
});

function isValidValue(assert, property, possibleValues) {
    var msg = 'Value=\''+property.getValue()+'\' is valid for '+
        (MutApp.Util.isCssMutAppProperty(property)===true ? 'CssMutAppProperty \''+property.propertyString+'\' cssSelector=\''+property.cssSelector+'\'':
            'MutAppProperty \''+property.propertyString+'\'');
    var result = false;
    for (var i = 0; i < possibleValues.length; i++) {
        var pv = possibleValues[i];
        if (pv === property.getValue() || (pv && pv.hasOwnProperty('value') === true && pv.value === property.getValue())) {
            result = true;
            break;
        }
    }
    assert.ok(result, msg);
}