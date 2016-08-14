/**
 * Created by artyom.grishanov on 08.01.16.
 */

//var src = '/products/test/index.html';
//var appIframe = document.createElement('iframe');
//$(appIframe).css('visibility','hidden');
//appIframe.onload = function() {
//    Engine.startEngine(appIframe.contentWindow);
//    run();
//};
//appIframe.src = config.common.devPrototypesHostName+src;
//$('body').append(appIframe);
//
//
//function run() {
//    QUnit.test("Engine prototype test 1", function( assert ) {
//        var p = Engine.getAppProperty('quiz');
//        assert.ok(p.propertyString == 'quiz', 'Quiz property found');
//        var valueLength = p.propertyValue.length;
//
//        var pp = Engine.getPrototypesForAppProperty(p);
//        assert.ok(pp.length == 2, 'Two prototypes found');
//
//        Engine.addArrayElement(p, pp[0], 0);
//        var p1 = Engine.getAppProperty('quiz');
//        assert.ok(p1.propertyValue.length == valueLength+1, 'New value added to array');
//    });
//}

//QUnit.test("Editor test 1", function( assert ) {
//    var s = 'function start() {//<overrideapp>var o={"key1":"value1","key2":"value2","randomizeQuestions":false,"randomizeOptions":false,"slide":{"canAdd":true,"comment":"Добавить слайд","templateId":"id-slide_templ","parent":".js-questions_cnt"},"fontColor":"#00A651","fontFamily":"\"Times New Roman\", Times, serif","background":"url(https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/test1/i/Geography-1-landing.jpg)","d__quiz":"editable=true;length={apps.tests.maxquizcount}","quiz":[{"text":"Мадагаскар -- это где?","options":[{"text":"Страна на западе Африки","type":"text","id":"5ecb37bf1f07e04d0faa74baaba7d77c"},{"text":"Остров в Атлантическом океане","type":"text","id":"a82695b7f89fa36a95d0f5e4c901d79d"},{"text":"Остров на юге Африки","type":"text","points":1,"id":"f8e7481072288563238f52031f4121e6"}]},{"text":"Какая самая большая страна?","d__text":"editable=true;ui=TextInput;default={config.textForTest};maxlength=10","options":[{"text":"Гренландия","id":"2a01de5ba115776c1e8437dbc48a6327"},{"text":"Россия","points":1,"id":"c5553c55c24e65cf3bc302ef38082497"},{"text":"Австралия","id":"d22c2c8881b86e294fc1e6efe003e5b1"}]},{"text":"Какого моря не существует?","options":[{"text":"Черное море","id":"df36d2eadcdc6b60749114d623412fd7"},{"text":"Синее море","points":1,"d__points":"editable=true","id":"4a531da33b975923b8d27f839aa74220"},{"text":"Красное море","id":"18679358e2c9289ce3c2150f46e9890a"},{"text":"Желтое море","id":"a2775b02fefb44440cf9d22e3815b225"}]}],"results":[{"minPoints":0,"maxPoints":1,"title":"Новичок","descripttion":"Длинный текст типа неплохо для начала"},{"minPoints":2,"maxPoints":3,"title":"Средний","descripttion":"Длинный текст типа уже лучше, давай ещё"}]};for(var key in o)if(o.hasOwnProperty(key))app[key]=o[key];' +
//        '//</overrideapp>' +
//        'end of propertyString';
//    var res = deleteOverridedAppParams(s);
//    assert.ok(res == 'function start() {end of propertyString', 'Result propertyString='+res);
//});

config.congigurationSet.dev().offline();
config.common.editorUiEnable = false;

QUnit.test("Engine test 1", function( assert ) {



})