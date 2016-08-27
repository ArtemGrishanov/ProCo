/**
 * Created by artyom.grishanov on 26.08.16.
 *
 * Несколько функций по работе с s3
 * Не смогу логически отнести их пока к какому то модуля или классу
 */

/**
 * Зааплоадить канвас по урлу
 * Будет произведена конвертация в jpg
 *
 * @param callback (ok || error)
 * @param url
 * @param canvas
 */
function uploadCanvas(callback, url, canvas) {
    JPEGEncoder(100);
    var theImgData = (canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height));
    // Encode the image and get a URI back, set toRaw to true
    var rawData = encode(theImgData, 100, true);
    var blob = new Blob([rawData.buffer], {type: 'image/jpeg'});
    var params = {
        Key: url,
        ContentType: 'image/jpeg',
        Body: blob,
        ACL: 'public-read'
    };
    App.getAWSBucket().putObject(params, (function (err, data) {
        if (err) {
            //Not authorized to perform sts:AssumeRoleWithWebIdentity
            log('ERROR: ' + err, true);
            if (callback) {
                callback('error');
            }
        } else {
            log('Превью промки загружено');
            if (callback) {
                callback('ok');
            }
        }
    }).bind(this));
}