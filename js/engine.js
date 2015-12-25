/**
 * Created by alex on 29.10.15.
 */
//var ENTITY_ATTRS = ['text', 'css', 'link', 'visible', 'data'];
var settings = [];
/**
 * В ней будут накапливаться результаты тестов
 * @type {null}
 */
var testResults = null;

//TODO надо наверное копию сделать массива entity а то как прототип использовать

//TODO полезно модель валидировать с версткой: идишки все проверять, события, и много еще полезных проверок.
// не повторения идишек и так далее, все ли setting существуют и допустимые

//if (entities) {
//    for (var i = 0; i < entities.length; i ++) {
//        if (entities[i].items !== undefined) {
//            // внутри групп тоже инитим всё
//            for (var j = 0; j < entities[i].items.length; j ++) {
//                initEntity(entities[i].items[j]);
//            }
//        }
//        initEntity(entities[i]);
//    }
//}
//
//if (states) {
//    for (var i = 0; i < states.length; i ++) {
//        initState(states[i]);
//    }
//}

//function initEntity(entity) {
//    if (entity.id) {
//        console.log('Creating entity:' + entity.id);
//        apply(entity, entity);
//        createSettingsForEntity(entity);
//    }
//    else {
//        console.error('Entity does not have id');
//    }
//}
//
//function initState(state) {
//    if (state.trigger) {
//        var a = state.trigger.split(':');
//        $(a[0]).on(a[1],function(){
//            activateState(state);
//        });
//    }
//    //TODO пока не делаю настройки для state, там ID не уникальные у entity. Пока не знаю как быть
////    for (var j = 0; j < state.entities.length; j ++) {
////        createSettingsForEntity(state.entities[j]);
////    }
//}

///**
// * Поиск элемента по id
// * Включая поиск по группам, есил они есть
// *
// * @param id
// * @returns {*}
// */
//function getEntity(id) {
//    for (var i = 0; i < entities.length; i ++) {
//        if (entities[i].id == id) {
//            return entities[i];
//        }
//        else if (entities[i].items !== undefined) {
//            for (var j = 0; j < entities[i].items.length; j ++) {
//                if (entities[i].items[j].id == id) {
//                    return entities[i].items[j];
//                }
//            }
//        }
//    }
//    return null;
//}

/**
 * Активировать состояние.
 * Применить стили и данные ко всем элементам
 *
 * @param state
 */
//function activateState(state) {
//    if (state.entities != undefined) {
//        var eid = null, ent = null, htmlId = null, entUpdate = null;
//        for (var i = 0; i < state.entities.length; i ++) {
//            entUpdate = state.entities[i];
//            eid = entUpdate.id;
//            ent = getEntity(eid);
//            apply(ent, entUpdate);
//        }
//    }
//}

/**
 * Применить к элементу какое-то оновление
 *
 * @param entity
 * @param update
 */
//function apply(entity, update) {
//    var htmlId = '#'+(entity.htmlId || entity.id);
//    if (update.text !== undefined) {
//        $(htmlId).text(update.text.value);
//    }
//    if (update.css !== undefined) {
//        var a = update.css.value.split(':');
//        $(htmlId).css(a[0],a[1]);
//    }
//    if (update.link !== undefined) {
//        $(htmlId).attr('href',update.link.value);
//    }
//    if (update.visible !== undefined) {
//        //TODO надо скопировать начальные свойства при старте. И их потом восстанавливать уметь
//        $(htmlId).css('display',(update.visible.value === true)?'block':'none');
//        entity.visible.value = update.visible.value;
//    }
//    if (update.data !== undefined) {
//        //TODO do something
//        //update.data.value
//    }
//}
//
////TODO задавать стейт по умолчанию уметь
//if (states.length > 0) {
//    activateState(states[0]);
//}

///**
// * В одной сущности может быть несколько атрибутов, значит и несколько настроек.
// *
// * @param entity
// */
//function createSettingsForEntity(entity) {
//    var sType = null;
//    for (var i = 0; i < ENTITY_ATTRS.length; i++) {
//        var propertyName = ENTITY_ATTRS[i];
//        if (entity[propertyName] !== undefined) {
//            //TODO может быть несколько свойств css. Сейчас предполагается только одно
//            console.log('Setting creating for: ' + entity.id + '.' + propertyName);
//            var s = new Setting(entity, propertyName);
//            if (s && s.isError !== true) {
//                settings.push(s);
//            }
//        }
//    }
//}

///**
// * Обновить настройки views -> entity
// */
//function applySettings() {
//    for (var i = 0; i < settings.length; i++) {
//        // компонента setting готовит обновление для entity
//        if (settings[i].isError !== true) {
//            //TODO проверка нужна вот зачем: UI загружается асинхронно и двжиок не ждет будет ли он загружен или нет
//            // а некоторых ui еще нет.
//            var updateInfo = settings[i].getUpdateFromView();
//            if (updateInfo !== null) {
//                apply(settings[i].entity, updateInfo)
//            }
//        }
//    }
//}

/**
 * Создать entity и поместить её в массив entities
 * уникальный id будет создан
 * DOM элемент, если надо, будет создан
 *
 * @param prototypeId
 */
//function createEntity(prototypeId) {
//    var e = null;
//    var p = getPrototype(prototypeId);
//    if (p) {
//
//    }
//    return e;
//}

/**
 * Найти и вернуть прототип с заданным prototypeId
 *
 * @param prototypeId
 * @returns {*}
 */
//function getPrototype(prototypeId) {
//    if (prototypes) {
//        for (var i = 0; i < prototypes.length; i ++) {
//            if (prototypes[i].prototypeId == prototypeId) {
//                return prototypes[i];
//            }
//        }
//    }
//    return null;
//}

var testMode = false;
/**
 * Проверяет выражение на верность.
 * Двойное назначение этой функции: проверка в модульных тестах, во-вторых проверка ограничений во время работы пользователя
 * Для модульных тестов требуется подключение QUnit
 *
 * @param actual - выражение, которое требуется проверить
 * @param expected - значение, которое ожидается
 * @param message - сообщение, которое объясняет что и почему проверяем
 */
function test(actual, expected, message) {
    // тестовый режим означает, что программа находится в режиме тестового прогона
    // и что используется библиотека модульных тестов для сбор и визуализации
    if (testMode === true) {
        QUnit.equals(actual, expected, message);
    }
    else {
        // обычный режим проверки свойств
        if (actual != expected) {
            testResults.push({
                result: 'error',
                actual: actual,
                expected: expected,
                message: message
            });
            log('actual='+actual+' expected='+expected+' message='+message, true);
        }
        else {
            testResults.push({
                result: 'success',
                actual: actual,
                expected: expected,
                message: message
            });
        }
    }
    return true;
}

var DESC_PREFIX='d__';

/**
 * Создать обертку для свойства app
 * Только для тех свойств у которых есть дескриптор
 *
 * @param obj
 */
function createAppProperty(obj, strPrefix) {
    strPrefix = strPrefix || '';
    strPrefix += '.';
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            // если это не дескриптор, а просто свойство
            if (key.indexOf(DESC_PREFIX)!==0) {
                // смотрим, есть ли у него дескриптор
                if (obj.hasOwnProperty(DESC_PREFIX+key)) {
                    var str = strPrefix + key;
                    log('Property string: \''+ str + '\' and desc found: ' + obj[DESC_PREFIX+key]);
                    var p = new AppProperty(str,obj[DESC_PREFIX+key]);
                    appProperties.push(p);
                }
            }
            if (obj[key] !== null && typeof obj[key] === 'object') {
                // идем глубже
                createAppProperty(obj[key], strPrefix + key);
            }
        }
    }
}

/**
 * Установить значение в продукт, в объект app[key] = value
 * Будут выполнены необходимые проверки, описанные разработчиком прототипа.
 *
 * return {}
 */
function setValue(key, value) {
    log('Changing property \''+key+'\'='+value);
    if (window.app && window.tests) {
        // обнуляем перед прогоном тестов
        testResults = [];
        var needQuatas = (typeof value === 'string');
        for (var i = 0; i < window.tests.length; i++) {
            var s = tests[i].toString();
            // запускаем тесты, в которых обнаружено данное свойство
            if (s.indexOf('.'+key) >= 0 || s.indexOf('\''+key+'\'') >= 0) {
                // клонируем настройки приложения, чтобы не них произвести тест
                //TODO может быть не эффективно на сложных объектах
                var appCopy = JSON.parse(JSON.stringify(window.app));
                // делаем изменение
                //appCopy[key] = value;
                if (needQuatas === true) {
                    eval('appCopy.'+key+'=\''+value+'\'');
                }
                else {
                    eval('appCopy.'+key+'='+value);
                }
                try {
                    // запускаем тест на новых настройках, результаты собираются в переменную
                    log('Running test...');
                    window.tests[i].call(window, appCopy);
                }
                catch(e) {
                    // что-то непредвиденное тоже обрабатываем, так как запускаются клиентские тесты
                    testResults.push({
                        result: 'error',
                        message: e
                    });
                    log(e, true);
                }
            }
        }
        // после прогонов всех тестов (если они были) можно сделать вывод о том, были ли ошибки
        // если тестов не было, то тоже считаем что всё успешно
        if (isErrorInTestResults() === false) {
            // если всё хорошо завершилось, устанавливаем свойство, это безопасно
//            window.app[key] = value;
            if (needQuatas === true) {
                eval('window.app.'+key+'=\''+value+'\'');
            }
            else {
                eval('window.app.'+key+'='+value);
            }
            log('All tests was successful. Tests count='+testResults.length+'; \''+key+'\'='+value+' was set');
            // дальше перезапустить приложение
            if (typeof window.start === 'function') {
               log('Restart app');
               window.start.call(window);
            }
        }
        else {
            log('Tests contain errors. Cannot set \''+key+'\'='+value);
        }
        return {result: '', msg: ''};
    }
    else {
        log('You must set windows.app and windows.test properties in your promoapp', true);
    }
    return {result: 'error', message: ''};
}

function isErrorInTestResults() {
    if (testResults) {
        for (var i = 0; i < testResults.length; i++) {
            if (testResults[i].result === 'error') {
                return true;
            }
        }
    }
    return false;
}

/**
 * Запуск платформы
 * Можно запустить, когда на в браузер загружен промо-проект
 *
 */
function startEngine() {
    if (window.app === undefined) {
        console.error('app object must be specified');
    }

    if (window.tests === undefined) {
        console.error('tests array must be specified');
    }

    if (window.start === undefined) {
        console.error('start function must be specified');
    }
    this.appProperties = [];
    this.testResults = [];
    createAppProperty(window.app);
}

/**
 * Приложение должно вызвать эту функцию, чтобы сообщить о запуске.
 *
 */
function appStarted() {
    if (this.appNew) {

    }
}