/**
 * Created by artyom.grishanov on 04.05.17.
 */

var workspace = {};
(function(global) {

    var selectionTemplate = null,
        $controlContainer = null,
        $selection = null,
        $selectedElementOnAppScreen = null,
        $productCnt = null;

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
            $('#id-hor_scroll_left').click(function(){
                $productCnt.scrollLeft($productCnt.scrollLeft() - 100);
            });
            $('#id-hor_scroll_right').click(function(){
                $productCnt.scrollLeft($productCnt.scrollLeft() + 100);
            });
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