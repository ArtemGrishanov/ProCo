/**
 * Created by artyom.grishanov on 05.10.17.
 */
QUnit.test("Autopreview qunit: 1", function( assert ) {
    var done = assert.async()

    var appInfo = [];
    var templateUrls = [
        '43d927ad-17a1-4d07-84c2-c273dff1a831/app/125ac199e0.txt', // trivia
        '43d927ad-17a1-4d07-84c2-c273dff1a831/app/57b23309cd.txt', // personality
        'cd811f5b-78b5-447c-955f-f08846862693/app/2bb7773ded.txt' // внутри параметр url невалидный, personality
    ];
    for (var k = 0; k < templateUrls.length; k++) {
        appInfo.push({
            templateUrl: templateUrls[k]
        });
    }
    var shareEntityTempl = $('#id-share_entity_templ').html();
    var appBlockTempl = $('#id-app_info').html();

    var openedTemplateCollection = new TemplateCollection({
        templateUrls: templateUrls
    });

    openedTemplateCollection.loadTemplatesInfo(function(template) {
        onTemplateLoaded(template);
    });

    function getAppInfo(key/* url || id */) {
        for (var k = 0; k < appInfo.length; k++) {
            if (appInfo[k].templateUrl === key || appInfo[k].id === key) {
                return appInfo[k];
            }
        }
        return null;
    }

    function onTemplateLoaded(template) {
        var ai = getAppInfo(template.url);
        if (ai) {
            ai.appName = template.appName;
            ai.serializedProperties = template.propertyValues;
            ai.id = template.id;
            ai.template = template;
            ai.containerId = ai.id;
            $('#id-app_containers').append('<div id="'+ai.containerId+'"></div>');

            editorLoader.load({
                containerId: ai.containerId,
                appName: ai.appName,
                onload: onAppLoad.bind(this),
            });
        }
        else {
            assert.ok(false, 'Can not find template with url \''+template.url+'\'. Maybe this is illegal param \'url\' inside file \''+template.id);
        }
    }

    function onAppLoad(data) {
        var ai = getAppInfo(data.containerId);
        editedApp = editorLoader.startApp({
            containerId: ai.containerId,
            mode: 'edit',
            defaults: ai.serializedProperties
        });

        assert.ok(editedApp);

        var $appBlock = $(appBlockTempl.replace('{{appId}}', 'Project: '+ai.template.url)
            .replace('{{preview_img}}', config.common.awsHostName+config.common.awsBucketName+'/'+ai.template.previewUrl)
        );
        $('#id-previews').append($appBlock);

        previewService.createInIframe({
            html: editedApp.getAutoPreviewHtml(),
            stylesToEmbed: [config.products.common.styles, config.products[ai.appName].stylesForEmbed],
            cssString: editedApp.getCssRulesString(),
            width: editedApp.width,
            height: editedApp.height,
            callback: function(canvas) {

                assert.ok(canvas)
                assert.ok(canvas.width === editedApp.width, 'canvas.width')
                assert.ok(canvas.height === editedApp.height, 'canvas.height')

                $appBlock.find('.js-autoimage').append(canvas);
                done();

            }
        });
    }

});