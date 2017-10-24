/**
 * Created by artyom.grishanov on 17.10.17.
 *
 * Модуль для управления авторизацией в приложении
 *
 */

var Auth = {
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

    EVENT_AUTO_SIGNIN_FAILED: 'event_auto_failed', // автоматически не удалось восстановить сессию из localStorage браузера

    // signup event group
    EVENT_SIGNUP_ERROR: 'event_signup_error',
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
     */
    function signUp(param) {
        param = param || {};
        if (typeof param.email !== 'string' || param.email.length === 0) {
            throw new Error('signUp: email not specified');
        }
        // используем емайл как имя юзера, но можно заставить вводить еще и username
        param.username = param.email;
        if (!param.password || param.password.length === 0) {
            throw new Error('signUp: password not specified');
        }

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

        var dataEmail = {
            Name : 'nickname',
            Value : 'Nickname_remove_this_field'
        };
        var attributeNickname = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeNickname);

        //TODO add attribute: allow to get some news

        userPool.signUp(param.username, param.password, attributeList, null, function(err, result) {
            if (err) {
                // err.code == 'InvalidPasswordException' || 'InvalidParameterException' || 'UsernameExistsException'

                // Details:

                // UsernameExistsException: User already exists
                // InvalidPasswordException: Password did not conform with policy: Password must have uppercase characters
                // InvalidParameterException: Attributes did not conform to the schema: nickname: The attribute is required

                alert(err);
                return;
            }
            else {
            }
            cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
        });
    }

    /**
     * Ручное подтверждение регистрации, нужно указать код
     *
     * @param {string} param.username
     * @param {string} param.code
     */
    function confirmRegisteredUnauthUser(param) {
        param = param || {};
        if (typeof param.username !== 'string' || param.username.length === 0) {
            throw new Error('confirmRegisteredUnauthUser: username not specified');
        }
        if (!param.code || param.code.length === 0) {
            throw new Error('confirmRegisteredUnauthUser: code not specified');
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
        cognitoUser.confirmRegistration(param.code, true, function(err, result) {
            if (err) {
                alert(err);
                return;
            }
            console.log('call result: ' + result);
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

    // public methods
    global.addEventCallback = addEventCallback;
    global.getAuthToken = getAuthToken;
    global.signUp = signUp;
    global.signIn = signIn;
    global.signOut = signOut;
    global.confirmRegisteredUnauthUser = confirmRegisteredUnauthUser;
    global.tryRestoreSession = tryRestoreSession;
    global.getUser = getUser;

    // for debug
    global._getCredentials = function() {
        AWS.config.credentials.get(function (err) {
            if (err) console.log(err);
            else console.log(AWS.config.credentials);
        });
    }

})(Auth);