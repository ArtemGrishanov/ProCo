/**
 * Created by artyom.grishanov on 25.12.15.
 */
var config = {
    common: {
        awsEnabled: false,
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
        //facebookAppId: '515132035326687', //aws appId
        facebookAppId: '518819781624579', //localhost site
        /**
         * Разрешать вход через FB
         */
        facebookAuthEnable: false,
        /**
         * Разрешает вывод в консоль console.log
         */
        consoleLogEnable: true,
        /**
         * Имя get параметра для передачи ссылки открытие в редакторе
         */
        productSrcParamName: 'src',
        /**
         * урл на продукт который открываем по умолчанию, если не был указан продукт для открытия
         */
        defaultProductPrototype: null,
        /**
         * хост для загрузки прототипов на редактирование
         * используется для локальной разрботки, чтобы получить достйп к iframe и не вызвать sequrity error
         * При деплое на продакш оставить пустым
         */
        devPrototypesHostName: 'http://localhost:63342/ProCo',
//        devPrototypesHostName: 'http://proco.surge.sh/',
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
        tests: {
            prototypeId: 'test_v0.1',
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
        }
    },
    controls: {
        TextQuickInput: {
            defaultDirectiveIndex: -1, // view не используется
            directives: [/*'textquickinput'*/],
            parentId: 'id-control_cnt'
        },
        Slide: {
            defaultDirectiveIndex: 0,
            directives: ['slide'],
            parentId: null, // вставляется в группу контролов Slide
            overrideProductParams: {
                // параметры для контролы этого типа, которые будут установлены в любом случае поверх описанных в промо-приложении
                //
                static: true
            }
        },
        AddArrayElementControl: {
            defaultDirectiveIndex: 0,
            directives: ['addquickbutton','addscreenbutton'],
            parentId: 'id-control_cnt'
        },
        DeleteQuickButton: {
            defaultDirectiveIndex: 0,
            directives: ['deletequickbutton'],
            parentId: 'id-control_cnt'
        },
        OnOff: {
            defaultDirectiveIndex: 0,
            directives: ['onoffswitcher'],
            parentId: 'id-static_controls_cnt'
        },
        TextInput: {
            defaultDirectiveIndex: 0,
            directives: ['colorpicker'],
            parentId: 'id-static_controls_cnt'
        },
        Drag: {
            defaultDirectiveIndex: 0,
            directives: ['drag'],
            parentId: 'id-control_cnt'
        },
        Alternative: {
            defaultDirectiveIndex: 0,
            directives: ['dropdown','radiobutton'],
            parentId: 'id-static_controls_cnt'
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
            slideGroupRightDragMargin: 10
        }
    }
};
