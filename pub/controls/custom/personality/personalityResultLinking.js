/**
 * Created by artyom.grishanov on 28.09.17.
 */
function PersonalityResultLinking(param) {
    this.init(param);
    this._value = null;
    /**
     * Строка из которой можно моздать опцию
     * @type {string}
     * @private
     */
    this._optionTempl = this.$directive.find('.js-option_template');
    /**
     * Строка из которой можно моздать карточку результата
     * @type {string}
     * @private
     */
    this._resultTempl = this.$directive.find('.js-result_template');
}
_.extend(PersonalityResultLinking.prototype, AbstractControl);

PersonalityResultLinking.prototype.getValue = function() {
    return this._value;
};

PersonalityResultLinking.prototype.setValue = function(value) {
    this._value = value;
    this.render();
};

PersonalityResultLinking.prototype.destroy = function() {
    this.$directive.remove();
};

PersonalityResultLinking.prototype.render = function() {
//    var app = Editor.getEditedApp();
//    var quizArray = app.model.get('quiz').toArray();
//    var resultsArray = app.model.get('results').toArray();
    if (this._value) {
        // создать опции

        // создать резальтаты

        // создать и показать привязки
//        var valueArray = this._value.toArray();

    }
};