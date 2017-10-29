/**
 * Created by artyom.grishanov on 06.06.16.
 *
 * Коллекция шаблонов. Это может быть:
 * 1) шаблоны автора (то есть сохраненные проекты)
 * 2) витрина шаблонов
 * 3) какие-то подборки на главной
 * ...
 *
 * @param {string} param.folder - каталог пользователя, из которого будут загружены все шаблоны
 * @param {Array.<string>} param.templateUrls - можно добавить в коллекцию отдельные шаблоны сразу
 */
function TemplateCollection(param) {
    param = param || {};
    this.templates = [];
    this.folder = param.folder;
    if (param.templateUrls) {
        for (var i = 0; i < param.templateUrls.length; i++) {
            var tId = this.getIdFromUrl(param.templateUrls[i]);
            if (tId) {
                this.templates.push(new Template({
                    id: tId,
                    url: param.templateUrls[i]
                }));
            }
        }
    }
}

/**
 * Добавить напрямуб шаблон в коллекцию
 * Без загрузки
 * То есть например новый шаблон, который был создан редактором
 *
 * @param url
 * @returns {*}
 */
TemplateCollection.prototype.add = function(template) {
    this.templates.push(template);
}

/**
 * Получить ид из урла. Ид это имя файла.
 *
 * @param url
 * @returns {*}
 */
TemplateCollection.prototype.getIdFromUrl = function(url) {
    var reg = new RegExp('\/([A-z0-9]+)\.txt$','g');
    var match = reg.exec(url);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

/**
 * Получить список проектов авторизованного пользователя
 * Получить проекты другого пользователя нельзя
 *
 * @param {function} [callback] - функция для обратного вызова, когда шаблоны будут загружены
 * @param folder
 */
TemplateCollection.prototype.loadTemplateList = function(callback) {
    var prefix = this.folder;
    var thisCollection = this;
    thisCollection.templates = [];
    s3util.requestStorage('listObjects', {Prefix: prefix}, function(err, data) {
        if (err) {
            log('ERROR: ' + err, true);
        } else {
            data.Contents.forEach(function (obj) {
                // вырезаем имя файла, чтобы использовать его в качестве id для дальнейшей работы
                var tId = thisCollection.getIdFromUrl(obj.Key);
                if (tId) {
                    // создаем пока практически пустой объект-шаблон
                    // позже он будет дописан более подробной информацией из loadTemplatesInfo
                    var newItem = new Template({
                        // key example 0235e985-8b92-4666-83fa-25fd85ee1072/app/abc123.txt
                        url: obj.Key,
                        id: tId,
                        lastModified: obj.LastModified
                    })
                    // сортировка: вставляем по дате последнего изменения
                    for (var i = 0; i < thisCollection.templates.length; i++) {
                        if (obj.LastModified > thisCollection.templates[i].lastModified) {
                            thisCollection.templates.splice(i,-1,newItem);
                            newItem = null;
                            break;
                        }
                    }
                    if (newItem) {
                        thisCollection.templates.push(newItem);
                    }
                }
            });
            log('Objects in dir '+prefix+':');
        }
        callback();
    });
}

/**
 * Запросить детальную информацию о всех шаблнах
 * картинка, название, атрибуты и так далее...
 * Используется очередь, так как необходимо последновательно загружать большое число файлов
 *
 * @param {function} callback
 */
TemplateCollection.prototype.loadTemplatesInfo = function(callback) {
    if (this.templates !== null) {
        var thisCollection = this;
        for (var i = 0; i < this.templates.length; i++) {
            var t = {
                // клонируем данные для задачи, так как иначе индекс i сбиндится, будет браться последний из цикла
                data: {
                    id: this.templates[i].id,
                    templateUrl: config.common.awsHostName+config.common.awsBucketName+'/'+this.templates[i].url
                },
                run: function() {
                    log('Requesting template by id:' + this.data.id);
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = (function(e) {
                        if (e.target.readyState == 4) {
                            if(e.target.status == 200) {
                                // временные данные для десеарилизации
                                var td = new Template();
                                td.deserialize(e.target.responseText);
                                var templ = thisCollection.getById(this.data.id);
                                // получили внутренние содержимое файла - дописываем в шаблон
                                mergeIfNotNullProperties(td, templ);
                                if (templ.isValid() === true) {
                                    callback(templ);
                                }
                                else {
                                    log('Data not valid. Template url: \''+this.data.templateUrl+'\'', true);
                                }
                            }
                            else {
                                log('Resource request failed: '+ this.data.templateUrl, true);
                            }
                            Queue.release(this); // завершить задачу
                        }
                    }).bind(this);
                    xhr.open('GET',this.data.templateUrl+'?r='+getUniqId());
                    xhr.send();
                }
            };
            Queue.push(t);
        }
    }
}

/**
 * Удалить шаблон из коллекции,
 * при этом он удаляется и из хранилища AWS
 *
 * @param {function} callback
 * @param {string} id
 */
TemplateCollection.prototype.delete = function(callback, id) {
    var template = this.getById(id);
    if (template) {
        log('Deleting project:' + id);
        var objKey = Auth.getUser().id+'/app/'+id+'.txt';
        var params = {
            Key: objKey
        };
        s3util.requestStorage('deleteObject', params, (function (err, data) {
            if (err) {
                log('ERROR: ' + err, true);
                callback('error');
            }
            else {
                log('Deleting task done: ' + id);
                var delIndex = this.templates.indexOf(template);
                if (delIndex >= 0) {
                    // удаляем также из локальной коллекции этот шаблон
                    this.templates.splice(delIndex, 1);
                }
                callback('ok');
            }
        }).bind(this))
    }
    else {
        callback('error');
    }
}

/**
 * Получить шаблон коллекции по его ид
 *
 * @param id
 * @returns {*}
 */
TemplateCollection.prototype.getById = function(id) {
    for (var i = 0; i < this.templates.length; i++) {
        if (this.templates[i].id === id) {
            return this.templates[i];
        }
    }
    return null;
}

/**
 * Сохранить шаблон в хранилище
 * @param id - ид шаблона в коллекции
 */
TemplateCollection.prototype.saveTemplate = function(callback,
                                                     appId,
                                                     propertyValues,
                                                     descriptor,
                                                     title) {
    if (appId) {
        var template = this.getById(appId);
        if (template) {
            if (propertyValues) {
                template.propertyValues = propertyValues;
            }
            if (descriptor) {
                template.descriptor = descriptor;
            }
            if (title) {
                template.title = title;
            }
            log('Saving project:' + appId);
            var objKey = Auth.getUser().id+'/app/'+appId+'.txt';
            var params = {
                Key: objKey,
                ContentType: 'text/plain',
                Body: template.serialize(),
                ACL: 'public-read'
            };
            s3util.requestStorage('putObject', params, (function (err, data) {
                if (err) {
                    log('ERROR: ' + err, true);
                    callback('error');
                }
                else {
                    log('Saving task done: ' + appId);
                    callback('ok');
                }
            }).bind(this));
        }
        else {
            log('TemplateCollection.saveTemplate: There is no template with id='+id, true);
        }
    }
    else {
        log('TemplateCollection.saveTemplate: You must specify appId for saving', true);
    }
}