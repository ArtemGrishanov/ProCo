/**
 * Created by artyom.grishanov on 09.01.17.
 */
var PanoViewerScreen = MutApp.Screen.extend({
    /**
     * @see MutApp
     */
    id: 'panoViewerScr',

    /**
     * Тег для группировки экранов в редакторе
     * @see MutApp
     */
    group: 'viewer',
    /**
     * Не показывать экран на панели экранов
     */
    hideScreen: true,
    /**
     * Метка которая показывается в редакторе, рядом с превью экрана
     * @see MutApp
     */
    name: {RU:'Panorama viewer',EN:'Просмотр'},
    logoPosition: {top: 200, left: 200},
    showLogo: true,
    /**
     * Масштаб панорамы, который отображается на превью
     */
    previewScale: undefined,

    /**
     * Контейнер в котором будет происходить рендер этого вью
     * Создается динамически
     */
    el: null,

    template: {
        "default": _.template($('#id-panorama_viewer_template').html()),
        "id-text_pin_template": _.template($('#id-text_pin_template').html())
    },

    events: {
        "click .js-logo": "onLogoClick"
    },

    onLogoClick: function(e) {
        var ll = this.model.get('logoLink');
        if (ll) {
            var win = window.open(ll, '_blank');
            win.focus();
            this.model.application.stat(this.model.application.type, 'logoclick');
        }
    },

    initialize: function (param) {
        this.super.initialize.call(this, param);
        this.setElement($('<div></div>')
            .attr('id',this.id)
            .css('width','100%')
            .css('min-height','100%'));
        param.screenRoot.append(this.$el);
        this.model.bind("change:panoConfig", function () {
            if (this.model.get('photoViewerMode')===true && this.model.get('panoCompiledImage')) {
                this.render();
                this.createPhotoSphereViewer('', this.model.get('panoConfig'));
            }
        }, this);
    },

    /**
     *
     * @returns {PanoramaEditScreen}
     */
    render: function() {
        this.$el.html(this.template['default']({
            // properties
        }));
        return this;
    },

    createPhotoSphereViewer: function(url, configPano) {
        if (this.model.get('photoViewerMode') === true && this.model.application.isPublished === true) {
            this.model.application.width = 800;
            this.model.application.height = 600;
        }
        $('#photosphere').empty();
        var halfLongtitude = Math.PI/180*(configPano.srcHFOV/2);
        var halfLatitude = Math.PI/180*(configPano.targetVFOV/2);
        this.model.attributes.viewer = PhotoSphereViewer({
            //panorama: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Trafalgar_Square_360_Panorama_Cropped_Sky%2C_London_-_Jun_2009.jpg',
            // устанавливается готовая и уже загруженная в aws bucket картинка, с нанесенными метками
            panorama: this.model.get('panoCompiledImage'),
            container: 'id-photosphere',
            longitude_range: [-halfLongtitude, halfLongtitude],
            latitude_range: [-halfLatitude,halfLatitude],
            size: {width:this.model.application.width,height:this.model.application.height},
            anim_speed: '2rpm',
            time_anim: 1000, // старт автоматической анимации
            pano_data: {
                full_width: configPano.panoWidth,
                full_height: configPano.panoHeight,
                cropped_width: configPano.croppedWidth,
                cropped_height: configPano.croppedHeight,
                cropped_x: configPano.croppedX,
                cropped_y: configPano.croppedY
            },
            navbar: [
                'caption',
                {
                    id: 'id-testix_link',
                    title: 'Create your panorama',
                    content: '',
                    className: 'photo_viewer_testix_link',
                    onClick: function() {
                        var win = window.open('http://testix.me', '_blank');
                        win.focus();
                    }
                },
                'fullscreen'
            ]
        });
    }

});