/**
 * Created by artyom.grishanov on 08.11.16.
 *
 * @param {string} param.resultId ид результата, обязателен для установки в промо приложение mutapp
 * @param {string} param.imgUrl ссылка на картинку которая будет опказана в леере
 * @param {string} [param.resultLabel] метка результата для показа пользоватлю (например 2/3), чтобы они видел лишний раз для какого результата он меняет картинку
 * @param {string} [recommendedSize] рекомендованный размер картинки, чтобы показать пользователю
 */
function PreviewShareImageModal(param) {
    param = param || {};
    param.name = 'previewShareImageModal';
    this.resultId = param.resultId;
    this.imgUrl = param.imgUrl;
    this.resultLabel = param.resultLabel || '';
    this.recommendedSize = param.recommendedSize || config.products.common.defaultShareImageRecommendedSize;

    this.showResourceDialog = function() {
        Editor.getResourceManager().show(this.onImageSelected.bind(this), {
            // хотим показать чуть выше чем это окно с превью
            zIndex: config.modals.previewShareImageModal.defZIndex+1
        });
    };

    this.onImageSelected = function(url) {
        this.setImage(url);
    };

    this.setImage = function(value) {
        this.imgUrl = value;
        this.$ui.find('.js-image').css('background-image', 'url('+this.imgUrl+')');
    }

    AbstractModal.call(this, param);
}

PreviewShareImageModal.prototype = Object.create(AbstractModal.prototype);
PreviewShareImageModal.prototype.constructor = LoginModal;
PreviewShareImageModal.prototype.render = function() {
    this.setImage(this.imgUrl);
    if (this.resultLabel) {
        this.$ui.find('.js-result_label').text(this.resultLabel);
    }
    this.$ui.find('.js-img_size').text(this.recommendedSize);
    this.$ui.find('.js-load').click((function() {
        this.showResourceDialog();
    }).bind(this));
    this.$ui.find('.js-close').show().click((function() {
        Modal.hidePreviewShareImage();
    }).bind(this));
}