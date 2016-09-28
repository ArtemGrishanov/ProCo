/**
 * Created by artyom.grishanov on 16.06.16.
 *
 * На модальных окошках опробую новый шаблон наследования
 *
 * @param param.text
 */
var MessageModal = function(param) {
    param = param || {};
    param.name = 'messageModal';
    this.text = param.text;
    AbstractModal.call(this, param);
};
MessageModal.prototype = Object.create(AbstractModal.prototype);
MessageModal.prototype.constructor = MessageModal;
/**
 *
 */
MessageModal.prototype.render = function() {
    console.log('Message render');
    this.$ui.find('.js-text').html(this.text);
    this.$ui.find('.js-close').click((function() {
        Modal.hideMessage();
    }).bind(this));
}