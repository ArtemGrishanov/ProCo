/**
 * Created by artyom.grishanov on 01.09.17.
 */

var ScreenManager = {
    EVENT_SCREEN_SELECT: 'ScreenManager.EVENT_SCREEN_SELECT',
    EVENT_ADD_SCREEN: 'ScreenManager.EVENT_ADD_SCREEN',
    EVENT_DELETE_SCREEN: 'ScreenManager.EVENT_DELETE_SCREEN',
    EVENT_CHANGE_POSITION: 'ScreenManager.EVENT_CHANGE_POSITION',
};
(function(global) {

    /**
     * Один контрол для управления экранами промо приложения
     * превью, управления порядком, добавление и удаление
     * @type {Array.<SlideGroupControl>}
     */
    var _slideGroupControls = [];
    /**
     * Тип приложения, например personality, memoriz и тп
     * @type {string}
     * @private
     */
    var _appType = null;
    /**
     * Колбек, куда ScreenManager будет отсылать события: клик на слайд, добавить новый, удалить слайд с позиции и т.п.
     * @type {function}
     * @private
     */
    var _onScreenEvents = null;

    /**
     * Создать новую группу SlideGroupControl на основе экрана
     *
     * @param {MutApp.Screen} screen
     * @private
     * @return {ScreenGroupControl}
     */
    function _createScreenGroup(screen) {
        var $cnt = $('#id-slides_cnt');
        var $w = $('<div style="display:inline-block"></div>');
        var sgc = new SlideGroupControl({
            propertyString: screen.arrayAppPropertyString || screen.id,
            controlName: 'SlideGroupControl',
            directiveName: 'slidegroupcontrol',
            wrapper: $w,
            container: $cnt,
            controlFilter: 'always',
            additionalParam: {
                groupName: screen.group,
                appType: _appType,
                onScreenEvents: _onScreenEvents
            }
        });
        $cnt.append($w);
        _slideGroupControls.push(sgc);
        return sgc;
    }

    /**
     * Найти контрол SlideGroupControl по имени группы экранов
     * Задача не пересоздавать контролы управления экранами - это дорого
     * @param {string} groupName
     * @returns {null}
     */
    function _findSlideGroupByGroupName(groupName) {
        if (_slideGroupControls !== null && groupName) {
            for (var i = 0; i < _slideGroupControls.length; i++) {
                if (_slideGroupControls[i].groupName == groupName) {
                    return _slideGroupControls[i];
                }
            }
        }
        return null;
    }

    /**
     * Сделать проверку на показ стрелок прокрутки панели экранов
     */
    function _checkScreenGroupsArrowsState() {
        if (_slideGroupControls) {
            var sumW = 0;
            for (var i = 0; i < _slideGroupControls.length; i++) {
                if (_slideGroupControls[i].$directive) {
                    sumW += _slideGroupControls[i].$directive.width();
                }
                else {
                    // директивы слайдов могут быть еще не загружены
                    return;
                }
            }
            if ($('#id-slides_cnt').width() < sumW) {
                $('.js-slide_arr_left').show();
                $('.js-slide_arr_right').show();
            }
            else {
                $('.js-slide_arr_left').hide();
                $('.js-slide_arr_right').hide();
            }
        }
    }

    /**
     *
     * @param {MutApp.Screen} param.created
     * @param {MutApp.Screen} param.rendered
     * @param {MutApp.Screen} param.deleted
     * @param {string} cssString - все CssMutAppProperty приложения в виде строки
     */
    function update(param) {
        param = param || {};
        if (param.created) {
            if (!param.cssString) {
                throw new Error('ScreenManager.update(created): cssString does not specified');
            }
            var gc = _findSlideGroupByGroupName(param.created.group);
            if (!gc) {
                gc = _createScreenGroup(param.created);
            }
            gc.addScreen({
                screen: param.created,
                cssString: param.cssString
            });
        }

        if (param.rendered) {
            if (!param.cssString) {
                throw new Error('ScreenManager.update(rendered): cssString does not specified');
            }
            var gc = _findSlideGroupByGroupName(param.rendered.group);
            if (!gc) {
                throw new Error('ScreenManager.update(rendered): group for screen ' + param.rendered.id + ' did not found');
            }
            gc.updateScreen({
                screen: param.rendered,
                cssString: param.cssString
            });
        }

        if (param.deleted) {
            // если это был последний экран в группе, то удалить контрол SlideGroupControl
            var gc = _findSlideGroupByGroupName(param.deleted.group);
            if (!gc) {
                throw new Error('ScreenManager.update(deleted): group for screen ' + param.deleted.id + ' did not found');
            }
            gc.deleteScreen({
                screen: param.deleted
            });
        }
    }

    /**
     * Для автотестирования.
     */
    function _test_getSlideGroupControl(groupName) {
        return _findSlideGroupByGroupName(groupName)
    }
    /**
     * Для автотестирования.
     */
    function _test_getSlideGroupControlsCount() {
        return _slideGroupControls.length;
    }
    /**
     * Для автотестирования.
     */
    function _test_getScreens(grounName) {
        return _findSlideGroupByGroupName(grounName).getScreens();
    }

    /**
     *
     * @param {string} param.appType
     * @param {function} onScreenSelect
     */
    function init(param) {
        param = param || {};
        _slideGroupControls = [];
        _appType = param.appType;
        _onScreenEvents = param.onScreenEvents;
        $('#id-slides_cnt').empty();
    }

    global.init = init;
    global.update = update;

    // для автотестирования
    global._test_getSlideGroupControl = _test_getSlideGroupControl;
    global._test_getSlideGroupControlsCount = _test_getSlideGroupControlsCount;
    global._test_getScreens = _test_getScreens;

})(ScreenManager);