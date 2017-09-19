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

QuickControlPanel.prototype.show = function(element, controls) {
//    this._cnt.empty();
//    for (var i = 0; i < controls.length; i++) {
//        this.addControl(controls[i]);
//    }
    this._view.show();
    this.updatePosition(element)
    this._view.css('zIndex', config.editor.ui.quickControlPanelZIndex);
}

//QuickControlPanel.prototype.addControl = function(control) {
//    var item = $('<div class="qp_item"></div>').append(control.wrapper);
//    this._cnt.append(item);
//}

QuickControlPanel.prototype.updatePosition = function(element) {
    this._height = this._view.height();
    // позиционирование сверху по центру над элементом element
    var w = this._view.width();
    var eo = $(element).offset();
    this._view.css('top',eo.top-this._height+'px');
    this._view.css('left',eo.left+($(element).outerWidth(false)-w)/2+'px'); // false - not including margins
}

QuickControlPanel.prototype.hide = function() {
    this._view.hide();
}