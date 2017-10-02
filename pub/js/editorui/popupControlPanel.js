/**
 * Created by artyom.grishanov on 02.10.17.
 *
 * Панель в виде popup, который всплывает поверх редактора
 * В панельке помещаются контролы
 */
var PopupControlPanel = function(param) {
    param = param || {};
    this._closeCallback = param.closeCallback;
    this._view = $('#id-popup_controls');
    this._view.hide();
    this._view.find('.js-close').click(this.onCloseClick.bind(this));
}

/**
 * Показать popup контрол
 */
PopupControlPanel.prototype.show = function() {
    this._view.show();
}

/**
 * Скрытие
 */
PopupControlPanel.prototype.hide = function() {
    this._view.hide();
}

/**
 * Показана ли панель или нет
 *
 * @returns {boolean}
 */
PopupControlPanel.prototype.isShown = function() {
    return this._view.css('display') === 'block';
}

/**
 * Клик на кнопку закрытия
 */
PopupControlPanel.prototype.onCloseClick = function() {
    if (this._closeCallback) {
        // надо чтобы Workspace закрыл эту панель и вызвал события
        this._closeCallback();
    }
    else {
        this.hide();
    }
}