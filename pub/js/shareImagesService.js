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

    var CANVASES_CACHE_TIME = 5000;
    var delay = 500;
    var serviceTimerId = setInterval(_doInterval, delay);
    /**
     * Таски на картинок
     * Содержит действие которое надо сделать и колбек
     *
     * @type {Array}
     */
    var _requestImageTasks = [
        // {
        // task: 'canvas' | 'imgUrl'
        // callback: {function}
        // }
    ];

    var _generatedImages = [
        //{
        // entityId
        // imgUrl
        // canvas
        // entityIndex
        // }
    ];
    var _activeTask = null;

    /**
     * Запросить картинки для шаринга.
     * Если они еще не были сгенерированы, то это будет сделано.
     *
     * @param {function} callback
     */
    function requestImageUrls(callback) {
        _requestImageTasks.push({
            task: 'canvas',
            callback: null
        });
        _requestImageTasks.push({
            task: 'upload',
            callback: callback
        });
    }

    /**
     * Запросить генерацию только канваса без аплоада
     *
     * @param {function} callback
     */
    function requestCanvases(callback) {
        _requestImageTasks.push({
            task: 'canvas',
            callback: callback
        });
    }

    /**
     *
     * @private
     */
    function _doInterval() {
        if (_activeTask === null && _requestImageTasks.length > 0) {
            // кому-то потребовались картинки для публикации
            // если картинок нет - запустить генерацию
            _activeTask = _requestImageTasks.shift();
            if (_activeTask.task === 'canvas') {
                _generateCanvases();
            }
            else if (_activeTask.task === 'upload') {
                _generateImageUrls();
            }
            else {
                _activeTask = null;
            }
        }
        if (_activeTask === null) {
            _clearObsoleteCanvases();
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
                    entityId: e.id,
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

    /**
     *
     * @private
     */
    function _clearObsoleteCanvases() {
        var now = new Date().getTime();
        for (var i = 0; i < _generatedImages.length; i++) {
            if (_generatedImages[i].canvasTimestamp && (now-_generatedImages[i].canvasTimestamp) > CANVASES_CACHE_TIME) {
                _generatedImages[i].canvas = null;
            }
        }
    }

    function _generateCanvases() {
        _generatedImages = [];

        var app = Engine.getApp();
        var entities = app._shareEntities;
        _activeTask.imagesCount = entities.length;

        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];

            _generatedImages.push({
                entityId: e.id,
                entityIndex: i,
                imgUrl: e.imgUrl,
                canvas: null
            });

            // проверим, надо ли генерировать картинки для шаринга для каждого entity
            // если пользователь задает картинки сам, то не надо генерировать ничего
            if (isCustomUrl(e.imgUrl) === false) {
                (function(entityId, entityIndex, entityView){

                    // создать замыкание для сохранения значений entityId
                    previewService.createInIframe(entityView, function(canvas) {
                        log('createPreviewsForShare: preview created '+entityId);
                        var info = findImageInfo(entityId);
                        info.canvas = canvas;
                        info.canvasTimestamp = new Date().getTime();

                        _activeTask.imagesCount--;
                        if (_activeTask.imagesCount <= 0) {
                            // закрыть таск вызвав колбек
                            if (_activeTask.callback) _activeTask.callback();
                            _activeTask = null;
                        }

                    }, null, [config.products.common.styles, config.products[app.type].stylesForEmbed], Editor.getAppContainerSize().width, Editor.getAppContainerSize().height);

                })(e.id, i, e.view);
            }
            else {
                // не надо генерировал превью, пользователь установил превью сам
                log('createPreviewsForShare: dont need generate preview for '+ e.id);

                _activeTask.imagesCount--;
                if (_activeTask.imagesCount <= 0) {
                    // закрыть таск вызвав колбек
                    if (_activeTask.callback) _activeTask.callback();
                    _activeTask = null;
                }
            }
        }
    }

    function _generateImageUrls() {
        _activeTask.imagesCount = _generatedImages.length;

        for (var i = 0; i < _generatedImages.length; i++) {
            if (_generatedImages[i].canvas && isCustomUrl(_generatedImages[i].imgUrl) === false) {
                // канваса может не быть если пользователь сам установил картинку
                (function(entityId, entityIndex){

                    var url = App.getUserData().id+'/'+Editor.getAppId()+'/'+config.common.shareFileNamePrefix+'_'+_generatedImages[i].entityId+'.jpg';
                    s3util.uploadCanvas(App.getAWSBucketForPublishedProjects(), function(result) {
                        if (result === 'ok') {
                            var fullImageUrl = 'http:'+config.common.publishedProjectsHostName+url;
                            log('createPreviewsForShare: canvas uploaded '+entityId+' '+fullImageUrl);
                            // дописать в хранилище картинок картинку для публикации
                            findImageInfo(entityId).imgUrl = fullImageUrl;
                        }

                        _activeTask.imagesCount--;
                        if (_activeTask.imagesCount <= 0) {
                            // закрыть таск вызвав колбек
                            if (_activeTask.callback) _activeTask.callback();
                            _activeTask = null;
                        }
                    }, url, _generatedImages[i].canvas);

                })(_generatedImages[i].entityId, _generatedImages[i].entityIndex);
            }
            else {
                _activeTask.imagesCount--;
                if (_activeTask.imagesCount <= 0) {
                    // закрыть таск вызвав колбек
                    if (_activeTask.callback) _activeTask.callback();
                    _activeTask = null;
                }
            }
        }
    }

    global.requestImageUrls = requestImageUrls;
    global.requestCanvases = requestCanvases;
    global.isCustomUrl = isCustomUrl;
    global.getGeneratedImages = function() { return _generatedImages; }
    global.findImageInfo = findImageInfo;

})(shareImageService);