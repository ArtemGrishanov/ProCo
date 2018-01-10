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
    this._sortControlViews();
    this._view.css('zIndex', config.editor.ui.quickControlPanelZIndex);
}

/**
 * Обновить позицию панели, выровнять относительно элемента element
 * @param element
 */
QuickControlPanel.prototype.updatePosition = function(element) {
//    this._height = this._view.height();
    // позиционирование сверху по центру над элементом element
    var w = this._view.width();
    var h = this._view.height();
    var eo = $(element).offset();
    this._view.css('top', eo.top-h+'px');
    this._view.css('left', eo.left+($(element).outerWidth(false)-w)/2+'px'); // false - not including margins
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

/**
 * На основе информации из контрола проапдейтить внешний вид и логику
 *
 * @param {AbstractControl} control
 */
QuickControlPanel.prototype.updateControl = function(control) {
    // console.log('QuickControlPanel.updateControl: ' + control.propertyString + ' getControlWrapper=' + this.getControlWrapper(control.id));
    var qpItem = this.getControlWrapper(control.id);
    if (qpItem) {
        if ($(qpItem).attr('data-sort-index') !== control.sortIndex) {
            $(qpItem).attr('data-sort-index', control.sortIndex);
            this._sortControlViews();
        }
        if (control.enabled === false) {
            $(qpItem).addClass('__disabled');
        }
        else {
            $(qpItem).removeClass('__disabled');
        }
        if (control.delimeterAfter === true) {
            $(qpItem).addClass('__delimeter_bottom');
        }
        else {
            $(qpItem).removeClass('__delimeter_bottom');
        }
    }
    else {
        console.error('QuickControlPanel.updateControl: item not found for control id \''+control.id+'\'');
    }
}

/**
 *
 * @param {string} cId - ид контрола
 * @param {Number} sortIndex
 */
//QuickControlPanel.prototype.setGroupForView = function(cId, sortIndex) {
//    var qpItems = this._cnt.children();
//    for (var i = 0; i < qpItems.length; i++) {
//        var $qpItem = $(qpItems[i]);
//        if (cId === $qpItem.attr('data-cid')) {
//            // нашли этот контрол вью
//            // сортируем его в зависимости от группы
//            $qpItem.attr('data-sort-index', sortIndex);
//        }
//    }
//    this._sortControlViews();
//};

/**
 * Найти control wrapper (они же qp_item) по ид контрола
 *
 * @param cId
 * @returns {*}
 */
QuickControlPanel.prototype.getControlWrapper = function(cId) {
    var qpItems = this._cnt.children();
    for (var i = 0; i < qpItems.length; i++) {
        var $qpItem = $(qpItems[i]);
        if (cId === $qpItem.attr('data-cid')) {
            return $qpItem;
        }
    }
    return null;
};

/**
 * Пересортировать .qp_item внутри $('#id-control_cnt').find('.js-quick_panel .js-items')
 * в зависимости от атрибута data-sort-index
 *
 * По умолчанию у всех элементов группа 0.
 * Значит если задать: -1 то элемент поднимется выше и будет отчеркнут чертой (разделитель между группами)
 * если задать 1, то элемент опуститься ниже и будет отчеркнут чертой от остальных элементов.
 *
 * На самом деле у панлеи нет единого списка дочерних контролов (это минус компонента)
 * ControlManager напрямую добавляет контролы вью в $('#id-control_cnt').find('.js-quick_panel .js-items');
 * Поэтому такая реализация
 *
 * @private
 */
QuickControlPanel.prototype._sortControlViews = function() {
    var qpItems = this._cnt.children();
    for (var i = 0; i < qpItems.length; i++) {
        var $qpItem = $(qpItems[i]);
        var sortIndex = $qpItem.attr('data-sort-index');
        if (sortIndex === undefined) {
            // добавить всем у кого нет этого атрибута
            $qpItem.attr('data-sort-index', config.editor.ui.quickPanelDefaultSortIndex);
        }
    }
    var items = this._cnt.children().sort(function(a, b) {
        var vA = $(a).attr('data-sort-index');
        var vB = $(b).attr('data-sort-index');
        return (vA < vB) ? -1 : (vA > vB) ? 1 : 0;
    });
    this._cnt.append(items);
};