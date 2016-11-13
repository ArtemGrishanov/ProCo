/**
 * Created by artyom.grishanov on 02.02.16.
 *
 * Контрол типа Вкл/Выкл
 * Хорошо подходит для редактирования свойства типа boolean
 */
function OnOff(propertyString, directiveName, $parent, productDOMElement, params) {
    this.init(propertyString, directiveName, $parent, productDOMElement, params);
    this.__label = params.__label;

    this.loadDirective(function(response, status, xhr){
        // каждый переключатель требует свой уникальный ид, так работает этот bootstrap компонент
        var switcherId = Math.random().toString();
        var appProperty = Engine.getAppProperty(propertyString);
        this.$directive.find('input').attr('id',switcherId);
        this.$directive.find('label').attr('for',switcherId);
        var $checkbox = this.$directive.find('[type="checkbox"]');
        $checkbox.prop('checked', appProperty.propertyValue);
        $checkbox.on('change',function (e) {
            console.log('changed');
            var v = $checkbox.prop('checked');
            var ap = Engine.getAppProperty(propertyString);
            Engine.setValue(ap, v);
        });
        if (this.__label) {
            this.$directive.find('.js-label').text(this.__label);
        }
    });
}
OnOff.prototype = AbstractControl;