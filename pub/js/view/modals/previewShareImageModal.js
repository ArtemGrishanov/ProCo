/**
 * Created by artyom.grishanov on 08.11.16.
 *
 * @param {string} param.entityId
 * @param {string|canvas} param.image ссылка на картинку которая будет показана в леере
 * @param {function} callback
 * @param {string} [param.resultLabel] метка результата для показа пользоватлю (например 2/3), чтобы они видел лишний раз для какого результата он меняет картинку
 * @param {string} [recommendedSize] рекомендованный размер картинки, чтобы показать пользователю
 */
function PreviewShareImageModal(param) {
    param = param || {};
    param.name = 'previewShareImageModal';
    // свойство одной из картинок для публикации
    this.entityId = param.entityId;
    this.callback = param.callback;
    // если этому лееру передают уже кастомный урл, то будем показывать картинку
    // если нет, то не важно: леер сам сгенерирует картинку
    this.customUserUrl = (shareImageService.isCustomUrl(param.image) === true) ? param.image: null;
    this.resultLabel = param.resultLabel || null;
    if (!this.resultLabel) {
        var app = Engine.getApp();
        for (var i = 0; i < app._shareEntities.length; i++) {
            if (this.entityId === app._shareEntities[i].id) {
                this.resultLabel = (i+1)+'/'+app._shareEntities.length;
                break;
            }
        }
    }
    this.recommendedSize = param.recommendedSize || config.products.common.defaultShareImageRecommendedSize;

    /**
     * Показать диалог выбора ресурсов с колбеком
     */
    this.showResourceDialog = function() {
        Editor.getResourceManager().show(this.onImageSelected.bind(this), {
            // хотим показать чуть выше чем это окно с превью
            zIndex: config.modals.previewShareImageModal.defZIndex+1
        });
    };

    /**
     * Выбрана какая-то картинка из ресурсов, устанавливаем её
     * @param {string} customUserUrl
     */
    this.onImageSelected = function(customUserUrl) {
        this.setAndRenderImage(customUserUrl);
        // далее пробросить в контрол ChooseImage, так как только контролы должны устанавливать свойства выбранные пользователем
        this.callback(customUserUrl);
    };

    /**
     *
     * @param {string} [customUserUrl]
     */
    this.setAndRenderImage = function(customUserUrl) {
        if (customUserUrl) {
            this.customUserUrl = customUserUrl;
            this.$ui.find('.js-image').css('background-image', 'url('+this.customUserUrl+')');
            this.$ui.find('.js-set_autogenerate').show();
        }
        else {
            //TODO оптимизация: можно не генерить каждый раз, а только запрашивать при каких-то условиях
            //TODO в маленьком контроле превью на правой панели надо будет повторять эту логику?
            // надо запросить создание канваса, картинка в режиме автогенерации
            this.$ui.find('.js-set_autogenerate').hide();
            shareImageService.requestCanvases((function() {
                var info = shareImageService.findImageInfo(this.entityId);
                this.$ui.find('.js-image').css('background-image', 'url('+info.canvas.toDataURL()+')');
            }).bind(this));
        }
    }

    AbstractModal.call(this, param);
}

PreviewShareImageModal.prototype = Object.create(AbstractModal.prototype);
PreviewShareImageModal.prototype.constructor = LoginModal;
PreviewShareImageModal.prototype.render = function() {
    this.setAndRenderImage(this.customUserUrl);
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
    this.$ui.find('.js-set_autogenerate').click((function() {
        this.setAndRenderImage(null);
        this.callback(null);
    }).bind(this));
}