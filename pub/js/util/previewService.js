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
     * @param {string|Canvas} html
     * @param {function} callback
     * @param {string} [type]
     * @param {Array<string>} stylesToEmbed - готовая ссылка на стили, например '<link href="products/common/css/tstx_cmn_products.css" rel="stylesheet"/>'
     * @param {string} cssString - строка со стилями '.classname { color:#fff;... }'
     * @param {number} width ширина вью
     * @param {number} height высота вью
     */
    function createInIframe(param) {
        param = param || {};
        param.type = param.type || 'html2canvas';
        param.cssString = param.cssString || '';
        param.stylesToEmbed = param.stylesToEmbed || [];
        if (!param.html || !param.callback || !param.width || !param.height) {
            throw new Error('PreviewService.createInIframe: one of param not set');
        }
        if (typeof param.html === 'string') {
            var t = {
                type: 'create_preview',
                run: function() {
                    if (param.type === 'html2canvas') {
                        // внутри iframe имеется собственный сервис previewService
                        var ps = $('#id-html_rasterization_iframe')[0].contentWindow.previewService;
                        var cnt = $('#id-html_rasterization_iframe').contents().find('#id-html_rasterization_cnt');
                        // стили от этого вью добавляем,
                        var $h = $("#id-html_rasterization_iframe").contents().find('head');
                        for (var i = 0; i < param.stylesToEmbed.length; i++) {
                            $h.append(param.stylesToEmbed[i]);
                        }
                        if (param.cssString) {
                            // в превью контейнер дописать кастомные стили, которые получились в результате редактирования css appProperties
                            writeCssTo('id-rast_styles', param.cssString, $("#id-html_rasterization_iframe").contents().find('body')); // utils.js
                        }
                        // Обязательно display !== none
                        var $cloned = (typeof param.html === 'string') ? $(param.html).clone().show(): param.html;
                        $("#id-html_rasterization_iframe").width(param.width).height(param.height);
                        $(cnt).width(param.width).height(param.height).empty().append($cloned);
                        // time for browser to apply css styles
                        setTimeout(function() {
                            html2canvas($cloned, {
                                onrendered: (function(canvas) {
                                    param.callback(canvas);
                                    Queue.release(this);
                                }).bind(this),
                                background: '#eee',
                                allowTaint: false,
                                useCORS: true,
                                taintTest: false
                            });
                        }, 200);
                    }
                }
            };
            Queue.push(t);
        }
        else if (param.html.getContext('2d')) {
            param.callback(param.html);
        } else {
            throw new Error('PreviewService.createInIframe: "html" param must be html-string or canvas');
        }
    }

    // public methods
//    global.create = create;
    global.createInIframe = createInIframe;

})(previewService);