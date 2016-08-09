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