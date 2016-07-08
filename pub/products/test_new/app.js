/**
 * Created by artyom.grishanov on 01.06.16.
 *
 *
 * === Механизмы engine ===:
 * css appproperty
 * Css Propety сериализуются в промо приложение
 * Селекторы appProperty (сразу много свойств можно выбрать)
 * альтернатива в выборе значений appProperty
 * valuePattern для appProperty
 * Прототипы в AppProperty для редактирования массивов
 * Директивы data-app-property: это связь dom-элемента и appProperty. По клику активируются контролы
 * Понятие экрана: превью экранов, апдейт экранов. Надо уметь показывать несколько экранов одновременно.
 * Данные в экране, которые нужны для рендера и триггеров
 * Функция applyStyles ?
 * Триггеры: кастомные действия связанные с редактированием
 * Templates: сериализованные appProperties
 * Публикация: перезапись в файле приложения app+css
 * Нет: зависимости свойств
 * Нет: Темы (пресеты appProperties)
 * Нет: АвтоТесты
 * Нет: дополнительные экраны?
 * Есть так много, а нету так мало? Надо ли?
 *
 * 2) Решение задачи: Технология:
 * Фреймворк: понятный описанный стандарт разработки приложений.
 * Редактор: в котором можно управлять приложением, используя стандартные контролы
 * Апи: хранение данных, статистика,
 *
 * 3) Вопросы Лейаут
 * Веб + моб
 * Что будет с версткой существующих приложений при добавлении новых компонентов/опций?
 * Как будет ломаться лейаут при установке css свойств
 */

//var BullitClass = MutApp.View.extend({
//
//    tags: null, // question_bullits,
//
//    init: function(params) {
//        this.model.on('something',onSomethingChanged);
//    },
//
//    onSomethingChanged: function() {
//
//    },
//
//    model: null,
//
//    appProperty: {
//        borderRadius: 0,
//        borderWidth: 1,
//    },
//
//    templates: {
//        // разные стейты
//    },
//
//    states: [
//        // нормал
//        // селектед
//        // ховер
//        // right answer
//        // wrong answer
//    ],
//
//    //TODO пиктограммы - это сервис редактора, просто пишу чтобы не забыть
//
//    /**
//     * Рендер: любое изменение экрана, даже hide show какой-то мелочи, все должно быть собрано в одном месте
//     * Единое место через которое идет смена виз состояния
//     * Ревизия апдейта - идишка ревизии, и фреймворк знает об этом
//     * Потом можно будет высчитать какие экраны надо будет обновить
//     */
//    render: function() {
//
//    },
//
//    parent: null,
//
//    children: null,
//
//    setBackground: function() {
//        // сменить у всех вью
//        // но опять такие у всех буллитов вопросов, может где то еще еть буллиты у которых не надо менять
//        // ...
//
//        // применить то же для всех с этими тегами
//        MutApp.applyToAll('tags'+this.tag);
//    }
//
//    // ограничения
//    // квадратность, макс-мин размеры
//
//
//    // зависимости во вью
//    // если был установлен фон-пиктограма (картинка), то снять стандартные стили
//
//});

// Backbone
/**
 * Наличие документации
 * Проверенный фреймворк
 * Повышает крутость: доступ к сообществу
 *
 *
  Чем нужно дополнить каркас backbone ?
    Экраны. Менеджер экранов.
    Дополнить основной Backbone -> MutApp (MutApp.extend...)
    applyStyles
    единая точка запуска start
    умение возвращать экраны приложения screens опред структуры
        может и не надо будет раз все вью собраны в одном месте
    уметь собрать все модели и вью в одном месте для длоступа движка
    сейчас есть единая точка поиска app.*
    Шаблоны лежат у меня тоже в app

 */

var TestApp = MutApp.extend({

    screenRoot: $('#id-mutapp_screens')[0],

    initialize: function() {
        console.log('TestApp instance initialize');
        this.models.tm = new TestModel({

        });

        var s1 = new StartScreen({
            model: this.models.tm
        });

        var q1 = new QuestionScreen({
            model: this.models.tm
        });

        this.screens.startScreen = s1;
    },

    start: function() {
        this.models.tm.start();
    }
});

var StartScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'startScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'start',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Стартовый экран',

    /**
     * @see MutApp
     */
    doWhenInDOM: function() {
        applyStyles();
    },

    /**
     * Это appProperty
     * Сам logo не является отдельным вью, так как не имеет своей логики
     */
    logoPosition: {top: 0, left: 0},

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: $('#id-start_scr_cnt').hide(),

    template: {
        "default": _.template($('#id-slide_text_template').html())
    },

    events: {
    },

    initialize: function () {
        this.model.bind("change:currentScreen", function () {
            if (this.id === this.model.get('currentScreen')) {
                this.render();
                app.showScreen(this);
            }
        }, this);
    },

    render: function() {
        this.$el.html(this.template['default']());
        return this;
    }
});

/**
 * Экран вопроса теста
 * @type {*|void|Object|extend|extend|extend}
 */
var QuestionScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'questionScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'questions',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Вопрос',

    /**
     * @see MutApp
     */
    doWhenInDOM: function() {
        applyStyles();
    },

    /**
     * Это appProperty
     * Сам logo не является отдельным вью, так как не имеет своей логики
     */
    logoPosition: {top: 0, left: 0},

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: $('#id-questions_cnt').hide(),

    template: {
        "textQtextA": _.template($('#id-slide_text_template').html()),
        "photoQtextA": _.template($('#id-slide_photo_template').html())
    },

    events: {
    },

    initialize: function () {
        this.model.bind("change:currentScreen", function () {
            if (this.id === this.model.get('currentScreen')) {
                this.render();
                app.showScreen(this);
            }
        }, this);
    },

    render: function() {
        this.$el.html(this.template['textQtextA']());
        return this;
    }
});