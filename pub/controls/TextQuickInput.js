/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого редактирования текста "внутри" приложения.
 */
function TextQuickInput(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    // окно и документ айфрейма для работы с вводом
    // так как contenteditable поле ввода находится в айфрейме id-product_screens_cnt
    this.screenWindow = params.iFrame.contentWindow;
    this.screenDocument = params.iFrame.contentDocument;

    this.setValueFromInput = function() {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, this.$productDomElement.html());
    };

    this.onProductElementInput = function() {
        Editor.updateSelection();
        this.setValueFromInput();
    };

    /**
     * Отдельная обработка переносов строк с подстановкой <br> при вводе новой строки
     *
     * @param e
     * @returns {boolean}
     */
    this.onKeyPress = function(e) {
        // Dealing with line Breaks on contentEditable DIV
        // http://stackoverflow.com/questions/6023307/dealing-with-line-breaks-on-contenteditable-div

        if (e.keyCode==13) { //enter && shift
            e.preventDefault(); //Prevent default browser behavior
            if (this.screenWindow.getSelection) {
                var selection = this.screenWindow.getSelection(),
                    range = selection.getRangeAt(0),
                    br = this.screenDocument.createElement("br"),
                    textNode = this.screenDocument.createTextNode("\u00a0"); //Passing " " directly will not end up being shown correctly
                range.deleteContents();//required or not?
                range.insertNode(br);
                range.collapse(false);
                range.insertNode(textNode);
                range.selectNodeContents(textNode);

                selection.removeAllRanges();
                selection.addRange(range);

                // также надо сделать обновление свойства. Так как в "input" событие не попадем
                Editor.updateSelection();
                this.setValueFromInput();

                return false;
            }
        }
    };

    this.onPaste = function() {
        this.onProductElementInput();
    };

    this.onPropertyChanged = function() {
        //TODO тот кто стал инициатором изменения не должен сам обрабатывать событие
        var p = Engine.getAppProperty(this.propertyString);
        if (this.$productDomElement && this.$productDomElement.html() !== p.propertyValue) {
            this.$productDomElement.html(p.propertyValue);
        }
    };

    if (this.$productDomElement) {
        this.$productDomElement.attr('contenteditable','true');
        this.$productDomElement.css('outline','none');
        this.$productDomElement.on('input', this.onProductElementInput.bind(this));
        this.$productDomElement.on('keypress', this.onKeyPress.bind(this));
    }
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));

    /**
     * Способ установить значение в контрол извне, с помощью автогенератора
     * @param value
     */
    this.setControlValue = function(value) {
        if (this.$productDomElement && this.$productDomElement.html() !== value) {
            this.$productDomElement.html(value);
        }
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, value);
    };
}

TextQuickInput.prototype = AbstractControl;