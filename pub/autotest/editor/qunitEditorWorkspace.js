/**
 * Created by artyom.grishanov on 07.09.17.
 */
QUnit.test("Editor.Workspace: filtering", function( assert ) {

    assert.ok(workspace, 'workspace exist');

    workspace.init({
        onSelectElementCallback: onSelectElementCallback
    });
    // имитируем показ первого экрана
    workspace.showScreen({
        screen: app1.getScreenById('startScr')
    });
    function onSelectElementCallback(dataAppPropertyString) {
        console.log('onSelectElementCallback: ' + dataAppPropertyString);
        ControlManager.filter({
            propertyStrings: dataAppPropertyString.split(',')
        });
    }

});