/**
 * Created by artyom.grishanov on 24.01.16.
 */
function Slide(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    // в это body будет вставляться превью слайда
    this.$previewDocumentBody = null;
    this.$previewIFrame = null
    this.previewScale = undefined;
    /**
     * Установка свойства propertyString
     * Это сделано только в контроле Slide для быстродействия, так как там очень заметен негативный эффект
     * @param propertyString
     */
    this.setPropertyString = function(propertyString) {
        if (this.propertyString !== propertyString) {
            this.propertyString = propertyString;
            this.$directive.attr('data-app-property',this.propertyString);
            if (config.common.generateSlidePreviews === true) {
                this.updatePreview();
            }
        }
    };

    this.updatePreview = function() {
        try {
            if (this.$previewDocumentBody) {
                var view = (Array.isArray(this.propertyString)) ?
                    Engine.getAppScreen(this.propertyString[0]).view :
                    Engine.getAppScreen(this.propertyString).view;
                if (this.previewScale === undefined) {
                    this.previewScale = this.$previewIFrame.width() / Editor.getAppContainerSize().width;
                }
                var clonedView = $(view).clone()
                    .css('width',Editor.getAppContainerSize().width+'px')
                    .css('height',Editor.getAppContainerSize().height+'px')
                    .css('transform','scale('+this.previewScale+')')
                    .css('transform-origin','top left');
                this.$previewDocumentBody.empty().append(clonedView);
                Engine.writeCssRulesTo(this.$previewDocumentBody);
            }
        }
        catch(e) {
            log('Can not create preview on screen \''+this.propertyString+'\' Details: ' + e.message, true);
        }
    };

    /**
     * Событие на загрузку айфрейма, тут мы сможем его подготовить для создания превью слайда
     */
    this.onPreviewIFrameLoaded = function() {
        var $previewDocument = this.$previewIFrame.contents();
        // TODO стили промопроекта как сюда попадут?
        var productType = Engine.getApp().type;
        var productConfig = config.products[productType];
        if (productConfig) {
            var $h = $previewDocument.find('head');
            $h.append(config.products.common.styles);
            $h.append(productConfig.stylesForEmbed);
        }
        else {
            log('Slide.onPreviewIFrameLoaded: Unknown product type', true);
        }
        this.$previewDocumentBody = $previewDocument.find('body').css('margin',0).css('overflow','hidden');
        // создание первого превью
        if (config.common.generateSlidePreviews === true) {
            this.updatePreview();
        }
    };

    /**
     *
     * @param {string} screenId ид экрана который обновился
     */
    this.onScreenUpdate = function(screenId) {
        //перерисовывать только когда экран реально виден пользователю, только активный экран
        //Editor.getActiveScreens() - текущие показанные экраны

        // Схлопнутые экраны.
        // например, this.propertyString = [result1, resul2, result3]
        // приходит из события screenId = result2
        // TODO но в таком случае как сделать обновление единожды? А не в каждом событии
//        var p = (Array.isArray(this.propertyString))?this.propertyString.join(','):this.propertyString;
        if ((typeof this.propertyString==='string' && screenId===this.propertyString) ||
            (Array.isArray(this.propertyString) && this.propertyString.indexOf(screenId)>=0)) {
            // это этот экран
            if (Editor.getActiveScreens().join(',') == this.propertyString) {
                var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
                Editor.showScreen(arr);
            }
            if (config.common.generateSlidePreviews === true) {
                this.updatePreview();
            }
        }
    };
    // помним, что контрол может отвечать сразу за несколько экранов
    // подписка на обновления экрана в движке, контрол будет запрашивать у редактора перерисовку
    var arr = (Array.isArray(this.propertyString))?this.propertyString:[this.propertyString];
    for (var i = 0; i < arr.length; i++) {
        Engine.on('ScreenUpdated', null/*arr[i]*/, this.onScreenUpdate.bind(this));
    }

    // подготовка компонента к работе с превью
    this.$previewIFrame = $(this.$directive.find('.js-preview_iframe'));
    this.$previewIFrame.load(this.onPreviewIFrameLoaded.bind(this));
    this.$directive.mousedown((function() {
        var p = (Array.isArray(this.propertyString))?this.propertyString.join(','):this.propertyString;
        if (Editor.getActiveScreens().join(',') !== p) {
            Editor.showScreen(Array.isArray(this.propertyString)?this.propertyString:this.propertyString.split(','));
        }
    }).bind(this));

}
Slide.prototype = AbstractControl;