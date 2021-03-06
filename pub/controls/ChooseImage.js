/**
 * Created by artyom.grishanov on 02.09.16.
 *
 * Выбор картинки.
 * Кнопка сбоку на панели контролов, которая открывает окно ResourceManager
 *
 */
function ChooseImage(param) {
    this.init(param);
    this.imageUrl = '';

    this.selectClickHandler = this.onSelectClick.bind(this);
    this.$select = this.$directive.find('.js-select');
    this.$select.click(this.selectClickHandler);

    this.deleteClickHandler = this.onDeleteClick.bind(this);
    this.$delete = this.$directive.find('.js-delete');
    this.$delete.click(this.deleteClickHandler);

    if (typeof this.additionalParam.deleteEnable !== 'boolean') {
        // по умолчанию иконка удаления доступна
        this.additionalParam.deleteEnable = true;
    }
    this._updateDeleteIconVisibility();
}
_.extend(ChooseImage.prototype, AbstractControl);

ChooseImage.prototype.getValue = function() {
    return this.imageUrl;
};

ChooseImage.prototype.setValue = function(value) {
    this.imageUrl = value;
    this._updateDeleteIconVisibility();
};

ChooseImage.prototype.destroy = function() {
    this.$select.off('click', this.selectClickHandler);
    this.$delete.off('click', this.deleteClickHandler);
    this.$directive.remove();
};

/**
 * Показать иконку удаления
 */
ChooseImage.prototype._showDeleteIcon = function() {
    this.$select.addClass('__with_extra_icon');
    this.$delete.show();
};

/**
 * Скрыть иконку удаления
 */
ChooseImage.prototype._hideDeleteIcon = function() {
    this.$select.removeClass('__with_extra_icon');
    this.$delete.hide();
};

/**
 *
 * @private
 */
ChooseImage.prototype._updateDeleteIconVisibility = function() {
    if (!!this.imageUrl === false) {
        // если картинки нет, то удалять нечего, иконку надо скрыть
        this._hideDeleteIcon();
    }
    else if (this.additionalParam.deleteEnable === true) {
        this._showDeleteIcon();
    }
};

/**
 * Колбек передается в ResourceManager. Сюда будет передан результат
 *
 * @param {string} url
 * @private
 */
ChooseImage.prototype._onImageSelected = function(url) {
    this.imageUrl = url;
    this._updateDeleteIconVisibility();
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};

/**
 * Клик на кнопку "Загрузить" в контроле
 */
ChooseImage.prototype.onSelectClick = function() {
    if (App.getAWSBucket() !== null) {
        Editor.getResourceManager().show(this._onImageSelected.bind(this));
    }
    else {
        Modal.showSignin();
    }
};

/**
 * Клик на иконку "Загрузить" в контроле
 */
ChooseImage.prototype.onDeleteClick = function() {
    if (App.getAWSBucket() !== null) {
        this._onImageSelected(null);
    }
    else {
        Modal.showSignin();
    }
};