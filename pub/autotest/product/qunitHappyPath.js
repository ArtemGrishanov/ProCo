/**
 * Created by artyom.grishanov on 14.08.16.
 */

config.congigurationSet.dev().online();
config.common.editorUiEnable = true;

QUnit.test("Happy path app", function( assert ) {
//    TScenarios.happyTest(assert, 'test');

    TScenarios.happyPathApp(assert, 'test');

    //TScenarios.happyPathApp(assert, 'timeline');

    //TScenarios.happyPathApp(assert, 'memoriz');
});

//QUnit.test("Happy path templates", function( assert ) {
//    TScenarios.happyPathTemplate(assert, config.storefront.templates[0].url);
//});
