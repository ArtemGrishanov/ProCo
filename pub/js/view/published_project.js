/**
 * Created by artyom.grishanov on 10.06.16.
 *
 * Страница опубликованного проекта
 * Для превью использовать нельзя - так как превью неопубликовано
 * Может просматривать сам автор либо аноним для просмотра проекта
 */

var publishedProject = {};
(function(global){

    var appIframe = null;

    /**
     * Анализ параметров
     */
    function init() {
        var host = config.common.home;// || (config.common.awsHostName+config.common.awsBucketName);
        // ссылка на опубликованный проект передается через гет параметр
        var pUrl = getQueryParams(document.location.search)[config.common.publishedProjParamName];
        if (pUrl) {
            // например
            // https://s3.eu-central-1.amazonaws.com/proconstructor/facebook-902609146442342/pub/16807c295d/index.html
            embedIFrame(host+'/'+pUrl);
        }
        else {
            // в качестве альтернативы можно открыть прототип, например для отладки полезно
            var appName = getQueryParams(document.location.search)[config.common.appNameParamName];
            if (appName) {
                var appInfo = config.products[appName];
                if (appInfo) {
                    embedIFrame(host+appInfo.src);
                }
                else {
                    log('No such project='+appName,true);
                }
            }
        }
        $('.js-create_new').click(onCreateNewClick);
    }

    /**
     * Клик создать свой промо продукт
     */
    function onCreateNewClick() {
        //TODO
    }

    /**
     * Встроить в страницу iframe с проектом
     * @param url
     */
    function embedIFrame(url) {
        appIframe = document.createElement('iframe');
        //appIframe.onload = onProductIframeLoaded;
        $(appIframe).addClass('proto_cnt');
        appIframe.src = url;
        $('#id-product_iframe_cnt').append(appIframe);
        $('#id-product_cnt').width(800).height(600);
    }

    init();

})(publishedProject);