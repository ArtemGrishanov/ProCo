/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var EmailSentModal = function(param) {
    param = param || {};
    param.name = 'emailSentModal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose') ? !!param.canClose : true;
    AbstractModal.call(this, param);
};

EmailSentModal.prototype = Object.create(AbstractModal.prototype);
EmailSentModal.prototype.constructor = EmailSentModal;

/**
 *
 */
EmailSentModal.prototype.render = function() {
    this.$ui.find('.js-to_signin').click(this.onToSigninClick.bind(this));

    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideSignup();
        }).bind(this));
    }
    else {
        this.$ui.find('.js-close').hide();
    }
};

/**
 * Перейти в окно логина
 */
EmailSentModal.prototype.onToSigninClick = function() {
    Modal.showSignin();
    Modal.hideEmailSent();
}