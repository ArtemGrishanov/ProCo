/**
 * Created by artyom.grishanov on 25.12.15.
 */
var config = {
    common: {
        /**
         * хост для загрузки прототипов на редактирование
         * используется для локальной разрботки, чтобы получить достйп к iframe и не вызвать sequrity error
         * При деплое на продакш оставить пустым
         */
        devPrototypesHostName: 'http://localhost:63342/ProCo',
//        devPrototypesHostName: 'http://proco.surge.sh/',
        /**
         * Проводить ли при старте инициализацию для работы с хранилищем амазона
         */
        awsEnabled: true,
        /**
         * Разрешать вход через FB автоматически при запуске приложения
         */
        facebookAutoAuthEnable: true,

        //==================================================
        //==================================================

        /**
         * Хост для сохранения данных
         */
        awsHostName: 'https://s3.eu-central-1.amazonaws.com/',
        awsBucketName: 'proconstructor',
        awsRoleArn: 'arn:aws:iam::520270155749:role/ProCo_FBUsers',
        awsRegion: 'eu-central-1',
        /**
         * Id приложения в facebook для логина
         */
//        facebookAppId: '515132035326687', //aws appId
        facebookAppId: '518819781624579', //localhost site
        /**
         * Разрешает вывод в консоль console.log
         */
        consoleLogEnable: true,
        /**
         * Имя get параметра для передачи ссылки на шаблон
         * если указан этот параметр то app-параметр игнорируется
         */
        templateUrlParamName: 'template',
        /**
         * Имя get параметра для передачи ссылки открытие в редакторе
         */
        appNameParamName: 'app',
        /**
         * Теги, которыми будет обрамлены новые параметры перезаписывании
         */
        tagsForOverridingParams: ['/*<overrideapp>*/','/*</overrideapp>*/'],
        /**
         *
         */
        angularAppName: 'procoApp'
    },
    products: {
        // конфигурация для каждого типа промо-приложений
        test: {
            prototypeId: 'test_v0.1',
            src: '/products/test/index.html',
            backgrounds: [
                //TODO брать параметры из других параметров config.common.awsHostName
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/ny-regents-exam-global-history-and-geography-help-course_132147_large.jpg)',
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/Globe7.jpg)',
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/location.jpg.pagespeed.ce.wvqZyH3ZXu.jpg)',
                'url('+'https://s3.eu-central-1.amazonaws.com/'+'proconstructor/facebook-902609146442342/test1/i/Geography-1-landing.jpg)'
            ],
            fontColors: ['#fff',
                'rgb(177, 193, 155)',
                '#00A651',
                'rgb(195, 186, 186)'
            ],
            fontFamilies:  ['Arial, Helvetica, sans-serif',
                '"Times New Roman", Times, serif',
                'Impact, Charcoal, sans-serif',
                '"Courier New", Courier, monospace'
            ]
        },
        timeline: {

        },
        smartimage: {

        }
    },
    controls: {
        TextQuickInput: {
            defaultDirectiveIndex: -1, // view не используется
            directives: [/*'textquickinput'*/],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        Slide: {
            defaultDirectiveIndex: 0,
            directives: ['slide'],
            parentId: null // вставляется в группу контролов Slide
        },
        AddArrayElementControl: {
            defaultDirectiveIndex: 0,
            directives: ['addquickbutton','addscreenbutton'],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        DeleteQuickButton: {
            defaultDirectiveIndex: 0,
            directives: ['deletequickbutton'],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        OnOff: {
            defaultDirectiveIndex: 0,
            directives: ['onoffswitcher'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        StringControl: {
            defaultDirectiveIndex: 0,
            directives: ['textinput', 'colorpicker'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        Drag: {
            defaultDirectiveIndex: 0,
            directives: ['drag'],
            parentId: 'id-control_cnt',
            type: 'workspace' // контрол появляется на поле для редактиования, когда показывается экран приложения
        },
        Alternative: {
            defaultDirectiveIndex: 0,
            directives: ['dropdown','radiobutton'],
            parentId: 'id-static_controls_cnt',
            type: 'controlpanel'
        },
        ArrayControl: {
            defaultDirectiveIndex: 0,
            directives: ['arraycontrol'],
            parentId: null
        }
    },
    editor: {
        ui: {
            /**
             * z-index который ставится рамку выделения, которая появляется при клике на элемент промо приложения
             */
            selectionBorderZIndex: 9,
            /**
             * z-index который ставится на контрол при его активации (показе).
             * Это контролы которые показываются прямо в поле редактирования.
             */
            quickControlsZIndex: 10,
            /**
             * z-index который ставится элементу при перетаскивании внутри контрола ArrayControl
             */
            arrayControlDragZIndex: 20,
            /**
             * Отступы, насколько можно вынести перетаскиваемый элемент за границы группы
             */
            slideGroupLeftDragMargin: 10,
            slideGroupRightDragMargin: 10,
            /**
             * Утступы слева и справа от промежуточных кнопок в слайдереэ экранов
             */
            slideInterimBtnMargins: 6
        }
    }
};
