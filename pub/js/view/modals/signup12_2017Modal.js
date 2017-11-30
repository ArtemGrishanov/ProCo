/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var Signup12_2017Modal = function(param) {
    param = param || {};
    param.name = 'signup12_2017Modal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose')?!!param.canClose:true;
    AbstractModal.call(this, param);
};

Signup12_2017Modal.prototype = Object.create(AbstractModal.prototype);
Signup12_2017Modal.prototype.constructor = Signup12_2017Modal;

/**
 *
 */
Signup12_2017Modal.prototype.render = function() {
    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideSignup12_2017Modal();
        }).bind(this));
    }
    else {
        this.$ui.find('.js-close').hide();
    }
    this.$ui.find('.js-apply').click(this.onApplyClick);
};

/**
 * Клик по кнопке регистрации
 */
Signup12_2017Modal.prototype.onApplyClick = function() {
    Modal.showSignup();
    Modal.hideSignup12_2017Modal();
};