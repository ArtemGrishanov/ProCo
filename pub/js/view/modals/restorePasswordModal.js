/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * Модалка для восстановления пароля.
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var RestorePasswordModal = function(param) {
    param = param || {};
    param.name = 'restorePasswordModal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose')?!!param.canClose:true;
    AbstractModal.call(this, param);
    Auth.addEventCallback(this.onAuthEvent.bind(this));
    this.requestPerforming = false;
};

RestorePasswordModal.prototype = Object.create(AbstractModal.prototype);
RestorePasswordModal.prototype.constructor = RestorePasswordModal;

/**
 * Обработка событий от модуля Auth
 *
 * @param {string} event
 * @param {object} data
 */
RestorePasswordModal.prototype.onAuthEvent = function(event, data) {
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
        case Auth.EVENT_CHANGEPASS_ERROR_INVALID_CODE: {
            errorMessage = App.getText('error_invalid_code');
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
        case Auth.EVENT_RESTORE_ERROR: {
            errorMessage = App.getText('error_restore_password');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_NO_CONFIRM_CODE: {
            errorMessage = App.getText('error_input_confirmation_code');
            break;
        }
        case Auth.EVENT_CHANGEPASS_ERROR_NO_USERNAME: {
            errorMessage = App.getText('error_no_username');
            break;
        }
        case Auth.EVENT_RESTORE_SENT: {
            successMessage = App.getText('enter_code_and_password');
            this.$ui.find('.js-restore').hide();
            this.$ui.find('.js-email').hide();
            this.$ui.find('.js-delimeter').hide();
            this.$ui.find('.js-confirm').show();
            this.$ui.find('.js-code').show();
            this.$ui.find('.js-password').show();
            this.$ui.find('.js-password_confirm').show();
            break;
        }
        case Auth.EVENT_RESTORE_CONFIRM_SUCCESS: {
            successMessage = App.getText('password_changed');
            setTimeout(function() {
                Modal.hideRestorePassword();
                Modal.showSignin();
            }, 999);
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
    this.$ui.find('.js-restore').removeClass('__disabled');
    this.$ui.find('.js-confirm').removeClass('__disabled');
    this.requestPerforming = false;
};

/**
 *
 */
RestorePasswordModal.prototype.render = function() {
    this.$ui.find('.js-restore').click(this.onRestoreClick.bind(this));
    this.$ui.find('.js-email').keydown(this.onRestoreKeydown.bind(this));

    this.$ui.find('.js-confirm').click(this.onConfirmClick.bind(this));
    this.$ui.find('.js-code').keydown(this.onConfirmKeydown.bind(this));
    this.$ui.find('.js-password').keydown(this.onConfirmKeydown.bind(this));
    this.$ui.find('.js-password_confirm').keydown(this.onConfirmKeydown.bind(this));

    this.$ui.find('.js-to_signup').click(this.onToSignupClick.bind(this));
    this.$ui.find('.js-to_signin').click(this.onToSigninClick.bind(this));

    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideRestorePassword();
        }).bind(this));
    }
    else {
        this.$ui.find('.js-close').hide();
    }
};

/**
 * Пользователь ввел емайл и нажал восстановить
 */
RestorePasswordModal.prototype.onRestoreClick = function() {
    if (this.requestPerforming === false) {
        this.requestPerforming = true;
        this.$ui.find('.js-message').text(App.getText('please_wait'));
        this.$ui.find('.js-message').removeClass('__error');
        this.$ui.find('.js-restore').addClass('__disabled');
        this.$ui.find('.js-confirm').addClass('__disabled');

        var email = this.$ui.find('.js-email').val().trim();
        Auth.restorePassword({
            username: email
        });
    }
};

/**
 * Пользователь ввел код подтверждения ввел новый пароль и нажал Готово
 */
RestorePasswordModal.prototype.onConfirmClick = function() {
    if (this.requestPerforming === false) {
        this.requestPerforming = true;
        this.$ui.find('.js-message').text(App.getText('please_wait'));
        this.$ui.find('.js-message').removeClass('__error');
        this.$ui.find('.js-restore').addClass('__disabled');
        this.$ui.find('.js-confirm').addClass('__disabled');

        var email = this.$ui.find('.js-email').val().trim();
        var code = this.$ui.find('.js-code').val().trim();
        var password = this.$ui.find('.js-password').val().trim();
        var passwordConfirm = this.$ui.find('.js-password_confirm').val().trim();
        Auth.confirmCodeAndEnterPassword({
            username: email,
            code: code,
            password: password,
            passwordConfirm: passwordConfirm
        });
    }
};

RestorePasswordModal.prototype.onRestoreKeydown = function(e) {
    if (event.keyCode === 13) {
        this.onRestoreClick();
    }
};

RestorePasswordModal.prototype.onConfirmKeydown = function(e) {
    if (event.keyCode === 13) {
        this.onConfirmClick();
    }
};

/**
 * Перейти в окно логина
 */
RestorePasswordModal.prototype.onToSigninClick = function() {
    Modal.hideRestorePassword();
    Modal.showSignin();
}

/**
 * Перейти в окно регистрации
 */
RestorePasswordModal.prototype.onToSignupClick = function() {
    Modal.hideRestorePassword();
    Modal.showSignup();
}