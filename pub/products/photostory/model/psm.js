/**
 * Created by alex on 14.01.18.
 */
var PhotostoryModel = MutApp.Model.extend({

    defaults: {
        /**
         *
         */
        id: 'psm',
        /**
         * Простое свойство
         */
        state: null,
        /**
         * @type {MutAppProperty}
         */
        slides: null,
        /**
         * Выбранный слайд для показа
         */
        slideIndex: 0
    },

    initialize: function(param) {
        //TODO не очень красиво смотрится этот вызов
        // задача: перед кодом пользователя в initialize сделать привязку application, установить апп проперти
        this.super.initialize.call(this, param);

        this.bind('change:slides', function() {
            this.start();
        });

        this.attributes.slides = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=psm slides',
            value: [
                {
                    text: '',
                    imgSrc: 'http://p.testix.me/images/products/photostory/img7.jpeg'
                },
                {
                    text: '',
                    imgSrc: 'http://p.testix.me/images/products/photostory/img5.jpeg'
                },
                {
                    text: '',
                    imgSrc: 'http://p.testix.me/images/products/photostory/3.jpeg'
                },
                {
                    text: '',
                    imgSrc: 'http://p.testix.me/images/products/photostory/img11.webp'
                },
                {
                    text: '',
                    imgSrc: 'http://p.testix.me/images/products/photostory/img10.jpg'
                }
            ]
        });
    },

    /**
     * Перевести приложение в начальное состояние
     */
    start: function() {
        this.set({
            state: 'slider',
            slideIndex: 0
        });
    },

    nextSlide: function() {
        this.set({
            slideIndex: this.getNextSlideIndex()
        });
    },

    prevSlide: function() {
        this.set({
            slideIndex: this.getPrevSlideIndex()
        });
    },

    /**
     * Вернуть следующий индекс слайда
     * @return {Number}
     */
    getNextSlideIndex: function() {
        var slidesCount = this.attributes.slides.toArray().length;
        var result = this.attributes.slideIndex + 1;
        if (result >= slidesCount) {
            result = 0;
        }
        return result;
    },

    /**
     * Вернуть следующий индекс слайда
     * @return {Number}
     */
    getPrevSlideIndex: function() {
        var result = this.attributes.slideIndex - 1;
        if (result < 0) {
            var slidesCount = this.attributes.slides.toArray().length;
            result = slidesCount - 1;
        }
        return result;
    },

    getSlideInfo: function(index) {
        return this.attributes.slides.toArray()[index];
    }
});