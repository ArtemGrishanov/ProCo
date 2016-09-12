/**
 * Created by artyom.grishanov on 11.09.16.
 */
var MemorizApp = MutApp.extend({

    type: 'memoriz',

    id: MutApp.Util.getUniqId(6),

    screenRoot: $('#id-mutapp_screens'),

    initialize: function(param) {
        console.log('MemorizApp initialize');
        var mm = this.addModel(new MemorizModel({
            application: this
        }));

//        this.addScreen(new StartScreen({
//            model: tm,
//            screenRoot: this.screenRoot
//        }));

        var gs = new GameScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(gs);

//        var rs = new ResultScreen({
//            id: 'result',
//            model: tm,
//            resultId: r.id,
//            screenRoot: this.screenRoot
//        });
//        this.addScreen(rs);

//        var sEntities = [];
//        sEntities.push({
//            id: id,
//            title: r.title,
//            description: r.description,
//            // удалить элементы, оставить только те которые в whitelist
//            view: MutApp.Util.clarifyElement(rs.$el, [/*'modal','modal_cnt','info_title','info_tx','b_title'*/])
//        });
//
//        this.setShareEntities(sEntities);
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    }
});