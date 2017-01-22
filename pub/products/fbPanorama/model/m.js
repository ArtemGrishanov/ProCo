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
//        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-121947341568004%2Fres%2F6000x1356.jpg',
//        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-121947341568004%2Fres%2F1600x1000.jpg',
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
            // пытаемся создать конфигурацию панорамы на основе размеров картинки. Размеры могут подойти сразу
            var cp = panoConfig.createConfig(img.width, img.height);
            if (cp) {
                console.log('Model.setPanoramaImage: Configuration created = '+cp.id);
            }
            else {
                console.log('Model.setPanoramaImage: Не удается создать конфигурацию для картинки этого размера. Картинка будет расширена.');
                cp = panoConfig.createConfig(panoConfig.getErrorData().srcWidth, panoConfig.getErrorData().srcHeight,
                    {vfov: panoConfig.getErrorData().targetVFOV});
                if (cp) {
                    console.log('Model.setPanoramaImage: Configuration created: '+cp.id);
                }
                else {
                    cp = null;
                    console.log('Model.setPanoramaImage: Опять не удается создать конфигурацию.');
                }
            }

            // устанавливаем только когда изображение загружено
            this.set({
                panoConfig: cp,
                previewScale: this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT / cp.srcHeight,
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
        return panoDrawing.createPanoCanvas({
            img: this.attributes.panoramaImage,
            pins: this.attributes.pins,
            width: this.attributes.panoConfig.srcWidth,
            height: this.attributes.panoConfig.srcHeight,
            pinScale: 1/this.attributes.previewScale
        });
    }
});