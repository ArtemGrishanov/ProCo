/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var NotificationInMyProjects12_2017Modal = function(param) {
    param = param || {};
    param.name = 'notificationInMyProjects12_2017Modal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose')?!!param.canClose:true;
    AbstractModal.call(this, param);
};

NotificationInMyProjects12_2017Modal.prototype = Object.create(AbstractModal.prototype);
NotificationInMyProjects12_2017Modal.prototype.constructor = NotificationInMyProjects12_2017Modal;

/**
 *
 */
NotificationInMyProjects12_2017Modal.prototype.render = function() {
    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideHelpNotificationInMyProjects_12_2017Modal();
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
NotificationInMyProjects12_2017Modal.prototype.onApplyClick = function() {
    window.localStorage.setItem('notif_12_2017_status', 'applied');
    Modal.hideHelpNotificationInMyProjects_12_2017Modal();
};