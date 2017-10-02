/**
 * Created by artyom.grishanov on 06.09.16.
 *
 * Панелька которая всплывает рядом при клике на элемент и указывает на него
 * В панельке помещаются контролы
 */
var QuickControlPanel = function() {
    this._view = $($('#id-quick_control_panel_template').html());
    this._cnt = this._view.find('.js-items');
    $('#id-control_cnt').append(this._view);
    this._view.hide();
}

/**
 * Показать всплывающую панельку с быстрыми контролами
 * @param element - элемент на который указывает панель и рядом с которым появляется
 */
QuickControlPanel.prototype.show = function(element) {
    this._view.show();
    this.updatePosition(element)
    this._view.css('zIndex', config.editor.ui.quickControlPanelZIndex);
}

/**
 * Обновить позицию панели, выровнять относительно элемента element
 * @param element
 */
QuickControlPanel.prototype.updatePosition = function(element) {
    this._height = this._view.height();
    // позиционирование сверху по центру над элементом element
    var w = this._view.width();
    var eo = $(element).offset();
    this._view.css('top',eo.top-this._height+'px');
    this._view.css('left',eo.left+($(element).outerWidth(false)-w)/2+'px'); // false - not including margins
}

/**
 * Скрытие
 */
QuickControlPanel.prototype.hide = function() {
    this._view.hide();
}

/**
 * Показана ли панель или нет
 *
 * @returns {boolean}
 */
QuickControlPanel.prototype.isShown = function() {
    return this._view.css('display') === 'block';
}