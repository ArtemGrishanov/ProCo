/**
 * Created by artyom.grishanov on 01.09.17.
 */

var ScreenManager = {};
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
     * Колбек, который вызывается из SlideGroupControl при клике на Slide
     * @type {function}
     * @private
     */
    var _onScreenSelect = null;

    /**
     *
     * @param param.mutApp
     * @private
     */
//    function _createScreenControls(param) {
//        param = param || {};
//        if (!param.mutApp) {
//            throw new Error('ScreenManager._createScreenControls: param.mutApp does not specified.');
//        }
//        $('#id-slides_cnt').empty();
//        //TODO конечно не надо пересоздавать каждый раз всё при добавл-удал экрана. Но так пока проще
//        var appScreenIds = param.mutApp.getScreenIds();
//        // экраны могут быть поделены на группы
//        var groups = {};
//        var sGroups = [];
//        if (appScreenIds.length > 0) {
//            // подготовительная часть: разобъем экраны на группы
//            // groups - просто временный вспомогательный объект
//            for (var i = 0; i < appScreenIds.length; i++) {
//                var s = appScreenIds[i];
//                var screen = param.mutApp.getScreenById(s);
//                if (screen.hideScreen === false) {
//                    if (typeof screen.group !== "string") {
//                        // если группа не указана, экран будет один в своей группе
//                        screen.group = screen.id;
//                    }
//                    if (groups.hasOwnProperty(screen.group) === false) {
//                        // группа новая, создаем
//                        groups[screen.group] = [];
//                    }
//                    groups[screen.group].push(s);
//                }
//            }
//
//            // далее начнем создать контролы и вью для групп экранов
//            for (var groupName in groups) {
//                var curG = groups[groupName];
//                var firstScrInGroup = param.mutApp.getScreenById(curG[0]);
//                var sgc = _findSlideGroupByGroupName(groupName);
//                if (sgc === null) {
//                    // группой экранов может управлять массив.
//                    // в случае вопросов теста: эта группа привязана к quiz, передается в промо проекте при создании экранов
//                    // для остальных undefined
////                    sgc = createControl({
////                        someId: firstScrInGroup.arrayAppPropertyString,
////                        controlName: 'SlideGroupControl',
////                        controlParentView:
////                    });
//                    sgc = new SlideGroupControl({
//                        propertyString: firstScrInGroup.arrayAppPropertyString || groupName,
//                        controlName: 'SlideGroupControl',
//                        directiveName: 'slidegroupcontrol',
//                        wrapper: $('<div></div>'),
//                        container: $('#id-slides_cnt'),
//                        controlFilter: 'always'
//                    });
//                    sgc.update();
//                }
//                else {
//                    // подходящий контрол SlideGroupControl создавался ранее для управления этой группой экранов
//                }
//                // устанавливаем все атрибуты, не один раз при создании, а сколько угодно раз
//                sgc.setSettings({
//                    // идентификатор группы
//                    groupName: groupName,
//                    // имя забираем у первого экрана группы, в группе минимум один экран, а все имена одинаковые конечно
//                    groupLabel: firstScrInGroup.name,
//                    // это массив экранов
//                    //screens: curG,
//                    //allowDragY: true,
//                    showAddButton: true
//                });
//                sGroups.push(sgc);
//            }
//            // если при обновлении какие-то группы пропали в приложении, то они не попадут более в slideGroupControls
//            // например для теста будет три группы: стартовый, вопросы, результаты
//            slideGroupControls = sGroups;
//        }
//    }

    /**
     * Создать новую группу SlideGroupControl на основе экрана
     *
     * @param {MutApp.Screen} screen
     * @private
     * @return {ScreenGroupControl}
     */
    function _createScreenGroup(screen) {
        var $cnt = $('#id-slides_cnt');
        var $w = $('<div></div>');
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
                onScreenSelect: _onScreenSelect.bind(this)
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

    // showScreen

    // toDesktopPreview

    // toMobilePreview

    // createScreenControls

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
        _appType = param.appType;
        _onScreenSelect = param.onScreenSelect;
        $('#id-slides_cnt').empty();
    }

    global.init = init;
    global.update = update;

    // для автотестирования
    global._test_getSlideGroupControl = _test_getSlideGroupControl;
    global._test_getSlideGroupControlsCount = _test_getSlideGroupControlsCount;
    global._test_getScreens = _test_getScreens;

})(ScreenManager);