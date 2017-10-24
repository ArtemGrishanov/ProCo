/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого выбора картинки "внутри" приложения.
 * При дабл-клике на картинку этот компонент запускает менеджер ресурсов для выбора картинки
 * дожидается выбора и устанавливает appProperty
 */
function ChooseImageQuick(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.onProductElementDoubleClick = function() {
        if (App.getAWSBucket() !== null) {
            Editor.selectElementOnAppScreen();
            Editor.hideWorkspaceHints();
            $('#id-control_cnt').empty();
            Editor.getResourceManager().show(this.onImageSelected.bind(this));
        }
        else {
            Modal.showSignin();
        }
    };

    this.onImageSelected = function(url) {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, url);
    };

    this.onPropertyChanged = function() {
        //тот кто стал инициатором изменения не должен сам обрабатывать событие
//        var p = Engine.getAppProperty(this.propertyString);
//        if (this.$productDomElement && this.$productDomElement.text() !== p.propertyValue) {
//            this.$productDomElement.text(p.propertyValue);
//        }
    };

    if (this.$productDomElement) {
        this.$productDomElement.on('dblclick', this.onProductElementDoubleClick.bind(this));
    }
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));
}
ChooseImageQuick.prototype = AbstractControl;
