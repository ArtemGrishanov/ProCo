/**
 * Created by artyom.grishanov on 09.01.17.
 *
 */
var FbPanoramaModel = MutApp.Model.extend({

    defaults: {
        id: 'mm',
        state: null,
        logoUrl: 'https://s3.eu-central-1.amazonaws.com/proconstructor/res/thumb_logo.jpg',
        logoLink: null,
        /**
         * Какую по умолчанию показывать высоту картинки на экране превью
         * Из этого будет рассчитан масштаб previewScale
         */
        DEF_PANORAMA_PREVIEW_HEIGHT: 600,
        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/6000x3562.jpg',
//        panoramaImgSrc: 'http://localhost:63342/ProCo/pub/i/samples/6000x3562.jpg',
        panoramaImage: null,
        previewScale: 1,
        pins: [
            {
                id: '12345678',
                data: {
                    text: 'Пример метки<br>на панораме'
                },
                position: {
                    // center of block
                    left: 500,
                    top: 500
                },
                uiTemplate: 'id-text_pin_template'
            }
        ]
    },

    initialize: function(param) {
        this.super.initialize.call(this, param);
    },

    start: function() {
        this.setPanoramaImage(this.attributes.panoramaImgSrc);
    },

    setPanoramaImage: function(url, callback) {
        this.set({
            panoramaImage: null
        });
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = (function() {
            // устанавливаем только когда изображение загружено
            this.set({
                previewScale: this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT/img.height,
                panoramaImage: img
            });
            // приложение получить свой новый актуальный размер в зависимости от загруженной картинки и масштаба
            this.application.width = Math.round(img.width * this.attributes.previewScale);
            this.application.height = this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT;

        }).bind(this);
        img.onerror = function() {

        };
        img.src = url;
    },

    createPanoCanvas: function() {
        var configPano = {
            srcWidth: this.attributes.panoramaImage.width,
            srcHeight: this.attributes.panoramaImage.height
        };
        return panoDrawing.createPanoCanvas({
            img: this.attributes.panoramaImage,
            pins: this.attributes.pins,
            width: configPano.srcWidth,
            height: configPano.srcHeight,
        });
    }
});