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
     * Сохранить промо проект на сервере
     * 1) Создать канвас и сконвертить в jpeg
     * 2) Залить его в AWS хранилище
     * 3) Заливается фото в Facebook и делается пост
     *
     * @params.appId {string} - уникальный ид проекта, типа c31ab01f0c
     * @params.width {number} - ширина проекта, для ембед кода
     * @params.height {number} - высота проекта для ембед кода
     * @params.promoIframe {iFrame} - iframe приложения прототипа, который меняем
     * @params.baseProductUrl {string} - базовый каталог спецпроекта для работы с ресурсами, например 'products/test'
     */
    function publish(params) {
        if (App.getUserData() !== null) {
            isPublishing = true;
            App.stat('Testix.me', 'Publish_started');
            callback = params.callback;
            publishedAppId = params.appId;
            appWidth = params.width;
            appHeight = params.height;
            promoIframe = params.promoIframe;
            baseProductUrl = params.baseProductUrl;
            errorInPublish = false;
            facebookPostId = null;

            var appModel = promoIframe.contentWindow.app.model;
            setupJPEGEncoder(appModel.attributes.panoConfig.xmp);
            var panoCanvas = appModel.createPanoCanvas();
            uploadPanoCanvas(panoCanvas, function(result) {
                if (result === 'ok') {
                    checkPermissions(config.common.publishedProjectsHostName + awsImageUrl, (config.products.fbPanorama.addDebugCaption === true) ? appModel.attributes.panoConfig.id: null);
                }
                else {
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
        uploadCanvas(App.getAWSBucketForPublishedProjects(), callback, awsImageUrl, panoCanvas);
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
                    if (permissionGranted(response.data, ['publish_actions'/*,'user_photos'*/]) === true) {
                        // разрешения уже предоставлены, не надо запрашивать
                        uploadPhotoToFB(url, caption);
                    }
                    else {
                        // надо запросить и показать уведомление заранее
                        requestPermissions(url, caption);
                    }
                }
                else {
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
                    FB.login(function(response) {
                        if (response.status === 'connected') {
                            uploadPhotoToFB(url, caption);
                        } else {
                            //status: not_authorized, unknown
                            isPublishing = false
                            setupJPEGEncoder(null);
                            callback('error', null);
                        }
                    }, {
                        scope:'publish_actions',//,user_photos',
                        auth_type: 'rerequest'
                    });
                }
                else {
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
                    /* handle the result */
                    //alert('Загружено на Facebook. Иди посмотри.');
                    facebookPostId = response.post_id;
                }
                else {
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
        return '';
    }

    function getEmbedCode() {
        return '';
    }

    global.publish = publish;
    global.getEmbedCode = getEmbedCode;
    global.getAnonymLink = getAnonymLink;
    global.isInited = function() {return isInited;}
    global.isError = function() {return errorInPublish;}
    global.isPublishing = function() {return isPublishing;}
    global.deletePermissions = deletePermissions;

})(fbPanoramaPublisher);