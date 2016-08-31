/**
 * Created by artyom.grishanov on 24.08.16.
 */

/**
 * Найти во вью дом-элемент, соответствующий appProperty и проверить что его значение корректно
 *
 * @param assert
 * @param view
 * @param {AppProperty} ap
 *
 * @return {boolean}
 */
function validateDomElement(assert, view, ap, screenId) {
    assert.ok(!!view===true, 'validateDomElement: view exist');

    if (ap.type=='app') {
        var elements = getElementByAppPropertyAttr(view, ap.propertyString);
        assert.ok(elements.length>0, 'validateDomElement: dom elements ('+elements.length+') found for '+ap.propertyString+' in screenId='+screenId);
        if (ap.controls[0].name === 'TextQuickInput') {
            for (var i = 0; i < elements.length; i++) {
                var $e = $(elements[i]);
                var actual = $e.text();
                var expected = ap.propertyValue;
                assert.ok(actual===expected, 'validateDomElement: expected='+expected+' actual='+actual+' in app property='+ap.propertyString+' in screenId='+screenId);
            }
        }
        else {
            // TODO все проверить не получится, сложные свойства
        }
    }
    else if (ap.type=='css') {
        var cs = ap.applyCssTo || ap.cssSelector;
        var elements = $(view).find(cs);
        assert.ok(elements.length>0, 'validateDomElement: dom elements ('+elements.length+') found for '+ap.propertyString+' in screenId='+screenId);
        for (var i = 0; i < elements.length; i++) {
            var $e = $(elements[i]);
            var actual = $e.css(ap.cssProperty).replace(/['"]+/g, ''); // могут быть кавычки, например в названиях шрифтов
            var expected = ap.propertyValue;
            assert.ok(actual===expected, 'validateDomElement: expected='+expected+' actual='+actual+' in app property='+ap.propertyString+' in screenId='+screenId);
        }
    }
    else {
        assert.ok(false, 'validateDomElement: appProperty type unknown');
    }
}

/**
 * Отфильтровать вью и оставить только те, которые содержат указанные классы
 *
 * @param views
 * @param classes
 *
 * @return {Array}
 */
function findViewsContainingClass(views, classes) {
    var result = [];
    for (var i = 0; i < views.length; i++) {
        // var $e = $('<div></div>').append(views[i].clone()); - плохо, так как вью должен быть реально добавлен в dom дерево и показан
        // так как html не возвращает код САМОГО элемента, то вручную добавляем содержимое атрибута class из корня
        // не идеально, так как название класса может совпасть с чем-нибудь :)
        var html = $(views[i]).html()+'\"'+$(views[i]).attr('class')+'\"';
        for (var j = 0; j < classes.length; j++) {
            // удяляем одну точку если она есть, так как может прийти не только имя класса, а весь селектор с точкой
            classes[j] = classes[j].replace('.','');
            var s = '[\\\"|\\\'|\\s]('+classes[j]+')[\\\"|\\\'|\\s]';
            var r = RegExp(s);
            var match = r.exec(html);
            if (match && match[0] && match[1]) {
                result.push(views[i]);
                break;
            }
        }
    }
    return result;
}

function getElementByAppPropertyAttr(view, propertyString) {
    var result = [];
    var dataElems = $(view).find('[data-app-property]');
    if (dataElems.length > 0) {
        for (var j = 0; j < dataElems.length; j++) {
            var atr = $(dataElems[j]).attr('data-app-property');
            var psArr = atr.split(',');
            for (var k = 0; k < psArr.length; k++) {
                var tspAtr = psArr[k].trim();
                if (propertyString===tspAtr) {
                    result.push(dataElems[j]);
                }
            }
        }
    }
    return (result.length > 0) ? result: null;
}