/**
 * Created by artyom.grishanov on 01.09.17.
 */

var ScreenManager = {
    EVENT_SCREEN_SELECT: 'ScreenManager.EVENT_SCREEN_SELECT',
    EVENT_ADD_SCREEN: 'ScreenManager.EVENT_ADD_SCREEN',
    EVENT_DELETE_SCREEN: 'ScreenManager.EVENT_DELETE_SCREEN',
    EVENT_CHANGE_POSITION: 'ScreenManager.EVENT_CHANGE_POSITION',
    EVENT_CLONE_SCREEN: 'ScreenManager.EVENT_CLONE_SCREEN'
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
    var _onScreenEventsCallback = null;
    /**
     * Таймер для запуска проверки на показ стрелок прокрутки при изменении размеров окна
     * @type {null}
     */
    var _resizeWindowTimerId = null;
    var _$slidesCnt = null;
    var _slidesCntSpeed = 0;

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
        var sgPropertyString = screen.arrayAppPropertyString || ('__slideGroup__'+screen.id);
        if (_findSlideGroupByPropertyString(sgPropertyString) === true) {
            throw new Error('ScreenManager._createScreenGroup: ScreenGroupControl with propertyString \''+sgPropertyString+' already exists. Can not create ScreenGroupControl with the same name');
        }
        if (_findSlideGroupByGroupName(screen.group) === true) {
            throw new Error('ScreenManager._createScreenGroup: ScreenGroupControl with groupName \''+screen.group+' already exists. Can not create ScreenGroupControl with the same name');
        }
        if (_findSlideByScreenName(sgPropertyString) === true) {
            throw new Error('ScreenManager._createScreenGroup: Slide with name \''+sgPropertyString+' exists. Can not create ScreenGroupControl with the same name');
        }
        var sgc = new SlideGroupControl({
            propertyString: sgPropertyString,
            controlName: 'SlideGroupControl',
            directiveName: 'slidegroupcontrol',
            wrapper: $w,
            container: $cnt,
            controlFilter: 'always',
            additionalParam: {
                groupName: screen.group,
                appType: _appType,
                onScreenEvents: _onScreenEventsLocal
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
     *
     *
     * @param {string} propertyString
     * @returns {*}
     * @private
     */
    function _findSlideGroupByPropertyString(propertyString) {
        if (_slideGroupControls !== null && propertyString) {
            for (var i = 0; i < _slideGroupControls.length; i++) {
                if (_slideGroupControls[i].propertyString == propertyString) {
                    return _slideGroupControls[i];
                }
            }
        }
        return null;
    }

    /**
     * Найти Slide по всем группам _slideGroupControls
     *
     * @param {string} screenName
     * @returns {*}
     * @private
     */
    function _findSlideByScreenName(screenName) {
        if (_slideGroupControls !== null && screenName) {
            for (var i = 0; i < _slideGroupControls.length; i++) {
                var screen = _slideGroupControls[i].getSlideInfo(screenName)
                if (screen) {
                    return screen;
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
            // далее будем добавлять экран и надо проверить что не существует экранов
            if (_findSlideGroupByPropertyString(param.created.id) !== null) {
                throw new Error('ScreenManager.update(created): SlideGroupControl with propertyString \''+param.created.id+'\' already exists. Can not add screen with the same name');
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

        // запланировать на будущее проверки ширины контрола
        _scheduleScreenGroupsArrowStateCheck();
    }

    /**
     * Показать рамку выделения вокруг активного экрана
     *
     * @param {MutApp.Screen} screen
     */
    function showSelectionOnScreen(screen) {
        // рамка выделения активного экрана
        $('#id-slides_cnt').find('.slide_selection').removeClass('__active');
        $('#id-slides_cnt').find('[data-app-property=\"'+screen.id+'\"]').find('.slide_selection').addClass('__active');
    }

    /**
     * Обработка событий от SlideGroupControl
     * Некоторые событи обрабатываются здесь, на уровне ScreenManager
     *
     * @param {string} event
     * @param {data} data
     */
    function _onScreenEventsLocal(event, data) {
        switch (event) {
            case ScreenManager.EVENT_SCREEN_SELECT: {
                // maybe some operations here
                break;
            }
        }
        // пробрасываем событие дальше в редактор
        _onScreenEventsCallback(event, data);
    }

    /**
     * Изменение окна браузера
     */
    function _onWindowResize() {
        _scheduleScreenGroupsArrowStateCheck();
    }

    /**
     * Запланировать проверку по проверке ширины контрола экранов, для показа или непоказа стрелок
     *
     * @private
     */
    function _scheduleScreenGroupsArrowStateCheck() {
        if (_resizeWindowTimerId) {
            clearTimeout(_resizeWindowTimerId);
            _resizeWindowTimerId = null;
        }
        // при изменении размеров окна не надо делать проверку слишком часто
        _resizeWindowTimerId = setTimeout(function() {
            _checkScreenGroupsArrowsState();
            _resizeWindowTimerId = null;
        }, 1000);
    }

    function _slidesArrowControlInterval() {
        if (_slidesCntSpeed > 0) {
            // левая стрелка
            _$slidesCnt.scrollLeft(_$slidesCnt.scrollLeft()+_slidesCntSpeed);
            --_slidesCntSpeed;
        } else if (_slidesCntSpeed < 0) {
            // правая стрелка
            _$slidesCnt.scrollLeft(_$slidesCnt.scrollLeft()+_slidesCntSpeed);
            ++_slidesCntSpeed;
        }
    }

    function _toLeftArrSlideClick() {
        _slidesCntSpeed = -config.editor.ui.slidesScrollSpeed;
    }

    function _toRightArrSlideClick() {
        _slidesCntSpeed = config.editor.ui.slidesScrollSpeed;
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
     * Для тестирования
     *
     * @private
     */
    function _test_getSlideByScreenName(screenName) {
        return _findSlideByScreenName(screenName);
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
        _onScreenEventsCallback = param.onScreenEvents;
        _$slidesCnt = $('#id-slides_cnt');
        _$slidesCnt.empty();
        $(window).resize(_onWindowResize);
        $('.js-slide_arr_left').mousedown(_toLeftArrSlideClick);
        $('.js-slide_arr_right').mousedown(_toRightArrSlideClick);
        setInterval(_slidesArrowControlInterval, 30);
    }

    global.init = init;
    global.update = update;
    global.showSelectionOnScreen = showSelectionOnScreen;

    // для автотестирования
    global._test_getSlideGroupControl = _test_getSlideGroupControl;
    global._test_getSlideGroupControlsCount = _test_getSlideGroupControlsCount;
    global._test_getScreens = _test_getScreens;
    global._test_getSlideByScreenName = _test_getSlideByScreenName;

})(ScreenManager);