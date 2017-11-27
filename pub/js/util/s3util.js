/**
 * Created by artyom.grishanov on 26.08.16.
 *
 * Несколько функций по работе с s3
 * Не смогу логически отнести их пока к какому то модуля или классу
 */
var s3util = {};
(function(global) {

    var pool = [];
    var activeRequest = null;

    function timer() {
        if (activeRequest === null && pool.length > 0) {
            activeRequest = pool.shift();
        }
        if (activeRequest && activeRequest.performed!==true) {
            // надо убедиться что для этого запроса есть bucket
            // в случае relogin-а нужно время чтобы заново создать его
            if (getBucket(activeRequest.bucketName)) {
                activeRequest.timestamp = new Date().getTime();
                activeRequest.performed = true;
                doRequest(activeRequest);
            }
        }
        if (activeRequest) {
            // проверка на зависшие по каким-то причинам запросы
            if (new Date().getTime()-activeRequest.timestamp > activeRequest.maxDuration) {
                if (activeRequest) activeRequest.callback('error', null);
                activeRequest = null;
            }
        }
    }

    function doRequest(r) {
        //bucket
        //params
        //callback
        var b = getBucket(r.bucketName);
        b[r.method](r.params, onRequest);
    }

    function onRequest(err, data) {
        if (err) {
            log('onRequest: ' + err, true);
            if (err.code === 'CredentialsError') {
                // пытаемся обновить устаревшую сессию
                Auth.refreshSession();
//                var canRelogin = App.relogin();
//                if (canRelogin) {
//                    // повторно выполнить этот запрос
//                    activeRequest.performed = false;
//                    pool.unshift(activeRequest);
//                    activeRequest = null;
//                }
//                else {
//                    if (activeRequest) activeRequest.callback('error', data);
//                }
            }
//            else {
                if (activeRequest) activeRequest.callback('error', data);
//            }
        }
        else {
            if (activeRequest) activeRequest.callback(null, data);
        }
        activeRequest = null;
    }

    function requestStorage(method, params, callback, maxDuration) {
        pool.push({
            bucketName: 's3://proconstructor',
            method: method,
            params: params,
            callback: callback,
            maxDuration: maxDuration || config.storage.responseMaxDuration
        });
    }

    function requestPub(method, params, callback, maxDuration) {
        pool.push({
            bucketName: 's3://p.testix.me',
            method: method,
            params: params,
            callback: callback,
            maxDuration: maxDuration || config.storage.responseMaxDuration
        });
    }

    /**
     * Зааплоадить канвас по урлу
     * Будет произведена конвертация в jpg
     *
     * @param bucket
     * @param callback (ok || error)
     * @param url
     * @param canvas
     * @param fakeUpload - холостой прогон функции для тестов, чтобы не аплоадить картинки в режиме тестирования
     */
    function uploadCanvas(bucket, callback, url, canvas, fakeUpload) {
        if (fakeUpload !== true) {

            var t = {
                run: function () {
                    JPEGEncoder(config.jpegEncoder.JPEGEncoderQuality);
                    var theImgData = (canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
                    // Encode the image and get a URI back, set toRaw to true
                    var rawData = encode(theImgData, config.jpegEncoder.JPEGEncoderQuality, true);
                    var blob = new Blob([rawData.buffer], {type: 'image/jpeg'});
                    var params = {
                        Key: url,
                        ContentType: 'image/jpeg',
                        Body: blob,
                        ACL: 'public-read'
                    };
                    bucket.putObject(params, (function (err, data) {
                        if (err) {
                            //Not authorized to perform sts:AssumeRoleWithWebIdentity
                            log('s3cmd.uploadCanvas: ' + err, true);
                            if (callback) {
                                callback('error');
                            }
                        } else {
                            log('s3cmd.uploadCanvas: uploaded ' + url);
                            if (callback) {
                                callback('ok');
                            }
                        }
                        Queue.release(this);

                    }).bind(this));
                },
                onFail: function() {
                    if (callback) {
                        callback('error');
                    }
                },
                maxWaitTime: config.common.imageUploadToAWSMaxWaitTime
            };
            Queue.push(t);
        }
        else {
            callback('ok');
        }
    }

    /**
     * Вернуть по имени bucket из App
     * @param {string} bucketName
     */
    function getBucket(bucketName) {
        //TODO правильно перенести из App бакеты в этот класс и осуществлять полное управление здесь. Но пока не стал - дорого
        if (bucketName === 's3://proconstructor') {
            return App.getAWSBucket();
        }
        else if (bucketName === 's3://p.testix.me') {
            return App.getAWSBucketForPublishedProjects();
        }
        return null;
    }

    setInterval(timer, 50);

    global.requestStorage = requestStorage;
    global.requestPub = requestPub;
    global.uploadCanvas = uploadCanvas;

})(s3util);