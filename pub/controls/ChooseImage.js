/**
 * Created by artyom.grishanov on 02.09.16.
 *
 * Выбор картинки.
 * Кнопка сбоку на панели контролов, которая открывает окно resourceManager
 */
function ChooseImage(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.loadDirective(function(response, status, xhr){
        this.$directive.click(this.onDirectiveClick.bind(this));
    });

    this.onDirectiveClick = function() {
        if (App.getAWSBucket() !== null) {
            Editor.deleteSelections();
            Editor.hideWorkspaceHints();
            $('#id-control_cnt').empty();
            Editor.getResourceManager().show(this.onImageSelected.bind(this));
        }
        else {
            Modal.showLogin();
        }
    };

    this.onImageSelected = function(url) {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, url);
    };
}
ChooseImage.prototype = AbstractControl;