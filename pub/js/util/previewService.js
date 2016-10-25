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
     * Предполагается что html встроен в dom дерево и виден (display !== none)
     * К сожалению, не все элементы корректно рендерятся.
     * Например, бордеры с большим border-radius
     *
     * @param html
     * @param callback
     * @param {html2canvas|rasterizeHTML} type - разные либы/типы генерации которые можно попробовать
     */
//    function create(html, callback, type) {
//        type = type || 'html2canvas';
//        // работает, но плохо с буллитами. Появляются непонятные линии
//        var t = {
//            run: function() {
//                if (type === 'html2canvas') {
//                    html2canvas(html, {
//                        onrendered: (function(canvas) {
//                            callback(canvas);
//                            Queue.release(this);
//                        }).bind(this)
//                    },{
//                        // options for render
//                        background: '#fff'
//                    });
//                }
//                else if (type === 'rasterizeHTML') {
//                    // !!не работает
//                    var canvas = document.getElementById("id-preview_canvas");
//                    rasterizeHTML.drawHTML(productScreensCnt.html(),canvas)
//                        .then(function success(renderResult) {
//                            console.log(renderResult);
//                            //callback(renderResult.image);
//                            callback(renderResult.svg);
//                        }, function error(e) {
//                            console.log(e);
//                            callback(null);
//                        });
//                    $('body').append(canvas);
//                }
//            }
//        };
//        Queue.push(t);
//    }

    /**
     * Создать превью с помощью дополнительного iframe
     * Смысл в том чтобы изолировать html элемент со своими стилями
     *
     * @param html
     * @param callback
     * @param type
     * @param Array stylesToEmbed
     * @param width ширина вью
     * @param height высота вью
     */
    function createInIframe(html, callback, type, stylesToEmbed, width, height) {
        type = type || 'html2canvas';
        var t = {
            run: function() {
                if (type === 'html2canvas') {
                    // внутри iframe имеется собственный сервис previewService
                    var ps = $('#id-html_rasterization_iframe')[0].contentWindow.previewService;
                    var cnt = $('#id-html_rasterization_iframe').contents().find('#id-html_rasterization_cnt');
                    // стили от этого вью добавляем,
                    var $h = $("#id-html_rasterization_iframe").contents().find('head');
                    for (var i = 0; i < stylesToEmbed.length; i++) {
                        $h.append(stylesToEmbed[i]);
                    }
                    // в превью контейнер дописать кастомные стили, которые получились в результате редактирования css appProperties
                    Engine.writeCssRulesTo($("#id-html_rasterization_iframe").contents().find('body'));
                    // Обязательно display !== none
                    var $cloned = $(html).clone().show();
                    $("#id-html_rasterization_iframe").width(width).height(height);
                    $(cnt).width(width).height(height).empty().append($cloned);
                    html2canvas($cloned, {
                        onrendered: (function(canvas) {
                            callback(canvas);
                            Queue.release(this);
                        }).bind(this),
                        background: '#eee',
                        allowTaint: false,
                        useCORS: true,
                        taintTest: false
                    });
                }
            }
        };
        Queue.push(t);
    }

    // public methods
//    global.create = create;
    global.createInIframe = createInIframe;

})(previewService);