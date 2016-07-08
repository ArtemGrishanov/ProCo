/**
 * Created by artyom.grishanov on 08.07.16.
 */
var TestModel = Backbone.Model.extend({

    defaults: {
        currentScreen: '',
        randomizeQuestions: false,
        randomizeOptions: false,
        /**
         * Единая настройка для всех экранов, пожтому здесь
         */
        showBackgroundImage: false,
        logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',
        showQuestionProgress: true,
        /**
         * Структура вопросов с ответами
         */
        quiz: [
            {
                uiTemplate: 'id-slide_text_template',
                text: 'Мадагаскар -- это где?',
                options: [
                    {
                        text: 'Страна на западе Африки',
                        type: 'text',
                        explanation: ''
                    },
                    {
                        text: 'Остров в Атлантическом океане',
                        type: 'text',
                        explanation: ''
                    },
                    {
                        text: 'Остров на юге Африки',
                        type: 'text',
                        points: 1,
                        explanation: 'Да, верно'
                    }
                ],
                explanation: ''
            },
            {
                uiTemplate: 'id-slide_photo_template',
                text: 'Текст фото вопроса?',
                //TODO base64 data
                img: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/picture1.jpg',
                options: [
                    {
                        text: 'Вариант ответа 1',
                        points: 1
                    },
                    {
                        text: 'Вариант ответа 2'
                    }
                ],
                explanation: ''
            },
            {
                uiTemplate: 'id-slide_text_template',
                text: 'Какая самая большая страна?',
                options: [
                    {
                        text: 'Гренландия'
                    },
                    {
                        text: 'Россия',
                        points: 1
                    },
                    {
                        text: 'Австралия'
                    }
                ],
                explanation: ''
            },
            {
                uiTemplate: 'id-slide_text_template',
                text: 'Какого моря не существует?',
                options: [
                    {
                        text: 'Черное море'
                    },
                    {
                        text: 'Синее море',
                        points: 1
                    },
                    {
                        text: 'Красное море'
                    },
                    {
                        text: 'Желтое море'
                    }
                ]
            }
        ]
    },

    start: function() {
        this.set({'currentScreen':'startScr'});
    }

});