/**
 * Created by artyom.grishanov on 18.02.16.
 */
function Alternative(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);

    this.loadDirective(function(response, status, xhr){
        var controlId = Math.random().toString();
        this.$directive.find('button').attr('id',controlId);
        this.$directive.find('ul').attr('id',controlId);

        var appProperty = Engine.getAppProperty(propertyString);
        var templateHtml = this.$directive.find('.js-option_template').html();
        var $cnt = this.$directive.find('.js-options');
        var $dropDownValue = this.$directive.find('.js-value');

        for (var i = 0; i < appProperty.possibleValues.length; i++) {
            var pv = appProperty.possibleValues[i];
            var $newElem = null;
            if (typeof pv === 'string') {
                // {{option}} - это визуальная часть, что видит пользователь
                // {{value}} - это само значение propertyValue, может отличаться
                $newElem = $(templateHtml.replace('{{option}}',pv).replace('{{value}}',pv)).appendTo($cnt);
                // устанавливаем начальное значение
                if (pv === appProperty.propertyValue) {
                    $newElem.addClass('__selected');
                }
            }
            else if (typeof pv === 'object') {
                $newElem = $(templateHtml.replace('{{option}}',pv.value).replace('{{value}}',pv.value)).appendTo($cnt);
                $newElem.css('backgroundImage', 'url('+pv.icon+')');
                // устанавливаем начальное значение
                if (pv.value === appProperty.propertyValue) {
                    $newElem.addClass('__selected');
                }
            }
            $newElem.click(function(e) {
                //нажатие на клик и смена значения во вью и в движке
                var v = $(e.currentTarget).attr('data-value');
                $cnt.find('.js-option').removeClass('__selected');
                $(e.currentTarget).addClass('__selected')
                $dropDownValue.text(v);
                Engine.setValue(appProperty, v);
            });
        }

        // сначала ставим текущее значение свойства как "выбранное"
        $dropDownValue.text(appProperty.propertyValue);
    });

    /**
     * Способ установить значение в контрол извне, с помощью автогенератора
     * @param value
     */
    this.setControlValue = function(value) {
        if (this.$directive) {
            this.$directive.find('.js-value').text(value);
        }
        var p = Engine.getAppProperty(this.propertyString);
        Engine.setValue(p, value);
    };
}

Alternative.prototype = AbstractControl;