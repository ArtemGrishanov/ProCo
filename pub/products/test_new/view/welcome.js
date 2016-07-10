/**
 * Created by artyom.grishanov on 09.07.16.
 */
var StartScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'startScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'start',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: 'Стартовый экран',

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
    el: $('#id-start_scr_cnt').hide(),

    template: {
        "default": _.template($('#id-welcome_template').html())
    },

    events: {
        "click .js-next": "onNextClick"
    },

    onNextClick: function(e) {
        this.model.next();
    },

    initialize: function () {
        this.model.bind("change:state", function () {
            if ('welcome' === this.model.get('state')) {
                this.render();
                app.showScreen(this);
            }
        }, this);
    },

    render: function() {
        this.$el.html(this.template['default']());
        return this;
    }
});