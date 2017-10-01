/**
 * Created by artyom.grishanov on 17.12.15.
 */
if (window.textix === undefined) {
    var testix = {};
    (function(global){
        /**
         * Локация раположения всех опубликованных проектов
         * @type {string}
         */
        //var publishedProjectsHome = '//s3.eu-central-1.amazonaws.com/p.testix.me/';
        var publishedProjectsHome = '//p.testix.me/';
        /**
         * Приложения, которые хранятся на странице
         * @type {Array}
         */
        var testixApps = [];
        /**
         * Ширина панели с рекомендациями
         * Нужно для прокрутки
         *
         * @type {number}
         */
        var panelWidth = 0;
        var panelElemWidth = 160;
        var panelElemMargin = 20;
        var messageEventAttached = false;
        var horizScrollStep = 300;
        var css = '.tstx_rec_item {' +
            'margin:10px;' +
            'display:inline-block;' +
            'cursor:pointer;' +
            'vertical-align: top;' +
            'overflow: hidden;' +
            '}' +
            '.tstx_rec_item_txt {' +
            'width:160px;' +
            'opacity:0.8;' +
            'font-size:12px;' +
            'font-family:Helvetica,Arial,sans-serif;' +
            'white-space:nowrap;' +
            'overflow:hidden;' +
            'text-overflow:ellipsis;' +
            'padding-bottom:8px;' +
            '}' +
            '.tstx_rec_item_img {' +
            'width:160px;' +
            'height:120px;' +
            'background-size:cover;' +
            'background-position:center;' +
            'border: 1px solid rgba(255, 255, 255, 0.2);' +
            '}' +
            '.tstx_rec_panel {' +
            'display:none;' +
            'position:absolute;' +
            'width:100%;' +
            'left:0;' +
            'bottom:0;' +
            'height:172px;' +
            'background-color:rgba(0,0,0,.7);' +
            'color:#fff;' +
            'transition: all .3s ease 0s;' +
            '}' +
            '.tstx_rec_panel.__closed{' +
            'bottom:-100px;' +
            '}' +
            '.tstx_rec_items_cnt{' +
            'position:absolute;' +
            'top:0;' +
            'left:0;' +
            'transition:all .3s ease 0s;' +
            'white-space:nowrap;' +
            '}' +
//            '.tstx_rec_h {' +
//            'position: absolute;' +
//            'top:5px;' +
//            'left:5px;' +
//            'font-size: 20px;' +
//            '}' +
            '.tstx_rec_close {' +
            'position:absolute;' +
            'top:8px;' +
            'right:7px;' +
            'width:24px;' +
            'height:16px;' +
            'cursor:pointer;' +
            'background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAMCAYAAABvEu28AAAABGdBTUEAALGPC/xhBQAAALhJREFUKBWtkssNwjAQRHPiSgepgXSRQlJKOqGGXBECKaXQAEcO5g3ZOF6CpT1gaeQdz+zk422af66U0gRu4BjNlRfcwZR7IDPQuoBDFiqFPOZlS3O2QVrw0CnrnIVKIc/HufS0zobQgacZRicWBH00j7xdIW0lQg9eZhw2Zak4H0yTp//WHa+Z1QiqD3EhK6GhfP0TPPTZa7/baS5/aPgiXIgIQeUVQ2OjsQuyMA3d1RAe1p9h0cM3Scr+AbNBe9sAAAAASUVORK5CYII=);' +
            'background-repeat:no-repeat;' +
            'background-position:center;' +
            '}' +
            '.tstx_rec_close.__up {' +
            'background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAMCAYAAABvEu28AAAABGdBTUEAALGPC/xhBQAAAKtJREFUKBW9ksENgzAQBHn5SwfUkHSRQiiFTqiBL0KKRCk0wDOPyyw6IxNFiUGIlVZ3Ou+ubUxRXAEzK+HgLA/tiTnAHkaoD7vDMLWeMFFFod0VhKFZbGYz9e5ULzRZYQjrRW72oj6iST3UTKjj/GtF8FOsAKWAzSabMBZ1hb/HR5Ne+/YZUiHI/qBo04eo1jAWRihkPTG64Fp5xjSoY/CE2T+dtO7p1qAzmjdj9v4CFrkR5gAAAABJRU5ErkJggg==);' +
            '}' +
            '.tstx_arr{' +
            'position:absolute;' +
            'top:0;' +
            'left:0;' +
            'background-color:rgba(0,0,0,0.69);' +
            'background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAYAAAASYli2AAAABGdBTUEAALGPC/xhBQAAAN1JREFUSA3tlsENgkAQRdEDVzqgBumCQiiFTqzBqzEeqMAabMCjB3xf3WRDuMCfgyZM8tlkCW9nhr+bLYpfi3EcazSgk50bkAbdkeJqAQG06CEScUbVaiAfd+iJFEdUOrD+jfk8egdUfrMRStl1DqwCoD4p1LfWgckWN5EI/dGDA8ttIWjtwDZbLOgezY6zhdYFeEEKzxaw9jOF7Gbmlk2RWWzJWh5o3F7N6wEcc5pMoHHnXQKTadzWy6Bxh0MGnR5fTXq3etxspU3wn7byriLJMpQvWw3IvywlaD6+AG8e5N/U7yaIAAAAAElFTkSuQmCC);' +
            'background-position:center;' +
            'background-repeat:no-repeat;' +
            'width:56px;' +
            'height:172px;' +
            'cursor:pointer;' +
            '}' +
            '.tstx_arr.__right{' +
            'background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAgCAYAAAASYli2AAAABGdBTUEAALGPC/xhBQAAAMlJREFUSA3tlsEJg1AQRCWHf7WD1KBdWIil2ElqyFUCgVSQGtKARw8/b0AheNMdwYAD4789191x+UWxh3LOd/zCVwsf0BNLH1yHoUBK3GNpwI0DmgDdREQjbsNQAQB1Ik7qXNAWoKqUVHUKg4E0WP2U1N/SAa0BafLSG8djJcgE4zhjRcTCgxKAXv5nrB6q/qLHIUQffX+SdSjAPNsIkG9fAvNtdGDL5VBtTgUw3/oCdsZixSissdB7Af5eRbbHYv4IgN7L0gx2nF+/H+Tg/MC2SgAAAABJRU5ErkJggg==);' +
            'right:0;' +
            'left:initial;' +
            '}' +
            '.tstx_pwrd{' +
            'display:block;' +
            'position:absolute;' +
            'right:0;' +
            'bottom:0;' +
            'width:80px;' +
            'height:30px;' +
            'background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAeCAMAAACMnWmDAAACQFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQEDAwMEBAQGBgYHBwcJCQkLCwsNDQ0ODg4PDw8RERESEhIUFBQVFRUWFhYYGBgZGRkaGhodHR0eHh4gICAhISEmJiYoKCgrKystLS0uLi4xMTEyMjIzMzM0NDQ4ODg3Nzc4ODg5OTk7Ozs8PDw9PT1AQEA+Pj5BQUFCQkJERERHR0dHR0dJSUlLS0tMTExNTU1QUFBUVFRWVlZYWFhYWFhbW1tgYGBlZWVoaGhmZmZnZ2dqampsbGxtbW1ubm5tbW1vb29wcHBxcXFycnJ0dHR0dHR2dnZ3d3d4eHh7e3t7e3t8fHx+fn5/f3+AgIB+fn6BgYGCgoKEhISEhISIiIiLi4uNjY2Ojo6Pj4+QkJCRkZGTk5OUlJSVlZWWlpadnZ2dnZ2enp6ioqKhoaGjo6OlpaWoqKipqamqqqqsrKytra2wsLCxsbGysrKzs7O1tbW3t7e2tra4uLi5ubm3t7e5ubm6urq7u7u7u7u8vLy9vb2+vr6/v7/AwMDCwsLBwcHCwsLDw8PExMTExMTHx8fIyMjJycnKysrNzc3MzMzNzc3Pz8/Q0NDPz8/R0dHS0tLT09PT09PU1NTX19fY2NjY2Nja2trb29va2trb29vd3d3e3t7f39/g4ODj4+Pk5OTm5ubn5+fo6Ojp6enq6urq6urr6+vs7Ozt7e3t7e3w8PDw8PDy8vLx8fHy8vLz8/P09PT19fX09PT39/f4+Pj7+/v+/v713lc9AAAAwHRSTlObnaOkpaaqs7Ozs7S0tLW1tba2tre3t7i4uLm5ubq7u7y8vb2+vr6+v7+/v7/AwMHBwcLCw8PDw8TFxsbGx8fIysrLy8vMzMzNzc3Ozs7Pz8/Q0NHR0dHR0tLS0tPU1dXW1tfX19fY2drb29vc3N7e39/f3+Hh4eLi4uPj4+Tk5OTl5eXl5ubm5+fn5+jp6erq6uvr6+vs7Ozs7e3u7u/v7/Dw8fHx8vPz9PX19fX29vb29/f4+Pn5+fn5+vr7/P5BvnJWAAAB8ElEQVR4AWNgZKUqYGFgY6cuGNwGjhqoKcwJojiE1KhjoMaq+RPqykpr++etNJJubKgBgg5XoLhCVvfkMitudqXm+pqaaiBui2XXK2Znj8/nAOsT7HPDbiC3XUJh/ZIVDUVpMYIGe5sagKDLkZ3dYvnCgszZW0p4lBsbGto2TWtoaI9j913Kzu6x2RukjTNxnQ2eMCzpBFMG2zWhAjKzpsizs3OFbHUC8xYHgCiwgTy5y7WATOv1MeykGKi13QRE8SysQDeQXWpSlxi73JwqQZIMVN3qCaYNVTEMZDdenSZQskiBnSgD9aWAQJKTnbdna56mGEgM00D2sI1pG+3ZiTJw35JFQLDcmp1dKGH+jvlFtgLYDOQr35/KSZyBe0J8gcAPHDxSlunTdzVIYDFQaurOSqAS4sMQZDsfiMEftLIc00Ce7BXOG6KINhACklogfsqYiWmgyyYfzpQ1pqQZ6L5OBUxXt2MYqLosn5ddtHOyNFEG6oqDADe74rJeHUFOsehtQRADA8Hy/kADRVqnyQKZ6stzefAYWAYxUH/fgjlAMLcYmNhmbJ0+ccHWQl5wLKyJBMuHrmZnz1lrDmYH7Q7GY6CZNoQOjwIDPSBT3CE5N0IbKu8JcQ2PFzu7awBEiDNIabTEphSMGsjATFXABADPmtH4Q6A3BgAAAABJRU5ErkJggg==);' +
            'background-size:80px 30px;' +
            '}' +
            '.tstx_pwrd.__small{' +
            'background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAABGdBTUEAALGPC/xhBQAAAK9JREFUOBFjZICC////swKZyUD8FohvAfFTIP7AyMj4ByjHDGQLALEgEAsBsSoQswPl5gFpVABUnAzE2ADIoH/YJIBi7jBTmGAMIH0FiF8i8WFMkGsYYRwk+j6QfRfGx1AAtEUaKAnC4kBsA8RlQAwC5UAMs+wx0FuvwKLEEEBDHZC8pIJPD7LX8KkjKDdqEMEgYhgNo+EYRp+gnvoPpD8T9iAeFcBMGwrEnniUgKUAnull3IwuTacAAAAASUVORK5CYII=) no-repeat center;' +
            'width:40px;' +
            'height:40px;' +
            'background-size:18px 18px;' +
            'background-color:#2f2f2f;' +
            '}' +
            '@media (-webkit-min-device-pixel-ratio: 1.5), (-webkit-min-device-pixel-ratio: 1.25), (min-resolution: 120dpi), (min-resolution: 1.5dppx) {' +
            '.tstx_pwrd{' +
            'background-image:url(data:image/png;base64,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);' +
            '}' +
            '.tstx_pwrd.__small{' +
            'background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABGdBTUEAALGPC/xhBQAAAT1JREFUWAntl89KQlEQh70pSLgRIgLDghBJkB7B1r1Ar9HStQ/Rugdo0co36A1KERQFzcqN6CVqI96+AxJymdtcwX+LGfg4nJkzc4cfv81NJPYsPGmfIAguyT/CKbzAK7TgDYbwDlP48TxvxvkX9Ka5HMIx5MDNyEMJrqAIz3BLr8+pB0OfIG7MePgF3zCP28S7qrTJgZQkdx2Rl9JJkhlwqoiKS03kKlI+aqFP6fGac6PY85CzDHXwYd3xwcAHOJIW+ldimlz9Apwhz+EMnEmzCwqcJ7AcHS7O/BMYwwD60IMmRo6vDA0rBQvXIBw3Kw0JPY7yUOjZ9q62kKa1KWQKaQpodfOQKaQpoNXNQ6aQpoBWNw+ZQpoCWt08ZAppCmh189CmFeoKH3C/zLsJ/qFTcA9taMDdbjbZ4Fd/AbjDFnzEzz9fAAAAAElFTkSuQmCC);' +
            '}' +
            '}';

        /**
         * Найти и проинициализировать все контейнеры с опубликованными приложениями
         * Подходит для многократного перезапуска
         */
        function init() {
            var elems = document.getElementsByClassName('testix_project');
            if (messageEventAttached === false) {
                window.addEventListener("message", receiveMessage, false);
                messageEventAttached = true
            }
            for (var i = 0; i < elems.length; i++) {
                var e = elems[i];
                // локально вставит стили необходимые загрузчику
                var style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet){
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                e.appendChild(style);
                e.style.position = 'relative';
                e.style.overflow = 'hidden';
                e.style.margin = '0 auto';
                if (e.innerHTML.indexOf('<iframe') < 0) {
                    // еще не инитили надо создать iframe
                    var w = parseInt(e.getAttribute('data-width')) || '800';
                    var h = parseInt(e.getAttribute('data-height')) || '600';
                    var p = normalizeDataPublished(e.getAttribute('data-published'));
                    var l = e.getAttribute('data-icon-mod');
                    var lp = e.getAttribute('data-l');
                    e.style.maxWidth = w+'px';
                    e.style.height = h+'px';

                    createIframe(p, e, w, h);
                    // sperbank july 2017
                    if (lp !== 'no' && p.indexOf('37a6197612') < 0 && p.indexOf('db2ea526ed') < 0) {
                        createPoweredLabel(e, l);
                    }
                    initGA(e);
                }
            }
        }

        /**
         * Проверить значение атрибута "data-published"
         *
         * Первоначальная версия формата:
         * Нормальный урл проекта выглядит так: "http://p.testix.me/121947341568004/27e77fae5b/p_index.html"
         *
         * Версия от 26.04.2017:
         * Можно ожидать такой: "121947341568004/27e77fae5b"
         * Тогда его надо превратить в: "//s3.eu-central-1.amazonaws.com/p.testix.me/121947341568004/27e77fae5b/p_index.html"
         *
         * @param {string} dataPublishedAttr
         */
        function normalizeDataPublished(dataPublishedAttr) {
            if (dataPublishedAttr.indexOf('http') === 0) {
                // старый формат "http://p.testix.me/..." - оставляем как есть
                return dataPublishedAttr;
            }
            else {
                // ожидается "121947341568004/27e77fae5b" надо дополнить до полного урла
                return publishedProjectsHome+dataPublishedAttr+'/p_index.html';
            }
        }

        /**
         * Инициализировать Google Analytics api
         * @param cnt куда встроить скрипт ga
         */
        function initGA(cnt) {
            var gaId = 'UA-88595022-2';
            if (!window.ga) {
                var gaCode = '<script>(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\');ga(\'create\', \'{{ga_id}}\', \'auto\', {{params}});ga(\'testixTracker.send\', \'pageview\');{{init_event}}</script>';
                gaCode = gaCode.replace('{{ga_id}}', gaId);
                gaCode = gaCode.replace('{{params}}', '{\'name\':\'testixTracker\'}');
                gaCode = gaCode.replace('{{init_event}}', 'ga(\'testixTracker.send\', \'event\', \'TestixLoader\', \'Init_analytics\');');
                var d = document.createElement('div');
                d.innerHTML = gaCode;
                cnt.appendChild(d.firstChild);
            }
            else {
                window.ga('create', gaId, 'auto', {'name': 'testixTracker'});
            }
        }


        /**
         * Отправить событие в систему сбора статистики
         *
         * @param {string} category, например Videos
         * @param {string} action, например Play
         * @param {string} [label], например 'Fall Campaign' название клипа
         * @param {number} [value], например 10 - длительность
         */
        function stat(category, action, label, value) {
            if (window.ga) {
                var statData = {
                    hitType: 'event',
                    eventCategory: category,
                    eventAction: action,
                };
                if (label) {
                    statData.eventLabel = label;
                }
                if (value) {
                    statData.eventValue = value
                }
                window.ga('testixTracker.send', statData);
            }
        };


        /**
         * Вставить метку "TESTIX" со ссылкой на сайт
         *
         * @param cnt контейнер куда вставить
         * @param {string} [labelMod] - возможность установить модификатор для иконки (например, "__small" для панорам)
         */
        function createPoweredLabel(cnt, labelMod) {
            labelMod = labelMod || '';
            var s = '<a href="//testix.me" target="_blank" class="tstx_pwrd '+labelMod+'" onclick="testix.onLabelClick()"></a>';
            var div = document.createElement('div');
            div.innerHTML = s;
            cnt.appendChild(div.firstChild);
        }

        /**
         * Клик на иконку сервиса в углу проекта.
         * Для сбора статистики
         *
         * @param e
         */
        function onLabelClick(e) {
            stat('TestixLoader','Label_click');
        }


        /**
         * Создать iframe для mutapp приложения
         *
         * @param url
         * @param parentNode
         * @param width
         * @param height
         * @param recomWrapper
         * @returns {HTMLElement}
         */
        function createIframe(url, parentNode, width, height, recomWrapper) {
            var panelElems = createRecommendationPanel(parentNode, width);
            var iframe = document.createElement('iframe');
            iframe.setAttribute('allowFullScreen', '');
            iframe.style.border = 0;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.maxWidth = width+'px';
            iframe.style.maxHeight = height+'px';
            iframe.onload = function() {
                // надо сохранить ид приложения для связи
                //var appId = iframe.contentWindow.app.id;
                iframe.contentWindow.postMessage({method:'init'}, '*');
                testixApps.push({
                    width: width,
                    height: height,
                    parentNode: parentNode,
                    iframe: iframe,
                    recomWrapper: panelElems.recomWrapper,
                    recomPanel: panelElems.recomPanel,
                    leftArrow: panelElems.leftArrow,
                    rightArrow: panelElems.rightArrow,
                    close: panelElems.close,
                    panelWidth: 0
                });
                stat('TestixLoader','Iframe_Loaded');
                requestRecommendation(iframe.contentWindow);
            };
            iframe.src = url;
            parentNode.appendChild(iframe);
            return iframe;
        }


        /**
         * Создать блок рекомендаций для этого testix_project
         *
         * @param parentNode
         * @param panelWidth
         */
        function createRecommendationPanel(parentNode, appWidth) {
            var recomPanel = document.createElement('div');
            recomPanel.setAttribute('class','tstx_rec_panel');

            // контейнер для рекомендаций
            var recomItemsCnt = document.createElement('div');
            recomItemsCnt.setAttribute('class','tstx_rec_items_cnt');
            recomPanel.appendChild(recomItemsCnt);

            var la = document.createElement('div');
            la.setAttribute('class','tstx_arr');
            la.onclick = function(e) {
                var l = parseInt(recomItemsCnt.style.left)||0;
                var info = getTestixAppInfoByArrow(e.currentTarget);
                if (l < 0) {
                    var s = horizScrollStep;
                    var d = Math.abs(l);
                    if (d < horizScrollStep) {
                        s = d;
                    }
                    recomItemsCnt.style.left = l+s+'px';
                }
            }
            recomPanel.appendChild(la);
            var ra = document.createElement('div');
            ra.setAttribute('class','tstx_arr __right');
            ra.onclick = function(e) {
                var l = parseInt(recomItemsCnt.style.left)||0;
                var info = getTestixAppInfoByArrow(e.currentTarget);
                if (l+info.panelWidth > appWidth) {
                    var s = horizScrollStep;
                    var d = Math.abs(l+info.panelWidth-appWidth);
                    if (d < horizScrollStep) {
                        s = d;
                    }
                    recomItemsCnt.style.left = l-s+'px';
                }
            }
            recomPanel.appendChild(ra);

            var close = document.createElement('div');
            close.setAttribute('class','tstx_rec_close');
            close.onclick = function(e) {
                if (recomPanel.getAttribute('class').indexOf('__closed')>0) {
                    recomPanel.setAttribute('class','tstx_rec_panel');
                    close.setAttribute('class','tstx_rec_close');
                }
                else {
                    recomPanel.setAttribute('class','tstx_rec_panel __closed');
                    close.setAttribute('class','tstx_rec_close __up');
                }
                e.preventDefault();
                e.stopPropagation();
            };
            recomPanel.appendChild(close);

            parentNode.appendChild(recomPanel);

            return {
                recomWrapper: recomItemsCnt,
                recomPanel: recomPanel,
                leftArrow: la,
                rightArrow: ra,
                close: close
            };
        }

        /**
         * Запрос файла рекомендаций в текущем каталоге опубликованного проекта
         * @param {string} appWindow
         */
        function requestRecommendation(appWindow) {
            var xhr = new XMLHttpRequest();
            var info = getTestixAppInfo(appWindow);
            xhr.addEventListener("load", function(e) {
                var o = null;
                try {
                    o = JSON.parse(e.target.responseText);
                }
                catch(err) {}
                if (o) {
                    var info = getTestixAppInfo(appWindow);
                    info.recommendations = o.recommendations;
                }
            });
            xhr.open('GET',info.iframe.src.replace(/p_index.html$/ig,'r.json')+'?r='+Math.random());
            xhr.send();
        }

        /**
         * Найти информацию о проекте по его ид
         *
         * @param {string} appWindow
         * @returns {*}
         */
        function getTestixAppInfo(appWindow) {
            for (var i = 0; i < testixApps.length; i++) {
                if (testixApps[i].iframe.contentWindow === appWindow) {
                    return testixApps[i];
                }
            }
            return null;
        }

        function getTestixAppInfoByArrow(arrow) {
            for (var i = 0; i < testixApps.length; i++) {
                if (testixApps[i].leftArrow === arrow || testixApps[i].rightArrow === arrow) {
                    return testixApps[i];
                }
            }
            return null;
        }

        /**
         * Удалить информацию об элементе
         * При открытии рекомендации удаляется приложение
         *
         * @param {window} appWindow
         */
        function deleteTestixAppInfo(appWindow) {
            for (var i = 0; i < testixApps.length; i++) {
                if (testixApps[i].iframe.contentWindow === appWindow) {
                    testixApps.splice(i, 1);
                    return;
                }
            }
            return;
        }

        /**
         * Открыть рекомендованное приложение
         * У текущего айфрейма будет заменен src
         *
         * @param {window} appWindow - в каком проекте хотим открыть
         * @param {string} recommendationUrl - урл проекта который хотим открыть по рекомендации
         */
        function openRecommendation(appWindow, recommendationUrl) {
            var info = getTestixAppInfo(appWindow);
            deleteTestixAppInfo(appWindow);
            info.parentNode.removeChild(info.iframe);
            info.parentNode.removeChild(info.recomPanel);
            createIframe(recommendationUrl, info.parentNode, info.width, info.height);
            stat('TestixLoader','Open_Recommendation');
        }

        /**
         *
         * @param {window} appWindow - window приложения которое отправило запрос
         */
        function hideRecommendation(appWindow) {
            var info = getTestixAppInfo(appWindow);
            info.recomPanel.style.display = 'none';
        }

        /**
         * Приложение mutapp должно сказать о том, когда можно показывать рекомендации
         *
         * @param {window} appWindow - window приложения которое отправило запрос на показ
         */
        function showRecommendation(appWindow) {
            var info = getTestixAppInfo(appWindow);
            if (info) {
                if (info.recomItems) {
                    for (var k = 0; k < info.recomItems.length; k++) {
                        info.recomWrapper.removeChild(info.recomItems[k]);
                    }
                }
                info.panelWidth = 0;
                info.recomItems = [];
                if (info.recommendations && info.recommendations.length > 0) {
                    for (var i = 0; i < info.recommendations.length; i++) {
                        var d = document.createElement('div');
                        d.setAttribute('class','tstx_rec_item');
                        // выбор поведения элемента: либо открытие рекомендации либо как просто баннер на внешний ресурс
                        if (info.recommendations[i].url) {
                            d.setAttribute('data-recommendation-url', info.recommendations[i].url);
                        }
                        else if (info.recommendations[i].bannerUrl) {
                            d.setAttribute('data-banner-url', info.recommendations[i].bannerUrl);
                        }

                        if (info.recommendations[i].title) {
                            var recTxt = document.createElement('div');
                            recTxt.setAttribute('class','tstx_rec_item_txt');
                            recTxt.textContent = info.recommendations[i].title;
                            d.appendChild(recTxt);
                        }

                        if (info.recommendations[i].icon) {
                            //add image
                            var recImg = document.createElement('div');
                            recImg.setAttribute('class','tstx_rec_item_img');
                            recImg.style.backgroundImage = 'url('+info.recommendations[i].icon+')';
                            d.appendChild(recImg);
                        }

                        //TODO клик на открыть в новой вкладке
                        //TODO вернуться назад ?
                        d.onclick = function(e) {
                            var recommendationUrl = e.currentTarget.getAttribute('data-recommendation-url');
                            if (recommendationUrl) {
                                openRecommendation(appWindow, recommendationUrl);
                            }
                            else {
                                // открытие ссылки баннера в новой вкладке
                                var bannerUrl = e.currentTarget.getAttribute('data-banner-url');
                                if (bannerUrl) {
                                    var win = window.open(bannerUrl, '_blank');
                                    win.focus();
                                }
                            }
                        };
                        info.recomWrapper.appendChild(d);
                        info.recomItems.push(d);

                        // подсчет ширины панели для горизонтальной прокутки
                        info.panelWidth += panelElemWidth;
                        info.panelWidth += panelElemMargin;
                    }
                    info.recomPanel.style.display = 'block';
                    // по умолчанию панеь сначала показывается в развернутом виде, без модификатора __close
                    info.recomPanel.setAttribute('class','tstx_rec_panel');
                    info.recomPanel.style.bottom = '-172px'; // высота панели по классу tstx_rec_panel
                    setTimeout(function() {
                        // начало анимации, панелька начнем двигаться в положение bottom:0
                        info.recomPanel.style.bottom = '';
                    }, 50);
                    info.close.setAttribute('class','tstx_rec_close');
                }

                // определить нужна ли горизонтальная прокрутка рекомендаций
                if (info.panelWidth > info.width) {
                    // нужна прокрутка
                    info.leftArrow.style.display = 'block';
                    info.rightArrow.style.display = 'block';
                }
                else {
                    info.leftArrow.style.display = 'none';
                    info.rightArrow.style.display = 'none';
                }

                stat('TestixLoader','Show_Recommendations');
            }
        }

        function receiveMessage(event)
        {
            console.log('loader.receiveMesage');
            var reg = new RegExp(/^(http|https):\/\/p\.testix\.me/ig);
            if (reg.test(event.origin) !== true) {
                return;
            }

            if (event.data.method === 'showRecommendations') {
                showRecommendation(event.source);
            }
            if (event.data.method === 'hideRecommendations') {
                hideRecommendation(event.source);
            }
            if (event.data.method === 'shareDialog') {
                stat('TestixLoader','Share_Dialog_Open', event.data.provider);
            }
        }

        // public
        global.init = init;
        global.getApps = function() { return testixApps; };
        global.showRecommendation = showRecommendation;
        global.onLabelClick = onLabelClick;
    })(testix);
}
// можно запускать несколько раз, например, если появятся новые ембеды
// или же теги встроены непоследовательно
testix.init();
var testixApps = testix.getApps();
function testShow() {

    testix.showRecommendation(testixApps[0].iframe.contentWindow);
}