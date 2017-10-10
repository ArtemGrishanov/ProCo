/**
 * Created by artyom.grishanov on 16.09.17.
 *
 * инспектор выполняет проверку текущего состояния редактора
 * - проверить соответствие количества контролов и свойств
 * - экранов в приложении и экраны в контроле
 * -
 *
 * Каждый модуль в отдельности (ControlManager, Workspace и т.д.) не может обеспечить проверки,
 * так как у них нет всех данных для этого.
 *
 * 1) используется в автотестах
 * 2) можно вызвать просто в любой момент работы редактора
 */
var inspector = {};

(function(global) {

    function isOK(param) {
        param = param || {};
        var app = param.app || Editor.getEditedApp();
        var assert = param.assert || _getMockAssert();

        // приложение app имеет тип edit
        assert.ok(app.mode === 'edit', 'app has type \'edit\'');

        // число контролов верное, соответствует свойствам
        assert.ok(app.getExpectedControlsCount() === ControlManager.getControlsCount(), 'Expected control count in app and real control count in ControlManager are equal.');

        // для каждого MutAppProperty у которого задан контрол, действительно создан контрол
        var propWithControls = app.getPropertiesWithControls();
        for (var i = 0; i < propWithControls.length; i++) {
            var ap = propWithControls[i];
            var ctrls = ControlManager.getControls({
                propertyString: ap.propertyString
            });
            assert.ok(ctrls.length === ap.controls.length, 'Control(s) for \''+ap.propertyString+'\' exists');
        }

        // фильтр по экрану стоит верно, экран действительно показан в приложении, а остальные скрыты
        assert.ok(Editor.getActiveScreen() === ControlManager.getFilter().screen.id, 'ControlManager screen filter is ok');
        for (var i = 0; i < app._screens.length; i++) {
            var s = app._screens[i];
            if (s.id === Editor.getActiveScreen()) {
                assert.ok(s.$el.css('display') === 'block', 'Active screen \'' + s.id + '\' is shown');
            }
            else {
                assert.ok(s.$el.css('display') === 'none', 'Non active screen \'' + s.id + '\' is hidden');
            }
        }

        // фильтр по propertyString соответствует выделенному элементу
        var se = Workspace.getSelectedElement();
        if (se) {
            assert.ok(se.attr('data-app-property') === ControlManager.getFilter().propertyStrings.join(','), 'ControlManager propertyString filter is ok');
        }

        // проверить что фильтрованные контролы действительно видны, а другие скрыты
        var ctrls = ControlManager.getControls();
        var filter = ControlManager.getFilter()
        var quickControlsFiltered = false; // признак того, что контролы из quick panel попали в фильтр и их надо показывать
        for (var i = 0; i < ctrls.length; i++) {
            var c = ctrls[i];
            if (c.controlFilter === 'always' ||
                (c.controlFilter === 'screen' && c.controlFilterScreenCriteria && filter.screen && filter.screen[c.controlFilterScreenCriteria.key] === c.controlFilterScreenCriteria.value) ||
                (filter.propertyStrings && filter.propertyStrings.indexOf(c.propertyString) >= 0) ||
                (c.controlFilter === 'screenPropertyString' && ControlManager._screenHasDataFilter(filter.screen, c.propertyString) === true)
                ) {
                // в фильтре - должен быть показан
                assert.ok(c.isShown() === true, 'control \''+c.propertyString+'\' is shown');
                if (config.controls[c.controlName].type === 'quickcontrolpanel') {
                    quickControlsFiltered = true;
                }
            }
            else {
                // не в фильре - должен быть скрыт
                assert.ok(c.isShown() === false, 'control \''+c.propertyString+'\' is hidden');
            }
        }
        if (quickControlsFiltered === true) {
            // для контрола типа quickcontrolpanel надо проверить что показана и сама панелька
            assert.ok($('#id-control_cnt').find('.js-quick_panel').css('display') === 'block', 'quickcontrolpanel panel is shown for \''+c.propertyString+'\'');
        }
        else {
            assert.ok($('#id-control_cnt').find('.js-quick_panel').css('display') === 'none', 'quickcontrolpanel panel is hidden for \''+c.propertyString+'\'');
        }

        // для текущего экрана у всех контролов установлен productDomElement и равен соответствующему _linkedElementsOnScreen[screen_id]
        var activeScreen = app.getScreenById(Editor.getActiveScreen());
        for (var i = 0; i < activeScreen._linkedMutAppProperties.length; i++) {
            var ap = activeScreen._linkedMutAppProperties[i];
            var ctrls = ControlManager.getControls({
                propertyString: ap.propertyString
            });
            for (var j = 0; j < ctrls.length; j++) {
                // TODO
                // $productDomElements - по умолчанию в AbstractControls
                // $productDomElement в Drag + TextQuickInput используется
                //assert.ok(ap.getLinkedElementsOnScreen(activeScreen.id)[0] === ctrls[j].$productDomElement[0], 'For property \''+ap.propertyString+'\' uiElement == $productDomElement in control');
            }
        }

        // проверка что screen._linkedMutAppProperties[i].getLinkedElementsOnScreen(screen_id) действительно есть на экране screen
        // проверяется только активный экран
        var scr = app.getScreenById(Editor.getActiveScreen());
        for (var i = 0; i < scr._linkedMutAppProperties.length; i++) {
            var ap = scr._linkedMutAppProperties[i];
            var elems = ap.getLinkedElementsOnScreen(Editor.getActiveScreen());
            for (var n = 0; n < elems.length; n++) {
                assert.ok($.contains(scr.$el[0], elems[n]) === true, 'Screen \''+scr.id+'\' contains ui element from \''+ap.propertyString+'\'');
            }
        }

        // _registeredElements внутри Workspace
        //      _registeredElements['startScr'] = [e1,e2...]
        // - количество элементов _registeredElements соответствует уникальным элементам screen._linkedMutAppProperties
        // - сравнение элементов _registeredElements и уникальных в screen._linkedMutAppProperties
        // - нет лишних экранов в _registeredElements
        // scr - активный экран
        var unicLinkedElemenents = [];
        for (var i = 0; i < scr._linkedMutAppProperties.length; i++) {
            // переберем все data-app-property элементы для текущего экрана, соберем уникальные
            var ap = scr._linkedMutAppProperties[i];
            var linkedElements = ap.getLinkedElementsOnScreen(scr.id);
            for (var j = 0; j < linkedElements.length; j++) {
                if (unicLinkedElemenents.indexOf(linkedElements[j]) < 0) {
                    unicLinkedElemenents.push(linkedElements[j]);
                    // проверить что внутри workspace есть те же самые элементы
                    assert.ok(Workspace._registeredElements[scr.id].indexOf(linkedElements[j]) >= 0, 'one Workspace._registeredElement exist');
                }
            }
        }
        assert.ok(Workspace._registeredElements[scr.id].length === unicLinkedElemenents.length, 'Workspace._registeredElements count is ok');
        // нет лишних экранов внутри Workspace
        for (var key in Workspace._registeredElements) {
            if (Workspace._registeredElements.hasOwnProperty(key) === true) {
                assert.ok(app.getScreenById(key), 'Screen from Workspace._registeredElements: \'' + key + '\' exist in app');
            }
        }



        // для текущего экрана: экран действительно содержит $productDomElement контролов (которые должны быть на экране)
        // pre: экран должен быть показан, то есть произошла линковка $productDomElement
//        var ctrls = ControlManager.getControls({
//            propertyString: "id=pm quiz.0.question.text"
//        });
//        assert.ok(ctrls.length === 1 && ctrls[0].$productDomElement);
//        assert.ok($.contains(scrQuestion0.$el[0], ctrls[0].$productDomElement[0]) === true);

        app.isOK(assert);

        console.log('Inspector.isOK: checking finished. See qunit log or console for details.');
    }

    /**
     * Подготовить фейковый объект assert
     *
     * @returns {{ok: Function}}
     * @private
     */
    function _getMockAssert() {
        return {
            ok: function(value, message) {
                if (!!value === false) {
                    console.error(message);
                }
                return !!value === true;
            }
        }
    }

    global.isOK = isOK;

})(inspector);
