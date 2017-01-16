/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого редактирования текста "внутри" приложения.
 *
 * Кейсы, кооторые необходимо учесть:
 * - элемент является частью лейаута приложение и может иметь разные display и position то него зависят другие элементы
 * - не этот же элемент могут быть навешаны другие контролы, Drag
 * -
 */
function TextQuickInput(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.initEditableField();
    // окно и документ айфрейма для работы с вводом
    // так как contenteditable поле ввода находится в айфрейме id-product_screens_cnt
    this.screenWindow = params.iFrame.contentWindow;
    this.screenDocument = params.iFrame.contentDocument;
    this.editable = false;

    this.setValueFromInput = function() {
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, this.$productDomElement.html());
    };

//    this.onProductElementInput = function() {
//        if (this.editable === true) {
//            this.setValueFromInput();
//        }
//    };

    /**
     * Отдельная обработка переносов строк с подстановкой <br> при вводе новой строки
     *
     * @param e
     * @returns {boolean}
     */
    this.onKeyPress = function(e) {
        if (this.editable === true) {
            // Dealing with line Breaks on contentEditable DIV
            // http://stackoverflow.com/questions/6023307/dealing-with-line-breaks-on-contenteditable-div
            if (e.keyCode==13) { //enter && shift
                e.preventDefault(); //Prevent default browser behavior
                if (this.screenWindow.getSelection) {
                    var selection = this.screenWindow.getSelection(),
                        range = selection.getRangeAt(0),
                        br = this.screenDocument.createElement("br"),
                        textNode = this.screenDocument.createTextNode("\u00a0"); //Passing " " directly will not end up being shown correctly
                    range.deleteContents(); //required or not?
                    range.insertNode(br);
                    range.collapse(false);
                    range.insertNode(textNode);
                    range.selectNodeContents(textNode);

                    selection.removeAllRanges();
                    selection.addRange(range);

                    // также надо сделать обновление свойства. Так как в "input" событие не попадем
                    this.setValueFromInput();

                    return false;
                }
            }
        }
    };

    this.onPropertyChanged = function() {
        //TODO тот кто стал инициатором изменения не должен сам обрабатывать событие
        var p = Engine.getAppProperty(this.propertyString);
        if (this.$productDomElement && this.$productDomElement.html() !== p.propertyValue) {
            this.$productDomElement.html(p.propertyValue);
        }
    };

    this.onProductDOMElementClick = function(e) {
        this.setEditable(!this.editable);
    };

    this.$productDomElement.click(this.onProductDOMElementClick.bind(this));
//    this.$productDomElement.css('outline','none');
//    this.$productDomElement.on('input', this.onProductElementInput.bind(this));
    this.$productDomElement.on('keypress', this.onKeyPress.bind(this));
    Engine.on('AppPropertyValueChanged', this.propertyString, this.onPropertyChanged.bind(this));
}

TextQuickInput.prototype = AbstractControl;

/**
 * Способ установить значение в контрол извне, с помощью автогенератора
 * @param value
 */
TextQuickInput.prototype.setControlValue = function(value) {
    if (this.$productDomElement && this.$productDomElement.html() !== value) {
        this.$productDomElement.html(value);
    }
    var p = Engine.getAppProperty(this.propertyString);
    Engine.setValue(p, value);
};

TextQuickInput.prototype.onProductElementInput = function(value) {
    if (this.editable === true) {
        console.log('onProductElementInput');
        //this.setValueFromInput();
    }
};

TextQuickInput.prototype.setEditable = function(value) {
    if (this.$productDomElement) {
        this.editable = value;
        if (this.editable === true) {
            this.$productDomElement.hide();
            this._editableField
                .html(this.$productDomElement.html())
                .show();
        }
        else {
            this._editableField.hide();
            this.$productDomElement.show();
        }

    }
};

/**
 * Если необходимо будет создано поле для редактирования (contenteditable=true) которое будет подставляться для ввода
 * вместо самого productDOMElement
 */
TextQuickInput.prototype.initEditableField = function() {
    if (!TextQuickInput.prototype._editableField) {
        TextQuickInput.prototype._editableField = $('<div></div>');
        TextQuickInput.prototype._editableField.attr('contenteditable','true');
        TextQuickInput.prototype._editableField.css('outline','none').css('backgroundColor','yellow');
        TextQuickInput.prototype._editableField.on('input', TextQuickInput.prototype.onProductElementInput.bind(this));
        $('#id-control_cnt').append(TextQuickInput.prototype._editableField);
        $(document).click(function(){
            //туду только один раз инитить

            //сбрасывать setEditable
        });
    }
};