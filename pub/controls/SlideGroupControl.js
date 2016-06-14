/**
 * Created by artyom.grishanov on 25.02.16.
 *
 * Контрол управления группой экранов:
 * 1) Перестановка (drag)
 * 2) Добавление в конец/между
 * 3) Клонирование
 * 4) Удаление
 *
 */
function SlideGroupControl(propertyString, directiveName, $parent, productDOMElement, params) {
    //TODO надо высчитать вместе с отступами
    this._elemWidth = 166;
    this._elemRightPadding = 7;
    //TODO ширина промежуточной кнопки, надо высчитьывать программно
    this._btnWidth = 23;
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
    /**
     * идентификатор группы
     * все slides внутри этого контрола принадлежать одной группе
     */
    this.groupName = null;
    /**
     * Надпись на естественном языке рядом с группой экранов
     * @type {null}
     */
    this.groupLabel = null;
    /**
     * Актуальный на каждый момент массив контролов
     * Именно те что видит пользователь
     * @type {Array.<Slide>}
     */
    this.slides = [];
    /**
     * Вспомогательный массив
     * @type {Array}
     * @private
     */
    this._slidesInfo = [
        //{
        // slide
        // $parent
        // used
        //
        // }
    ];
//    var ap = Engine.getAppProperty(propertyString);
//    if (ap) {
//        if (Array.isArray(ap.propertyValue) === false) {
//            log('ArrayControl requires array properties: \''+propertyString+'\'', true);
//            return;
//        }
//        if (ap.propertyValue && ap.propertyValue.length !== params.items.length) {
//            log('Property value length and items length are different', true);
//            return;
//        }
//    }
//    else {
//        log('AppProperty doesnot exist', true);
//    }
    if (params) {
        this.set(params);
    }

    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    // подписка на событие, которое вызывается после пересборки всех экранов
    Engine.on('AllScreensWereUpdatedBefore', null, this.onAllScreensUpdate.bind(this));

    // загрузка UI контрола
    this.loadDirective(function(response, status, xhr){
        this.updateScreens();
    });

    // таймер на проверку новой позиции при перетаскивании
    setInterval(this.checkPos.bind(this),100);
}

/**
 * Наследуем от абстрактного контрола
 * @type {AbstractControl|*}
 */
SlideGroupControl.prototype = AbstractControl;

/**
 * Групповая установка параметров для контрола
 * @param params
 */
SlideGroupControl.prototype.set = function(params) {
    this.groupName = params.groupName || null;
    this.groupLabel = params.groupLabel || null;
};

/**
 * Обработчик на изменение экрана AllScreensWereUpdated
 *
 */
SlideGroupControl.prototype.onAllScreensUpdate = function() {
    this.updateScreens();
}
/**
 * Обновить экраны на основе информации из Engine
 *
 * У этого контрола есть такие данные:
 * 1) Массив Slide (превью одного экрана), он их сам и создает сколько надо и когда надо
 * 2) Engine.getAppScreenIds()
 * 3) требования к быстродействию:
 *      - перетаскивания, добавления/удаления Slides должны происходить гладко
 */
SlideGroupControl.prototype.updateScreens = function() {
    var appScreenIds = Engine.getAppScreenIds();
    if (appScreenIds.length > 0) {
        // подготовим для использования компоненты
        for (var i = 0; i < this._slidesInfo.length; i++) {
            this._slidesInfo[i].used = false;
        }

        // отсеяли лишние и оставили только экраны с группой this.groupName
        var myScreens = [];
        var myScreenIds = [];
        for (var i = 0; i < appScreenIds.length; i++) {
            var scr = Engine.getAppScreen(appScreenIds[i]);
            if (scr.group === this.groupName) {
                myScreens.push(scr);
                myScreenIds.push(appScreenIds[i]);
            }
        }

        if (myScreens && myScreens.length > 0) {
            this.$directive.find('.js-slide_group_name').text(myScreens[0].name);
        }

        var collapsed = this.isCollapsedScreens(myScreens);
        var draggable = this.isDraggableScreens(myScreens);
        var canAdd = this.canAdd(myScreens);
        var canDelete = this.canDelete(myScreens);
        var canClone = this.canClone(myScreens);

        // смотрим сколько слайдов нам надо под экраны
        //
        var mySlides = [];
        if (collapsed === true) {
            // один контрол нужен
            //slideId = groups[groupName].join(' '); // групповой ид экрана
            //TODO
        }
        else {
            this._items = [];
            for (var i = 0; i < myScreenIds.length; i++) {
                var sId = myScreenIds[i];
                var si = this.useSlide(sId);
                this._items.push(si.$parent);
            }

            //TODO удалить лишние элементв из контейнера, а в буфере можно оставить
            // могут остаться после удаления
        }

        // привести UI контрола в порядок в соответствии с этими данными
        this.arrangeItems({
            collapsed: collapsed,
            draggable: draggable,
            canAdd: canAdd,
            canDelete: canDelete,
            canClone: canClone,
            items: this._items
        });
    }
};

//draggable

/**
 * определение - надо ли сжимать группу или нет
 * если группа "сжата" (collapsed === true) то она представлена одной иконкой.
 * Например, результаты в тесте
 * @param screens
 */
SlideGroupControl.prototype.isCollapsedScreens = function(screens) {
    var result = false;
    for (var i = 0; i < screens.length; i++) {
        if (!!screens[i].collapsed === false) {
            // хотя бы один экран из группы не имеет этого свойства то не сжимаем группу
            break;
        }
        else {
            result = true;
        }
    }
    return result;
};

/**
 * определение - можно ли перемещать слайды группы
 * Например, вопросы теста
 * @param screens
 */
SlideGroupControl.prototype.isDraggableScreens = function(screens) {
    var result = false;
    for (var i = 0; i < screens.length; i++) {
        if (!!screens[i].draggable === false) {
            break;
        }
        else {
            result = true;
        }
    }
    return result;
};

/**
 * надо ли показывать кнопки добавления экранов
 * @param screens
 */
SlideGroupControl.prototype.canAdd = function(screens) {
    var result = false;
    for (var i = 0; i < screens.length; i++) {
        if (!!screens[i].canAdd === false) {
            break;
        }
        else {
            result = true;
        }
    }
    return result;
};

/**
 * надо ли показывать кнопки удаления экранов
 * @param screens
 */
SlideGroupControl.prototype.canDelete = function(screens) {
    var result = false;
    for (var i = 0; i < screens.length; i++) {
        if (!!screens[i].canDelete === false) {
            break;
        }
        else {
            result = true;
        }
    }
    return result;
};

/**
 * надо ли показывать кнопки клонирования экрана
 * @param screens
 */
SlideGroupControl.prototype.canClone = function(screens) {
    var result = false;
    for (var i = 0; i < screens.length; i++) {
        if (!!screens[i].canClone === false) {
            break;
        }
        else {
            result = true;
        }
    }
    return result;
};

/**
 * @param {string}
 * return
 */
SlideGroupControl.prototype.useSlide = function(slideId) {
    var result = null;
    for (var i = 0; i < this._slidesInfo.length; i++) {
        var si = this._slidesInfo[i];
        if (si.used === false) {
            // нашли первый свободный слайд - его и используем
            si.used = true;
            si.slide.setPropertyString(slideId);
            result = si;
            break;
        }
    }
    if (result === null) {
        var $d = $('<div></div>');
        var itemWrapperTemplate = this.$directive.find('.js-item_wr_template').html();
        var slide = createControl(slideId, null, 'Slide', {}, $d, null);
        var dataId = Math.random().toString();
        result = {
            dataId: dataId,
            $parent: $d,
            slide: slide,
            used: true,
            // обертка для элемента, чтобы его можно было перетаскивать
            $wrapper: $(itemWrapperTemplate).attr('data-id',dataId)
        };
        // ну вот так тут наверное немного накручено но ничо пока
        // то есть Slide внутри $parent, а тот внутри $wrapper, который уже к slidegroupcontrol относится
        result.$wrapper.find('.js-item').append($d);
        var $cnt = this.$directive.find('.js-slides_cnt');
        result.$wrapper.appendTo($cnt);
        this._slidesInfo.push(result);
    }
    return result;
};

/**
 * Организовать UI контрола
 *
 * Требования
 * функция может быть вызвана многократно
 * обработчики вешаются в зависимости от того можно ли перетаскивать
 * если элемент уже в контейнере то не надо добавлять заново
 *
 * @param params
 */
SlideGroupControl.prototype.arrangeItems = function(params) {
    if (this._slidesInfo) {
        var interimBtnTemplate = this.$directive.find('.js-interim_btn_template').html();
        var $cnt = this.$directive.find('.js-slides_cnt');
        var l = 0;
        this.leftPositions = [];
        this.items = [];
        this.insertButtons = [];
        for (var i = 0; i < this._slidesInfo.length; i++) {
            var dataId = this._slidesInfo[i].dataId;
            var $wr = this._slidesInfo[i].$wrapper;
            // надо запомнить все позиции на которых стоят слайды, потом будет двигать по ним
            this.leftPositions.push(l);
            // this.items нужен для перетаскивания, если постараться можно от него тоже избавиться, оставить только _slidesInfo
            this.items.push($wr);
            $wr.css('left',l+'px');
            if (params.draggable === true) {
                // одиночные экраны, например, стартовый экран, не привязан к массиву, не нужно перетаскивание
                $wr.mousedown(this.onMouseDown.bind(this));
            }
            if (params.canDelete === true) {
                $wr.find('.js-delete').show().attr('data-id',dataId).click(this.onDeleteItemClick.bind(this));
            }
            else {
                $wr.find('.js-delete').hide();
            }
            if (params.canDelete === true) {
                $wr.find('.js-clone').attr('data-id',dataId).click(this.onCloneItemClick.bind(this));
            }
            else {
                $wr.find('.js-clone').hide();
            }
            l += this._elemWidth+this._elemRightPadding;
            // добавляем промежуточные кнопки для быстрого добавления элемента в нужную позицию
            //TODO
//            if (i < params.items.length-1) {
//                l += config.editor.ui.slideInterimBtnMargins;
//                var $ib = $(interimBtnTemplate).css('left',l+'px').attr('data-insert-index',i+1).click(this.onInsertButtonClick.bind(this));
//                $cnt.append($ib);
//                this.insertButtons.push($ib);
//                l += (this._btnWidth+config.editor.ui.slideInterimBtnMargins);
//            }
        }
        if (params.draggable === true) {
            // одиночные экраны, например, стартовый экран, не привязан к массиву, не нужно перетаскивание
            $(document).mousemove(this.onMouseMove.bind(this));
            $(document).mouseup(this.onMouseUp.bind(this));
        }
        if (params.canAdd === true) {
            // показывать ли кнопку добавления в конце
            this.$directive.find('.js-add').show().click((function(){
                this.addNewItem();
            }).bind(this));
        }
        else {
            this.$directive.find('.js-add').hide();
        }

        // финальная ширина которую рассчитали
        $cnt.css('width',l);
        // границы координаты left в рамках который позволен drag
        this.bounds = {minLeft:-config.editor.ui.slideGroupLeftDragMargin, maxLeft:l-this._elemWidth+config.editor.ui.slideGroupRightDragMargin};
    }
};

/**
 *
 * @param position
 * @param newItem может быть указан (при клонировании) или не указан
 */
SlideGroupControl.prototype.addNewItem = function(position, newItem) {
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
SlideGroupControl.prototype.cloneItem = function(itemId) {
    var clonedItemIndex = this.getItemIndexById(itemId);
    var ap = Engine.getAppProperty(this.propertyString);
    // копируем указанный элемент массива
    var newItem = ap.getArrayElementCopy(clonedItemIndex);
    // далее обычное добавление, но без выбора прототипа
    this.addNewItem(clonedItemIndex+1, newItem);
};
SlideGroupControl.prototype.onInsertButtonClick = function(e) {
    var insertIndex = parseInt($(e.currentTarget).attr('data-insert-index'));
    this.addNewItem(insertIndex);
};
SlideGroupControl.prototype.onDeleteItemClick = function(e) {
    var dataId = $(e.currentTarget).attr('data-id');
    var deleteIndex = this.getItemIndexById(dataId);
    this.deleteItem(deleteIndex);
};
SlideGroupControl.prototype.onCloneItemClick = function(e) {
    var dataId = $(e.currentTarget).attr('data-id');
    this.cloneItem(dataId);
};
SlideGroupControl.prototype.deleteItem = function(position) {
    if (position >= 0) {
        var ap = Engine.getAppProperty(this.propertyString);
        Engine.deleteArrayElement(ap, position);
        if (ap.updateScreens === true) {
            //TODO запросить показ ближайшего экрана, предыдущего от удаленного
            activeScreens = [];
            syncUIControlsToAppProperties();
        }
    }
};
SlideGroupControl.prototype.onMouseDown = function(e) {
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
SlideGroupControl.prototype.onMouseMove = function(e) {
    if (this.isDragging === true && this.draggingElement) {
        if (this.originZIndex === undefined) {
            this.originZIndex = this.draggingElement.css('zIndex');
            this.draggingElement.css('zIndex',config.editor.ui.arrayControlDragZIndex);
        }
        if (this.propertyValueMap === null) {
            var ap = Engine.getAppProperty(this.propertyString);
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
SlideGroupControl.prototype.onMouseUp = function(e) {
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
SlideGroupControl.prototype.checkPos = function() {
    if (this.isDragging === true && this.elemPosition){
        if (this.moveInNewPosition(this.draggingElementId,this.elemPosition.left) === true) {
            this.arrangeViews();
        }
    }
},
/**
 * Проверить, можно ли поместить элемент в новую позицию
 * Если да, поместить. Изменяется массив this.items. Вьюхи позже
 * @return true если да
 */
SlideGroupControl.prototype.moveInNewPosition = function(id, leftE) {
    for (var i = 0; i < this.items.length; i++) {
        //TODO ids cache
        if (id != this.items[i].attr('data-id')) {
            //TODO не получать а кешировать
            var l = parseInt(this.items[i].css('left'));
            if (Math.abs(l-leftE)<this._elemWidth/2) {
                var prevPos = this.getItemIndexById(id);
                this.items.swap(i,prevPos);
                return true;
            }
        }
    }
    return false;
},
SlideGroupControl.prototype.getItemIndexById = function(id){
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
SlideGroupControl.prototype.arrangeViews = function() {
    for (var i = 0; i < this.leftPositions.length; i++) {
        // упорядочиваем все элементы, кроме того, что сейчас перетаскиваем. Он должен следовать за курсором
        if (this.draggingElementId !== this.items[i].attr('data-id')) {
            this.items[i].css('left',this.leftPositions[i]+'px');
        }
    }
},
SlideGroupControl.prototype.onAddQuickButtonClick = function(e) {
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
SlideGroupControl.prototype.isOrderWasChanged = function() {
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
SlideGroupControl.prototype.setValue = function() {
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
    //TODO remove важно: здесь должно быть updateScreens:false, иначе произойдет пересборка экранов и перемещения заметно не будет
    //TODO remove а делать пересборку такого большого контрола ArrayControl невозможно
    // Здесь необходимо делать пересборку экранов, так как надо рендерить заново с учетом порядка
    // например такие конструкции как quiz.{{currentQuestion}}.text и тому подобное
    Engine.setValue(ap, newValue, {
        updateScreens:true
    });
    //TODO контролы типа Slide нуждаются в обновлении?
//        syncUIControlsToAppProperties();
}
/**
 * Angular контроллер, для управления view
 * имя состоит из двух частей: 'Имя контрола'+'Controller'
 *
 * @param $scope область видимости из angular
 * @param $attrs дополнительные атрибуты, например dom элемент внутри
 */
function SlideGroupControlController(scope, attrs) {

}