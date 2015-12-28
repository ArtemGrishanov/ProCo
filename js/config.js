/**
 * Created by artyom.grishanov on 25.12.15.
 */
var config = {
    common: {
        hostName: 'https://s3.eu-central-1.amazonaws.com/',
        bucketName: 'proconstructor',
        roleArn: 'arn:aws:iam::520270155749:role/ProCo_FBUsers',
        awsRegion: 'eu-central-1',
        /**
         * Id приложения в facebook для логина
         */
        //facebookAppId: '515132035326687', //aws appId
        facebookAppId: '518819781624579', //localhost site
        /**
         * Разрешает вывод в консоль console.log
         */
        consoleLogEnable: true
    },
    products: {
        tests: {
            backgrounds: [
                //TODO брать параметры из других параметров config.common.hostName
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
    }
};
