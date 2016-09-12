/**
 * Created by artyom.grishanov on 11.09.16.
 */
function checkModel(assert, model) {
    assert.ok(model.get('cards').length > 4, 'checkModel: minimal length');
    assert.ok(model.get('cards').length % 2 == 0, 'checkModel: %2==0');
}
