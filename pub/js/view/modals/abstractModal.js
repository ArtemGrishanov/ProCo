/**
 * Created by artyom.grishanov on 16.06.16.
 *
 * Объект реализующий общую логику для модальных окон
 *
 * @param.data
 * @param.name
 */
var AbstractModal = function(param) {
    param = param || {};
    this.data = param.data || null;
    this.name = param.name || null;
    this.$ui = null;
    this.isShown = false;
    this.$parent = null;
    if (this.name) {
        this.templateUrl = config.modals[this.name].templateUrl;
        this.zIndex = config.modals[this.name].defZIndex;
    }
};

/**
 * Добавить в родительский контейнер и показать
 */
AbstractModal.prototype.show = function($parent) {
    this.$parent = $parent || this.$parent;
    if (this.$ui) {
        this.$ui.css('z-index',this.zIndex).show().appendTo(this.$parent);
        this.isShown = true;
    }
    else {
        this._loadTemplate((function() {
            this.show();
        }).bind(this));
    }
    return this;
}

/**
 * Удалить вью из дом дерева
 */
AbstractModal.prototype.hide = function() {
    if (this.$ui) {
        this.$ui.remove();
        this.isShown = false;
    }
    return this;
}

/**
 *
 * Загрузка шаблона, код единый для всех потомков
 *
 * @param {Function} callback
 * @private
 */
AbstractModal.prototype._loadTemplate = function(callback) {
    if (this.templateUrl) {
        // временная переменная чтобы только загрузить с помощью нее
        var $d = $('<div></div>');
        $d.load(config.common.home+this.templateUrl, (function() {
            this.$ui = $($d.html());
            App.localize(this.$ui);
            this.render();
            callback();
        }).bind(this));
    }
    return this;
}

AbstractModal.prototype.render = function() {
    // потомки должны реализовать этот метод самостоятельно
    console.log('Please, implement render()');
    return this;
}