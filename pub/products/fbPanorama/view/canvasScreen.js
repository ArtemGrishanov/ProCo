/**
 * Created by artyom.grishanov on 19.01.17.
 */
var CanvasScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'canvasScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'canvas',

    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: '',
    /**
     * Не показывать экран на панели экранов
     */
    hideScreen: true,
    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,

    template: {
    },

    events: {
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);
        this.model.bind("change:panoramaImage", function () {
            this.render();
            this.model.application.showScreen(this);
        }, this);
    },

    render: function() {

        var pImg = this.model.get('panoramaImage');
        if (pImg) {
            var c = this.model.createPanoCanvas();
            $(c).height(this.model.get('DEF_PANORAMA_PREVIEW_HEIGHT'));
            this.$el.append(c);
        }

        return this;
    }
});