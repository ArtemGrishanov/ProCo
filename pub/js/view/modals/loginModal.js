/**
 * Created by artyom.grishanov on 30.06.16.
 *
 * @param {string} param.text - пояснительный текст который показывается над кнопкой логина
 * @param {boolean} param.canClose - можно ли закрыть
 */
var LoginModal = function(param) {
    param = param || {};
    param.name = 'loginModal';
    this.text = param.text;
    // по умолчанию заркыть окно можно
    this.canClose = param.hasOwnProperty('canClose') ? !!param.canClose : true;
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
        App.requestLogin(true);
    });
    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideLogin();
        }).bind(this));
    }
    else {
        this.$ui.find('.js-close').hide();
    }
}