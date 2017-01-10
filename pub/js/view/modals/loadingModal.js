/**
 * Created by artyom.grishanov on 16.06.16.
 *
 * На модальных окошках опробую новый шаблон наследования
 */
var LoadingModal = function(param) {
    param = param || {};
    param.name = 'loadingModal';
    AbstractModal.call(this, param);
};

/**
 * Не делать так
 * LoadingModal.prototype = AbstractModal.prototype;
 * Будет фактически один объект прототип на несколько потомков
 *
 * @type {prototype|*}
 */
LoadingModal.prototype = Object.create(AbstractModal.prototype);
LoadingModal.prototype.constructor = LoadingModal;

LoadingModal.prototype.render = function() {
}