/**
 * Created by artyom.grishanov on 09.01.17.
 *
 */
var FbPanoramaModel = MutApp.Model.extend({

    defaults: {
        id: 'mm',
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
        /**
         * @type {MutAppProperty}
         */
        panoramaImgSrc: null, //'http://localhost:63342/ProCo/temp/bugs/IMG_8565-1.jpg',
        panoramaImage: null,
        imageProgress: 0,
        previewScale: 1,
        panoCanvas: null,
        panoConfig: null,
        /**
         * @type {MutAppProperty}
         */
        pins: null,
        logoImgSrc: 'i/logo_big.png',
        logoImg: null,
        /**
         * Режим просмотра панорамы с помощью проигрывателя http://photo-sphere-viewer.js.org/
         * Если же photoViewerMode = false, то это фейсбук панорама
         *
         * @type MutAppProperty
         */
        photoViewerMode: null,
        /**
         * Скомпилированная картинка для плеера photo-sphere-viewer
         * Применяется в photoViewerMode=true
         *
         * Примеры
         * Дача 'https://s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/7e69f66993/forFBUpload.jpg',
         * Сингапур 'https://s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/1d1f4f3236/forFBUpload.jpg'
         *
         * @type MutAppProperty
         */
        panoCompiledImage: null,//'https://s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/1d1f4f3236/forFBUpload.jpg',
        /**
         * Объект photo-sphere-viewer.js
         */
        viewer: null,
        /**
         * @type {MutAppProperty}
         */
        pinsBackgroundColor: null,
        /**
         * @type {MutAppProperty}
         */
        pinsFontColor: null
    },

    initialize: function(param) {
        this.super.initialize.call(this, param);
        this.attributes.logoImg = new Image();
        this.attributes.logoImg.src = this.attributes.logoImgSrc;

        this.attributes.panoramaImgSrc = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm panoramaImgSrc',
            value: 'https://s3.eu-central-1.amazonaws.com/testix.me/i/samples/rome1200x600.png'
            // value: 'http://localhost:63342/ProCo/pub/i/samples/rome1200x600.png'
            // value: 'http://localhost:63342/ProCo/pub/i/samples/6000x3562.jpg'
        });
        this.attributes.panoramaImgSrc.bind('change', this.onPanoramaImgSrcChange, this);

        this.attributes.pins = new MutAppPropertyDictionary({
            application: this.application,
            model: this,
            propertyString: 'id=mm pins',
            value: []
        });

        this.attributes.photoViewerMode = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm photoViewerMode',
            value: false
        });

        this.attributes.pinsBackgroundColor = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm pinsBackgroundColor',
            value: '#33bbed'
        });

        this.attributes.pinsFontColor = new MutAppProperty({
            application: this.application,
            model: this,
            propertyString: 'id=mm pinsFontColor',
            value: '#fff'
        });
    },

    start: function() {
        this.extendImageClass();
        this.setPanoramaImage(this.attributes.panoramaImgSrc.getValue());
    },

    getPin: function(pinId) {
        var pinArr = this.attributes.pins.toArray();
        for (var i = 0; i < pinArr.length; i++) {
            if (pinArr[i].id === pinId) {
                return pinArr[i];
            }
        }
        return null;
    },

    getPinDictionaryId: function(pinId) {
        var pinArr = this.attributes.pins.toArray();
        for (var i = 0; i < pinArr.length; i++) {
            if (pinArr[i].id === pinId) {
                return this.attributes.pins.getIdFromPosition(i);
            }
        }
        return null;
    },

    onPanoramaImgSrcChange: function() {
        this.setPanoramaImage(this.attributes.panoramaImgSrc.getValue());
    },

    setPanoramaImage: function(url, callback) {
        this.set({
            panoConfig: null,
            panoramaImage: null,
            imageProgress: 0
        });
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onprogress = (function(e) {
            var prct = img.completedPercentage || 0;
            if (prct >= 100) {
                // заключительно 100 будем ставить только в событии onload
                // на этом завязано показ экрана редактирования
                prct = 99;
            }
            this.set({
                imageProgress: prct
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


            if (this.attributes.photoViewerMode.getValue() === true &&
                (this.application.mode === 'preview' || this.application.mode === 'publish')) {
                // для опубликованного photo-viewer приложения оставить обычный размер 800x600
            }
            else {
                // mode === edit || mode === none
                // для предпросмотра facebook панорам нужно показывать картинку в полную ширину,
                this.application.setSize({
                    width: Math.round(cp.srcWidth * this.attributes.previewScale),
                    height: this.attributes.DEF_PANORAMA_PREVIEW_HEIGHT
                });
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

    createPanoCanvas: function(config, image, scale, pins) {
        config = config || this.attributes.panoConfig;
        image = image || this.attributes.panoramaImage;
        scale = scale || this.attributes.previewScale;
        pins = pins || this.attributes.pins.toArray();
        var logoImg = this.attributes.logoImg;
        var pinsBackgroundColor = this.attributes.pinsBackgroundColor.getValue();
        var pinsFontColor = this.attributes.pinsFontColor.getValue();
        return panoDrawing.createPanoCanvas({
            img: image,
            pins: pins,
            srcWidth: config.srcWidth,
            srcHeight: config.srcHeight,
            panoWidth: config.panoWidth,
            panoHeight: config.panoHeight,
            pinScale: 1/scale,
            logo: logoImg,
            pinsBackgroundColor: pinsBackgroundColor,
            pinsFontColor: pinsFontColor
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
    },

    /**
     * Функция прототип для создания нового пина на панораме
     *
     * @param {Number} param.left - опционально
     * @param {Number} param.top - опционально
     */
    pinProto1: function(param) {
        param = param || {};
        var left = param.left || this.getRandomArbitrary(50, 500);
        var top = param.top || this.getRandomArbitrary(50, 300);

        var pinDictionaryId = MutApp.Util.getUniqId(6);

        var pinText = new MutAppProperty({
            propertyString: 'id=mm pins.'+pinDictionaryId+'.data.text',
            model: this,
            application: this.application,
            value: 'Edit this text'
        });

        var pinPosition = new MutAppPropertyPosition({
            propertyString: 'id=mm pins.'+pinDictionaryId+'.position',
            model: this,
            application: this.application,
            value: {left: left, top: top}
        })

        var pinModArrow = new MutAppProperty({
            propertyString: 'id=mm pins.'+pinDictionaryId+'.modArrow',
            model: this,
            application: this.application,
            value: 'ar_bottom'
        });

        var pin = {
            id: 'pin_'+MutApp.Util.getUniqId(6),
            data: {
                text: pinText
            },
            position: pinPosition,
            // Решили делать общий цвет для всех пинов
            // backgroundColor: pinBackColor,
            // fontColor: pinFontColor,
            modArrow: pinModArrow,
            uiTemplate: 'id-text_pin_template'
        };

        return {
            id: pinDictionaryId,
            element: pin
        };
    },

    /**
     * Функция проверки модели
     *
     * @param assert
     * @returns {boolean}
     */
    isOK: function(assert) {
        assert = assert || MutApp.Util.getMockAssert();

        console.log('FbPanoramaModel.isOK: Checking finished. See qunit log or console for details.');
    },

    getRandomArbitrary: function(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

});