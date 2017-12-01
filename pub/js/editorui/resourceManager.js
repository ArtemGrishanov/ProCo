/**
 * Created by artyom.grishanov on 29.03.16.
 *
 * Окно-диалог, в котором можно загружать изображения и другие ресурсы для проекта
 * Ресурсы аплоадятся в aws bucket для текущего авторизованного пользователя
 * Первым в списке показывается кнопка загрузки
 *
 * @param params
 * @param {string} params.uid - ид пользователя, чьими ресурсами будем управлять
 * @param {string} params.caption - заголовок леера
 * @param {Array.<object>} params.options - {icon, label, id} список вариантов для выбора.
 * @param {function} params.callback - вызывается, когда выбор сделан. Передается либо id выбранного итема, либо null если пользователь просто закрыл диалог
 */
function ResourceManager(params) {
    // объект showDialog.js который просто управляет показом и выбором элементов
    this.dialog = null;
    // кнопка для загрузки файлов
    this.fileChooseOption = null;
    // последняя актуальная метаинформация о списке ресурсов из aws bucket
    this.resourcesList = null;
    // колбек который будет вызван после выбора ресурса, передается в show
    this.selectCallback = null;
    // z-index который получит это окно
    this.zIndex = null;

    /**
     * Загрузить список ресурсов пользователя в this.resourcesList
     * @param {function} callback когда список ресурсов загужен будет вызвана
     */
    this.loadResources = function(callback) {
        if (App.getAWSBucket() !== null) {
            // все кастомне ресы находятся в каталоге /res в пользовательском каталоге
            var prefix = Auth.getUser().id + '/res';
            s3util.requestStorage('listObjects',{Prefix: prefix}, (function (err, data) {
                if (err) {
                    log('ResourceManager: ' + err, true);
                } else {
                    data.Contents.forEach((function (obj) {
                        this.resourcesList = this.resourcesList || [];
                        // показываем только превьюшки в интерфейсе
                        if (obj.Key.indexOf('res/'+config.editor.resourceManager.thumbPrefix) >= 0) {
                            // по имени файла определили, что файл это превьюшка
                            //TODO Файл с точками в имени тоже бывают и они не отображаются
                            var id = obj.Key.replace(Auth.getUser().id+'\/res\/','');
                            var time = new Date(obj.LastModified);
                            var newItem = {
                                // key example 0235e985-8b92-4666-83fa-25fd85ee1072/res/abc123.jpg
                                key: obj.Key,
                                id: id,
                                lastModified: obj.LastModified,
                                time: time
                            };
                            for (var i = 0; i < this.resourcesList.length; i++) {
                                if (time > this.resourcesList[i].time) {
                                    this.resourcesList.splice(i,-1,newItem);
                                    newItem = null;
                                    break;
                                }
                            }
                            if (newItem) {
                                this.resourcesList.push(newItem);
                            }
                        }
                    }).bind(this));
                }
                callback();
            }).bind(this));
        }
        else {
            Modal.showSignin();
        }
    };

    this.getUserResourceBaseUrl = function() {
        return config.common.awsHostName+config.common.awsBucketName + '/';
    };

    /**
     * Аплоад файла на сервер
     * Окно будет автоматически перерисовано с обновленным списком ресурсов
     *
     * @param {File} file
     * @param {Canvas} thumbCanvas
     */
    this.uploadResource = function(file, thumbCanvas) {
        if (App.getAWSBucket() !== null) {
            // var file = this.fileChooseOption.find('input[type=\'file\']')[0].files[0];
            //if (file) {
                // очищаем диалог от элементов на время аплоада, потом будет заново загрузка всех элементов
                this.dialog.setOptions(null);
                var objKey = Auth.getUser().id + '/res/' + file.name;
                var objKeyThumb = Auth.getUser().id + '/res/' + config.editor.resourceManager.thumbPrefix + file.name;
                var params = {
                    Key: objKey,
                    ContentType: file.type,
                    Body: file,
                    ACL: 'public-read'
                };
                s3util.requestStorage('putObject', params, (function (err, data) {
                    if (err) {
                        log('ResourceManager: ' + err, true);
                        Modal.showMessage({text: App.getText('upload_res_error')});
                    }
                    else {
                        //TODO почему расширение файла thumbCanvas получается такое же как у оригинального, например png ? А не всегда jpg
                        s3util.uploadCanvas(App.getAWSBucket(), (function() {
                            // запросить заново и перестроить диалог
                            this.resourcesList = null;
                            this.show(this.selectCallback, {zIndex:this.zIndex});
                        }).bind(this), objKeyThumb, thumbCanvas);
                    }
                }).bind(this), config.storage.putNewResourceMaxDelay);
            //}
        }
        else {
            Modal.showSignin();
        }
    };

    /**
     * Показать диалог с выбором ресурсов
     * Предварительно нужно загрузить ресурсы loadResources
     *
     * @param {function} clb - функция которая будет вызвана при выборе ресурса. Передастся url обратно
     * @param {number} [param.zIndex] - z-индекс с которым показать диалог. Нужно при одновременном показе с модальными окнами.
     * Вообще, если сделать все на modal то этого скорее всего будет не нужно
     */
    this.show = function(clb, param) {
        //todo сбросить все фильтра и рамочки перед показом
//        ControlManager.filter({propertyStrings: null});
//        workspace.selectElementOnAppScreen(null);
//        Editor.hideWorkspaceHints();

        this.selectCallback = clb;
        // сейчас инитим каждый раз, так как диалог удаляется из DOM и все обработчики слетают
        // ничего более умного не сделал пока
        this.initDialog();
        if (param && param.zIndex) {
            this.zIndex = param.zIndex;
            this.dialog.view.css('zIndex', this.zIndex);
        }
        else {
            this.zIndex = this.dialog.view.css('zIndex');
        }
        $('#id-dialogs_view').empty().append(this.dialog.view).show();
        if (Auth.getUser() !== null) {
            if (this.resourcesList === null) {
                this.loadResources((function() {
                    this.setDialogOptions();
                }).bind(this));
            }
            else {
                this.setDialogOptions();
            }
        }
        else {
            Modal.showSignin();
        }
    };

    /**
     * Создает вью для менеджера ресурсов
     */
    this.initDialog = function() {
        // инициализация
        var params = {
            showLoader: true,
            caption: App.getText('choose_res'),
            // пока не указываем ресурсы, они будут подгружены позднее
            options: null,
            callback: (function(selectedOptionId) {
                if (selectedOptionId) {
                    if (this.selectCallback) {
                        // пока возвращается просто url выбранной картинки, возможно надо будет доделывать на object
                        this.selectCallback(this.getUserResourceBaseUrl()+selectedOptionId);
                    }
                }
            }).bind(this)
        };
        this.dialog = new SelectDialog(params);
    };

    /**
     * Колбек на выбор файла с диска
     *
     * @param evt
     */
    this.onLocalFileSelected = function(evt) {
        var files = FileAPI.getFiles(evt);
        FileAPI.filterFiles(files, function (file, info/**Object*/) {
//            if( /^image/.test(file.type) ) {
//                return true;
//            }
//            return false;
            // однако некоторые файлы не имеют mime типа, то есть file.type === '', решил игнорировать эту провверку
            return true;

        }, (function (files/**Array*/, rejected/**Array*/){
            if (rejected.length > 0) {
                Modal.showMessage({text: App.getText('that_is_not_image')});
            }
            else if (files.length){
                FileAPI.Image(files[0]).preview(config.editor.resourceManager.thumbWidth, config.editor.resourceManager.thumbHeight).get((function(err, cnv) {
                    if (!err) {
                        // начать аплоад превью cnv
                        // и файла files[0]
                        this.uploadResource(files[0], cnv);
                    }
                    else {
                        Modal.showMessage({text: App.getText('select_img_error')});
                    }
                    $('#id-resource_manager_file_upload').val('');
                }).bind(this));
            }
            $('#id-resource_manager_file_upload').val('');
        }).bind(this));
    };

    /**
     * Устанавливает уже подготовленный this.resourcesList внутрь вью (this.dialog)
     */
    this.setDialogOptions = function() {
        var selectOptions = [];
        // добавить fileChooseOption отдельно первой кнопкой
        // то есть вью собираем сами, а не диалог делает стандартную кнопочку
        if (this.fileChooseOption === null) {
            // создаем один раз далее переиспользуем эту кнопку
            this.fileChooseOption = $($('#id-fileChooser_option_template').html());
        }
        selectOptions.push({
            id: 'fileChooseOption',
            label: 'Загрузить',
            // icon: resourcesList[i].src,
            // element приоритнее чем icon внутри selectDialog
            htmlElement: this.fileChooseOption,
            selectable: false
        });
        if (this.resourcesList) {
            for (var i = 0; i < this.resourcesList.length; i++) {
                selectOptions.push({
                    id: encodeURIComponent(this.resourcesList[i].key.replace(config.editor.resourceManager.thumbPrefix, '')), // убираем префикс, получает имя большого, оригинального файла
                    label: this.resourcesList[i].id.replace(config.editor.resourceManager.thumbPrefix, ''), // убираем из видимого пользователю имени префикс '__thumb'
                    icon: this.getUserResourceBaseUrl()+this.resourcesList[i].key,
                });
            }
        }
        this.dialog.setOptions(selectOptions);
        //        this.fileChooseOption.find('input[type=\'file\']').change((function() {
        //            // сразу без превью - аплоад
        //            this.uploadResource()
        //        }).bind(this));

        // инициализация обработчика выбора файла с диска
        FileAPI.event.on(document.getElementById('id-resource_manager_file_upload'), 'change', this.onLocalFileSelected.bind(this));
    };
}
