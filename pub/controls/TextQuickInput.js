/**
 * Created by artyom.grishanov on 12.01.16.
 *
 * Контрол для быстрого редактирования текста "внутри" приложения.
 */
function TextQuickInput(param) {
    this.init(param);

    // окно и документ айфрейма для работы с вводом
    // так как contenteditable поле ввода находится в айфрейме id-product_screens_cnt
    if (!this.additionalParam.appIframe) {
        throw new Error('TextQuickInput: iframe must be set in additional param');
    }
    this.screenWindow = this.additionalParam.appIframe.contentWindow;
    this.screenDocument = this.additionalParam.appIframe.contentDocument;

    this.onProductElementInput = function() {
        //Editor.updateSelection();
        this.valueChangedCallback(this);
    };
}

_.extend(TextQuickInput.prototype, AbstractControl);

TextQuickInput.prototype.setProductDomElement = function(elem) {
    if (this.$productDomElement) {
        this.$productDomElement.off();
        this.$productDomElement = null;
    }
    if (elem) {
        this.$productDomElement = $(elem);
        this.$productDomElement.attr('contenteditable','true');
        this.$productDomElement.css('outline','none');
        this.$productDomElement.on('input', this.onProductElementInput.bind(this));
        this.$productDomElement.on('keypress', this.onKeyPress.bind(this));
    }
};

TextQuickInput.prototype.getValue = function() {
    if (this.$productDomElement) {
        return this.$productDomElement.html();
    }
    return '';
};

TextQuickInput.prototype.setValue = function(value) {
    if (typeof value === 'string' || value === null || value === undefined) {
        if (value === undefined || value === null) {
            value = '';
        }
        if (this.$productDomElement && this.$productDomElement.html() !== value) {
            this.$productDomElement.html(value);
        }
    }
    else {
        throw new Error('TextQuickInput.setValue: unsupported value type');
    }
};

TextQuickInput.prototype.destroy = function() {
    if (this.$productDomElement) {
        this.$productDomElement.off();
    }
    this.$directive.remove();
};

/**
 * Отдельная обработка переносов строк с подстановкой <br> при вводе новой строки
 *
 * @param e
 * @returns {boolean}
 */
TextQuickInput.prototype.onKeyPress = function(e) {
    // Dealing with line Breaks on contentEditable DIV
    // http://stackoverflow.com/questions/6023307/dealing-with-line-breaks-on-contenteditable-div
    if (e.keyCode === 13) { //enter && shift
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
            //Editor.updateSelection();
            this.valueChangedCallback();

            return false;
        }
    }
};

TextQuickInput.prototype.onPaste = function() {
    this.onProductElementInput();
};

TextQuickInput.prototype.onProductElementInput = function() {
    this.valueChangedCallback();
};