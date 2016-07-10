/**
 * Created by artyom.grishanov on 09.07.16.
 */
var ResultScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'resultScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'result',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Результат',

    /**
     * @see MutApp
     */
    doWhenInDOM: function() {
        applyStyles();
    },

    /**
     * Это appProperty
     * Сам logo не является отдельным вью, так как не имеет своей логики
     */
    logoPosition: {top: 0, left: 0},

    /**
     * Контейнер в котором будет происходить рендер этого вью
     */
    el: $('#id-result_scr_cnt').hide(),

    template: {
        "default": _.template($('#id-result_template').html())
    },

    events: {
        "click .js-next": "onNextClick"
    },

    onNextClick: function(e) {
        this.model.next();
    },

    initialize: function () {
        this.model.bind("change:state", function () {
            if ('result' === this.model.get('state')) {
                this.render();
                app.showScreen(this);
            }
        }, this);
    },

    render: function() {
        //renderResult(currentResult);
        this.$el.html(this.template['default']());
        return this;
    }
});