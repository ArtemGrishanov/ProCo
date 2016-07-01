/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого выбора картинки "внутри" приложения.
 * При дабл-клике на картинку этот компонент запускает менеджер ресурсов для выбора картинки
 * дожидается выбора и устанавливает appProperty
 */
function ChooseImageQuick(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.onProductElementDpubleClick = function() {
        // resourceManager - объявлен в editor.js (singleton)
        deleteSelections();
        hideWorkspaceHints();
        $('#id-control_cnt').empty();
        resourceManager.show(this.onImageSelected.bind(this));
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
        this.$productDomElement.on('dblclick', this.onProductElementDpubleClick.bind(this));
    }
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));
}
ChooseImageQuick.prototype = AbstractControl;

function ChooseImageQuickController(scope, attrs) {
}