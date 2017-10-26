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
                        //TODO Файл с точками в имени тоже бывают и они не отображаются
                        var id = obj.Key.replace(Auth.getUser().id+'\/res\/','');
                        //var reg = new RegExp('(Auth.getUser().id+'\/res\/)([^\.]+\.[A-z]+)','g');
                        //var match = reg.exec(obj.Key);
                        this.resourcesList = this.resourcesList || [];
                        var time = new Date(obj.LastModified);
                        var newItem = {
                            // key example 0235e985-8b92-4666-83fa-25fd85ee1072/app/abc123.txt
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
     */
    this.uploadResource = function() {
        if (App.getAWSBucket() !== null) {
            var file = this.fileChooseOption.find('input[type=\'file\']')[0].files[0];
            if (file) {
                // очищаем диалог от элементов на время аплоада, потом будет заново загрузка всех элементов
                this.dialog.setOptions(null);
                var objKey = Auth.getUser().id + '/res/' + file.name;
                var params = {
                    Key: objKey,
                    ContentType: file.type,
                    Body: file,
                    ACL: 'public-read'
                };
                s3util.requestStorage('putObject', params, (function (err, data) {
                    if (err) {
                        log('ResourceManager: ' + err, true);
                        Modal.showMessage({text:'Не удалось загрузить ресурс. Попробуйте еще раз.'});
                    }
                    // запросить заново и перестроить диалог
                    this.resourcesList = null;
                    this.show(this.selectCallback, {zIndex:this.zIndex});
                }).bind(this), config.storage.putNewResourceMaxDelay);
            }
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
                    id: encodeURIComponent(this.resourcesList[i].key),
                    label: this.resourcesList[i].id,
                    icon: this.getUserResourceBaseUrl()+this.resourcesList[i].key,
                });
            }
        }
        this.dialog.setOptions(selectOptions);
        this.fileChooseOption.find('input[type=\'file\']').change((function() {
            // сразу без превью - аплоад
            this.uploadResource()
        }).bind(this));
    };
}
