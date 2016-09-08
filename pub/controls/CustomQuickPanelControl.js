/**
 * Created by artyom.grishanov on 07.09.16.
 *
 * Кастомный контрол: кастомная логика для проекта должна быть описана в descriptor.js
 *
 * TODO: требуется унификация интерфейса для таких контролов
 */
function CustomQuickPanelControl(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this._view = null;

    this.loadDirective(function(response, status, xhr){
        if (this._view) {
            this.$directive.empty().append(this._view);
        }
    });

    this._onClick = function(e) {
        if (this.params.onClick) {
            this.params.onClick.call(this, {app: Engine.getApp()});
        }
        // остановить обработку, чтобы workspace в редакторе не обработал и не сбросил выделение
        e.preventDefault();
        e.stopPropagation();
    }

    //TODO наверное, стандартные события стоит сделать частью AbstractControl
    this._onShow = function() {
        if (this.params.onShow) {
            this.params.onShow.call(this, {app: Engine.getApp()});
        }
    }

    this.setView = function(v) {
        this._view = v;
        if (this.$directive) {
            this.$directive.empty().append(this._view);
            this.$directive.off('click').on('click', this._onClick.bind(this));
        }
    }
}
CustomQuickPanelControl.prototype = AbstractControl;