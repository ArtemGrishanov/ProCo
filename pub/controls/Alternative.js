/**
 * Created by artyom.grishanov on 18.02.16.
 */
function Alternative(param) {
    this.init(param);
    this.value = undefined;

    this.$directive.find('button').attr('id', this.id);
    this.$directive.find('ul').attr('id', this.id);

    var templateHtml = this.$directive.find('.js-option_template').html();
    this.$optionsCnt = this.$directive.find('.js-options');

    // в директиве может выпадашка-select, у него свое событие о смене значения
    this.$dropDownValue = this.$directive.find('.js-options'); // html select element
    this.dropDownChangedHandler = this.onDropDownChanged.bind(this);
    this.$dropDownValue.on('change', this.dropDownChangedHandler);
    // dom-элементы соответствующие возможным значениям, сохраняем для последующей работы с иконками
    this.possibleValuesElements = [];

    for (var i = 0; i < this.additionalParam.possibleValues.length; i++) {
        var pv = this.additionalParam.possibleValues[i];
        var $newElem = null;
        if (typeof pv === 'string') {
            // {{option}} - это визуальная часть, что видит пользователь
            // {{value}} - это само значение propertyValue, может отличаться
            $newElem = $(templateHtml.replace('{{option}}',pv).replace('{{value}}',pv)).appendTo(this.$optionsCnt);
        }
        else if (typeof pv === 'object') {
            $newElem = $(templateHtml.replace('{{option}}',pv.value).replace('{{value}}',pv.value)).appendTo(this.$optionsCnt);
            if (typeof pv.icon === 'string') {
                $newElem.css('backgroundImage', 'url('+pv.icon+')');
            }
            else if (pv.icon && typeof pv.icon.normal === 'string') {
                // когда есть два вида иконок: для обычного и выбранного состояния
                $newElem.css('backgroundImage', 'url('+pv.icon.normal+')');
            }
        }
        var onItemClickHandler = this.onItemClick.bind(this);
        $newElem.click(onItemClickHandler);
        this.possibleValuesElements.push({
            clickHandler: onItemClickHandler,
            element: $newElem
        });
    }

    /**
     * Найти описание (иконки, метку) для значения
     *
     * @param {string} value
     * @returns {*}
     */
    this.getPossibleValue = function(value) {
        for (var i = 0; i < this.additionalParam.possibleValues.length; i++) {
            if (this.additionalParam.possibleValues[i].value === value) {
                return this.additionalParam.possibleValues[i];
            }
        }
        return null;
    };

    /**
     * Для всех значений альтернативы сбросить иконки в нормальное состояние
     */
    this.setNormalIcons = function() {
        for (var i = 0; i < this.additionalParam.possibleValues.length; i++) {
            var pv = this.additionalParam.possibleValues[i];
            if (pv.icon && typeof pv.icon.normal === 'string') {
                this.possibleValuesElements[i].element.css('backgroundImage', 'url('+pv.icon.normal+')');;
            }
        }
    };
}

_.extend(Alternative.prototype, AbstractControl);

Alternative.prototype.getValue = function() {
    return this.value;
};

Alternative.prototype.setValue = function(value) {
    if (typeof value === 'string' || value === null || value === undefined) {
        if (value === undefined || value === null) {
            value = '';
        }
        // Сбрасываем выделение со всех иконок
        this.setNormalIcons();
        this.$optionsCnt.find('.js-option').removeClass('__selected');

        var pv = this.getPossibleValue(value);
        if (pv) {
            // Устанавливаем выделение на выбранный элемент
            var $se = this.$optionsCnt.find('[data-value='+value+']').addClass('__selected')
            if (pv && pv.icon && typeof pv.icon.selected === 'string') {
                // меняем иконку для выбранного состояния, если она задана
                $se.css('backgroundImage', 'url('+pv.icon.selected+')');
            }
        }

        //value может быть таким "Arial, sans-serif" что неверно, раз альтернатива, надо чтобы мутапп контролировало эти значения
        //и нормализовало както? иначе как быть с уже сохраненными проектами

        this.$dropDownValue.val(value); // html select element
        if (this.directiveName === 'dropdown') {
            // значение устанавливается в html-select элемент стандартными средствами
            this.$optionsCnt.val(value);
        }
        this.value = value;
    }
    else {
        throw new Error('StringControl.setValue: unsupported value type');
    }
};

Alternative.prototype.destroy = function() {
    this.possibleValuesElements.forEach(function(elem) {
        $(elem.element).off('click', elem.handler);
    });
    this.$dropDownValue.off('change', this.dropDownChangedHandler);
    this.$directive.remove();
};

Alternative.prototype.onItemClick = function(e) {
    var v = $(e.currentTarget).attr('data-value');
    this.setValue(v);
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};

Alternative.prototype.onDropDownChanged = function(e) {
    this.setValue(this.$dropDownValue.val());
    this.controlEventCallback(ControlManager.EVENT_CHANGE_VALUE, this);
};