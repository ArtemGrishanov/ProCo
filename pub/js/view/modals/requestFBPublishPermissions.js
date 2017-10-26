/**
 * Created by artyom.grishanov on 08.02.17.
 *
 * @param param.text
 */
var RequestFBPublishPermissionsModal = function(param) {
    param = param || {};
    param.name = 'requestFBPublishPermissionsModal';
    AbstractModal.call(this, param);
    this.callback = param.callback;
};

RequestFBPublishPermissionsModal.prototype = Object.create(AbstractModal.prototype);
RequestFBPublishPermissionsModal.prototype.constructor = RequestFBPublishPermissionsModal;

/**
 *
 */
RequestFBPublishPermissionsModal.prototype.render = function() {
    this.$ui.find('.js-close').click((function() {
        if (this.callback) {
            this.callback('cancel');
        }
        Modal.hideRequestPublishFBPermissions();
    }).bind(this));
    this.$ui.find('.js-ok').click((function() {
        if (this.callback) {
            this.callback('ok');
        }
        Modal.hideRequestPublishFBPermissions();
    }).bind(this));
}