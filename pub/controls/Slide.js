/**
 * Created by artyom.grishanov on 24.01.16.
 */
function Slide(param) {
    this.init(param);
    // в этот body будет вставляться превью слайда
    this.$previewDocumentBody = null;
    this.$previewIFrame = null
    this.previewScale = undefined;
    if (!this.additionalParam.appType) {
        // необходимо указать тип проекта например: memoriz, personality и тп
        throw new Error('Slide: this.additionalParam.appType must be specified');
    }
    if (!this.additionalParam.onClickCallback) {
        throw new Error('Slide: this.additionalParam.onClickCallback must be specified');
    }
    param.additionalParam.propertyString = this.propertyString; // нужно для this.setSettings()
    this.setSettings(param.additionalParam);
    // подготовка компонента к работе с превью
    this.$previewIFrame = this.$directive.find('.js-preview_iframe');
    this.$previewIFrame.load(this.onPreviewIFrameLoaded.bind(this));
    this.$directive.mousedown(this.onMouseDown.bind(this));
}
_.extend(Slide.prototype, AbstractControl);

/**
 * Клик на контрол
 */
Slide.prototype.onMouseDown = function() {
    // переключение активного экрана в редакторе начинается здесь - пользователь кликает по контролу Slide
    var p = (Array.isArray(this.propertyString)) ? this.propertyString.join(',') : this.propertyString;
    this.additionalParam.onClickCallback(p);
};

/**
 * Установка свойства propertyString
 * Это сделано потому что контролы Slide переиспользуются в SlideGroupControl
 * и propertyString меняются у инстансов
 *
 * @param {string} param.propertyString
 * @param {string} param.screen
 * @param {string} param.cssString
 */
Slide.prototype.setSettings = function(param) {
    param = param || {};
    if (!param.screen) {
        throw new Error('Slide: this.additionalParam.screen must be specified for preview generation');
    }
    if (!param.cssString) {
        // строка стилей проекта, полученная из CssMutAppProperty
        throw new Error('Slide: this.additionalParam.cssString must be specified');
    }
    this.propertyString = param.propertyString;
    this.additionalParam.screen = param.screen;
    this.additionalParam.cssString = param.cssString;
    this.$directive.attr('data-app-property',this.propertyString);
    if (config.common.generateSlidePreviews === true) {
        this.updatePreview();
    }
};

/**
 * Событие на загрузку айфрейма, тут мы сможем его подготовить для создания превью слайда
 */
Slide.prototype.onPreviewIFrameLoaded = function() {
    var $previewDocument = this.$previewIFrame.contents();
    var productConfig = config.products[this.additionalParam.appType];
    if (productConfig) {
        var $h = $previewDocument.find('head');
        $h.append(config.products.common.styles);
        $h.append(productConfig.stylesForEmbed);
    }
    else {
        throw new Error('Slide.onPreviewIFrameLoaded: Unknown product type \'' + this.additionalParam.appType + '\'');
    }
    this.$previewDocumentBody = $previewDocument.find('body').css('margin',0).css('overflow','hidden');
    // создание первого превью
    if (config.common.generateSlidePreviews === true) {
        this.updatePreview();
    }
};

/**
 * Обновить превью экрана
 * Это айфрейм в который склонирован MutApp.Screen и применены кастомные стили проекта
 *
 */
Slide.prototype.updatePreview = function() {
    if (config.common.generateSlidePreviews === true) {
        try {
            // проверка - загружен ли айфрейм для превью или нет
            if (this.$previewDocumentBody) {
                var view = this.additionalParam.screen.$el;
                // если экран уже отрендерен - есть какое-то содержимое в нем
                if (view.html()) {
                    var clonedView = $(view).clone();
                    // сделаль элемент видимым, в приложении он мог быть скрыт в текущий момент
                    clonedView.show();
                    var size = {
                        //todo calc size
                        width: 800,//clonedView.width(),
                        height: 600//clonedView.height()
                    };
                    if (this.previewScale === undefined) {
                        this.previewScale = this.$previewIFrame.width() / size.width;
                    }
                    clonedView
                        .css('width', size.width+'px')
                        .css('height', size.height+'px')
                        .css('transform','scale('+this.previewScale+')')
                        .css('transform-origin','top left');
                    this.$previewDocumentBody.empty().append(clonedView);
                    writeCssTo(config.common.previewCustomStylesId, this.additionalParam.cssString, this.$previewDocumentBody); // from util.js
                }
            }
        }
        catch(e) {
            console.error('Slide.updatePreview: Can not create preview on screen \''+this.propertyString+'\' Details: ' + e.message, true);
        }
    }
};