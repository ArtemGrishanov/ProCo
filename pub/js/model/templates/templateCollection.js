/**
 * Created by artyom.grishanov on 06.06.16.
 *
 * Коллекция шаблонов. Это может быть:
 * 1) шаблоны автора (то есть сохраненные проекты)
 * 2) витрина шаблонов
 * 3) какие-то подборки на главной
 * ...
 *
 * @param {string} param.folder
 */
function TemplateCollection(param) {
    param = param || {};
    this.templates = [];
    this.folder = param.folder;
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
    App.getAWSBucket().listObjects({
        Prefix: prefix
    }, function (err, data) {
        if (err) {
            log('ERROR: ' + err, true);
        } else {
            data.Contents.forEach(function (obj) {
                // вырезаем имя файла, чтобы использовать его в качестве id для дальнейшей работы
                var reg = new RegExp('facebook-'+App.getUserData().id+'\/app\/([A-z0-9]+)\.txt','g');
                var match = reg.exec(obj.Key);
                if (match && match[1]) {
                    var id = match[1];
                    // создаем пока практически пустой объект-шаблон
                    // позже он будет дописан более подробной информацией из loadTemplatesInfo
                    thisCollection.templates.push(new Template({
                        // key example facebook-902609146442342/app/abc123.txt
                        url: obj.Key,
                        id: id,
                        lastModified: obj.LastModified
                    }));
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
                    xhr.open('GET',this.data.templateUrl);
                    xhr.send();
                }
            };
            Queue.push(t);
        }
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