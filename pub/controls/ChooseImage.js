/**
 * Created by artyom.grishanov on 02.09.16.
 *
 * Выбор картинки.
 * Кнопка сбоку на панели контролов, которая открывает окно resourceManager
 */
function ChooseImage(param) {
    this.init(param);
    this.imageUrl = '';

    this.$directive.click(this.onDirectiveClick.bind(this));

    this.onImageSelected = function(url) {
        this.imageUrl = url;
        this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
    };
}
_.extend(ChooseImage.prototype, AbstractControl);

ChooseImage.prototype.getValue = function() {
    return this.imageUrl;
};

ChooseImage.prototype.setValue = function(value) {
    this.imageUrl = value;
};

ChooseImage.prototype.destroy = function() {
    this.$directive.remove();
};

ChooseImage.prototype.onDirectiveClick = function() {
    if (App.getAWSBucket() !== null) {
        Editor.getResourceManager().show(this.onImageSelected.bind(this));
    }
    else {
        Modal.showSignin();
    }
};