/**
 * Created by artyom.grishanov on 25.02.16.
 *
 * Контрол управления порядком элементов в массиве
 */
function ArrayControl(propertyString, directiveName, $parent, productDOMElement, params) {
    var ap = Engine.getAppProperty(propertyString);
    if (ap) {
        if (Array.isArray(ap.propertyValue) === false) {
            log('ArrayControl requires array properties: \''+propertyString+'\'', true);
            return;
        }
        if (ap.propertyValue && ap.propertyValue.length !== params.items.length) {
            log('Property value length and items length are different', true);
            return;
        }
    }
    else {
        log('AppProperty doesnot exist', true);
    }
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    //TODO надо высчитать вместе с отступами
    var elemWidth = 166;
    //TODO ширина промежуточной кнопки, надо высчитьывать программно
    var btnWidth = 23;
    this.insertButtons = [];

    // свойства необходимые для перетаскивания
    this.originZIndex = undefined;
    this.draggingElement = null;
    this.draggingElementId = null;
    this.isDragging = false;
    this.elemPosition = null;
    this.startPosition = null;
    this.startMousePosition = null;
    this.propertyValueMap = null;

    this.loadDirective(function(response, status, xhr){
        if (this.params.groupLabel) {
            this.$directive.find('.js-slide_group_name').text(this.params.groupLabel);
        }
        if (this.params.items) {
            var itemWrapperTemplate = this.$directive.find('.js-item_wr_template').html();
            var interimBtnTemplate = this.$directive.find('.js-interim_btn_template').html();
            var $cnt = this.$directive.find('.js-slides_cnt');
            var l = 0;
            this.leftPositions = [];
            this.items = [];
            this.insertButtons = [];
            for (var i = 0; i < this.params.items.length; i++) {
                var dataId = Math.random().toString();
                // обертка для элемента, чтобы его можно было перетаскивать
                var $wr = $(itemWrapperTemplate).attr('data-id',dataId);
                // надо запомнить все позиции на которых стоят слайды, потом будет двигать по ним
                this.leftPositions.push(l);
                this.items.push($wr);
                $wr.css('left',l+'px').find('.js-item').append(this.params.items[i]);
                $wr.appendTo($cnt);
                $wr.mousedown(this.onMouseDown.bind(this));
                $wr.find('.js-delete').attr('data-id',dataId).click(this.onDeleteItemClick.bind(this));
                $wr.find('.js-clone').attr('data-id',dataId).click(this.onCloneItemClick.bind(this));
                l += elemWidth;
                // добавляем промежуточные кнопки для быстрого добавления элемента в нужную позицию
                if (i < this.params.items.length-1) {
                    l += config.editor.ui.slideInterimBtnMargins;
                    var $ib = $(interimBtnTemplate).css('left',l+'px').attr('data-insert-index',i+1).click(this.onInsertButtonClick.bind(this));
                    $cnt.append($ib);
                    this.insertButtons.push($ib);
                    l += (btnWidth+config.editor.ui.slideInterimBtnMargins);
                }
            }
            $(document).mousemove(this.onMouseMove.bind(this));
            $(document).mouseup(this.onMouseUp.bind(this));
            $cnt.css('width',l);
            // границы координаты left в рамках который позволен drag
            this.bounds = {minLeft:-config.editor.ui.slideGroupLeftDragMargin, maxLeft:l-elemWidth+config.editor.ui.slideGroupRightDragMargin};
        }
        var $addBtn = this.$directive.find('.js-add');
        if (this.params.showAddButton === true) {
            // показывать ли кнопку добавления в конце
            $addBtn.show().click((function(){
                this.addNewItem();
            }).bind(this));
        }
        else {
            $addBtn.hide();
        }
    });
    /**
     *
     * @param position
     * @param newItem может быть указан (при клонировании) или не указан
     */
    this.addNewItem = function(position, newItem) {
        // если позиция не задана элемент будет добавлен в конец массива
        var p = (Number.isInteger(position)===true)?position:undefined;
        var ap = Engine.getAppProperty(this.propertyString);
        var pp = Engine.getPrototypesForAppProperty(ap);
        if (!newItem) {
            // нужно выбрать прототип для нового элемента
            if (pp && pp.length > 0) {
                //TODO если доступен один прототип то не надо диалога, сразу добавить
                var selectOptions = [];
                for (var i = 0; i < pp.length; i++) {
                    selectOptions.push({
                        id: pp[i].uiTemplate,
                        label: 'Вариант ' + i
                    });
                }
                showSelectDialog({
                    caption: 'Новый слайд',
                    options: selectOptions,
                    callback: (function(selectedOptionId) {
                        if (selectedOptionId) {
                            //TODO refactor
                            for (var j = 0; j < pp.length; j++) {
                                if (pp[j].uiTemplate == selectedOptionId) {
                                    Engine.addArrayElement(ap, pp[j], p);
                                    if (ap.updateScreens === true) {
                                        activeScreens = [];
                                        syncUIControlsToAppProperties();
                                    }
                                }
                            }
                        }
                    }).bind(this)
                });
                //newItem = pp[0];
            }
            else {
                log('There is no prototypes for \''+this.propertyString+'\'', true);
                return;
            }
        }
        if (newItem) {
            // newItem определили (из прототипа либо склонировали)
            Engine.addArrayElement(ap, newItem, p);
            if (ap.updateScreens === true) {
                //TODO запросить показ нового добавленного экрана, сейчас старый активен
                activeScreens = [];
                //TODO почему этот синк руками нельзя вызвать?
                syncUIControlsToAppProperties();
            }
        }
    };
    /**
     * Клонирование - создание нового без выбора прототипа, копирование существующего элемента
     * В самом AppProperty есть функция получения копии
     * @param itemId
     */
    this.cloneItem = function(itemId) {
        var clonedItemIndex = this.getItemIndexById(itemId);
        var ap = Engine.getAppProperty(this.propertyString);
        // копируем указанный элемент массива
        var newItem = ap.getArrayElementCopy(clonedItemIndex);
        // далее обычное добавление, но без выбора прототипа
        this.addNewItem(clonedItemIndex+1, newItem);
    };
    this.onInsertButtonClick = function(e) {
        var insertIndex = parseInt($(e.currentTarget).attr('data-insert-index'));
        this.addNewItem(insertIndex);
    };
    this.onDeleteItemClick = function(e) {
        var dataId = $(e.currentTarget).attr('data-id');
        var deleteIndex = this.getItemIndexById(dataId);
        this.deleteItem(deleteIndex);
    };
    this.onCloneItemClick = function(e) {
        var dataId = $(e.currentTarget).attr('data-id');
        this.cloneItem(dataId);
    };
    this.deleteItem = function(position) {
        if (position >= 0) {
            var p = Engine.getAppProperty(this.propertyString);
            Engine.deleteArrayElement(p, position);
            if (ap.updateScreens === true) {
                //TODO запросить показ ближайшего экрана, предыдущего от удаленного
                activeScreens = [];
                syncUIControlsToAppProperties();
            }
        }
    };
    this.onMouseDown = function(e) {
        this.draggingElement = $(e.currentTarget);
        this.draggingElementId = this.draggingElement.attr('data-id');
        this.elemPosition = null;
        this.isDragging = true;
        this.startPosition = $(e.currentTarget).position();
        this.startMousePosition = {
            left: e.pageX,
            top: e.pageY
        };
    };
    this.onMouseMove = function(e) {
        if (this.isDragging === true && this.draggingElement) {
            if (this.originZIndex === undefined) {
                this.originZIndex = this.draggingElement.css('zIndex');
                this.draggingElement.css('zIndex',config.editor.ui.arrayControlDragZIndex);
            }
            if (this.propertyValueMap === null) {
                var ap = Engine.getAppProperty(propertyString);
                if (ap.propertyValue.length !== this.items.length) {
                    log('Property value length and items length are different', true);
                    return;
                }
                this.propertyValueMap = [];
                // запоминаем соответствие порядка между элементами appProperty и вью в этом контроле
                // проверка будет позднее в конце перетаскивания
                for (var i = 0; i < ap.propertyValue.length; i++) {
                    this.propertyValueMap.push({
                        valueElem: ap.propertyValue[i],
                        item: this.items[i]
                    });
                }
            }
            this.elemPosition = {
                top: (e.pageY-this.startMousePosition.top)+this.startPosition.top,
                left: (e.pageX-this.startMousePosition.left)+this.startPosition.left
            };
            if (this.bounds.minLeft > this.elemPosition.left) {
                this.elemPosition.left = this.bounds.minLeft;
            } else if (this.bounds.maxLeft < this.elemPosition.left) {
                this.elemPosition.left = this.bounds.maxLeft;
            }
            //TODO параметром - по какой оси перетаскивать
            //this.draggingElement.css('top', this.elemPosition.top+'px');
            this.draggingElement.css('left', this.elemPosition.left+'px');
        }
    };
    this.onMouseUp = function(e) {
        if (this.isDragging === true) {
//            var ap1 = Engine.getAppProperty(this.propertyString);
//            Engine.setValue(ap1, this.elemPosition);
            this.draggingElement.css('zIndex', this.originZIndex);
            this.originZIndex = undefined;
            this.draggingElement = null;
            this.draggingElementId = null;
            this.isDragging = false;
            this.arrangeViews();
            if (this.isOrderWasChanged() === true) {
                // изменили порядок при перетаскиввании, надо изменить теперь свойство
                this.setValue();
            }
            this.propertyValueMap = null;
        }
    };
    /**
     * Функция проверки новой позиции, можно ли перетаскиваемый элемент поместить в какое-то новое место.
     * Если да, помещает и переупорядочивает view
     */
    this.checkPos = function() {
        if (this.isDragging === true && this.elemPosition){
            if (this.moveInNewPosition(this.draggingElementId,this.elemPosition.left) === true) {
                this.arrangeViews();
            }
        }
    },
    // таймер на проверку новой позиции при перетаскивании
    setInterval(this.checkPos.bind(this),100);
    /**
     * Проверить, можно ли поместить элемент в новую позицию
     * Если да, поместить. Изменяется массив this.items. Вьюхи позже
     * @return true если да
     */
    this.moveInNewPosition = function(id, leftE) {
        for (var i = 0; i < this.items.length; i++) {
            //TODO ids cache
            if (id != this.items[i].attr('data-id')) {
                //TODO не получать а кешировать
                var l = parseInt(this.items[i].css('left'));
                if (Math.abs(l-leftE)<elemWidth/2) {
                    var prevPos = this.getItemIndexById(id);
                    this.items.swap(i,prevPos);
                    return true;
                }
            }
        }
        return false;
    },
    this.getItemIndexById = function(id){
        for (var i = 0; i < this.items.length; i++) {
            if (id === this.items[i].attr('data-id')) {
                return i;
            }
        }
        return -1;
    },
    /**
     * Расположить элементы slide_directive_wr, которые хранятся в массиве this.items
     * по позициям в this.leftPositions
     */
    this.arrangeViews = function() {
        for (var i = 0; i < this.leftPositions.length; i++) {
            // упорядочиваем все элементы, кроме того, что сейчас перетаскиваем. Он должен следовать за курсором
            if (this.draggingElementId !== this.items[i].attr('data-id')) {
                this.items[i].css('left',this.leftPositions[i]+'px');
            }
        }
    },
    this.onAddQuickButtonClick = function(e) {
        var ap = Engine.getAppProperty(this.propertyString);
        var pp = Engine.getPrototypesForAppProperty(ap);
        if (pp && pp.length > 0) {
            var protoIndex = params.prototypeIndex || 0;
            Engine.addArrayElement(ap, pp[protoIndex]);
            if (ap.updateScreens === true) {
                syncUIControlsToAppProperties();
            }
        }
        else {
            log('There is no prototypes for \''+this.propertyString+'\'', true);
        }
    },
    /**
     * Проверить соответствие элементов перед началом перетаскивания и после
     */
    this.isOrderWasChanged = function() {
        if (this.propertyValueMap) {
            for (var i = 0; i < this.propertyValueMap.length; i++) {
                if (this.propertyValueMap[i].item !== this.items[i]) {
                    // значит элементы были переставлены местами
                    // надо собрать новый массив и установить новое значение appProperty
                    // TODO нужен lock на appProperty чтобы его не могли изменить другие контролы, тесты и так далее
                    // TODO так как операция редактирования может быть очень длинной и в это время что-то может произойти со значением свойства

                    return true;
                }
            }
        }
        return false;
    },
    /**
     * Сделать новый массив, с новым порядком элементов, и установить его в appProperty
     */
    this.setValue = function() {
        var newValue = [];
        for (var i = 0; i < this.items.length; i++) {
            for (var j = 0; j < this.propertyValueMap.length; j++) {
                if (this.items[i] === this.propertyValueMap[j].item) {
                    newValue[i] = this.propertyValueMap[j].valueElem;
                    break;
                }
            }
        }
        var ap = Engine.getAppProperty(this.propertyString);
        //TODO важно: здесь должно быть updateScreens:false, иначе произойдет пересборка экранов и перемещения заметно не будет
        // а делать пересборку такого большого контрола ArrayControl невозможно
        Engine.setValue(ap, newValue, {updateScreens:false});
    }
}
ArrayControl.prototype = AbstractControl;
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function ArrayControlController(scope, attrs) {

}