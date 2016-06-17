/**
 * Created by artyom.grishanov on 16.06.16.
 *
 * На модальных окошках опробую новый шаблон наследования
 */
var MessageModal = function(param) {
    param = param || {};
    param.name = 'messageModal';
    AbstractModal.call(this, param);
};
MessageModal.prototype = Object.create(AbstractModal.prototype);
MessageModal.prototype.constructor = LoadingModal;
/**
 *
 */
MessageModal.prototype.render = function() {
    console.log('Message render');
}