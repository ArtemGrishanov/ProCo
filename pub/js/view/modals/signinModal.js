/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * Модалка для логина.
 * Пользовать вводит логин/пароль для входа
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var SigninModal = function(param) {
    param = param || {};
    param.name = 'signinModal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose') ? !!param.canClose : true;
    AbstractModal.call(this, param);
    Auth.addEventCallback(this.onAuthEvent.bind(this));
    this.requestPerforming = false;
};

SigninModal.prototype = Object.create(AbstractModal.prototype);
SigninModal.prototype.constructor = SigninModal;

/**
 * Обработка событий от модуля Auth
 *
 * @param {string} event
 * @param {object} data
 */
SigninModal.prototype.onAuthEvent = function(event, data) {
    var errorMessage = '';
    var successMessage = '';
    switch(event) {
        case Auth.EVENT_SIGNIN_ERROR_INCORRECT_EMAIL: {
            errorMessage = App.getText('error_incorrect_email');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR_NO_USERNAME: {
            errorMessage = App.getText('error_no_username');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR_NO_PASSWORD: {
            errorMessage = App.getText('error_no_password');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR_INCORRECT_USER_OR_PASSWORD: {
            errorMessage = App.getText('error_incorrect_username_or_password');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR_PASSWORD_ATTEMPTS_EXCEEDED: {
            errorMessage = App.getText('error_password_attempts_exceeded');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR_USER_NOT_EXIST: {
            errorMessage = App.getText('error_user_not_exist');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR_USER_NOT_CONFIRMED: {
            errorMessage = App.getText('error_user_not_confirmed');
            break;
        }
        case Auth.EVENT_SIGNIN_ERROR: {
            errorMessage = App.getText('error_signin');
            break;
        }
        case Auth.EVENT_SIGNIN_SUCCESS: {
            successMessage = App.getText('signin_completed');
            setTimeout(function() {
                // автозакрытие через секунду после успешного входа
                Modal.hideSignin();
            }, 999);
            break;
        }
    }
    if (this.$ui) {
        if (successMessage) {
            this.$ui.find('.js-signin_message').text(successMessage);
            this.$ui.find('.js-signin_message').removeClass('__error');
        }
        else {
            if (errorMessage) {
                this.$ui.find('.js-signin_message').text(errorMessage);
                this.$ui.find('.js-signin_message').addClass('__error');
            }
            else {
                this.$ui.find('.js-signin_message').text('_');
                this.$ui.find('.js-signin_message').removeClass('__error');
            }
        }
        this.$ui.find('.js-signin').removeClass('__disabled');
    }
    this.requestPerforming = false;
};

/**
 *
 */
SigninModal.prototype.render = function() {
    this.$ui.find('.js-facebook_signin').click(this.onFacebookSigninClick.bind(this));

    this.$ui.find('.js-signin').click(this.onSigninClick.bind(this));

    this.$ui.find('.js-to_signup').click(this.onToSignupClick.bind(this));

    this.$ui.find('.js-email').keydown(this.onInputKeydown.bind(this));
    this.$ui.find('.js-password').keydown(this.onInputKeydown.bind(this));

    this.$ui.find('.js-to_restore_pass').click(this.onRestoreClick.bind(this));

    if (this.canClose === true) {
        this.$ui.find('.js-close').show().click((function() {
            Modal.hideSignin();
        }).bind(this));
    }
    else {
        this.$ui.find('.js-close').hide();
    }

    // <TODO remove
//    if (window.localStorage.getItem('signup12_2017_status') != 'shown') {
//        var cc = true;
//        if (window.location && window.location.pathname.indexOf('editor.html') >= 0) {
//            // в редакторе нельзя давать закрывать
//            cc = false;
//        }
//        window.localStorage.setItem('signup12_2017_status', 'shown');
//        Modal.showSignup12_2017Modal({
//            canClose: cc
//        });
//        setTimeout(function(){
//            Modal.hideSignin();
//        }, 999);
//    }
    // <TODO remove
};

/**
 * Клик по кнопке регистрации
 */
SigninModal.prototype.onSigninClick = function() {
    if (this.requestPerforming === false) {
        this.requestPerforming = true;
        this.$ui.find('.js-signin_message').text(App.getText('please_wait'));
        this.$ui.find('.js-signin_message').removeClass('__error');
        this.$ui.find('.js-signin').addClass('__disabled');
        var email = this.$ui.find('.js-email').val().trim();
        var password = this.$ui.find('.js-password').val().trim();
        Auth.signIn({
            username: email,
            password: password
        });
    }
};

SigninModal.prototype.onInputKeydown = function(e) {
    if (event.keyCode === 13) {
        this.onSigninClick();
    }
};

/**
 * Клик по кнопке "Войти с помощью FB"
 */
SigninModal.prototype.onFacebookSigninClick = function() {
    //todo продумать можно ли реализовать флоу с помощью ФБ
    //App.requestLogin(true);
}

/**
 * Перейти в окно логина
 */
SigninModal.prototype.onToSignupClick = function() {
    Modal.showSignup({
        canClose: this.canClose
    });
    Modal.hideSignin();
}

/**
 * Перейти в окно восстановления пароля
 */
SigninModal.prototype.onRestoreClick = function() {
    Modal.hideSignin();
    Modal.showRestorePassword({
        canClose: this.canClose
    });
}