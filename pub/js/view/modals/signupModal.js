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
    AbstractModal.call(this, param);
};

SignupModal.prototype = Object.create(AbstractModal.prototype);
SignupModal.prototype.constructor = SignupModal;

/**
 *
 */
SignupModal.prototype.render = function() {
    console.log('Signup render');

    this.$ui.find('.js-facebook_signin').click(this.onFacebookSigninClick.bind(this));

    this.$ui.find('.js-signup').click(this.onSignupClick.bind(this));

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
 * Клик по кнопке регистрации
 */
SignupModal.prototype.onSignupClick = function() {
    var policyOK = $('.js-reg_attr_policy').attr('checked');
    if (policyOK === true) {
        // проверить что поля заполнены

        var newsOK = $('.js-reg_attr_news').attr('checked');

        // отправить запрос на регистрацию

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
    Modal.showSignin();
    Modal.hideSignup();
}