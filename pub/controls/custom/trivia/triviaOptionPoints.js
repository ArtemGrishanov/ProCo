/**
 * Created by artyom.grishanov on 02.11.17.
 */
function TriviaOptionPoints(param) {
    this.init(param);
    /**
     * Пример значения:
     *
     * 831f8d: {optionId: "option_f5b64a", strongLinks: Array(0), weakLinks: Array(0)}
     * b3b848: {optionId: "option_7d9968", strongLinks: Array(0), weakLinks: Array(0)}
     * c11df4: {optionId: "option_c9aaa8", strongLinks: Array(0), weakLinks: Array(0)}
     *
     * @type {object}
     * @private
     */
    this._value = null;
    /**
     * Id выделенной опции в текущий момент
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
     * Строка из которой можно моздать карточку результата
     * @type {string}
     * @private
     */
    this._resultTempl = this.$directive.find('.js-result_template').html();
}
_.extend(TriviaOptionPoints.prototype, AbstractControl);

TriviaOptionPoints.prototype.getValue = function() {
    return this._value;
};

TriviaOptionPoints.prototype.setValue = function(value) {
    this._value = value;
};

TriviaOptionPoints.prototype.destroy = function() {
    this.$directive.remove();
};

TriviaOptionPoints.prototype.onShow = function() {
    this.render();
}

/**
 * Отрисовать актуальный вид контрола на основе данных приложения и привязок
 * В конце делается выделение опции по умолчанию.
 */
TriviaOptionPoints.prototype.render = function() {
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
                    if (optionsArray[j].text) {
                        // текстовая опция
                        $(this._optionTextTempl.replace('{{option_name}}', optionsArray[j].text.getValue()))
                            .attr('data-option-id',optionsArray[j].id)
                            .click(this.onOptionClick.bind(this))
                            .appendTo($optCnt);
                    }
                    else if (optionsArray[j].img) {
                        // опция-картинка
                        $(this._optionImgTempl.replace('{{option_img}}',optionsArray[j].img.getValue()))
                            .attr('data-option-id',optionsArray[j].id)
                            .click(this.onOptionClick.bind(this))
                            .appendTo($optCnt);
                    }
                    else {
                        throw new Error('TriviaOptionPoints: unsupported option type');
                    }
                }
            }
            // создать резальтаты
            var $rerCnt = this.$directive.find('.js-results').empty();
            for (var i = 0; i < resultsArray.length; i++) {
                var r = resultsArray[i];
                var $re = $(this._resultTempl.replace('{{title}}', r.title.getValue()).replace('{{description}}', r.description.getValue()))
                    .attr('data-result-id', r.id)
                    .appendTo($rerCnt);
                $re.mouseover(this.onResultMouseover.bind(this));
                $re.mouseout(this.onResultMouseout.bind(this));
                $re.find('.js-link_weak').click(this.onResultLinkWeak.bind(this));
                $re.find('.js-link_strong').click(this.onResultLinkStrong.bind(this));
                $re.find('.js-link_delete').click(this.onResultLinkDelete.bind(this));
            }
            // выделить одну из опций и показать привязки
            this.selectOption(this._selectedOptionId);
        }
    }
};

TriviaOptionPoints.prototype.onOptionClick = function(event) {
    var optionId = $(event.currentTarget).attr('data-option-id');
    this.selectOption(optionId);
};

TriviaOptionPoints.prototype.onResultMouseover = function(event) {
    var $e = $(event.currentTarget);
    $e.find('.js-result_hover').show();
};

TriviaOptionPoints.prototype.onResultMouseout = function(event) {
    var $e = $(event.currentTarget);
    $e.find('.js-result_hover').hide();
};

/**
 * Клик по кнопке "Слабая связь".
 *
 * @param event
 */
TriviaOptionPoints.prototype.onResultLinkWeak = function(event) {
    var resultId = $(event.currentTarget).parent().parent().parent().parent().attr('data-result-id');
    console.log('resultId: '+resultId);
    // если задается связь одного типа то надо удалить связь другого типа
    // если связка уже есть не добавлять повторно
    this.deleteResultLinksForOption(this._selectedOptionId, resultId);
    this.getOptionValue(this._selectedOptionId).weakLinks.push(resultId);
    this.selectOption(this._selectedOptionId);
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};

/**
 * Клик по кнопке "Сильная связь".
 *
 * @param event
 */
TriviaOptionPoints.prototype.onResultLinkStrong = function(event) {
    var resultId = $(event.currentTarget).parent().parent().parent().parent().attr('data-result-id');
    console.log('resultId: '+resultId);
    // если задается связь одного типа то надо удалить связь другого типа
    // если связка уже есть не добавлять повторно
    this.deleteResultLinksForOption(this._selectedOptionId, resultId);
    this.getOptionValue(this._selectedOptionId).strongLinks.push(resultId);
    this.selectOption(this._selectedOptionId);
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};

/**
 * Удалить все связи между опцией и результатом
 * @param event
 */
TriviaOptionPoints.prototype.onResultLinkDelete = function(event) {
    var resultId = $(event.currentTarget).parent().parent().parent().parent().attr('data-result-id');
    console.log('resultId: '+resultId);
    // если задается связь одного типа то надо удалить связь другого типа
    // если связка уже есть не добавлять повторно
    this.deleteResultLinksForOption(this._selectedOptionId, resultId);
    this.selectOption(this._selectedOptionId);
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};

/**
 * Удалить все привязки между опцией и результатом.
 * Используется например перед созданием новой привязки, так как дублирование не нужно
 *
 * @param {string} optionId
 * @param {string} resultId
 */
TriviaOptionPoints.prototype.deleteResultLinksForOption = function(optionId, resultId) {
    var option = this.getOptionValue(this._selectedOptionId);
    if (option) {
        for (var i = 0; i < option.weakLinks.length;) {
            if (option.weakLinks[i] === resultId) {
                option.weakLinks.splice(i, 1);
            }
            else {
                i++;
            }
        }
        for (var i = 0; i < option.strongLinks.length;) {
            if (option.strongLinks[i] === resultId) {
                option.strongLinks.splice(i, 1);
            }
            else {
                i++;
            }
        }
    }
    else {
        throw new Error('TriviaOptionPoints.deleteResultLinksForOption: option \''+this._selectedOptionId+'\' does not exist');
    }
};

/**
 * Значение _value конвертировать в массив
 * Пример значения this._value смотри в описании
 *
 * return {Array}
 */
TriviaOptionPoints.prototype.valueToArray = function() {
    var result = [];
    for (var key in this._value) {
        if (this._value.hasOwnProperty(key) === true) {
            result.push(this._value[key]);
        }
    }
    return result;
}

/**
 * Найти значение опции по ид
 * Формат опции смотри в описании this._value
 *
 * @param {string} optionId
 * @returns {*}
 */
TriviaOptionPoints.prototype.getOptionValue = function(optionId) {
    for (var key in this._value) {
        // key - это в данном случае dictionaryId
        if (this._value.hasOwnProperty(key) === true && this._value[key].optionId === optionId) {
            return this._value[key];
        }
    }
    return null;
}

/**
 * Выделить синим цветом опцию и отобразить на результатах все активные привязки
 *
 * @param {string} [optionId] optional
 */
TriviaOptionPoints.prototype.selectOption = function(optionId) {
    optionId = optionId || this.valueToArray()[0].optionId;
    this._selectedOptionId = optionId;
    if (this.getOptionValue(this._selectedOptionId) === null) {
        throw new Error('TriviaOptionPoints.deleteResultLinksForOption: option \''+this._selectedOptionId+'\' does not exist');
    }
    // убрать со всех опций селект
    this.$directive.find('[data-option-id]').removeClass('__selected');
    var $opt = this.$directive.find('[data-option-id="'+optionId+'"]').addClass('__selected');

    // убрать со всех карточек результатов привязки
    this.$directive.find('[data-result-id]').removeClass('__linked_weak').removeClass('__linked_strong');
    var option = this.getOptionValue(optionId);
    for (var i = 0; i < option.weakLinks.length; i++) {
        var resultId = option.weakLinks[i];
        var $re = this.$directive.find('[data-result-id="'+resultId+'"]').addClass('__linked_weak');
    }
    for (var i = 0; i < option.strongLinks.length; i++) {
        var resultId = option.strongLinks[i];
        var $re = this.$directive.find('[data-result-id="'+resultId+'"]').addClass('__linked_strong');
    }
}