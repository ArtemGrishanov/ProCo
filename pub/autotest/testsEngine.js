/**
 * Created by artyom.grishanov on 08.01.16.
 */

var src = '/products/test/index.html';
var appIframe = document.createElement('iframe');
$(appIframe).css('visibility','hidden');
appIframe.onload = function() {
    Engine.startEngine(appIframe.contentWindow);
    run();
};
appIframe.src = config.common.devPrototypesHostName+src;
$('body').append(appIframe);


function run() {
    QUnit.test("Engine prototype test 1", function( assert ) {
        var p = Engine.getAppProperty('quiz');
        assert.ok(p.propertyString == 'quiz', 'Quiz property found');
        var valueLength = p.propertyValue.length;

        var pp = Engine.getPrototypesForAppProperty(p);
        assert.ok(pp.length == 2, 'Two prototypes found');

        Engine.addArrayElement(p, pp[0], 0);
        var p1 = Engine.getAppProperty('quiz');
        assert.ok(p1.propertyValue.length == valueLength+1, 'New value added to array');
    });
}