/**
 * Created by artyom.grishanov on 09.08.16.
 */

config.congigurationSet.dev();

var templateUrls = [];
for (var i = 0; i < config.storefront.templates.length; i++) {
    templateUrls.push(config.storefront.templates[i].url);
}

QUnit.test("Templates test 1", function( assert ) {
    if (templateUrls.length > 0) {
        var done = assert.async();

        var loadedCount = 0;

        var tc = new TemplateCollection({
            templateUrls: templateUrls
        });

        tc.loadTemplatesInfo(function(template) {
            // получена информация по одному шаблоны
            if (templateIsValid(assert, template) !== true) {
                assert.ok(false, 'Template is not valid');
            }

            loadedCount++;

            if (loadedCount === templateUrls.length) {
                assert.ok(true, 'All templates are loaded');
                done();
            }
        });
    }
    else {
        assert.ok(false,'No templates');
    }
});

QUnit.test("Templates test 2", function( assert ) {
    openTemplate(templateUrls[0], true, true);

    var done = assert.async();

    // waiting while iframe loaded
    setTimeout(function() {
        assert.ok(Engine.getAppProperties().length > 120, 'More then 120 appProperties for test');
        assert.ok(Engine.getAppProperties().length === Engine.getAppPropertiesObjectPathes().length, 'App Properties and object pathes');

        assert.ok(Engine.getAppScreenIds().length >= 9, 'There are some screens');
        done();
    }, 1600);
});


