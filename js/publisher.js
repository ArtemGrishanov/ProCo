/**
 * Created by artyom.grishanov on 12.04.16.
 */

var Publisher = {};
(function(global) {
    var indexHtml = 'index.html';
    var bucket = null;
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
     *
     * @type {boolean}
     */
    var isInited = false;
    /**
     * Уникальный ид проекта, который публикуется.
     * @type {string}
     */
    var publishedAppId = null;
    /**
     * Строка сериализованные свойства для записи
     * @type {string}
     */
    var appStr = null;
    /**
     * Строка с кастомными стилями для записи
     * @type {string}
     */
    var cssStr = null;
    /**
     * айфрейм промопроекта для работы с исходным кодом
     * @type {string}
     */
    var promoIframe = null;
    /**
     * Колбек для обратного вызова после завершения публикации
     * @type {function}
     */
    var callback = null;

    /**
     * Инициаоизация модуля.
     * Передача важных параметров, необходимых для работы
     *
     * @param.awsBucket {object} - объект апи aws для аплоада
     * @param.callback {function} - функция вызываемая по умолчанию
     */
    function init(params) {
        bucket = params.awsBucket;
        callback = params.callback;
        isInited = true;
    }

    /**
     * Сохранить промо проект на сервере
     * 1) Для этого сначала составляется список всех ресурсов проекта: css, js, картинки
     * 2) Затем они скачиваются
     * 3) Идет перезапись параметров app и стилей стилей приложения
     * 4) Загружаются в хранилище в персональный каталог пользователя
     *
     * @params.appId {string} - уникальный ид проекта, типа c31ab01f0c
     * @params.appStr {string} - app свойства промо приложения, который надо перезаписать
     * @params.cssStr {string} - css стили приложения, которые надо добавить в index.html
     * @params.cssStr {string} - css стили приложения, которые надо добавить в index.html
     * @params.promoIframe {iFrame} - iframe приложения прототипа, который меняем
     */
    function publish(params) {
        publishedAppId = params.appId;
        appStr = params.appStr;
        cssStr = params.cssStr;
        promoIframe = params.promoIframe;
        errorInPublish = false;
        //TODO собираем ресурсы в несколько проходов
        // например, для того чтобы забрать картинку, сначала надо скачать и распарсить файл css
        var iframeDocument = promoIframe.contentDocument || promoIframe.contentWindow.document;
        buildProductResourceList(iframeDocument.documentElement.innerHTML);
        //подписка на окончания задач по сбору ресурсов для проекта
        Queue.onComplete('grabResTask', function(){
            log('All resources grabbed.');

            //TODO меняем ссылки на картинки
//            var imgReg = /((?:\w)+\/(?:\w)+\.(?:jpg|jpeg|png))/ig;
//            for (var i = 0; i < productResources.length; i++) {
//                var imgMatch = null;
//                while ( (imgMatch = imgReg.exec(productResources.data)) !== null) {
//                    //imgMatch[1]
//                }
//            }

            // удалим лишние параметры внутри приложения если они там есть
            var indexRes = getResourceByUrl(indexHtml);
            indexRes.data = deleteOverridedAppParams(indexRes.data);

            Queue.onComplete('overrideApp', function() {
                log('Apps were overrided.');

                Queue.onComplete('uploadRes', function() {
                    if (errorInPublish === true) {
                        callback('error', null);
                    }
                    else {
                        log('All resources were uploaded.');
                        var src = getDistribUrl()+indexHtml;
                        callback('success', {src: src});
                    }
                });
                uploadProductResources({
                    taskType:'uploadRes',
                    priority:8
                });
            });
            overrideAppParams({
                taskType:'overrideApp',
                priority:9
            });

        });
        grabProductResources({
            taskType:'grabResTask',
            priority:10
        });
    }

    function getDistribUrl() {
        return config.common.awsHostName+config.common.awsBucketName+'/facebook-'+fbUserId+'/pub/'+publishedAppId+'/';
    }

    /**
     * Для указанного имени ресурса задать загруженные данные
     */
    function setDataToResource(url, data) {
        for (var i = 0; i < productResources.length; i++) {
            if (productResources[i].url === url) {
                productResources[i].data = data;
            }
        }
    }

    /**
     * Вернуть объект-ресурс по его url
     */
    function getResourceByUrl(url) {
        for (var i = 0; i < productResources.length; i++) {
            if (productResources[i].url === url) {
                return productResources[i];
            }
        }
        return null;
    }

    /**
     * Найти все ресурсы, используемые в продукте, и подготовиться к их загрузке
     */
    function buildProductResourceList(codeStr) {
        productResources = [];
        //TODO поиск предполагает что ресурсы находятся рядом с html в baseUrl
        var scriptExp = /src=(?:\"|\')((?:\w)+\.js)(?:\"|\')/ig;
        var jsMatch = null;
        while ( (jsMatch = scriptExp.exec(codeStr)) !== null) {
            productResources.push({
                type: 'text/javascript',
                url: jsMatch[1]
            });
        }
        var cssExp = /href=(?:\"|')((?:\w)+.css)(?:\"|')/ig;
        var cssMatch = null;
        while ( (cssMatch = cssExp.exec(codeStr)) !== null) {
            productResources.push({
                type: 'text/css',
                url: cssMatch[1]
            });
        }
        //TODO img (только "свои" картинки) Из инетов пока не рассматриваем варианты

        // добавляем главный html файл
        productResources.push({
            url: indexHtml,
            type: 'text/html'
        });
    }

    /**
     * Собрать все ресурсы промо-проекта и положить их в productResources
     * Ресурсы загружаются в помощью XMLHttpRequest
     *
     * @param param
     */
    function grabProductResources(param) {
        for (var i = 0; i < productResources.length; i++) {
            if (!productResources[i].data) {
                var t = {
                    // клонируем данные для задачи, так как иначе индекс i сбиндится, будет браться последний из цикла
                    data: JSON.parse(JSON.stringify(productResources[i])),
                    run: function() {
                        log('Grab task run:' + baseProductUrl + this.data.url);
                        var client = new XMLHttpRequest();
                        client.open('GET', baseProductUrl + this.data.url);
                        client.onreadystatechange = (function(e) {
                            if (e.target.readyState == 4) {
                                if(e.target.status == 200) {
                                    // task context
                                    log('Grab task done:' + this.data.url);
                                    setDataToResource(this.data.url, e.target.responseText);
                                }
                                else {
                                    log('Resource request failed: '+ myRequest.statusText, true);
                                }
                                // даем понять, что таск завершен
                                Queue.release(this);
                            }
                        }).bind(this);
                        client.send();
                    },
                    done: function(e) {
                    }
                };
                if (param.taskType) {
                    t.type = param.taskType;
                }
                if (param.priority) {
                    t.priority = param.priority;
                }
                Queue.push(t);
            }
        }
    }

    /**
     * Удаляет из промо проекта перезаписанные параметры, если они там есть
     */
    function deleteOverridedAppParams(str) {
        var tags = config.common.tagsForOverridingParams;
        var p1 = str.indexOf(tags[0]);
        var p2 = str.indexOf(tags[1]);
        if (p1 >= 0 && p2 >= 0) {
            return str.replace(str.substring(p1,p2+tags[1].length),'');
        }
        return str;
    }

    /**
     * Переписать параметры промо-приложения прототипа на новые, которые получились в результате редактирования
     *
     * @param param
     */
    function overrideAppParams(param) {
        var t = {
            data: '',
            run: function() {
                // здесь происходит подмена параметров промо приложения на новые. Те, которые были настроены пользователем.
                var indexResource = getResourceByUrl(indexHtml);
                var startFuncReg = /(function(?:\s)+start(?:\s)*\((?:\w)*\)(?:\s)*\{)/ig;
                var match = startFuncReg.exec(indexResource.data);
                var positionToInsert = match.index+match[1].length;
                var overrideParamsStr = '\n'+config.common.tagsForOverridingParams[0]+'var o='+appStr+';'+'for(var key in o)if(o.hasOwnProperty(key))app[key]=o[key];'+config.common.tagsForOverridingParams[1]+'\n'
                indexResource.data = indexResource.data.slice(0,positionToInsert) + overrideParamsStr + indexResource.data.slice(positionToInsert);
                Queue.release(this);
            }
        };
        if (param.taskType) {
            t.type = param.taskType;
        }
        if (param.priority) {
            t.priority = param.priority;
        }
        Queue.push(t);
    }

    /**
     * Сохранить все статические ресурсы проекта в хранилище
     *
     * @param param
     */
    function uploadProductResources(param) {
        for (var i = 0; i < productResources.length; i++) {
            var t = {
                // клонируем данные для задачи, так как иначе индекс i сбиндится, будет браться последний из цикла
                data: JSON.parse(JSON.stringify(productResources[i])),
                run: function() {
                    log('Upload task run:' + this.data.url);
                    var objKey = 'facebook-'+fbUserId+'/pub/'+publishedAppId+'/'+this.data.url;
                    var params = {
                        Key: objKey,
                        ContentType: this.data.type,
                        Body: this.data.data,
                        ACL: 'public-read'
                    };
                    bucket.putObject(params, (function (err, data) {
                        // task object context
                        if (err) {
                            errorInPublish = true;
                            log('ERROR: ' + err, true);
                        }
                        log('Upload task done:' + this.data.url);
                        Queue.release(this);
                    }).bind(this));
                }
            };
            if (param.taskType) {
                t.type = param.taskType;
            }
            if (param.priority) {
                t.priority = param.priority;
            }
            Queue.push(t);
        }
    }

    global.init = init;
    global.publish = publish;
    global.isInited = function() {return isInited;}
    global.isError = function() {return errorInPublish;}

})(Publisher);