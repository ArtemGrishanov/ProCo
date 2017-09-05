/**
 * Created by artyom.grishanov on 18.01.17.
 */
var fbPanoramaPublisher = {};
(function(global) {
    /**
     * Указывает, была ли последняя публикация продукта успешной или нет
     * @type {boolean}
     */
    var errorInPublish = false;
    /**
     * Статические ресурсы (скрипты, стили, картинки и прочее), которые надо зааплоадить при сохранении продукта
     */
    var productResources = [];
    /**
     * Имя проекта для публикации, например test
     * @type {string}
     */
    var appName = null;
    /**
     * Уникальный ид проекта, который публикуется.
     * @type {string}
     */
    var publishedAppId = null;
    /**
     * Урл фоточки для панорамы на нашем сервере. Далее она по урлу аплоадится в фб
     * @type {null}
     */
    var awsImageUrl = null;
    /**
     * Колбек для обратного вызова после завершения публикации
     * @type {function}
     */
    var callback = null;
    /**
     * Каталог в котором находятся ресурсы спецпроекта
     * например 'products/test/'
     * @type {null}
     */
    var baseProductUrl = null;
    /**
     * Ширина приложения
     * @type {number}
     */
    var appWidth = 800;
    /**
     * Высота приложения
     * @type {number}
     */
    var appHeight = 600;
    /**
     * Показывает, что в данный момент идет процесс публикации
     * @type {boolean}
     */
    var isPublishing = false;
    /**
     * Ид поста в FB который создался при аплоаде панорамы
     * @type {null}
     */
    var facebookPostId = null;
    /**
     *
     * Режим просмотра панорамы с помощью проигрывателя http://photo-sphere-viewer.js.org/
     * Публикация отличается
     *
     * @type {boolean}
     */
    var photoViewerMode = false;

    /**
     * Сохранить промо проект на сервере
     * 1) Создать канвас и сконвертить в jpeg
     * 2) Залить его в AWS хранилище
     * 3) Заливается фото в Facebook и делается пост
     *
     * @params.appId {string} - уникальный ид проекта, типа c31ab01f0c
     * @params.appName {string} - тип проекта например test
     * @params.width {number} - ширина проекта, для ембед кода
     * @params.height {number} - высота проекта для ембед кода
     * @params.promoIframe {iFrame} - iframe приложения прототипа, который меняем
     * @params.baseProductUrl {string} - базовый каталог спецпроекта для работы с ресурсами, например 'products/test'
     */
    function publish(params) {
        if (App.getUserData() !== null) {
            isPublishing = true;
            App.stat('Testix.me', 'Publish_started');
            if (config.products.fbPanorama.enableCustomStatistics === true) {
                App.stat('fbPanorama', 'Publish_started');
            }
            callback = params.callback;
            publishedAppId = params.appId;
            appName = params.appName;
            appWidth = params.width;
            appHeight = params.height;
            promoIframe = params.promoIframe;
            baseProductUrl = params.baseProductUrl;
            errorInPublish = false;
            facebookPostId = null;

            var appModel = promoIframe.contentWindow.app.model;
            photoViewerMode = appModel.attributes.photoViewerMode;
            setupJPEGEncoder(appModel.attributes.panoConfig.xmp);
            var panoCanvas = appModel.createPanoCanvas();
            uploadPanoCanvas(panoCanvas, function(result) {
                if (result === 'ok') {
                    var uploadedPanoUrl = config.common.publishedProjectsHostName + awsImageUrl;
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Canvas_uploaded');
                    }
                    if (photoViewerMode !== true) {
                        // публикация в facebook
                        checkPermissions(uploadedPanoUrl, (config.products.fbPanorama.addDebugCaption === true) ? appModel.attributes.panoConfig.id: null);
                    }
                    else {
                        // установить зааплоденную картинку в пирложение
                        var apPanoImg = Engine.getAppProperty('id=mm panoCompiledImage');
                        Engine.setValue(apPanoImg, uploadedPanoUrl, {
                            updateAppProperties: false,
                            updateScreens: false
                        });
                        // после установки картинки приложение становится в режим плеера с другой шириной
                        appWidth = Engine.getApp().width;
                        appHeight = Engine.getApp().height;
                        // далее как публикация обычного самостоятельного проекта
                        Publisher.publish({
                            appId: publishedAppId,
                            appName: appName,
                            width: appWidth,
                            height: appHeight,
                            appStr: Engine.serializeAppValues({addIsPublishedParam:true}),
                            cssStr: Engine.getCustomStylesString(),
                            promoIframe: promoIframe,
                            baseProductUrl: baseProductUrl,
                            callback: callback
                        });
                        isPublishing = false
                        setupJPEGEncoder(null);
                    }
                }
                else {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Error_canvas_upload');
                    }
                    errorInPublish = true;
                    isPublishing = false
                    setupJPEGEncoder(null);
                    callback('error', null);
                }
            });
        }
    }

    function setupJPEGEncoder(xmpString) {
        if (xmpString) {
            config.jpegEncoder.APP1DATA.namespace = 'http://ns.adobe.com/xap/1.0/\0';
            config.jpegEncoder.APP1DATA.string = xmpString;
            config.jpegEncoder.writeAPP0 = false;
            config.jpegEncoder.writeAPP1 = true;
        }
        else {
            config.jpegEncoder.writeAPP0 = true;
            config.jpegEncoder.writeAPP1 = false;
        }
    }

    function uploadPanoCanvas(panoCanvas,callback) {
        awsImageUrl = App.getUserData().id+'/'+publishedAppId+'/forFBUpload.jpg';
        console.log('Start uploading to: ' + awsImageUrl);
        // method from s3util
        s3util.uploadCanvas(App.getAWSBucketForPublishedProjects(), callback, awsImageUrl, panoCanvas);
    }

    /**
     * Проверка, есть ли у пользователи необходимые разрешения.
     *
     * @param {Array<Object>} actualPermissions
     * @param {Array<string>} neededPermissions. Ex: ['publish_actions','user_photos']
     *
     * actualPermissions Example:
     * [
     //
     // {"permission":"user_photos","status":"granted"},
     // {"permission":"user_friends","status":"granted"},
     // {"permission":"email","status":"granted"},
     // {"permission":"publish_actions","status":"granted"},
     // {"permission":"public_profile","status":"granted"}
     //
     // ]
     //
     //
     */
    function permissionGranted(actualPermissions, neededPermissions) {
        var confirmedPermCount = 0;
        for (var n = 0; n < neededPermissions.length; n++) {
            var np = neededPermissions[n];
            var foundPerm = false;
            if (actualPermissions) {
                for (var i = 0; i < actualPermissions.length; i++) {
                    var ap = actualPermissions[i];
                    if (ap.permission === np && ap.status === 'granted') {
                        foundPerm = true;
                        break;
                    }
                }
            }
            if (foundPerm) {
                confirmedPermCount++;
            }
        }
        return confirmedPermCount === neededPermissions.length;
    }

    /**
     * Проверка необходимых разрешений в Facebook
     * @param url
     * @param caption
     */
    function checkPermissions(url, caption) {
        FB.api(
            "/me/permissions",
            "GET",
            {},
            function (response) {
                if (response && !response.error) {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Permissions_checked');
                    }
                    if (permissionGranted(response.data, ['publish_actions','user_photos']) === true) {
                        // разрешения уже предоставлены, не надо запрашивать
                        uploadPhotoToFB(url, caption);
                    }
                    else {
                        // надо запросить и показать уведомление заранее
                        requestPermissions(url, caption);
                    }
                }
                else {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Error_check_permissions');
                    }
                    errorInPublish = true;
                }
            }
        );
    }

    /**
     * Запрос необходимых разрешений в Facebook для загрузки и публикации фото
     * @param url
     * @param caption
     */
    function requestPermissions(url, caption) {
        Modal.showRequestPublishFBPermissions({
            callback: function(res) {
                if (res === 'ok') {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Modal_showed_ok');
                    }
                    FB.login(function(response) {
                        if (response.status === 'connected') {
                            if (config.products.fbPanorama.enableCustomStatistics === true) {
                                App.stat('fbPanorama', 'Fb_rerequest_ok');
                            }
                            uploadPhotoToFB(url, caption);
                        } else {
                            if (config.products.fbPanorama.enableCustomStatistics === true) {
                                App.stat('fbPanorama', 'Fb_rerequest_error');
                            }
                            //status: not_authorized, unknown
                            isPublishing = false
                            setupJPEGEncoder(null);
                            callback('error', null);
                        }
                    }, {
                        scope:'publish_actions,user_photos',
                        auth_type: 'rerequest'
                    });
                }
                else {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Modal_showed_error');
                    }
                    isPublishing = false
                    setupJPEGEncoder(null);
                    callback('error', null);
                }
            }
        })
    }

    /**
     * Аплоад картинки в Facebook
     * Картинка уже загружена на сервер testix и аплоадится по урлу
     *
     * @param url
     * @param caption
     */
    function uploadPhotoToFB(url, caption) {
        var param = {
            url: url,
            allow_spherical_photo: true
        };
        if (caption) {
            param.caption = caption;
        }
        FB.api(
            "/me/photos",
            "POST",
            param,
            function (response) {
                if (response && !response.error) {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Fb_photo_post_ok');
                    }
                    /* handle the result */
                    //alert('Загружено на Facebook. Иди посмотри.');
                    facebookPostId = response.post_id;
                }
                else {
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Fb_photo_post_error');
                    }
                    errorInPublish = true;
                }

                isPublishing = false
                setupJPEGEncoder(null);
                if (errorInPublish === true) {
                    callback('error', null);
                }
                else {
                    log('All resources were uploaded.');
                    callback('success', null);
                    App.stat('Testix.me', 'Publish_completed');
                    if (config.products.fbPanorama.enableCustomStatistics === true) {
                        App.stat('fbPanorama', 'Publish_completed');
                    }
                }
            }
        );
    }

    function deletePermissions() {
        FB.api(
            "/me/permissions/",
            "DELETE",
            {
                permissions: 'publish_actions,user_photos'
            },
            function (response) {
            }
        );
    }

    /**
     * Ссылка на анонимку, которой можно поделиться, на которую можно зайти.
     * @returns {string}
     */
    function getAnonymLink(appId) {
        if (facebookPostId) {
            return 'https://www.facebook.com/'+facebookPostId
        }
        if (photoViewerMode === true) {
            return Publisher.getAnonymLink();
        }
        return '';
    }

    function getEmbedCode() {
        if (photoViewerMode === true) {
            return Publisher.getEmbedCode();
        }
        return '';
    }

    global.publish = publish;
    global.getEmbedCode = getEmbedCode;
    global.getAnonymLink = getAnonymLink;
    global.isInited = function() {return isInited;}
    global.isError = function() {return errorInPublish;}
    global.isPublishing = function() {
        if (photoViewerMode === true) {
            // в режиме photoViewerMode публикация состоит из двух этапов.
            // Во время первого isPublishing === true
            // во время второго работает Publisher
            if (isPublishing === true) {
                return true;
            }
            return Publisher.isPublishing();
        }
        return isPublishing;
    }
    global.deletePermissions = deletePermissions;

})(fbPanoramaPublisher);