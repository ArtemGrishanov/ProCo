/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого редактирования текста "внутри" приложения.
 */
function TextQuickInput(appProperty) {
    this.appProperty = appProperty;
    this.textInput = document.createElement('textInput');
    if (this.appProperty.descriptor.domElemSelector) {
        // контрол будет жестко связан с dom элементом для редактирования
        // по клику на этот элемент будет начато редактирование (то есть не в панели)
        this.domElem = $(appIframe.contentDocument).find(this.appProperty.descriptor.domElemSelector).attr('data-app-property', this.appProperty.propertyString);
        this.domElem.click(onClick);
    }

    function onClick() {
        // подменить элемент из промоприложения на контрол для редактирования
    }
}

function TextQuickInputController($scope) {
    $scope.text = 'sdjhhjhf wfjwb  nkj';
}