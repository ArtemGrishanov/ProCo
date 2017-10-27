/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * Модалка для регистрации.
 * Пользовать вводит логин/пароль или использует Facebook для входа
 *
 * @param {boolean} param.canClose - можно ли закрыть
 */
var SignupModal = function(param) {
    param = param || {};
    param.name = 'signupModal';
    // по умолчанию закрыть окно можно
    this.canClose = param.hasOwnProperty('canClose')?!!param.canClose:true;
    this.acceptPolicy = true;
    this.$regBtn = null;
    this.requestPerforming = false;
    Auth.addEventCallback(this.onAuthEvent.bind(this));
    AbstractModal.call(this, param);
};

SignupModal.prototype = Object.create(AbstractModal.prototype);
SignupModal.prototype.constructor = SignupModal;

/**
 * Обработка событий от модуля Auth
 *
 * @param {string} event
 * @param {object} data
 */
SignupModal.prototype.onAuthEvent = function(event, data) {
    var errorMessage = '';
    var successMessage = '';
    switch(event) {
        case Auth.EVENT_SIGNUP_ERROR_INCORRECT_EMAIL: {
            errorMessage = App.getText('error_incorrect_email');
            break;
        }
        case Auth.EVENT_SIGNUP_ERROR_NO_USERNAME: {
            errorMessage = App.getText('error_no_username');
            break;
        }
        case Auth.EVENT_SIGNUP_ERROR_NO_PASSWORD: {
            errorMessage = App.getText('error_no_password');
            break;
        }
        case Auth.EVENT_SIGNUP_ERROR_INVALID_PASSWORD: {
            errorMessage = App.getText('error_invalid_password');
            break;
        }
        case Auth.EVENT_SIGNUP_ERROR_USER_ALREADY_EXIST: {
            errorMessage = App.getText('error_user_already_exist');
            break;
        }
        case Auth.EVENT_SIGNUP_ERROR: {
            errorMessage = App.getText('error_signup');
            break;
        }
        case Auth.EVENT_SIGNUP_SUCCESS: {
            successMessage = App.getText('signup_completed');
            Modal.hideSignup();
            Modal.showEmailSent({
                canClose: this.canClose
            });
            break;
        }
    }
    if (successMessage) {
        this.$ui.find('.js-signup_message').text(successMessage);
    }
    else {
        if (errorMessage) {
            this.$ui.find('.js-signup_message').text(errorMessage);
            this.$ui.find('.js-signup_message').addClass('__error');
        }
        else {
            this.$ui.find('.js-signup_message').text('_');
            this.$ui.find('.js-signup_message').removeClass('__error');
        }
    }
    this.$ui.find('.js-signup').removeClass('__disabled');
    this.requestPerforming = false;
};

/**
 *
 */
SignupModal.prototype.render = function() {
    this.$ui.find('.js-facebook_signin').click(this.onFacebookSigninClick.bind(this));

    this.$regBtn = this.$ui.find('.js-signup').click(this.onSignupClick.bind(this));

    this.$ui.find('.js-to_signin').click(this.onToSigninClick.bind(this));

    this.$ui.find('.js-reg_attr_policy').change(this.onRegPolicyAcceptChange.bind(this));

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
 * Клик по кнопке регистрации
 */
SignupModal.prototype.onSignupClick = function() {
    if (this.acceptPolicy === true && this.requestPerforming === false) {
        this.requestPerforming = true;
        this.$ui.find('.js-signup_message').text(App.getText('please_wait'));
        this.$ui.find('.js-signup_message').removeClass('__error');
        this.$ui.find('.js-signup').addClass('__disabled');
        var email = this.$ui.find('.js-email').val().trim();
        var password = this.$ui.find('.js-password').val().trim();
        var newsOK = (this.$ui.find('.js-reg_attr_news').prop('checked') === true) ? '1': '0';
        // отправить запрос на регистрацию
        Auth.signUp({
            email: email,
            password: password,
            news_subscription: newsOK
        });
    }
};

/**
 * Клик по кнопке "Войти с помощью FB"
 */
SignupModal.prototype.onFacebookSigninClick = function() {
    //todo продумать можно ли реализовать флоу с помощью ФБ
    //App.requestLogin(true);
}

/**
 * Перейти в окно логина
 */
SignupModal.prototype.onToSigninClick = function() {
    Modal.showSignin({
        canClose: this.canClose
    });
    Modal.hideSignup();
}

/**
 * Переключение чекбокса о приеме-неприеме правил сайта
 */
SignupModal.prototype.onRegPolicyAcceptChange = function(e) {
    this.acceptPolicy = $(e.currentTarget).prop('checked');
    if (this.acceptPolicy === true) {
        this.$regBtn.removeClass('__disabled');
    }
    else {
        this.$regBtn.addClass('__disabled');
    }
}