/**
 * Created by artyom.grishanov on 04.05.17.
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
        horScrollEventsBinded = false;

    /**
     * Выделить элемент на экране приложения.
     * Будет нарисована рамка с маркерами по углам.
     * Поддерживается выделение только одного элемента.
     *
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
    }

    /**
     * Обновить положение и размер выделения
     */
    function updateSelectionPosition() {
        if ($selection) {
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
     */
    function updateProductCntScroll() {
        //$('#id-product_screens_cnt').width() - не успавает отрендериться иногда и возвращает неактуальныый размер
        var productScreenWidth = Engine.getApp().width;
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

    /**
     * Инициализация
     */
    function init(params) {
        $productCnt = $('#id-product_cnt');
        $controlContainer = $('#id-control_cnt');
        selectionTemplate = $('#id-elem_selection_template').html();
        Engine.on('AppSizeChanged', null, function() {
            updateProductCntScroll();
        });
    }

    global.init = init;
    global.selectElementOnAppScreen = selectElementOnAppScreen;
    global.updateSelectionPosition = updateSelectionPosition;

})(workspace);