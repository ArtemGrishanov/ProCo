/**
 * Created by artyom.grishanov on 04.05.17.
 *
 * 1) При клике на связанные элементы рисовать обводку, кидать колбек, что был произведен клик на связанном элементе
 * 2) Обрабатывать разный размер приложения и если надо организовать прокрутку.
 * 3) Панель быстрых контролов quickcontrolpanel
 * 4) Показывать экран в рабочем поле?
 */
var Workspace = {
    EVENET_SELECT_ELEMENT: 'event_select_element',
    EVENET_CONTROL_POPUP_SHOWED: 'event_control_popup_showed',
    EVENET_CONTROL_POPUP_HIDED: 'event_control_popup_hided',
    EVENET_QUICK_PANEL_SHOWED: 'event_quick_panel_showed',
    EVENET_QUICK_PANEL_HIDED: 'event_quick_panel_hided'
};

(function(global) {

    var
        selectionTemplate = null,
        $controlContainer = null,
        $selection = null,
        $selectedElementOnAppScreen = null,
        $productCnt = null,
        $productIframeCnt = null,
        appSize = null,//{width: 800, height: 600},
        /**
         * Шаг горизонтальной прокрутки продукта, когда он шире чем workspace
         *
         * @type {number}
         */
        HOR_SCROLL_STEP = 200,
        /**
         * Значит что события onclick привязаны к кнопкам горизонтальной прокрутки
         * Во избежание повторной привязки
         *
         * @type {boolean}
         */
        horScrollEventsBinded = false,
        /**
         * Слинкованные элементы (у которых есть data-app-property и который в списке _linkedMutAppProperties),
         * для которых уже зарегистрированы обработчики
         *
         * Пример, _registeredElements['startScr'] = [e1,e2...]
         *
         * @type {}
         */
        _registeredElements = {},
        /**
         * Колбек о событиях в этом классе, например будет зваться когда пользователь кликает на один из зарегистрированных элементов
         * @type {DOMElement}
         * @private
         */
        _onEventsCallback = null,
        /**
         * Только для отладки и тестирования
         * Запретить навешивать обработчики на элементы с такими значениями data-app-property, например 'id=startScr backgroundImg, id=startScr shadowEnable'
         *
         * @type {Array}
         * @private
         */
        _ignoreDataAppPropertyAttribute = [],
        /**
         * Панелька с контролами, которая всплывает рядом с элементом и указывает на него
         * @type {QuickControlPanel}
         */
        quickControlPanel = null,
        /**
         * Панелька popup с контролами, всплывает поверх редактора
         * @type {PopupControlPanel}
         */
        popupControlPanel = null;

    /**
     * Выделить элемент на экране приложения.
     * Будет нарисована рамка с маркерами по углам.
     * Поддерживается выделение только одного элемента.
     *
     * @private
     * @param {DOMElement} $elementOnAppScreen
     */
    function selectElementOnAppScreen($elementOnAppScreen) {
        $selectedElementOnAppScreen = $elementOnAppScreen;
        if ($selectedElementOnAppScreen === null) {
            // сброс выделения
            if ($selection) {
                $selection.hide();
            }
        }
        else {
            if ($selection === null) {
                $selection = $(selectionTemplate);
                $selection.css('zIndex', config.editor.ui.selectionBorderZIndex);
            }
            var eo = $selectedElementOnAppScreen.offset(); // position() не подходит в данном случае
            $selection.css('top',eo.top+'px');
            $selection.css('left',eo.left+'px');
            $selection.css('width',$selectedElementOnAppScreen.outerWidth(false)-1+'px'); // false - not including margins
            $selection.css('height',$selectedElementOnAppScreen.outerHeight(false)-1+'px');
            $selection.show();
            $controlContainer.append($selection);
        }
        if (_onEventsCallback) {
            _onEventsCallback(Workspace.EVENET_SELECT_ELEMENT, {
                dataAppPropertyString: $selectedElementOnAppScreen ? $selectedElementOnAppScreen.attr('data-app-property'): null
            });
        }
    }

    /**
     * Обновить положение и размер выделения
     */
    function updateSelection() {
        if ($selection && $selectedElementOnAppScreen) {
            var eo = $selectedElementOnAppScreen.offset(); // position() не подходит в данном случае
            $selection.css('top',eo.top+'px');
            $selection.css('left',eo.left+'px');
            $selection.css('width',$selectedElementOnAppScreen.outerWidth(false)-1+'px'); // false - not including margins
            $selection.css('height',$selectedElementOnAppScreen.outerHeight(false)-1+'px');
            if (quickControlPanel.isShown() === true) {
                quickControlPanel.updatePosition($selectedElementOnAppScreen);
            }
        }
    }

    /**
     * Инициализация средств прокрутки экранов проекта
     *
     * Содержимое #id-product_cnt может быть гораздо больше чем 800 по ширине
     * Например, горизонтальная панорама
     */
    function _updateProductCntScroll() {
        // в .product_wr в стилях стоит 800 ширина, это фиксированная видимая ширина проекта, а внутри по горизонтали может быть прокрутка
        if (appSize.width > config.editor.ui.productWrapperWidth) {
            $productCnt.css('overflow-x', 'scroll');
            $('#id-hor_scroll_left, #id-hor_scroll_right').show();
            if (horScrollEventsBinded !== true) {
                $('#id-hor_scroll_left').click(function() {
                    $productCnt.animate({scrollLeft: $productCnt.scrollLeft() - HOR_SCROLL_STEP}, 333);
                });
                $('#id-hor_scroll_right').click(function() {
                    $productCnt.animate({scrollLeft: $productCnt.scrollLeft() + HOR_SCROLL_STEP}, 333);
                });
                horScrollEventsBinded = true;
            }
        }
        else {
            $productCnt.css('overflow-x', 'visible');
            $('#id-hor_scroll_left, #id-hor_scroll_right').hide();
        }
    }

    function handleCreateScreen(param) {
        // do nothing
    }

    /**
     *
     * @param {MutApp.Screen} param.screen
     */
    function handleDeleteScreen(param) {
        _deleteRegisteredElement(param.screen.id);
    }

    /**
     *
     * @param {MutApp.Screen} param.screen
     */
    function handleRenderScreen(param) {
        _deleteRegisteredElement(param.screen.id);
    }

    /**
     * Удалить click-обработчики и data-app-property элементы
     *
     * @param {string} screenId
     * @private
     */
    function _deleteRegisteredElement(screenId) {
        if (_registeredElements.hasOwnProperty(screenId)) {
            var $e = null;
            for (var i = 0; i < _registeredElements[screenId].length; i++) {
                $e = $(_registeredElements[screenId][i]);
                $e.off('click', _onRegisteredElementClick);
            }
            delete _registeredElements[screenId];
        }
    }

    /**
     * Пользователь кликнул на один из элементов на экране, связанных с MutAppProperty
     *
     * @param {Event} e
     * @private
     */
    function _onRegisteredElementClick(e) {
        selectElementOnAppScreen($(e.currentTarget));
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * Элементы связанные с MutAppProperty на экране, навесить на них обработчики
     *
     * @param {MutApp.Screen} param.screen
     */
    function handleShowScreen(param) {
        param = param || {};
        if (param.screen) {
            if (_registeredElements.hasOwnProperty(param.screen.id) === false) {
                // возможно, это первый показ этого экрана после рендера, еще не добавляли обработчики
                _registeredElements[param.screen.id] = [];
            }
            var regElems = _registeredElements[param.screen.id];
            //привязка элементов на экране приложения и контролов
            if (param.screen._linkedMutAppProperties) {
                // для всех свойств прилинкованных к экрану
                for (var i = 0; i < param.screen._linkedMutAppProperties.length; i++) {
                    var ap = param.screen._linkedMutAppProperties[i];
                    // для отладки нужна была возможность исключать некоторые data-app-property
                    if (_ignoreDataAppPropertyAttribute.length > 0 && _ignoreDataAppPropertyAttribute.indexOf($(ap.uiElement).attr('data-app-property')) >= 0) {
                        continue;
                    }

                    var linkedElements = ap.getLinkedElementsOnScreen(param.screen.id);
                    for (var n = 0; n < linkedElements.length; n++) {
//                        if (ap.propertyString === 'id=mm pins') {
//                            window.pinsLinkedElem = linkedElements[0];
//                            $(window.pinsLinkedElem).click(function(){console.log('clk')});
//                        }
                        // проверка что к этому элемент уже привязан клик, так как на одном элементе много свойств может быть завязано
                        if (regElems.indexOf(linkedElements[n]) < 0) {
                            $(linkedElements[n]).click(_onRegisteredElementClick);
                            regElems.push(linkedElements[n]);
                        }
                    }
                }
            }
            else {
                //throw new Error('workspace.filter: screen \'' + param.screen.id + '\' does not have linkedMutAppProperties. Maybe you forgot request renderCompleted().');
                console.warn('workspace.filter: screen \'' + param.screen.id + '\' does not have linkedMutAppProperties. Maybe you forgot request renderCompleted().');
            }
        }
        else {
            throw new Error('workspace.filter: screen does not specified');
        }
    }

    /**
     * Обработать изменение размера приложения
     *
     * @param {Number} param.width
     * @param {Number} param.height
     */
    function setAppSize(param) {
        if (isNumeric(param.width) !== true) {
            throw new Error('Workspace: width is not specified');
        }
        if (isNumeric(param.height) !== true) {
            throw new Error('Workspace: height is not specified');
        }
        appSize = {
            width: param.width,
            height: param.height
        };
        // $productCnt.width(appSize.width); - ширина этого контейнара должна быть не более config.editor.ui.productWrapperWidth: 800 чтобы обеспечить горизонтальную прокрутку
        $productCnt.height(appSize.height + config.editor.ui.scrollBarHeight); // задача сделать по вертикали видимым всё приложение без прокрутки и т.п.
        $productIframeCnt.width(appSize.width).height(appSize.height);
        $productIframeCnt.find('iframe').css('max-width', appSize.width+'px'); // изначально стили этого iframe ставятся в editorLoader.startApp()
        $('#id-control_cnt').width(appSize.width).height(appSize.height);
        _updateProductCntScroll();
    }

    /**
     * Атрибуты квик контрола были изменены, сообщаем об этом квик панели, чтобы она, возможно,
     * произвела какие-то действия (сортировка и т.п.)
     *
     * @param control
     */
    function handleQuickControlPropertiesChanged(control) {
        quickControlPanel.updateControl(control);
    }

    /**
     * Показать панельку с быстрыми контролами
     */
    function showQuickControlPanel() {
        if ($selectedElementOnAppScreen) {
            if (quickControlPanel.isShown() === false) {
                // только если есть выделенный элемент, рядом с которым показывается панелька
                quickControlPanel.show($selectedElementOnAppScreen);
                if (_onEventsCallback) {
                    _onEventsCallback(Workspace.EVENET_QUICK_PANEL_SHOWED, {
                        dataAppPropertyString: $selectedElementOnAppScreen ? $selectedElementOnAppScreen.attr('data-app-property'): null
                    });
                }
            }
            else {
                quickControlPanel.updatePosition($selectedElementOnAppScreen);
            }
        }
    }

    /**
     * Скрыть панельку с быстрыми контролами
     */
    function hideQuickControlPanel() {
        if (quickControlPanel.isShown() === true) {
            quickControlPanel.hide();

            if (_onEventsCallback) {
                _onEventsCallback(Workspace.EVENET_QUICK_PANEL_HIDED, {
                    dataAppPropertyString: $selectedElementOnAppScreen ? $selectedElementOnAppScreen.attr('data-app-property'): null
                });
            }
        }
    }

    /**
     * Показать контейнер с контролами-popup
     */
    function showPopupControlsContainer() {
        if (popupControlPanel.isShown() === false) {
            // контролы внутри контейнера как положено фильтруются в ControlManager
            popupControlPanel.show();

            if (_onEventsCallback) {
                _onEventsCallback(Workspace.EVENET_CONTROL_POPUP_SHOWED, {
                    dataAppPropertyString: $selectedElementOnAppScreen ? $selectedElementOnAppScreen.attr('data-app-property'): null
                });
            }
        }
    }

    /**
     * Скрыть контейнер с контролами-popup
     */
    function hidePopupControlsContainer() {
        if (popupControlPanel.isShown() === true) {
            popupControlPanel.hide();

            if (_onEventsCallback) {
                _onEventsCallback(Workspace.EVENET_CONTROL_POPUP_HIDED, {
                    dataAppPropertyString: $selectedElementOnAppScreen ? $selectedElementOnAppScreen.attr('data-app-property'): null
                });
            }
        }
    }

    /**
     * Внутри popupControlPanel произошел клик на кнопку закрытия, popupControlPanel просит закрыть его
     * @private
     */
    function _onPopupControlNeedToClose() {
        hidePopupControlsContainer();
    }

    /**
     * Инициализация
     *
     * @param {function} param.onSelectElementCallback
     */
    function init(param) {
        param = param || {};
        $productCnt = $('#id-product_cnt');
        $productIframeCnt = $('#id-product_iframe_cnt');
        $controlContainer = $('#id-control_cnt');
        selectionTemplate = $('#id-elem_selection_template').html();
        _onEventsCallback = param.onWorkspaceEvents;
        quickControlPanel = new QuickControlPanel();
        popupControlPanel = new PopupControlPanel({
            closeCallback: _onPopupControlNeedToClose
        });
        // этим новым селектором расширил области клика для сброса выделения. Должно работать на всем редакторе
        //  $('#id-editor_view').click(function(){
        // Нельзя использовать #id-editor_view, так как сценарий "выделить текст" -> "изменить шрифт" не работает
        // любой клик на боковую панель сбрасывает выделение
        $('#id-workspace').click(function(){
            // любой клик по документу сбрасывает фильтр контролов
            selectElementOnAppScreen(null);
        });
    }

    global.init = init;

    global.handleShowScreen = handleShowScreen;
    global.handleRenderScreen = handleRenderScreen;
    global.handleDeleteScreen = handleDeleteScreen;
    global.handleQuickControlPropertiesChanged = handleQuickControlPropertiesChanged;

    global.setAppSize = setAppSize;
    global.selectElementOnAppScreen = selectElementOnAppScreen;
    global.updateSelection = updateSelection;
    global.showQuickControlPanel = showQuickControlPanel;
    global.hideQuickControlPanel = hideQuickControlPanel;
    global.getSelectedElement = function() { return $selectedElementOnAppScreen; }
    global.showPopupControlsContainer = showPopupControlsContainer;
    global.hidePopupControlsContainer = hidePopupControlsContainer;
    global.getQuickControlPanel = function() { return quickControlPanel; }

    global._registeredElements = _registeredElements; // for autotests, inspector

})(Workspace);