/**
 * Created by artyom.grishanov on 09.01.17.
 */
var FbPanoramaApp = MutApp.extend({

    type: 'fbPanorama',

    id: MutApp.Util.getUniqId(6),

    screenRoot: $('#id-mutapp_screens'),

    // для удобства отладки ссылка просто
    model: null,
    editScr: null,
    canvasScr: null,

    initialize: function(param) {
        console.log('FbPanoramaApp initialize');
        var mm = this.addModel(new FbPanoramaModel({
            application: this
        }));
        this.model = mm;

        this.editScr = new PanoramaEditScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.editScr);

        this.canvasScr = new CanvasScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(this.canvasScr);
    },

    start: function() {
//        for (var i = 0; i < this._screens.length; i++) {
//            this._screens[i].$el.hide();
//        }
        this._models[0].start();
    },

    showEdit: function() {
        this.showScreen(this.editScr);
    },

    showCanvas: function() {
        this.showScreen(this.canvasScr);
    }
});