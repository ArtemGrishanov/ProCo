/**
 * Created by artyom.grishanov on 16.06.16.
 *
 * Контроллер для управления модалками
 *
 * Ограничения
 * 1) Предполагается, что есть контейнер для размещения модалок на веб странице config.ui.modalsParentSelector
 *    Этот контейнер показывается пока есть хотя бы одно активное модальное окно.
 * 2) В один момент может быть показано только одно окно одного типа (например только один message)
 *
 *
 * Для добавления нового окна:
 * 1) Создать новый класс в pub/js/view/modals наследуя от abstractModal и реализовать там кастомную логику
 * 2) Создать верстку в pub/templates
 * 3) Прописать настройка в конфиг config.modals (файл config.js)
 * 4) Добавить в Modal функции типа showMessage/hideMessage
 *
 */
var Modal = {};
(function(global) {

    var activeModals = [];
    var $modalCnt = null;

    /**
     * Создает и показывает модальное окно по конструктору
     *
     * @param {function} constructor функция для создания мод окна
     * @param {object} data - данные для передачи в окно
     * @returns {*|show|show|show|show|show}
     * @private
     */
    function _show(constructor, data) {
        // не надо скрывать контейнер, так как сейчас собираемся его показать. Иначе будет моргание
        _hide(constructor, false);
        $modalCnt.show();
        var modal = new constructor(data).show($modalCnt);
        activeModals.push({
            constructor: constructor,
            modal: modal
        });
        if (modal.zIndex) {
            // Дело в том что id-dialogs_view ставит z-index не только в дочерние view, но и на себя самого (это перекроет модалку со сколько угодно высоким индексом)
            // здесь поступаем так же, на контейнер модалок ставим zindex
            $modalCnt.css('z-index', modal.zIndex);
        }
        else {
            $modalCnt.css('z-index', 'auto');
        }
        return modal;
    }

    /**
     * Скрыть модальное окно
     *
     * @param {function} constructor - функция-конструктор, указывающая тип окошка
     * @param {boolean} hideCnt - надо ли скрывать сам контейнер
     * @private
     */
    function _hide(constructor, hideCnt) {
        hideCnt = (hideCnt === undefined) ? true:hideCnt;
        var mIndex = -1;
        for (var i = 0; i < activeModals.length; i++) {
            if (activeModals[i].constructor === constructor) {
                mIndex = i;
                break;
            }
        }
        if (mIndex >= 0) {
            activeModals[i].modal.hide();
            activeModals.splice(i, 1);
        }
        if (hideCnt ===true && activeModals.length <= 0) {
            $modalCnt.hide();
        }
    }

    // init
    $modalCnt = $(config.ui.modalsParentSelector);
    if (!$modalCnt || $modalCnt.length == 0) {
        log('Element '+config.ui.modalsParentSelector+' doesn\'t exist', true);
    }

    // public methods below
    global.showLogin = function (data) { _show(LoginModal, data); };
    global.hideLogin = function () { _hide(LoginModal) };

    global.showMessage = function (data) { _show(MessageModal, data) };
    global.hideMessage = function () { _hide(MessageModal) };

    global.showLoading = function (data) { _show(LoadingModal, data) };
    global.hideLoading = function () { _hide(LoadingModal) };

    global.showPreviewShareImage = function (data) { _show(PreviewShareImageModal, data) };
    global.hidePreviewShareImage = function () { _hide(PreviewShareImageModal) };

    global.showRequestPublishFBPermissions = function (data) { _show(RequestFBPublishPermissionsModal, data) };
    global.hideRequestPublishFBPermissions = function () { _hide(RequestFBPublishPermissionsModal) };

    global.showSignup = function (data) {
        _show(SignupModal, data);
        App.stat('Testix.me', 'Show_signup');
    };
    global.hideSignup = function () { _hide(SignupModal) };

    global.showSignin = function (data) {
        _show(SigninModal, data);
        App.stat('Testix.me', 'Show_signin');
    };
    global.hideSignin = function () { _hide(SigninModal) };

    global.showEmailSent = function (data) {
        _show(EmailSentModal, data);
        App.stat('Testix.me', 'Show_email_sent_after_signup');
    };
    global.hideEmailSent = function () { _hide(EmailSentModal) };

    global.showChangePassword = function (data) {
        _show(ChangePasswordModal, data);
        App.stat('Testix.me', 'Show_change_password');
    };
    global.hideChangePassword = function () { _hide(ChangePasswordModal) };

    global.showRestorePassword = function (data) {
        _show(RestorePasswordModal, data);
        App.stat('Testix.me', 'Show_restore_password');
    };
    global.hideRestorePassword = function () { _hide(RestorePasswordModal) };

//    global.showHelpNotificationInMyProjects_12_2017Modal = function (data) {
//        _show(NotificationInMyProjects12_2017Modal, data);
//    };
//    global.hideHelpNotificationInMyProjects_12_2017Modal = function () { _hide(NotificationInMyProjects12_2017Modal) };

//    global.showSignup12_2017Modal = function (data) {
//        _show(Signup12_2017Modal, data);
//    };
//    global.hideSignup12_2017Modal = function () { _hide(Signup12_2017Modal) };

    global.showNotif04_2018Modal = function (data) {
        _show(Notif04_2018Modal, data);
    };
    global.hideNotif04_2018Modal = function () { _hide(Notif04_2018Modal) };

})(Modal);
