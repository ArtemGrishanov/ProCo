/**
 * Created by artyom.grishanov on 09.06.16.
 *
 * Модуль для генерации картинок из html элементов
 * Пока пытаемся это сделать локально с браузере (медленно, много косяков)
 * В последствии логичнее перевести на бекенд сервис.
 */
var previewService = {};
(function(global) {

    var tasks = [];

    /**
     * Запросить генерацию картинки из html
     *
     * @param html
     * @param callback
     * @param {html2canvas|rasterizeHTML} type - разные либы/типы генерации которые можно попробовать
     */
    function create(html, callback, type) {
        type = type || 'html2canvas';
        // работает, но плохо с буллитами. Появляются непонятные линии
        var t = {
            run: function() {
                if (type === 'html2canvas') {
                    html2canvas(html, {
                        onrendered: (function(canvas) {
                            callback(canvas);
                            Queue.release(this);
                        }).bind(this)
                    });
                }
                else if (type === 'rasterizeHTML') {
                    // !!не работает
                    var canvas = document.getElementById("id-preview_canvas");
                    rasterizeHTML.drawHTML(productScreensCnt.html(),canvas)
                        .then(function success(renderResult) {
                            console.log(renderResult);
                            //callback(renderResult.image);
                            callback(renderResult.svg);
                        }, function error(e) {
                            console.log(e);
                            callback(null);
                        });
                    $('body').append(canvas);
                }
            }
        };
        Queue.push(t);
    }

    // public methods
    global.create = create;
})(previewService);