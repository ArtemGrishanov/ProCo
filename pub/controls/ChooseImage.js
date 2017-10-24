/**
 * Created by artyom.grishanov on 02.09.16.
 *
 * Выбор картинки.
 * Кнопка сбоку на панели контролов, которая открывает окно resourceManager
 */
function ChooseImage(param) {
    this.init(param);
    this.imageUrl = '';
    this.usePreviewShareImageModal = param.usePreviewShareImageModal || false;

//    todo makePreview on show
//    this._onShow = function() {
//        this.makePreview();
//    };

    this.$directive.click(this.onDirectiveClick.bind(this));

    /**
     * Колбек в работе леера previewShareImageModal
     *
     * @param {string} url - url (custom url) || null (if autogenerated)
     */
    this.showPreviewShareImageCallback = function(url) {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, url);
        this.makePreview();
    };

    /**
     * Получить ид публикации на основании propertyString картинки для этой публикации
     * Нужно, так как леер для превью и выбора картинок публикации работает с entityId, а контролы с propertyString
     *
     * @param {string} ps, example: 'appConstructor=mutapp _shareEntities.0.imgUrl'
     *
     * @return {string}
     */
    this.getEntityId = function(ps) {
        var app = Engine.getApp();
        for (var i = 0; i < app._shareEntities.length; i++) {
            if (ps === config.common.shareImagesAppPropertyString.replace('{{number}}',i)) {
                return app._shareEntities[i].id;
            }
        }
        return null;
    }

    this.onImageSelected = function(url) {
        this.imageUrl = url;
        this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
        this.makePreview();
    };

    /**
     * Установить мини-превью картинки прямо в контроле
     * В том случае если используется вью "chooseimagepreview"
     */
    this.makePreview = function() {
//        if (this.directiveName === 'chooseimagepreview' && this.$directive) {
//            var url = Engine.getAppProperty(this.propertyString).propertyValue;
//            if (url) {
//                this.$directive.find('.js-img').css('background-image','url('+url+')');
//            }
//            else {
//                if (this.usePreviewShareImageModal === true) {
//                    var entityId = this.getEntityId(this.propertyString);
//                    var info = shareImageService.findImageInfo(entityId);
//                    if (info.canvas) {
//                        this.$directive.find('.js-img').css('background-image', 'url('+info.canvas.toDataURL()+')');
//                    }
//                    else {
//                        shareImageService.requestCanvases((function() {
//                            info = shareImageService.findImageInfo(entityId);
//                            this.$directive.find('.js-img').css('background-image', 'url('+info.canvas.toDataURL()+')');
//                        }).bind(this));
//                    }
//                }
//            }
//        }
    }
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
        // этот контрол выбора картинки может работать в режиме выбора картинки для публикации
        // в этом случае используется доп леер для предпросмотра картинки
        if (this.usePreviewShareImageModal === true) {
            Modal.showPreviewShareImage({
                entityId: this.getEntityId(this.propertyString),
                image: Engine.getAppProperty(this.propertyString).propertyValue,
                callback: this.showPreviewShareImageCallback.bind(this),
                resultLabel: ''
            });
        }
        else {
            Editor.getResourceManager().show(this.onImageSelected.bind(this));
        }
    }
    else {
        Modal.showSignin();
    }
};