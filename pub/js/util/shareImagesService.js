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

    /**
     * Вспомогательная информация
     * Почти то же самое, что и app.shareEntities но в канвасом
     * @type {Array}
     * @private
     */
    var _entitiesInfo = [
        //{
        // entityId
        // imgUrl
        // canvas
        // entityIndex
        // }
    ];
    /**
     * Колбек вовне при завершении операции
     *
     * @type {null}
     */
    var callback = null;
    /**
     * Последний сгенерированный канвас автокартинки
     * @type {Canvas}
     * @private
     */
    var _appAutoPreviewCanvas = null;
    /**
     * Ссылка на последнюю загруженную автокартинку
     * Потом ее могут запросить из publisher например
     *
     * @type {string}
     */
    var _appAutogeneratedImageUrl = null;
    /**
     * Время начала последней генерации автоканваса
     * @type {number}
     * @private
     */
    var _canvasGenerationTimestamp = undefined;
    /**
     * Массив колбеков, которые будут вызываться при изменении _appAutoPreviewCanvas
     *
     * @type {Array}
     * @private
     */
    var _appPreviewCanvasChangeCallbacks = [];
    /**
     * Всегда ли генерировать автокартинку, несмотря на то что все катомные стоят в приложениии
     * Это для эксперимент: автокартинка нужна для og тегов для главной страницы проекта
     *
     * @type {boolean}
     * @private
     */
    var _alwaysGenerateAutoImage = true;

    /**
     * Запросить картинки для шаринга.
     * Если они еще не были сгенерированы, то это будет сделано.
     *
     * @param {function} param.callback
     * @param {MutApp} param.app
     */
    function generateAndUploadSharingImages(param) {
        param = param || {};
        if (!param.app) {
            throw new Error('ShareImageService.generateAndUploadSharingImages: app not specified.');
        }
        callback = param.callback;

        // удалить всё что сейчас запущено с такими типами
        //        queue.clearTasks({
        //            type:'create_preview'
        //        });

        // инициализировать информацию об ентити, взять из приложения
        _initEntitiesInfo({
            app: param.app
        });

        if (_alwaysGenerateAutoImage === true || needToGenerateAutoImage({app:param.app}) === true) {
            generateAppAutoPreviewCanvas({
                app: param.app,
                callback: function(canvas) {
                    // сгенерировали один канвас на основе app.getAutoPreviewHtml()
                    // смотрим где не заданы клиентские картинки - ставим этот канвас
                    for (var i = 0; i < _entitiesInfo.length; i++) {
                        var e = _entitiesInfo[i];
                        if (isCustomUrl(e.imgUrl.getValue()) === false) {
                            e.canvas = canvas;
                        }
                    }
                    var autoShareImgUrl = Auth.getUser().short_id+'/'+Editor.getAppId()+'/'+config.common.autoShareImageFileName;
                    s3util.uploadCanvas(App.getAWSBucketForPublishedProjects(), function(result) {
                        if (result === 'ok') {
                            var fullImageUrl = 'http:'+config.common.publishedProjectsHostName+autoShareImgUrl;
                            _appAutogeneratedImageUrl = fullImageUrl;
                            log('ShareImageService.generateAndUploadSharingImages: canvas uploaded ' + fullImageUrl);
                            // дописать в хранилище картинок картинку для публикации
                            for (var i = 0; i < _entitiesInfo.length; i++) {
                                var e = _entitiesInfo[i];
                                if (isCustomUrl(e.imgUrl.getValue()) === false) {
                                    e.imgUrl.setValue(fullImageUrl);
                                }
                            }

                            // TODO delete теперь установка урлов в само приложение
//                            var shareEntArr = param.app.shareEntities.toArray();
//                            for (var i = 0; i < shareEntArr.length; i++) {
//                                // new url to set
//                                var url = getEntityInfo(shareEntArr[i].id).imgUrl;
//                                shareEntArr[i].imgUrl = url;
//                            }
                        }

                        // Окончание работы функции
                        if (callback) {
                            callback();
                        }

                    }, autoShareImgUrl, canvas);
                }
            });
        }
        else {
            // не надо генерировать ни одной автокартинки, а значит все картинки заданы пользователем.
            // сразу можно вызвать колбек
            if (callback) {
                callback();
            }
        }
    }

    /**
     * Получить автоканвас приложения
     * @returns {Canvas}
     */
    function getAppAutoPreviewCanvas() {
        return _appAutoPreviewCanvas;
    }

    /**
     * Запросить генерацию только канваса без аплоада.
     * на основе автопревью которое предоставляет приложения.
     * Есть таймаут: новый канвас будет сгенерирован не ранее чем через config.imageGeneration.appAutoPreviewImageExpirationTimeMillis
     *
     * @param {function} param.callback
     * @param {MutApp} param.app
     */
    function generateAppAutoPreviewCanvas(param) {
        param = param || {};
        if (!param.app) {
            throw new Error('ShareImageService.generateAppAutoPreviewCanvas: app not specified.');
        }
        var now = new Date().getTime();
        if (_appAutoPreviewCanvas === null || (now - _canvasGenerationTimestamp) > config.editor.imageGeneration.appAutoPreviewImageExpirationTimeMillis) {
            _canvasGenerationTimestamp = now;
            previewService.createInIframe({
                html: param.app.getAutoPreviewHtml(),
                stylesToEmbed: [
                    (config.common.buildStatus === 'development') ? config.products.common.styles: '',
                    config.products[param.app.type].stylesForEmbed
                ],
                cssString: param.app.getCssRulesString(),
                width: param.app.getSize().width,
                height: param.app.getSize().height,
                callback: function(canvas) {
                    log('ShareImageService.generateAppAutoPreviewCanvas: app autopreview created');
                    _appAutoPreviewCanvas = canvas;
                    _triggerAppPreviewCanvasChange();
                    if (param.callback) {
                        param.callback(_appAutoPreviewCanvas);
                    }
                }
            });
        }
        else {
            // канвас пока актуален, переиспользуем
            if (param.callback) {
                param.callback(_appAutoPreviewCanvas);
            }
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
        return url.indexOf(config.common.autoShareImageFileName) >= 0;
    }

    /**
     * Заполнить вспомогательную информацию об ентити из приложения
     *
     * @param {MutApp} param.app
     * @private
     */
    function _initEntitiesInfo(param) {
        param = param || {};
        if (!param.app) {
            throw new Error('ShareImageService._initEntitiesInfo: app not specified.');
        }
        _entitiesInfo = [];
        var entities = param.app.shareEntities.toArray();
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            _entitiesInfo.push({
                entityId: e.id,
                entityIndex: i,
                imgUrl: e.imgUrl,
                canvas: null
            });
        }
    }

    /**
     * Вызвать событие для всех колбеков об изменении автоканваса
     * @private
     */
    function _triggerAppPreviewCanvasChange() {
        if (_appAutoPreviewCanvas) {
            for (var i = 0; i < _appPreviewCanvasChangeCallbacks.length; i++) {
                _appPreviewCanvasChangeCallbacks[i](_appAutoPreviewCanvas);
            }
        }
    }

    /**
     * Найти информацию об entity для публикации
     *
     * @param {string} entityId - идентификатор entity
     * @returns {*}
     */
    function getEntityInfo(entityId) {
        for (var i = 0; i < _entitiesInfo.length; i++) {
            if (_entitiesInfo[i].entityId === entityId) {
                return _entitiesInfo[i];
            }
        }
        return null;
    }

    /**
     * Проверить что надо генерировать автокартинку приложения.
     * То есть не для всех ентити пользователь установил свои кастомные картинки
     *
     * @param {MutApp} param.app
     * @return {boolean}
     */
    function needToGenerateAutoImage(param) {
        param = param || {};
        if (!param.app) {
            throw new Error('ShareImageService.needToGenerateAutoImage: app not specified.');
        }
        var entities = param.app.shareEntities.toArray() || []; // app.shareEntities может не быть вовсе в приложении
        for (var i = 0; i < entities.length; i++) {
            // проверим, надо ли генерировать картинки для шаринга для каждого entity
            // если пользователь задает картинки сам, то не надо генерировать ничего
            var e = entities[i];
            if (isCustomUrl(e.imgUrl.getValue()) === false) {
                return true;
            }
        }
        return false
    }

    /**
     * Возможность подписаться на обновление автоканваса приложения
     *
     * @param {function} callback
     */
    function addAppPreviewCanvasChangeCallback(callback) {
        _appPreviewCanvasChangeCallbacks.push(callback);
    }

    global.generateAndUploadSharingImages = generateAndUploadSharingImages;
    global.generateAppAutoPreviewCanvas = generateAppAutoPreviewCanvas;
    global.getAppAutoPreviewCanvas = getAppAutoPreviewCanvas;
    global.isCustomUrl = isCustomUrl;
    global.getGeneratedImages = function() { return _entitiesInfo; }
    global.getAppAutogeneratedImage = function() { return _appAutogeneratedImageUrl; }
    global.getEntityInfo = getEntityInfo;
//    global.needToGenerateAutoImage = needToGenerateAutoImage;
    global.addAppPreviewCanvasChangeCallback = addAppPreviewCanvasChangeCallback;

})(shareImageService);