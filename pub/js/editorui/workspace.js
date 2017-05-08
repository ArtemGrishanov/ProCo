/**
 * Created by artyom.grishanov on 04.05.17.
 */

var workspace = {};
(function(global) {

    var
        /**
         * Шаблон для создания подсказки
         * @type {string}
         */
        hintTemplate = null,
        /**
         * Шаблон-строка для создания рамки выделения
         * @type {string}
         */
        selectionTemplate = null,
        /**
         * Рамка выделения вокруг элемента
         * @type {DOMElement}
         */
        $selection = null,
        $selectedElementOnAppScreen = null,
        /**
         * Подсказки для текущего экрана продукта
         * @type {Array}
         */
        activeScreenHints = [],
        /**
         * Контейнер для quick контролов которые показываются поверх appScreen
         * @type {DOMElement}
         */
        $controlContainer = null,
        /**
         * Айфрейм для показа экранов приложения
         * @type {DOMElement}
         */
        $appScreensIframe = null,
        /**
         * Body внутри $appScreensIframe для добавления экранов приложения
         * @type {DOMelement}
         */
        $appScreensIframeBody = null,
        /**
         * Массив контролов и свойств AppProperty продукта
         * @type {Array.<object>}
         */
        uiControlsInfo = [
            // Контрол определяется парой: appProperty+domElement
            //   - одного appProperty не достаточно, так как для одного и того же appProperty на экранах или даже одном экране могут быть дублирующие элементы
            // control
            // appProperty
            // domElement
        ],
        /**
         * Панелька с контролами, которая всплывает рядом с элементом и указывает на него
         * @type {QuickControlPanel}
         */
        quickControlPanel = null,
        /**
         * Объект с информации о координатах рабочего поля.
         * Нужен для позиционирования рамок selections
         * @type {left: 0, top: 0}
         */
        workspaceOffset = null,
        /**
         * Ид экранов которые показаны в данный момент в рабочем поле
         * @type {Array.<string>}
         */
        showedScreenIds = [];


    /**
     * полное пересоздание всех контролов
     * Привязать элементы управления к Engine.getAppProperties
     * Создаются только новые элементы управления, которые необходимы.
     * Может быть добавлен/удален слайд, поэтому надо только для него сделать обновление.
     *
     * Это могут быть следующие действия:
     * 1) Добавление контролов на панель справа.
     * 2) Обновление контрола слайдов (страниц) (один большой контрол)
     * 3) Привязка контролов к dom-элементам в продукте, Для быстрого редактирования.
     */
    function syncUIControlsToAppProperties() {
        _clearControls(['workspace', 'quickcontrolpanel', 'controlpanel']);
        uiControlsInfo = [];
        $('#id-static-no_filter_controls').empty();
        $('#id-static_controls_cnt').empty();
        $('#id-control_cnt').empty();

        // задача здесь: создать постоянные контролы, которые не будут меняться при переключении экранов
        var appPropertiesStrings = Engine.getAppPropertiesObjectPathes();
        for (var i = 0; i < appPropertiesStrings.length; i++) {
            var ps = appPropertiesStrings[i];
            var ap = Engine.getAppProperty(ps);
            if (ap.controls) {
                // у свойства может быть несколько контролов
                for (var j = 0; j < ap.controls.length; j++) {
                    var c = ap.controls[j];
                    if (config.controls[c.name]) {
                        if (config.controls[c.name].type === 'controlpanel') {
                            // контрол помечен как постоянный в дескрипторе, то есть его надо создать сразу и навсегда (пересоздастся только вместе с экранами)
                            var parent = null;
                            var sg = c.params.screenGroup;
                            if (sg) {
                                // контрол привязан в группе экранов, а значит его родитель другой, так себе решение.
                                parent = $('[data-screen-group-name=\"'+sg+'\"]').find('.js-slide_group_controls');
                            }
                            else {
                                // выбираем панель по принципу: фильтруется контрол или нет (фильтр по клику или по экрану)
                                var parentPanelId = (ap.filter === true || ap.showWhileScreenIsActive) ? '#id-static_controls_cnt': '#id-static-no_filter_controls';

                                // каждый контрол предварительно помещаем в отдельную обертку, а потом уже на панель настроек
                                var $cc = $($('#id-static_control_cnt_template').html()).appendTo(parentPanelId);
                                if (ap.label) {
                                    var textLabel = (typeof ap.label==='string')? ap.label: ap.label[App.getLang()];
                                    if (config.controls[c.name].labelInControl === true) {
                                        // метка находится внутри самого контрола а не вовне как обычно
                                        // UI контрола будет загружен после, поэтому пробрасываем внутрь контрола label
                                        c.params.__label = textLabel;
                                        $cc.find('.js-label').remove();
                                    }
                                    else {
                                        $cc.find('.js-label').text(textLabel);
                                    }
                                }
                                if (ap.filter === true) {
                                    // свойства с этим атрибутом filter=true показываются только при клике на соответствующих элемент в промо-приложении
                                    // который помечен data-app-property
                                    $cc.hide();
                                }
                                parent = $cc.find('.js-control_cnt');
                            }
                            var newControl = createControl(ps, c.params.viewName, c.name, c.params, parent);
                            if (ps === 'id=startScr backgroundImg') {
                                var stopHere = 0;
                            }
                            if (newControl) {
                                uiControlsInfo.push({
                                    propertyString: ps,
                                    control: newControl,
                                    wrapper: $cc, // контейнер, в котором контрол находится на боковой панели контролов
                                    filter: ap.filter, // чтобы потом не искать этот признак во время фильтрации
                                    showWhileScreenIsActive: ap.showWhileScreenIsActive,
                                    type: config.controls[c.name].type // также для быстрого поиска
                                });
                            }
                            else {
                                log('Can not create control for appProperty: \'' + ps, true);
                            }
                        }
                    }
                    else {
                        log('Control: \'' + c.name + '\' isn\'t descripted in config.js' , true);
                    }
                }
            }
        }

        //TODO жесткий хак: данная инициализация не поддерживается на нескольких колорпикерах
        // надо отследить загружку всех директив колорпикеров и тогда инициализировать их
        setTimeout(function() {
            initColorpickers();
            setTimeout(function() {
                initColorpickers();
            }, 10000);
        }, 6000);

//        if (activeScreenIds.length > 0) {
//            // восстановить показ экранов, которые видели ранее
//            showScreen(activeScreenIds);
//        }
//        else {
//            // первый экран показать по умолчанию
//            //TODO первый старт: надо дождаться загрузки этого айфрема и нормально проинициализировать после
//            setTimeout(function() {
//                showScreen([Engine.getAppScreenIds()[0]]);
//            }, 1000);
//        }
//        // стрелки управления прокруткой, нормализация
//        checkScreenGroupsArrowsState();
    }

    function initColorpickers() {
        // стараемся выполнить после загрузки всех колорпикеров
        try {
            $('.colorpicker').colorpicker();
            $('.colorpicker input').click(function() {
                $(this).parents('.colorpicker').colorpicker('show');
            })
        }
        catch (e) {
            // strange thing here
            //bootstrap-colorpicker.min.js:19 Uncaught TypeError: Cannot read property 'toLowerCase' of undefined
            log(e,true);
        }
    }

    /**
     * Показать экраны приложения на рабочем поле
     * @param {Array.<string>} appScreensIds
     */
    function showScreen(appScreensIds) {
        showedScreenIds = appScreensIds;
        if ($appScreensIframeBody === null) {
            $appScreensIframeBody = $($appScreensIframe.contents().find('body'));
        }
        // надо скрыть все активные подсказки, если таковые есть. На новом экране будут новые подсказки
        _hideWorkspaceHints();
        activeScreenHints = [];
        // каждый раз удаляем quick-контролы и создаем их заново. Не слишком эффективно, но просто и надежно
        // то что контролы привязаны к одному экрану определяется только на основании контейнера, в который они помещены
        var $controlCnt = $controlContainer.empty();
        //TODO заменить нижний код на _clearControls('quickcontrol');
        for (var i = 0; i < uiControlsInfo.length;) {
            var c = uiControlsInfo[i].control;
            if (c.$parent.selector === $controlCnt.selector) {
                uiControlsInfo.splice(i,1);
            }
            else {
                i++;
            }
        }

        $appScreensIframeBody.empty();
        // в превью контейнер дописать кастомные стили, которые получились в результате редактирования css appProperties
        Engine.writeCssRulesTo($appScreensIframeBody);
        var appScreen = null;
        var previewHeight = 0;
        for (var i = 0; i < appScreensIds.length; i++) {
            appScreen = Engine.getAppScreen(appScreensIds[i]);
            if (appScreen) {
                var b = _createPreviewScreenBlock(appScreen.view)
                $appScreensIframeBody.append(b);
                previewHeight += Editor.getAppContainerSize().height;
                previewHeight += config.editor.ui.screen_blocks_padding+2*config.editor.ui.screen_blocks_border_width; // 20 - паддинг в стиле product_cnt.css/screen_block
                _bindControlsForAppPropertiesOnScreen(appScreen.view, appScreensIds[i]);
            }
            else {
                log('Editor.showScreen: appScreen not found '+appScreensIds[i], true);
            }
        }
        //ширина по умолчанию всегда 800 (стили editor.css->.proto_cnt) содержимое если больше то будет прокручиваться
        // высота нужна для задания размеров id-workspace чтобы он был "кликабелен". Сбрасывание фильтра контролов при клике на него
        $('#id-product_cnt').height(previewHeight + config.editor.ui.id_product_cnt_additional_height);
        // надо выставить вручную высоту для айфрема. Сам он не может установить свой размер, это будет только overflow с прокруткой
        //TODO Editor.getAppContainerSize()
        var w = Editor.getAppContainerSize().width + 2*config.editor.ui.screen_blocks_border_width;
        $controlContainer.width(w).height(previewHeight);
        $appScreensIframe.width(w).height(previewHeight);
        // боковые панели вытягиваем также вслед за экранами
        $('.js-setting_panel').height(previewHeight);
        //TODO нельзя ли #id-product_cnt и #id-workspace объединить и устанавливать высоту одному элементу?
        $('#id-workspace').height(previewHeight);

        _filterControls(null, null, appScreensIds);

        $($appScreensIframe.contents()).click(function(){
            // любой клик по appScreen сбрасывает подсказки
            _hideWorkspaceHints();
        });
    }

    /**
     * На добавленном view экрана скорее всего есть какие dom-элементы связанные с appProperties
     * Найдем их и свяжем с контролами редактирования
     *
     * @param {HTMLElement} $view
     * @param {string} scrId
     *
     */
    function _bindControlsForAppPropertiesOnScreen($view, scrId) {
        var appScreen = Engine.getAppScreen(scrId);
        var registeredElements = [];

        // найти и удалить эти типы контролов
        // при показе экрана они пересоздаются заново
        _clearControls(['workspace', 'quickcontrolpanel']);

        for (var k = 0; k < appScreen.appPropertyElements.length; k++) {
            // для всех элементов связанных с appProperty надо создать событие по клику.
            // в этот момент будет происходить фильтрация контролов на боковой панели
            // элемент, конечно, может быть привязан к нескольким appProperty, ведь содержит несколько значений в data-app-property
            // надо избежать создания дублирующихся обработчиков
            var de = appScreen.appPropertyElements[k].domElement;
            if (registeredElements.indexOf(de) < 0) {
                $(de).click(function(e) {
                    selectElementOnAppScreen($(e.currentTarget));
                    e.preventDefault();
                    e.stopPropagation();
                });
                registeredElements.push(de);
            }
            // контрола пока ещё не существует для настройки, надо создать
            var propertyString = appScreen.appPropertyElements[k].propertyString;
            var appProperty = Engine.getAppProperty(propertyString);
            if (appProperty) {
                // может быть несколько контролов для appProperty (например, кнопка доб ответа и кнопка удал ответа в одном и том же массиве)
                var controlsInfo = appProperty.controls;
                for (var j = 0; j < controlsInfo.length; j++) {
                    var cn = controlsInfo[j].name;
                    // здесь надо создавать только контролы которые находятся на рабочем поле, например textquickinput
                    // они пересоздаются каждый раз при переключении экрана
                    // "обычные" контролы создаются иначе
                    if (config.controls[cn].type === 'workspace' || config.controls[cn].type === 'quickcontrolpanel') {

                        // на домэлемент можно повесить фильтр data-control-filter и в descriptor в параметрах также его указать
                        if (_checkControlFilter(de, controlsInfo[j].params)===true) {
                            // имя вью для контрола
                            var viewName = controlsInfo[j].params.viewName;
                            // простейшая обертка для контрола, пока помещаем туда
                            var wrapper = (config.controls[cn].type === 'quickcontrolpanel') ? $('<div></div>'): null;
                            var newControl = createControl(appProperty.propertyString,
                                viewName,
                                controlsInfo[j].name,
                                controlsInfo[j].params,
                                wrapper,
                                de);
                            if (newControl) {
                                // только если действительно получилось создать ui для настройки
                                // не все контролы могут быть реализованы или некорректно указаны
                                uiControlsInfo.push({
                                    propertyString: propertyString,
                                    control: newControl,
                                    domElement: de,
                                    type: config.controls[cn].type,
                                    wrapper: wrapper
                                });
                            }
                            else {
                                log('Can not create control \''+controlsInfo[j].name+'\' for appProperty: \''+propertyString+ '\' on the screen '+scrId, true);
                            }
                        }

                    }
                }
            }
            else {
                // нет свойства appProperty в Engine хотя во вью есть элемент с таким атрибутом data-app-property
                // это значит ошибку в промо-продукте
                log('AppProperty \''+propertyString+'\' not exist. But such attribute exists on the screen: \''+scrId+'\'', true);
            }
        }
    }

    /**
     * Отфильтровать и показать только те контролы, appPropertyString которых есть в dataAppPropertyString
     * Это могут быть контролы на боковой панели или во всплывающей панели quickControlPanel
     *
     * @param {string} dataAppPropertyString например 'backgroundColor,showBackgroundImage'
     * @param {domElement} element на который кликнул пользователь
     * @param {Array} activeScreenIds экраны активные в данный момент. Есть такой тип фильтрации showWhileScreenIsActive
     */
    function _filterControls(dataAppPropertyString, element, activeScreenIds) {
        var quickControlPanelControls = [];
        if (dataAppPropertyString) {
            $('#id-static_controls_cnt').children().hide();
            // может быть несколько свойств через запятую: фон кнопки, ее бордер, цвет шрифта кнопки и так далее
            var keys = dataAppPropertyString.split(',');
            for (var i = 0; i < keys.length; i++) {
                var cArr = findControlInfo(keys[i].trim(), element);

                // результатов поиска может быть несколько
                // например по id=tm quiz.0.answer.options - контрол добавлени и удаления
                for (var j = 0; j < cArr.length; j++) {
                    var c = cArr[j];
                    // контролы которые должны показаться на всплывающей панели quickControlPanel
                    if (c && c.type === 'quickcontrolpanel') {
                        // событие _onShow будет вызвано позже для этого типа 'quickcontrolpanel'
                        quickControlPanelControls.push(c);
                    }
                    else {
                        if (c && c.wrapper) {
                            c.wrapper.show();
                            if (c.control._onShow) {
                                c.control._onShow();
                            }
                        }
                    }

                    //TODO test
                    // refactor
                    // $productDOMElement не устанавливается для контролов controlpanel при создании
                    // а он оказался нужен для Alternative
                    if (c.type === 'controlpanel') {
                        c.control.$productDOMElement = $(element);
                    }
                }
            }
        }
        else {
            // сбрасываем фильтр - показываем всё что не имеет filter=true
            for (var i = 0; i < uiControlsInfo.length; i++) {
                var c = uiControlsInfo[i];
                if (c.type && c.type === 'controlpanel') {
                    if (c.filter === true) {
                        c.wrapper.hide();
                    }
                    else {
                        c.wrapper.show();
                        if (c.control._onShow) {
                            c.control._onShow();
                        }
                    }
                }
            }
        }

        // Фильтрация контролов которые должны быть показаны во время показа экрана
        for (var i = 0; i < uiControlsInfo.length; i++) {
            var c = uiControlsInfo[i];
            if (c.type && c.type === 'controlpanel') {
                var found = false;
                for (var n = 0; n < activeScreenIds.length; n++) {
                    if (activeScreenIds[n].indexOf(c.showWhileScreenIsActive) >= 0) {
                        found = true;
                        break;
                    }
                }
                if (c.showWhileScreenIsActive !== undefined && found === true) {
                    // пока активен экран c.showWhileScreenIsActive надо показывать контрол, такой тип фильтрации по экрану
                    c.wrapper.show();
                    $('#id-static_controls_cnt').prepend(c.wrapper); // контроля фильтруемые по экрану должны быть выше, у них более высокий приоритет
                    if (c.control._onShow) {
                        c.control._onShow();
                    }
                }
            }
        }

        // есть несколько контролов для всплывашки, которые надо показать
        if (quickControlPanelControls.length > 0) {
            quickControlPanel.show(element, quickControlPanelControls);
            for (var n = 0; n < quickControlPanelControls.length; n++) {
                var c = quickControlPanelControls[n];
                if (c.control._onShow) {
                    c.control._onShow();
                }
            }
        }
        else {
            quickControlPanel.hide();
        }
    }

    /**
     * Найти информацию об элементе управления
     * @param {string} propertyString свойство для которого ищем элемент управления
     * @param [domElement]
     * @returns {array}
     */
    function findControlInfo(propertyString, domElement) {
        var results = [];
        for (var j = 0; j < uiControlsInfo.length; j++) {
            // TODO для контролов типа controlpanel я не сохранял элементы domElement, и в эту функцию передается undefined
            // поэтому такая заточка
            if (domElement && uiControlsInfo[j].type!=='controlpanel') {
                // если важен domElem
                if (propertyString === uiControlsInfo[j].propertyString && domElement === uiControlsInfo[j].domElement) {
                    results.push(uiControlsInfo[j]);
                }
            }
            else {
                // если domElem не важен
                if (propertyString === uiControlsInfo[j].propertyString) {
                    results.push(uiControlsInfo[j]);
                }
            }
        }
        return results;
    }

    /**
     * Создать контрол для свойства промо приложения или его экрана
     * На основе информации appProperty будет выбран ui компонент и создан его экземпляр
     *
     * @param {string} propertyString
     * @param {string} viewName - имя вью, который будет использован для контрола
     * @param {string} name
     * @param {object} params
     * @param [controlParentView] для некоторых контролов место выбирается динамически. Например для групп слайдов
     * @param {HTMLElement} [productDOMElement] элемент на экране продукта к которому будет привязан контрол
     * @returns {*}
     */
    function createControl(propertyString, viewName, name, params, controlParentView, productDOMElement) {
        var ctrl = null;
        params = params || {};
        params.iFrame = $('#id-product_screens_cnt')[0];
//        try {
        // существует ли такой вью, если нет, берем по умолчанию
        if (viewName) {
            // в случае с вью регистр важен, в конфиге директивы прописаны малым регистром
            viewName = viewName.toLowerCase();
        }
        if (!viewName || config.controls[name].directives.indexOf(viewName) < 0) {
            var dirIndex = config.controls[name].defaultDirectiveIndex;
            if (dirIndex>=0) {
                // некоторые контролы могут не иметь визуальной части
                viewName = config.controls[name].directives[dirIndex];
            }
        }
        // задается по параметру или по дефолту из конфига
        var cpv = null;
        if (controlParentView) {
            cpv = $(controlParentView);
        }
        else {
            cpv = $('#'+config.controls[name].parentId);
        }
        // свойств может быть несколько, передаем массив
        var propertyStrArg = (propertyString && propertyString.indexOf(',')>=0)?propertyString.split(','):propertyString;
        ctrl = new window[name](propertyStrArg, viewName, cpv, productDOMElement, params);
//        }
//        catch(e) {
//            log(e, true);
//        }
//        log('Creating UI control for appProperty='+propertyString+' ui='+name);
        return ctrl;
    }

    function _createPreviewScreenBlock(view) {
        //TODO appContainerSize
        var appContainerSize = Editor.getAppContainerSize();
        var d = $('<div></div>')
            .css('width',appContainerSize.width)
            .css('height',appContainerSize.height)
            .addClass('screen_block'); // product_cnt.css
        d.append(view);
        return d;
    }

    /**
     * Проверяет что для этого domElement можно создать контрол с параметрами
     * Если никаких фильтров не задано, значит можно.
     * Этот механизм используется при различных опциях ответов, для них нужны разные немного контролы. Хотя и описанные одним правилом в descriptor
     *
     * @param domElement
     * @param controlParam
     */
    function _checkControlFilter(domElement, controlParam) {
        var filterAttr = $(domElement).attr('data-control-filter');
        if (filterAttr) {
            filterAttr = filterAttr.replace(new RegExp(/\s/, 'g'), '');
            var filters = filterAttr.split(',')
            for (var m = 0; m < filters.length; m++) {
                // ожидаем выражение вида key=value
                var pairs = filters[m].split('=');
                if (pairs.length==2) {
                    if (controlParam[pairs[0]]==pairs[1]) { //0=='0' должно быть равно
                        return true;
                    }
                }
            }
            // атрибут задан, но подходящего условия не нашли
            return false;
        }
        // если фильтр не указан вообще значит считаем что контрол подходит
        return true;
    }

    /**
     * Удалить контролы по типам
     * @param {array} types
     */
    function _clearControls(types) {
        for (var i = 0; i < uiControlsInfo.length;/*no increment*/) {
            var deleted = false;
            for (var j = 0; j < types.length; j++) {
                if (uiControlsInfo[i].type === types[j]) {
                    uiControlsInfo[i].control.destroy();
                    uiControlsInfo.splice(i, 1);
                    deleted = true;
                    break;
                }
            }
            if (deleted===false) {
                i++;
            }
        }
    }

    /**
     * Показать подсказку на любой элемент в редакторе
     *
     * @param {DOMElement} elem
     * @param {string} text
     */
    function showWorkspaceHint(elem, text) {
        var $elem = $(elem);
        var $hint = $(hintTemplate);
        $hint.find('.js-text').html(text);
        var eo = $elem.offset();
        // сначала элемент надо добавить в дерево, чтобв рассчитать его размеры
        $(document.body).append($hint);
        // выравнивание слева от элемента, учитывая актуальный размер элемента и подсказки
        $hint.css('top',eo.top+workspaceOffset.top+($elem.outerHeight(false)-$hint.outerHeight(false))/2+'px');
        $hint.css('left',eo.left+workspaceOffset.left-$hint.outerWidth(false)-config.editor.ui.hintRightMargin+'px');
        //TODO добавить треугольный указатель
        activeScreenHints.push($hint);
        return $hint;
    }

    /**
     * Скрыть все активные подсказки
     */
    function _hideWorkspaceHints() {
        while (activeScreenHints.length>0) {
            activeScreenHints.pop().remove();
        }
    }

    /**
     * Выделить dom-элемент на экране приложения
     * Подразумевается, что у него есть атрибут data-app-property
     * Нарисовать рамку, применить фильтр для контролов
     *
     * @param {DOMElement} $elementOnAppScreen
     */
    function selectElementOnAppScreen($elementOnAppScreen) {
        if ($elementOnAppScreen === null) {
            // снятие рамки выделения
            _drawSelectionBorder(null);
            _filterControls(null, null, showedScreenIds);
        }
        else {
            // кликнули по элементу в промо приложении, который имеет атрибут data-app-property
            // задача - отфильтровать настройки на правой панели
            var dataAppPropertyString = $elementOnAppScreen.attr('data-app-property');
            _drawSelectionBorder($elementOnAppScreen);
            _filterControls(dataAppPropertyString, $elementOnAppScreen, showedScreenIds);
        }
    }

    /**
     * Выделить элемент на экране приложения.
     * Будет нарисована рамка с маркерами по углам.
     * Поддерживается выделение только одного элемента.
     *
     * @param {DOMElement} $elementOnAppScreen
     */
    function _drawSelectionBorder($elementOnAppScreen) {
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
     * Инициализация
     */
    function init(params) {
        $appScreensIframe = $("#id-product_screens_cnt");
        $controlContainer = $('#id-control_cnt');
        selectionTemplate = $('#id-elem_selection_template').html();
        hintTemplate = $('#id-hint_template').html();
        $('#id-workspace').click(function(){
            // любой клик по документу сбрасывает фильтр контролов
            selectElementOnAppScreen(null);
        });
        quickControlPanel = new QuickControlPanel();
        workspaceOffset = $appScreensIframe.offset();
    }

    global.init = init;
    global.showScreen = showScreen;
    global.selectElementOnAppScreen = selectElementOnAppScreen;
    global.updateSelectionPosition = updateSelectionPosition;
    global.showWorkspaceHint = showWorkspaceHint;
    //TODO
    global.createControl = createControl;
    //TODO
    global.getQuickControlPanel = function(){return quickControlPanel;}
    //TODO
    global.syncUIControlsToAppProperties = syncUIControlsToAppProperties;

})(workspace);