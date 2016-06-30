/**
 * Created by artyom.grishanov on 30.06.16.
 *
 * @param {string} param.text - пояснительный текст который показывается над кнопкой логина
 */
var LoginModal = function(param) {
    param = param || {};
    param.name = 'loginModal';
    this.text = param.text;
    AbstractModal.call(this, param);
};
LoginModal.prototype = Object.create(AbstractModal.prototype);
LoginModal.prototype.constructor = LoginModal;
/**
 *
 */
LoginModal.prototype.render = function() {
    console.log('Message render');
    this.$ui.find('.js-expl_text').html(this.text);
    this.$ui.find('.js-login').click(function() {
        App.requestLogin();
    });
    this.$ui.find('.js-close').click((function() {
        Modal.hideLogin();
    }).bind(this));
}