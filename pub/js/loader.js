/**
 * Created by artyom.grishanov on 17.12.15.
 */
if (window.textix === undefined) {
    var testix = {};
    (function(global){

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
                    // TODO показать loader
                    var w = parseInt(e.getAttribute('data-width')) || '800';
                    var h = parseInt(e.getAttribute('data-height')) || '600';
                    var p = e.getAttribute('data-published');
                    e.style.width = w+'px';
                    e.style.height = h+'px';

                    createIframe(p, e, w, h);
                }
            }
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
            iframe.style.border = 0;
            iframe.style.width = width+'px';
            iframe.style.height = height+'px';
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
        }

        // public
        global.init = init;
        global.getApps = function() { return testixApps; };
        global.showRecommendation = showRecommendation;

    })(testix);
}
// можно запускать несколько раз, например, если появятся новые ембеды
// или же теги встроены непоследовательно
testix.init();
var testixApps = testix.getApps();
function testShow() {

    testix.showRecommendation(testixApps[0].iframe.contentWindow);
}