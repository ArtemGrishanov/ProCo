/**
 * Created by artyom.grishanov on 02.11.17.
 *
 * Кастомный контрол привязки фидбека к опции
 */
function TriviaTextFeedback(param) {
    this.init(param);
    /**
     * @type {string}
     * @private
     */
    this._value = null;
    /**
     * Ид выделенной опции
     * Этот контрол может всплыть в quickpanel рядом с несколькими опциями и в этот момент устанавливается это свойство
     *
     * @type {string}
     * @private
     */
    this._selectedOptionId = null;
    /**
     * Строка из которой можно моздать опцию
     * @type {string}
     * @private
     */
    this._optionTextTempl = this.$directive.find('.js-option_text_template').html();
    this._optionImgTempl = this.$directive.find('.js-option_img_template').html();
    /**
     *
     * @type {DOMElement}
     * @private
     */
    this._$textarea = this.$directive.find('.js-feedback_textarea');
}
_.extend(TriviaTextFeedback.prototype, AbstractControl);

TriviaTextFeedback.prototype.getValue = function() {
    return this._value;
};

TriviaTextFeedback.prototype.setValue = function(value) {
    this._value = value;
};

TriviaTextFeedback.prototype.destroy = function() {
    this.$directive.remove();
};

TriviaTextFeedback.prototype.onShow = function(param) {
    param = param || {};
    // нормального решения не придумал как пробрасывать getSelectedElement, но всё же это кастомный контрол
    this._selectedOptionId = Workspace.getSelectedElement().attr('data-id') || null;
    this.render();
};

TriviaTextFeedback.prototype.onHide = function(param) {
    // при закрытии окна сохранить значение для выделенной опции
    if (this._selectedOptionId) {
        this.saveFeedbackText();
    }
};

TriviaTextFeedback.prototype.getQuickPanelView = function() {
    return $('<div class="btn"><div class="js-open_feedback_popup pts_string pts_option_feedback">Комментарий к ответу</div></div>');
};

/**
 * Отрисовать актуальный вид контрола на основе данных приложения и привязок
 * В конце делается выделение опции по умолчанию.
 */
TriviaTextFeedback.prototype.render = function() {
    var app = Editor.getEditedApp();
    // приходится получить доступ к приложению напрямую, непридумал как передать данные
    if (app) {
        var quizArray = app.model.get('quiz').toArray();
        var resultsArray = app.model.get('results').toArray();
        // создать опции
        var $optCnt = this.$directive.find('.js-options').empty();
        for (var i = 0; i < quizArray.length; i++) {
            var optionsArray = quizArray[i].answer.options.toArray();
            for (var j = 0; j < optionsArray.length; j++) {
                var $e = null;
                if (optionsArray[j].text) {
                    // текстовая опция
                    $e = $(this._optionTextTempl.replace('{{option_name}}', optionsArray[j].text.getValue()))
                        .attr('data-option-id',optionsArray[j].id)
                        .click(this.onOptionClick.bind(this))
                        .appendTo($optCnt);
                }
                else if (optionsArray[j].img) {
                    // опция-картинка
                    $e = $(this._optionImgTempl.replace('{{option_img}}',optionsArray[j].img.getValue()))
                        .attr('data-option-id',optionsArray[j].id)
                        .click(this.onOptionClick.bind(this))
                        .appendTo($optCnt);
                }
                else {
                    throw new Error('PersonalityResultLinking: unsupported option type');
                }

                if ($e && optionsArray[j].feedbackText.getValue()) {
                    $e.addClass('__linked');
                }
            }
        }
        // выделить одну из опций при старте и показать привязки
        this.selectOption(this._selectedOptionId);
    }
};

TriviaTextFeedback.prototype.onOptionClick = function(event) {
    if (this._selectedOptionId) {
        // при переключении опции сохранить значение для предыдущей опции
        this.saveFeedbackText();
    }
    var optionId = $(event.currentTarget).attr('data-option-id');
    this.selectOption(optionId);
};

/**
 * Выделить синим цветом опцию и отобразить текст фидбека
 *
 * @param {string} [optionId] optional
 */
TriviaTextFeedback.prototype.selectOption = function(optionId) {
    var app = Editor.getEditedApp();
    // приходится получить доступ к приложению напрямую, непридумал как передать данные
    if (app) {
        optionId = optionId || app.model.get('quiz').toArray()[0].answer.options.toArray()[0].id;
        this._selectedOptionId = optionId;
        // убрать со всех опций селект
        this.$directive.find('[data-option-id]').removeClass('__selected');
        var $opt = this.$directive.find('[data-option-id="'+optionId+'"]').addClass('__selected');
        this._$textarea.val('');
        // убрать со всех карточек результатов привязки
        var option = app.model.getOptionById(optionId);
        if (option) {
            this._$textarea.val(option.feedbackText.getValue() || '');
        }
        else {
            throw new Error('TriviaTextFeedback.selectOption: option \''+optionId+'\' not found in the application');
        }
    }
};

/**
 * Вынуть значение из this._$textarea и установить в текущую выделенную опцию
 *
 * @param {string} optionId
 */
TriviaTextFeedback.prototype.saveFeedbackText = function(optionId) {
    optionId = optionId || this._selectedOptionId;
    if (optionId) {
        var app = Editor.getEditedApp();
        var option = app.model.getOptionById(optionId);
        if (option) {
            option.feedbackText.setValue(this._$textarea.val());
            if (this._$textarea.val()) {
                this.$directive.find('[data-option-id="'+optionId+'"]').addClass('__linked');
            }
            else {
                this.$directive.find('[data-option-id="'+optionId+'"]').removeClass('__linked');
            }
        }
        else {
            throw new Error('TriviaTextFeedback.saveFeedbackText: option \''+optionId+'\' not found in the application');
        }
    }
    else {
        throw new Error('TriviaTextFeedback.saveFeedbackText: optionId not specified');
    }
};