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

        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/6000x3562.jpg',
//        panoramaImgSrc: 'http://localhost:63342/ProCo/pub/i/samples/6000x3562.jpg',
        panoramaImage: null,

        pins: [
            {
                id: '12345678',
                data: {
                    text: 'Пример метки<br>на панораме'
                },
                position: {
                    left: 400,
                    top: 280
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
        img.onload = (function() {
            // устанавливаем только когда изображение загружено
            this.set({
                panoramaImage: img
            });
        }).bind(this);
        img.onerror = function() {

        };
        img.src = url;
    }
});