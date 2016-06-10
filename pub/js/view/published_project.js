/**
 * Created by artyom.grishanov on 10.06.16.
 *
 * Страница опубликованного проекта
 * Используется для превью
 * Либо анонимом для просмотра проекта
 */

var publishedProject = {};
(function(global){

    var appIframe = null;

    function init() {
        var pUrl = getQueryParams(document.location.search)[config.common.publishedProjParamName];
        if (pUrl) {
            // например
            // https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/pub/16807c295d/index.html
            var host = config.common.awsHostName+config.common.awsBucketName;
            appIframe = document.createElement('iframe');
            //appIframe.onload = onProductIframeLoaded;
            $(appIframe).addClass('proto_cnt');
            appIframe.src = host+'/'+pUrl;
            $('#id-product_iframe_cnt').append(appIframe);
            $('#id-product_cnt').width(800).height(600);
        }
    }

    init();

})(publishedProject);