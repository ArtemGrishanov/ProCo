/**
 * Created by artyom.grishanov on 04.07.17.
 */
var PersonalityModel = MutApp.Model.extend({

    defaults: {
        id: 'pm',
        /**
         * Простое свойство
         */
        state: null,
        /**
         * Вопросы теста
         */
        quiz: new MutAppPropertyArray({
            label: {},
            propertyString: 'id=pm quiz',
            propertyName: 'quiz',
            value: []
        }),

        /**
         * Специальное свойство
         * MutAppProperty доступное для редактирования вовне приложения
         */
        showBackgroundImage: new MutAppProperty({
            propertyString: 'id=pm showBackgroundImage',
            propertyName: 'showBackgroundImage', // дублирование имени
            value: true
        }),

        results: []
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);
        this._updateResults();
    },

    start: function() {
        this.set({
            state: 'welcome'
        });
    },

    /**
     * Найти вопрос ио Id
     * @param id
     * @returns {*}
     */
    getQuestionById: function(id) {
        var quizValue = this.attributes.quiz.getValue();
        for (var i = 0; i < quizValue.length; i++) {
            if (id === quizValue[i].id) {
                return quizValue[i];
            }
        }
        return null;
    },

    /**
     * Сгенерировать идишки для вопроса и опций ответа
     *
     * @param question
     * @private
     */
    _makeUidForQuizElement: function(quizElement) {
        quizElement.id = MD5.calc(quizElement.question.text + j).substr(0,6);
        if (quizElement.answer.options) {
            // опций ответа может и не быть
            for (var i = 0; i < quizElement.answer.options.length; i++) {
                var o = quizElement.answer.options[i];
                o.id = MD5.calc(o.text + o.img + j + i).substr(0,6);
            }
        }
    },

//    _makeUidForQuiz: function() {
//        for (var j = 0; j < this.attributes.quiz.length; j++) {
//            var q = this.attributes.quiz[j];
//            q.id = MD5.calc(q.question.text + j);
//            if (this.attributes.quiz[j].answer.options) {
//                // опций ответа может и не быть
//                for (var i = 0; i < this.attributes.quiz[j].answer.options.length; i++) {
//                    var o = q.answer.options[i];
//                    o.id = MD5.calc(o.text + o.img + j + i).substr(0,6);
//                }
//            }
//        }
//    },

    _updateResults: function() {

    },

    /**
     * Объект-Прототип для добавления в массив
     * Возможно нужна функция
     */
    quizProto1: function() {
        var result = {
            // id: '23434536645'; id for question will be generated
            question: {
                // атрибуты внутри используются для рендера uiTemplate
                uiTemplate: 'id-question_text_template',
                text: new MutAppProperty({
                    model: this,
                    application: this.application,
                    propertyName: null,
                    propertyString: 'id=pm quiz.'+app.model.attributes.quiz.getValue().length+'.question.text',
                    value: 'Сколько будет дважды два?'
                })
            },
            explanation: {
                // блок, который будет показан после ответа, в отдельном экране поверх вопроса
                uiTemplate: 'id-explanation_text_template',
                text: 'Конечно же 4!'
            },
            answer: {
                // тип механики ответа: выбор только одной опции, и сразу происходит обработка ответа
                type: 'radiobutton',
                uiTemplate: 'id-answer_question_lst',
                options: [
                    {
                        // атрибуты внутри используются для рендера uiTemplate
                        uiTemplate: 'id-option_text_template',
                        text: '1',
                        type: 'text'
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: '4',
                        type: 'text',
                        points: 1
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: '3',
                        type: 'text'
                    },
                    {
                        uiTemplate: 'id-option_text_template',
                        text: 'Неизвестно',
                        type: 'text'
                    }
                ]
            }
        };
        app.model._makeUidForQuizElement(result);
        return result;
    }
});