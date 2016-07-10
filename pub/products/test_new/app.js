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
        this.screens.startScreen = s1;

        // для всех вопросов создается по отдельному экрану
        var quiz = this.models.tm.get('quiz');
        var qs = null;
        for (var i = 0; i < quiz.length; i++) {
            qs = new QuestionScreen({
                model: this.models.tm,
                questionId: quiz[i].id
            });
            this.screens['questionScreen'+i] = qs;
        }

        // для всех результатов по отдельному экрану
        var results = this.models.tm.get('results');
        var rs = null;
        for (var i = 0; i < results.length; i++) {
            rs = new ResultScreen({
                model: this.models.tm,
                resultId: results[i].id
            });
            this.screens['resultScreen'+i] = qs;
        }
    },

    start: function() {
        this.models.tm.start();
    }
});