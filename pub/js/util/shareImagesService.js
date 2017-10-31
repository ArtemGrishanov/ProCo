/**
 * Created by artyom on 10.11.16.
 *
 * Сервис автоматической генерации картинок для постинга на основе вью
 * Этот сервис занимается исключительно генерацией канвасов и урлов на основе вью приложения.
 * К кастомным картинкам пользователя не имеет отношения
 *
 */
var shareImageService = {};

(function(global) {

    var _generatedImages = [];

    /**
     * Запросить картинки для шаринга.
     * Если они еще не были сгенерированы, то это будет сделано.
     *
     * @param {function} callback
     */
    function requestImageUrls(callback) {
        var param = {
            app: Engine.getApp()
        };
        _initEntitiesInfo({
            app: param.app
        });

        var autoPreviewHtml = Engine.getApp()._screens[0].el;
        if (needToGenerateAutoImage({app:param.app}) === true && autoPreviewHtml) {

            previewService.createInIframe(
                autoPreviewHtml,
                function(canvas) {
                    log('ShareImageService.generateAndUploadSharingImages: app autopreview created');
                    // сгенерировали один канвас на основе app.getAutoPreviewHtml()
                    // смотрим где не заданы клиентские картинки - ставим этот канвас
                    for (var i = 0; i < _generatedImages.length; i++) {
                        var e = _generatedImages[i];
                        if (isCustomUrl(e.imgUrl) === false) {
                            e.canvas = canvas;
                        }
                    }
                    var autoShareImgUrl = App.getUserData().id+'/'+Editor.getAppId()+'/'+config.common.shareFileNamePrefix+'_auto.jpg';
                    s3util.uploadCanvas(App.getAWSBucketForPublishedProjects(), function(result) {
                        if (result === 'ok') {
                            var fullImageUrl = 'http:'+config.common.publishedProjectsHostName+autoShareImgUrl;
                            log('ShareImageService.generateAndUploadSharingImages: canvas uploaded ' + fullImageUrl);
                            // дописать в хранилище картинок картинку для публикации
                            for (var i = 0; i < _generatedImages.length; i++) {
                                var e = _generatedImages[i];
                                if (isCustomUrl(e.imgUrl) === false) {
                                    e.imgUrl = fullImageUrl;
                                }
                            }
                        }

                        // Окончание работы функции
                        if (callback) {
                            callback();
                        }

                    }, autoShareImgUrl, canvas);
                },
                null,
                [config.products.common.styles, config.products[param.app.type].stylesForEmbed],
                param.app.width,
                param.app.height
            );


        }
        else {
            if (callback) {
                callback();
            }
        }

    }

    /**
     * Запросить генерацию только канваса без аплоада
     *
     * @param {function} callback
     */
    function requestCanvases(callback) {
        var param = {
            app: Engine.getApp()
        };
        _initEntitiesInfo({
            app: param.app
        });

        var autoPreviewHtml = Engine.getApp()._screens[0].el;
        if (needToGenerateAutoImage({app:param.app}) === true && autoPreviewHtml) {

            previewService.createInIframe(
                autoPreviewHtml,
                function(canvas) {
                    log('ShareImageService.generateAndUploadSharingImages: app autopreview created');
                    // сгенерировали один канвас на основе app.getAutoPreviewHtml()
                    // смотрим где не заданы клиентские картинки - ставим этот канвас
                    for (var i = 0; i < _generatedImages.length; i++) {
                        var e = _generatedImages[i];
                        if (isCustomUrl(e.imgUrl) === false) {
                            e.canvas = canvas;
                        }
                    }

                    if (callback) {
                        callback();
                    }
                },
                null,
                [config.products.common.styles, config.products[param.app.type].stylesForEmbed],
                param.app.width,
                param.app.height
            );

        }
        else {
            if (callback) {
                callback();
            }
        }
    }

    function needToGenerateAutoImage(param) {
        param = param || {};
        if (!param.app) {
            throw new Error('ShareImageService.needToGenerateAutoImage: app not specified.');
        }
        var entities = param.app._shareEntities || []; // app.shareEntities может не быть вовсе в приложении
        for (var i = 0; i < entities.length; i++) {
            // проверим, надо ли генерировать картинки для шаринга для каждого entity
            // если пользователь задает картинки сам, то не надо генерировать ничего
            var e = entities[i];
            if (isCustomUrl(e.imgUrl) === false) {
                return true;
            }
        }
        return false
    }

    function _initEntitiesInfo(param) {
        param = param || {};
        if (!param.app) {
            throw new Error('ShareImageService._initEntitiesInfo: app not specified.');
        }
        _generatedImages = [];
        var entities = param.app._shareEntities;
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            _generatedImages.push({
                id: e.id,
                entityId: e.id,
                entityIndex: i,
                title: e.title,
                description: e.description,
                imgUrl: e.imgUrl,
                canvas: null
            });
        }
    }

    /**
     * Надо ли генерировать превью для этого ентити или нет
     * Если картинки еще нет или ее по ее урлу можно сказать что она автогенерированная, значит надо создать
     * Если урл картинки кастомный, то он был задан пользователем. Пользователь сам обновит картинку
     *
     * @param {string} imgUrl - ссылка на картинку
     * @return {boolean}
     */
    function isCustomUrl(imgUrl) {
        if (!!imgUrl === false || _shareImageIsAutogenerated(imgUrl) === true) {
            return false;
        }
        return true;
    }

    /**
     * Определить по формату url, является ли картинка автогенерированной или нет
     *
     * @param {string} url
     * @returns {boolean}
     */
    function _shareImageIsAutogenerated(url) {
        var s = '^(http|https):\\/\\/p\\.testix.me\\/[0-9]+\\/[0-9a-z]+\\/'+config.common.shareFileNamePrefix+'_'+'([0-9A-z]|\\_)+\\.jpg';
        var reg = RegExp(s, 'ig');
        return reg.test(url);
    }

    /**
     * Найти информацию о картинке
     *
     * @param entityId
     * @returns {*}
     */
    function findImageInfo(entityId) {
        if (_generatedImages.length === 0) {
            var app = Engine.getApp();
            var entities = app._shareEntities;
            for (var i = 0; i < entities.length; i++) {
                var e = entities[i];

                _generatedImages.push({
                    id: e.id,
                    entityId: e.id,
                    title: e.title,
                    description: e.description,
                    entityIndex: i,
                    imgUrl: e.imgUrl,
                    canvas: null
                });
            }
        }
        for (var i = 0; i < _generatedImages.length; i++) {
            if (_generatedImages[i].entityId === entityId) {
                return _generatedImages[i];
            }
        }
        return null;
    }

//    function _generateCanvases() {
//        _generatedImages = [];
//
//        var app = Engine.getApp();
//        var entities = app._shareEntities;
//        _activeTask.imagesCount = entities.length;
//
//        for (var i = 0; i < entities.length; i++) {
//            var e = entities[i];
//
//            _generatedImages.push({
//                entityId: e.id,
//                entityIndex: i,
//                imgUrl: e.imgUrl,
//                canvas: null
//            });
//
//            // проверим, надо ли генерировать картинки для шаринга для каждого entity
//            // если пользователь задает картинки сам, то не надо генерировать ничего
//            if (isCustomUrl(e.imgUrl) === false) {
//
//                (function(entityId, entityIndex, entityView){
//
//                    // создать замыкание для сохранения значений entityId
//                    previewService.createInIframe(entityView, function(canvas) {
//                        log('createPreviewsForShare: preview created '+entityId);
//                        var info = findImageInfo(entityId);
//                        info.canvas = canvas;
//                        info.canvasTimestamp = new Date().getTime();
//
//                        _activeTask.imagesCount--;
//                        if (_activeTask.imagesCount <= 0) {
//                            // закрыть таск вызвав колбек
//                            if (_activeTask.callback) _activeTask.callback();
//                            _activeTask = null;
//                        }
//
//                    }, null, [config.products.common.styles, config.products[app.type].stylesForEmbed], Editor.getAppContainerSize().width, Editor.getAppContainerSize().height);
//
//                })(e.id, i, e.view);
//            }
//            else {
//                // не надо генерировал превью, пользователь установил превью сам
//                log('createPreviewsForShare: dont need generate preview for '+ e.id);
//
//                _activeTask.imagesCount--;
//                if (_activeTask.imagesCount <= 0) {
//                    // закрыть таск вызвав колбек
//                    if (_activeTask.callback) _activeTask.callback();
//                    _activeTask = null;
//                }
//            }
//        }
//    }

//    function _generateImageUrls() {
//        _activeTask.imagesCount = _generatedImages.length;
//
//        for (var i = 0; i < _generatedImages.length; i++) {
//            if (_generatedImages[i].canvas && isCustomUrl(_generatedImages[i].imgUrl) === false) {
//                // канваса может не быть если пользователь сам установил картинку
//                (function(entityId, entityIndex){
//
//                    var url = App.getUserData().id+'/'+Editor.getAppId()+'/'+config.common.shareFileNamePrefix+'_'+_generatedImages[i].entityId+'.jpg';
//                    s3util.uploadCanvas(App.getAWSBucketForPublishedProjects(), function(result) {
//                        if (result === 'ok') {
//                            var fullImageUrl = 'http:'+config.common.publishedProjectsHostName+url;
//                            log('createPreviewsForShare: canvas uploaded '+entityId+' '+fullImageUrl);
//                            // дописать в хранилище картинок картинку для публикации
//                            findImageInfo(entityId).imgUrl = fullImageUrl;
//                        }
//
//                        _activeTask.imagesCount--;
//                        if (_activeTask.imagesCount <= 0) {
//                            // закрыть таск вызвав колбек
//                            if (_activeTask.callback) _activeTask.callback();
//                            _activeTask = null;
//                        }
//                    }, url, _generatedImages[i].canvas);
//
//                })(_generatedImages[i].entityId, _generatedImages[i].entityIndex);
//            }
//            else {
//                _activeTask.imagesCount--;
//                if (_activeTask.imagesCount <= 0) {
//                    // закрыть таск вызвав колбек
//                    if (_activeTask.callback) _activeTask.callback();
//                    _activeTask = null;
//                }
//            }
//        }
//    }

    global.requestImageUrls = requestImageUrls;
    global.requestCanvases = requestCanvases;
    global.isCustomUrl = isCustomUrl;
    global.getGeneratedImages = function() { return _generatedImages; }
    global.findImageInfo = findImageInfo;

})(shareImageService);