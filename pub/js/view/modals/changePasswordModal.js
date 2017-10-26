/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * Модалка для логина.
 * Пользовать вводит логин/пароль для входа
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var ChangePasswordModal = function(param) {
    param = param || {};
    param.name = 'changePasswordModal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose')?!!param.canClose:true;
    AbstractModal.call(this, param);
    Auth.addEventCallback(this.onAuthEvent.bind(this));
    this.requestPerforming = false;
};

ChangePasswordModal.prototype = Object.create(AbstractModal.prototype);
ChangePasswordModal.prototype.constructor = ChangePasswordModal;

/**
 * Обработка событий от модуля Auth
 *
 * @param {string} event
 * @param {object} data
 */
ChangePasswordModal.prototype.onAuthEvent = function(event, data) {
    var errorMessage = '';
    var successMessage = '';
    switch(event) {
        case Auth.EVENT_CHANGEPASS_ERROR: {
            errorMessage = App.getText('error_change_pass');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_NO_ACTUAL_PASSWORD: {
            errorMessage = App.getText('error_change_pass_no_actualpass');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_NO_PASSWORD: {
            errorMessage = App.getText('error_change_pass_no_password');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_NO_PASSWORD_CONFIRM: {
            errorMessage = App.getText('error_change_pass_no_password_confirm');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_DIFF_PASSWORDS: {
            errorMessage = App.getText('event_change_pass_diff_pass');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_INVALID_PASSWORD: {
            errorMessage = App.getText('error_invalid_password');
            break;
        }
        case Auth.EVENT_CHANGEPASS_WRONG_PASSWORD: {
            errorMessage = App.getText('error_wrong_password');
            break;
        }
        case Auth.EVENT_CHANGEPASS_INVALID_NEW_PASSWORD: {
            errorMessage = App.getText('error_invalid_password');
            break;
        }
        case Auth.EVENT_CHANGEPASS_SUCCESS: {
            successMessage = App.getText('password_changed');
            setTimeout(function() {
                // автозакрытие через секунду после успешного входа
                Modal.hideChangePassword();
            }, 1999);
            break;
        }
    }
    if (successMessage) {
        this.$ui.find('.js-message').text(successMessage);
        this.$ui.find('.js-message').removeClass('__error');
    }
    else {
        if (errorMessage) {
            this.$ui.find('.js-message').text(errorMessage);
            this.$ui.find('.js-message').addClass('__error');
        }
        else {
            this.$ui.find('.js-message').text('_');
            this.$ui.find('.js-message').removeClass('__error');
        }
    }
    this.$ui.find('.js-change').removeClass('__disabled');
    this.requestPerforming = false;
};

/**
 *
 */
ChangePasswordModal.prototype.render = function() {
    this.$ui.find('.js-change').click(this.onChangeClick.bind(this));

    this.$ui.find('.js-actual_password').keydown(this.onInputKeydown.bind(this));
    this.$ui.find('.js-password').keydown(this.onInputKeydown.bind(this));
    this.$ui.find('.js-password_confirm').keydown(this.onInputKeydown.bind(this));

    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideChangePassword();
        }).bind(this));
    }
    else {
        this.$ui.find('.js-close').hide();
    }
};

/**
 * Клик по кнопке регистрации
 */
ChangePasswordModal.prototype.onChangeClick = function() {
    if (this.requestPerforming === false) {
        this.requestPerforming = true;
        this.$ui.find('.js-message').text(App.getText('please_wait'));
        this.$ui.find('.js-message').removeClass('__error');
        this.$ui.find('.js-change').addClass('__disabled');
        var actualPassword = this.$ui.find('.js-actual_password').val().trim();
        var password = this.$ui.find('.js-password').val().trim();
        var passwordConfirm = this.$ui.find('.js-password_confirm').val().trim();
        Auth.changePassword({
            actualPassword: actualPassword,
            password: password,
            passwordConfirm: passwordConfirm
        });
    }
};

ChangePasswordModal.prototype.onInputKeydown = function(e) {
    if (event.keyCode === 13) {
        this.onChangeClick();
    }
};