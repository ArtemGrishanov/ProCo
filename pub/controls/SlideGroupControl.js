/**
 * Created by artyom.grishanov on 25.02.16.
 *
 * Контрол управления группой экранов:
 * 1) Перестановка (drag)
 * 2) Добавление в конец/между
 * 3) Клонирование
 * 4) Удаление
 *
 * Не является похожим на все остальные контолы, потому что не принимает значение setValue/getValue и не меняет его.
 * Имеет отличный от AbstractControl-контролов интерфейс: addScreen, updateScreen, deleteScreen
 *
 * MutAppArrayProperty - это лишь соответствие с массивом экранов _slideInfo.
 * Задача этого контрола при изменении _slideInfo вызывать колбеки об изменении
 *
 * Тогда кто будет менять свойства выше?
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
    this.dragElementStartIndex = undefined;
    this.dragElementNewIndex = undefined;
    this.isDragging = false;
    this.elemPosition = null;
    this.startPosition = null;
    this.startMousePosition = null;
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
    if (!param.additionalParam.onScreenEvents) {
        throw new Error('SlideGroupControl: onScreenEvents does nor specified in addiionalParam.');
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
    this.checkPosInterval = setInterval(this.checkPos.bind(this),100);
}

/**
 * Наследуем от абстрактного контрола
 * @type {AbstractControl|*}
 */
SlideGroupControl.prototype = AbstractControl;

SlideGroupControl.prototype.getValue = function() {

    return null;
};

SlideGroupControl.prototype.setValue = function(value) {
    if (Array.isArray(value) === true) {

    }
    else {
        throw new Error('SlideGroupControl.setValue: unsupported value type');
    }
};

SlideGroupControl.prototype.destroy = function() {
    clearInterval(this.checkPosInterval);
    this.$directive.remove();
};

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

    // посмотреть существующие экраны
    var existedScreens = this.getScreens();
    for (var n = 0; n < existedScreens.length; n++) {
        if (existedScreens[n].id === param.screen.id) {
            throw new Error('SlideGroupControl.addScreen: screen with id \''+param.screen.id+'\' already exist in this group \''+this.groupName+'\'');
        }
    }

    if (existedScreens.length > 0 && this.collapsed !== true) {
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

    // обновить аттрибуты группы, теоритически новый экран может их изменить
    var actualScreens = this.getScreens();
    this.collapsed = this.isCollapsedScreens(actualScreens);
    this.draggable = this.isDraggableScreens(actualScreens);
    this.canAdd = this.canAddScreens(actualScreens);
    this.canDelete = this.canDeleteScreens(actualScreens);
    this.canClone = this.canCloneScreens(actualScreens);

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
                onScreenEvents: this.additionalParam.onScreenEvents
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
 * Получить информацию по экрану в группе
 *
 * @param {string} screenId
 */
SlideGroupControl.prototype.getSlideInfo = function(screenId) {
    for (var i = 0; i < this._slidesInfo.length; i++) {
        var si = this._slidesInfo[i];
        // при создании ид экрана становится главным идентификатором Slide
        if (si.slide.propertyString === screenId) {
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
 * Добавить новый экран в конец или на указанную позицию
 * Будет вызван колбек вовне. Сам SlideGroupControl не работает с приложением и MutAppProperty
 *
 * @param {number} position - позиция в которую добавить элемент
 * @param {} newItem может быть указан (при клонировании) или не указан
 */
SlideGroupControl.prototype.addNewItem = function(position, newItem) {
    if (this.canAdd === true) {
        var eventData = {
            propertyString: this.propertyString
        };
        if (isNumeric(position) === true) {
            eventData.position = position;
        }
        this.additionalParam.onScreenEvents(ScreenManager.EVENT_ADD_SCREEN, eventData);
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
        var eventData = {
            propertyString: this.propertyString,
            position: clonedItemIndex
            //elementIndex: clonedItemIndex
        };
        // клонирование экрана не реализовано, используется простое добавление
        this.additionalParam.onScreenEvents(/*ScreenManager.EVENT_CLONE_SCREEN*/ScreenManager.EVENT_ADD_SCREEN, eventData);
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
        var eventData = {
            propertyString: this.propertyString
        };
        if (isNumeric(position) === true) {
            eventData.position = position;
        }
        this.additionalParam.onScreenEvents(ScreenManager.EVENT_DELETE_SCREEN, eventData);
    }
};
SlideGroupControl.prototype.onMouseDown = function(e) {
    if (this.draggable === true) {
        this.draggingElement = $(e.currentTarget);
        this.draggingElementId = this.draggingElement.attr('data-id');
        this.dragElementStartIndex = this.getItemIndexById(this.draggingElementId); // индекс в начале перетаскивания
        this.dragElementNewIndex = undefined;
        this.elemPosition = null;
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
        this.dragElementNewIndex = this.getItemIndexById(this.draggingElementId); // новый индекс после перетаскивания
        this.draggingElement = null;
        this.draggingElementId = null;
        this.isDragging = false;
        this.arrangeViews();

        // тонкий момент
        // при выборе новой позиции экрана мы должны сменить текущий экран
        // quizScr0 всегда будет первым экраном (так задаются идишки в приложении) не важно как он выглядит,
        //  хотя с точки зрения пользователя вопрос сменился (визуально)
        // поэтому и надо переключать экран на другой, то есть на тот на чью позицию переместили вопрос
        if (isNumeric(this.dragElementStartIndex) === true && this.dragElementStartIndex !== this.dragElementNewIndex) {
            var eventData = {
                propertyString: this.propertyString,
                elementIndex: this.dragElementStartIndex,
                newElementIndex: this.dragElementNewIndex
            };
            this.additionalParam.onScreenEvents(ScreenManager.EVENT_CHANGE_POSITION, eventData);
        }
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
};
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
};
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
};
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
};