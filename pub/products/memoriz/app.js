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

        var startScr = new StartScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(startScr);

        var gs = new GameScreen({
            model: mm,
            screenRoot: this.screenRoot
        });
        this.addScreen(gs);

        var os = null;
        var id = null;
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
            id = 'result'+i;
            var rs = new ResultScreen({
                id: id,
                model: mm,
                resultId: r.id,
                screenRoot: this.screenRoot
            });
            this.addScreen(rs);

            // выравнивание заголовка и пояснения по вертикали
            var viewForShare = MutApp.Util.clarifyElement(rs.$el, ['modal','modal_cnt','info_title','info_tx','b_title']);
            var titleView = viewForShare.find('.info_title').css('padding','0 50px 0 50px').css('margin','0');
            var th = titleView.outerHeight(false);
            var descView = viewForShare.find('.info_tx').css('padding','0 50px 0 50px').css('margin','0');
            var dh = descView.outerHeight(false);
            var ind = (this.height-dh-th)/4;
            titleView.css('padding-top',ind+'px');
            descView.css('padding-top',ind+'px');

            sEntities.push({
                id: id,
                title: startScr.startHeaderText,
                description: startScr.startDescription,
                // удалить элементы, оставить только те которые в whitelist
                view: viewForShare,
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