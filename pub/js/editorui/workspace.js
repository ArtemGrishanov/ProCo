/**
 * Created by artyom.grishanov on 04.05.17.
 *
 * 1) При клике на связанные элементы рисовать обводку, кидать колбек, что был произведен клик на связанном элементе
 * 2) Обрабатывать разный размер приложения и если надо организовать прокрутку.
 * 3) Панель быстрых контролов quickcontrolpanel
 * 4) Показывать экран в рабочем поле?
 */
var workspace = {};
(function(global) {

    var selectionTemplate = null,
        $controlContainer = null,
        $selection = null,
        $selectedElementOnAppScreen = null,
        $productCnt = null,
        /**
         * Шаг горизонтальной прокрутки продукта, когда он шире чем workspace
         *
         * @type {number}
         */
        HOR_SCROLL_STEP = 100,
        /**
         * Значит что события onclick привязаны к кнопкам горизонтальной прокрутки
         * Во избежание повторной привязки
         *
         * @type {boolean}
         */
        horScrollEventsBinded = false,
        /**
         * Элементы, для которых уже зарегистрированы обработчики
         * Пример, _registeredElements['startScr'] = [e1,e2...]
         *
         * @type {}
         */
        _registeredElements = {},
        /**
         * Колбек который будет зваться когда пользователь кликает на один из зарегистрированных элементов
         * @type {DOMElement}
         * @private
         */
        _onSelectElementCallback = null,
        /**
         * Только для отладки и тестирования
         * Запретить навешивать обработчики на элементы с такими значениями data-app-property, например 'id=startScr backgroundImg, id=startScr shadowEnable'
         *
         * @type {Array}
         * @private
         */
        _ignoreDataAppPropertyAttribute = [];

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
        if (_onSelectElementCallback && $selectedElementOnAppScreen) {
            _onSelectElementCallback($selectedElementOnAppScreen.attr('data-app-property'));
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
        }
    }

    /**
     * Инициализация средств прокрутки экранов проекта
     *
     * Содержимое #id-product_cnt может быть гораздо больше чем 800 по ширине
     * Например, горизонтальная панорама
     *
     * @param {number} param.width
     * @param {number} param.height
     */
    function _updateProductCntScroll(param) {
        //$('#id-product_screens_cnt').width() - не успавает отрендериться иногда и возвращает неактуальныый размер
        var productScreenWidth = param.width;
        var productCntWidth = $productCnt.width();

        if (productCntWidth < productScreenWidth) {
            $('#id-hor_scroll_left, #id-hor_scroll_right').show();
            if (horScrollEventsBinded !== true) {
                $('#id-hor_scroll_left').click(function() {
                    $productCnt.scrollLeft($productCnt.scrollLeft() - HOR_SCROLL_STEP);
                });
                $('#id-hor_scroll_right').click(function() {
                    $productCnt.scrollLeft($productCnt.scrollLeft() + HOR_SCROLL_STEP);
                });
                horScrollEventsBinded = true;
            }
        }
        else {
            $('#id-hor_scroll_left, #id-hor_scroll_right').hide();
        }
    }

    function createScreen(param) {
        // do nothing
    }

    function deleteScreen(param) {
        _deleteRegisteredElement(param.screen.id);
    }

    function renderScreen(param) {
        _deleteRegisteredElement(param.screen.id);
    }

    function _deleteRegisteredElement(screenId) {
        if (_registeredElements.hasOwnProperty(screenId)) {
            var $e = null;
            for (var i = 0; i < _registeredElements[screenId].length; i++) {
                $e = _registeredElements[screenId][i];
                $e.off();
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

            //TODO чистить прежние элементы и их обработчики

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
                    // проверка что к этому элемент уже привязан клик, так как на одном элементе много свойств может быть завязано
                    if (regElems.indexOf(ap.uiElement) < 0) {
                        $(ap.uiElement).click(_onRegisteredElementClick);
                        regElems.push(ap.uiElement);
                    }
                }
            }
            else {
                throw new Error('workspace.filter: screen \'' + param.screen.id + '\' does not have linkedMutAppProperties');
            }
        }
        else {
            throw new Error('workspace.filter: screen does not specified');
        }
    }

    /**
     * Обработать изменение размера приложения
     *
     * @param param.width
     * @param param.height
     */
    function setAppSize(param) {
        _updateProductCntScroll(param);
    }

    /**
     * Инициализация
     *
     * @param {function} param.onSelectElementCallback
     */
    function init(param) {
        param = param || {};
        $productCnt = $('#id-product_cnt');
        $controlContainer = $('#id-control_cnt');
        selectionTemplate = $('#id-elem_selection_template').html();
        _onSelectElementCallback = param.onSelectElementCallback;
        $('#id-workspace').click(function(){
            // любой клик по документу сбрасывает фильтр контролов
            selectElementOnAppScreen(null);
        });
    }

    global.init = init;
    global.handleShowScreen = handleShowScreen;
    global.setAppSize = setAppSize;
    global.selectElementOnAppScreen = selectElementOnAppScreen;
    global.updateSelection = updateSelection;
    global.getSelectedElement = function() { return $selectedElementOnAppScreen; }

})(workspace);