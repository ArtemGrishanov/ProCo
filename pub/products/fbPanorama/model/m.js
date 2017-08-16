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
//        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-121947341568004%2Fres%2FIMG_8565-1.JPG',
//        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/6000x3562.jpg',
//        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-121947341568004%2Fres%2F1600x1000.jpg',
//        panoramaImgSrc: 'https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-121947341568004%2Fres%2F4096x433.jpg',
//        panoramaImgSrc: 'http://localhost:63342/ProCo/demos/PanoramaDemo/images/6000x1217.jpg',
        panoramaImgSrc: 'http://localhost:63342/ProCo/temp/bugs/IMG_8565-1.jpg',
        panoramaImage: null,
        imageProgress: 0,
        previewScale: 1,
        panoCanvas: null,
        panoConfig: null,
        pinsBackgroundColor: '#33bbed',
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
                backgroundColor: '#33bbed', //@deprecated цвет фона
                color: '#fff', // цвет текста
                uiTemplate: 'id-text_pin_template',
                // модификатор стрелки
                modArrow: 'ar_bottom' // ar_bottom_left ar_bottom_right ar_top ar_top_left ar_bottom_right
            }
//            ,{
//                id: '12345678',
//                data: {
//                    text: 'Пример метки<br>на панораме'
//                },
//                position: {
//                    // center of block
//                    left: 500,
//                    top: 200
//                },
//                backgroundColor: '#f00', // цвет фона
//                color: '#000', // цвет текста
//                uiTemplate: 'id-text_pin_template',
//                // модификатор стрелки
//                modArrow: 'ar_bottom' // ar_bottom_left ar_bottom_right ar_top ar_top_left ar_bottom_right
//            }
        ],
        logoImgSrc: '../../i/logo_big.png',
        logoImg: null,
        /**
         * Режим просмотра панорамы с помощью проигрывателя http://photo-sphere-viewer.js.org/
         *
         * В консоли:
         * var ap = Engine.getAppProperty('id=mm photoViewerMode');
         * Engine.setValue(ap, true);
         */
        photoViewerMode: false,
        /**
         * Скомпилированная картинка для плеера photo-sphere-viewer
         * Применяется в photoViewerMode=true
         *
         * Примеры
         * Дача 'https://s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/7e69f66993/forFBUpload.jpg',
         * Сингапур 'https://s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/1d1f4f3236/forFBUpload.jpg'
         */
        panoCompiledImage: null,//'https://s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/1d1f4f3236/forFBUpload.jpg',
        /**
         * Объект photo-sphere-viewer.js
         */
        viewer: null
    },

    initialize: function(param) {
        this.super.initialize.call(this, param);
        this.attributes.logoImg = new Image();
        this.attributes.logoImg.src = this.attributes.logoImgSrc;
    },

    start: function() {
        this.extendImageClass();
        this.setPanoramaImage(this.attributes.panoramaImgSrc);
    },

    setPanoramaImage: function(url, callback) {
        this.set({
            panoramaImage: null,
            imageProgress: 0
        });
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onprogress = (function(e) {
            this.set({
                imageProgress: img.completedPercentage || 0
            });
        }).bind(this);
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

            // если запуск из витрины
            // то запоминаем текущую картинку, чтобы при ее смене удалить пины. Шаболнные пины не нужны
            if (this.application.engineStorage.get('delPins')==1 &&
                this.application.engineStorage.get('originImg')!==url) {
                //console.log('>>>>>>>>>>>>>>>>MUTAPP SAYS: УДАЛЯЮ ПИНЫ');
                // удаление пинов при смене шаблонной картинки первый раз
                this.set({
                   pins: []
                });
                // надо попросить движок также сбросить это апп проперти
                this.application.engineStorage.setAppProperty('id=mm pins',[]);
                this.application.engineStorage.set({
                    delPins: 0
                });
            }
            else if (this.application.engineStorage.get('ref') == 'strf' &&
                this.application.engineStorage.get('delPins')==undefined) {
                //console.log('>>>>>>>>>>>>>>>>MUTAPP SAYS: ВХОД С ВИТРИНЫ ВИЖУ');
                this.application.engineStorage.set({
                    originImg: url,
                    delPins: 1
                });
            }

            // устанавливаем только когда изображение загружено
            this.set({
                //panoCanvas: this.createPanoCanvas(cp, img, this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT / cp.srcHeight, this.attributes.pins),
                panoConfig: cp,
                previewScale: this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT / cp.srcHeight,
                panoramaImage: img,
                imageProgress: 100
            });


            if (this.attributes.photoViewerMode === true &&
                (this.application.mode === 'preview' || this.application.mode === 'publish')) {
                // для опубликованного photo-viewer приложения оставить обычный размер 800x600
            }
            else {
                // mode === edit || mode === none
                // для предпросмотра facebook панорам нужно показывать картинку в полную ширину,
                this.application.width = Math.round(cp.srcWidth * this.attributes.previewScale);
                this.application.height = this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT;
            }

        }).bind(this);
        img.onerror = function() {

        };
        if (img.load) {
            // если поддерживается метод загрузки с прогрессом то используем его
            img.load(url);
        }
        else {
            img.src = url;
        }
    },

    createPanoCanvas: function(config, image, scale, pins, pinsBackgroundColor) {
        config = config || this.attributes.panoConfig;
        image = image || this.attributes.panoramaImage;
        scale = scale || this.attributes.previewScale;
        pins = pins || this.attributes.pins;
        pinsBackgroundColor = pinsBackgroundColor || this.attributes.pinsBackgroundColor;
        var logoImg = this.attributes.logoImg;
        return panoDrawing.createPanoCanvas({
            img: image,
            pins: pins,
            srcWidth: config.srcWidth,
            srcHeight: config.srcHeight,
            panoWidth: config.panoWidth,
            panoHeight: config.panoHeight,
            pinScale: 1/scale,
            logo: logoImg,
            pinsBackgroundColor: pinsBackgroundColor
        });
    },

    /**
     * Добавить метод загрузки, который обеспечить показ прогресса загрузки картинки
     */
    extendImageClass: function() {
        if (typeof(Blob) != 'undefined' && typeof(ArrayBuffer) != 'undefined') {
            Image.prototype.load = function(url){
                var thisImg = this;
                var xmlHTTP = new XMLHttpRequest();
                xmlHTTP.open('GET', url,true);
                xmlHTTP.responseType = 'arraybuffer';
                xmlHTTP.onload = function(e) {
                    var blob = new Blob([this.response]);
                    thisImg.src = window.URL.createObjectURL(blob);
                };
                xmlHTTP.onprogress = function(e) {
                    thisImg.completedPercentage = parseInt((e.loaded / e.total) * 100);
                    if (thisImg.onprogress) {
                        thisImg.onprogress();
                    }
                };
                xmlHTTP.onloadstart = function() {
                    thisImg.completedPercentage = 0;
                };
                xmlHTTP.send();
            };
            Image.prototype.completedPercentage = 0;
        }
    }
});