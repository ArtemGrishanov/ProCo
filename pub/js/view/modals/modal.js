/**
 * Created by artyom.grishanov on 16.06.16.
 *
 * Контроллер для управления модалками
 * Предполашается что есть котейнер для размещения модалок на веб странице config.ui.modalsParentSelector
 */
var Modal = {};
(function(global) {

    var modals = [];
    var $loading = null;
    var $modalCnt = null;

    function showLoading(data) {
        if ($loading) {
            hideLoading();
        }
        $modalCnt.show();
        $loading = new LoadingModal(data).show($modalCnt);
        modals.push($loading);
        return $loading;
    }

    function hideLoading() {
        $loading.hide();
        var i = modals.indexOf($loading);
        if (i >= 0) {
            modals.splice(i, 1);
        }
        delete $loading;
        if (modals.length <= 0) {
            $modalCnt.hide();
        }
    }

    // init
    $modalCnt = $(config.ui.modalsParentSelector);
    if (!$modalCnt || $modalCnt.length == 0) {
        log('Element '+config.ui.modalsParentSelector+' doesn\'t exist', true);
    }

    // public methods below
    global.showLoading = showLoading;
    global.hideLoading = hideLoading;

})(Modal);
