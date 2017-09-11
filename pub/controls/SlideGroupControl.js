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
function SlideGroupControl(param) {
    this.init(param);
    //TODO надо высчитать вместе с отступами
    this._elemWidth = 120; //120 ширина превью + 16px  was 152
    this._elemRightPadding = 37;
    //TODO ширина промежуточной кнопки, надо высчитьывать программно
    this._btnWidth = 21;
    this.collapsed = false;
    this.draggable = false;
    this.canAdd = false;
    this.canDelete = false;
    this.canClone = false;

    // свойства необходимые для перетаскивания
    this.originZIndex = undefined;
    this.mousePressed = false;
    this.draggingElement = null;
    this.draggingElementId = null;
    this.isDragging = false;
    this.elemPosition = null;
    this.startPosition = null;
    this.startMousePosition = null;
    this.propertyValueMap = null;
    this.loaded = false;

    /**
     * идентификатор группы
     * все slides внутри этого контрола принадлежать одной группе
     */
    this.groupName = null;
    if (param.additionalParam && param.additionalParam.groupName) {
        this.groupName = param.additionalParam.groupName;
    }
    else {
        throw new Error('SlideGroupControl: groupName does nor specified in addiionalParam.');
    }
    /**
     * Надпись на естественном языке рядом с группой экранов
     * @type {null}
     */
    this.groupLabel = null;
    /**
     * Вспомогательный массив
     * @type {Array}
     * @private
     */
    this._slidesInfo = [
    ];

    // некоторый инит ui который делается один раз
    this.$directive.find('.js-add').show().click((function(){
        this.addNewItem();
    }).bind(this));
    $(document).mousemove(this.onMouseMove.bind(this));
    $(document).mouseup(this.onMouseUp.bind(this));
    this.loaded = true;
    // таймер на проверку новой позиции при перетаскивании
    setInterval(this.checkPos.bind(this),100);
}

/**
 * Наследуем от абстрактного контрола
 * @type {AbstractControl|*}
 */
SlideGroupControl.prototype = AbstractControl;

/**
 * Собрать список экранов MutApp.Screen для этого контрола
 * Дело в том, что есть список Slide, а экраны хранятся внутри Slide
 *
 * @returns {Array<MutApp.Screen>}
 */
SlideGroupControl.prototype.getScreens = function() {
    var result = [];
    for (var i = 0; i < this._slidesInfo.length; i++) {
        if (this._slidesInfo[i].used === true) {
            result.push(this._slidesInfo[i].slide.additionalParam.screen);
        }
    }
    return result;
};

/**
 * Добавить новый экран в этот контрол
 * @param {MutApp.Screen} param.screen
 * @param {string} param.cssString
 */
SlideGroupControl.prototype.addScreen = function(param) {
    param = param || {};
    if (!param.screen) {
        throw new Error('SlideGroupControl.addScreen: param.screen must be specified');
    }
    if (!param.cssString) {
        throw new Error('SlideGroupControl.addScreen: param.cssString must be specified');
    }

    var myScreens = [];
    var myScreenIds = [];
    if (param.screen.group !== this.groupName) {
        throw new Error('SlideGroupControl.addScreen: new screen and SlideGroupControl must have the same groups!');
    }

    // имя для группы установить
    // в автотестах App === undefined
    if (window.App === undefined) {
        this.$directive.find('.js-slide_group_name').text(
            (typeof param.screen.name === 'string') ? param.screen.name: param.screen.name['EN']
        );
    }
    else {
        this.$directive.find('.js-slide_group_name').text(
            (typeof param.screen.name === 'string') ? param.screen.name: param.screen.name[App.getLang()]
        );
    }

    var screens = this.getScreens();
    for (var n = 0; n < screens.length; n++) {
        if (screens[n].id === param.screen.id) {
            throw new Error('SlideGroupControl.addScreen: screen with id \''+param.screen.id+'\' already exist in this group \''+this.groupName+'\'');
        }
    }
    // обновить аттрибуты группы, теоритически новый экран может их изменить
    this.collapsed = this.isCollapsedScreens(screens);
    this.draggable = this.isDraggableScreens(screens);
    this.canAdd = this.canAddScreens(screens);
    this.canDelete = this.canDeleteScreens(screens);
    this.canClone = this.canCloneScreens(screens);

    if (screens.length > 0 && this.collapsed !== true) {
        // уже есть по крайне мере один элемент и будет добавление сейчас: модификатор массива
        this.$directive.addClass('__array');
    }

    // смотрим сколько слайдов нам надо под экраны
    var mySlides = [];
    if (this.collapsed === true) {
        // один контрол нужен
        myScreenIds = [myScreenIds.join(',')]; // групповой ид экрана
    }

    // создать новое view для экрана
    // внутри создается контрол Slide и складывается в this._slidesInfo
    var si = this.useSlide({
        screen: param.screen,
        cssString: param.cssString
    });

    // удалить неиспользуемые
    this.deleteUnusedSlides();

    // привести UI контрола в порядок в соответствии с этими данными
    this.arrangeItems({
        collapsed: this.collapsed,
        draggable: this.draggable,
        canAdd: this.canAdd,
        canDelete: this.canDelete,
        canClone: this.canClone
    });
};

/**
 * Добавить новый экран в этот контрол
 * @param {MutApp.Screen} param.screen
 * @param {string} param.cssString
 */
SlideGroupControl.prototype.updateScreen = function(param) {
    param = param || {};
    if (!param.screen) {
        throw new Error('SlideGroupControl.updateScreen: param.screen must be specified');
    }
    if (!param.cssString) {
        throw new Error('SlideGroupControl.updateScreen: param.cssString must be specified');
    }
    var screenFound = false;
    for (var i = 0; i < this._slidesInfo.length; i++) {
        var sl = this._slidesInfo[i].slide;
        if (sl.additionalParam.screen === param.screen) {
            sl.updatePreview();
            screenFound = true;
            break;
        }
    }
    if (screenFound === false) {
        throw new Error('SlideGroupControl.updateScreen: screen not found');
    }
};

/**
 * Удалить экран из группы
 * @param {MutApp.Screen} param.screen
 */
SlideGroupControl.prototype.deleteScreen = function(param) {
    param = param || {};
    if (!param.screen) {
        throw new Error('SlideGroupControl.deleteScreen: param.screen must be specified');
    }
    var screenFound = false;
    for (var i = 0; i < this._slidesInfo.length; i++) {
        var sl = this._slidesInfo[i].slide;
        if (sl.additionalParam.screen === param.screen) {
            // просто помечаем слайд как неиспользуемый
            this._slidesInfo[i].used = false;
            screenFound = true;
            // удалить неиспользуемые
            this.deleteUnusedSlides();
            // привести UI контрола в порядок в соответствии с этими данными
            this.arrangeItems({
                collapsed: this.collapsed,
                draggable: this.draggable,
                canAdd: this.canAdd,
                canDelete: this.canDelete,
                canClone: this.canClone
            });
            break;
        }
    }
    if (screenFound === false) {
        throw new Error('SlideGroupControl.deleteScreen: screen not found');
    }
};

/**
 * Обработчик на изменение экрана.
 * Вызывается редактором Editor извне
 */
//SlideGroupControl.prototype.screenUpdate = function(event, data) {
//    log('SlideGroupControl.screenUpdate: ' + event);
//    this.updateScreens();
//}
/**
 * Обновить экраны на основе информации из MutApp приложения
 *
 * У этого контрола есть такие данные:
 * 1) Массив Slide (превью одного экрана), он их сам и создает сколько надо и когда надо
 * 2) Editor.getEditedApp().getScreenIds()
 * 3) требования к быстродействию:
 *      - перетаскивания, добавления/удаления Slides должны происходить гладко
 */
//SlideGroupControl.prototype.updateScreens = function() {
//    var appScreenIds = Editor.getEditedApp().getScreenIds();
//    if (this.$directive && appScreenIds.length > 0) {
//        // подготовим для использования компоненты
//        for (var i = 0; i < this._slidesInfo.length; i++) {
//            this._slidesInfo[i].used = false;
//        }
//
//        // отсеяли лишние и оставили только экраны с группой this.groupName
//        var myScreens = [];
//        var myScreenIds = [];
//        for (var i = 0; i < appScreenIds.length; i++) {
//            var scr = Editor.getEditedApp().getScreenById(appScreenIds[i]);
//            if (scr.group === this.groupName) {
//                myScreens.push(scr);
//                myScreenIds.push(appScreenIds[i]);
//            }
//        }
//
//        if (myScreens && myScreens.length > 0) {
//            this.$directive.find('.js-slide_group_name').text(
//                (typeof myScreens[0].name === 'string') ? myScreens[0].name: myScreens[0].name[App.getLang()]
//            );
//        }
//
//        this.collapsed = this.isCollapsedScreens(myScreens);
//        this.draggable = this.isDraggableScreens(myScreens);
//        this.canAdd = this.canAddScreens(myScreens);
//        this.canDelete = this.canDeleteScreens(myScreens);
//        this.canClone = this.canCloneScreens(myScreens);
//
//        if (myScreens && myScreens.length > 1 && this.collapsed !== true) {
//            this.$directive.addClass('__array');
//        }
//
//        // смотрим сколько слайдов нам надо под экраны
//        var mySlides = [];
//        if (this.collapsed === true) {
//            // один контрол нужен
//            myScreenIds = [myScreenIds.join(',')]; // групповой ид экрана
//        }
//        this._items = [];
//        for (var i = 0; i < myScreenIds.length; i++) {
//            var sId = myScreenIds[i];
//            var si = this.useSlide(sId);
//            this._items.push(si.$parent);
//        }
//
//        // удалить неиспоьзуемые
//        this.deleteUnusedSlides();
//
//        // привести UI контрола в порядок в соответствии с этими данными
//        this.arrangeItems({
//            collapsed: this.collapsed,
//            draggable: this.draggable,
//            canAdd: this.canAdd,
//            canDelete: this.canDelete,
//            canClone: this.canClone,
//            items: this._items
//        });
//    }
//};

/**
 * определение - надо ли сжимать группу или нет
 * если группа "сжата" (collapsed === true) то она представлена одной иконкой.
 * Например, результаты в тесте
 * @param screens
 */
SlideGroupControl.prototype.isCollapsedScreens = function(screens) {
    var result = false;
    for (var i = 0; i < screens.length; i++) {
        if (!!screens[i].collapse === false) {
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
SlideGroupControl.prototype.canAddScreens = function(screens) {
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
SlideGroupControl.prototype.canDeleteScreens = function(screens) {
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
SlideGroupControl.prototype.canCloneScreens = function(screens) {
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
 * Удалить неиспользуемые слайды
 */
SlideGroupControl.prototype.deleteUnusedSlides = function() {
    for (var i = 0; i < this._slidesInfo.length;) {
        var si = this._slidesInfo[i];
        if (si.used === false) {
            si.$wrapper.remove();
            this._slidesInfo.splice(i,1);
        }
        else {
            i++
        }
    }
};

/**
 * Выбрать свободный или создать контрол Slide
 * Контролы Slide помещены в массив this._slidesInfo
 *
 * @param {MutApp.Screen} param.screen - экран приложения для которого создается слайд
 * @param {string} param.cssString - все CssMutAppProprty свойства приложения в виде строки
 *
 * @return {slide, dataId, used, $wrapper}
 */
SlideGroupControl.prototype.useSlide = function(param) {
    param = param || {};
    if (!param.screen) {
        throw new Error('SlideGroupControl.useSlide: screen does not specified');
    }
    if (!param.cssString) {
        throw new Error('SlideGroupControl.useSlide: cssString does not specified');
    }

    var slideId = param.screen.id;
    var result = null;
    for (var i = 0; i < this._slidesInfo.length; i++) {
        var si = this._slidesInfo[i];
        if (si.used === false) {
            // нашли первый свободный слайд - его и используем
            si.used = true;
            // обработка как и в createControl (пример 'resultScr0 resultScr1 resultScr2')
            var propertyStrArg = (slideId && slideId.indexOf(',')>=0)?slideId.split(','):slideId;
            si.slide.setSettings({
                propertyString: propertyStrArg,
                cssString: param.cssString,
                screen: param.screen
            });
            result = si;
            break;
        }
    }
    if (result === null) {
        var $d = $('<div></div>');
        var itemWrapperTemplate = this.$directive.find('.js-item_wr_template').html();
        var slide = new Slide({
            propertyString: slideId,
            controlName: 'Slide',
            directiveName: 'slide',
            container: null,
            wrapper: $d,
            controlFilter: 'always',
            additionalParam: {
                appType: this.additionalParam.appType,
                screen: param.screen,
                cssString: param.cssString,
                onClickCallback: this.additionalParam.onScreenSelect
            }
        });
        var dataId = Math.random().toString();
        result = {
            dataId: dataId,
            slide: slide,
            used: true,
            // обертка для элемента, чтобы его можно было перетаскивать
            $wrapper: $(itemWrapperTemplate).attr('data-id',dataId)
        };
        // немного накручено: то есть Slide внутри $d, а $d тот внутри $wrapper, который уже к slidegroupcontrol относится
        result.$wrapper.find('.js-item').append($d);
        var $cnt = this.$directive.find('.js-slides_cnt');
        result.$wrapper.appendTo($cnt);
        result.$wrapper.find('.js-delete').attr('data-id',dataId).click(this.onDeleteItemClick.bind(this));
        result.$wrapper.find('.js-clone').attr('data-id',dataId).click(this.onCloneItemClick.bind(this));
        result.$wrapper.find('.js-insert').click(this.onInsertButtonClick.bind(this));
        result.$wrapper.mousedown(this.onMouseDown.bind(this));
        this._slidesInfo.push(result);
    }
    return result;
};

/**
 *
 * @param dataId
 */
SlideGroupControl.prototype.getSlideInfo = function(dataId) {
    for (var i = 0; i < this._slidesInfo.length; i++) {
        var si = this._slidesInfo[i];
        if (si.dataId === dataId) {
            return si;
        }
    }
    return null;
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
//        this.insertButtons = [];
        for (var i = 0; i < this._slidesInfo.length; i++) {
            var dataId = this._slidesInfo[i].dataId;
            var $wr = this._slidesInfo[i].$wrapper;
            // надо запомнить все позиции на которых стоят слайды, потом будет двигать по ним
            this.leftPositions.push(l);
            // this.items нужен для перетаскивания, если постараться можно от него тоже избавиться, оставить только _slidesInfo
            this.items.push($wr);
            $wr.css('left',l+'px');
            if (params.canDelete === true) {
                $wr.find('.js-delete').show();
            }
            else {
                $wr.find('.js-delete').hide();
            }
            if (params.canClone === true) {
                $wr.find('.js-clone').show();
            }
            else {
                $wr.find('.js-clone').hide();
            }
            if (params.canAdd === true && i < this._slidesInfo.length/*-1*/) {
                // промежуточные кнопки для быстрого добавления элемента в нужную позицию
                $wr.find('.js-insert').attr('data-insert-index',i+1).show();
            }
            else {
                $wr.find('.js-insert').attr('data-insert-index','undefined').hide();
                //l -= this._btnWidth;
            }
            l += this._elemWidth;
            if (params.canAdd === true) {
                l += this._elemRightPadding;
            }
        }
        if (params.canAdd === true) {
            // показывать ли кнопку добавления в конце
            this.$directive.find('.js-add').show();
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
    if (this.canAdd === true) {
        // если позиция не задана, элемент будет добавлен в конец массива
        var p = (isNumeric(position) === true) ? position : undefined;
        var ap = Engine.getAppProperty(this.propertyString);
        var pp = Engine.getPrototypesForAppProperty(ap);
        if (!newItem) {
            // нужно выбрать прототип для нового элемента
            if (pp && pp.length > 0) {
                //TODO если доступен один прототип то не надо диалога, сразу добавить
                var selectOptions = [];
                for (var i = 0; i < pp.length; i++) {
                    selectOptions.push({
                        id: pp[i].key,
                        label: pp[i].label,
                        icon: pp[i].img
                    });
                }
                Editor.showSelectDialog({
                    caption: App.getText('new_slide'),
                    options: selectOptions,
                    callback: (function(selectedOptionId) {
                        if (selectedOptionId) {
                            //TODO refactor
                            for (var j = 0; j < pp.length; j++) {
                                if (pp[j].key == selectedOptionId) {
                                    Engine.addArrayElement(ap, pp[j].getValue(), p);
                                    if (ap.updateScreens === true) {
                                        Editor.syncUIControlsToAppProperties([]);
                                    }
                                }
                            }
                        }
                    }).bind(this)
                });
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
                //TODO почему этот синк руками нельзя вызвать?
                Editor.syncUIControlsToAppProperties([]);
            }
        }
    }
};
/**
 * Клонирование - создание нового без выбора прототипа, копирование существующего элемента
 * В самом AppProperty есть функция получения копии
 * @param itemId
 */
SlideGroupControl.prototype.cloneItem = function(itemId) {
    if (this.canClone === true) {
        var clonedItemIndex = this.getItemIndexById(itemId);
        var ap = Engine.getAppProperty(this.propertyString);
        // копируем указанный элемент массива
        var newItem = ap.getArrayElementCopy(clonedItemIndex);
        // далее обычное добавление, но без выбора прототипа
        this.addNewItem(clonedItemIndex+1, newItem);
    }
};
SlideGroupControl.prototype.onInsertButtonClick = function(e) {
    if (this.canAdd === true) {
        var insertIndex = parseInt($(e.currentTarget).attr('data-insert-index'));
        this.addNewItem(insertIndex);
    }
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
    if (this.canDelete === true) {
        if (position >= 0) {
            var ap = Engine.getAppProperty(this.propertyString);
            Engine.deleteArrayElement(ap, position);
            if (ap.updateScreens === true) {
                //TODO запросить показ ближайшего экрана, предыдущего от удаленного
                Editor.syncUIControlsToAppProperties([]);
            }
        }
    }
};
SlideGroupControl.prototype.onMouseDown = function(e) {
    if (this.draggable === true) {
        this.draggingElement = $(e.currentTarget);
        this.draggingElementId = this.draggingElement.attr('data-id');
        this.elemPosition = null;
        //this.isDragging = true;
        this.startPosition = $(e.currentTarget).position();
        this.startMousePosition = {
            left: e.pageX,
            top: e.pageY
        };
        this.mousePressed = true;
    }
};
SlideGroupControl.prototype.onMouseMove = function(e) {
    if (this.mousePressed === true && this.isDragging === false) {
        this.isDragging = true;
    }
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
        this.draggingElement.css('zIndex', this.originZIndex);
        this.originZIndex = undefined;
        var newPositionIndex = 0;
        for (var i = 0; i < this.items.length; i++) {
            if (this.draggingElementId === this.items[i].attr('data-id')) {
                newPositionIndex=i;
            }
        }
        this.draggingElement = null;
        this.draggingElementId = null;
        this.isDragging = false;
        this.arrangeViews();

        // тонкий момент
        // при выборе новой позиции экрана мы должны сменить текущий экран
        // quizScr0 всегда будет первым экраном (так задаются идишки в приложении) не важно как он выглядит,
        //  хотя с точки зрения пользователя вопрос сменился (визуально)
        // поэтому и надо переключать экран на другой, то есть на тот на чью позицию переместили вопрос
//        activeScreens = [this._slidesInfo[newPositionIndex].slide.propertyString];

        if (this.isOrderWasChanged() === true) {
            // изменили порядок при перетаскиввании, надо изменить теперь свойство
            this.setValue();
        }
        this.propertyValueMap = null;
    }
    this.mousePressed = false;
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
/**
 *
 */
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
        Engine.addArrayElement(ap, pp[protoIndex].value);
        if (ap.updateScreens === true) {
            Editor.syncUIControlsToAppProperties();
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
    setTimeout(function() {
        // Здесь необходимо делать пересборку экранов, так как надо рендерить заново с учетом порядка
        // например такие конструкции как quiz.{{currentQuestion}}.text и тому подобное
        Engine.setValue(ap, newValue, {
            updateScreens:true
        });
        Editor.syncUIControlsToAppProperties();
    },100);
}