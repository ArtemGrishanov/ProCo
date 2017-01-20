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

            var panoCanvas = promoIframe.contentWindow.app.model.createPanoCanvas();

            uploadPanoCanvas(panoCanvas, function(result) {
                if (result === 'ok') {
                    uploadPhoto(config.common.publishedProjectsHostName + awsImageUrl, 'My panorama by testix.me');
                }
                else {
                    errorInPublish = true;
                    isPublishing = false
                    callback('error', null);
                }
            });
        }
    }

    function uploadPanoCanvas(panoCanvas,callback) {
        awsImageUrl = App.getUserData().id+'/'+publishedAppId+'/forFBUpload.jpg';
        console.log('Start uploading to: ' + awsImageUrl);
        // method from s3util
        uploadCanvas(App.getAWSBucketForPublishedProjects(), callback, awsImageUrl, panoCanvas);
    }

    function uploadPhoto(url, caption) {
        if (window.confirm('Будет запрошено разрешение на публикацию фото в Facebook. Ок?')) {
            FB.login(function(response) {
                if (response.status === 'connected') {
                    FB.api(
                        "/me/photos",
                        "POST",
                        {
                            url: url,
                            caption: caption,
                            allow_spherical_photo: true
                        },
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
                } else {
                    //not_authorized, unknown
                }
            }, {
                scope:'user_friends,publish_actions,user_photos',
                auth_type: 'rerequest'
            });
        }
        else {
            isPublishing = false
            callback('error', null);
        }
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

})(fbPanoramaPublisher);