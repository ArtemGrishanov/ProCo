/**
 * Created by artyom.grishanov on 12.04.16.
 */

var Publisher = {};
(function(global) {
    var indexHtml = 'index.html';
    /**
     * Префикс к хтмлке продукта, чтобы не путать с анонимкой при публикации
     * @type {string}
     */
    var indexPrefix = 'p_';
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
     * Имя проекта для публикации, например test
     * @type {string}
     */
    var appName = null;
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
     * Каталог в котором находятся ресурсы спецпроекта
     * например 'products/test/'
     * @type {null}
     */
    var baseProductUrl = null;
    /**
     * Ширина приложения
     * @type {number}
     */
    var appWidth = 800;
    /**
     * Высота приложения
     * @type {number}
     */
    var appHeight = 600;
    /**
     * Показывает, что в данный момент идет процесс публикации
     * @type {boolean}
     */
    var isPublishing = false;

    /**
     * Сохранить промо проект на сервере
     * 1) Для этого сначала составляется список всех ресурсов проекта: css, js, картинки
     * 2) Затем они скачиваются
     * 3) Идет перезапись параметров app и стилей стилей приложения
     * 4) Загружаются в хранилище в персональный каталог пользователя
     *
     * @params.appId {string} - уникальный ид проекта, типа c31ab01f0c
     * @params.appName {string} - тип проекта например test
     * @params.width {number} - ширина проекта, для ембед кода
     * @params.height {number} - высота проекта для ембед кода
     * @params.appStr {string} - app свойства промо приложения, который надо перезаписать
     * @params.cssStr {string} - css стили приложения, которые надо добавить в index.html
     * @params.cssStr {string} - css стили приложения, которые надо добавить в index.html
     * @params.promoIframe {iFrame} - iframe приложения прототипа, который меняем
     * @params.baseProductUrl {string} - базовый каталог спецпроекта для работы с ресурсами, например 'products/test'
     * @params.awsBucket {Object}
     */
    function publish(params) {
        if (App.getUserData() !== null) {
            isPublishing = true;
            App.stat('Testix.me', 'Publish_started');
            callback = params.callback;
            publishedAppId = params.appId;
            appName = params.appName;
            appStr = params.appStr;
            cssStr = params.cssStr;
            appWidth = params.width;
            appHeight = params.height;
            promoIframe = params.promoIframe;
            baseProductUrl = params.baseProductUrl;
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
                var indexRes = getResourceByUrl(indexPrefix+indexHtml);
                indexRes.data = deleteOverridedAppParams(indexRes.data);

                Queue.onComplete('overrideApp', function() {
                    log('Apps were overrided.');

                    Queue.onComplete('uploadRes', function() {
                        isPublishing = false
                        if (errorInPublish === true) {
                            callback('error', null);
                        }
                        else {
                            log('All resources were uploaded.');
                            callback('success', null);
                            App.stat('Testix.me', 'Publish_completed');
                        }
                    });
                    uploadProductResources({
                        taskType:'uploadRes',
                        priority:8,
                        maxWaitTime: 40000
                    });
                });
                overrideAppParams({
                    taskType:'overrideApp',
                    priority:9,
                    maxWaitTime: 10000
                });
                embedIframeToAnonymPage({
                    taskType:'overrideApp',
                    priority:9,
                    maxWaitTime: 10000
                });
            });
            grabProductResources({
                taskType:'grabResTask',
                priority:10,
                maxWaitTime: 30000
            });
        }
    }

    /**
     * Ссылка на анонимку, которой можно поделиться, на которую можно зайти.
     * @returns {string}
     */
    function getAnonymLink(appId) {
        var appId = appId || publishedAppId;
        return 'http:'+config.common.publishedProjectsHostName+App.getUserData().id+'/'+appId+'/';
    }

    /**
     * HTML код для вставки на сайт
     * @returns {string}
     */
    function getEmbedCode() {
        var projectCustomAttr = config.products[appName].customEmbedCodeAttributes;
        var embedCode = config.common.embedCodeTemplate;
        embedCode = embedCode.replace('{{width}}', appWidth+'px')
            .replace('{{height}}', appHeight+'px')
            .replace('{{published}}', App.getUserData().id+'/'+publishedAppId)
            .replace('{{custom_attributes}}',' '+projectCustomAttr);
        return embedCode;
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
            if (productResources[i].destUrl) {
                if (productResources[i].destUrl === url) {
                    return productResources[i];
                }
            }
            else {
                if (productResources[i].url === url) {
                    return productResources[i];
                }
            }
        }
        return null;
    }

    /**
     * Найти все ресурсы, используемые в продукте, и подготовиться к их загрузке
     */
    function buildProductResourceList(codeStr) {
        productResources = [];

        // специальные ресурсы для публикации описаны в свойства config.products.common.publishResources
        for (var i = 0; i < config.products.common.publishResources.length; i++) {
            var c = JSON.parse(JSON.stringify(config.products.common.publishResources[i]));
            if (c.baseUrl === undefined) {
                c.baseUrl = baseProductUrl;
            }
            productResources.push(c);
        }

        //TODO поиск предполагает что ресурсы находятся рядом с html в baseUrl
        var scriptExp = /src=(?:\"|\')([^\.](?:\w|\/|\.|\-|\_)+\.js)(?:\"|\')/ig;
        var jsMatch = null;
        while ( (jsMatch = scriptExp.exec(codeStr)) !== null) {
            // если этот ресурс не был отдельно записан в config.products.common.publishResources
            if (getResourceByUrl(jsMatch[1]) === null) {
                productResources.push({
                    baseUrl: baseProductUrl,
                    type: 'text/javascript',
                    url: jsMatch[1]
                });
            }
        }
        var cssExp = /href=(?:\"|')([^\.](?:\w|\/|\.|\-|\_)+.css)(?:\"|')/ig;
        var cssMatch = null;
        while ( (cssMatch = cssExp.exec(codeStr)) !== null) {
            // если этот ресурс не был отдельно записан в config.products.common.publishResources
            if (getResourceByUrl(cssMatch[1]) === null) {
                productResources.push({
                    baseUrl: baseProductUrl,
                    type: 'text/css',
                    url: cssMatch[1]
                });
            }
        }
    }

    /**
     * Заменить подстроку в этом ресурсе согласно конфигу
     * Нужно для подмены адресов скриптов, стилей при публикации, например
     * from: <script type="text/javascript" src="../common/js/mutapp.js"></script>
     * to: <script type="text/javascript" src="mutapp.js"></script>
     *
     * @param {object} resourceData
     * @param {string} src
     * @returns {string}
     */
    function replaceStringInResource(resourceData, src) {
        var result = src;
        if (resourceData.replace) {
            var p, re;
            for (var i = 0; i < resourceData.replace.length; i++) {
                p = resourceData.replace[i].from;
                re = new RegExp(p, "g");
                result = result.replace(re, resourceData.replace[i].to);
            }
        }
        return result;
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
                        log('Grab task run:' + this.data.baseUrl + this.data.url);
                        var client = new XMLHttpRequest();
                        client.open('GET', this.data.baseUrl + this.data.url);
                        client.onreadystatechange = (function(e) {
                            if (e.target.readyState == 4) {
                                if(e.target.status == 200) {
                                    // task context
                                    log('Grab task done:' + this.data.url);
                                    var text = e.target.responseText;
                                    if (this.data.replace) {
                                        // надо произвести замену текста
                                        text = replaceStringInResource(this.data, text);
                                    }
                                    setDataToResource(this.data.url, text);
                                }
                                else {
                                    log('Resource request failed: '+ e.target.statusText, true);
                                }
                                // даем понять, что таск завершен
                                Queue.release(this);
                            }
                        }).bind(this);
                        client.send();
                    },
                };
                if (param.taskType) {
                    t.type = param.taskType;
                }
                if (param.priority) {
                    t.priority = param.priority;
                }
                if (param.maxWaitTime) {
                    t.maxWaitTime = param.maxWaitTime;
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
                var indexResource = getResourceByUrl(indexPrefix+indexHtml);
                var writeAnchorReg = /(var\s+DEFAULT_PARAMS\s+=\s+{.*};)/ig;
                var match = writeAnchorReg.exec(indexResource.data);
                if (match && match[1]) {
                    var positionToInsert = match.index+match[1].length;

                    overrideParamsStr = 'var DEFAULT_PARAMS = '+appStr+';';
                    indexResource.data = indexResource.data.slice(0,positionToInsert) + overrideParamsStr + indexResource.data.slice(positionToInsert);
                    //var overrideParamsStr = '\n'+config.common.tagsForOverridingParams[0]+'var o='+appStr+';'+'for(var key in o)if(o.hasOwnProperty(key))app[key]=o[key];'+config.common.tagsForOverridingParams[1]+'\n'
                    //indexResource.data = indexResource.data.slice(0,positionToInsert) + overrideParamsStr + indexResource.data.slice(positionToInsert);

                    // вставка кастомных css стилей
                    var endHeadReg = /<\/head>/ig;
                    var matchHead = endHeadReg.exec(indexResource.data);
                    var positionToInsertCss = matchHead.index;
                    var csss = '\n<style>'+cssStr+'</style>\n';
                    indexResource.data = indexResource.data.slice(0,positionToInsertCss) + csss + indexResource.data.slice(positionToInsertCss);
                }
                else {
                    log('Publisher.overrideAppParams: Cannot find write anchor', true);
                }
                Queue.release(this);
            }
        };
        if (param.taskType) {
            t.type = param.taskType;
        }
        if (param.priority) {
            t.priority = param.priority;
        }
        if (param.maxWaitTime) {
            t.maxWaitTime = param.maxWaitTime;
        }
        Queue.push(t);
    }

    /**
     * Вставить айфрейм в анонимку
     *
     * @param param
     */
    function embedIframeToAnonymPage(param) {
        var t = {
            data: '',
            run: function() {
                // destUrl анонимной страницы == 'index.html'
                var indexResource = getResourceByUrl('index.html');
                indexResource.data = indexResource.data.replace(config.common.anonymPageAnchorToEmbed, getEmbedCode());
                Queue.release(this);
            }
        };
        if (param.taskType) {
            t.type = param.taskType;
        }
        if (param.priority) {
            t.priority = param.priority;
        }
        if (param.maxWaitTime) {
            t.maxWaitTime = param.maxWaitTime;
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
                    var u = this.data.destUrl || this.data.url;
                    // log('Upload task run:' + u);
                    var objKey = App.getUserData().id+'/'+publishedAppId+'/'+u;
                    var params = {
                        Key: objKey,
                        ContentType: this.data.type,
                        Body: this.data.data,
                        ACL: 'public-read'
                    };
                    s3util.requestPub('putObject', params, (function (err, data) {
                        // task object context
                        if (err) {
                            errorInPublish = true;
                            log('ERROR: ' + err, true);
                        }
                        log('Upload task done:' + u);
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
            if (param.maxWaitTime) {
                t.maxWaitTime = param.maxWaitTime;
            }
            Queue.push(t);
        }
    }

    global.publish = publish;
    global.getEmbedCode = getEmbedCode;
    global.getAnonymLink = getAnonymLink;
    global.isError = function() {return errorInPublish;}
    global.isPublishing = function() {return isPublishing;}

})(Publisher);