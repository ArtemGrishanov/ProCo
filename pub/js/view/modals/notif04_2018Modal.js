/**
 * Created by artyom.grishanov on 17.04.18.
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var Notif04_2018Modal = function(param) {
    param = param || {};
    param.name = 'notif04_2018Modal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose')?!!param.canClose:true;
    AbstractModal.call(this, param);
};

Notif04_2018Modal.prototype = Object.create(AbstractModal.prototype);
Notif04_2018Modal.prototype.constructor = Notif04_2018Modal;

/**
 *
 */
Notif04_2018Modal.prototype.render = function() {
    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideNotif04_2018Modal();
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
Notif04_2018Modal.prototype.onApplyClick = function() {
    Modal.showSignup({
        canClose: this.canClose
    });
    Modal.hideNotif04_2018Modal();
};