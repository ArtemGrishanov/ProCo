/**
 * Created by artyom.grishanov on 16.09.17.
 *
 * инспектор выполняет проверку текущего состояния редактора
 * - проверить соответствие количества контролов и свойств
 * - экранов в приложении и экраны в контроле
 * -
 *
 * Каждый модуль в отдельности (ControlManager, workspace и т.д.) не может обеспечить проверки,
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
        var se = workspace.getSelectedElement();
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
                (filter.propertyStrings && filter.propertyStrings.indexOf(c.propertyString) >= 0)
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


        // для текущего экрана у всех контролов установлен productDomElements и равен uiElement
        var activeScreen = app.getScreenById(Editor.getActiveScreen());
        for (var i = 0; i < activeScreen._linkedMutAppProperties.length; i++) {
            var ap = activeScreen._linkedMutAppProperties[i];
            var ctrls = ControlManager.getControls({
                propertyString: ap.propertyString
            });
            for (var j = 0; j < ctrls.length; j++) {
                assert.ok(ap.uiElement === ctrls[j].$productDomElement[0], 'For property \''+ap.propertyString+'\' uiElement == $productDomElement in control');
            }
        }

        // проверка что screen._linkedMutAppProperties[i].uiElement действительно есть на экране screen
        var scr = app.getScreenById(Editor.getActiveScreen());
        for (var i = 0; i < scr._linkedMutAppProperties.length; i++) {
            var ap = scr._linkedMutAppProperties[i];
            assert.ok($.contains(scr.$el[0], ap.uiElement) === true, 'Screen \''+scr.id+'\' contains uiElement from \''+ap.propertyString+'\'');
        }

        // todo equal
        // uiElement === productDomElement

        // для текущего экрана: экран действительно содержит $productDomElement контролов (которые должны быть на экране)
        // pre: экран должен быть показан, то есть произошла линковка $productDomElement
//        var ctrls = ControlManager.getControls({
//            propertyString: "id=pm quiz.0.question.text"
//        });
//        assert.ok(ctrls.length === 1 && ctrls[0].$productDomElement);
//        assert.ok($.contains(scrQuestion0.$el[0], ctrls[0].$productDomElement[0]) === true);

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