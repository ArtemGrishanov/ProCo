/**
 * Created by artyom.grishanov on 01.06.16.
 *
 */

//var BullitClass = MutApp.View.extend({
//
//        Стейты: нормал, селектед, ховер, правильный ответ
//          Выбор пиктограмм для стейтов
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

/**
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

 вью - данные, логика, то что может быть выровнено/спозиционировано.
 то есть блок текста.
 тогда к нему можно прям сразу применить пакет appProperty стандартный для текста.

 */

var TestApp = MutApp.extend({

    screenRoot: $('#id-mutapp_screens'),

    initialize: function() {
        console.log('TestApp instance initialize');
        this.models.tm = new TestModel({

        });

        var s1 = new StartScreen({
            model: this.models.tm,
            screenRoot: this.screenRoot
        });
        this.screens.startScreen = s1;

        // для всех вопросов создается по отдельному экрану
        var quiz = this.models.tm.get('quiz');
        var qs = null;
        var id = null;
        for (var i = 0; i < quiz.length; i++) {
            id = 'questionScreen'+i;
            qs = new QuestionScreen({
                id: id,
                model: this.models.tm,
                questionId: quiz[i].id,
                screenRoot: this.screenRoot
            });
            this.screens[id] = qs;
        }

        // для всех результатов по отдельному экрану
        var results = this.models.tm.get('results');
        var rs = null;
        for (var i = 0; i < results.length; i++) {
            id = 'resultScreen'+i;
            rs = new ResultScreen({
                id: id,
                model: this.models.tm,
                resultId: results[i].id,
                screenRoot: this.screenRoot
            });
            this.screens[id] = rs;
        }
    },

    start: function() {
        this.models.tm.start();
    }
});