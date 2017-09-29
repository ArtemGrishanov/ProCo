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
    this._optionTempl = this.$directive.find('.js-option_template').html();
    /**
     * Строка из которой можно моздать карточку результата
     * @type {string}
     * @private
     */
    this._resultTempl = this.$directive.find('.js-result_template').html();
}
_.extend(PersonalityResultLinking.prototype, AbstractControl);

PersonalityResultLinking.prototype.getValue = function() {
    return this._value;
};

PersonalityResultLinking.prototype.setValue = function(value) {
    this._value = value;
};

PersonalityResultLinking.prototype.destroy = function() {
    this.$directive.remove();
};

PersonalityResultLinking.prototype.onShow = function() {
    this.render();
}

PersonalityResultLinking.prototype.render = function() {
    var app = Editor.getEditedApp();
    // приходится получить доступ к приложению напрямую, непридумал как передать данные
    if (app) {
        var quizArray = app.model.get('quiz').toArray();
        var resultsArray = app.model.get('results').toArray();
        if (this._value) {
            // создать опции
            var $optCnt = this.$directive.find('.js-options').empty();
            for (var i = 0; i < quizArray.length; i++) {
                var optionsArray = quizArray[i].answer.options.toArray();
                for (var j = 0; j < optionsArray.length; j++) {
                    $(this._optionTempl.replace('{{option_name}}',optionsArray[j].text.getValue()))
                        .attr('data-option-id',optionsArray[j].id)
                        .appendTo($optCnt);
                }
            }
            // создать резальтаты
            var $rerCnt = this.$directive.find('.js-results').empty();
            for (var i = 0; i < resultsArray.length; i++) {
                var r = resultsArray[i];
                $(this._resultTempl.replace('{{title}}', r.title.getValue()).replace('{{description}}', r.description.getValue()))
                    .attr('data-result-id', r.id)
                    .appendTo($rerCnt);
            }

            // создать и показать привязки
    //        var valueArray = this._value.toArray();

        }
    }
};