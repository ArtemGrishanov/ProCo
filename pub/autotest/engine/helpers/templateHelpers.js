function templateIsValid(assert, template) {
    var cssValuesExist = false;
    if (template.propertyValues.css) {
        // здесь по простому: есть хотя бы одно свойство
        for (var key in template.propertyValues.css) {
            if (template.propertyValues.css.hasOwnProperty(key)) {
                cssValuesExist = true;
                break;
            }
        }
    }
    var appValuesExist = false;
    if (template.propertyValues.app) {
        // здесь по простому: есть хотя бы одно свойство
        for (var key in template.propertyValues.app) {
            if (template.propertyValues.app.hasOwnProperty(key)) {
                appValuesExist = true;
                break;
            }
        }
    }

    assert.ok(!!template.isValid(), 'Template.isValid()');
    assert.ok(!!template.appName, 'Template.appName');
    assert.ok(!!template.id, 'Template.id');
    assert.ok(!!template.previewUrl, 'Template.previewUrl');
    assert.ok(!!template.propertyValues, 'Template.propertyValues');
    assert.ok(!!template.propertyValues.app, 'Template.propertyValues.app');
    assert.ok(!!template.propertyValues.css, 'Template.propertyValues.css');
//    title может быть пустым
//    assert.ok(!!template.title, 'Template.title');
    assert.ok(!!template.url, 'Template.url');
    assert.ok(!!cssValuesExist, 'Template cssValuesExist');
    assert.ok(!!appValuesExist, 'Template appValuesExist');

    var ok = !!template.isValid() && !!template.appName && !!template.id &&
        !!template.previewUrl && !!template.propertyValues &&
        !!template.propertyValues.app && !!template.propertyValues.css &&
        !!template.url &&
        !!cssValuesExist && !!appValuesExist;
    return ok;
}