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
            this._onSlidesUpdate();
            this.start();
        });

        this.attributes.slides = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=psm slides',
            value: [
                {
                    text: '',
                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/6000x3562.jpg'
                    // preview: https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/thumb__6000x3562.jpg
                },
                {
                    text: '',
                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/1.jpeg'
                },
                {
                    text: '',
                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/IMG_2352.JPG'
                    // preview: https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/thumb__IMG_2352.JPG
                },
                {
                    text: '',
                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/IMG_2304.JPG'
                    // preview: https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/thumb__IMG_2304.JPG
                }
//                {
//                    text: '',
//                    imgSrc: 'http://p.testix.me/images/products/photostory/img7.jpeg'
//                },
//                {
//                    text: '',
//                    imgSrc: 'http://p.testix.me/images/products/photostory/img5.jpeg'
//                },
//                {
//                    text: '',
//                    imgSrc: 'http://p.testix.me/images/products/photostory/3.jpeg'
//                },
//                {
//                    text: '',
//                    imgSrc: 'http://p.testix.me/images/products/photostory/img11.webp'
//                },
//                {
//                    text: '',
//                    imgSrc: 'http://p.testix.me/images/products/photostory/img10.jpg'
//                }
            ]
        });

        this._onSlidesUpdate();
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

    setSlideIndex: function(value) {
        var slidesCount = this.attributes.slides.toArray().length;
        if (value >= slidesCount) {
            value = slidesCount-1;
        }
        if (value < 0) {
            value = 0;
        }
        this.set({
            slideIndex: value
        });
    },

    /**
     * Вернуть следующий индекс слайда
     * Без закольцовки логика
     *
     * @return {Number}
     */
    getNextSlideIndex: function() {
        var slidesCount = this.attributes.slides.toArray().length;
        var result = this.attributes.slideIndex + 1;
        if (result >= slidesCount) {
            result = slidesCount-1;
        }
        return result;
    },

    /**
     * Вернуть следующий индекс слайда
     * Без закольцовки логика
     *
     * @return {Number}
     */
    getPrevSlideIndex: function() {
        var result = this.attributes.slideIndex - 1;
        if (result < 0) {
            result = 0;
        }
        return result;
    },

    getSlideInfo: function(index) {
        return this.attributes.slides.toArray()[index];
    },

    /**
     *
     * @private
     */
    _onSlidesUpdate: function() {
        var slidesArr = this.attributes.slides.toArray();
        for (var i = 0; i < slidesArr.length; i++) {
            var imgSrc = slidesArr[i].imgSrc;
            // .../res/IMG_2304.JPG -> ...res/thumb__6000x3562.jpg
            slidesArr[i].imgThumbSrc = imgSrc.replace('/res/','/res/thumb20__');
        }
    }
});