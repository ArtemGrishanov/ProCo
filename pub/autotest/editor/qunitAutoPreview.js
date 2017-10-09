/**
 * Created by artyom.grishanov on 05.10.17.
 */
QUnit.test("Autopreview qunit: 1", function( assert ) {
    var done = assert.async()

    var appName = null;
    var serializedProperties = null;
    var templateUrl = 'facebook-121947341568004/app/57b23309cd.txt';
    // todo many templates

    Editor.openTemplate({
        templateUrl: templateUrl,
        clone: false,
        callback: onTemplateLoaded
    });

    function onTemplateLoaded(template) {
        appName = template.appName;
        serializedProperties = template.propertyValues;
        editorLoader.load({
            containerId: 'id-product_iframe_cnt',
            appName: appName,
            onload: onAppLoad.bind(this),
        });
    }

    function onAppLoad() {
        editedApp = editorLoader.startApp({
            containerId: 'id-product_iframe_cnt',
            mode: 'edit',
            defaults: serializedProperties
        });

        assert.ok(editedApp);

        previewService.createInIframe({
            html: editedApp.getAutoPreviewHtml(),
            stylesToEmbed: [config.products.common.styles, config.products[appName].stylesForEmbed],
            cssString: editedApp.getCssRulesString(),
            width: editedApp.width,
            height: editedApp.height,
            callback: function(canvas) {

                assert.ok(canvas)
                assert.ok(canvas.width === editedApp.width, 'canvas.width')
                assert.ok(canvas.height === editedApp.height, 'canvas.height')

                $('#id-previews').append(canvas);
                done();

            }
        });

    }

});