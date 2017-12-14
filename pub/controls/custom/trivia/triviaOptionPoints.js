/**
 * Created by artyom.grishanov on 02.11.17.
 */
function TriviaOptionPoints(param) {
    this.init(param);
    /**
     * Пример значения:
     * [ {optionId: optionId1, points: 1} , {optionId: optionId2, points: 0}, {optionId: optionId3, points: 0} .... ]
     *
     * @type {object}
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
     *
     * @type {DOMElement}
     * @private
     */
    this._$thisIsRight = this.$directive.find('.js-this_is_correct').show();
    /**
     *
     * @type {DOMElement}
     * @private
     */
    this._$makeCorrect = this.$directive.find('.js-make_correct').hide();
    this._$makeCorrect.click(this.onMakeCorrectClick.bind(this));
}
//console.log('>>>>>>>>>>> TriviaOptionPoints.prototype init: ' + typeof _ + ' '+typeof TriviaOptionPoints.prototype+ ' '+typeof AbstractControl);
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

TriviaOptionPoints.prototype.onShow = function(param) {
    param = param || {};
    this._selectedOptionId = null;
    if (param.selectedElement) {
        this._selectedOptionId = param.selectedElement.attr('data-id');
    }
    this.render({
        selectedElement: param.selectedElement
    });
}

/**
 * Отрисовать актуальный вид контрола на основе данных приложения и привязок
 * В конце делается выделение опции по умолчанию.
 */
TriviaOptionPoints.prototype.render = function() {
    var app = Editor.getEditedApp();
    // приходится получить доступ к приложению напрямую, непридумал как передать данные
    if (app && this._selectedOptionId) {
        var quizArray = app.model.get('quiz').toArray();
        var resultsArray = app.model.get('results').toArray();
        var oInfo = app.model.getOptionPointsInfo(this._selectedOptionId);
        if (oInfo) {
            if (oInfo.points > 0) {
                this._$thisIsRight.show();
                this._$makeCorrect.hide();
            }
            else {
                this._$thisIsRight.hide();
                this._$makeCorrect.show();
            }
        }
    }
};

/**
 * Клик на установку верного ответа
 */
TriviaOptionPoints.prototype.onMakeCorrectClick = function() {
    var app = Editor.getEditedApp();
    if (app && this._selectedOptionId) {
        var oInfo = app.model.getOptionPointsInfo(this._selectedOptionId);
        if (oInfo) {
            app.model.setCorrectAnswer(this._selectedOptionId);
            this._$thisIsRight.show();
            this._$makeCorrect.hide();
        }
    }
};