/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * Модуль для управления авторизацией в приложении
 *
 */
var Auth = {
    // signup event group
    EVENT_SIGNUP_SUCCESS: 'event_signup_success',
    EVENT_SIGNUP_ERROR: 'event_signup_error',
    EVENT_SIGNUP_ERROR_INCORRECT_EMAIL: 'event_signup_error_incorrect_email',
    EVENT_SIGNUP_ERROR_NO_USERNAME: 'event_signup_error_no_username',
    EVENT_SIGNUP_ERROR_NO_PASSWORD: 'event_signup_error_no_password',
    EVENT_SIGNUP_ERROR_INVALID_PASSWORD: 'event_signup_error_invalid_password',
    EVENT_SIGNUP_ERROR_USER_ALREADY_EXIST: 'event_signup_error_user_already_exist',

    // signin event group
    EVENT_SIGNIN_SUCCESS: 'event_signin_success',
    EVENT_SIGNIN_ERROR_USER_NOT_CONFIRMED: 'event_signin_error_user_not_confirmed',
    EVENT_SIGNIN_ERROR_USER_NOT_EXIST: 'event_signin_error_user_not_exist',
    EVENT_SIGNIN_ERROR_INCORRECT_USER_OR_PASSWORD: 'event_signin_error_incorrect_user_or_password',
    EVENT_SIGNIN_ERROR_PASSWORD_ATTEMPTS_EXCEEDED: 'event_sigin_error_password_attempts_exceeded',
    EVENT_SIGNIN_ERROR: 'event_signin_error', // неопознанный универсальный еррор "что-то пошло не так"
    EVENT_SIGNIN_ERROR_INCORRECT_EMAIL: 'event_error_incorrect_email', // сейчас емайл используется как username
    EVENT_SIGNIN_ERROR_NO_USERNAME: 'event_error_no_username',
    EVENT_SIGNIN_ERROR_NO_PASSWORD: 'event_error_no_password',

    EVENT_SIGNOUT: 'event_signout',

    EVENT_AUTO_SIGNIN_FAILED: 'event_auto_signin_failed', // автоматически не удалось восстановить сессию из localStorage браузера

    // signup event group
    EVENT_SIGNUP_ERROR: 'event_signup_error',

    // changepassword event group
    EVENT_CHANGEPASS_SUCCESS: 'event_changepass_success',
    EVENT_CHANGEPASS_ERROR: 'event_changepass_error',
    EVENT_CHANGEPASS_ERROR_NO_ACTUAL_PASSWORD: 'event_changepass_error_no_actual_password',
    EVENT_CHANGEPASS_ERROR_NO_PASSWORD: 'event_changepass_error_no_password',
    EVENT_CHANGEPASS_ERROR_NO_PASSWORD_CONFIRM: 'event_changepass_error_no_password_confirm',
    EVENT_CHANGEPASS_ERROR_NO_CONFIRM_CODE: 'event_changepass_error_no_confirm_code', // только при восстановлении пароля через емайл возникает этот кейс
    EVENT_CHANGEPASS_ERROR_NO_USERNAME: 'event_changepass_no_username', // только при восстановлении пароля через емайл возникает этот кейс
    EVENT_CHANGEPASS_ERROR_INVALID_CODE: 'event_error_invalid_code',
    EVENT_CHANGEPASS_ERROR_DIFF_PASSWORDS: 'event_changepass_error_diff_passwords',
    EVENT_CHANGEPASS_ERROR_INVALID_PASSWORD: 'event_changepass_error_invalid_password',
    EVENT_CHANGEPASS_WRONG_PASSWORD: 'event_changepass_wrong_pass',
    EVENT_CHANGEPASS_INVALID_NEW_PASSWORD: 'event_changepass_invalid_new_pass',


    //restore password
    EVENT_RESTORE_SENT: 'event_restore_sent',
    EVENT_RESTORE_ERROR: 'event_restore_error'
};

(function(global) {

    /**
     * Токен сессионный
     * @type {string}
     * @private
     */
    var _sessionToken = null;
    /**
     * События в приложении, вызов вовне
     * @type {Array.<function>}
     * @private
     */
    var _eventCallbacks = [];
    /**
     * Данные пользователя
     * - email
     * - email_verified
     * - sub ?
     * - cognitoUser
     *
     * @type {object}
     * @private
     */
    var _user = null;

    /**
     * Запрос на регистрацию нового пользователя
     *
     * @param {string} param.email
     * @param {string} param.password
     * @param {number} param.news_subscription - 0 | 1 - разрешается ли присылать новости. По умолчанию '1'
     */
    function signUp(param) {
        param = param || {};
        if (typeof param.email !== 'string' || param.email.length === 0) {
            _trigger(Auth.EVENT_SIGNUP_ERROR_NO_USERNAME);
            return;
        }
        // используем емайл как имя юзера, но можно заставить вводить еще и username
        param.username = param.email;
        if (!param.password || param.password.length === 0) {
            _trigger(Auth.EVENT_SIGNUP_ERROR_NO_PASSWORD);
            return;
        }
        if (_validateEmail(param.username) !== true) {
            _trigger(Auth.EVENT_SIGNUP_ERROR_INCORRECT_EMAIL);
            return;
        }
        param.news_subscription = (param.news_subscription.toString() === '0') ? '0': '1';

        var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
        var poolData = {
            UserPoolId : config.common.awsUserPoolId,
            ClientId : config.common.awsUserPoolClientId
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

        var attributeList = [];
        var dataEmail = {
            Name : 'email',
            Value : param.email
        };
        var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeEmail);

        //        var dataEmail = {
        //            Name : 'nickname',
        //            Value : 'Nickname_remove_this_field'
        //        };
        //        var attributeNickname = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        //        attributeList.push(attributeNickname);

        var attribute = {
            Name : 'custom:news_subscription',
            Value : param.news_subscription
        };
        var attribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute);
        attributeList.push(attribute);

        userPool.signUp(param.username, param.password, attributeList, null, function(err, result) {
            if (err) {
                if (err.code === 'InvalidPasswordException' || err.message.indexOf('Value at \'password\' failed to satisfy constraint') >= 0) {
                    // err.message InvalidPasswordException: Password did not conform with policy: Password must have uppercase characters
                    _trigger(Auth.EVENT_SIGNUP_ERROR_INVALID_PASSWORD);
                }
                else if (err.code === 'UsernameExistsException') {
                    // err.message: UsernameExistsException: User already exists
                    _trigger(Auth.EVENT_SIGNUP_ERROR_USER_ALREADY_EXIST);
                }
                else {
                    // unknown error
                    _trigger(Auth.EVENT_SIGNUP_ERROR);
                    console.error(err.code + ' ' + err.message);
                }
                return;
            }
            else {
                cognitoUser = result.user;
                _updateShortUserId();
                _trigger(Auth.EVENT_SIGNUP_SUCCESS);
            }
        });
    }

    /**
     * Ручное подтверждение регистрации, нужно указать код
     *
     * @param {string} param.username
     * @param {string} param.code
     */
//    function confirmRegisteredUnauthUser(param) {
//        param = param || {};
//        if (typeof param.username !== 'string' || param.username.length === 0) {
//            throw new Error('confirmRegisteredUnauthUser: username not specified');
//        }
//        if (!param.code || param.code.length === 0) {
//            throw new Error('confirmRegisteredUnauthUser: code not specified');
//        }
//        var poolData = {
//            UserPoolId : config.common.awsUserPoolId,
//            ClientId : config.common.awsUserPoolClientId
//        };
//        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
//        var userData = {
//            Username : param.username,
//            Pool : userPool
//        };
//        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
//        cognitoUser.confirmRegistration(param.code, true, function(err, result) {
//            if (err) {
//                alert(err);
//                return;
//            }
//            console.log('call result: ' + result);
//        });
//    }

    /**
     * Пользователь восстанавливает свой пароль
     *
     * @param {string} param.username
     */
    function restorePassword(param) {
        param = param || {};
        if (typeof param.username !== 'string' || param.username.length === 0) {
            _trigger(Auth.EVENT_RESTORE_ERROR);
            return;
        }
        var poolData = {
            UserPoolId : config.common.awsUserPoolId,
            ClientId : config.common.awsUserPoolClientId
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var userData = {
            Username : param.username,
            Pool : userPool
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        cognitoUser.forgotPassword({
            onSuccess: function (data) {
                // successfully initiated reset password request
                _trigger(Auth.EVENT_RESTORE_SENT);
            },
            onFailure: function(err) {
                _trigger(Auth.EVENT_RESTORE_ERROR);
            }
            //Optional automatic callback
            //            inputVerificationCode: function(data) {
            //                var verificationCode = prompt('Please input verification code ' ,'');
            //                var newPassword = prompt('Enter new password ' ,'');
            //                cognitoUser.confirmPassword(verificationCode, newPassword, this);
            //            }
        });
    }

    /**
     * Ввести код подтверждения и новый пароль
     *
     * @param {string} param.username
     * @param {string} param.code
     * @param {string} param.password
     * @param {string} param.passwordConfirm
     */
    function confirmCodeAndEnterPassword(param) {
        param = param || {};
        if (typeof param.username !== 'string' || param.username.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_USERNAME);
            return;
        }
        if (typeof param.code !== 'string' || param.code.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_CONFIRM_CODE);
            return;
        }
        if (typeof param.password !== 'string' || param.password.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_PASSWORD);
            return;
        }
        if (typeof param.passwordConfirm !== 'string' || param.passwordConfirm.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_PASSWORD_CONFIRM);
            return;
        }
        if (param.passwordConfirm !== param.password) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_DIFF_PASSWORDS);
            return;
        }
        var poolData = {
            UserPoolId : config.common.awsUserPoolId,
            ClientId : config.common.awsUserPoolClientId
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var userData = {
            Username : param.username,
            Pool : userPool
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
        cognitoUser.confirmPassword(param.code, param.password, {
            onSuccess: function (data) {
                _trigger(Auth.EVENT_RESTORE_CONFIRM_SUCCESS);
            },
            onFailure: function(err) {
                if (err.message.indexOf('Incorrect username or password') >= 0 || err.message.indexOf('Value at \'previousPassword\' failed to satisfy constraint') >= 0) {
                    // настоящий пароль не соответствуетс требованиям безопасности - это всё равно, что и "он не правильный"
                    _trigger(Auth.EVENT_CHANGEPASS_WRONG_PASSWORD);
                }
                else if (err.code === 'CodeMismatchException') {
                    _trigger(Auth.EVENT_CHANGEPASS_ERROR_INVALID_CODE);
                }
                else if (err.message.indexOf('Value at \'proposedPassword\' failed to satisfy constraint') >= 0) {
                    _trigger(Auth.EVENT_CHANGEPASS_INVALID_NEW_PASSWORD);
                }
                else if (err.code === 'InvalidPasswordException' || err.message.indexOf('Value at \'password\' failed to satisfy constraint') >= 0) {
                    // err.message InvalidPasswordException: Password did not conform with policy: Password must have uppercase characters
                    _trigger(Auth.EVENT_CHANGEPASS_ERROR_INVALID_PASSWORD);
                }
                else {
                    _trigger(Auth.EVENT_CHANGEPASS_ERROR);
                    console.error(err.code + ' ' + err.message);
                }
            }
        });
    }

    /**
     * Войти на сайт с указанными логин/паролем
     *
     * @param {string} param.username
     * @param {string} param.password
     */
    function signIn(param) {
        param = param || {};
        if (typeof param.username !== 'string' || param.username.length === 0) {
            _trigger(Auth.EVENT_SIGNIN_ERROR_NO_USERNAME);
            return;
        }
        if (typeof param.password !== 'string' || param.password.length === 0) {
            _trigger(Auth.EVENT_SIGNIN_ERROR_NO_PASSWORD);
            return;
        }
        if (_validateEmail(param.username) !== true) {
            _trigger(Auth.EVENT_SIGNIN_ERROR_INCORRECT_EMAIL);
            return;
        }
        var authenticationData = {
            Username : param.username,
            Password : param.password
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
        var poolData = {
            UserPoolId : config.common.awsUserPoolId,
            ClientId : config.common.awsUserPoolClientId
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var userData = {
            Username : param.username,
            Pool : userPool
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                //console.log('access token + ' + result.getAccessToken().getJwtToken());
                var key = 'cognito-idp.'+config.common.awsRegion+'.amazonaws.com/'+config.common.awsUserPoolId;
                AWS.config.region = config.common.awsRegion;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: config.common.awsIdentityPoolId,
                    Logins: {
                        [key]: result.getIdToken().getJwtToken()
                    }
                });
                cognitoUser.getUserAttributes(function(err, attributes) {
                    if (err) {
                        // Handle error
                        _trigger(Auth.EVENT_SIGNIN_ERROR);
                        return;

                    } else {
                        // Создать авторизованного пользователя
                        _createAuthenticatedUser({
                            cognitoAttributes: attributes,
                            cognitoUser: cognitoUser
                        });
                        _sessionToken = result.getIdToken().getJwtToken();
                        _trigger(Auth.EVENT_SIGNIN_SUCCESS);

                        if (typeof getUser().short_id !== 'string') {
                            _updateShortUserId();
                        }
                    }
                });
            },

            onFailure: function(err) {
                if (err.code === 'NotAuthorizedException' && err.message === 'Incorrect username or password.') {
                    // err.message 'Incorrect username or password'
                    _trigger(Auth.EVENT_SIGNIN_ERROR_INCORRECT_USER_OR_PASSWORD);
                }
                else if (err.code === 'NotAuthorizedException' && err.message === 'Password attempts exceeded.') {
                    // err.message 'Password attempts exceeded'
                    _trigger(Auth.EVENT_SIGNIN_ERROR_PASSWORD_ATTEMPTS_EXCEEDED);
                }
                else if (err.code === 'UserNotFoundException') {
                    // err.message 'User does not exist'
                    _trigger(Auth.EVENT_SIGNIN_ERROR_USER_NOT_EXIST);
                }
                else if (err.code === 'UserNotConfirmedException') {
                    // err.message 'User is not confirmed'
                    _trigger(Auth.EVENT_SIGNIN_ERROR_USER_NOT_CONFIRMED);
                }
                else {
                    // unknown error
                    _trigger(Auth.EVENT_SIGNIN_ERROR);
                    console.error(err.code + ' ' + err.message);
                }
            },

            mfaRequired: function(codeDeliveryDetails) {
                // MFA is required to complete user authentication.
                // Get the code from user and call
                // cognitoUser.sendMFACode(mfaCode, this)
                // unknown error
                _trigger(Auth.EVENT_SIGNIN_ERROR);
                console.error(err.code + ' ' + err.message);
            },

            newPasswordRequired: function(userAttributes, requiredAttributes) {
                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.

                // the api doesn't accept this field back
                delete userAttributes.email_verified;

                // Get these details and call
                var newPassword = prompt('Enter new password ' ,'');
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
            }

        });
    }

    /**
     * Смена пароля
     *
     * @param {string} param.actualPassword
     * @param {string} param.password
     * @param {string} param.passwordConfirm
     */
    function changePassword(param) {
        param = param || {};
        if (typeof param.actualPassword !== 'string' || param.actualPassword.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_ACTUAL_PASSWORD);
            return;
        }
        if (typeof param.password !== 'string' || param.password.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_PASSWORD);
            return;
        }
        if (typeof param.passwordConfirm !== 'string' || param.passwordConfirm.length === 0) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_NO_PASSWORD_CONFIRM);
            return;
        }
        if (param.passwordConfirm !== param.password) {
            _trigger(Auth.EVENT_CHANGEPASS_ERROR_DIFF_PASSWORDS);
            return;
        }
        if (_user && _user.cognitoUser) {
            _user.cognitoUser.changePassword(param.actualPassword, param.password, function(err, result) {
                if (err) {
                    if (err.message.indexOf('Incorrect username or password') >= 0 || err.message.indexOf('Value at \'previousPassword\' failed to satisfy constraint') >= 0) {
                        // настоящий пароль не соответствуетс требованиям безопасности - это всё равно, что и "он не правильный"
                        _trigger(Auth.EVENT_CHANGEPASS_WRONG_PASSWORD);
                    }
                    else if (err.message.indexOf('Value at \'proposedPassword\' failed to satisfy constraint') >= 0) {
                        _trigger(Auth.EVENT_CHANGEPASS_INVALID_NEW_PASSWORD);
                    }
                    else if (err.code === 'InvalidPasswordException' || err.message.indexOf('Value at \'password\' failed to satisfy constraint') >= 0) {
                        // err.message InvalidPasswordException: Password did not conform with policy: Password must have uppercase characters
                        _trigger(Auth.EVENT_CHANGEPASS_ERROR_INVALID_PASSWORD);
                    }
                    else {
                        _trigger(Auth.EVENT_CHANGEPASS_ERROR);
                        console.error(err.code + ' ' + err.message);
                    }
                }
                else {
                    _trigger(Auth.EVENT_CHANGEPASS_SUCCESS);
                }
            });
        }
    }

    /**
     * Обновить короткий идишник пользователя,
     * Сгенерировать его из уникального id юзер пула
     * Пример: 0235e985-8b92-4666-83fa-25fd85ee1072 -> 96326a41c9
     *
     * @private
     */
    function _updateShortUserId() {
        if (_user) {
            var sid = MD5.calc(_user.id).substr(0,10);
            if (_user.short_id !== sid) {
                // сразу запишем локально для использования, дальше на бекенд запрос отправляется
                _user.short_id = sid;
                var attributeList = [];
                var attribute = {
                    Name : 'custom:short_id',
                    Value : sid
                };
                var attribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute);
                attributeList.push(attribute);
                _user.cognitoUser.updateAttributes(attributeList, function(err, result) {
                    // do nothing
                });
            }
        }
    }

    /**
     * Разлогин
     */
    function signOut() {
        _user.cognitoUser.signOut();
        _user = null;
        _sessionToken = null;
        AWS.config.credentials.clearCachedId();
        _trigger(Auth.EVENT_SIGNOUT);
    }

    /**
     * Попытаться восстановить сессию пользователя из localStorage
     *
     */
    function tryRestoreSession() {
        var poolData = {
            UserPoolId : config.common.awsUserPoolId,
            ClientId : config.common.awsUserPoolClientId
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession(function(err, session) {
                if (err) {
                    _trigger(Auth.EVENT_AUTO_SIGNIN_FAILED);
                    return;
                }
                //console.log('session validity: ' + session.isValid());
                // NOTE: getSession must be called to authenticate user before calling getUserAttributes
                cognitoUser.getUserAttributes(function(err, attributes) {
                    if (err) {
                        // Handle error
                        _trigger(Auth.EVENT_AUTO_SIGNIN_FAILED);
                        return;
                    } else {
                        // Создать авторизованного пользователя
                        _createAuthenticatedUser({
                            cognitoAttributes: attributes,
                            cognitoUser: cognitoUser
                        });
                        _sessionToken = session.getIdToken().getJwtToken();
                        _trigger(Auth.EVENT_SIGNIN_SUCCESS);

                        _updateShortUserId();
                    }
                });

                var key = 'cognito-idp.'+config.common.awsRegion+'.amazonaws.com/'+config.common.awsUserPoolId;
                AWS.config.region = config.common.awsRegion;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: config.common.awsIdentityPoolId,
                    Logins: {
                        [key]: session.getIdToken().getJwtToken()
                    }
                });
            });
        }
        else {
            _trigger(Auth.EVENT_AUTO_SIGNIN_FAILED);
        }
    }

    /**
     * Создать авторизованного пользователя
     * Значит пользователь успешно залогинен
     *
     * @param {Array} param.cognitoAttributes
     * @param {object} param.cognitoUser
     *
     * @private
     */
    function _createAuthenticatedUser(param) {
        param = param || {};
        _user = {};
        if (param.cognitoAttributes) {
            // установка с помощью атрибутов полученных например в tryRestoreSession
            for (var i = 0; i < param.cognitoAttributes.length; i++) {
                var atr = param.cognitoAttributes[i];
                if (atr.Name === 'sub') {
                    // меняем название UID на 'sub' -> 'id'
                    _user['id'] = atr.Value;
                }
                else {
                    _user[atr.Name] = atr.Value;
                }
            }
        }
        if (param.cognitoUser) {
            _user.cognitoUser = param.cognitoUser;
        }
    }

    /**
     * https://stackoverflow.com/questions/46155/how-to-validate-email-address-in-javascript
     * @param {string} email
     * @returns {boolean}
     * @private
     */
    function _validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    /**
     * Инициировать событие от имени можуля Auth
     *
     * @param {string} eventType
     * @param {object} data
     */
    function _trigger(eventType, data) {
        data = data || {};
        for (var j = 0; j < _eventCallbacks.length; j++) {
            _eventCallbacks[j](eventType, data);
        }
    };

    /**
     * Может использоваться как признак успешной авторизации
     *
     * @returns {string}
     */
    function getAuthToken() {
        return _sessionToken;
    }

    /**
     * Добавить колбек
     * Можно добавить несколько колбеков
     *
     * @param {function} clb
     */
    function addEventCallback(clb) {
        _eventCallbacks.push(clb);
    }

    /**
     * Вернуть авторизованного пользователя
     *
     * @returns {Object}
     */
    function getUser() {
        return _user;
    }

    /**
     * Получить вес тарифа, чтобы сравнивать тарифы между собой
     *
     * @param {string} tariff
     * @returns {boolean}
     * @private
     */
    function _getTariffWeight(tariff) {
        for (var key in config.tariff.weights) {
            if (key === tariff) {
                return config.tariff.weights[tariff];
            }
        }
        return undefined;
    }

    /**
     * Проверить поддерживает ли пользователь тариф
     * Например: isTariff('basic')
     *
     * @param {string} tariff
     * @returns {boolean}
     */
    function isTariff(tariff) {
        if (_user) {
            var t = Auth.getUser()['custom:tariff'];
            if (t) {
                return _getTariffWeight(tariff) <= _getTariffWeight(t);
            }
        }
        return false;
    }

    // public methods
    global.addEventCallback = addEventCallback;
    global.getAuthToken = getAuthToken;
    global.signUp = signUp;
    global.signIn = signIn;
    global.signOut = signOut;
    global.tryRestoreSession = tryRestoreSession;
    global.getUser = getUser;
    global.changePassword = changePassword;
    global.restorePassword = restorePassword;
    global.confirmCodeAndEnterPassword = confirmCodeAndEnterPassword;
    global.isTariff = isTariff;

    // for debug
    global._getCredentials = function() {
        AWS.config.credentials.get(function (err) {
            if (err) console.log(err);
            else console.log(AWS.config.credentials);
        });
    }

})(Auth);