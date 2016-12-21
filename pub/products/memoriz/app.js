/**
 * Created by artyom.grishanov on 11.09.16.
 */
var MemorizApp = MutApp.extend({

    type: 'memoriz',

    id: MutApp.Util.getUniqId(6),

    screenRoot: $('#id-mutapp_screens'),

    // для удобства отладки ссылка просто
    model: null,

    initialize: function(param) {
        console.log('MemorizApp initialize');
        var mm = this.addModel(new MemorizModel({
            application: this
        }));
        this.model = mm;

        this.addScreen(new StartScreen({
            model: mm,
            screenRoot: this.screenRoot
        }));

        var gs = new GameScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(gs);

        var os = null;
        for (var i = 0; i < mm.attributes.pairs.length; i++) {
            id = 'openedScreen'+i;
            os = new OpenedScreen({
                id: id,
                model: mm,
                pairId: mm.attributes.pairs[i].id,
                screenRoot: this.screenRoot
            });
            this.addScreen(os);
        }

        var r = null;
        var sEntities = [];
        for (var i = 0; i < mm.attributes.results.length; i++) {
            r = mm.attributes.results[i];
            var rs = new ResultScreen({
                id: 'result'+i,
                model: mm,
                resultId: r.id,
                screenRoot: this.screenRoot
            });
            this.addScreen(rs);

            sEntities.push({
                id: id,
                title: startScr.startHeaderText,
                description: startScr.startDescription,
                // удалить элементы, оставить только те которые в whitelist
                view: MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']),
                imgUrl: null
            });
        }

        this.setShareEntities(sEntities);
    },

    start: function() {
        for (var i = 0; i < this._screens.length; i++) {
            this._screens[i].$el.hide();
        }
        this._models[0].start();
    }
});