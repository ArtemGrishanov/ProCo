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
        slideIndex: 0,
        /**
         * Сохраненные картинки слайдов
         * url: Image
         */
        savedImages: {}
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
            value: []
//            value: [
//                {
//                    text: 'Победительницей 66-го конкурса красоты «Мисс Вселенная», финал которого прошел 26 ноября в Лас-Вегасе, стала 22-летняя представительница ЮАР Деми-Леи Нель-Петерс. Девушка получила корону из рук прошлогодней финалистки – француженки Ирис Миттенар.',
//                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/6000x3562.jpg'
//                    // preview: https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/thumb__6000x3562.jpg
//                },
//                {
//                    text: 'Второй слад вот',
//                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/1.jpeg'
//                },
//                {
//                    text: 'Третий слайдик',
//                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/IMG_2352.JPG'
//                    // preview: https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/thumb__IMG_2352.JPG
//                },
//                {
//                    text: 'Четвертый слайдддддд',
//                    imgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/IMG_2304.JPG'
//                    // preview: https://s3.eu-central-1.amazonaws.com/proconstructor/43d927ad-17a1-4d07-84c2-c273dff1a831/res/thumb__IMG_2304.JPG
//                },
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
//                }
////                {
////                    text: '',
////                    imgSrc: 'http://p.testix.me/images/products/photostory/img11.webp'
////                },
////                {
////                    text: '',
////                    imgSrc: 'http://p.testix.me/images/products/photostory/img10.jpg'
////                }
//            ]
        });



        this.attributes.showLogoInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=psm showLogoInResults',
            value: true
        });
        this.attributes.shadowEnableInResults = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=psm shadowEnableInResults',
            value: true
        });
        this.attributes.logoLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=psm logoLink',
            value: 'http://testix.me'
        });
        this.attributes.downloadLink = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=psm downloadLink',
            value: 'http://testix.me'
        });
        this.attributes.resultTitle = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Result title',
            propertyString: 'id=psm resultTitle'
        });
        this.attributes.resultDescription = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Result description',
            propertyString: 'id=psm resultDescription'
        });
        this.attributes.restartButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Заново',
            propertyString: 'id=psm restartButtonText'
        });
        this.attributes.downloadButtonText = new MutAppProperty({
            application: this.application,
            model: this,
            value: 'Download',
            propertyString: 'id=psm downloadButtonText'
        });
        this.attributes.logoPositionInResults = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 300, left: 20},
            propertyString: 'id=psm logoPositionInResults'
        });
        this.attributes.fbSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=psm fbSharingEnabled'
        });
        this.attributes.vkSharingEnabled = new MutAppProperty({
            application: this.application,
            model: this,
            value: true,
            propertyString: 'id=psm vkSharingEnabled'
        });
        this.attributes.fbSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 219, left: 294},
            propertyString: 'id=psm fbSharingPosition'
        });
        this.attributes.vkSharingPosition = new MutAppPropertyPosition({
            application: this.application,
            model: this,
            value: {top: 270, left: 294},
            propertyString: 'id=psm vkSharingPosition'
        });
        this.attributes.showDownload = new MutAppProperty({
            application: this.application,
            model: this,
            value: false,
            propertyString: 'id=psm showDownload'
        });
        this.attributes.logoUrl = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=psm logoUrl',
            value: '//s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg'
        });
        this.attributes.resultBackgroundImage = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=psm resultBackgroundImage',
            value: ''
        });

        this.updateShareEntities();
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

//    nextSlide: function() {
//        this.set({
//            slideIndex: this.getNextSlideIndex()
//        });
//    },
//
//    prevSlide: function() {
//        this.set({
//            slideIndex: this.getPrevSlideIndex()
//        });
//    },

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

    /**
     *
     * @param index
     * @returns {*}
     */
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
            var src = slidesArr[i].imgSrc.getValue();
            // .../res/IMG_2304.JPG -> ...res/thumb__6000x3562.jpg
            slidesArr[i].imgThumbSrc = src.replace('/res/','/res/thumb20__');
        }
    },

    /**
     * Начать просмотр слайдов с начала
     */
    restart: function() {
        this.set({
            state: 'slider',
            slideIndex: 0
        });
    },

    /**
     * Обновить ентити для шаринга
     * Создать или обновить тексты
     */
    updateShareEntities: function() {
        var shareEntitiesArr = this.application.shareEntities.toArray();

        var titleText = this.attributes.resultTitle.getValue() || '';
        var descriptionText = this.attributes.resultDescription.getValue() || '';
        if (!shareEntitiesArr || shareEntitiesArr.length === 0) {
            var dictId = MutApp.Util.getUniqId(6);
            this.application.shareEntities.addElement({
                id: 'result0',
                title: titleText,
                description: descriptionText,
                imgUrl: new MutAppProperty({
                    propertyString: 'appConstructor=mutapp shareEntities.'+dictId+'.imgUrl',
                    model: this,
                    application: this.application,
                    value: null
                })
            }, 0, dictId);
        }
        else {
            var oneEntity = shareEntitiesArr[0];
            oneEntity.title = titleText;
            oneEntity.description = descriptionText;
        }
    },

    /**
     * Объект-Прототип для добавления в массив
     */
    slideProto1: function() {

        var slideDictionaryId = MutApp.Util.getUniqId(6);
        this.set({
            lastAddedSlideDictinatyId: slideDictionaryId
        });

        var text = new MutAppProperty({
            propertyString: 'id=psm slides.'+slideDictionaryId+'.text',
            model: this,
            application: this.application,
            value: 'Input text here'
        });
        var imgSrc = new MutAppProperty({
            propertyString: 'id=psm slides.'+slideDictionaryId+'.imgSrc',
            model: this,
            application: this.application,
            value: '//p.testix.me/images/products/common/i/Placeholder.png'
        });

        // теперь из подготовленных объектов собираем целый объект-слайд
        var element = {
            text: text,
            imgSrc: imgSrc
        };

        return {
            id: slideDictionaryId,
            element: element
        };
    },

    /**
     * Закешировать объект картинку по ее урлу
     *
     * @param {string} url
     * @param img
     */
    saveImage: function(url, img) {
        this.attributes.savedImages[url] = img;
    }
});